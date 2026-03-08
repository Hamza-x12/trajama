

# TARJAMA Chrome Extension

Since this is a **browser extension** (not a web app feature), I'll generate standalone extension files that you can load into Chrome/Chromium. The extension will NOT be part of the Lovable project codebase — I'll create the files in a `chrome-extension/` folder for you to download and use separately.

## What It Includes

1. **`manifest.json`** — Manifest V3 config with permissions for `activeTab`, `contextMenus`, and `storage`
2. **`popup.html` + `popup.css` + `popup.js`** — Translation popup UI matching TARJAMA's Moroccan-inspired theme (terracotta, deep blue, gold palette), with the TARJAMA logo
3. **`content.js` + `content.css`** — Content script that detects text selection and shows a floating "Translate" button above the selection; clicking it opens a small inline translation panel
4. **`background.js`** — Service worker to handle context menu "Translate with TARJAMA" option

## Popup UI
- Source language selector (with "Detect Language" option) and target language selector
- Text input area and translated output area
- Swap languages button
- Copy translation button
- Calls the deployed TARJAMA edge function (`translate-darija`) for translations
- Styled with the app's warm terracotta/gold/blue theme and the TARJAMA logo (`src/assets/tarjama-logo.png` copied into the extension)

## Selection Translation Feature
- When text is selected on any page, a small floating button appears near the selection
- Clicking it calls the translation API and shows the result in an inline tooltip/panel
- Panel matches the TARJAMA theme
- Button disappears when selection is cleared

## Theme Matching
- Same HSL color tokens: primary terracotta `hsl(12, 76%, 61%)`, deep blue `hsl(210, 50%, 40%)`, gold `hsl(45, 85%, 70%)`
- Warm gradient backgrounds, rounded corners (`0.75rem`), clean typography
- Dark mode support via `prefers-color-scheme`

## File Structure
```text
chrome-extension/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── content.js
├── content.css
├── background.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Notes
- The extension calls your live edge function at `https://zvvvsurmgfnankspkibu.supabase.co/functions/v1/translate-darija` using the anon key
- You'll need to copy/resize the TARJAMA logo into the `icons/` folder for the extension icons
- To install: go to `chrome://extensions`, enable Developer Mode, click "Load unpacked", and select the `chrome-extension/` folder

