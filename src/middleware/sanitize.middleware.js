export const sanitizeBody = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
        continue;
      }

      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);

  next();
};
