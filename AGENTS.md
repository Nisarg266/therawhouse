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
- `assets/header-drawer.js`: Custom Web Component `<header-drawer>` handling drawer open/close lifecycle, scroll locking, and touch/click interactions.
- `assets/custom-header.css`: Overrides for ultra-luxury header, search pill, zero-gap mobile layout, and mobile drawer transitions.

### 2. Custom Showcase & Catalog Sections
- `sections/luxury-product-catalog.liquid`: 6-card collage layout with "View More" button to reveal additional items, configurable section height (range: 200px–600px).
- `sections/new-arrivals-gallery.liquid`: Gallery showcase, full-width edge-to-edge on mobile.
- `sections/luxury-hero-slider.liquid`: Hero slider section with luxury typography and transitions.
- `sections/recommendations-editorial.liquid`: Editorial lifestyle blocks.
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

4. **Agent Workflow**:
   - Follow targeted file inspection only.
   - Do not scan irrelevant files, caches, `.git`, or unrelated sections.
