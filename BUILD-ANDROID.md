# Android APK quick build

The included GitHub Actions workflow builds a debug APK on every push to `main`/`master` and can also be started manually from **Actions → Build Android APK → Run workflow**. Download the `BRASILEIRO-debug-apk` artifact after the run completes.

For a local build, install Node.js 22+, JDK 17, Android Studio and the Android SDK, then run:

```bash
npm install
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.
