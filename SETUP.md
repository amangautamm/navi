# Navi — Developer Setup Guide

How to build, test, and publish the Navi extension.

---

## Project Structure

```
navi/
├── src/
│   └── extension.js      ← All extension logic (single file)
├── package.json           ← Extension manifest + metadata
├── README.md              ← User-facing documentation
├── SETUP.md               ← This file
├── CHANGELOG.md           ← Version history
├── .vscodeignore          ← Files to exclude from package
└── assets/
    └── icon.png           ← Extension icon (128x128 PNG)
```

---

## Prerequisites

```bash
# Node.js 18 or higher
node --version

# npm
npm --version
```

---

## Step 1 — Clone the Repo

```bash
git clone https://github.com/amangautamm/navi.git
cd navi
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

---

## Step 3 — Add an Icon

Create `assets/icon.png` — a 128×128 PNG image for the extension.

If you don't have one yet, create the folder and add a placeholder:
```bash
mkdir assets
# Add your 128x128 icon.png here
```

> Without an icon the extension still works, but the marketplace listing won't look great.

---

## Step 4 — Test Locally in VS Code

1. Open the `navi` folder in VS Code
2. Press **F5** — this opens an Extension Development Host window
3. In the new window, click the rocket icon in the sidebar to open Navi
4. Make sure Ollama is running: `ollama serve`

---

## Step 5 — Package the Extension

```bash
npm run package
```

This creates `navi-1.0.0.vsix` in the project root.

**Install locally:**
```bash
code --install-extension navi-1.0.0.vsix
```

Or via VS Code: `Ctrl+Shift+P` → **Install from VSIX**

---

## Step 6 — Publish to VS Code Marketplace

### 6a — Create a Publisher Account

1. Go to [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Sign in with your Microsoft account
3. Create a new publisher with ID: `amanblaze`

### 6b — Get a Personal Access Token (PAT)

1. Go to [dev.azure.com](https://dev.azure.com)
2. Click your profile → **Personal access tokens**
3. New token → Name: `vsce-publish`
4. Organization: **All accessible organizations**
5. Scopes: **Marketplace → Manage**
6. Copy the token — you only see it once

### 6c — Login with vsce

```bash
npx @vscode/vsce login amanblaze
# Paste your PAT when prompted
```

### 6d — Publish

```bash
npx @vscode/vsce publish
```

The extension goes live at:
`https://marketplace.visualstudio.com/items?itemName=amanblaze.navi`

---

## Updating the Extension

### Bump version (patch = bug fix, minor = new feature, major = breaking)

```bash
# Bump patch version: 1.0.0 → 1.0.1
npx @vscode/vsce publish patch

# Bump minor version: 1.0.0 → 1.1.0
npx @vscode/vsce publish minor
```

Or manually edit `version` in `package.json` then run `npx @vscode/vsce publish`.

---

## Adding .vscodeignore

Create this file to keep the package small:

```
.vscode/**
.git/**
node_modules/**
SETUP.md
*.vsix
assets/screenshots/**
```

---

## Setting Up GitHub Repo

```bash
cd navi
git init
git remote add origin https://github.com/amangautamm/navi.git
git add .
git commit -m "feat: initial release v1.0.0"
git push -u origin main
```

### Recommended GitHub Repo Settings

- **Description:** Your AI co-navigator. Free, local, unlimited Ollama-powered coding assistant for VS Code.
- **Topics:** `vscode`, `vscode-extension`, `ollama`, `ai`, `copilot`, `coding-assistant`, `free`
- **Website:** Link to marketplace page after publishing

---

## Environment Variables (for future use)

If you ever add a backend or telemetry:
```
OLLAMA_HOST=http://localhost:11434
```

---

## Key Files to Edit for Customization

| File | What to change |
|---|---|
| `package.json` | Version, description, keywords, commands |
| `src/extension.js` | All AI logic, prompts, UI |
| `README.md` | User documentation |
| `assets/icon.png` | Extension icon |

---

## Common Commands

```bash
# Test locally
F5 in VS Code

# Package
npm run package

# Install local build
code --install-extension navi-1.0.0.vsix

# Publish
npx @vscode/vsce publish

# Check extension info
npx @vscode/vsce ls
```

---

## Support

- **Issues:** https://github.com/amangautamm/navi/issues
- **Buy me a coffee:** https://buymeacoffee.com/amanblaze
