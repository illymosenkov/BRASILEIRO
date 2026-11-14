# Bora 4.2 · Civic Edition 🇧🇷

Offline Brazilian Portuguese app with a green Civic mascot.

- 300 verbs organized into 18 themes, with lessons of up to 10 verbs.
- Infinitive and present-tense eu forms, Russian meanings and pronunciation hints.
- 240 nouns in 24 themes, with gender articles.
- 128 practical phrases in 16 situations: introductions, understanding, cafe, restaurant, shopping, payments, directions, transport, hotel, work, garage, driving, health, emergencies, friends and daily needs.
- Phrase flashcards, translation quizzes, eu exercises, error review, XP and local progress.
- Successful lessons trigger a Civic drive-by with spinning wheels, synchronized exhaust flames, engine sound and the uploaded 3.95-second Civic recording and detected transient flashes. Replay, mute, reduced-motion support and cancellation on navigation/backgrounding are included.

## Source and validation

The complete app, curriculum and two Civic illustrations are embedded in `www/index.html`. Run `node check.cjs` for learning, grouping, persistence and victory audio checks.

## Android

GitHub Actions builds `Bora-Civic-v4.2.apk` and the source ZIP. App name: Bora 4.2. Package: `br.bora.civic41`. It installs separately from v4 because the previous debug key was not retained. Existing app data is untouched; the export/import progress schema and word IDs remain compatible. An explicit signing keystore is configured and cached for future builds of this edition.

Debug build, no account or server. All app content and sounds work offline. Russian pronunciation hints are approximate. The original uploaded AAC recording is embedded without modification; animation follows the Web Audio playback clock.
\nVictory timing: arrive at center by 1.3 s, hold and synchronize transient flames from 1.3 to 2.4 s, launch at 2.4 s, exit by 3.2 s. Package and signing key are preserved from 4.1.\n