/**
 * Custom MongoDB sanitization middleware
 * Compatible with Express 5
 * Prevents NoSQL injection attacks by removing $ and . from user input
 */

const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Remove $ and . from keys
      const sanitizedKey = key.replace(/[$\.]/g, '_');
      sanitized[sanitizedKey] = sanitize(obj[key]);
    }
  }
  return sanitized;
};

const customMongoSanitize = (req, res, next) => {
  try {
    // Sanitize body
    if (req.body) {
      req.body = sanitize(req.body);
    }
    
    // Sanitize query params
    if (req.query) {
      // Create a new object instead of modifying readonly properties
      const sanitizedQuery = sanitize(req.query);
      // Use Object.defineProperty to properly set the query
      Object.keys(sanitizedQuery).forEach(key => {
        req.query[key] = sanitizedQuery[key];
      });
    }
    
    // Sanitize params
    if (req.params) {
      req.params = sanitize(req.params);
    }
    
    next();
  } catch (err) {
    console.error('[Security] Sanitization error:', err);
    next();
  }
};

module.exports = customMongoSanitize;
