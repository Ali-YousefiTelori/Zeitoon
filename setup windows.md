برای ساخت نسخه ویندوز و فایل نصب، از **Vite** برای بیلد وب‌اپ و از **electron-builder** برای ساخت ستاپ NSIS استفاده می‌شود.

## پیش‌نیاز
در پوشه پروژه:

```bash
npm install
```

## یک دستور (ساده‌ترین راه)

```bash
npm run electron-pack
```

این کار دو مرحله را پشت سر هم انجام می‌دهد:

1. `npm run build` → TypeScript + Vite، خروجی در پوشه `build/`
2. `electron-builder` → بسته‌بندی Electron و ساخت نصب‌کننده ویندوز

## یا دو مرحله جدا

اگر وب‌اپ از قبل بیلد شده:

```bash
npm run build
npx electron-builder --win
```

`--win` یعنی فقط هدف ویندوز.

## خروجی کجاست؟

بعد از موفقیت:

| فایل | مسیر |
|---|---|
| نصب‌کننده | `dist\reactive-bible Setup 0.0.0.exe` |
| نسخه بدون نصب (portable) | `dist\win-unpacked\` |

روی همان `.exe` دوبار کلیک کنید تا نصب شود.

## تنظیمات مرتبط در `package.json`

- `"main": "main.js"` — نقطه ورود Electron
- اسکریپت `electron-pack`: `npm run build && electron-builder`
- بخش `build.win.target`: `"nsis"` (ستاپ ویندوز)
- آیکون: `public/icon.png`
- فایل‌های داخل پکیج: `build/**/*`، `main.js`، `preload.js`

**نکته:** در Electron باید `vite.config.ts` مقدار `base: "./"` داشته باشد تا مسیرها با `file://` درست کار کنند، و روتینگ با `HashRouter` باشد (نه `BrowserRouter`).