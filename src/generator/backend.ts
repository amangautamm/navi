import { ProjectConfig } from '../types';

export function getBackendDeps(config: ProjectConfig): string[] {
  const deps: string[] = [];
  const { backendFramework, features } = config;

  const frameworkDeps: Record<string, string[]> = {
    'Express.js': ['express', 'cors', 'dotenv', 'helmet', 'morgan'],
    'Fastify': ['fastify', '@fastify/cors', 'dotenv'],
    'NestJS': ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express', 'reflect-metadata', 'rxjs'],
    'Hono': ['hono'],
    'Koa.js': ['koa', '@koa/router', '@koa/cors', 'dotenv'],
  };

  if (frameworkDeps[backendFramework]) {
    deps.push(...frameworkDeps[backendFramework]);
  }

  // Feature deps
  if (features.includes('JWT Authentication')) deps.push('jsonwebtoken', 'bcryptjs');
  if (features.includes('OAuth (Google/GitHub)')) deps.push('passport', 'passport-google-oauth20', 'passport-github2');
  if (features.includes('Payment Gateway (Razorpay)')) deps.push('razorpay');
  if (features.includes('Payment Gateway (Stripe)')) deps.push('stripe');
  if (features.includes('File Upload (Multer)')) deps.push('multer');
  if (features.includes('Email Service (Nodemailer)')) deps.push('nodemailer');
  if (features.includes('SMS Service (Twilio)')) deps.push('twilio');
  if (features.includes('Socket.io (Real-time)')) deps.push('socket.io');
  if (features.includes('Rate Limiting')) deps.push('express-rate-limit');
  if (features.includes('API Documentation (Swagger)')) deps.push('swagger-ui-express', 'swagger-jsdoc');
  if (features.includes('Logging (Winston)')) deps.push('winston', 'morgan');
  if (features.includes('Error Tracking (Sentry)')) deps.push('@sentry/node');
  if (features.includes('Caching (Redis)')) deps.push('ioredis');
  if (features.includes('Testing (Jest)')) deps.push('jest', 'supertest');
  if (features.includes('Role Based Access Control (RBAC)')) deps.push('casbin');
  if (features.includes('Cloud Storage (AWS S3)')) deps.push('@aws-sdk/client-s3');
  if (features.includes('Background Jobs (BullMQ)')) deps.push('bullmq', 'ioredis');
  if (features.includes('GraphQL API (Apollo Server)')) deps.push('graphql', '@apollo/server');

  return [...new Set(deps)];
}

export function getExpressServerTemplate(config: ProjectConfig): string {
  const { projectName, features, frontendLanguage: language } = config;
  const ext = language === 'typescript' ? 'ts' : 'js';
  const hasAuth = features.includes('JWT Authentication');
  const hasSwagger = features.includes('API Documentation (Swagger)');
  const hasRateLimit = features.includes('Rate Limiting');
  const hasLogging = features.includes('Logging (Winston)');
  const hasSockets = features.includes('Socket.io (Real-time)');
  const hasGraphQL = features.includes('GraphQL API (Apollo Server)');
  const hasBullMQ = features.includes('Background Jobs (BullMQ)');

  return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
${hasRateLimit ? "import rateLimit from 'express-rate-limit';" : ''}
${hasLogging ? "import morgan from 'morgan';" : ''}
${hasSwagger ? "import swaggerUi from 'swagger-ui-express';\nimport swaggerJsdoc from 'swagger-jsdoc';" : ''}
${hasSockets ? "import { createServer } from 'http';\nimport { Server } from 'socket.io';" : ''}
${hasGraphQL ? "import { ApolloServer } from '@apollo/server';\nimport { expressMiddleware } from '@apollo/server/express4';" : ''}
import { connectDB } from './config/database';
${hasAuth ? "import authRoutes from './routes/auth.routes';" : ''}
import userRoutes from './routes/user.routes';
${hasBullMQ ? "import { Queue } from 'bullmq';" : ''}

dotenv.config();

const app = express();
${hasSockets ? 'const httpServer = createServer(app);\nconst io = new Server(httpServer, { cors: { origin: "*" } });' : ''}
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
${hasLogging ? "app.use(morgan('dev'));" : ''}

${hasRateLimit ? `// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);` : ''}

${hasSwagger ? `// Swagger Documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: '${projectName} API', version: '1.0.0' },
  },
  apis: ['./src/routes/*.${ext}'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));` : ''}

// Routes
${hasAuth ? "app.use('/api/auth', authRoutes);" : ''}
app.use('/api/users', userRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', project: '${projectName}', timestamp: new Date() });
});

${hasBullMQ ? `// Export BullMQ Queue
export const defaultQueue = new Queue('default', { connection: { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT || '6379') } });` : ''}

// Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

${hasSockets ? `// Socket.io Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('disconnect', () => console.log('User disconnected:', socket.id));
});` : ''}

// Start Server
const startServer = async () => {
  await connectDB();
${hasGraphQL ? `  
  const typeDefs = \`type Query { hello: String }\`;
  const resolvers = { Query: { hello: () => 'Hello from Navi Apollo GraphQL!' } };
  const apolloServer = new ApolloServer({ typeDefs, resolvers });
  await apolloServer.start();
  app.use('/graphql', expressMiddleware(apolloServer));
` : ''}
  ${hasSockets ? 'httpServer' : 'app'}.listen(PORT, () => {
    console.log(\`🧭 ${projectName} server running on port \${PORT}\`);
    ${hasSwagger ? `console.log(\`📚 Swagger docs: http://localhost:\${PORT}/api/docs\`);` : ''}
    ${hasGraphQL ? `console.log(\`🚀 GraphQL API: http://localhost:\${PORT}/graphql\`);` : ''}
  });
};

startServer();

export default app;
`;
}

export function getAuthRoutesTemplate(config: ProjectConfig): string {
  return `import { Router } from 'express';
import { register, login, logout, getProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRegister, validateLogin } from '../validators/auth.validator';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 */
router.post('/register', validateRegister, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 */
router.post('/login', validateLogin, login);

router.post('/logout', authMiddleware, logout);
router.get('/profile', authMiddleware, getProfile);

export default router;
`;
}

export function getAuthControllerTemplate(): string {
  return `import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ success: true, token, user: { id: user._id, name, email } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
}

export function getAuthMiddlewareTemplate(): string {
  return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const adminMiddleware = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
`;
}
