const sanitize = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitize(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const sanitizedKey = key.replace(/[$.]/, '_');
      sanitized[sanitizedKey] = sanitize(obj[key]);
    }
  }
  return sanitized;
};

const customMongoSanitize = (req, res, next) => {
  try {
    if (req.body) {
      req.body = sanitize(req.body);
    }
    
    if (req.query) {
      const sanitizedQuery = sanitize(req.query);
      Object.keys(sanitizedQuery).forEach(key => {
        req.query[key] = sanitizedQuery[key];
      });
    }
    
    if (req.params) {
      req.params = sanitize(req.params);
    }
    
    next();
  } catch {
    next();
  }
};

module.exports = customMongoSanitize;
