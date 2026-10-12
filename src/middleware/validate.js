const { AppError } = require('./error-handler');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      const errors = err.errors?.map((e) => ({
        path: e.path.join('.'),
        message: e.message
      })) || err.message;

      next(new AppError('Validation failed', 400, errors));
    }
  };
};

module.exports = { validate };
