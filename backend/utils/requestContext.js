const { AsyncLocalStorage } = require('async_hooks');
const { randomUUID } = require('crypto');

const requestStorage = new AsyncLocalStorage();

const createRequestId = () => randomUUID();

const requestContextMiddleware = (req, res, next) => {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId = Array.isArray(incomingRequestId)
    ? incomingRequestId[0]
    : incomingRequestId || createRequestId();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);

  requestStorage.run({ requestId }, next);
};

const getRequestId = () => {
  return requestStorage.getStore()?.requestId || 'no-request-id';
};

module.exports = {
  requestContextMiddleware,
  getRequestId,
};
