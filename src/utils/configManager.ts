import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ProjectConfig } from '../types';

const CONFIG_FILENAME = '.navi.json';

/**
 * Saves the ProjectConfig as .navi.json inside the generated project folder.
 */
export async function exportConfig(config: ProjectConfig, targetDir: string) {
  try {
    const configPath = path.join(targetDir, CONFIG_FILENAME);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); // Assuming writeFile is fs.writeFileSync
  } catch (error: any) {
    vscode.window.showErrorMessage(`Navi: Failed to export config — ${error.message}`);
  }
}

/**
 * Opens a file picker to load an existing .navi.json and returns the ProjectConfig.
 */
export async function importConfig(): Promise<ProjectConfig | undefined> {
  const uris = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: { 'Navi Config': ['json'] },
    openLabel: 'Load .navi.json',
    title: 'Select your .navi.json config file',
  });

  if (!uris || uris.length === 0) { return undefined; }

  try {
    const content = fs.readFileSync(uris[0].fsPath, 'utf8');
    const config = JSON.parse(content) as ProjectConfig;

    if (!config.projectName || !config.frontendFramework) {
      vscode.window.showErrorMessage('Navi: Invalid .navi.json — missing required fields.');
      return undefined;
    }

    return config;
  } catch (error) {
    vscode.window.showErrorMessage('Navi: Could not parse .navi.json — check JSON format.');
    return undefined;
  }
}
