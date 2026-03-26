export interface ProjectConfig {
  projectName: string;
  projectType: string;
  quickStack: string;
  frontendLanguage: 'javascript' | 'typescript';
  frontendFramework: string;
  cssFramework: string;
  uiLibrary: string;
  stateManagement: string;
  buildTool: string;
  animationLibrary: string;
  backendLanguage: string;
  backendFramework: string;
  database: string;
  orm: string;
  features: string[];
  deployTarget: string;
  license: string;
}
