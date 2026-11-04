# KRK Transit frontend

Frontend KRK Transit z mapą pojazdów na żywo i statystykami opóźnień.

## Uruchomienie

Wymagane: Node.js 22.12+, npm i uruchomiony [backend](https://github.com/grzechuzz/KRKtransit).

```bash
npm ci
npm run dev
```

Jeśli backend działa na innym porcie niż `8080`:

```bash
API_PROXY_TARGET=http://127.0.0.1:8081 npm run dev
```

## Technologie

React, TypeScript, Vite, Tailwind CSS, Leaflet, TanStack Query, Vitest, Playwright.
