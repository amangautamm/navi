import * as path from 'path';
import * as Module from 'module';

// Mock the 'vscode' module to allow running outside of Extension Host
const originalRequire = Module.prototype.require;
(Module.prototype as any).require = function(request: string) {
    if (request === 'vscode') {
        return {
            window: {
                showErrorMessage: () => {},
                showInformationMessage: () => {},
                showOpenDialog: () => {}
            }
        };
    }
    return originalRequire.apply(this, arguments as any);
};

import { generateProject } from './generator';
import { ProjectConfig } from './types';

const targetDir = path.join(__dirname, '..', 'test-output');

async function testConfigurations() {
    console.log('Starting Navi Generation Tests...');

    // Test 1: MERN Stack
    const config1: ProjectConfig = {
        projectName: 'test-mern-app',
        projectType: 'Custom',
        quickStack: 'MERN',
        frontendLanguage: 'javascript',
        frontendFramework: 'React.js',
        cssFramework: 'Tailwind CSS',
        uiLibrary: 'ShadCN UI',
        stateManagement: 'Redux Toolkit',
        buildTool: 'Vite',
        animationLibrary: 'None',
        backendLanguage: 'Node.js',
        backendFramework: 'Express.js',
        database: 'MongoDB',
        orm: 'Mongoose',
        features: ['JWT Authentication', 'OAuth (Google/GitHub)', 'File Upload (Multer)'],
        deployTarget: 'Vercel',
        license: 'MIT'
    };

    // Test 2: Django + Vue
    const config2: ProjectConfig = {
        projectName: 'test-django-vue',
        projectType: 'Custom',
        quickStack: 'None',
        frontendLanguage: 'javascript',
        frontendFramework: 'Vue.js',
        cssFramework: 'None',
        uiLibrary: 'None',
        stateManagement: 'Pinia (Vue)',
        buildTool: 'Vite',
        animationLibrary: 'None',
        backendLanguage: 'Python',
        backendFramework: 'Django (Python)',
        database: 'PostgreSQL',
        orm: 'None',
        features: ['Testing (Jest)', 'Docker Support'],
        deployTarget: 'None',
        license: 'None'
    };

    // Test 3: Spring Boot + Angular
    const config3: ProjectConfig = {
        projectName: 'test-spring-angular',
        projectType: 'Custom',
        quickStack: 'SpringAngular',
        frontendLanguage: 'typescript',
        frontendFramework: 'Angular',
        cssFramework: 'None',
        uiLibrary: 'None',
        stateManagement: 'NgRx (Angular)',
        buildTool: 'Default (Framework CLI)',
        animationLibrary: 'None',
        backendLanguage: 'Java',
        backendFramework: 'Spring Boot (Java)',
        database: 'MySQL',
        orm: 'Hibernate',
        features: ['JWT Authentication'],
        deployTarget: 'None',
        license: 'MIT'
    };

    try {
        console.log('Generating MERN App...');
        await generateProject(config1, targetDir);
        console.log('✅ MERN App generated successfully.');
        
        console.log('Generating Django + Vue App...');
        await generateProject(config2, targetDir);
        console.log('✅ Django App generated successfully.');
        
        console.log('Generating Spring Boot + Angular App...');
        await generateProject(config3, targetDir);
        console.log('✅ Spring Boot App generated successfully.');

        console.log('🎉 All generations passed!');
    } catch (error) {
        console.error('❌ Error during generation:', error);
    }
}

testConfigurations();
