/**
 * Centralized Configuration
 * 
 * Loads environment variables and exports them as a single config object.
 * All environment-dependent values should be accessed through this module.
 */

require('dotenv').config();

const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB (supports both local and Atlas URI formats)
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ems_db',

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:8080',

  // Bcrypt
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10
};

// Validate critical config in production
if (config.nodeEnv === 'production' && !config.jwtSecret) {
  console.error('FATAL: JWT_SECRET is not set in production environment.');
  process.exit(1);
}

// Use a development-only fallback for JWT_SECRET (never in production)
if (!config.jwtSecret) {
  config.jwtSecret = 'dev_jwt_secret_not_for_production';
  console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env for security.');
}

module.exports = config;
