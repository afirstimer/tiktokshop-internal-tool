import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load .env từ root của project
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const envPath = join(rootDir, '.env');

if (!existsSync(envPath)) {
  console.error('❌ File .env không tồn tại!');
  console.error(`   Vui lòng copy env.example thành .env và điền thông tin.`);
  console.error(`   Path: ${envPath}`);
  process.exit(1);
}

dotenv.config({ path: envPath });

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Thiếu các biến môi trường bắt buộc:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

// Config object
const config = {
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  paths: {
    // Nếu UPLOAD_DIR là relative path, resolve từ rootDir
    uploadDir: process.env.UPLOAD_DIR 
      ? (process.env.UPLOAD_DIR.startsWith('.') || !process.env.UPLOAD_DIR.startsWith('/'))
        ? join(rootDir, process.env.UPLOAD_DIR.replace(/^\.\//, ''))
        : process.env.UPLOAD_DIR
      : join(rootDir, 'uploads'),
    processedDir: process.env.PROCESSED_DIR
      ? (process.env.PROCESSED_DIR.startsWith('.') || !process.env.PROCESSED_DIR.startsWith('/'))
        ? join(rootDir, process.env.PROCESSED_DIR.replace(/^\.\//, ''))
        : process.env.PROCESSED_DIR
      : join(rootDir, 'processed'),
    errorDir: process.env.ERROR_DIR
      ? (process.env.ERROR_DIR.startsWith('.') || !process.env.ERROR_DIR.startsWith('/'))
        ? join(rootDir, process.env.ERROR_DIR.replace(/^\.\//, ''))
        : process.env.ERROR_DIR
      : join(rootDir, 'errors'),
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

export default config;

