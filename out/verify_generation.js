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
const path = __importStar(require("path"));
const Module = __importStar(require("module"));
// Mock the 'vscode' module to allow running outside of Extension Host
const originalRequire = Module.prototype.require;
Module.prototype.require = function (request) {
    if (request === 'vscode') {
        return {
            window: {
                showErrorMessage: () => { },
                showInformationMessage: () => { },
                showOpenDialog: () => { }
            }
        };
    }
    return originalRequire.apply(this, arguments);
};
const generator_1 = require("./generator");
const targetDir = path.join(__dirname, '..', 'test-output');
async function testConfigurations() {
    console.log('Starting Navi Generation Tests...');
    // Test 1: MERN Stack
    const config1 = {
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
    const config2 = {
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
    const config3 = {
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
        await (0, generator_1.generateProject)(config1, targetDir);
        console.log('✅ MERN App generated successfully.');
        console.log('Generating Django + Vue App...');
        await (0, generator_1.generateProject)(config2, targetDir);
        console.log('✅ Django App generated successfully.');
        console.log('Generating Spring Boot + Angular App...');
        await (0, generator_1.generateProject)(config3, targetDir);
        console.log('✅ Spring Boot App generated successfully.');
        console.log('🎉 All generations passed!');
    }
    catch (error) {
        console.error('❌ Error during generation:', error);
    }
}
testConfigurations();
//# sourceMappingURL=verify_generation.js.map