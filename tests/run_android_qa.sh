#!/usr/bin/env bash
set -eu
adb install /tmp/bora-qa/v43.apk
adb shell am start -n br.bora.civic43/.MainActivity
node tests/android-webview.cjs legacy
adb shell input keyevent KEYCODE_HOME
sleep 7
adb shell am force-stop br.bora.civic43
adb shell am start -n br.bora.civic43/.MainActivity
node tests/android-webview.cjs reopen
adb shell input keyevent KEYCODE_HOME
sleep 2
adb install -r /tmp/bora-qa/v50.apk
adb shell am start -n br.bora.civic43/.MainActivity
node tests/android-webview.cjs legacy50
adb shell input keyevent KEYCODE_HOME
sleep 7
adb shell am force-stop br.bora.civic43
adb install -r /tmp/bora-qa/v51.apk
adb shell am start -n br.bora.civic43/.MainActivity
node tests/android-webview.cjs upgrade
