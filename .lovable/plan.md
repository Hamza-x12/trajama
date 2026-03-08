

# Dictionary-Based Offline Translation

## Summary
Replace the HuggingFace model-based offline translation with a lightweight JSON dictionary lookup system. Each language gets a small JSON file (~50-200KB) bundled in the app. Users are warned that offline translation is basic word/phrase matching, not full AI-powered sentence translation.

## What Changes

### 1. Create dictionary JSON files per language
Create `src/data/offline-dictionaries/` with JSON files for each supported language pair (e.g., `en-ar.json`, `en-fr.json`, `dar-en.json`, etc.). Each file contains word and phrase mappings extracted from the existing Dictionary page entries, plus additional common words/phrases. Structure:
```json
{
  "hello": "مرحبا",
  "thank you": "شكرا",
  "how are you": "كيف حالك",
  ...
}
```

The Darija dictionaries will be the richest since we already have ~200+ entries in Dictionary.tsx. Other language pairs will have common travel/essential phrases.

### 2. Rewrite `src/utils/localTranslation.ts`
- Remove all HuggingFace/Transformers.js imports and pipeline logic
- Replace with simple dictionary lookup: split input into words/phrases, match against the JSON dictionary, return matches
- For unmatched words, return them as-is (pass-through)
- Implement a basic phrase-first matching strategy (try longest phrases first, then individual words)

### 3. Simplify `src/hooks/useOfflineLanguages.ts`
- Remove all download/progress/abort logic (no more model downloads)
- Languages are always "available" since dictionaries are bundled
- Keep the toggle for users to select which languages they want visible in offline mode
- Remove size indicators or set them to "< 1 MB"

### 4. Update `src/components/OfflineScreen.tsx`
- Remove model progress bar UI (no downloads needed)
- Add a prominent warning banner: "Offline mode uses basic word/phrase lookup. For accurate translations, reconnect to the internet."
- Keep the existing translate UI but simplify it

### 5. Update Settings offline section
- Remove download/pause/resume buttons (no downloads needed)
- Show languages as toggleable (enable/disable for offline visibility)
- Update description text to explain dictionary-based limitations

### 6. Update all locale files (EN, FR, AR, DAR, RU, AMA)
- Add warning text keys: `offline.limitedWarning`, `offline.dictionaryMode`
- Update `offline.description` to reflect dictionary-based approach
- Remove download-related strings that are no longer needed

### 7. Remove HuggingFace dependency
- Remove `@huggingface/transformers` from `package.json`
- Clean up any PWA/service-worker workarounds added for HuggingFace

## Technical Details

**Dictionary matching algorithm:**
1. Normalize input (lowercase, trim)
2. Try to match full input as a phrase
3. If no match, use sliding window from longest to shortest substrings
4. Fall back to word-by-word lookup
5. Unmatched tokens pass through unchanged

**Dictionary sources:** The existing 200+ Darija entries from Dictionary.tsx will seed `dar-en.json` and `dar-fr.json`. For other languages, we'll include ~300-500 common words/phrases covering greetings, numbers, food, travel, emergencies, and daily essentials.

