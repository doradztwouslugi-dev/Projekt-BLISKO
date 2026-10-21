// supabase/functions/dispatch-push/index.ts
// Wywoływana co minutę z pg_cron. Pobiera partię powiadomień z bazy (claim_push_batch)
// i wysyła je przez OneSignal. Użytkownik w OneSignal musi mieć external_id = Supabase user id
// (OneSignal.login(user.id) po zalogowaniu w aplikacji).
//
// Sekrety: supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=...
// Deploy:  supabase functions deploy dispatch-push --no-verify-jwt
// (--no-verify-jwt, bo autoryzujemy ręcznie kluczem service_role poniżej)

import { createClient } from "jsr:@supabase/supabase-js@2";

type Row = {
  user_id: string;
  post_id: string;
  author_name: string | null;
  distance_m: number;
  body: string;
  is_life_stage: boolean;
  starts_at: string;
};

const fmtDist = (m: number) =>
  m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1).replace(".", ",")} km`;

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw" })
    .format(new Date(iso));

function build(r: Row) {
  const who = r.author_name ?? "Ktoś";
  const text = r.body.length > 90 ? r.body.slice(0, 87) + "…" : r.body;
  return {
    title: r.is_life_stage ? "Ktoś w okolicy na tym samym etapie! 👶" : "Ktoś chce pogadać! 💬",
    message: `${who} (${fmtDist(r.distance_m)} stąd, ${fmtTime(r.starts_at)}): ${text}`,
  };
}

async function sendOne(r: Row) {
  const { title, message } = build(r);
  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${Deno.env.get("ONESIGNAL_REST_API_KEY")}`,
    },
    body: JSON.stringify({
      app_id: Deno.env.get("ONESIGNAL_APP_ID"),
      target_channel: "push",
      include_aliases: { external_id: [r.user_id] },
      headings: { pl: title, en: title },
      contents: { pl: message, en: message },
      data: { post_id: r.post_id },   // deep link: otwórz kartę posta
      ttl: 3600,                      // po godzinie powiadomienie traci sens
    }),
  });
  if (!res.ok) console.error("OneSignal error", res.status, await res.text());
  return res.ok;
}

Deno.serve(async (req) => {
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (req.headers.get("Authorization") !== `Bearer ${key}`) {
    return new Response("unauthorized", { status: 401 });
  }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, key);
  const { data, error } = await sb.rpc("claim_push_batch", { p_max_jobs: 20 });
  if (error) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  let sent = 0;
  for (let i = 0; i < rows.length; i += 20) {         // paczki po 20 równoległych żądań
    const results = await Promise.all(rows.slice(i, i + 20).map(sendOne));
    sent += results.filter(Boolean).length;
  }
  return Response.json({ recipients: rows.length, sent });
});
