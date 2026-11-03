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

## Sprawdzenie zmian

Widoki mają osobne adresy: `/map`, `/stats` i `/about`.
Odświeżenie zachowuje wybrany widok; działają też przyciski Wstecz/Dalej
oraz bezpośrednie linki. Hosting musi zwracać `index.html` dla nieznanych
ścieżek; Vite robi to w `npm run dev` i `npm run preview`.

```bash
npm run lint
npm run build
```

Build trafia do `dist/`. Można go sprawdzić lokalnie przez `npm run preview`.
