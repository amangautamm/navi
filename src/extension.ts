import * as vscode from 'vscode';
import * as path from 'path';
import { generateProject } from './generator';
import { NaviPanel } from './panels/NaviPanel';
import { importConfig } from './utils/configManager';
import { ProjectConfig } from './types';

export function activate(context: vscode.ExtensionContext) {
  console.log('🧭 Navi is now active!');

  const disposable = vscode.commands.registerCommand('navi.createProject', async () => {

    // ── Step 1: Config Import or Fresh Start ─────────────────────────────────
    let config: ProjectConfig | undefined;

    const startChoice = await vscode.window.showQuickPick(
      [
        { label: '✨ Start Fresh', description: 'Fill in all project details in the UI' },
        { label: '📂 Load from .navi.json', description: 'Re-use a previously saved config' },
      ],
      { title: '🧭 Navi', placeHolder: 'How do you want to start?' }
    );

    if (!startChoice) { return; }

    if (startChoice.label === '📂 Load from .navi.json') {
      config = await importConfig();
      if (!config) {
        // User cancelled the file picker — let them start fresh
        config = await NaviPanel.show(context.extensionUri);
      }
    } else {
      // ── Step 2: Show beautiful WebView form ──────────────────────────────
      config = await NaviPanel.show(context.extensionUri);
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

    const confirm = await vscode.window.showInformationMessage(
      `🧭 Ready to generate "${config.projectName}"?\n\n${summary}`,
      { modal: true },
      'Generate 🚀',
      'Go Back'
    );

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

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `🧭 Navi is generating "${config.projectName}"...`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: 'Setting up project structure...' });

        try {
          projectRoot = await generateProject(config!, targetPath);

          progress.report({ increment: 60, message: 'Creating files...' });
          await new Promise(r => setTimeout(r, 400));
          progress.report({ increment: 100, message: 'Done! ✅' });

        } catch (error: any) {
          vscode.window.showErrorMessage(`Navi Error: ${error.message}`);
          console.error('Navi error:', error);
          return;
        }
      }
    );

    if (!projectRoot) { return; }

    // ── Step 6: npm install Auto-Prompt ──────────────────────────────────────
    const isPythonOrJava = ['FastAPI (Python)', 'Django (Python)', 'Spring Boot (Java)']
      .includes(config.backendFramework);

    if (!isPythonOrJava) {
      const installChoice = await vscode.window.showInformationMessage(
        `🧭 "${config.projectName}" generated! Run npm install now?`,
        'Yes, install dependencies',
        'Open Project',
        'Open in New Window'
      );

      if (installChoice === 'Yes, install dependencies') {
        const terminal = vscode.window.createTerminal({
          name: `🧭 Navi — ${config.projectName}`,
          cwd: projectRoot,
        });
        terminal.show();
        terminal.sendText('npm install');
        vscode.window.showInformationMessage(
          `🧭 Installing dependencies for "${config.projectName}"... check the terminal!`,
          'Open Project'
        ).then(action => {
          if (action === 'Open Project') {
            vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), false);
          }
        });
      } else if (installChoice === 'Open Project') {
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), false);
      } else if (installChoice === 'Open in New Window') {
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), true);
      }

    } else {
      // For Python/Java — just show open options
      const openAction = await vscode.window.showInformationMessage(
        `🧭 "${config.projectName}" generated! (${config.backendFramework})`,
        'Open Project',
        'Open in New Window'
      );

      if (openAction === 'Open Project') {
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), false);
      } else if (openAction === 'Open in New Window') {
        await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectRoot), true);
      }
    }

    // Notify about config export
    vscode.window.showInformationMessage(
      `💾 Config saved as .navi.json in "${config.projectName}" — load it next time to skip setup!`
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {
  console.log('🧭 Navi deactivated');
}
