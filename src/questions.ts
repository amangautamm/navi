import * as vscode from 'vscode';
import { ProjectConfig } from './types';

async function pick(title: string, items: string[], canPickMany = false): Promise<string | string[] | undefined> {
  if (canPickMany) {
    const result = await vscode.window.showQuickPick(items, { placeHolder: title, canPickMany: true, title });
    return result;
  }
  return vscode.window.showQuickPick(items, { placeHolder: title, title });
}

async function input(prompt: string, placeholder: string): Promise<string | undefined> {
  return vscode.window.showInputBox({ prompt, placeHolder: placeholder });
}

export async function askQuestions(): Promise<ProjectConfig | undefined> {
  const projectName = await input('Project ka naam kya hai?', 'my-awesome-project');
  if (!projectName) return undefined;

  const projectType = await pick('Kaunsi website banana chahte ho?', [
    'E-Commerce', 'Blog / News Portal', 'Portfolio', 'SaaS Dashboard',
    'Social Media App', 'Food Delivery App', 'Hospital Management',
    'School Management', 'Real Estate', 'Job Portal', 'Chat Application', 'Custom'
  ]);
  if (!projectType) return undefined;

  const language = await pick('Kaunsi language use karni hai?', ['TypeScript', 'JavaScript']);
  if (!language) return undefined;

  const frontendFramework = await pick('Frontend framework kaunsa use karoge?', [
    'React.js', 'Next.js', 'Vue.js', 'Nuxt.js', 'Angular', 'Svelte',
    'SvelteKit', 'Solid.js', 'Astro', 'Remix', 'Gatsby',
    'Vanilla HTML/CSS/JS', 'None (Backend only)'
  ]);
  if (!frontendFramework) return undefined;

  const cssFramework = await pick('CSS framework kaunsa use karoge?', [
    'Tailwind CSS', 'Bootstrap 5', 'Bulma', 'Foundation', 'Materialize CSS',
    'Skeleton CSS', 'Pure CSS', 'SASS/SCSS only', 'LESS', 'None'
  ]);
  if (!cssFramework) return undefined;

  const uiLibrary = await pick('UI Component Library?', [
    'ShadCN UI', 'Material UI (MUI)', 'Ant Design', 'Chakra UI', 'Mantine',
    'DaisyUI', 'Radix UI', 'Headless UI', 'PrimeReact', 'Flowbite', 'None'
  ]);
  if (!uiLibrary) return undefined;

  const stateManagement = await pick('State Management?', [
    'Redux Toolkit', 'Zustand', 'Recoil', 'Jotai', 'MobX',
    'Pinia (Vue)', 'NgRx (Angular)', 'Context API only', 'None'
  ]);
  if (!stateManagement) return undefined;

  const buildTool = await pick('Build Tool?', [
    'Vite', 'Webpack', 'Parcel', 'Rollup', 'Turbopack', 'Default (Framework CLI)'
  ]);
  if (!buildTool) return undefined;

  const animationLibrary = await pick('Animation Library?', [
    'Framer Motion', 'GSAP', 'Three.js (3D)', 'AOS (Animate on Scroll)', 'Lottie', 'None'
  ]);
  if (!animationLibrary) return undefined;

  const backendFramework = await pick('Backend framework kaunsa use karoge?', [
    'Express.js', 'Fastify', 'NestJS', 'Hono', 'Koa.js',
    'FastAPI (Python)', 'Django (Python)', 'Spring Boot (Java)', 'None (Frontend only)'
  ]);
  if (!backendFramework) return undefined;

  const database = await pick('Database kaunsa use karoge?', [
    'MongoDB (Mongoose)', 'PostgreSQL (Prisma)', 'MySQL (Prisma)', 'SQLite (Prisma)',
    'Firebase Firestore', 'Supabase', 'PlanetScale', 'Redis', 'None'
  ]);
  if (!database) return undefined;

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
  ], true) as string[];
  if (!features) return undefined;

  const deployTarget = await pick('Deploy kahan karna chahte ho?', [
    'Vercel', 'Netlify', 'Railway', 'Render', 'AWS', 'DigitalOcean', 'Heroku', 'None'
  ]);
  if (!deployTarget) return undefined;

  const license = await pick('Project ka license?', ['MIT', 'Apache 2.0', 'GPL 3.0', 'ISC', 'None']);
  if (!license) return undefined;

  return {
    projectName,
    projectType: projectType as string,
    quickStack: 'Custom',
    frontendLanguage: (language as string).toLowerCase().includes('typescript') ? 'typescript' : 'javascript',
    frontendFramework: frontendFramework as string,
    cssFramework: cssFramework as string,
    uiLibrary: uiLibrary as string,
    stateManagement: stateManagement as string,
    buildTool: buildTool as string,
    animationLibrary: animationLibrary as string,
    backendLanguage: 'Node.js',
    backendFramework: backendFramework as string,
    database: database as string,
    orm: 'None',
    features: features as string[],
    deployTarget: deployTarget as string,
    license: license as string
  };
}
