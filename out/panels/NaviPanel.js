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
exports.NaviPanel = void 0;
const vscode = __importStar(require("vscode"));
class NaviPanel {
    static async show(extensionUri) {
        return new Promise((resolve) => {
            if (NaviPanel.currentPanel) {
                NaviPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
                NaviPanel.currentPanel._resolve = resolve;
                return;
            }
            const panel = vscode.window.createWebviewPanel('navi', '🧭 Navi — Create Project', vscode.ViewColumn.One, { enableScripts: true, retainContextWhenHidden: true });
            NaviPanel.currentPanel = new NaviPanel(panel, resolve);
        });
    }
    constructor(panel, resolve) {
        this._disposables = [];
        this._panel = panel;
        this._resolve = resolve;
        this._panel.webview.html = getWebviewContent();
        this._panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'submit') {
                this._resolve?.(message.config);
                this.dispose();
            }
            else if (message.command === 'cancel') {
                this._resolve?.(undefined);
                this.dispose();
            }
        }, null, this._disposables);
        this._panel.onDidDispose(() => {
            this._resolve?.(undefined);
            this.dispose();
        }, null, this._disposables);
    }
    dispose() {
        NaviPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const d = this._disposables.pop();
            if (d)
                d.dispose();
        }
    }
}
exports.NaviPanel = NaviPanel;
function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Navi</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  :root {
    --bg: #0d1117;
    --bg2: #161b22;
    --bg3: #21262d;
    --border: #30363d;
    --text: #e6edf3;
    --text2: #8b949e;
    --accent: #58a6ff;
    --accent2: #7c3aed;
    --gradient: linear-gradient(135deg, #58a6ff, #7c3aed);
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    padding: 0;
  }

  .header {
    background: var(--gradient);
    padding: 24px 32px;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .header-icon { font-size: 36px; }
  .header h1 { font-size: 22px; font-weight: 700; color: white; }
  .header p { font-size: 13px; color: rgba(255,255,255,0.8); margin-top: 2px; }

  .form-container {
    padding: 28px 32px;
    max-width: 900px;
    margin: 0 auto;
  }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .grid-full { grid-column: 1 / -1; }

  .field { display: flex; flex-direction: column; gap: 7px; }

  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  input[type="text"], select {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text);
    font-family: inherit;
    font-size: 14px;
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    appearance: none;
    -webkit-appearance: none;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238b949e' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }

  input[type="text"]:focus, select:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15);
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    padding: 18px 0 10px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
  }

  .feature-item:hover { border-color: var(--accent); background: var(--bg3); }
  .feature-item.selected { border-color: var(--accent2); background: rgba(124,58,237,0.15); }

  .feature-item input[type="checkbox"] {
    accent-color: var(--accent2);
    width: 15px;
    height: 15px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .feature-label { font-size: 12px; color: var(--text); cursor: pointer; }

  .actions {
    display: flex;
    gap: 12px;
    padding: 24px 0 8px;
    grid-column: 1 / -1;
  }

  button {
    padding: 12px 28px;
    border-radius: 8px;
    border: none;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary { background: var(--gradient); color: white; flex: 1; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(88,166,255,0.3); }

  .btn-secondary { background: var(--bg3); color: var(--text2); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--text2); color: var(--text); }

  .tip {
    background: rgba(88,166,255,0.08);
    border: 1px solid rgba(88,166,255,0.25);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 12px;
    color: var(--accent);
    margin-bottom: 16px;
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-icon">🧭</div>
  <div>
    <h1>Navi</h1>
    <p>Auto-generate your full-stack project in seconds</p>
  </div>
</div>

<div class="form-container">
  <div class="tip">💡 <strong>Pro Tip:</strong> Select a "Quick Stack" to auto-fill the best combination of tools!</div>

  <div class="grid">
    
    <!-- Quick Stack -->
    <div class="field grid-full">
      <label style="color: var(--accent);">⚡ Quick Stack (Auto-fill options)</label>
      <select id="quickStack" onchange="applyQuickStack()">
        <option value="None">Custom Stack (Manual Selection)</option>
        <option value="MERN">MERN Stack (React + Express + MongoDB)</option>
        <option value="MEAN">MEAN Stack (Angular + Express + MongoDB)</option>
        <option value="MEVN">MEVN Stack (Vue + Express + MongoDB)</option>
        <option value="PERN">PERN Stack (React + Express + PostgreSQL)</option>
        <option value="T3">T3 Stack (Next.js + Prisma + Tailwind)</option>
        <option value="DjangoReact">Django + React + PostgreSQL</option>
        <option value="SpringAngular">Spring Boot + Angular + MySQL</option>
        <option value="LaravelVue">LAMP / Laravel + Vue + MySQL</option>
        <option value="GoNext">Go (Gin) + Next.js + PostgreSQL</option>
      </select>
    </div>

    <!-- Project Info -->
    <div class="section-title grid-full">🚀 Project Info</div>

    <div class="field">
      <label>Project Name</label>
      <input type="text" id="projectName" placeholder="my-awesome-project" />
    </div>

    <div class="field">
      <label>Project Type</label>
      <select id="projectType">
        <option>E-Commerce</option>
        <option>Blog / News Portal</option>
        <option>Portfolio</option>
        <option>SaaS Dashboard</option>
        <option>Social Media App</option>
        <option>Food Delivery App</option>
        <option>Custom</option>
      </select>
    </div>

    <!-- Frontend -->
    <div class="section-title grid-full">🎨 Frontend</div>

    <div class="field">
      <label>Frontend Language</label>
      <select id="frontendLanguage">
        <option>TypeScript</option>
        <option>JavaScript</option>
      </select>
    </div>

    <div class="field">
      <label>Frontend Framework</label>
      <select id="frontendFramework">
        <option>React.js</option>
        <option>Next.js</option>
        <option>Vue.js</option>
        <option>Nuxt.js</option>
        <option>Angular</option>
        <option>Svelte</option>
        <option>SvelteKit</option>
        <option>Vanilla HTML/CSS/JS</option>
        <option>None (Backend only)</option>
      </select>
    </div>

    <div class="field">
      <label>CSS Framework</label>
      <select id="cssFramework">
        <option>Tailwind CSS</option>
        <option>Bootstrap 5</option>
        <option>SASS/SCSS only</option>
        <option>None</option>
      </select>
    </div>

    <div class="field">
      <label>UI Component Library</label>
      <select id="uiLibrary">
        <option>ShadCN UI</option>
        <option>Material UI (MUI)</option>
        <option>Ant Design</option>
        <option>Chakra UI</option>
        <option>None</option>
      </select>
    </div>

    <div class="field">
      <label>State Management</label>
      <select id="stateManagement">
        <option>Redux Toolkit</option>
        <option>Zustand</option>
        <option>Pinia (Vue)</option>
        <option>NgRx (Angular)</option>
        <option>Context API only</option>
        <option>None</option>
      </select>
    </div>

    <div class="field">
      <label>Build Tool</label>
      <select id="buildTool">
        <option>Vite</option>
        <option>Webpack</option>
        <option>Default (Framework CLI)</option>
      </select>
    </div>

    <div class="field grid-full">
      <label>Animation Library</label>
      <select id="animationLibrary">
        <option>None</option>
        <option>Framer Motion</option>
        <option>GSAP</option>
        <option>Three.js (3D)</option>
        <option>Lottie</option>
      </select>
    </div>

    <!-- Backend -->
    <div class="section-title grid-full">⚙️ Backend</div>

    <div class="field">
      <label>Backend Language</label>
      <select id="backendLanguage" onchange="updateBackendFrameworks()">
        <option>Node.js</option>
        <option>Python</option>
        <option>Java</option>
        <option>Go</option>
        <option>PHP</option>
        <option>Ruby</option>
        <option>C#</option>
        <option>None (Frontend only)</option>
      </select>
    </div>

    <div class="field">
      <label>Backend Framework</label>
      <select id="backendFramework">
        <!-- populated dynamically -->
      </select>
    </div>

    <div class="field">
      <label>Database</label>
      <select id="database">
        <option>MongoDB</option>
        <option>PostgreSQL</option>
        <option>MySQL</option>
        <option>SQLite</option>
        <option>Firebase Firestore</option>
        <option>None</option>
      </select>
    </div>

    <div class="field">
      <label>ORM / ODM</label>
      <select id="orm">
        <option>Mongoose</option>
        <option>Prisma</option>
        <option>Sequelize</option>
        <option>TypeORM</option>
        <option>SQLAlchemy</option>
        <option>Hibernate</option>
        <option>GORM</option>
        <option>Eloquent</option>
        <option>ActiveRecord</option>
        <option>Entity Framework</option>
        <option>None</option>
      </select>
    </div>

    <!-- Deployment -->
    <div class="section-title grid-full">🚀 Deployment & License</div>

    <div class="field">
      <label>Deploy Target</label>
      <select id="deployTarget">
        <option>Vercel</option>
        <option>Netlify</option>
        <option>Railway</option>
        <option>Render</option>
        <option>AWS</option>
        <option>Heroku</option>
        <option>None</option>
      </select>
    </div>

    <div class="field">
      <label>License</label>
      <select id="license">
        <option>MIT</option>
        <option>Apache 2.0</option>
        <option>GPL 3.0</option>
        <option>None</option>
      </select>
    </div>

    <!-- Features -->
    <div class="section-title grid-full">✨ Features (Select multiple)</div>

    <div class="features-grid grid-full" id="featuresGrid">
      <!-- dynamically rendered -->
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn-secondary" onclick="cancel()">Cancel</button>
      <button class="btn-primary" onclick="submit()">🚀 Generate Project</button>
    </div>

  </div>
</div>

<script>
  const vscode = acquireVsCodeApi();

  const FEATURES = [
    'JWT Authentication', 'OAuth (Google/GitHub)', 'Role Based Access Control (RBAC)',
    'Payment Gateway (Stripe)', 'Payment Gateway (Razorpay)', 'File Upload (Multer)', 'Cloud Storage (AWS S3)',
    'Email Service (Nodemailer)', 'SMS Service (Twilio)', 'Push Notifications (Web Push)',
    'Socket.io (Real-time)', 'Background Jobs (BullMQ)', 'GraphQL API (Apollo Server)',
    'Search (Elasticsearch)', 'Caching (Redis)', 'API Documentation (Swagger)', 
    'Rate Limiting', 'Logging (Winston)', 'Error Tracking (Sentry)',
    'Testing (Jest)', 'E2E Testing (Playwright)',
    'Internationalization (i18n)',
    'ESLint + Prettier', 'Docker Support', 'CI/CD (GitHub Actions)'
  ];

  const grid = document.getElementById('featuresGrid');
  FEATURES.forEach(f => {
    const item = document.createElement('label');
    item.className = 'feature-item';
    item.innerHTML = \`<input type="checkbox" value="\${f}" onchange="toggleFeature(this)"> <span class="feature-label">\${f}</span>\`;
    grid.appendChild(item);
  });

  const BACKEND_OPTIONS = {
    'Node.js': ['Express.js', 'Fastify', 'NestJS'],
    'Python': ['FastAPI', 'Django', 'Flask'],
    'Java': ['Spring Boot'],
    'Go': ['Gin', 'Echo', 'Fiber'],
    'PHP': ['Laravel'],
    'Ruby': ['Ruby on Rails'],
    'C#': ['ASP.NET Core'],
    'None (Frontend only)': ['None']
  };

  function updateBackendFrameworks(defaultFw = '') {
    const lang = document.getElementById('backendLanguage').value;
    const select = document.getElementById('backendFramework');
    select.innerHTML = '';
    const options = BACKEND_OPTIONS[lang] || ['None'];
    options.forEach(fw => {
      const opt = document.createElement('option');
      opt.value = opt.textContent = fw;
      if (fw === defaultFw) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if(el) { el.value = val; }
  }

  function applyQuickStack() {
    const stack = document.getElementById('quickStack').value;
    if (stack === 'None') return;

    if (stack === 'MERN') {
      setVal('frontendLanguage', 'JavaScript'); setVal('frontendFramework', 'React.js');
      setVal('backendLanguage', 'Node.js'); updateBackendFrameworks('Express.js');
      setVal('database', 'MongoDB'); setVal('orm', 'Mongoose');
    } else if (stack === 'MEAN') {
      setVal('frontendLanguage', 'TypeScript'); setVal('frontendFramework', 'Angular');
      setVal('backendLanguage', 'Node.js'); updateBackendFrameworks('Express.js');
      setVal('database', 'MongoDB'); setVal('orm', 'Mongoose');
    } else if (stack === 'MEVN') {
      setVal('frontendLanguage', 'JavaScript'); setVal('frontendFramework', 'Vue.js');
      setVal('backendLanguage', 'Node.js'); updateBackendFrameworks('Express.js');
      setVal('database', 'MongoDB'); setVal('orm', 'Mongoose');
    } else if (stack === 'PERN') {
      setVal('frontendLanguage', 'TypeScript'); setVal('frontendFramework', 'React.js');
      setVal('backendLanguage', 'Node.js'); updateBackendFrameworks('Express.js');
      setVal('database', 'PostgreSQL'); setVal('orm', 'Prisma');
    } else if (stack === 'T3') {
      setVal('frontendLanguage', 'TypeScript'); setVal('frontendFramework', 'Next.js');
      setVal('backendLanguage', 'Node.js'); updateBackendFrameworks('None'); // T3 is Next.js fullstack
      setVal('database', 'PostgreSQL'); setVal('orm', 'Prisma');
      setVal('cssFramework', 'Tailwind CSS');
    } else if (stack === 'DjangoReact') {
      setVal('frontendLanguage', 'JavaScript'); setVal('frontendFramework', 'React.js');
      setVal('backendLanguage', 'Python'); updateBackendFrameworks('Django');
      setVal('database', 'PostgreSQL'); setVal('orm', 'None');
    } else if (stack === 'SpringAngular') {
      setVal('frontendLanguage', 'TypeScript'); setVal('frontendFramework', 'Angular');
      setVal('backendLanguage', 'Java'); updateBackendFrameworks('Spring Boot');
      setVal('database', 'MySQL'); setVal('orm', 'Hibernate');
    } else if (stack === 'LaravelVue') {
      setVal('frontendLanguage', 'JavaScript'); setVal('frontendFramework', 'Vue.js');
      setVal('backendLanguage', 'PHP'); updateBackendFrameworks('Laravel');
      setVal('database', 'MySQL'); setVal('orm', 'Eloquent');
    } else if (stack === 'GoNext') {
      setVal('frontendLanguage', 'TypeScript'); setVal('frontendFramework', 'Next.js');
      setVal('backendLanguage', 'Go'); updateBackendFrameworks('Gin');
      setVal('database', 'PostgreSQL'); setVal('orm', 'GORM');
    }
  }

  function toggleFeature(el) {
    el.closest('.feature-item').classList.toggle('selected', el.checked);
  }

  function getVal(id) { return document.getElementById(id).value; }

  function submit() {
    const projectName = getVal('projectName').trim();
    if (!projectName) { alert('Project nam zaroor dalein!'); return; }

    const checked = [...document.querySelectorAll('#featuresGrid input:checked')].map(el => el.value);

    const config = {
      projectName,
      projectType: getVal('projectType'),
      quickStack: getVal('quickStack'),
      frontendLanguage: getVal('frontendLanguage').toLowerCase() === 'typescript' ? 'typescript' : 'javascript',
      frontendFramework: getVal('frontendFramework'),
      cssFramework: getVal('cssFramework'),
      uiLibrary: getVal('uiLibrary'),
      stateManagement: getVal('stateManagement'),
      buildTool: getVal('buildTool'),
      animationLibrary: getVal('animationLibrary'),
      backendLanguage: getVal('backendLanguage'),
      backendFramework: getVal('backendFramework'),
      database: getVal('database'),
      orm: getVal('orm'),
      features: checked,
      deployTarget: getVal('deployTarget'),
      license: getVal('license')
    };

    vscode.postMessage({ command: 'submit', config });
  }

  function cancel() {
    vscode.postMessage({ command: 'cancel' });
  }

  // Init
  updateBackendFrameworks();
</script>
</body>
</html>`;
}
//# sourceMappingURL=NaviPanel.js.map