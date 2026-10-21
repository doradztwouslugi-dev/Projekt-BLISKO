-- =====================================================================
-- WOKÓŁ CIEBIE — schemat Supabase (Postgres + PostGIS)
-- Uruchom w SQL Editor (jako postgres). Kolejność ma znaczenie.
-- Włącz wcześniej w Dashboard: Database > Extensions: postgis, pg_cron, pg_net, vault.
-- =====================================================================

create extension if not exists postgis;
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------- TYPY ----------
create type tag_group  as enum ('life_stage', 'mind', 'hobby');
create type gender_t   as enum ('F', 'M', 'O');
create type presence_t as enum ('active', 'resting');   -- 🟢 Szukam towarzystwa / 🔴 Odpoczywam

-- ---------- PROFILE ----------
create table profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  first_name           text check (char_length(first_name) between 1 and 40),
  birth_year           int  check (birth_year between 1900 and 2100),
  gender               gender_t,
  status               presence_t not null default 'active',
  quiet_hours_enabled  boolean not null default true,
  quiet_start          time not null default '22:00',
  quiet_end            time not null default '07:00',
  timezone             text not null default 'Europe/Warsaw',
  same_gender_pref     boolean not null default true,
  location             geography(Point, 4326),          -- zawsze zaokrąglona do ~110 m
  location_updated_at  timestamptz,
  special_consent_at   timestamptz,                      -- zgoda RODO art. 9 (tagi światopoglądowe)
  onboarded            boolean not null default false,
  created_at           timestamptz not null default now()
);
create index profiles_loc_gix on profiles using gist (location);

create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, first_name)
  values (new.id, nullif(split_part(coalesce(new.raw_user_meta_data->>'full_name', ''), ' ', 1), ''));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- TAGI ----------
create table tags (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  label         text not null,
  emoji         text not null,
  grp           tag_group not null,
  is_polarizing boolean not null default false,   -- izolacja treści
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

create table user_tags (
  user_id uuid not null references profiles(id) on delete cascade,
  tag_id  uuid not null references tags(id) on delete cascade,
  primary key (user_id, tag_id)
);
create index user_tags_tag_idx on user_tags (tag_id);

-- Propozycje własnych bąbelków: 3 głosy => do moderacji => bąbelek
create table tag_proposals (
  id         uuid primary key default gen_random_uuid(),
  label      text not null check (char_length(label) between 3 and 60),
  grp        tag_group not null,
  status     text not null default 'collecting'
             check (status in ('collecting', 'pending_review', 'approved', 'rejected')),
  votes      int not null default 0,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index tag_proposals_label_uq on tag_proposals ((lower(label)));

create table tag_proposal_votes (
  proposal_id uuid not null references tag_proposals(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  primary key (proposal_id, user_id)
);

create function on_proposal_vote() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update tag_proposals
     set votes  = votes + 1,
         status = case when votes + 1 >= 3 and status = 'collecting' then 'pending_review' else status end
   where id = new.proposal_id;
  return new;
end $$;
create trigger proposal_vote_ai after insert on tag_proposal_votes
  for each row execute function on_proposal_vote();

-- ---------- POSTY (intencje, max 24 h) ----------
create table posts (
  id         uuid primary key default gen_random_uuid(),
  author_id  uuid not null references profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  location   geography(Point, 4326) not null,
  starts_at  timestamptz not null default now(),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  is_hidden  boolean not null default false,
  constraint posts_max_24h check (expires_at > created_at and expires_at <= created_at + interval '24 hours')
);
create index posts_loc_gix    on posts using gist (location);
create index posts_expires_ix on posts (expires_at) where not is_hidden;

create table post_tags (
  post_id uuid not null references posts(id) on delete cascade,
  tag_id  uuid not null references tags(id),
  primary key (post_id, tag_id)
);

-- ---------- BEZPIECZEŃSTWO ----------
create table blocks (
  blocker_id uuid not null references profiles(id) on delete cascade,
  blocked_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid not null references profiles(id) on delete cascade,
  post_id          uuid references posts(id) on delete cascade,
  reported_user_id uuid references profiles(id) on delete cascade,
  reason           text not null check (char_length(reason) <= 500),
  created_at       timestamptz not null default now(),
  check (post_id is not null or reported_user_id is not null),
  unique (reporter_id, post_id)
);

-- 3 różne zgłoszenia => post automatycznie ukryty do czasu moderacji
create function on_report() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.post_id is not null
     and (select count(distinct reporter_id) from reports where post_id = new.post_id) >= 3 then
    update posts set is_hidden = true where id = new.post_id;
  end if;
  return new;
end $$;
create trigger report_ai after insert on reports for each row execute function on_report();

-- ---------- PUSH: kolejka i log ----------
create table push_queue (
  id           bigserial primary key,
  post_id      uuid not null unique references posts(id) on delete cascade,
  created_at   timestamptz not null default now(),
  processed_at timestamptz
);
create table notification_log (
  id         bigserial primary key,
  post_id    uuid not null references posts(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  distance_m int,
  sent_at    timestamptz not null default now(),
  unique (post_id, user_id)
);
create index notification_log_user_ix on notification_log (user_id, sent_at);

-- =====================================================================
-- FUNKCJE WEWNĘTRZNE
-- =====================================================================

-- IZOLACJA TREŚCI: post jest widoczny tylko jeśli
--  * nie jest ukryty/wygasły, * brak blokady w żadną stronę,
--  * KAŻDY tag polaryzujący na poście jest zaznaczony w profilu oglądającego.
create function post_visible_to(p_post uuid, p_user uuid) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select exists (
    select 1 from posts p
    where p.id = p_post and not p.is_hidden and p.expires_at > now()
      and not exists (select 1 from blocks b
                      where (b.blocker_id = p_user and b.blocked_id = p.author_id)
                         or (b.blocker_id = p.author_id and b.blocked_id = p_user))
      and not exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                      where pt.post_id = p.id and t.is_polarizing
                        and not exists (select 1 from user_tags ut
                                        where ut.user_id = p_user and ut.tag_id = t.id))
  );
$$;

create function post_visible_to_me(p_post uuid) returns boolean
language sql stable security definer set search_path = public, extensions as $$
  select post_visible_to(p_post, auth.uid());
$$;

-- Godziny ciszy w lokalnej strefie czasowej użytkownika (obsługuje przejście przez północ)
create function in_quiet_hours(u profiles) returns boolean
language sql stable as $$
  select u.quiet_hours_enabled and case
    when u.quiet_start > u.quiet_end then (x.lt >= u.quiet_start or x.lt < u.quiet_end)
    else (x.lt >= u.quiet_start and x.lt < u.quiet_end) end
  from (select (now() at time zone u.timezone)::time as lt) x;
$$;

-- GEOFENCE + DOPASOWANIE: kto dostanie push o nowym poście
create function recipients_for_post(p_post uuid) returns table (user_id uuid, distance_m int)
language sql stable security definer set search_path = public, extensions as $$
  select u.id,
         greatest(100, (round(st_distance(u.location, p.location) / 100) * 100))::int
  from posts p
  join profiles a on a.id = p.author_id
  cross join lateral (
    select exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                   where pt.post_id = p.id and t.grp = 'life_stage') as ls
  ) l
  join profiles u on u.id <> p.author_id
  where p.id = p_post and not p.is_hidden and p.expires_at > now()
    and u.status = 'active'                                          -- 🟢 nie 🔴
    and u.location is not null
    and u.location_updated_at > now() - interval '12 hours'          -- "aktualnie" w okolicy
    and st_dwithin(u.location, p.location, 2000)                     -- 2 km
    and exists (select 1 from post_tags pt join user_tags ut
                  on ut.tag_id = pt.tag_id and ut.user_id = u.id
                where pt.post_id = p.id)                             -- wspólny tag
    and post_visible_to(p.id, u.id)                                  -- izolacja treści + blokady
    and not in_quiet_hours(u)                                        -- cisza 22:00–07:00
    and (not l.ls or not u.same_gender_pref or u.gender = a.gender)  -- etapy życia: ta sama płeć
    and (select count(*) from notification_log n
         where n.user_id = u.id and n.sent_at > now() - interval '1 hour') < 3;  -- limit 3/h
$$;

-- Pobiera zadania z kolejki, zapisuje log i zwraca listę push do wysłania
create function claim_push_batch(p_max_jobs int default 20)
returns table (user_id uuid, post_id uuid, author_name text, distance_m int,
               body text, is_life_stage boolean, starts_at timestamptz)
language plpgsql security definer set search_path = public, extensions as $$
#variable_conflict use_column
begin
  return query
  with jobs as (
    update push_queue q set processed_at = now()
    where q.id in (select id from push_queue where processed_at is null
                   order by created_at limit p_max_jobs for update skip locked)
    returning q.post_id
  ),
  ins as (
    insert into notification_log (post_id, user_id, distance_m)
    select j.post_id, r.user_id, r.distance_m
    from jobs j cross join lateral recipients_for_post(j.post_id) r
    on conflict do nothing
    returning notification_log.post_id, notification_log.user_id, notification_log.distance_m
  )
  select i.user_id, i.post_id, a.first_name, i.distance_m, p.body,
         exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                 where pt.post_id = p.id and t.grp = 'life_stage'),
         p.starts_at
  from ins i
  join posts p on p.id = i.post_id
  join profiles a on a.id = p.author_id;
end $$;

-- =====================================================================
-- RPC DLA APLIKACJI (jedyna droga zapisu/odczytu wrażliwych danych)
-- =====================================================================

-- Liczniki "+12 osób w okolicy" (wolno anonimowi, przed rejestracją; tylko agregaty)
create function tag_nearby_counts(p_lat double precision, p_lng double precision, p_radius_m int default 2000)
returns table (slug text, people int)
language sql stable security definer set search_path = public, extensions as $$
  select t.slug, count(distinct p.id)::int
  from tags t
  left join user_tags ut on ut.tag_id = t.id
  left join profiles p on p.id = ut.user_id and p.status = 'active' and p.location is not null
       and st_dwithin(p.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, least(p_radius_m, 5000))
  where t.is_active
  group by t.slug;
$$;

-- Lokalizacja zawsze zaokrąglana serwerowo do siatki 0,001° (~110 m)
create function update_my_location(p_lat double precision, p_lng double precision) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  update profiles
     set location = st_setsrid(st_snaptogrid(st_makepoint(p_lng, p_lat), 0.001), 4326)::geography,
         location_updated_at = now()
   where id = auth.uid();
end $$;

-- Zapis tagów; tagi światopoglądowe wymagają wyraźnej zgody (RODO art. 9)
create function set_my_tags(p_tag_ids uuid[], p_consent boolean default false) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare me profiles;
begin
  select * into me from profiles where id = auth.uid();
  if me.id is null then raise exception 'unauthenticated'; end if;
  if exists (select 1 from tags where id = any(p_tag_ids) and is_polarizing) then
    if p_consent then
      update profiles set special_consent_at = coalesce(special_consent_at, now()) where id = me.id;
    elsif me.special_consent_at is null then
      raise exception 'consent_required';
    end if;
  end if;
  delete from user_tags where user_id = me.id;
  insert into user_tags (user_id, tag_id)
  select me.id, t.id from tags t where t.id = any(p_tag_ids) and t.is_active
  on conflict do nothing;
end $$;

-- Krok 3 onboardingu: imię, wiek, płeć + tagi z kroku 2
create function complete_onboarding(p_first_name text, p_birth_year int, p_gender gender_t,
                                    p_tag_ids uuid[], p_consent boolean default false) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if extract(year from now())::int - p_birth_year < 16 then raise exception 'too_young'; end if;  -- sprawdź wymagania prawne
  update profiles set first_name = trim(p_first_name), birth_year = p_birth_year,
         gender = p_gender, onboarded = true
   where id = auth.uid();
  perform set_my_tags(p_tag_ids, p_consent);
end $$;

-- Nowy post (ekran "+ Dodaj co robisz"): walidacje + kolejka push
create function create_post(p_body text, p_tag_ids uuid[], p_duration_h int, p_starts_at timestamptz default null)
returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare me profiles; pid uuid;
begin
  select * into me from profiles where id = auth.uid();
  if me.id is null or not me.onboarded then raise exception 'not_onboarded'; end if;
  if me.location is null or me.location_updated_at < now() - interval '2 hours' then
    raise exception 'location_required';
  end if;
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
  values (me.id, trim(p_body), me.location, coalesce(p_starts_at, now()), now() + make_interval(hours => p_duration_h))
  returning id into pid;
  insert into post_tags (post_id, tag_id) select pid, unnest(p_tag_ids);
  insert into push_queue (post_id) values (pid);
  return pid;
end $$;

-- FEED "Wokół Ciebie": używa lokalizacji z profilu (nie z parametru — utrudnia triangulację),
-- zwraca odległość zaokrągloną do 100 m i pozycję pinezki zaokrągloną do ~500 m.
-- Ranking: bliżej + nowsze; posty "etapów życia" od osób innej płci niżej (gdy włączona preferencja).
create function feed_nearby(p_radius_m int default 2000, p_limit int default 50)
returns table (id uuid, author_name text, body text, tag_slugs text[], distance_m int,
               map_lat double precision, map_lng double precision,
               starts_at timestamptz, expires_at timestamptz, created_at timestamptz)
language plpgsql stable security definer set search_path = public, extensions as $$
#variable_conflict use_column
declare me profiles;
begin
  select * into me from profiles where profiles.id = auth.uid();
  if me.id is null or me.location is null then return; end if;
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
  cross join lateral (select st_distance(p.location, me.location) as d) x
  where st_dwithin(p.location, me.location, least(p_radius_m, 5000))
    and post_visible_to(p.id, me.id)
  order by
    (case when me.same_gender_pref and a.gender is distinct from me.gender
           and exists (select 1 from post_tags pt join tags t on t.id = pt.tag_id
                       where pt.post_id = p.id and t.grp = 'life_stage')
          then 1 else 0 end),
    x.d, p.created_at desc
  limit least(p_limit, 100);
end $$;

-- Własny bąbelek: zwraca 'exists' | 'voted' | 'approved' | 'rejected'
create function propose_tag(p_label text, p_grp tag_group) returns text
language plpgsql security definer set search_path = public, extensions as $$
declare lbl text := regexp_replace(trim(p_label), '\s+', ' ', 'g'); pr tag_proposals;
begin
  if auth.uid() is null then raise exception 'unauthenticated'; end if;
  if char_length(lbl) not between 3 and 60 then raise exception 'bad_label'; end if;
  if exists (select 1 from tags where lower(label) = lower(lbl)) then return 'exists'; end if;
  insert into tag_proposals (label, grp, created_by) values (lbl, p_grp, auth.uid())
  on conflict ((lower(label))) do nothing;
  select * into pr from tag_proposals where lower(label) = lower(lbl);
  if pr.status in ('approved', 'rejected') then return pr.status; end if;
  insert into tag_proposal_votes (proposal_id, user_id) values (pr.id, auth.uid()) on conflict do nothing;
  return 'voted';
end $$;

-- Moderator zatwierdza propozycję (service_role): tworzy bąbelek, dopisuje go głosującym.
-- Tagi światopoglądowe: p_polarizing = true => głosujący NIE dostają go automatycznie (brak zgody art. 9).
create function approve_tag_proposal(p_id uuid, p_emoji text, p_polarizing boolean default false) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare pr tag_proposals; tid uuid;
begin
  select * into pr from tag_proposals where id = p_id and status = 'pending_review';
  if pr.id is null then raise exception 'not_pending'; end if;
  insert into tags (slug, label, emoji, grp, is_polarizing)
  values (lower(regexp_replace(pr.label, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(pr.id::text, 1, 4),
          pr.label, p_emoji, pr.grp, p_polarizing)
  returning id into tid;
  if not p_polarizing then
    insert into user_tags (user_id, tag_id)
    select user_id, tid from tag_proposal_votes where proposal_id = pr.id
    on conflict do nothing;
  end if;
  update tag_proposals set status = 'approved' where id = pr.id;
  return tid;
end $$;

-- =====================================================================
-- RLS + UPRAWNIENIA
-- =====================================================================
alter table profiles           enable row level security;
alter table tags               enable row level security;
alter table user_tags          enable row level security;
alter table tag_proposals      enable row level security;
alter table tag_proposal_votes enable row level security;
alter table posts              enable row level security;
alter table post_tags          enable row level security;
alter table blocks             enable row level security;
alter table reports            enable row level security;
alter table push_queue         enable row level security;
alter table notification_log   enable row level security;

revoke all on all tables in schema public from anon, authenticated;

-- profiles: tylko własny wiersz; lokalizację i zgody zmienia się wyłącznie przez RPC
grant select on profiles to authenticated;
grant update (first_name, status, quiet_hours_enabled, quiet_start, quiet_end, timezone, same_gender_pref)
  on profiles to authenticated;
create policy profiles_select_own on profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_own on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- tags: publiczne (bąbelki widoczne przed rejestracją)
grant select on tags to anon, authenticated;
create policy tags_read on tags for select to anon, authenticated using (is_active);

-- user_tags: tylko odczyt własnych (zapis przez set_my_tags)
grant select on user_tags to authenticated;
create policy user_tags_own on user_tags for select to authenticated using (user_id = auth.uid());

-- propozycje tagów
grant select on tag_proposals to authenticated;
create policy proposals_read on tag_proposals for select to authenticated
  using (status in ('collecting', 'pending_review'));
grant select on tag_proposal_votes to authenticated;
create policy votes_own on tag_proposal_votes for select to authenticated using (user_id = auth.uid());

-- posts: BRAK dostępu do kolumny location; widoczność = izolacja treści
grant select (id, author_id, body, starts_at, created_at, expires_at) on posts to authenticated;
grant delete on posts to authenticated;
create policy posts_select on posts for select to authenticated
  using (author_id = auth.uid() or post_visible_to_me(id));
create policy posts_delete_own on posts for delete to authenticated using (author_id = auth.uid());

grant select on post_tags to authenticated;
create policy post_tags_select on post_tags for select to authenticated
  using (post_visible_to_me(post_id)
         or exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid()));

-- blokady i zgłoszenia
grant select, insert, delete on blocks to authenticated;
create policy blocks_own_select on blocks for select to authenticated using (blocker_id = auth.uid());
create policy blocks_own_insert on blocks for insert to authenticated with check (blocker_id = auth.uid());
create policy blocks_own_delete on blocks for delete to authenticated using (blocker_id = auth.uid());
grant insert on reports to authenticated;
create policy reports_insert on reports for insert to authenticated with check (reporter_id = auth.uid());

-- push_queue / notification_log: bez polityk = dostęp tylko dla service_role

-- Uprawnienia do funkcji: domyślnie nikt, potem wybrane
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function post_visible_to_me(uuid)                                 to authenticated;
grant execute on function tag_nearby_counts(double precision, double precision, int) to anon, authenticated;
grant execute on function update_my_location(double precision, double precision)    to authenticated;
grant execute on function set_my_tags(uuid[], boolean)                              to authenticated;
grant execute on function complete_onboarding(text, int, gender_t, uuid[], boolean) to authenticated;
grant execute on function create_post(text, uuid[], int, timestamptz)               to authenticated;
grant execute on function feed_nearby(int, int)                                     to authenticated;
grant execute on function propose_tag(text, tag_group)                              to authenticated;
grant execute on function claim_push_batch(int)                                     to service_role;
grant execute on function approve_tag_proposal(uuid, text, boolean)                 to service_role;

-- =====================================================================
-- DANE STARTOWE: BĄBELKI
-- =====================================================================
insert into tags (slug, label, emoji, grp, is_polarizing) values
  ('noworodek',      'Noworodek',        '👶', 'life_stage', false),
  ('niemowle',       'Niemowlę',         '🍼', 'life_stage', false),
  ('praca-zdalna',   'Praca zdalna',     '💻', 'life_stage', false),
  ('nowy-w-miescie', 'Nowy w mieście',   '🏙️', 'life_stage', false),
  ('geopolityka',    'Geopolityka',      '🌍', 'mind',       true),
  ('redpill',        'Redpill',          '💊', 'mind',       true),
  ('polityka',       'Polityka',         '🗳️', 'mind',       true),
  ('rozwoj',         'Rozwój osobisty',  '🌱', 'mind',       false),
  ('psychologia',    'Psychologia',      '🧩', 'mind',       false),
  ('ekonomia',       'Ekonomia',         '📈', 'mind',       false),
  ('szachy',         'Szachy',           '♟️', 'hobby',      false),
  ('spacery-z-psem', 'Spacery z psem',   '🐕', 'hobby',      false),
  ('planszowki',     'Planszówki',       '🎲', 'hobby',      false),
  ('koszykowka',     'Koszykówka',       '🏀', 'hobby',      false);

-- =====================================================================
-- CRON: wysyłka push co minutę + sprzątanie
-- Najpierw zapisz klucz w Vault (jednorazowo, wstaw własny):
--   select vault.create_secret('TWÓJ_SERVICE_ROLE_KEY', 'service_role_key');
-- Podmień YOUR_PROJECT_REF na ref projektu.
-- =====================================================================
select cron.schedule('dispatch-push', '* * * * *', $$
  select net.http_post(
    url     := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/dispatch-push',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets
                                                where name = 'service_role_key')),
    body    := '{}'::jsonb)
$$);

select cron.schedule('cleanup', '15 3 * * *', $$
  delete from posts            where expires_at < now() - interval '7 days';
  delete from notification_log where sent_at    < now() - interval '7 days';
  delete from push_queue       where processed_at < now() - interval '7 days'
$$);
