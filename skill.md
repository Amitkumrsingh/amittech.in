---
name: frontend-product-engineering
description: Build production-grade frontend products with strong visual direction, scalable React and Next.js architecture, design systems, accessibility, performance, testing, observability, and enterprise readiness. Use when designing, implementing, refactoring, or reviewing frontend applications, dashboards, SaaS tools, portfolio experiences, or component systems.
---

# Frontend Product Engineering Skill

Use this skill when the work needs both product-quality UI and production frontend engineering. The goal is not only to make screens look good, but to make them scalable, maintainable, accessible, fast, and ready for real users.

## 1. Design Philosophy

Before writing code, decide the product direction:

1. **Purpose** - What job does this screen or app perform?
2. **Audience** - Who uses it, how often, and under what pressure?
3. **Density** - Is this a marketing surface, product workflow, dashboard, editor, or operational tool?
4. **Visual anchor** - Choose one design direction and hold it consistently.
5. **System** - Define tokens, components, spacing, type scale, motion, and interaction rules.
6. **Content discipline** - Every visible string should be useful, real, and appropriate to the product.

### Eight Design Anchors

Pick one visual anchor per project or major surface. Do not blend anchors without a clear product reason.

- **Swiss** - White or neutral surfaces, strict grids, left-aligned typography, sharp editorial hierarchy.
- **Industrial** - Dark surfaces, monospace typography, 1 px borders, operational density, tabular numbers.
- **Brutalist** - Raw system fonts, primary colors, hard borders, native controls, intentionally direct layout.
- **Aurora Maximalism** - Dark saturated gradients, neon accents, glassmorphism, spring motion, premium SaaS energy.
- **Chaotic Maximalism** - Clashing colors, mixed typefaces, patterns, intentionally loud composition.
- **Retro-Futuristic** - Neon pairs, terminal or CRT influence, scanline texture, committed glow.
- **Organic** - Earth tones, humanist type, soft corners, grain, gentle motion.
- **Lo-Fi** - Paper-yellow surfaces, mixed system fonts, rotated elements, halftone or risograph texture.

### Content Discipline

Design quality collapses when the content is fake. Use real product data when available. If content is illustrative, make it clearly sample content.

Avoid:

- Fabricated metrics pretending to be real.
- Decorative labels that add no information.
- Over-themed replacements for standard UI copy.
- Unicode symbols used as fake icons.
- Generic AI-sounding taglines, filler subtitles, and empty marketing phrases.

### Token Fidelity Rules

- Define semantic tokens first: surface, text, muted text, border, accent, danger, success, warning, radius, shadow, spacing, motion.
- Use raw hex values only when creating or extending the token system.
- Keep typography consistent with the selected anchor.
- Keep spacing and radii consistent across repeated components.
- Use icons from the existing icon library instead of hand-made symbol hacks.
- Make hover, focus, active, disabled, loading, empty, and error states intentional.

## 2. Product Architecture

Prefer architecture that lets the product grow without making every new feature a custom one-off.

### Configuration-Driven Architecture

Use configuration when the product has repeated patterns with changing metadata.

- **Dynamic forms** - Field config, validation schema, visibility rules, dependent fields, multi-step flows.
- **Dynamic tables** - Column config, sorting, filtering, pagination, row actions, empty states.
- **Dynamic navigation** - Role-aware menus, route metadata, active state, breadcrumbs.
- **Workflow engine** - Statuses, transitions, guard conditions, audit events, user actions.
- **Dashboard widgets** - Widget registry, layout config, data source contract, loading and error states.
- **Schema-driven UI** - Use typed schemas for forms, filters, cards, tables, and API payloads.
- **Metadata-driven components** - Keep labels, permissions, feature flags, and render rules close to the schema.

Use configuration to remove meaningful duplication. Do not turn simple static UI into a framework.

### Design System Architecture

Build the system from stable primitives:

- **Design tokens** - Color, typography, spacing, radius, elevation, z-index, motion, breakpoints.
- **Component library** - Buttons, inputs, dialogs, menus, tabs, cards, tables, toasts, layout primitives.
- **Theme system** - Light and dark mode, brand variants, semantic colors, user preference handling.
- **Accessibility standards** - Focus rings, keyboard support, semantic HTML, ARIA only where needed.
- **Documentation by usage** - Component examples should show real product patterns, not toy demos.

### Component-Driven Development

- Use **atomic design** only where it clarifies ownership: primitives, composed components, feature sections, pages.
- Use **compound components** for complex widgets that need flexible composition.
- Use **headless components** when behavior should be reusable across multiple visual treatments.
- Keep reusable components API-driven, typed, and boring. Keep feature components expressive and domain-aware.
- Avoid premature abstractions. Extract only after the same shape appears more than once with real pressure to reuse.

### Feature-Based Architecture

Organize by product domain when the app grows:

```text
src/
  app/
  components/
  features/
    billing/
    dashboard/
    onboarding/
  lib/
  data/
  hooks/
  styles/
```

Use shared libraries for cross-cutting code only: API clients, auth helpers, formatters, design-system primitives, analytics, and stable hooks.

## 3. Production Frontend Engineering

### Application Architecture

For React and Next.js App Router:

- Use Server Components for static, data-heavy, and SEO-friendly rendering.
- Use Client Components only for state, events, browser APIs, animations, and interactive controls.
- Keep API integration in a clear layer: typed fetchers, response normalization, error mapping, retries where appropriate.
- Keep route-level concerns in pages/layouts and business behavior inside features.
- Prefer framework primitives for routing, metadata, image optimization, caching, and streaming.

### State Management

Choose the smallest state model that fits:

- **Local state** - UI state owned by one component.
- **Context API** - Stable app-level preferences or low-frequency shared state.
- **Zustand** - Lightweight cross-component client state.
- **Redux Toolkit** - Complex app state with strict event flow, debugging, or enterprise standards.
- **TanStack Query** - Server state, caching, background refresh, optimistic updates, mutations.

Do not store server state in global client stores unless there is a strong reason.

### Authentication And Security

- Use HTTP-only cookies where possible for sensitive auth tokens.
- Support JWT, OAuth, and session-based auth according to backend constraints.
- Implement protected routes, RBAC, and permission-based rendering.
- Treat frontend permission checks as UX gates, not security boundaries.
- Avoid localStorage for sensitive tokens.
- Sanitize untrusted content and avoid unsafe HTML unless explicitly reviewed.

### Forms And Validation

- Prefer React Hook Form for complex forms.
- Prefer Zod for shared runtime validation and typed schemas.
- Model multi-step forms as state machines or explicit step configs when flows grow.
- Put validation errors close to fields and keep error text human.
- Support loading, disabled, optimistic, success, and retry states.

### Error Handling And Resilience

- Add Error Boundaries around risky feature surfaces.
- Provide useful fallback UI for failed API calls.
- Use retry strategies selectively. Do not retry destructive actions blindly.
- Support offline or reconnect states where the product benefits from it.
- Log meaningful errors with route, feature, user action, and safe metadata.

## 4. Performance Engineering

Track Core Web Vitals as product quality:

- **LCP** - Optimize hero media, server rendering, critical CSS, and data waterfalls.
- **INP** - Reduce main-thread work, avoid heavy synchronous handlers, split expensive interactions.
- **CLS** - Reserve dimensions for images, ads, embeds, cards, grids, and async content.

Optimization checklist:

- Code split feature-heavy routes.
- Lazy load below-the-fold media and expensive widgets.
- Optimize images with Next.js Image or equivalent tooling.
- Virtualize large lists and tables.
- Audit bundle size and remove unused client dependencies.
- Cache stable data and invalidate intentionally.
- Prefer server-side work when it reduces client cost.

## 5. Testing Strategy

Scale testing with risk:

- **Unit tests** - Pure functions, reducers, formatters, schema transforms, small hooks.
- **Integration tests** - User-visible component behavior with React Testing Library.
- **End-to-end tests** - Critical workflows with Playwright or Cypress.
- **Visual checks** - Responsive layout, dark mode, loading states, empty states, long text.
- **Accessibility checks** - Keyboard navigation, focus order, labels, contrast, screen reader basics.

Do not chase coverage numbers at the cost of meaningful confidence.

## 6. Accessibility

Build for WCAG-aligned usability by default:

- Use semantic HTML before ARIA.
- Make all interactive controls keyboard reachable.
- Preserve visible focus states.
- Associate labels, descriptions, and error messages with fields.
- Use sufficient contrast in every theme.
- Respect reduced-motion preferences.
- Ensure menus, dialogs, popovers, and tabs follow expected keyboard behavior.

## 7. DevOps And Observability

### CI/CD

- Run lint, typecheck, tests, and build in CI.
- Use GitHub Actions for repeatable checks.
- Deploy through Vercel for Next.js unless the product requires custom infrastructure.
- Use Docker when environment parity or self-hosting matters.

### Monitoring

- Add Sentry or equivalent error tracking for production apps.
- Add analytics for product events, not vanity events.
- Track Web Vitals and route-level performance.
- Include release/version metadata in error reports.
- Make logs safe: no secrets, tokens, passwords, or private user data.

## 8. Modern Frontend Skills

### Core

- React.js
- Next.js
- TypeScript
- JavaScript
- HTML5
- CSS3

### Styling

- Tailwind CSS
- Shadcn/UI
- Material UI
- CSS Modules
- SCSS

### Animation

- Framer Motion
- GSAP
- Motion design
- Micro-interactions
- Scroll animations
- Page transitions

### Tools

- Figma
- Git
- GitHub
- Postman
- Vite
- Webpack

## 9. Enterprise-Grade Capabilities

Design with these capabilities in mind when the product requires scale:

- Configuration-driven architecture
- Design system architecture
- Component-driven development
- Feature-based architecture
- Micro-frontend readiness
- API-first development
- Internationalization
- Feature flags
- Observability
- Analytics
- Performance budgets
- Accessibility first
- Offline-first behavior
- PWA support
- Error resilience

## Before Shipping Checklist

- The chosen visual anchor is clear and consistent.
- Tokens are semantic, reused, and not scattered as one-off styles.
- Layout works across mobile, tablet, laptop, and desktop widths.
- Text does not wrap badly, overflow, or collide with controls.
- Interactive states exist: hover, focus, active, disabled, loading, empty, and error.
- Components are placed at the right level: shared, feature, or page-specific.
- Server and client boundaries are intentional.
- Data fetching, caching, mutations, and error handling are clear.
- Auth and permission rendering do not leak sensitive data.
- Core Web Vitals risks are checked.
- Critical workflows have appropriate tests.
- Accessibility basics are covered.
- Production errors and key events are observable.
- The implementation improves the product without adding unnecessary architecture.
