# KRK Transit — frontend

Mapa pojazdów komunikacji miejskiej w Krakowie i statystyki opóźnień.
React, TypeScript, Vite, Tailwind CSS i Leaflet.

## Praca lokalna

Wymagany Node.js 22.12+ i npm.

W katalogu repozytorium frontendu uruchom:

```bash
npm ci
npm run dev
```

Otwórz adres podany przez Vite w terminalu (domyślnie `http://localhost:5173`).
Zmiany w kodzie pojawiają się w przeglądarce automatycznie.

Vite przekazuje zapytania `/v1` do `https://api.krktransit.pl`.
Nie trzeba uruchamiać lokalnego backendu ani konfigurować pliku `.env`.
Dane mapy i statystyk wymagają połączenia z API.

Przełącznik słońce/księżyc obok wyboru języka zmienia motyw całej aplikacji,
w tym mapy. Domyślny motyw jest ciemny. Wybór jest zapisywany lokalnie
w przeglądarce i przywracany po odświeżeniu.

## Sprawdzenie zmian

Widoki mają osobne adresy: `/#/map`, `/#/stats` i `/#/about`.
Odświeżenie zachowuje wybrany widok; działają też przyciski Wstecz/Dalej
oraz bezpośrednie linki. Nawigacja używa fragmentu `#`, więc nie wymaga
dodatkowej konfiguracji hostingu.

```bash
npm run lint
npm run build
```

Build trafia do `dist/`. Można go sprawdzić lokalnie przez `npm run preview`.
