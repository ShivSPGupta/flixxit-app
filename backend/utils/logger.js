const { getRequestId } = require('./requestContext');

const isDebugEnabled = (namespace) => {
  const enabledNamespaces = String(process.env.DEBUG_LOGS || process.env.DEBUG_TMDB || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return (
    process.env.NODE_ENV !== 'production' ||
    enabledNamespaces.includes('true') ||
    enabledNamespaces.includes('*') ||
    enabledNamespaces.includes(namespace.toLowerCase())
  );
};

const createLogger = (namespace) => {
  const label = namespace.toUpperCase();

  return {
    debug: (...args) => {
      if (isDebugEnabled(namespace)) {
        console.log(`[${label}][${getRequestId()}]`, ...args);
      }
    },
    error: (...args) => {
      console.error(`[${label}][${getRequestId()}]`, ...args);
    },
  };
};

module.exports = {
  createLogger,
};
