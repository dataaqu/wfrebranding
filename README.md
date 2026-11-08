# WEFORWARD — landing site

Next.js 16 (App Router) + Tailwind 3 + Motion + Three.js.

```bash
npm install
npm run dev        # http://127.0.0.1:3000
npm run typecheck
npm run build
```

## Layout

| Path | What lives there |
|---|---|
| `app/` | Route entry (`layout.tsx`, `page.tsx`), global CSS, icons |
| `components/brand/` | Design system: logo, W mark, icons, buttons, intro loader |
| `components/sections/` | One file per landing-page section |
| `lib/` | Client logic: intro preloading, routes engine, tracking |
| `data/` | Static content and JSON datasets |
| `public/assets/` | Files served to visitors (fonts, images, video) |
| `public/routes-engine/` | Route explorer scripts + world map |
| `assets-src/videos/services/` | Raw service videos, **not served**, gitignored |

`tailwind.design.config.js` holds the brand tokens; `tailwind.config.mjs` extends it.
See `PRODUCT.md` for product/brand context.
