# Bora v4 · Civic Edition 🇧🇷

Offline Brazilian Portuguese app with a green Civic mascot.

- 300 verbs organized into 18 themes, with lessons of up to 10 verbs.
- Infinitive and present-tense eu forms, Russian meanings and pronunciation hints.
- 240 nouns in 24 themes, with gender articles.
- 128 practical phrases in 16 situations: introductions, understanding, cafe, restaurant, shopping, payments, directions, transport, hotel, work, garage, driving, health, emergencies, friends and daily needs.
- Phrase flashcards, translation quizzes, eu exercises, error review, XP and local progress.
- Successful lessons trigger a Civic drive-by with spinning wheels, synchronized exhaust flames, engine sound and six synthesized backfire pops. Replay, mute, reduced-motion support and cancellation on navigation/backgrounding are included.

## Source and validation

The complete app, curriculum and two Civic illustrations are embedded in `www/index.html`. Run `node check.cjs` for learning, grouping, persistence and victory audio checks.

## Android

GitHub Actions builds `Bora-Civic-v4.apk` and the source ZIP. App name: Bora v4. Package: `br.bora.civic4`. It installs separately from v3 because the v3 test signing key was not retained. Existing app data is untouched; the export/import progress schema and word IDs remain compatible. A cached debug signing key is retained for subsequent builds of v4.

Debug build, no account or server. All app content and sounds work offline. Russian pronunciation hints are approximate. Backfire audio is synthesized with Web Audio.
