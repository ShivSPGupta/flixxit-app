const { randomUUID } = require('crypto');

const createRequestId = () => randomUUID();

const requestContextMiddleware = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || createRequestId();
  res.setHeader('x-request-id', requestId);

  req.requestId = requestId;
  next();
};

const getRequestId = () => 'no-request-id';

module.exports = {
  requestContextMiddleware,
  getRequestId,
};
