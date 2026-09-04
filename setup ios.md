# ساخت خروجی iOS

خروجی iOS این پروژه با **Capacitor** ساخته می‌شود. ساخت و امضای نهایی برنامه فقط روی **macOS** و با **Xcode** ممکن است؛ از Windows نمی‌توان فایل IPA نهایی تولید کرد.

## پیش‌نیاز

روی Mac این موارد را نصب کنید:

- Xcode از App Store
- Node.js و npm
- حساب Apple Developer برای نصب روی دستگاه واقعی یا انتشار در App Store
- CocoaPods در صورت نیاز Xcode/Capacitor

سپس در ریشه پروژه اجرا کنید:

```bash
npm install
npm install @capacitor/ios@^6.2.1
npm run build
npx cap add ios
npx cap sync ios
```

`npx cap add ios` فقط بار اول لازم است. در دفعات بعد، بعد از تغییر کد کافی است این دستورها را اجرا کنید:

```bash
npm run build
npx cap sync ios
```

## اجرای برنامه در Xcode

```bash
npx cap open ios
```

در Xcode:

1. پروژه را با فایل `App.xcworkspace` باز کنید، نه `App.xcodeproj`.
2. از بخش **Signing & Capabilities** یک **Team** انتخاب کنید.
3. Bundle Identifier را روی `com.zeitoon.app` نگه دارید، مگر اینکه در Apple Developer شناسه دیگری ساخته باشید.
4. یک Simulator یا دستگاه واقعی را انتخاب کنید.
5. از منوی **Product > Run** اجرا کنید.

برای نوتیفیکیشن‌ها، اولین بار که برنامه درخواست اجازه کرد، گزینه **Allow** را انتخاب کنید.

## گرفتن خروجی برای انتشار

در Xcode:

1. مقصد build را روی **Any iOS Device (arm64)** بگذارید.
2. از منوی **Product > Archive** استفاده کنید.
3. در پنجره Organizer، گزینه **Distribute App** را بزنید.
4. برای تست روی دستگاه، **Development** یا **Ad Hoc** و برای App Store، گزینه **App Store Connect** را انتخاب کنید.
5. در پایان Xcode فایل Archive یا IPA را خروجی می‌دهد.

## افزایش نسخه

نسخه وب در `package.json` قرار دارد، اما برای انتشار iOS باید نسخه native را هم در Xcode بررسی کنید:

- **Marketing Version**: نسخه قابل نمایش برای کاربر، مانند `1.0.1`
- **Current Project Version**: شماره build که برای هر خروجی جدید باید افزایش پیدا کند، مانند `2`، `3` و ...

برای هر انتشار جدید، حداقل **Current Project Version** را افزایش دهید. Bundle Identifier و signing certificate را برای آپدیت همان برنامه تغییر ندهید.

## خروجی تست سریع

برای اجرای مستقیم روی Simulator یا دستگاه متصل:

```bash
npx cap run ios
```

این دستور جایگزین Archive برای انتشار عمومی نیست.
