// Server configuration
export const PORT = 3000;

// JWT configuration
export const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this in production!
export const JWT_EXPIRY = '24h';

// Bcrypt configuration
export const SALT_ROUNDS = 10;

// Validation rules
export const MIN_PASSWORD_LENGTH = 6;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
