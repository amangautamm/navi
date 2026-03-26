"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseDeps = getDatabaseDeps;
exports.getDatabaseConfig = getDatabaseConfig;
exports.getUserModel = getUserModel;
exports.getPrismaSchema = getPrismaSchema;
function getDatabaseDeps(config) {
    const { database, orm } = config;
    let deps = [];
    if (orm === 'Mongoose')
        deps = ['mongoose'];
    if (orm === 'Prisma')
        deps = ['prisma', '@prisma/client'];
    if (orm === 'Sequelize')
        deps = ['sequelize'];
    if (orm === 'TypeORM')
        deps = ['typeorm', 'reflect-metadata'];
    if (database === 'Firebase Firestore')
        deps.push('firebase-admin');
    if (database === 'Supabase')
        deps.push('@supabase/supabase-js');
    if (database === 'Redis')
        deps.push('ioredis');
    if (database === 'PostgreSQL' && orm !== 'Prisma')
        deps.push('pg');
    if (database === 'MySQL' && orm !== 'Prisma')
        deps.push('mysql2');
    if (database === 'SQLite' && orm !== 'Prisma')
        deps.push('sqlite3');
    return deps;
}
function getDatabaseConfig(config) {
    const { database } = config;
    if (database === 'MongoDB') {
        return `import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${config.projectName.toLowerCase()}');
    console.log(\`✅ MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};
`;
    }
    if (database === 'PostgreSQL' || database === 'MySQL' || database === 'SQLite') {
        return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected via Prisma');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export default prisma;
`;
    }
    if (database === 'Firebase Firestore') {
        return `import admin from 'firebase-admin';

export const connectDB = async (): Promise<void> => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    process.exit(1);
  }
};

export const db = admin.firestore();
export const auth = admin.auth();
`;
    }
    if (database === 'Supabase') {
        return `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const connectDB = async (): Promise<void> => {
  const { error } = await supabase.from('health').select('*').limit(1);
  if (error && error.code !== 'PGRST116') {
    console.error('❌ Supabase connection failed:', error);
  } else {
    console.log('✅ Supabase connected');
  }
};
`;
    }
    return `export const connectDB = async (): Promise<void> => {
  console.log('✅ No database configured');
};
`;
}
function getUserModel(config) {
    if (config.database === 'MongoDB') {
        return `import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false, minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
`;
    }
    return `// User model - configure based on your database
export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}
`;
}
function getPrismaSchema(config) {
    const provider = config.database === 'PostgreSQL' ? 'postgresql'
        : config.database === 'MySQL' ? 'mysql'
            : 'sqlite';
    return `// This is your Prisma schema file
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
`;
}
//# sourceMappingURL=database.js.map