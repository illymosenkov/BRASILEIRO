# BORA Civic 5.1 для Android

Распространяемый APK использует ту же оболочку Capacitor, адрес WebView и applicationId br.bora.civic43, что и оригинальный выпуск 4.3. VersionCode повышен с 404 до 510. В полном архиве исходников файл base/Bora-Civic-v4.3.apk служит проверяемой зависимостью сборки.

## Повторить сборку выпуска

Нужны Python 3, JDK, Android SDK с android.jar, d8 и apksigner и оригинальный ключ выпуска для подписания обновления.

```bash
bash native/android/build_backup_dex.sh /path/to/android.jar /path/to/d8 backup.dex
python3 native/package_release.py base/Bora-Civic-v4.3.apk Bora-unsigned.apk backup.dex
apksigner sign --ks /private/path/bora-release.p12 --out Bora-Civic-v5.1.apk Bora-unsigned.apk
apksigner verify --verbose --print-certs Bora-Civic-v5.1.apk
python3 tests/package_check.py base/Bora-Civic-v4.3.apk Bora-Civic-v5.1.apk
```

SHA-256 сертификата 4.3 и 5.1 — `579a46bdefbdad54b03b801ec469c14c0d160c230a5d93c510cb8b33ea43b2fd`. Закрытый ключ подписи хранится отдельно от публичных исходников. Следующая сессия может работать и тестировать приложение из ветки или ZIP. Для очередного подписанного обновления потребуется доступ к тому же ключу.

## Проверки

```bash
npm install
npm test
node tests/backup.cjs base/Bora-Civic-v4.3.apk
```

tests/verify_forms.py принимает каталог из 50 словарных страниц INF.html с https://www.conjugacao.com.br/verbo-INF/ (в URL começar → comecar и pôr → por). Проверка сверяет лица и времена, включая написание ударений. tests/browser.cjs — дополнительный сценарий Playwright для среды с Chromium. Веточный workflow запускает Android QA на отдельном ключе и не публикует тестовый APK как пользовательское обновление.

Дополнительно проверь перенос состояния из настоящего релиза 5.0, включая прерванное занятие и повторный импорт.

```bash
node tests/upgrade50.cjs base/Bora-Civic-v5.0.apk
```

На эмуляторе API 34 workflow проверяет цепочку 4.3 → 5.0 → 5.1. Идентификатор пакета и web origin должны совпадать во всех сборках. Для распространения выпуска используй ключ с указанным выше отпечатком.
