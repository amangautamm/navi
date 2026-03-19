# Navi — Your AI Co-Navigator

> Navigate your code with AI. Free. Local. No limits.

**Publisher:** amanblaze  
**GitHub:** [amangautamm/navi](https://github.com/amangautamm/navi)  
**Support:** [buymeacoffee.com/amanblaze](https://buymeacoffee.com/amanblaze)

---

## What is Navi?

Navi is a free AI coding assistant for VS Code, powered by **Ollama** running on your own machine. It works like GitHub Copilot and Cursor — but it costs nothing, has no usage limits, and your code never leaves your computer.

It works in two ways:

- **Project mode** — Navi scans your entire project, finds errors across all files, and fixes them
- **File mode** — Navi focuses on the file you have open and applies changes directly into the editor

---

## Requirements

- [VS Code](https://code.visualstudio.com) 1.74 or higher
- [Ollama](https://ollama.com) installed and running
- At least 8GB RAM
- 5–10GB free disk space for models

---

## Quick Setup

### Step 1 — Install Ollama

Go to [ollama.com/download](https://ollama.com/download) and install for your OS.

### Step 2 — Download AI Models

Open your terminal and run:

```bash
# Main model — uncensored and smart
ollama pull dolphin-llama3:8b

# Best coding quality
ollama pull qwen2.5-coder:7b

# Fast ghost text completions (only 1GB)
ollama pull qwen2.5-coder:1.5b
```

### Step 3 — Start Ollama

```bash
ollama serve
```

Keep this running in the background while using Navi.

### Step 4 — Install the Extension

1. Download `navi-1.0.0.vsix`
2. Open VS Code
3. Press `Ctrl+Shift+P` → type **Install from VSIX**
4. Select the downloaded file
5. Reload VS Code when prompted

---

## How to Use

### Opening the Panel

Click the **rocket icon** (⚙) in the VS Code activity bar on the left. The Navi panel opens as a sidebar — always visible while you code.

### Two Modes

At the top of the panel you'll see two buttons:

| Button | What it does |
|---|---|
| **📁 Project** | Navi works on your entire codebase |
| **📄 This File** | Navi works only on the file currently open |

Switch between them any time.

### Sending a Prompt

Type anything in the text box at the bottom and press **Enter** (or **Ctrl+Enter**). You can write in English, Hindi, or Hinglish — Navi understands all of them.

**Examples:**
```
Fix all errors in the project
Explain what this file does
Add authentication to the Express app
Write unit tests for this file
Refactor the payment module
Security audit the whole project
```

### Three Buttons

| Button | Action |
|---|---|
| **Send** | Send your typed prompt |
| **Fix Project** | Instantly fix all errors across all files |
| **Fix File** | Fix errors in the currently open file |

### Applying Changes

When Navi suggests file changes, a preview box appears with an **Apply** button. You review the changes and click Apply — nothing changes without your confirmation (unless you turn on Auto Apply in settings).

### Ghost Text

While typing code, Navi suggests completions automatically. Press **Tab** to accept, **Esc** to dismiss.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Shift+A` | Open agent prompt |
| `Ctrl+Shift+F` | Fix current file |
| `Ctrl+Shift+P` | Fix all project errors |
| `Ctrl+Shift+E` | Explain current file |
| `Tab` | Accept ghost text completion |

---

## Right-Click Menu

Right-click on any file in the editor to access:

- Fix This File
- Explain This File
- Refactor This File
- Write Tests
- Optimize
- Add Documentation
- Security Check
- Fix All Project Errors

---

## Tabs in the Panel

| Tab | Use for |
|---|---|
| **Chat** | General questions about code |
| **Agent** | Complex tasks — Navi plans and executes |
| **Debug** | Finding and fixing bugs |
| **Refactor** | Improving code structure |
| **Build** | Creating new features or apps |
| **Tests** | Writing unit and integration tests |
| **Security** | Finding vulnerabilities |

---

## Settings

Open VS Code settings (`Ctrl+,`) and search for **Navi** to configure:

| Setting | Default | Description |
|---|---|---|
| `navi.model` | `dolphin-llama3:8b` | Main model for chat and agent tasks |
| `navi.codingModel` | `qwen2.5-coder:7b` | Model for code tasks |
| `navi.fastModel` | `qwen2.5-coder:1.5b` | Fast model for ghost text |
| `navi.host` | `http://localhost:11434` | Ollama server URL |
| `navi.uncensored` | `true` | No content restrictions |
| `navi.autoComplete` | `true` | Enable ghost text |
| `navi.autoDebug` | `true` | Suggest fix when errors appear |
| `navi.autoApply` | `false` | Apply changes without confirmation |
| `navi.maxTokens` | `2048` | Max length of AI response |

---

## Recommended Models for 8GB RAM

| Model | Size | Best for |
|---|---|---|
| `dolphin-llama3:8b` | 4.7GB | Main chat, agent, uncensored |
| `qwen2.5-coder:7b` | 4.7GB | Code generation and fixing |
| `qwen2.5-coder:1.5b` | 1.0GB | Fast ghost text completions |
| `dolphin-mistral:7b` | 4.1GB | Uncensored + fast responses |
| `mistral:7b` | 4.1GB | General purpose, fast |
| `codellama:7b` | 3.8GB | Lightweight coding model |

---

## Troubleshooting

**Navi says it cannot connect to Ollama:**
```bash
# Make sure Ollama is running
ollama serve
```

**Ghost text is not appearing:**
- Check that `navi.autoComplete` is `true` in settings
- Use `qwen2.5-coder:1.5b` as your fast model for quicker suggestions

**Responses are slow:**
- Use a smaller model: `qwen2.5-coder:1.5b`
- Reduce `navi.maxTokens` to `512` for shorter responses
- Close other heavy applications to free up RAM

**Model not found:**
```bash
# Check what models you have
ollama list

# Download a model
ollama pull qwen2.5-coder:7b
```

---

## Privacy

Everything runs on your machine. Your code is never sent to any server. Ollama runs 100% locally.

---

## Support the Project

If Navi saves you time, consider buying a coffee:  
[buymeacoffee.com/amanblaze](https://buymeacoffee.com/amanblaze)

**GitHub:** [github.com/amangautamm/navi](https://github.com/amangautamm/navi)  
**Issues:** [github.com/amangautamm/navi/issues](https://github.com/amangautamm/navi/issues)

---

## License

MIT © amanblaze
