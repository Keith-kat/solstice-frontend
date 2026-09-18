# Solstice — frontend (Vite + React + Tailwind)

The same components from the published demo, set up as a normal editable
React project instead of a single CDN-loaded HTML file.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Layout

- `src/SolsticeApp.jsx` — the guest-facing marketplace (browse/search,
  property detail, WhatsApp contact, M-Pesa reservation flow, "list your
  property" onboarding). Exports `BRAND` (the color/token object) too, so
  other files can stay visually consistent.
- `src/SolsticeDashboard.jsx` — the host/agent dashboard (listings,
  leads, verification queue, partners, reviews, performance).
- `src/App.jsx` — the top-level switcher between the two, standing in
  for real routing (`/` vs `/dashboard`) until auth is wired up.
- `src/pwa-register.js`, `public/manifest.json`, `public/service-worker.js`
  — the PWA/low-data pieces: offline-friendly caching and an installable
  app shell. `public/icons/` has placeholder icons — swap them for real
  artwork before shipping.
- Icons come from `lucide-react` directly here (a real bundler, unlike
  the published demo, so no CDN workaround needed).

## Not wired up yet

This still uses the same mock data (`MOCK_LISTINGS`, `MOCK_AGENT_LISTINGS`,
etc.) as the demo — it doesn't call the backend yet. The natural next step
once you're comfortable editing this is replacing those mock arrays with
`fetch()` calls to the backend's `/api/properties`, `/api/bookings`, etc.
(see `../solstice-backend/README.md`).
