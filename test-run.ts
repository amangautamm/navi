import { generateProject } from './src/generator/index';
import { ProjectConfig } from './src/types';
import * as path from 'path';
import * as fs from 'fs';

const targetDir = path.join(__dirname, 'test-output');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

const config: ProjectConfig = {
  projectName: 'MySuperApp',
  projectType: 'E-Commerce',
  quickStack: 'MERN',
  frontendLanguage: 'typescript',
  frontendFramework: 'React.js',
  cssFramework: 'Tailwind CSS',
  uiLibrary: 'ShadCN UI',
  stateManagement: 'Redux Toolkit',
  buildTool: 'Vite',
  animationLibrary: 'Framer Motion',
  backendLanguage: 'Node.js',
  backendFramework: 'Express.js',
  database: 'MongoDB',
  orm: 'Mongoose',
  features: [
    'JWT Authentication',
    'Socket.io (Real-time)',
    'Cloud Storage (AWS S3)',
    'Error Tracking (Sentry)',
    'Testing (Jest)',
    'Rate Limiting',
    'Logging (Winston)',
    'API Documentation (Swagger)'
  ],
  deployTarget: 'Vercel',
  license: 'MIT'
};

generateProject(config, targetDir).then(res => {
  console.log('Successfully generated project at:', res);
}).catch(console.error);
