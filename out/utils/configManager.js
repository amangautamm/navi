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
exports.exportConfig = exportConfig;
exports.importConfig = importConfig;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const CONFIG_FILENAME = '.navi.json';
/**
 * Saves the ProjectConfig as .navi.json inside the generated project folder.
 */
async function exportConfig(config, targetDir) {
    try {
        const configPath = path.join(targetDir, CONFIG_FILENAME);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); // Assuming writeFile is fs.writeFileSync
    }
    catch (error) {
        vscode.window.showErrorMessage(`Navi: Failed to export config — ${error.message}`);
    }
}
/**
 * Opens a file picker to load an existing .navi.json and returns the ProjectConfig.
 */
async function importConfig() {
    const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { 'Navi Config': ['json'] },
        openLabel: 'Load .navi.json',
        title: 'Select your .navi.json config file',
    });
    if (!uris || uris.length === 0) {
        return undefined;
    }
    try {
        const content = fs.readFileSync(uris[0].fsPath, 'utf8');
        const config = JSON.parse(content);
        if (!config.projectName || !config.frontendFramework) {
            vscode.window.showErrorMessage('Navi: Invalid .navi.json — missing required fields.');
            return undefined;
        }
        return config;
    }
    catch (error) {
        vscode.window.showErrorMessage('Navi: Could not parse .navi.json — check JSON format.');
        return undefined;
    }
}
//# sourceMappingURL=configManager.js.map