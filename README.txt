FOOD SUPPLY MANAGEMENT — UPDATED BUILD

What's updated:
- Removed Form and Correction from the visible Data Entry Mode options.
- Quick Qty buttons now include 0.1, 0.3, 0.5, 1, 2, 5, 10, 20, 50 and 100, plus Search.
- Removed the Current Rate preview strip from the item selector.
- Improved alignment and responsive sizing of Category, Item, Quantity and Add button.
- Added saved theme presets (Soft, Ocean, Rose, Midnight, Aurora), background style (Gradient, Solid, Aurora Glow), landing page style (Modern Cards, Glass Premium, Clean Professional, Aurora), custom accent colour, and separate/same portal theme scope.
- Tightened Master Settings spacing for mobile and desktop.
- Retained the original data and report logic in app.js/rates.js.

How to run:
1. Keep all files and the icons folder together.
2. Open index.html in a modern browser. For best PWA/service-worker behavior, serve this folder from a local web server/hosting rather than file://.
3. The app uses browser localStorage for its data. Export a JSON backup before changing browsers/devices or clearing browser storage.

Notes:
- Tailwind CSS, html2pdf.js, and SheetJS are loaded from CDNs, so those features need internet access when the libraries are not already cached.
- The JavaScript syntax and HTML parsing were checked. The app has not been run through a full interactive browser automation test in this environment.


THEME SYSTEM FIX (v2)
- Theme presets now update the app-wide accent, page background, card/panel surfaces, borders, primary buttons, form controls, table headers/rows, modal surfaces and focus states.
- Light, Dark and Auto appearance affect the full application interface. Auto follows the operating system's color-scheme setting.
- Selecting a new preset resets the background style to that preset's default so an earlier Aurora background cannot mask subsequent theme changes.
- Custom Accent Color remains an app-wide accent override until the next preset selection, which restores the chosen preset accent.
- Service worker cache was bumped to v2 so browsers/PWA installs can fetch the updated CSS and JavaScript.

LANDING PAGE DESIGN SELECTOR (v3)
- Master Settings > Appearance & Theme now has visual landing-page design previews as well as the selector.
- Eight designs are available: Modern Cards, Glass Premium, Clean Professional, Aurora Glow, Editorial Split, Compact Tiles, Bold Gradient and Horizontal Workspace.
- Selecting a design applies it immediately and saves it in browser localStorage; close Master Settings to inspect the landing page.
- Service worker cache was bumped to v3 to help installed PWA users receive the updated landing layout and CSS.
- Static HTML parsing and JavaScript syntax checks passed; full interactive browser testing was not performed.

OFFICE REPORTS & MASTER SETTINGS UPDATE (12 Oct 2026)
- Excel reports now export an Executive Summary, item-wise/monthly sheet, and a Daily Details transaction register.
- Workbook formatting includes styled headers, alternating rows, totals, filters, frozen headers/columns, number formats, and print layout.
- PDF tables use fixed column widths, wrapped item names, landscape pages for Combined reports, and maximum 3 decimal places for quantities / 2 for currency values.
- Master Settings has separate category navigation for Visual Appearance, Rates & Item Catalog, Budget, and Backup & Restore.
- Service worker cache version has been bumped to refresh updated app files.
- Excel export styling uses the xlsx-js-style CDN; internet access is required to load that library.


Update 2026-10-12: Master Settings now uses separate category views (All Settings removed); two additional landing page layouts; portal-specific accents in Separate portal colours mode; Combined monthly expense and remaining budget cards; weekday labels in date selectors; structured item selection preview.
