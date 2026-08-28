برای ساخت APK اندروید ساین‌شده، وب‌اپ با **Vite** بیلد می‌شود و با **Capacitor** داخل یک پروژهٔ Android پیچیده می‌شود. خروجی با **Gradle** (`assembleRelease`) ساخته و با keystore پروژه امضا می‌شود.

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

## شناسهٔ اپ

- `applicationId`: `com.zeitoon.app`
- نام نمایشی: زیتون

اگر Gradle نتواند `com.android.tools.build:gradle` را از گوگل بگیرد، از آینهٔ Aliyun استفاده می‌شود (`android\init.gradle`). دستور `assembleRelease` باید با `-I init.gradle` اجرا شود (اسکریپت `npm run android:apk` همین را می‌زند).
