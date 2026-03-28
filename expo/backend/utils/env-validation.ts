import crypto from 'crypto';

const REQUIRED_ENV_VARS = ['JWT_SECRET'] as const;

type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
    
    if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
      errors.push('JWT_SECRET is set to default value. Please change it to a secure random string');
    }
  }
  
  if (!process.env.DATABASE_PATH) {
    warnings.push('DATABASE_PATH not set. Using default: ./database/socialstoryai.db');
  }
  
  if (!process.env.ALLOWED_ORIGINS) {
    warnings.push('ALLOWED_ORIGINS not set. CORS will allow all origins (not recommended for production)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function generateJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function printEnvironmentStatus(): void {
  console.log('\n=== Environment Configuration Status ===\n');
  
  const result = validateEnvironment();
  
  if (result.valid) {
    console.log('✅ All required environment variables are set\n');
  } else {
    console.log('❌ Environment validation failed\n');
    console.log('Errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
    console.log('');
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  - ${warning}`));
    console.log('');
  }
  
  console.log('Current Configuration:');
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ Not set'}`);
  console.log(`  DATABASE_PATH: ${process.env.DATABASE_PATH || '(using default)'}`);
  console.log(`  ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS || '* (all origins)'}`);
  console.log('');
  
  if (!result.valid) {
    console.log('💡 To fix these issues:');
    console.log('  1. Create a .env file in the project root');
    console.log('  2. Add the following variables:\n');
    console.log(`JWT_SECRET=${generateJWTSecret()}`);
    console.log('DATABASE_PATH=./database/socialstoryai.db');
    console.log('ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com');
    console.log('');
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot start server with invalid environment configuration in production');
    }
  }
  
  console.log('========================================\n');
}
