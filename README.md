# BRASILEIRO 🇧🇷

Android-first app for learning Brazilian Portuguese, built with HTML/CSS/JavaScript and Capacitor.

## Features
- Flashcards with spaced repetition (Again / Hard / Good / Easy)
- Vocabulary search and topic filters
- Grammar lessons, conjugation practice, slang and quizzes
- Personal cards and JSON backup export
- Brazilian Portuguese speech synthesis using the device's `pt-BR` voice when available
- PWA manifest and offline cache

## Build an Android APK
GitHub Actions builds a debug APK on pushes to `main` or `master`. You can also start it manually from **Actions → Build Android APK → Run workflow**. Download the `BRASILEIRO-debug-apk` artifact when the run succeeds.

See [BUILD-ANDROID.md](BUILD-ANDROID.md) for local build instructions.

## Notes
Learning progress and custom cards are stored locally on the device. Cloud sync/account support is not implemented yet. This is a learning prototype; speech quality depends on the installed device voice.
