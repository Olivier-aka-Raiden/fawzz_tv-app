# fawzz_tv-app

Website for [Fawzz_tv](https://twitch.tv/fawzz_tv) — a French Twitch channel built around authenticity, community, and ambitious live challenges. Showcases cycling adventures and shares highlights for the community.

## Stack

- **Framework:** React 19 + TypeScript 6
- **Build:** Vite 8
- **Styling:** Tailwind CSS v4 (neon Twitch purple theme)
- **Routing:** React Router 7
- **Animation:** Framer Motion 12
- **Icons:** Lucide React 1
- **i18n:** i18next (FR/EN auto-detect)
- **Maps:** Mapbox GL JS
- **Deploy:** Vercel (static)

## Development

```bash
npm install
cp .env.example .env   # then fill in your keys
npm run dev             # http://localhost:5173
npm run build           # production build → dist/
npm run preview         # preview production build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_MAPBOX_TOKEN` | Yes | Mapbox public token (maps won't render without) |
| `TWITCH_CLIENT_ID` | For clips | Twitch App client ID — stored server-side in Vercel function |
| `TWITCH_CLIENT_SECRET` | For clips | Twitch App client secret — **never exposed to browser** |

## Pages

| Page | Route |
|------|-------|
| Home | `/` |
| Aventures | `/aventures` |
| Clips | `/clips` |
| Live | `/live` |
| Sponsors | `/sponsors` |
| À propos | `/a-propos` |
