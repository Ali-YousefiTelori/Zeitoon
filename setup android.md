برای ساخت APK اندروید ساین‌شده، وب‌اپ با **Vite** بیلد می‌شود و با **Capacitor** داخل یک پروژهٔ Android پیچیده می‌شود. خروجی با **Gradle** (`assembleRelease`) ساخته و با keystore پروژه امضا می‌شود.

## بالا بردن نسخه اندروید

نسخه اندروید در فایل `android\app\build.gradle` و داخل بخش `defaultConfig` تنظیم می‌شود:

```gradle
versionCode 1
versionName "1.0"
```

برای هر انتشار جدید، هر دو مقدار را تغییر دهید. `versionCode` باید یک عدد صحیح و همیشه بزرگ‌تر از نسخه قبلی باشد؛ این مقدار برای تشخیص آپدیت در اندروید و Google Play استفاده می‌شود. `versionName` همان نسخه‌ای است که کاربر می‌بیند.

مثال برای انتشار نسخه بعدی:

```gradle
versionCode 2
versionName "1.1"
```

در نسخه بعدی می‌توانید `versionCode 3` و مثلاً `versionName "1.2"` بگذارید. تغییر `versionName` به‌تنهایی کافی نیست. `applicationId` (`com.zeitoon.app`) و keystore را برای انتشار آپدیت تغییر ندهید.

مسیر واقعی SDK روی این سیستم: `E:\Android\android-sdk`  
JDK لازم برای بیلد (قابل حمل): `E:\Android\jdk-17`

## پیش‌نیاز (یک‌بار)

در PowerShell:

```powershell
$env:JAVA_HOME = "E:\Android\jdk-17"
$env:ANDROID_HOME = "E:\Android\android-sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

cd D:\Github\Zeitoon
npm install
```

اگر پوشهٔ `android` وجود ندارد:

```powershell
npm run build
npx cap add android
```

فایل `android\local.properties` باید این را داشته باشد:

```
sdk.dir=E:\\Android\\android-sdk
```

### Keystore (فقط بار اول، یا اگر فایل‌ها پاک شده‌اند)

بدون همین keystore نمی‌توانید آپدیت روی همان نصب قبلی بگذارید. فایل‌ها را جایی امن کپی کنید.

```powershell
$env:JAVA_HOME = "E:\Android\jdk-17"
& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v `
  -keystore android\app\zeitoon-release.keystore `
  -alias zeitoon -keyalg RSA -keysize 2048 -validity 10000 `
  -storepass ZeitoonRelease2026 -keypass ZeitoonRelease2026 `
  -dname "CN=Zeitoon, OU=Zeitoon, O=Zeitoon, L=Tehran, ST=Tehran, C=IR"
```

محتوای `android\keystore.properties`:

```
storeFile=app/zeitoon-release.keystore
storePassword=ZeitoonRelease2026
keyAlias=zeitoon
keyPassword=ZeitoonRelease2026
```

این دو فایل در git نیستند (`*.keystore` و `keystore.properties`).

## بیلد APK (هر بار)

از ریشهٔ پروژه، در PowerShell:

```powershell
$env:JAVA_HOME = "E:\Android\jdk-17"
$env:ANDROID_HOME = "E:\Android\android-sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

cd D:\Github\Zeitoon
npm run android:apk
```

اگر دستور با `BUILD SUCCESSFUL` تمام شد، فایل باید در مسیر زیر وجود داشته باشد. برای بررسی مستقیم در PowerShell:

```powershell
Get-Item .\android\app\build\outputs\apk\release\app-release.apk
```

اگر پیام `JAVA_HOME is set to an invalid directory` دیدید، APK ساخته نشده است؛ مقدار `JAVA_HOME` را طبق بخش پیش‌نیاز به مسیر JDK 17 تغییر دهید و دستور را دوباره اجرا کنید.

پس از بالا بردن `versionCode` و `versionName`، همین دستور را اجرا کنید؛ لازم نیست دستور دیگری برای نسخه جدید اضافه شود:

```powershell
npm run android:apk
```

این کار پشت سر هم انجام می‌شود:

1. `npm run build` → TypeScript + Vite، خروجی در `build/`
2. `npx cap sync android` → کپی وب‌اپ داخل پروژهٔ Android
3. `gradlew assembleRelease` → APK ساین‌شده

اگر وب‌اپ از قبل بیلد و sync شده:

```powershell
cd D:\Github\Zeitoon\android
.\gradlew.bat assembleRelease -I init.gradle
```

## خروجی کجاست؟

| فایل | مسیر |
|---|---|
| APK ساین‌شده | `android\app\build\outputs\apk\release\app-release.apk` |

همین فایل را به گوشی ببرید و نصب کنید. اگر نصب مسدود شد، در تنظیمات اندروید اجازهٔ نصب از منابع ناشناس را برای همان برنامهٔ فایل‌منیجر روشن کنید.

برای اطمینان از نسخه‌ای که در APK ساخته شده است، مقدارهای `versionCode` و `versionName` را در `android\app\build.gradle` بررسی کنید. قبل از انتشار، APK نسخه جدید را روی نسخه قبلی نصب و مسیر آپدیت را آزمایش کنید.

نام فایل APK همیشه `app-release.apk` است؛ نسخه درون فایل ذخیره می‌شود و در نام فایل نمایش داده نمی‌شود. برای دیدن نسخه واقعی APK، فایل `android\app\build\outputs\apk\release\output-metadata.json` را بررسی کنید.

## شناسهٔ اپ

- `applicationId`: `com.zeitoon.app`
- نام نمایشی: زیتون

اگر Gradle نتواند `com.android.tools.build:gradle` را از گوگل بگیرد، از آینهٔ Aliyun استفاده می‌شود (`android\init.gradle`). دستور `assembleRelease` باید با `-I init.gradle` اجرا شود (اسکریپت `npm run android:apk` همین را می‌زند).
