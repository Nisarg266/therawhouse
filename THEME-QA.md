# Theme audit — 16 September 2026

Changes are in the local theme and its existing development preview. The live theme was not published.

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
