require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  
  // API Keys
  OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY,
  GDACS_API_URL: process.env.GDACS_API_URL || 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH',
  RELIEFWEB_API_URL: process.env.RELIEFWEB_API_URL || 'https://api.reliefweb.int/v1/disasters',
  NASA_EONET_API_URL: process.env.NASA_EONET_API_URL || 'https://eonet.gsfc.nasa.gov/api/v3/events',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
};