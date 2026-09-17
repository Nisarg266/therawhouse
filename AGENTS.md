# AGENTS.md — Project Context & Architectural Memory

## Project Overview
- **Store**: The Raw House (`therawhouse-ap0ur1k1.myshopify.com`)
- **Framework**: Shopify Liquid Theme (Horizon base, customized for luxury aesthetic)
- **Local Dev Server**: Port 9292 (`shopify theme dev --store therawhouse-ap0ur1k1.myshopify.com -- --port 9292`)

---

## Core Architecture & File Mapping

### 1. Header & Navigation System
- `sections/header.liquid`: Main header section with multi-row layout (top row: drawer toggle, search, logo, actions; bottom row: desktop menu).
- `snippets/header-row.liquid`: Renders 3-column header layout (`left`, `center`, `right`).
- `snippets/header-drawer.liquid`: Markup for mobile slide drawer (`<header-drawer>`, `<details id="Details-menu-drawer-container">`, `<summary>`, editorial feature card, navigation links).
- `assets/header-smart-hide.js`: Universal smart sticky header controller (Mobile & Desktop). On downward scroll (>8px delta), adds `.header--auto-hidden` (`transform: translateY(-102%)`) to smoothly hide header and maximize content space; on upward scroll (<-8px delta), removes it to smoothly slide header down into view immediately anywhere on the page without having to scroll to top. Stays visible near top (`scrollY <= 70`), when hovered, or when drawer/cart/search is open.
- `assets/custom-header.css`: Overrides for ultra-luxury header, search pill, zero-gap mobile layout, mobile drawer transitions, smart sticky scroll-up header transitions, and exact mobile logo centering (`.header__column--center { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); }` preventing bias from unequal left/right icon clusters).

### 2. Custom Showcase & Catalog Sections
- `sections/luxury-product-catalog.liquid`: 6-card collage layout with "View More" button to reveal additional items, configurable section height (range: 200px–600px).
- `sections/new-arrivals-gallery.liquid`: Gallery showcase, full-width edge-to-edge on mobile.
- `sections/luxury-hero-slider.liquid`: Hero slider section with luxury typography and transitions. Driven by `initHero` in `assets/luxp.js` with hardware-accelerated horizontal track sliding (`transform: translate3d(-index * 100%, 0, 0)`), real-time touch and desktop drag tracking, fluid deceleration snap, swipe link-suppression, and smooth cubic-bezier easing (`cubic-bezier(0.22, 1, 0.36, 1)`).
- `sections/recommendations-editorial.liquid`: Editorial lifestyle blocks. Supports classic `grid` and interactive `split` layout. In `split` mode:
  - Left rail (`.luxp-split__sticky`): Sticky position `--split-rail-top: clamp(140px, 16vh, 175px)` with top padding for breathing room below sticky header menu; contains eyebrow, title, diamond ornament, curatorial narrative, and curation badge/link.
  - Right cards (`.luxp-split__card`): Grid columns `minmax(250px, 1.15fr) 2fr` (~68% width); internal body padding `clamp(22px, 2.5vw, 34px) clamp(24px, 3vw, 38px)`; cards stack in deck via `position: sticky; top: calc(var(--split-rail-top) + var(--card-i) * var(--deck-offset))`.
  - Scroll blur depth: covered cards receive `.is-covered` (`nextTop <= top + 34`) with `filter: blur(5px) brightness(0.88) saturate(0.92); opacity: 0.65; transform: scale(0.96) translateY(8px)`.
- Global Smooth Scrolling: Configured in `assets/custom-header.css` via `html { scroll-behavior: smooth !important; }` and `-webkit-overflow-scrolling: touch !important;` across all horizontal scroll tracks.
- `sections/the-makers-grid.liquid`: Artisan/craftsmanship showcase section.

### 3. Styling & Global Scripts
- `snippets/stylesheets.liquid`: Loads `custom-header.css` with high-priority preload.
- `snippets/scripts.liquid`: Contains native JS `importmap` for `@theme/*` modules.

---

## Key Development Rules & Gotchas

1. **Header Drawer Lifecycle**:
   - Do NOT attach duplicate inline `<script>` tags inside `header-drawer.liquid`. All logic belongs in `assets/header-drawer.js`.
   - Never use `trapFocus(details)` on the root details container because `<summary>` is the first focusable element, which can cause focus loops and premature closures on mobile touch.
   - The mobile drawer is positioned `top: 0; height: 100dvh; z-index: 999999` to ensure it slides over the full viewport without clipping behind sticky elements or announcement bars.

2. **Zero-Overflow Hierarchy**:
   - Handle global horizontal overflow on `html, body { overflow-x: hidden !important; }`.
   - Do NOT place `overflow: hidden` on `#header-group` or `.header` as it breaks fixed child drawers.

3. **Validation Standard**:
   - Always run `shopify theme check --fail-level error` to verify 0 errors before completing tasks.
   - Translation keys must match existing keys in `locales/en.default.json` (e.g. `actions.close`, not `accessibility.close`).

4. **Agent Workflow & Fast Execution**:
   - Follow targeted file inspection only. NEVER scan the whole codebase, node_modules, `.git`, or unrelated sections.
   - For `recommendations` changes, inspect only `sections/recommendations-editorial.liquid` and `templates/index.json`.
   - Keep `templates/index.json` pure JSON without C-style comments or merge conflict markers.
