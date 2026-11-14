# Bora · Civic Edition 🇧🇷

Offline Android app for learning Brazilian Portuguese, with a dark green Honda Civic and Rio sunset artwork.

- 300 unique verbs: infinitive, present-tense eu form, Russian meaning and pronunciation hints for both forms.
- 240 nouns in 24 topics, with gender articles and Russian pronunciation hints.
- Translation quizzes, eu-form choice questions, typed eu exercises, and flashcards.
- Distinct correct/incorrect answer sounds with a mute switch.
- Incorrect answers return during the same session; progress, XP, streaks and spaced review are saved locally.
- Progress JSON export and import.
- Russian pronunciation is approximate; nasal vowels use a tilde and uppercase syllables mark stress.

## Source

The complete app, curriculum and illustration are self-contained in `www/index.html`. The root `index.html` opens that app. Existing BRASILEIRO source archives are historical.

## Android

GitHub Actions builds `Bora-Civic-v3.apk` and a source ZIP after pushes to main. The workflow creates Android launcher and splash assets from the embedded Civic illustration. Android package: `br.bora.civic`; name: Bora. This is separate from older BRASILEIRO and Bora packages; their local data is not modified.

This is a debug build. No cloud sync or word speech synthesis is included. Answer sounds are generated offline with Web Audio.
