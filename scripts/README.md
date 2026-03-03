# Scripts

## Generate release signing keys (`genekeys.sh`)

Generates an Android release keystore and a `keystore.properties` template. Output is written to **`./keys/`** (ignored by git). Use one keystore for all production builds so Play Store can accept updates.

### 1. Generate the keystore

From the project root:

```bash
chmod +x scripts/genekeys.sh
./scripts/genekeys.sh
```

You’ll get:
- `keys/release.keystore` – the signing key (back this up securely).
- `keys/keystore.properties` – store password, alias, key password (for reference / local build).

**Optional:** set your own alias and passwords:

```bash
KEY_ALIAS=factoryvu KEYSTORE_PASSWORD=12345 KEY_PASSWORD=12345 ./scripts/genekeys.sh
```

**Optional:** generate and also print the keystore as a single-line base64 string (for GitHub Secrets):

```bash
./scripts/genekeys.sh --base64
```

Or generate first, then get base64 in a second step:

```bash
./scripts/genekeys.sh
# later:
./scripts/genekeys.sh --base64   # reuses existing keys/release.keystore if present
```

To get base64 **manually** after generating once:

**Linux (single line, no wrap):**
```bash
base64 -w 0 keys/release.keystore
```

**macOS (single line):**
```bash
base64 -i keys/release.keystore | tr -d '\n'
```

Copy the **entire** output (one long line) for the GitHub Secret.

---

### 2. Add secrets to GitHub

1. Open the repo on GitHub → **Settings** → **Secrets and variables** → **Actions**.
2. Create these **Repository secrets** (do not commit them):

| Secret name          | Value |
|----------------------|--------|
| `KEYSTORE_BASE64`    | Full base64 string from step 1 (one line, no spaces/newlines). |
| `KEYSTORE_PASSWORD`  | The keystore (store) password you used when generating. |
| `KEYSTORE_ALIAS`     | The key alias (default from script: `release`). |
| `KEY_PASSWORD`       | The key password (often same as `KEYSTORE_PASSWORD`). |

3. Save each secret. The next run of the **Build Android APK and AAB** workflow will use this keystore to sign the release build.

---

### 3. Local release build (optional)

To sign a release build on your machine using the same key:

1. Copy the keystore into the Android project:
   ```bash
   cp keys/release.keystore android/release.keystore
   ```
2. Copy the properties file (or create `android/keystore.properties` with the same contents as `keys/keystore.properties`).
3. Run:
   ```bash
   cd android && ./gradlew assembleRelease
   ```

`android/keystore.properties` and `android/release.keystore` are gitignored; do not commit them.

---

### Summary checklist

- [ ] Run `./scripts/genekeys.sh` (and optionally `--base64`).
- [ ] Back up `keys/release.keystore` and the passwords somewhere safe.
- [ ] Add `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEYSTORE_ALIAS`, `KEY_PASSWORD` to GitHub Actions secrets.
- [ ] Re-run the workflow; release builds will be signed with this key.
