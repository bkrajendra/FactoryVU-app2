# Icon and Splash Screen Resources

Steps to create and generate app icon and splash screen for FactoryVU (Ionic + Capacitor).

---

## 1. Install the assets tool

From the project root:

```bash
npm install @capacitor/assets --save-dev
```

---

## 2. Prepare source images

Create an **`assets/`** folder in the project root (if it doesn’t exist) and add your source images.

### Option A – Simple (single logo for icon + splash)

| File          | Size          | Notes |
|---------------|---------------|--------|
| `icon-only.png` | **1024×1024** | App icon; square, no transparency for Android. |
| `splash.png`     | **2732×2732** | Full splash image. Keep important content in the **center 1200×1200** (safe area). |

- Use PNG or JPG.
- Icon: square, simple logo; avoid thin edges (they get small on devices).
- Splash: same logo centered; tool will scale and crop for different devices.

### Option B – Full control (optional)

| File                   | Size          | Use |
|------------------------|---------------|-----|
| `icon-only.png`        | 1024×1024     | Icon (single layer). |
| `icon-foreground.png` | 1024×1024     | Foreground for adaptive icon (Android). |
| `icon-background.png`  | 1024×1024     | Background for adaptive icon (Android). |
| `splash.png`           | 2732×2732     | Light splash. |
| `splash-dark.png`      | 2732×2732     | Dark splash (optional). |

**Folder layout:**

```text
FactoryVU/
  assets/
    icon-only.png    # 1024×1024
    splash.png       # 2732×2732
```

---

## 3. Generate resources

From the project root:

```bash
npx capacitor-assets generate
```

This will:

- Generate all required icon sizes for **Android** (and iOS/PWA if you add them later).
- Generate splash images and copy them into `android/app/src/main/res/` (and iOS/PWA if configured).

To limit to Android only:

```bash
npx capacitor-assets generate --android
```

---

## 4. Sync and build

After generating:

```bash
npx cap sync android
```

Then build the app as usual (e.g. Android Studio or your CI).

---

## 5. Design tips

- **Icon**
  - 1024×1024 px, PNG.
  - Simple, recognizable at 48px.
  - Prefer solid shapes; avoid tiny text or thin lines.
- **Splash**
  - 2732×2732 px.
  - Put logo and key content in the **center 1200×1200** so it’s visible on all devices (safe area).
  - Use your brand background color; the tool can also use background options if you use “icon + background” assets.

---

## 6. Android 12+ splash behavior

On Android 12+, the system shows a **small centered icon + background color** first, then your app. `@capacitor/assets` generates the right resources; the “splash” you design is still used where the platform allows (e.g. older Android, or as part of the theme).

---

## 7. Optional: add an npm script

In `package.json`:

```json
"scripts": {
  "assets": "capacitor-assets generate"
}
```

Then run:

```bash
npm run assets
```

---

## Quick checklist

1. [ ] Install: `npm install @capacitor/assets --save-dev`
2. [ ] Add `assets/icon-only.png` (1024×1024)
3. [ ] Add `assets/splash.png` (2732×2732, logo in center)
4. [ ] Run: `npx capacitor-assets generate`
5. [ ] Run: `npx cap sync android`
6. [ ] Build and test on device or emulator
