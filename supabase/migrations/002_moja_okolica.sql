-- =====================================================================
-- MIGRACJA: "Moja okolica" (zamiast śledzenia lokalizacji w tle)
-- Uruchom PO wokol-ciebie-schema.sql.
--
-- Zasady:
--  * PUSH liczy się od "mojej okolicy" (punkt + promień wybrany przez użytkownika),
--    więc nie potrzeba lokalizacji w tle.
--  * FEED i nowy POST używają bieżącej pozycji, jeśli aplikacja była używana w ciągu
--    ostatnich 2 godzin (zgoda "podczas używania"), a w przeciwnym razie okolicy.
-- =====================================================================

alter table profiles
  add column home_location   geography(Point, 4326),
  add column home_radius_m   int not null default 2000 check (home_radius_m in (1000, 2000, 3000, 5000)),
  add column home_label      text check (char_length(home_label) <= 60),   -- np. "Oleśnica, Osiedle Słoneczne"
  add column home_updated_at timestamptz;
create index profiles_home_gix on profiles using gist (home_location);

-- Ustawienie okolicy; punkt zaokrąglany serwerowo do siatki 0,003° (~200–330 m)
create function set_home_area(p_lat double precision, p_lng double precision,
                              p_radius_m int default 2000, p_label text default null) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if p_radius_m not in (1000, 2000, 3000, 5000) then raise exception 'bad_radius'; end if;
  update profiles
     set home_location   = st_setsrid(st_snaptogrid(st_makepoint(p_lng, p_lat), 0.003), 4326)::geography,
         home_radius_m   = p_radius_m,
         home_label      = nullif(trim(p_label), ''),
         home_updated_at = now()
   where id = auth.uid();
end $$;
grant execute on function set_home_area(double precision, double precision, int, text) to authenticated;

-- PUSH: odbiorcy wybierani wg okolicy (punkt + promień), nie wg bieżącej lokalizacji
create or replace function recipients_for_post(p_post uuid) returns table (user_id uuid, distance_m int)
language sql stable security definer set search_path = public, extensions as $$
  select u.id,
         greatest(100, (round(st_distance(u.home_location, p.location) / 100) * 100))::int
  from posts p
  join profiles a on a.id = p.author_id
  cross join lateral (
    select exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                   where pt.post_id = p.id and t.grp = 'life_stage') as ls
  ) l
  join profiles u on u.id <> p.author_id
  where p.id = p_post and not p.is_hidden and p.expires_at > now()
    and u.status = 'active'                                           -- 🟢
    and u.home_location is not null
    and st_dwithin(u.home_location, p.location, u.home_radius_m)      -- geofence = moja okolica
    and exists (select 1 from post_tags pt join user_tags ut
                  on ut.tag_id = pt.tag_id and ut.user_id = u.id
                where pt.post_id = p.id)                              -- wspólny tag
    and post_visible_to(p.id, u.id)                                   -- izolacja treści + blokady
    and not in_quiet_hours(u)                                         -- cisza nocna
    and (not l.ls or not u.same_gender_pref or u.gender = a.gender)   -- etapy życia: ta sama płeć
    and (select count(*) from notification_log n
         where n.user_id = u.id and n.sent_at > now() - interval '1 hour') < 3;
$$;

-- Liczniki "+12 osób w okolicy" (przed rejestracją): ludzie, których okolica obejmuje punkt
create or replace function tag_nearby_counts(p_lat double precision, p_lng double precision, p_radius_m int default 2000)
returns table (slug text, people int)
language sql stable security definer set search_path = public, extensions as $$
  select t.slug, count(distinct p.id)::int
  from tags t
  left join user_tags ut on ut.tag_id = t.id
  left join profiles p on p.id = ut.user_id and p.status = 'active' and p.home_location is not null
       and st_dwithin(p.home_location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
                      least(p_radius_m, 5000))
  where t.is_active
  group by t.slug;
$$;

-- FEED: punkt odniesienia = świeża pozycja (<2 h) albo okolica; domyślny promień z profilu
drop function feed_nearby(int, int);
create function feed_nearby(p_radius_m int default null, p_limit int default 50)
returns table (id uuid, author_name text, body text, tag_slugs text[], distance_m int,
               map_lat double precision, map_lng double precision,
               starts_at timestamptz, expires_at timestamptz, created_at timestamptz)
language plpgsql stable security definer set search_path = public, extensions as $$
#variable_conflict use_column
declare me profiles; anchor geography;
begin
  select * into me from profiles where profiles.id = auth.uid();
  if me.id is null then return; end if;
  anchor := case when me.location is not null and me.location_updated_at > now() - interval '2 hours'
                 then me.location else me.home_location end;
  if anchor is null then return; end if;
  return query
  select p.id, a.first_name, p.body,
         array(select t.slug from post_tags pt join tags t on t.id = pt.tag_id
               where pt.post_id = p.id order by t.slug),
         greatest(100, (round(x.d / 100) * 100))::int,
         st_y(st_snaptogrid(p.location::geometry, 0.005)),
         st_x(st_snaptogrid(p.location::geometry, 0.005)),
         p.starts_at, p.expires_at, p.created_at
  from posts p
  join profiles a on a.id = p.author_id
  cross join lateral (select st_distance(p.location, anchor) as d) x
  where st_dwithin(p.location, anchor, least(coalesce(p_radius_m, me.home_radius_m), 5000))
    and post_visible_to(p.id, me.id)
  order by
    (case when me.same_gender_pref and a.gender is distinct from me.gender
           and exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                       where pt.post_id = p.id and t.grp = 'life_stage')
          then 1 else 0 end),
    x.d, p.created_at desc
  limit least(p_limit, 100);
end $$;
grant execute on function feed_nearby(int, int) to authenticated;

-- NOWY POST: lokalizacja posta = świeża pozycja (<2 h) albo okolica autora
create or replace function create_post(p_body text, p_tag_ids uuid[], p_duration_h int, p_starts_at timestamptz default null)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare me profiles; pid uuid; anchor geography;
begin
  select * into me from profiles where id = auth.uid();
  if me.id is null or not me.onboarded then raise exception 'not_onboarded'; end if;
  anchor := case when me.location is not null and me.location_updated_at > now() - interval '2 hours'
                 then me.location else me.home_location end;
  if anchor is null then raise exception 'area_required'; end if;
  p_tag_ids := (select array_agg(distinct x) from unnest(p_tag_ids) x);
  if coalesce(array_length(p_tag_ids, 1), 0) not between 1 and 5 then raise exception 'tags_1_to_5'; end if;
  if p_duration_h not between 1 and 24 then raise exception 'duration_1_to_24'; end if;
  if (select count(*) from tags where id = any(p_tag_ids) and is_active) <> array_length(p_tag_ids, 1) then
    raise exception 'bad_tag';
  end if;
  if exists (select 1 from tags t where t.id = any(p_tag_ids) and t.is_polarizing
             and not exists (select 1 from user_tags ut where ut.user_id = me.id and ut.tag_id = t.id)) then
    raise exception 'polarizing_tag_not_in_profile';
  end if;
  if (select count(*) from posts where author_id = me.id and created_at > now() - interval '24 hours') >= 10 then
    raise exception 'rate_limited';
  end if;

  insert into posts (author_id, body, location, starts_at, expires_at)
  values (me.id, trim(p_body), anchor, coalesce(p_starts_at, now()), now() + make_interval(hours => p_duration_h))
  returning id into pid;
  insert into post_tags (post_id, tag_id) select pid, unnest(p_tag_ids);
  insert into push_queue (post_id) values (pid);
  return pid;
end $$;
