"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const generator_1 = require("./generator");
const NaviPanel_1 = require("./panels/NaviPanel");
const configManager_1 = require("./utils/configManager");
function activate(context) {
    console.log('🧭 Navi is now active!');
    const disposable = vscode.commands.registerCommand('navi.createProject', async () => {
        // ── Step 1: Config Import or Fresh Start ─────────────────────────────────
        let config;
        const startChoice = await vscode.window.showQuickPick([
            { label: '✨ Start Fresh', description: 'Fill in all project details in the UI' },
            { label: '📂 Load from .navi.json', description: 'Re-use a previously saved config' },
        ], { title: '🧭 Navi', placeHolder: 'How do you want to start?' });
        if (!startChoice) {
            return;
        }
        if (startChoice.label === '📂 Load from .navi.json') {
            config = await (0, configManager_1.importConfig)();
            if (!config) {
                // User cancelled the file picker — let them start fresh
                config = await NaviPanel_1.NaviPanel.show(context.extensionUri);
            }
        }
        else {
            // ── Step 2: Show beautiful WebView form ──────────────────────────────
            config = await NaviPanel_1.NaviPanel.show(context.extensionUri);
        }
        if (!config) {
            vscode.window.showWarningMessage('Navi: Project creation cancelled.');
            return;
        }
        // ── Step 3: Project Summary Confirmation ─────────────────────────────────
        const selectedFeatures = config.features.length > 0
            ? config.features.slice(0, 4).join(', ') + (config.features.length > 4 ? ` +${config.features.length - 4} more` : '')
            : 'None';
        const summary = [
            `📦 Project: ${config.projectName}`,
            `🎨 Frontend: ${config.frontendFramework} + ${config.cssFramework}`,
            `⚙️  Backend: ${config.backendFramework}`,
            `🗄️  Database: ${config.database}`,
            `✨ Features: ${selectedFeatures}`,
            `🚀 Deploy to: ${config.deployTarget}`,
        ].join('\n');
        const confirm = await vscode.window.showInformationMessage(`🧭 Ready to generate "${config.projectName}"?\n\n${summary}`, { modal: true }, 'Generate 🚀', 'Go Back');
        if (confirm !== 'Generate 🚀') {
            vscode.window.showInformationMessage('Navi: Generation cancelled.');
            return;
        }
        // ── Step 4: Select Target Folder ─────────────────────────────────────────
        const folderUris = await vscode.window.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            openLabel: 'Select folder to create project in',
        });
        if (!folderUris || folderUris.length === 0) {
            vscode.window.showWarningMessage('Navi: No folder selected.');
            return;
        }
        const targetPath = folderUris[0].fsPath;
        // ── Step 5: Generate Project ──────────────────────────────────────────────
        let projectRoot = '';
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `🧭 Navi is generating "${config.projectName}"...`,
            cancellable: false,
        }, async (progress) => {
            progress.report({ increment: 0, message: 'Setting up project structure...' });
            try {
                projectRoot = await (0, generator_1.generateProject)(config, targetPath);
                progress.report({ increment: 60, message: 'Creating files...' });
                await new Promise(r => setTimeout(r, 400));
                progress.report({ increment: 100, message: 'Done! ✅' });
            }
            catch (error) {
                vscode.window.showErrorMessage(`Navi Error: ${error.message}`);
                console.error('Navi error:', error);
                return;
            }
        });
        if (!projectRoot) {
            return;
        }
        // ── Step 6: npm install Auto-Prompt ──────────────────────────────────────
        const isPythonOrJava = ['FastAPI (Python)', 'Django (Python)', 'Spring Boot (Java)']
            .includes(config.backendFramework);
        if (!isPythonOrJava) {
            const installChoice = await vscode.window.showInformationMessage(`🧭 "${config.projectName}" generated! Run npm install now?`, 'Yes, install dependencies', 'Open Project', 'Open in New Window');
            if (installChoice === 'Yes, install dependencies') {
                const terminal = vscode.window.createTerminal({
                    name: `🧭 Navi — ${config.projectName}`,
                    cwd: projectRoot,
                });
                terminal.show();
                terminal.sendText('npm install');
                vscode.window.showInformationMessage(`🧭 Installing dependencies for "${config.projectName}"... check the terminal!`, 'Open Project').then(action => {
                    if (action === 'Open Project') {
                        vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), false);
                    }
                });
            }
            else if (installChoice === 'Open Project') {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), false);
            }
            else if (installChoice === 'Open in New Window') {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), true);
            }
        }
        else {
            // For Python/Java — just show open options
            const openAction = await vscode.window.showInformationMessage(`🧭 "${config.projectName}" generated! (${config.backendFramework})`, 'Open Project', 'Open in New Window');
            if (openAction === 'Open Project') {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), false);
            }
            else if (openAction === 'Open in New Window') {
                await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), true);
            }
        }
        // Notify about config export
        vscode.window.showInformationMessage(`💾 Config saved as .navi.json in "${config.projectName}" — load it next time to skip setup!`);
    });
    context.subscriptions.push(disposable);
}
function deactivate() {
    console.log('🧭 Navi deactivated');
}
//# sourceMappingURL=extension.js.map