

## Plan: Enhanced Daily Challenge + Desktop App Ad

### 1. Database: Leaderboard Table

Create a `challenge_scores` table for signed-in users:
- `id` (uuid, PK), `user_id` (uuid, NOT NULL), `score` (integer), `challenge_type` (text), `challenge_date` (date), `created_at` (timestamptz)
- RLS: users can INSERT/SELECT their own rows; everyone can SELECT for leaderboard reads
- Add a database function `get_leaderboard()` that returns top scores with display names from profiles

### 2. Enhanced Daily Challenge Component

Rewrite `src/components/DailyChallenge.tsx` to support 3 challenge types rotating daily (based on seed):

- **Multiple Choice** (existing, cleaned up): "What does X mean?" with 4 options
- **Fill-in-the-Blank**: Show English sentence, user types the Darija word. Input field with submit button.
- **Listening Comprehension**: Play a Darija word via SpeechSynthesis, user picks the correct English meaning from 4 options. Speaker icon to replay.

Each correct answer awards points (10 for MC, 15 for fill-in-blank, 20 for listening). Score saved to `challenge_scores` for authenticated users. Keep streak system as-is.

Add a **Leaderboard tab** within the challenge card showing top 10 users (display_name + score) fetched from the database. Only visible to signed-in users.

### 3. Desktop App Ad Section

Split the current Sahbi landing section area on the homepage into a **two-column grid**:
- **Left column**: Sahbi landing section (existing, slightly narrower)
- **Right column**: New `DesktopAppPromo` component

The `DesktopAppPromo` component will be a Card matching Sahbi's style with:
- Desktop/Monitor icon
- "Get Tarjama Desktop" title
- Brief description: "Translate Darija right from your desktop"
- Download button linking to `https://github.com/Hamza-x12/trajama/releases/download/Tarjama/Tarjama_v1.2.1_setup.exe`
- "Windows" badge
- Similar gradient/styling to the Sahbi card

Update `src/pages/Index.tsx` to wrap both sections in a 2-column grid (`grid-cols-1 lg:grid-cols-2`).

Also add the promo to the About page alongside the existing Sahbi section.

### 4. i18n Keys

Add new keys to all 6 locale files for:
- Challenge types: `dailyChallenge.fillInBlank`, `dailyChallenge.listeningChallenge`, `dailyChallenge.typeAnswer`, `dailyChallenge.listen`, `dailyChallenge.replay`, `dailyChallenge.leaderboard`, `dailyChallenge.topPlayers`, `dailyChallenge.points`
- Desktop app: `desktopApp.title`, `desktopApp.subtitle`, `desktopApp.download`, `desktopApp.windowsOnly`

### Files to Create/Edit

| File | Action |
|------|--------|
| DB migration | Create `challenge_scores` table + RLS + `get_leaderboard` function |
| `src/components/DailyChallenge.tsx` | Rewrite with 3 challenge types + leaderboard |
| `src/components/DesktopAppPromo.tsx` | New component for desktop download ad |
| `src/pages/Index.tsx` | Split Sahbi section into 2-col grid with desktop promo |
| `src/pages/About.tsx` | Add desktop promo alongside Sahbi section |
| `src/i18n/locales/*.json` (6 files) | Add new i18n keys |

