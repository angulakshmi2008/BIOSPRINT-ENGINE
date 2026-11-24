# Android Application Deployment Guide
## BioSprint Engine: Mobile APK via Capacitor
**Document Identifier:** DOC-DEP-ANDROID-001  
**Package Identifier:** `org.biosprint.engine`  

---

## 1. Mobile Strategy: Capacitor Native Wrapper

BioSprint Engine leverages **Capacitor** to bridge the existing React 18 / Tailwind scientific web application directly into a native Android application package (`.apk` / `.aab`). This preserves 100% of the existing interactive Recharts dashboards, responsive tables, and Provenance DAG canvas while offering native mobile device capabilities:
- Native cold storage barcode/QR scanning via camera.
- Offline specimen inventory lookup for bench scientists.
- Native file chooser for raw sequencing uploads.

---

## 2. Prerequisites for Building Android APK

To compile the Android APK locally:
1. **Java Development Kit (JDK):** Version 17 or 21 (OpenJDK / Temurin).
2. **Android Studio:** With Android SDK (API Level 33 or 34) and Android SDK Build-Tools.
3. **Environment Variables:** `ANDROID_HOME` configured to your Android SDK directory.

---

## 3. Step-by-Step APK Generation Commands

```powershell
# 1. Build the production React web bundle
npm run build

# 2. Add Capacitor dependencies if building for Android locally
npm install @capacitor/core @capacitor/cli @capacitor/android

# 3. Initialize & Add Android Native Platform
npx cap add android

# 4. Sync web assets (dist folder) into the Android native project
npx cap sync android

# 5. Open project in Android Studio
npx cap open android

# 6. Build APK in Android Studio:
# In Android Studio menu: Build -> Build Bundle(s) / APK(s) -> Build APK(s)
# The signed APK will be output to:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Mobile Viewport & Touch UX Enhancements

- **Touch Target Sizes:** All table action buttons and navigation pills have a minimum 44px touch area.
- **Responsive Drawer:** The persistent left sidebar automatically collapses into a smooth touch-enabled overlay on mobile screens (< 1024px).
- **Responsive Tables:** Critical tables scroll horizontally with smooth momentum scrolling on narrow mobile screens.
