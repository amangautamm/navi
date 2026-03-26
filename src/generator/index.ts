import * as path from 'path';
import * as childProcess from 'child_process';
import { ProjectConfig } from '../types';
import { writeFile, createDir } from '../utils/fileSystem';
import {
  getExpressServerTemplate, getAuthRoutesTemplate, getAuthControllerTemplate,
  getAuthMiddlewareTemplate, getBackendDeps
} from './backend';
import { getDatabaseConfig, getUserModel, getPrismaSchema, getDatabaseDeps } from './database';
import {
  getEnvTemplate, getPaymentTemplate, getEmailTemplate,
  getDockerfileTemplate, getDockerComposeTemplate, getGithubActionsTemplate,
  getEslintConfig, getPrettierConfig, getEslintIgnore,
  getVercelConfig, getNetlifyConfig, getRailwayConfig,
  getSmsService, getRedisService, getOauthConfig, getOauthRoutes,
  getRbacMiddleware, getFileUploadMiddleware, getFileUploadController, getFileUploadRoutes,
  getPushNotificationService, getElasticsearchService, getSentrySetup,
  getAuthTestTemplate, getHealthTestTemplate, getThemeCssVariables,
  getS3Service, getBullMQWorker, getPlaywrightConfig, getI18nConfig
} from './features';
import {
  getFrontendDeps, getReactAppTemplate, getIndexHtmlTemplate,
  getTailwindConfig, getViteConfig
} from './frontend';
import {
  getVueAppTemplate, getSvelteAppTemplate, getAngularAppTemplate, getVanillaHtmlTemplate
} from './features';
import {
  getFastAPIMain, getFastAPIRequirements, getFastAPIEnv, getFastAPIDockerfile,
  getFastAPIAuthRouter, getFastAPIUsersRouter,
  getDjangoRequirements, getDjangoSettings, getDjangoManagePy, getDjangoDockerfile
} from './python';
import {
  getSpringBootPomXml, getSpringBootApplicationJava, getSpringBootAppProperties,
  getSpringBootHealthController, getSpringBootDockerfile, getJavaGitignore
} from './java';
import { getGoMain, getGoMod } from './go';
import { getPhpIndex, getPhpComposerJson } from './php';
import { getRubyAppRb, getRubyGemfile } from './ruby';
import { getCsharpProgram, getCsharpCsproj } from './csharp';
import { exportConfig } from '../utils/configManager';

export async function generateProject(config: ProjectConfig, targetPath: string): Promise<string> {
  const root = path.join(targetPath, config.projectName);
  createDir(root);

  const isFastAPI = config.backendFramework === 'FastAPI (Python)';
  const isDjango = config.backendFramework === 'Django (Python)';
  const isSpringBoot = config.backendFramework === 'Spring Boot (Java)';
  const isGo = ['Gin', 'Echo', 'Fiber'].includes(config.backendFramework) || config.backendLanguage === 'Go';
  const isPhp = ['Laravel', 'Symfony', 'CodeIgniter'].includes(config.backendFramework) || config.backendLanguage === 'PHP';
  const isRuby = ['Ruby on Rails', 'Sinatra'].includes(config.backendFramework) || config.backendLanguage === 'Ruby';
  const isCsharp = config.backendFramework === 'ASP.NET Core' || config.backendLanguage === 'C#';

  const isOtherLanguage = isFastAPI || isDjango || isSpringBoot || isGo || isPhp || isRuby || isCsharp;

  const isFullStack = config.frontendFramework !== 'None (Backend only)' && config.backendFramework !== 'None (Frontend only)';
  const hasFrontend = config.frontendFramework !== 'None (Backend only)';
  const hasBackend = config.backendFramework !== 'None (Frontend only)';

  // For Node.js backends use the existing generators
  if (!isOtherLanguage) {
    await generatePackageJson(config, root, isFullStack, hasFrontend, hasBackend);
    if (hasBackend) await generateBackend(config, root, isFullStack);
  } else {
    // For Python/Java/Go/PHP/Ruby/C#: generate in a dedicated backend subfolder if fullstack, else root
    const backendRoot = isFullStack ? path.join(root, 'backend') : root;
    createDir(backendRoot);

    if (isFastAPI) await generateFastAPIBackend(config, backendRoot);
    else if (isDjango) await generateDjangoBackend(config, backendRoot);
    else if (isSpringBoot) await generateSpringBootBackend(config, backendRoot);
    else if (isGo) {
      writeFile(path.join(backendRoot, 'main.go'), getGoMain(config));
      writeFile(path.join(backendRoot, 'go.mod'), getGoMod(config));
    } else if (isPhp) {
      writeFile(path.join(backendRoot, 'index.php'), getPhpIndex(config));
      writeFile(path.join(backendRoot, 'composer.json'), getPhpComposerJson(config));
    } else if (isRuby) {
      writeFile(path.join(backendRoot, 'app.rb'), getRubyAppRb(config));
      writeFile(path.join(backendRoot, 'Gemfile'), getRubyGemfile(config));
    } else if (isCsharp) {
      writeFile(path.join(backendRoot, 'Program.cs'), getCsharpProgram(config));
      writeFile(path.join(backendRoot, `${config.projectName.replace(/[\\s-]/g, "")}.csproj`), getCsharpCsproj(config));
    }
  }

  if (hasFrontend) await generateFrontend(config, root, isFullStack);
  await generateCommonFiles(config, root);

  // ESLint + Prettier (Node.js only)
  if (config.features.includes('ESLint + Prettier') && !isOtherLanguage) {
    writeFile(path.join(root, '.eslintrc.json'), getEslintConfig(config));
    writeFile(path.join(root, '.prettierrc'), getPrettierConfig());
    writeFile(path.join(root, '.eslintignore'), getEslintIgnore());
    writeFile(path.join(root, '.prettierignore'), `node_modules\ndist\nout\nbuild\n`);
  }

  // Docker
  if (config.features.includes('Docker Support') && !isOtherLanguage) {
    writeFile(path.join(root, 'Dockerfile'), getDockerfileTemplate(config));
    writeFile(path.join(root, 'docker-compose.yml'), getDockerComposeTemplate(config));
    writeFile(path.join(root, '.dockerignore'), `node_modules\n.env\ndist\nout\n.git\ncoverage\n`);
  }

  // CI/CD
  if (config.features.includes('CI/CD (GitHub Actions)')) {
    createDir(path.join(root, '.github', 'workflows'));
    writeFile(path.join(root, '.github', 'workflows', 'ci.yml'), getGithubActionsTemplate(config));
  }

  // Deployment configs
  if (config.deployTarget === 'Vercel') writeFile(path.join(root, 'vercel.json'), getVercelConfig(config));
  if (config.deployTarget === 'Netlify') writeFile(path.join(root, 'netlify.toml'), getNetlifyConfig(config));
  if (config.deployTarget === 'Railway') writeFile(path.join(root, 'railway.toml'), getRailwayConfig(config));

  // Export config for re-use next time
  exportConfig(config, root);

  // Git init
  try {
    childProcess.execSync('git init', { cwd: root, stdio: 'ignore' });
    childProcess.execSync('git add .', { cwd: root, stdio: 'ignore' });
    childProcess.execSync('git commit -m "🧭 Initial commit by Navi"', { cwd: root, stdio: 'ignore' });
  } catch {
    // Git might not be available — skip silently
  }

  return root;
}

async function generatePackageJson(
  config: ProjectConfig, root: string,
  isFullStack: boolean, hasFrontend: boolean, hasBackend: boolean
) {
  if (isFullStack) return; // Monorepo — each has its own package.json

  const backendDeps = hasBackend ? getBackendDeps(config) : [];
  const dbDeps = getDatabaseDeps(config);
  const frontendDeps = hasFrontend ? getFrontendDeps(config) : [];
  const allDeps = [...new Set([...backendDeps, ...dbDeps, ...frontendDeps])];

  if (config.features.includes('SMS Service (Twilio)')) allDeps.push('twilio');
  if (config.features.includes('Caching (Redis)')) allDeps.push('ioredis');
  if (config.features.includes('Search (Elasticsearch)')) allDeps.push('@elastic/elasticsearch');
  if (config.features.includes('Push Notifications (Web Push)')) allDeps.push('web-push');
  if (config.features.includes('OAuth (Google/GitHub)')) allDeps.push('passport', 'passport-google-oauth20', 'passport-github2', 'express-session');
  if (config.features.includes('File Upload (Multer)')) allDeps.push('multer');
  if (config.features.includes('Error Tracking (Sentry)')) allDeps.push('@sentry/node');

  const devDeps: Record<string, string> = {
    typescript: '^5.0.0', '@types/node': '^18.0.0', 'ts-node': '^10.9.0', nodemon: '^3.0.0'
  };
  if (hasBackend) { devDeps['@types/express'] = '^4.17.0'; devDeps['@types/cors'] = '^2.8.0'; }
  if (config.features.includes('JWT Authentication')) { devDeps['@types/jsonwebtoken'] = '^9.0.0'; devDeps['@types/bcryptjs'] = '^2.4.0'; }
  if (config.features.includes('File Upload (Multer)')) devDeps['@types/multer'] = '^1.4.0';
  if (config.features.includes('Testing (Jest)')) { devDeps['jest'] = '^29.0.0'; devDeps['@types/jest'] = '^29.0.0'; devDeps['ts-jest'] = '^29.0.0'; devDeps['supertest'] = '^6.0.0'; devDeps['@types/supertest'] = '^2.0.0'; }
  if (config.features.includes('E2E Testing (Playwright)')) { devDeps['@playwright/test'] = '^1.40.0'; devDeps['@types/node'] = '^20.0.0'; }
  if (config.features.includes('ESLint + Prettier')) { devDeps['eslint'] = '^8.0.0'; devDeps['prettier'] = '^3.0.0'; devDeps['eslint-config-prettier'] = '^9.0.0'; }

  const depsObj: Record<string, string> = {};
  [...new Set(allDeps)].forEach(dep => { depsObj[dep] = 'latest'; });

  const scripts: Record<string, string> = {};
  if (hasBackend) { scripts['start'] = 'node dist/server.js'; scripts['dev'] = 'nodemon src/server.ts'; scripts['build'] = 'tsc'; }
  if (hasFrontend && !hasBackend) { scripts['dev'] = 'vite'; scripts['build'] = 'vite build'; scripts['preview'] = 'vite preview'; }
  if (config.features.includes('Testing (Jest)')) scripts['test'] = 'jest --coverage';
  if (config.features.includes('ESLint + Prettier')) { scripts['lint'] = 'eslint src/**/*.ts'; scripts['format'] = 'prettier --write src/**/*.ts'; }
  if (config.orm === 'Prisma') { scripts['prisma:generate'] = 'prisma generate'; scripts['prisma:migrate'] = 'prisma migrate dev'; }

  writeFile(path.join(root, 'package.json'), JSON.stringify({
    name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    description: `${config.projectName} - Generated by Navi 🧭`,
    main: hasBackend ? 'dist/server.js' : 'index.js',
    scripts,
    dependencies: depsObj,
    devDependencies: devDeps,
    license: config.license === 'None' ? 'ISC' : config.license,
  }, null, 2));
}

// ─── Python Generators ──────────────────────────────────────────────────────

async function generateFastAPIBackend(config: ProjectConfig, backendRoot: string): Promise<void> {
  const hasAuth = config.features.includes('JWT Authentication');
  createDir(path.join(backendRoot, 'routers'));

  writeFile(path.join(backendRoot, 'main.py'), getFastAPIMain(config));
  writeFile(path.join(backendRoot, 'requirements.txt'), getFastAPIRequirements(config));
  writeFile(path.join(backendRoot, '.env'), getFastAPIEnv(config));
  writeFile(path.join(backendRoot, '.env.example'), getFastAPIEnv(config).replace(/=.+/gm, '='));
  writeFile(path.join(backendRoot, 'Dockerfile'), getFastAPIDockerfile());
  writeFile(path.join(backendRoot, '.gitignore'), `__pycache__/\n*.pyc\n*.pyo\n.env\nvenv/\n.venv/\n`);
  writeFile(path.join(backendRoot, 'routers', '__init__.py'), '');
  writeFile(path.join(backendRoot, 'routers', 'users.py'), getFastAPIUsersRouter());
  if (hasAuth) writeFile(path.join(backendRoot, 'routers', 'auth.py'), getFastAPIAuthRouter(config));
  writeFile(path.join(backendRoot, 'README.md'), `# ${config.projectName} — FastAPI Backend\n\nGenerated by Navi 🧭\n\n## Setup\n\n\`\`\`bash\npython -m venv venv\nsource venv/bin/activate  # Windows: venv\\Scripts\\activate\npip install -r requirements.txt\ncp .env.example .env\nuvicorn main:app --reload\n\`\`\`\n`);
}

async function generateDjangoBackend(config: ProjectConfig, backendRoot: string): Promise<void> {
  const modName = config.projectName.toLowerCase().replace(/\s+/g, '_');
  createDir(path.join(backendRoot, modName));
  createDir(path.join(backendRoot, 'api'));

  writeFile(path.join(backendRoot, 'manage.py'), getDjangoManagePy(config));
  writeFile(path.join(backendRoot, 'requirements.txt'), getDjangoRequirements(config));
  writeFile(path.join(backendRoot, modName, '__init__.py'), '');
  writeFile(path.join(backendRoot, modName, 'settings.py'), getDjangoSettings(config));
  writeFile(path.join(backendRoot, modName, 'urls.py'), `from django.contrib import admin\nfrom django.urls import path, include\n\nurlpatterns = [\n    path('admin/', admin.site.urls),\n    path('api/', include('api.urls')),\n]\n`);
  writeFile(path.join(backendRoot, modName, 'wsgi.py'), `import os\nfrom django.core.wsgi import get_wsgi_application\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', '${modName}.settings')\napplication = get_wsgi_application()\n`);
  writeFile(path.join(backendRoot, 'api', '__init__.py'), '');
  writeFile(path.join(backendRoot, 'api', 'views.py'), `from rest_framework.decorators import api_view\nfrom rest_framework.response import Response\n\n@api_view(['GET'])\ndef health(request):\n    return Response({'status': 'ok', 'message': '🧭 Navi Django is running!'})\n`);
  writeFile(path.join(backendRoot, 'api', 'urls.py'), `from django.urls import path\nfrom . import views\n\nurlpatterns = [\n    path('health/', views.health),\n]\n`);
  writeFile(path.join(backendRoot, 'Dockerfile'), getDjangoDockerfile());
  writeFile(path.join(backendRoot, '.gitignore'), `__pycache__/\n*.pyc\n*.pyo\n.env\nvenv/\n.venv/\ndb.sqlite3\n`);
  writeFile(path.join(backendRoot, 'README.md'), `# ${config.projectName} — Django Backend\n\nGenerated by Navi 🧭\n\n## Setup\n\n\`\`\`bash\npython -m venv venv\nsource venv/bin/activate\npip install -r requirements.txt\npython manage.py migrate\npython manage.py runserver\n\`\`\`\n`);
}

// ─── Spring Boot Generator ───────────────────────────────────────────────────

async function generateSpringBootBackend(config: ProjectConfig, backendRoot: string): Promise<void> {
  const pkg = `com.navi.${config.projectName.toLowerCase().replace(/[\s-]/g, '')}`;
  const pkgPath = pkg.replace(/\./g, '/');
  const srcMain = path.join(backendRoot, 'src', 'main', 'java', pkgPath);
  const srcResources = path.join(backendRoot, 'src', 'main', 'resources');
  const srcTest = path.join(backendRoot, 'src', 'test', 'java', pkgPath);
  const controllerPath = path.join(srcMain, 'controller');

  createDir(srcMain);
  createDir(srcResources);
  createDir(srcTest);
  createDir(controllerPath);

  const className = config.projectName.replace(/[\s-]/g, '') + 'Application';

  writeFile(path.join(backendRoot, 'pom.xml'), getSpringBootPomXml(config));
  writeFile(path.join(srcMain, `${className}.java`), getSpringBootApplicationJava(config));
  writeFile(path.join(srcResources, 'application.properties'), getSpringBootAppProperties(config));
  writeFile(path.join(controllerPath, 'HealthController.java'), getSpringBootHealthController(config));
  writeFile(path.join(backendRoot, 'Dockerfile'), getSpringBootDockerfile());
  writeFile(path.join(backendRoot, '.gitignore'), getJavaGitignore());
  writeFile(path.join(backendRoot, 'README.md'), `# ${config.projectName} — Spring Boot Backend\n\nGenerated by Navi 🧭\n\n## Prerequisites\n- Java 17+\n- Maven 3.9+\n\n## Setup\n\n\`\`\`bash\n# Copy env config\ncp src/main/resources/application.properties.example src/main/resources/application.properties\n\n# Run\nmvn spring-boot:run\n\`\`\`\n\n## Health Check\n\`GET http://localhost:8080/health\`\n`);
}

// ─── Node.js Backend Generator ────────────────────────────────────────────────

async function generateBackend(config: ProjectConfig, root: string, isFullStack: boolean) {
  const backendRoot = isFullStack ? path.join(root, 'backend') : root;
  const src = path.join(backendRoot, 'src');
  const ext = config.frontendLanguage === 'typescript' ? 'ts' : 'js';

  // Create all directories
  ['config', 'controllers', 'middleware', 'models', 'routes', 'validators', 'utils', 'services', 'tests'].forEach(dir => {
    createDir(path.join(src, dir));
  });

  // Server entry
  writeFile(path.join(src, `server.${ext}`), getExpressServerTemplate(config));

  // Database config
  writeFile(path.join(src, 'config', `database.${ext}`), getDatabaseConfig(config));

  // Auth
  if (config.features.includes('JWT Authentication')) {
    writeFile(path.join(src, 'routes', `auth.routes.${ext}`), getAuthRoutesTemplate(config));
    writeFile(path.join(src, 'controllers', `auth.controller.${ext}`), getAuthControllerTemplate());
    writeFile(path.join(src, 'middleware', `auth.middleware.${ext}`), getAuthMiddlewareTemplate());
    writeFile(path.join(src, 'models', `user.model.${ext}`), getUserModel(config));
    writeFile(path.join(src, 'validators', `auth.validator.${ext}`), getAuthValidatorTemplate());
  }

  // OAuth
  if (config.features.includes('OAuth (Google/GitHub)')) {
    writeFile(path.join(src, 'config', `oauth.${ext}`), getOauthConfig());
    writeFile(path.join(src, 'routes', `oauth.routes.${ext}`), getOauthRoutes());
  }

  // RBAC
  if (config.features.includes('Role Based Access Control (RBAC)')) {
    writeFile(path.join(src, 'middleware', `rbac.middleware.${ext}`), getRbacMiddleware());
  }

  // User routes
  writeFile(path.join(src, 'routes', `user.routes.${ext}`), getUserRoutesTemplate(config));
  writeFile(path.join(src, 'controllers', `user.controller.${ext}`), getUserControllerTemplate());

  // File Upload
  if (config.features.includes('File Upload (Multer)')) {
    writeFile(path.join(src, 'middleware', `upload.middleware.${ext}`), getFileUploadMiddleware());
    writeFile(path.join(src, 'controllers', `upload.controller.${ext}`), getFileUploadController());
    writeFile(path.join(src, 'routes', `upload.routes.${ext}`), getFileUploadRoutes());
    createDir(path.join(backendRoot, 'uploads'));
    writeFile(path.join(backendRoot, 'uploads', '.gitkeep'), '');
  }

  // Payment
  const paymentTemplate = getPaymentTemplate(config);
  if (paymentTemplate) {
    writeFile(path.join(src, 'controllers', `payment.controller.${ext}`), paymentTemplate);
    writeFile(path.join(src, 'routes', `payment.routes.${ext}`), getPaymentRoutesTemplate(config));
  }

  // Email
  if (config.features.includes('Email Service (Nodemailer)')) {
    writeFile(path.join(src, 'services', `email.service.${ext}`), getEmailTemplate());
  }

  // SMS
  if (config.features.includes('SMS Service (Twilio)')) {
    writeFile(path.join(src, 'services', `sms.service.${ext}`), getSmsService());
  }

  // Redis Caching
  if (config.features.includes('Caching (Redis)')) {
    writeFile(path.join(src, 'services', `redis.service.${ext}`), getRedisService());
  }

  // Push Notifications
  if (config.features.includes('Push Notifications (Web Push)')) {
    writeFile(path.join(src, 'services', `push.service.${ext}`), getPushNotificationService());
    writeFile(path.join(src, 'routes', `push.routes.${ext}`), getPushRoutesTemplate());
  }

  // Elasticsearch
  if (config.features.includes('Search (Elasticsearch)')) {
    writeFile(path.join(src, 'services', `search.service.${ext}`), getElasticsearchService());
  }

  // Sentry
  if (config.features.includes('Error Tracking (Sentry)')) {
    writeFile(path.join(src, 'config', `sentry.${ext}`), getSentrySetup(config));
  }

  // Cloud Storage (AWS S3)
  if (config.features.includes('Cloud Storage (AWS S3)')) {
    writeFile(path.join(src, 'services', `s3.service.${ext}`), getS3Service());
  }

  // BullMQ Worker
  if (config.features.includes('Background Jobs (BullMQ)')) {
    createDir(path.join(src, 'workers'));
    writeFile(path.join(src, 'workers', `index.${ext}`), getBullMQWorker());
  }

  // Jest Tests
  if (config.features.includes('Testing (Jest)')) {
    writeFile(path.join(src, 'tests', `health.test.${ext}`), getHealthTestTemplate());
    if (config.features.includes('JWT Authentication')) {
      writeFile(path.join(src, 'tests', `auth.test.${ext}`), getAuthTestTemplate(config));
    }
    writeFile(path.join(backendRoot, 'jest.config.js'), `module.exports = { preset: 'ts-jest', testEnvironment: 'node', roots: ['<rootDir>/src/tests'], testMatch: ['**/*.test.ts'] };\n`);
  }

  // Prisma schema
  if (config.orm === 'Prisma') {
    createDir(path.join(backendRoot, 'prisma'));
    writeFile(path.join(backendRoot, 'prisma', 'schema.prisma'), getPrismaSchema(config));
  }

  // tsconfig for backend
  writeFile(path.join(backendRoot, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2020', module: 'commonjs', lib: ['ES2020'],
      outDir: './dist', rootDir: './src', strict: true,
      esModuleInterop: true, skipLibCheck: true, resolveJsonModule: true,
      experimentalDecorators: true, emitDecoratorMetadata: true
    },
    exclude: ['node_modules', 'dist']
  }, null, 2));

  // Nodemon config
  writeFile(path.join(backendRoot, 'nodemon.json'), JSON.stringify({
    watch: ['src'],
    ext: 'ts,json',
    ignore: ['src/**/*.test.ts'],
    exec: 'ts-node src/server.ts'
  }, null, 2));

  // Backend package.json for monorepo
  if (isFullStack) {
    const backendDeps = getBackendDeps(config);
    const dbDeps = getDatabaseDeps(config);
    const extraDeps: string[] = [];
    if (config.features.includes('SMS Service (Twilio)')) extraDeps.push('twilio');
    if (config.features.includes('Caching (Redis)')) extraDeps.push('ioredis');
    if (config.features.includes('Search (Elasticsearch)')) extraDeps.push('@elastic/elasticsearch');
    if (config.features.includes('Push Notifications (Web Push)')) extraDeps.push('web-push');
    if (config.features.includes('OAuth (Google/GitHub)')) extraDeps.push('passport', 'passport-google-oauth20', 'passport-github2', 'express-session');
    if (config.features.includes('File Upload (Multer)')) extraDeps.push('multer');
    if (config.features.includes('Error Tracking (Sentry)')) extraDeps.push('@sentry/node');

    const allDeps: Record<string, string> = {};
    [...new Set([...backendDeps, ...dbDeps, ...extraDeps])].forEach(d => { allDeps[d] = 'latest'; });

    const scripts: Record<string, string> = { start: 'node dist/server.js', dev: 'nodemon', build: 'tsc' };
    if (config.features.includes('Testing (Jest)')) scripts['test'] = 'jest --coverage';
    if (config.features.includes('ESLint + Prettier')) { scripts['lint'] = 'eslint src/**/*.ts'; scripts['format'] = 'prettier --write src/**/*.ts'; }
    if (config.orm === 'Prisma') { scripts['prisma:generate'] = 'prisma generate'; scripts['prisma:migrate'] = 'prisma migrate dev'; }

    writeFile(path.join(backendRoot, 'package.json'), JSON.stringify({
      name: `${config.projectName.toLowerCase()}-backend`,
      version: '1.0.0',
      scripts,
      dependencies: allDeps,
      devDependencies: {
        typescript: '^5.0.0', '@types/node': '^18.0.0', '@types/express': '^4.17.0',
        'ts-node': '^10.9.0', nodemon: '^3.0.0',
        ...(config.features.includes('JWT Authentication') ? { '@types/jsonwebtoken': '^9.0.0', '@types/bcryptjs': '^2.4.0' } : {}),
        ...(config.features.includes('Testing (Jest)') ? { jest: '^29.0.0', '@types/jest': '^29.0.0', 'ts-jest': '^29.0.0', supertest: '^6.0.0', '@types/supertest': '^2.0.0' } : {}),
        ...(config.features.includes('ESLint + Prettier') ? { eslint: '^8.0.0', prettier: '^3.0.0', 'eslint-config-prettier': '^9.0.0' } : {})
      }
    }, null, 2));
  }
}

async function generateFrontend(config: ProjectConfig, root: string, isFullStack: boolean) {
  const frontendRoot = isFullStack ? path.join(root, 'frontend') : root;
  const src = path.join(frontendRoot, 'src');

  ['components', 'pages', 'hooks', 'utils', 'services', 'context', 'assets', 'styles'].forEach(dir => {
    createDir(path.join(src, dir));
  });

  const { frontendFramework, frontendLanguage: language } = config;
  const isReact = ['React.js', 'Next.js', 'Remix', 'Gatsby'].includes(frontendFramework);
  const isVue = ['Vue.js', 'Nuxt.js'].includes(frontendFramework);
  const isSvelte = ['Svelte', 'SvelteKit'].includes(frontendFramework);
  const isAngular = frontendFramework === 'Angular';
  const isVanilla = frontendFramework === 'Vanilla HTML/CSS/JS';

  // Generate appropriate App template
  if (isReact) {
    const ext = language === 'typescript' ? 'tsx' : 'jsx';
    writeFile(path.join(src, `App.${ext}`), getReactAppTemplate(config));
    writeFile(path.join(src, `main.${ext}`), getMainTemplate(config));
    writeFile(path.join(frontendRoot, 'index.html'), getIndexHtmlTemplate(config));
    writeFile(path.join(frontendRoot, `vite.config.${language === 'typescript' ? 'ts' : 'js'}`), getViteConfig(config));

    if (config.features.includes('JWT Authentication')) {
      const fe = language === 'typescript' ? 'tsx' : 'jsx';
      const be = language === 'typescript' ? 'ts' : 'js';
      writeFile(path.join(src, 'pages', `Login.${fe}`), getLoginPageTemplate(config));
      writeFile(path.join(src, 'pages', `Register.${fe}`), getRegisterPageTemplate(config));
      writeFile(path.join(src, 'context', `AuthContext.${fe}`), getAuthContextTemplate(config));
      writeFile(path.join(src, 'services', `auth.service.${be}`), getAuthServiceTemplate());
    }

    writeFile(path.join(src, 'pages', `Home.${language === 'typescript' ? 'tsx' : 'jsx'}`), getHomePageTemplate(config));

  } else if (isVue) {
    writeFile(path.join(src, 'App.vue'), getVueAppTemplate(config));
    writeFile(path.join(src, `main.${language === 'typescript' ? 'ts' : 'js'}`), `import { createApp } from 'vue'\nimport App from './App.vue'\nimport './styles/index.css'\ncreateApp(App).mount('#app')\n`);
    writeFile(path.join(frontendRoot, 'index.html'), getIndexHtmlTemplate(config));

  } else if (isSvelte) {
    writeFile(path.join(src, 'App.svelte'), getSvelteAppTemplate(config));
    writeFile(path.join(src, `main.${language === 'typescript' ? 'ts' : 'js'}`), `import App from './App.svelte'\nconst app = new App({ target: document.body })\nexport default app\n`);
    writeFile(path.join(frontendRoot, 'index.html'), getIndexHtmlTemplate(config));

  } else if (isAngular) {
    createDir(path.join(src, 'app'));
    writeFile(path.join(src, 'app', 'app.component.ts'), getAngularAppTemplate(config));
    writeFile(path.join(src, 'app', 'app.module.ts'), getAngularModuleTemplate(config));
    writeFile(path.join(src, `main.ts`), `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\nimport { AppModule } from './app/app.module';\nplatformBrowserDynamic().bootstrapModule(AppModule).catch(console.error);\n`);
    writeFile(path.join(frontendRoot, 'index.html'), `<!DOCTYPE html>\n<html>\n<head><meta charset="utf-8"><title>${config.projectName}</title></head>\n<body><app-root></app-root></body>\n</html>\n`);

  } else if (isVanilla) {
    writeFile(path.join(frontendRoot, 'index.html'), getVanillaHtmlTemplate(config));
    writeFile(path.join(frontendRoot, 'styles.css'), getThemeCssVariables());
    writeFile(path.join(frontendRoot, 'app.js'), `// ${config.projectName} - Generated by Navi 🧭\nconsole.log('App started!');\n`);
  }

  // CSS / Theme
  writeFile(path.join(src, 'styles', 'index.css'), getCssTemplate(config));
  writeFile(path.join(src, 'styles', 'variables.css'), getThemeCssVariables());

  if (config.cssFramework === 'Tailwind CSS') {
    writeFile(path.join(frontendRoot, 'tailwind.config.js'), getTailwindConfig());
    writeFile(path.join(frontendRoot, 'postcss.config.js'), `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }\n`);
  }

  // Extra Frontend Features
  if (config.features.includes('E2E Testing (Playwright)')) {
    writeFile(path.join(frontendRoot, 'playwright.config.ts'), getPlaywrightConfig(config));
  }

  if (config.features.includes('Internationalization (i18n)') && isReact) {
    writeFile(path.join(src, `i18n.${language === 'typescript' ? 'ts' : 'js'}`), getI18nConfig(config));
  }

  // API service
  const svcExt = language === 'typescript' ? 'ts' : 'js';
  writeFile(path.join(src, 'services', `api.${svcExt}`), getApiServiceTemplate());

  // Frontend package.json for monorepo
  if (isFullStack) {
    const frontendDeps = getFrontendDeps(config);
    const extraDeps: string[] = [];
    if (config.stateManagement === 'Redux Toolkit') extraDeps.push('@reduxjs/toolkit', 'react-redux');
    if (config.stateManagement === 'Zustand') extraDeps.push('zustand');
    if (config.stateManagement === 'Recoil') extraDeps.push('recoil');
    if (config.stateManagement === 'Jotai') extraDeps.push('jotai');
    if (config.stateManagement === 'MobX') extraDeps.push('mobx', 'mobx-react-lite');
    if (config.animationLibrary === 'Framer Motion') extraDeps.push('framer-motion');
    if (config.animationLibrary === 'GSAP') extraDeps.push('gsap');
    if (config.animationLibrary === 'Three.js (3D)') extraDeps.push('three');
    if (config.animationLibrary === 'AOS (Animate on Scroll)') extraDeps.push('aos');
    if (config.animationLibrary === 'Lottie') extraDeps.push('lottie-react');
    if (config.features.includes('Internationalization (i18n)')) extraDeps.push('i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend');

    const depsObj: Record<string, string> = {};
    [...new Set([...frontendDeps, ...extraDeps])].forEach(d => { depsObj[d] = 'latest'; });

    const scripts: Record<string, string> = { dev: 'vite', build: 'tsc && vite build', preview: 'vite preview' };
    if (config.features.includes('ESLint + Prettier')) { scripts['lint'] = 'eslint src/**/*.tsx'; scripts['format'] = 'prettier --write src/**/*.tsx'; }

    writeFile(path.join(frontendRoot, 'package.json'), JSON.stringify({
      name: `${config.projectName.toLowerCase()}-frontend`,
      version: '1.0.0',
      scripts,
      dependencies: depsObj,
      devDependencies: {
        typescript: '^5.0.0',
        '@types/react': '^18.0.0', '@types/react-dom': '^18.0.0',
        '@vitejs/plugin-react': '^4.0.0', vite: '^5.0.0',
        ...(config.cssFramework === 'Tailwind CSS' ? { tailwindcss: 'latest', postcss: 'latest', autoprefixer: 'latest' } : {}),
        ...(config.features.includes('ESLint + Prettier') ? { eslint: '^8.0.0', prettier: '^3.0.0', 'eslint-plugin-react': '^7.0.0', 'eslint-plugin-react-hooks': '^4.0.0' } : {})
      }
    }, null, 2));

    writeFile(path.join(frontendRoot, 'tsconfig.json'), JSON.stringify({
      compilerOptions: {
        target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext', moduleResolution: 'bundler',
        jsx: 'react-jsx', strict: true, esModuleInterop: true,
        skipLibCheck: true, resolveJsonModule: true
      },
      include: ['src']
    }, null, 2));
  }
}

async function generateCommonFiles(config: ProjectConfig, root: string) {
  writeFile(path.join(root, '.env'), getEnvTemplate(config));
  writeFile(path.join(root, '.env.example'), getEnvTemplate(config).replace(/=.+/gm, '='));
  writeFile(path.join(root, '.gitignore'), getGitignoreTemplate());
  writeFile(path.join(root, 'README.md'), getReadmeTemplate(config));
  writeFile(path.join(root, 'CHANGELOG.md'), `# Changelog\n\n## [1.0.0] - ${new Date().toISOString().split('T')[0]}\n### Added\n- Initial project generated by Navi 🧭\n`);

  if (config.license === 'MIT') {
    writeFile(path.join(root, 'LICENSE'), `MIT License\n\nCopyright (c) ${new Date().getFullYear()}\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction.\n`);
  }
}

// ── Helper Templates ──────────────────────────────────────────────────────────

function getAuthValidatorTemplate(): string {
  return `import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
  if (password.length < 6) return res.status(400).json({ success: false, message: 'Password min 6 chars' });
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Invalid email' });
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  next();
};
`;
}

function getUserRoutesTemplate(config: ProjectConfig): string {
  const hasAuth = config.features.includes('JWT Authentication');
  const hasRbac = config.features.includes('Role Based Access Control (RBAC)');
  return `import { Router } from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
${hasAuth ? "import { authMiddleware } from '../middleware/auth.middleware';" : ''}
${hasRbac ? "import { requireRole } from '../middleware/rbac.middleware';" : ''}

const router = Router();

router.get('/', ${hasAuth ? "authMiddleware, " : ''}${hasRbac ? "requireRole('admin'), " : ''}getAllUsers);
router.get('/:id', ${hasAuth ? "authMiddleware, " : ''}getUserById);
router.put('/:id', ${hasAuth ? "authMiddleware, " : ''}updateUser);
router.delete('/:id', ${hasAuth ? "authMiddleware, " : ''}${hasRbac ? "requireRole('admin'), " : ''}deleteUser);

export default router;
`;
}

function getUserControllerTemplate(): string {
  return `import { Request, Response } from 'express';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Replace with your DB query
    res.json({ success: true, data: [], pagination: { page, limit, total: 0 } });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    // Replace with your DB query: findById(req.params.id)
    res.json({ success: true, data: null });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    // Replace with your DB query: findByIdAndUpdate(req.params.id, req.body)
    res.json({ success: true, data: null });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Replace with your DB query: findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
};
`;
}

function getPaymentRoutesTemplate(config: ProjectConfig): string {
  const isRazorpay = config.features.includes('Payment Gateway (Razorpay)');
  return `import { Router } from 'express';
import { ${isRazorpay ? 'createOrder, verifyPayment' : 'createPaymentIntent, stripeWebhook'} } from '../controllers/payment.controller';

const router = Router();
${isRazorpay
    ? "router.post('/create-order', createOrder);\nrouter.post('/verify', verifyPayment);"
    : "router.post('/create-intent', createPaymentIntent);\nrouter.post('/webhook', stripeWebhook);"}

export default router;
`;
}

function getPushRoutesTemplate(): string {
  return `import { Router } from 'express';
import { sendPushNotification } from '../services/push.service';

const router = Router();

// Store subscription (save to DB in production)
const subscriptions: any[] = [];

router.post('/subscribe', (req, res) => {
  subscriptions.push(req.body);
  res.json({ success: true, message: 'Subscribed to push notifications' });
});

router.post('/send', async (req, res) => {
  try {
    const { title, body } = req.body;
    for (const sub of subscriptions) {
      await sendPushNotification(sub, { title, body });
    }
    res.json({ success: true, message: \`Sent to \${subscriptions.length} subscribers\` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
`;
}

function getAngularModuleTemplate(config: ProjectConfig): string {
  return `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
`;
}

function getMainTemplate(config: ProjectConfig): string {
  const hasAuth = config.features.includes('JWT Authentication');
  const ext = config.frontendLanguage === 'typescript' ? 'tsx' : 'jsx';
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
${hasAuth ? "import { AuthProvider } from './context/AuthContext'" : ''}
${config.features.includes('Internationalization (i18n)') ? "import './i18n'\n" : ''}import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    ${hasAuth ? '<AuthProvider>' : ''}<App />${hasAuth ? '</AuthProvider>' : ''}
  </React.StrictMode>
)
`;
}

function getCssTemplate(config: ProjectConfig): string {
  if (config.cssFramework === 'Tailwind CSS') return `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n@import './variables.css';\n`;
  return `@import './variables.css';\n* { margin: 0; padding: 0; box-sizing: border-box; }\nbody { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--color-bg); color: var(--color-text); }\n`;
}

function getHomePageTemplate(config: ProjectConfig): string {
  const tw = config.cssFramework === 'Tailwind CSS';
  return `import React from 'react'\n\nconst Home = () => (\n  <div${tw ? ' className="container mx-auto px-4 py-8"' : ''}>\n    <h1${tw ? ' className="text-3xl font-bold"' : ''}>Welcome to ${config.projectName} 🚀</h1>\n    <p${tw ? ' className="text-gray-600 mt-2"' : ''}>Your project is ready! Start building something amazing.</p>\n  </div>\n)\n\nexport default Home\n`;
}

function getLoginPageTemplate(config: ProjectConfig): string {
  const tw = config.cssFramework === 'Tailwind CSS';
  return `import React, { useState } from 'react'\nimport { useAuth } from '../context/AuthContext'\n\nconst Login = () => {\n  const [email, setEmail] = useState('')\n  const [password, setPassword] = useState('')\n  const { login, loading } = useAuth()\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault()\n    await login(email, password)\n  }\n\n  return (\n    <div${tw ? ' className="min-h-screen flex items-center justify-center bg-gray-50"' : ''}>\n      <div${tw ? ' className="max-w-md w-full bg-white p-8 rounded-lg shadow"' : ''}>\n        <h2${tw ? ' className="text-2xl font-bold mb-6"' : ''}>Login</h2>\n        <form onSubmit={handleSubmit}>\n          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"${tw ? ' className="w-full border p-2 rounded mb-4"' : ''} required />\n          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password"${tw ? ' className="w-full border p-2 rounded mb-4"' : ''} required />\n          <button type="submit" disabled={loading}${tw ? ' className="w-full bg-blue-600 text-white py-2 rounded"' : ''}>{loading ? 'Logging in...' : 'Login'}</button>\n        </form>\n      </div>\n    </div>\n  )\n}\n\nexport default Login\n`;
}

function getRegisterPageTemplate(config: ProjectConfig): string {
  const tw = config.cssFramework === 'Tailwind CSS';
  return `import React, { useState } from 'react'\nimport { useAuth } from '../context/AuthContext'\n\nconst Register = () => {\n  const [form, setForm] = useState({ name: '', email: '', password: '' })\n  const { register, loading } = useAuth()\n\n  const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault()\n    await register(form.name, form.email, form.password)\n  }\n\n  return (\n    <div${tw ? ' className="min-h-screen flex items-center justify-center bg-gray-50"' : ''}>\n      <div${tw ? ' className="max-w-md w-full bg-white p-8 rounded-lg shadow"' : ''}>\n        <h2${tw ? ' className="text-2xl font-bold mb-6"' : ''}>Register</h2>\n        <form onSubmit={handleSubmit}>\n          <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name"${tw ? ' className="w-full border p-2 rounded mb-4"' : ''} required />\n          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email"${tw ? ' className="w-full border p-2 rounded mb-4"' : ''} required />\n          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password"${tw ? ' className="w-full border p-2 rounded mb-4"' : ''} required />\n          <button type="submit" disabled={loading}${tw ? ' className="w-full bg-green-600 text-white py-2 rounded"' : ''}>{loading ? 'Registering...' : 'Register'}</button>\n        </form>\n      </div>\n    </div>\n  )\n}\n\nexport default Register\n`;
}

function getAuthContextTemplate(config: ProjectConfig): string {
  return `import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'\nimport { authService } from '../services/auth.service'\n\ninterface User { id: string; name: string; email: string; role: string }\ninterface AuthContextType { user: User | null; token: string | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => void; }\n\nconst AuthContext = createContext<AuthContextType | undefined>(undefined)\n\nexport const AuthProvider = ({ children }: { children: ReactNode }) => {\n  const [user, setUser] = useState<User | null>(null)\n  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))\n  const [loading, setLoading] = useState(false)\n\n  useEffect(() => {\n    if (token) authService.getProfile(token).then(setUser).catch(() => { setToken(null); localStorage.removeItem('token') })\n  }, [token])\n\n  const login = async (email: string, password: string) => {\n    setLoading(true)\n    try { const data = await authService.login(email, password); setToken(data.token); setUser(data.user); localStorage.setItem('token', data.token) } finally { setLoading(false) }\n  }\n\n  const register = async (name: string, email: string, password: string) => {\n    setLoading(true)\n    try { const data = await authService.register(name, email, password); setToken(data.token); setUser(data.user); localStorage.setItem('token', data.token) } finally { setLoading(false) }\n  }\n\n  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('token') }\n\n  return <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>{children}</AuthContext.Provider>\n}\n\nexport const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }\n`;
}

function getAuthServiceTemplate(): string {
  return `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'\n\nexport const authService = {\n  login: async (email: string, password: string) => {\n    const res = await fetch(\`\${API_URL}/auth/login\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })\n    const data = await res.json(); if (!data.success) throw new Error(data.message); return data\n  },\n  register: async (name: string, email: string, password: string) => {\n    const res = await fetch(\`\${API_URL}/auth/register\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, password }) })\n    const data = await res.json(); if (!data.success) throw new Error(data.message); return data\n  },\n  getProfile: async (token: string) => {\n    const res = await fetch(\`\${API_URL}/auth/profile\`, { headers: { Authorization: \`Bearer \${token}\` } })\n    const data = await res.json(); if (!data.success) throw new Error(data.message); return data.user\n  }\n}\n`;
}

function getApiServiceTemplate(): string {
  return `const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'\nconst getToken = () => localStorage.getItem('token')\nconst headers = (auth = false) => ({ 'Content-Type': 'application/json', ...(auth && getToken() ? { Authorization: \`Bearer \${getToken()}\` } : {}) })\n\nexport const api = {\n  get: (endpoint: string, auth = true) => fetch(\`\${API_URL}\${endpoint}\`, { headers: headers(auth) }).then(r => r.json()),\n  post: (endpoint: string, body: any, auth = true) => fetch(\`\${API_URL}\${endpoint}\`, { method: 'POST', headers: headers(auth), body: JSON.stringify(body) }).then(r => r.json()),\n  put: (endpoint: string, body: any, auth = true) => fetch(\`\${API_URL}\${endpoint}\`, { method: 'PUT', headers: headers(auth), body: JSON.stringify(body) }).then(r => r.json()),\n  delete: (endpoint: string, auth = true) => fetch(\`\${API_URL}\${endpoint}\`, { method: 'DELETE', headers: headers(auth) }).then(r => r.json()),\n}\n`;
}

function getGitignoreTemplate(): string {
  return `node_modules/\ndist/\nout/\nbuild/\n.env\n.env.local\n.env.production\n*.log\n.DS_Store\ncoverage/\nuploads/\n!uploads/.gitkeep\nprisma/*.db\n`;
}

function getReadmeTemplate(config: ProjectConfig): string {
  const hasAuth = config.features.includes('JWT Authentication');
  const hasPrisma = config.orm === 'Prisma';
  return `# ${config.projectName} 🚀\n\n> Generated by **Navi 🧭**\n\n## Stack\n- **Frontend:** ${config.frontendFramework} + ${config.cssFramework} + ${config.uiLibrary}\n- **State:** ${config.stateManagement}\n- **Backend:** ${config.backendFramework}\n- **Database:** ${config.database}\n- **Features:** ${config.features.join(', ') || 'None'}\n- **Deploy:** ${config.deployTarget}\n\n## Getting Started\n\n\`\`\`bash\ngit clone your-repo-url\ncd ${config.projectName}\nnpm install\ncp .env.example .env\n# Edit .env with your values\nnpm run dev\n\`\`\`\n\n${hasPrisma ? '```bash\nnpm run prisma:generate\nnpm run prisma:migrate\n```\n\n' : ''}## API Endpoints\n\n| Method | Endpoint | Description |\n|--------|----------|-------------|\n| GET | /health | Health check |\n${hasAuth ? '| POST | /api/auth/register | Register |\n| POST | /api/auth/login | Login |\n| GET | /api/auth/profile | Profile |' : ''}\n| GET | /api/users | All users |\n${config.features.some(f => f.includes('Payment')) ? '| POST | /api/payment/create-order | Payment |' : ''}\n${config.features.includes('File Upload (Multer)') ? '| POST | /api/upload/single | File upload |' : ''}\n${config.features.includes('API Documentation (Swagger)') ? '\n📚 **Swagger:** http://localhost:5000/api/docs' : ''}\n\n---\n*Generated with ❤️ by Navi 🧭*\n`;
}
