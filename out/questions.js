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
exports.askQuestions = askQuestions;
const vscode = __importStar(require("vscode"));
async function pick(title, items, canPickMany = false) {
    if (canPickMany) {
        const result = await vscode.window.showQuickPick(items, { placeHolder: title, canPickMany: true, title });
        return result;
    }
    return vscode.window.showQuickPick(items, { placeHolder: title, title });
}
async function input(prompt, placeholder) {
    return vscode.window.showInputBox({ prompt, placeHolder: placeholder });
}
async function askQuestions() {
    const projectName = await input('Project ka naam kya hai?', 'my-awesome-project');
    if (!projectName)
        return undefined;
    const projectType = await pick('Kaunsi website banana chahte ho?', [
        'E-Commerce', 'Blog / News Portal', 'Portfolio', 'SaaS Dashboard',
        'Social Media App', 'Food Delivery App', 'Hospital Management',
        'School Management', 'Real Estate', 'Job Portal', 'Chat Application', 'Custom'
    ]);
    if (!projectType)
        return undefined;
    const language = await pick('Kaunsi language use karni hai?', ['TypeScript', 'JavaScript']);
    if (!language)
        return undefined;
    const frontendFramework = await pick('Frontend framework kaunsa use karoge?', [
        'React.js', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte',
        'SvelteKit', 'Solid.js', 'Astro', 'Remix', 'Gatsby',
        'Vanilla HTML/CSS/JS', 'None (Backend only)'
    ]);
    if (!frontendFramework)
        return undefined;
    const cssFramework = await pick('CSS framework kaunsa use karoge?', [
        'Tailwind CSS', 'Bootstrap 5', 'Bulma', 'Foundation', 'Materialize CSS',
        'Skeleton CSS', 'Pure CSS', 'SASS/SCSS only', 'LESS', 'None'
    ]);
    if (!cssFramework)
        return undefined;
    const uiLibrary = await pick('UI Component Library?', [
        'ShadCN UI', 'Material UI (MUI)', 'Ant Design', 'Chakra UI', 'Mantine',
        'DaisyUI', 'Radix UI', 'Headless UI', 'PrimeReact', 'Flowbite', 'None'
    ]);
    if (!uiLibrary)
        return undefined;
    const stateManagement = await pick('State Management?', [
        'Redux Toolkit', 'Zustand', 'Recoil', 'Jotai', 'MobX',
        'Pinia (Vue)', 'NgRx (Angular)', 'Context API only', 'None'
    ]);
    if (!stateManagement)
        return undefined;
    const buildTool = await pick('Build Tool?', [
        'Vite', 'Webpack', 'Parcel', 'Rollup', 'Turbopack', 'Default (Framework CLI)'
    ]);
    if (!buildTool)
        return undefined;
    const animationLibrary = await pick('Animation Library?', [
        'Framer Motion', 'GSAP', 'Three.js (3D)', 'AOS (Animate on Scroll)', 'Lottie', 'None'
    ]);
    if (!animationLibrary)
        return undefined;
    const backendFramework = await pick('Backend framework kaunsa use karoge?', [
        'Express.js', 'Fastify', 'NestJS', 'Hono', 'Koa.js',
        'FastAPI (Python)', 'Django (Python)', 'Spring Boot (Java)', 'None (Frontend only)'
    ]);
    if (!backendFramework)
        return undefined;
    const database = await pick('Database kaunsa use karoge?', [
        'MongoDB (Mongoose)', 'PostgreSQL (Prisma)', 'MySQL (Prisma)', 'SQLite (Prisma)',
        'Firebase Firestore', 'Supabase', 'PlanetScale', 'Redis', 'None'
    ]);
    if (!database)
        return undefined;
    const features = await pick('Kaunse features chahiye? (Multiple select kar sakte ho)', [
        'JWT Authentication',
        'OAuth (Google/GitHub)',
        'Role Based Access Control (RBAC)',
        'Payment Gateway (Razorpay)',
        'Payment Gateway (Stripe)',
        'File Upload (Multer)',
        'Email Service (Nodemailer)',
        'SMS Service (Twilio)',
        'Real-time (Socket.io)',
        'Push Notifications (Web Push)',
        'Search (Elasticsearch)',
        'Caching (Redis)',
        'Rate Limiting',
        'API Documentation (Swagger)',
        'Logging (Winston)',
        'Error Tracking (Sentry)',
        'Testing (Jest)',
        'ESLint + Prettier',
        'Docker Support',
        'CI/CD (GitHub Actions)'
    ], true);
    if (!features)
        return undefined;
    const deployTarget = await pick('Deploy kahan karna chahte ho?', [
        'Vercel', 'Netlify', 'Railway', 'Render', 'AWS', 'DigitalOcean', 'Heroku', 'None'
    ]);
    if (!deployTarget)
        return undefined;
    const license = await pick('Project ka license?', ['MIT', 'Apache 2.0', 'GPL 3.0', 'ISC', 'None']);
    if (!license)
        return undefined;
    return {
        projectName,
        projectType: projectType,
        quickStack: 'Custom',
        frontendLanguage: language.toLowerCase().includes('typescript') ? 'typescript' : 'javascript',
        frontendFramework: frontendFramework,
        cssFramework: cssFramework,
        uiLibrary: uiLibrary,
        stateManagement: stateManagement,
        buildTool: buildTool,
        animationLibrary: animationLibrary,
        backendLanguage: 'Node.js',
        backendFramework: backendFramework,
        database: database,
        orm: 'None',
        features: features,
        deployTarget: deployTarget,
        license: license
    };
}
//# sourceMappingURL=questions.js.map