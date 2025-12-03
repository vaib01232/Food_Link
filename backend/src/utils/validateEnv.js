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
    process.exit(1);
  }
  
  if (process.env.JWT_SECRET.length < 32) {
    process.exit(1);
  }
};

module.exports = validateEnv;
