/**
 * Environment variable validation
 * Ensures all required environment variables are set before starting the server
 */

const requiredEnvVars = [
  'PORT',
  'JWT_SECRET',
  'MONGO_URI',
  'BACKEND_URL',
  'FRONTEND_URL'
];

const validateEnv = () => {
  const missing = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    console.error('[Environment] Missing required environment variables:');
    missing.forEach(varName => console.error(`  - ${varName}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    console.error('[Environment] JWT_SECRET is too short. Minimum 32 characters required.');
    console.error('Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
  }
  
  // Warn about default values
  if (process.env.JWT_SECRET.includes('your_super_secret') || process.env.JWT_SECRET.includes('change_this')) {
    console.warn('[Environment] WARNING: Using default JWT_SECRET. Please change this in production!');
  }
  
  // Check email configuration
  if (!process.env.EMAIL_SERVICE && !process.env.SMTP_HOST) {
    console.warn('[Environment] WARNING: No email service configured. Verification emails will be logged to console (development mode).');
  }
  
  console.log('[Environment] All required environment variables are set ✓');
};

module.exports = validateEnv;
