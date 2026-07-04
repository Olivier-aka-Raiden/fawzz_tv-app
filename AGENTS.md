# Fawzz_tv Frontend (React / TypeScript)

## Stack

- **Framework:** React 19 (functional components + hooks)
- **Language:** TypeScript 6
- **Styling:** Tailwind CSS v4 (class-based dark mode, Twitch purple neon theme)
- **Routing:** React Router 7
- **Animation:** Framer Motion 12
- **Icons:** Lucide React 1
- **Maps:** Mapbox GL JS + react-map-gl 8 (dark-v11 style)
- **i18n:** i18next 26 + browser language detector (FR/EN)
- **Build:** Vite 8

## Key Conventions

- **Components:** One component per file, PascalCase naming
- **Styling:** Tailwind utility classes only — no CSS modules or styled-components
- **Dark mode:** Default dark. All components must pair base (light) classes with `dark:` overrides
- **Responsive:** Mobile-first. Use `sm:`, `md:`, `lg:` breakpoints. Test at 320px, 768px, 1024px, 1280px
- **Tap targets:** All interactive elements ≥44×44px on touch devices
- **i18n:** All user-facing text uses `useTranslation()`. Keys in `src/i18n/locales/{fr,en}.json`
- **Theme:** Twitch purple (`#9146FF`), neon glow utilities (`neon-glow`, `neon-text`, `neon-border`)

## Development

```bash
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve dist/ locally
```

## Component Template

```tsx
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface Props {
  title: string;
}

export default function MyComponent({ title }: Props) {
  const { t } = useTranslation();

  return (
    <section className="py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h2 className="text-3xl font-bold text-white">{title}</h2>
      </motion.div>
    </section>
  );
}
```
