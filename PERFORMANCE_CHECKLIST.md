# Lighthouse & Performance Checklist

Goals: Lighthouse score > 95 (Performance / Accessibility / Best practices / SEO)

- Fonts
  - Preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`.
  - Use `display=swap` and load only required weights. Consider self-hosting critical subsets.
- Images
  - Use AVIF/WEBP; serve responsive sizes. Use `next/image` where possible.
  - Defer non-critical images; lazy-load offscreen content.
- JavaScript
  - Keep initial client JS minimal. Mark heavy widgets as client components and lazy-load them.
  - Use route-based code splitting.
- CSS
  - Purge unused CSS via Tailwind config content paths.
  - Avoid large global styles; prefer component-scoped utilities.
- Animations
  - Use CSS transforms (translate, opacity) instead of layout thrashing.
  - Respect `prefers-reduced-motion`.
- Network
  - Preconnect/cdn hints for analytics and fonts.
  - Use caching headers for static assets.
- Accessibility & SEO
  - Proper semantic HTML, ARIA where needed, keyboard support for interactive widgets.
  - Add structured data for `Person` and `Organization` where applicable.
