# Wokół Ciebie

Aplikacja mobilna (iOS + Android): ludzie w okolicy łączą się wokół wspólnych zainteresowań i etapów życia.

## Co jest w repozytorium
- `CLAUDE.md` — brief i zasady dla Claude Code (przeczytaj najpierw).
- `reference/wokol-ciebie.html` — klikalny prototyp UI (wzór wyglądu).
- `supabase/migrations/` — baza danych (uruchamiaj po kolei: 001, 002, ...).
- `supabase/functions/dispatch-push/` — wysyłka powiadomień push.

## Czego jeszcze NIE ma (powstanie w etapie 1)
Kod aplikacji Expo (`app/`, `components/`, `package.json`, `app.json`, `tsconfig.json`)
oraz `supabase/config.toml`. Claude Code wygeneruje je poleceniami z CLAUDE.md.

## Start
1. Skopiuj `.env.example` do `.env` i uzupełnij klucze.
2. Otwórz folder w Claude Code i napisz: „Przeczytaj CLAUDE.md i zacznij od etapu 1”.
