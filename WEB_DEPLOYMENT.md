# راهنمای گرفتن خروجی و انتشار نسخه وب زیتون

این پروژه با Vite ساخته می‌شود. خروجی نهایی وب در پوشه `build` قرار می‌گیرد و می‌توان آن را روی هر هاست استاتیک منتشر کرد.

## پیش‌نیازها

- نصب بودن Node.js نسخه 18 یا جدیدتر
- دسترسی اینترنت برای نصب وابستگی‌ها
- یک هاست با HTTPS؛ برای PWA و نصب روی iPhone، HTTPS ضروری است

## 1. نصب وابستگی‌ها

در ریشه پروژه، جایی که `package.json` قرار دارد، اجرا کنید:

```bash
npm install
```

## 2. گرفتن خروجی production

```bash
npm run build
```

این دستور TypeScript را بررسی می‌کند و سپس Vite خروجی را در پوشه `build` می‌سازد.

فایل‌های مهم خروجی عبارت‌اند از:

- `build/index.html`
- `build/assets/`
- `build/manifest.webmanifest`
- `build/sw.js`
- `build/icon.png`

پوشه `build` همان پوشه‌ای است که باید روی هاست آپلود یا deploy شود. کل سورس پروژه برای اجرای نسخه وب روی هاست لازم نیست.

## 3. تست خروجی روی کامپیوتر

بعد از build، نسخه production را با این دستور اجرا کنید:

```bash
npm run preview
```

سپس آدرسی را که Vite نمایش می‌دهد، در مرورگر باز کنید. برای بررسی نصب PWA، DevTools مرورگر و بخش Application را بررسی کنید.

## 4. انتشار روی GitHub Pages

این پروژه اسکریپت آماده انتشار دارد:

```bash
npm run deploy
```

این دستور ابتدا `npm run build` را اجرا می‌کند و سپس پوشه `build` را روی branch مربوط به GitHub Pages می‌فرستد. گزینه `--no-history` هر انتشار را به‌صورت مستقل روی `gh-pages` ثبت می‌کند.

### راه‌اندازی repository

اگر هنوز پروژه را در GitHub نساخته‌اید:

1. در GitHub یک repository جدید بسازید؛ برای مثال `Zeitoon`.
2. آدرس repository را از GitHub کپی کنید.
3. در PowerShell و در ریشه پروژه اجرا کنید:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

`USERNAME` و `REPOSITORY` را با نام حساب و repository خودتان جایگزین کنید. اگر پروژه از قبل به GitHub متصل است، این مرحله لازم نیست.

### انتشار و تنظیم Pages

قبل از اجرای deploy، مطمئن شوید `origin` به repository درست اشاره می‌کند:

```bash
git remote -v
```

سپس اجرا کنید:

```bash
npm run deploy
```

این دستور ابتدا `npm run build` را اجرا می‌کند و سپس پوشه `build` را در branch به نام `gh-pages` منتشر می‌کند.

اگر در صفحه Pages پیام زیر را می‌بینید، نگران نباشید:

```text
GitHub Pages is currently disabled.
```

این پیام یعنی هنوز branch قابل انتشار به GitHub معرفی نشده است. ابتدا باید دستور `npm run deploy` با موفقیت اجرا شود تا branch `gh-pages` ساخته و push شود. بعد صفحه Pages را refresh کنید.

بعد در GitHub:

1. وارد repository شوید.
2. به مسیر `Settings`، سپس `Pages` بروید.
3. در بخش `Build and deployment`، گزینه `Deploy from a branch` را انتخاب کنید.
4. branch را روی `gh-pages` و پوشه را روی `/ (root)` بگذارید.
5. روی `Save` کلیک کنید.
6. چند لحظه صبر کنید تا GitHub آدرس سایت را نمایش دهد.

اگر branch `gh-pages` در فهرست دیده نمی‌شود:

1. در PowerShell بررسی کنید که deploy خطا نداده باشد.
2. در صفحه repository به بخش `Branches` بروید و وجود branch `gh-pages` را بررسی کنید.
3. اگر branch وجود ندارد، دوباره `npm run deploy` را اجرا کنید.
4. مطمئن شوید حساب GitHub شما اجازه push به repository را دارد و آدرس `origin` درست است.

آدرس سایت معمولاً به این شکل خواهد بود:

```text
https://USERNAME.github.io/REPOSITORY/
```

در این پروژه `base` روی مسیر نسبی تنظیم شده است، بنابراین انتشار در زیرمسیر GitHub Pages هم باید درست کار کند.

### آیا PWA روی GitHub Pages نصب می‌شود؟

بله. آدرس `github.io` با HTTPS ارائه می‌شود و این پروژه فایل‌های لازم PWA را داخل خروجی قرار می‌دهد:

```text
https://USERNAME.github.io/REPOSITORY/manifest.webmanifest
https://USERNAME.github.io/REPOSITORY/sw.js
```

بعد از انتشار، آدرس اصلی سایت را در Safari روی iPhone باز کنید و از منوی Share گزینه `Add to Home Screen` را بزنید. نام و آیکن «زیتون» باید در پنجره نصب نمایش داده شود.

اگر repository شما دقیقاً `Zeitoon` باشد، آدرس نمونه این است:

```text
https://USERNAME.github.io/Zeitoon/
```

GitHub Pages شرط HTTPS را به‌صورت پیش‌فرض فراهم می‌کند؛ بنابراین برای نصب PWA از این نظر مناسب است.

## 5. انتشار روی هاست معمولی

اگر هاست یا پنل مدیریت فایل دارید:

1. دستور `npm run build` را اجرا کنید.
2. محتویات داخل پوشه `build` را باز کنید.
3. همه‌ی محتویات آن را در ریشه‌ی دامنه یا پوشه‌ی موردنظر هاست آپلود کنید.
4. مطمئن شوید فایل‌های `manifest.webmanifest` و `sw.js` مستقیماً از همان مسیر قابل دسترسی هستند.
5. HTTPS را برای دامنه فعال کنید.

مثلاً اگر سایت در `https://example.com/app/` قرار می‌گیرد، این فایل‌ها باید قابل دسترسی باشند:

```text
https://example.com/app/manifest.webmanifest
https://example.com/app/sw.js
```

## 6. نصب روی iPhone

کاربر iPhone باید:

1. سایت را با Safari و از طریق HTTPS باز کند.
2. دکمه Share را بزند.
3. گزینه `Add to Home Screen` را انتخاب کند.
4. نام و آیکن را تأیید کند.

در iOS معمولاً دکمه نصب خودکار داخل صفحه نمایش داده نمی‌شود؛ نصب از منوی Share انجام می‌شود.

## عیب‌یابی سریع

### سایت باز می‌شود ولی نصب PWA نمایش داده نمی‌شود

- سایت باید با HTTPS باز شده باشد.
- حتماً از Safari استفاده کنید، نه مرورگر داخلی بعضی اپلیکیشن‌ها.
- آدرس `manifest.webmanifest` نباید خطای 404 بدهد.
- آدرس `sw.js` نباید خطای 404 بدهد.
- بعد از تغییر service worker، Safari ممکن است نسخه قبلی را cache کرده باشد؛ سایت را refresh کنید یا داده‌های سایت را پاک کنید.

### مسیرها یا assetها در GitHub Pages خراب هستند

- آدرس سایت را با مسیر کامل repository باز کنید.
- `npm run build` را دوباره اجرا کنید.
- پوشه `build` جدید را deploy کنید.

## چرخه انتشار پیشنهادی

هر بار که کد تغییر کرد:

```bash
npm install
npm run build
npm run preview
npm run deploy
```

در استفاده روزمره، اگر وابستگی‌ها تغییر نکرده‌اند، اجرای `npm install` لازم نیست و این کافی است:

```bash
npm run build
npm run deploy
```
