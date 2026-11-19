#!/usr/bin/env bash
set -eu
adb install /tmp/bora-qa/v43.apk
adb shell am start -n br.bora.civic43/.MainActivity
node tests/android-webview.cjs legacy
adb install -r /tmp/bora-qa/v50.apk
adb shell am start -n br.bora.civic43/.MainActivity
node tests/android-webview.cjs upgrade
