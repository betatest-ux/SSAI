import crypto from 'crypto';

const REQUIRED_ENV_VARS = ['JWT_SECRET'];

export function validateEnvironment() {
  const errors = [];
  const warnings = [];
  
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
  
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    warnings.push('EXPO_PUBLIC_SUPABASE_URL not set.');
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

export function generateJWTSecret() {
  return crypto.randomBytes(64).toString('hex');
}

export function printEnvironmentStatus() {
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
  console.log(`  SUPABASE_URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Not set'}`);
  console.log(`  ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS || '* (all origins)'}`);
  console.log('');
  
  if (!result.valid) {
    console.log('💡 To fix these issues:');
    console.log('  1. Create a .env file in the project root');
    console.log('  2. Add the following variables:\n');
    console.log(`JWT_SECRET=${generateJWTSecret()}`);
    console.log('EXPO_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key');
    console.log('ALLOWED_ORIGINS=https://yourdomain.com');
    console.log('');
    
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Running with invalid environment configuration in production');
    }
  }
  
  console.log('========================================\n');
}
