# Wokół Ciebie — brief dla Claude Code

Aplikacja mobilna (iOS + Android) po polsku: ludzie w okolicy łączą się wokół wspólnych zainteresowań
i etapów życia. Platoniczna, bez „randkowego” charakteru. Zaczynamy od jednego miasta (Oleśnica).

## Materiały w repozytorium
- `reference/wokol-ciebie.html` — klikalny prototyp UI (układ, teksty, kolory, zachowanie). Odwzoruj go 1:1.
- `supabase/migrations/001_schema.sql` — baza (`wokol-ciebie-schema.sql`).
- `supabase/migrations/002_moja_okolica.sql` — migracja trybu „Moja okolica”.
- `supabase/functions/dispatch-push/index.ts` — wysyłka push (OneSignal).

## Stack (nie zmieniaj bez pytania)
- Expo (SDK aktualne) + TypeScript + expo-router, **dev build przez EAS** (nie Expo Go — logowanie Google i OneSignal wymagają natywnego kodu).
- Supabase: Postgres + PostGIS, Auth, Edge Functions. Klient: `@supabase/supabase-js`, sesja w `expo-secure-store`.
- Dane: TanStack Query. Stan lokalny: zustand. Styl: `StyleSheet` + wspólny plik `theme.ts` (tokeny z prototypu, jasny i ciemny motyw).
- Logowanie: Apple (`expo-apple-authentication` + `signInWithIdToken`), Google (`@react-native-google-signin/google-signin` + `signInWithIdToken`).
- Push: `react-native-onesignal`; po zalogowaniu `OneSignal.login(user.id)`.
- Mapa: `@maplibre/maplibre-react-native` + kafelki OpenStreetMap (bez Google Maps).
- Lokalizacja: `expo-location`, **tylko „podczas używania”**. Żadnej lokalizacji w tle.
- Język UI: wyłącznie polski. Teksty w jednym pliku `i18n/pl.ts`.

## Ekrany i przepływy (wg prototypu)
1. **Onboarding przed rejestracją:** cel wejścia → bąbelki zainteresowań (kategorie zależne od celu; własne propozycje; liczniki z `tag_nearby_counts`) → logowanie Apple/Google + imię, rok urodzenia, płeć → **wybór „Mojej okolicy”** (punkt na mapie lub „użyj mojej lokalizacji” jednorazowo, promień 1/2/3/5 km, domyślnie 2 km) → `complete_onboarding` + `set_home_area`.
   Do czasu logowania trzymaj wybory lokalnie, zapisz je po zalogowaniu.
2. **Wokół Ciebie:** nagłówek z miastem i promieniem, przełącznik lista/mapa, pigułki kategorii, feed z `feed_nearby`, przycisk „+ Dodaj co robisz / Kogo szukasz”.
3. **Dodawanie posta:** opis, tagi (max 5), czas aktywności 1–24 h → `create_post`.
4. **Profil:** status 🟢/🔴, godziny ciszy 22:00–07:00, preferencja tej samej płci, edycja tagów, edycja „Mojej okolicy”, blokowanie, zgłaszanie, usuwanie konta.
5. **„Dołącz / Napisz”:** na razie tylko zgłoszenie chęci (tabele czatu to osobny etap — nie wymyślaj ich bez zgody).

## Zasady bezpieczeństwa (twarde)
- W aplikacji **nigdy** nie używaj klucza `service_role`. Tylko `anon` + sesja użytkownika.
- Zapisy i odczyty wrażliwych danych **wyłącznie przez RPC** z migracji. Nie czytaj `posts.location` (brak uprawnień), nie pisz do `profiles.location` ani `home_location` bezpośrednio.
- Nie loguj współrzędnych, tokenów ani treści postów (ani do konsoli, ani do analityki).
- Nie pokazuj dokładnych pozycji; używaj `distance_m` i `map_lat/map_lng` zwracanych przez bazę.
- Izolacja treści (Redpill, Geopolityka, Polityka) jest w bazie. UI nie może jej „naprawiać” ani omijać. Nie wyświetlaj nawet licznika takich postów osobom bez tych tagów.
- Tagi `is_polarizing` wymagają jawnej zgody (ekran z osobnym przełącznikiem i opisem). Błąd `consent_required` obsłuż tym ekranem.
- Obsłuż kody błędów RPC po polsku: `consent_required`, `too_young`, `rate_limited`, `area_required`, `polarizing_tag_not_in_profile`, `tags_1_to_5`, `duration_1_to_24`.

## Wymagania App Store / Google Play (zaplanuj od początku)
- Sign in with Apple obok Google; usuwanie konta w aplikacji; blokowanie i zgłaszanie treści; link do regulaminu i polityki prywatności.
- Teksty uzasadnień uprawnień po polsku (lokalizacja „podczas używania”, powiadomienia).
- Ankieta prywatności (Apple Privacy Nutrition Label / Google Data Safety): lokalizacja przybliżona, dane o poglądach (za zgodą).

## Kolejność prac (po każdym etapie: uruchom, pokaż, poczekaj na akceptację)
1. Szkielet Expo + `theme.ts` + nawigacja + `i18n/pl.ts`. Ekrany statyczne z danymi z prototypu.
2. Supabase: połączenie, logowanie Apple/Google, profil, `complete_onboarding`, `set_home_area`.
3. Feed, dodawanie posta, mapa, własne bąbelki (`propose_tag`), liczniki.
4. Push: OneSignal, wdrożenie `dispatch-push`, cron, test na dwóch urządzeniach.
5. Profil: status, cisza nocna, preferencje, blokowanie/zgłaszanie, usuwanie konta (Edge Function z uprawnieniami serwera).
6. Testy izolacji treści i push (patrz niżej), build EAS, TestFlight / wewnętrzna wersja na Androida.

## Testy, które muszą przejść
- Dwa konta: A z tagiem Redpill, B bez. Post A z Redpill **nie** jest widoczny dla B w feedzie, na mapie ani w push.
- Użytkownik 🔴 lub w ciszy nocnej nie dostaje push. Maksymalnie 3 push na godzinę.
- Post spoza okolicy/promienia nie generuje push. Wygasły post znika z feedu.
- Preferencja tej samej płci: push z „Etapów życia” trafia tylko do osób tej samej płci.
- Zablokowany użytkownik nie widzi moich postów i odwrotnie.
- Bez zgody art. 9 nie da się zapisać tagu światopoglądowego.

## Styl pracy
- Małe, zrozumiałe commity. Zmienne środowiskowe w `.env` (nie commituj), wzór w `.env.example`.
- Przed większą zmianą stacku lub schematu bazy — zapytaj.
- Gdy czegoś brakuje (klucze, konta Apple/Google/OneSignal) — wypisz, co dokładnie muszę założyć, krok po kroku.
