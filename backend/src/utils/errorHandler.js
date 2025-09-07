export function notFound(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
}

export function errorHandler(err, req, res, next) { // eslint-disable-line
  if (!err.status) {
    console.error(err);
  }
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
  });
}
