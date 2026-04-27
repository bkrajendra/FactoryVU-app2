import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeIfChanged(p, next) {
  const prev = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
  if (prev === next) return false;
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, next, 'utf8');
  return true;
}

function replaceAll(str, re, replacement) {
  const next = str.replace(re, replacement);
  // Don't hard-fail in CI if a file changed format; callers can detect no-op.
  return next;
}

const pkg = readJson(path.join(root, 'package.json'));
const version = String(pkg.version || '').trim();
if (!version) {
  throw new Error('package.json version is empty');
}

let changedAny = false;

// ------------------------------
// iOS: MARKETING_VERSION in pbxproj
// ------------------------------
const pbxprojPath = path.join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
if (fs.existsSync(pbxprojPath)) {
  const pbx = fs.readFileSync(pbxprojPath, 'utf8');
  // Replace all MARKETING_VERSION = X; with MARKETING_VERSION = <package version>;
  const next = pbx.replace(/MARKETING_VERSION\s*=\s*[^;]+;/g, `MARKETING_VERSION = ${version};`);
  if (next !== pbx) {
    fs.writeFileSync(pbxprojPath, next, 'utf8');
    changedAny = true;
  }
}

// ------------------------------
// Android: default fallback versionName in build.gradle
// ------------------------------
const gradlePath = path.join(root, 'android', 'app', 'build.gradle');
if (fs.existsSync(gradlePath)) {
  const g = fs.readFileSync(gradlePath, 'utf8');
  // Keep CI override support; just make the local fallback match package.json.
  let next = g;
  // Pattern A: versionName (vn ?: "1.0")
  next = replaceAll(
    next,
    /versionName\s*\(\s*vn\s*\?:\s*"[^"]*"\s*\)/,
    `versionName (vn ?: "${version}")`,
  );
  // Pattern B (older): versionName (vn ? vn.toString() : "1.0")
  next = replaceAll(
    next,
    /versionName\s*\(\s*vn\s*\?\s*vn\.toString\(\)\s*:\s*"[^"]*"\s*\)/,
    `versionName (vn ? vn.toString() : "${version}")`,
  );
  if (next !== g) {
    fs.writeFileSync(gradlePath, next, 'utf8');
    changedAny = true;
  }
}

// ------------------------------
// docs/ios/manifest.plist: keep metadata version aligned (placeholder-based)
// ------------------------------
const manifestPath = path.join(root, 'docs', 'ios', 'manifest.plist');
if (fs.existsSync(manifestPath)) {
  const m = fs.readFileSync(manifestPath, 'utf8');
  // If placeholders are present, do nothing (CI will fill). If a concrete version is present, align it.
  if (!m.includes('__BUNDLE_VERSION__')) {
    const next = m.replace(
      /<key>bundle-version<\/key>\s*<string>[^<]*<\/string>/,
      `<key>bundle-version</key>\n          <string>${version}</string>`,
    );
    if (next !== m) {
      fs.writeFileSync(manifestPath, next, 'utf8');
      changedAny = true;
    }
  }
}

if (changedAny) {
  // eslint-disable-next-line no-console
  console.log(`[sync-native-versions] Synced native versions to ${version}`);
} else {
  // eslint-disable-next-line no-console
  console.log(`[sync-native-versions] No changes needed (version ${version})`);
}

