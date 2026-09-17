# Theme audit — 16 September 2026

Changes are in the local theme and its existing development preview. The live theme was not published.

## Product page LUXP design system — 17 September 2026

Rebuilt the custom product-page sections on a shared, Theme-Editor-driven design system (`assets/luxp.css` plus `luxp-scheme`, `luxp-typo`, `luxp-image`, `luxp-icon` snippets). The native `product-information` and `product-recommendations` sections were left untouched.

- **Product Story & Metrics** (`luxury-craftsmanship-story`): split layout with separate desktop/mobile images, floating badge (position/colors/size), metric blocks rendered as static numbers (removed the animated JS counters), icon highlight blocks, full typography/color/spacing/button controls.
- **Curated Collections** (`luxury-collection-showcase`): collection card blocks with desktop/mobile image, badge, index numbering, per-section card styling (border/radius/shadow/align/ratios) and grid controls for desktop/tablet/mobile.
- **Brand Statement** (`brand-manifesto`): modular social icon blocks (platform icons or uploaded images) with shape/color/size controls; typography and color scheme controls.
- **Icon Feature Cards** (`luxury-assurance-icons`, new): per-card icon (16 built-in SVGs or upload), optional card image with mobile variant, badge, link, per-card style and visibility overrides.
- **No motion by default**: every LUXP section opts out of `art-motion.js` via `data-art-motion="off"` and neutralizes the theme-wide link transition. An optional per-section "Enable subtle motion" toggle (default off) gates all hover/transition effects behind `.luxp-anim`.
- Fixed schema validation against Shopify's upload rules: letter-spacing ranges converted to selects, line-height steps to 0.1, small column/border ranges to selects, mobile padding ranges to even steps, removed UTF-8 BOMs introduced by a PowerShell pass.
- Validated with `shopify theme check`: 0 errors; 5 `ExcessiveSettingsCount` advisories on the four rebuilt sections (merchant-requested control density, same advisory class as the existing header section).
- Browser-checked the product page at 1440/1280/1024/834/768/430/414/393/390: no horizontal overflow, no out-of-viewport elements, no broken images, no clipped text, badge positioned inside the media box, grid columns stepping 3→2→1 (collections) and 4→2→2 (assurance), mobile heading size override active, zero transitions/animations inside LUXP sections.
- Home, collections, and a second product page render clean after the stylesheet registration change; add-to-cart, variants, and native sections untouched.


## Validation

- Shopify CLI 4.8.0 `shopify theme check`: **0 errors, 1 advisory warning**.
- The original 9 warnings were resolved. The newer checker also identified nested LiquidDoc parameter warnings, which were resolved.
- Shopify Liquid skill validator: all 20 changed theme files passed.
- JavaScript syntax: all 83 asset scripts passed `node --check`.
- Runtime regression tests: 4 passed, covering duplicate initialization/submission, rejected cart additions, refresh failures after successful additions, and invalid/blocked browser storage.
- `git diff --check`: passed.

Run the regression tests with:

```powershell
node --experimental-vm-modules --test tests/storefront-runtime.test.mjs
```

## Fixes

- Fixed the desktop grid rules that prevented the mobile footer from stacking. Footer accordions now hide collapsed links from keyboard navigation, retain consistent state across resizing, and allow full content height.
- Mobile search opens the existing predictive search dialog. Desktop search still submits a normal search.
- Mobile navigation uses the configured menu, including child links, instead of hardcoded links all pointing to the catalog.
- Improved narrow-screen heading spacing, menu touch targets, and drawer height with mobile browser controls.
- Custom Quick Add uses the theme's standard cart event and bundled cart sections. It prevents repeat submissions, handles Shopify rejection responses, and preserves locale-aware routes.
- Prevented duplicate event handlers and slider timers during theme-editor section reloads; unload clears slider timers and resize listeners.
- Hidden hero slides no longer receive keyboard focus. Reduced-motion preferences are respected by custom animations and scrolling.
- Stale recently viewed product IDs are skipped instead of generating an empty product card and invalid Liquid event payload. Invalid or unavailable browser storage no longer breaks initialization.
- Added newsletter input labels and server-side form error feedback.
- Fixed unused Liquid assignments, documented search parameters, and used the locale-aware collection route in the footer.

## Browser checks

Checked the actual Shopify preview at `http://127.0.0.1:9292`.

| Page | Widths checked (CSS pixels) | Result |
| --- | --- | --- |
| Home | 320, 375, 768, 1024, 1440 | No document overflow; footer changes from one column to three; no broken home images |
| Catalog | 375, 1440 | Layout renders without Liquid errors |
| Product | 320, 375, 768, 1440 | No document overflow or Liquid errors |
| Contact | 375, 1440 | No document overflow or Liquid errors |
| About | 375, 1440 | No document overflow or Liquid errors |
| Cart | 375, 1440 | No document overflow or Liquid errors |
| Search results | 375, 1440 | Search submission and results render correctly |

Verified mobile menu links, predictive search, footer toggling, and product add-to-cart. The cart count updated to one, the drawer showed the item, and removal restored the empty cart. The test item was removed; checkout was not submitted. Custom Quick Add's success and failure paths were tested with mocked Shopify responses because that custom section is not on the current homepage.

## Remaining advisories and store data

- `sections/header.liquid`: `ExcessiveSettingsCount` reports 45 settings against the new checker's recommended maximum of 40. These are existing merchant controls. They were preserved, and the check was not disabled or relaxed. This is a maintainability advisory, not a Liquid or schema error.
- Shopify's hosted account component logs that `customer-account-main-menu` cannot be found through the Storefront API, then uses its default menu. The configured Liquid menu has links, so this needs store-side menu/API availability review. [Shopify account menu configuration](https://shopify.dev/docs/storefronts/themes/customer-engagement/account-component).
- Several catalog products render image placeholders, and some have zero prices. The cart also displays a `Rs.` amount followed by `AUD`; the theme uses Shopify's money filters. Product media/prices and the store's currency formatting need review in Shopify before launch.

Browser checks cover the sampled pages and sizes in the preview, not every product, installed app, browser, or checkout configuration.

## Expanded section and responsiveness audit

- Rendered 29 custom sections using their schema defaults and first presets in three temporary alternate home templates. Checked every fixture at 320, 768, and 1440 CSS pixels: no document overflow, clipped text, broken loaded images, or Liquid errors. Temporary templates were removed after testing.
- Checked home, catalog, collection listing, about, contact, empty cart, search, news, product with real media, and the 404 template at 320, 750, 990, and 1440 pixels. The obsolete wishlist destination was also checked and returned 404. Native Quick Add buttons intentionally clip their label until hover/focus; that is the theme's collapsed-button design.
- Fixed four editorial carousels: accessible button controls, larger hit areas, correct scroll offsets and end indicators, scroll padding, reduced-motion behavior, and initialization after theme-editor reloads. Verified each final slide and its active indicator on mobile.
- Image-only hero slides now retain their full image proportions, preventing embedded banner text from being cropped. Banners with separate HTML headings retain their configured hero height. Text baked into wide artwork remains small on phones; dedicated mobile artwork would improve legibility.
- Room hotspot buttons now support keyboard activation, Escape dismissal, and expanded-state announcements. All four popovers stayed inside the image at 320, 768, and 1440 pixels (12 checks).
- Newsletter forms have unique IDs, including pages with both VIP and footer forms; VIP messages and trust notes can wrap, and the email field has an accessible name. No duplicate IDs were found in the custom fixture or sampled product page.
- Removed the automatic broken wishlist destination: the header icon appears when a merchant configures a URL or an actual wishlist page exists.
- Verified product image pagination, lazy-loaded recommendations finishing, mobile drawer fit, product tabs showing one panel, and review-slider movement.

Additional limits: News currently has no visible articles, so article detail was not browser-tested. Gift-card and locked-password screens were statically validated only. Newsletter/contact submissions were not sent; Shopify hCaptcha reported a browser/network restriction during input interaction. Product Arq Cabinet displays an option named and valued "Default Title", which needs catalog cleanup. Account API menu fallback and product/currency data issues listed above remain. No live publication or checkout was performed.

## Unified art-store button system

- Centralized the button design in `assets/art-buttons.css`, loaded through the shared stylesheet snippet. The reusable classes are `art-button`, `art-button--secondary`, and `art-link`.
- Primary actions use charcoal and warm ivory; secondary actions use a fine outline; editorial links use a consistent underline. Dark image sections use inverse ivory variants.
- Shared 48px minimum button height, 2px corners, 11px medium-weight typography, 0.12em letter spacing, consistent padding, no raised shadows or hover jumps. Long labels can wrap instead of clipping. Editorial links retain a 44px touch area.
- Standardized product/sticky purchase actions, unbranded Buy it now, cart checkout/discount/empty-state actions, search results action, contact/newsletter/comment/password forms, gift-card actions, and custom editorial/about sections. Shopify wallet buttons keep their provider branding and use the supported height/radius properties.
- Added consistent hover, keyboard focus, disabled, and loading appearances. Sticky mobile add-to-cart keeps its compact icon while preserving an accessible text label.
- Browser-checked eight routes at 320, 768, and 1440 pixels, plus seven optional section presets at those widths. No clipped button labels or document overflow. Confirmed add-to-cart and removal; the test cart was restored to empty. Form submissions and checkout were not sent.
- Theme Check: zero errors, one existing header-settings-count advisory. All 30 changed theme files passed the Shopify skill validator; whitespace checks passed.
- Hero banners contain some button graphics baked into the artwork. Those pixels remain unchanged and do not inherit CSS; the actual HTML controls now share the button system. Changes were not published to the live theme.

## Collection card cleanup

- Removed Quick Add rendering and its card behavior flag on collection templates.
- Aligned full-width titles and price rows, removed the legacy title clamp on collection cards, and normalized spacing and responsive typography.
- Collection prices use the rupee symbol when the active currency is INR, including compare-at, range, and unit prices; numeric amounts and other currencies are preserved.
- Standard product cards without media show a neutral No image placeholder, with translations in all 31 storefront locales and accessible product links.
- Browser checks at 320, 768, 1280, and 1440 pixels confirmed aligned title/price rows, mobile wrapping, no horizontal overflow, no collection Quick Add, and intact cards with real images.
- All 36 changed Liquid/locale files passed the skill validator. Theme Check: zero errors, one existing header settings-count warning. Targeted whitespace checks passed. Changes are in the development theme, not published live.

## Minimal overlay mini cart

- Cart now opts into modal overlay mode on all viewport widths, with a dimmed backdrop and no page-wrapper squeeze. Existing saved sidebar state no longer restores the cart after navigation.
- Added a 460px desktop drawer and full-width phone layout, warm neutral surfaces, simpler close/count controls, neat product rows, missing-image placeholders, and a separated checkout summary using the shared button system.
- Removed duplicate unit/line price display for a single undiscounted item. Cart amounts use the rupee symbol for INR; other currencies keep their existing formatting settings.
- Summary adapts when the viewport is resized, allowing the entire content area to scroll on short screens.
- Browser-verified empty and populated states, unchanged page width, modal/scroll-lock behavior, Escape/focus restoration, backdrop and close-button dismissal, stock-limit messaging, and removal back to empty. Checked 320px, 768px (400px height), 1280px, and 1440px widths. Test cart restored to empty; checkout was not submitted.
- Seven changed theme files passed the Shopify validator. JavaScript syntax and targeted whitespace checks passed. Theme Check: zero errors, one existing header settings-count advisory. Not published live.

## Header icon clipping

- Matched the header action hit areas to their 44px cart icon container, allowed visible overflow, moved the count badge inside that area, and removed the SVG cutout mask and hover scaling.
- Verified the populated cart badge and complete bag icon at 320, 768, and 1280 pixels; no clipping ancestors or horizontal page overflow on the narrow mobile layout. Temporary test item removed afterward.
- Updated CSS passed the Shopify validator and targeted whitespace check. Development theme only.

## Restrained scroll and button motion

- Added one-time 700ms blur-to-clear reveals for below-fold editorial headings, and 420ms fades for editorial actions. Product information, cart controls, dialogs, and header actions are excluded from scroll reveals; above-fold content stays immediately readable.
- Buttons now lift by 2px on fine-pointer hover and compress gently on press; editorial underlines move subtly. Existing native smooth anchor scrolling remains enabled.
- Animations leave no persistent hidden/blurred state, stop for keyboard focus or reduced-motion preference changes, and initialize for dynamically inserted content and theme-editor sections.
- Browser verified the active blur effect and final clear state at 320px, desktop home and about layouts without overflow, and reduced-motion emulation (clear text, zero button transition duration, immediate scrolling). Emulation and viewport overrides reset.
- Focused runtime checks passed for offscreen eligibility, above-fold/product exclusions, keyframes, one-time behavior, and reduced-motion cancellation. JavaScript syntax, Shopify validation of three changed files, and targeted whitespace checks passed. Theme Check: zero errors, one existing header settings-count warning. Not published live.
