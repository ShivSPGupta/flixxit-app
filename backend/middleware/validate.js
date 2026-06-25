const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const normalizeString = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeString(value).toLowerCase();
const isValidEmail = (value) => /^\S+@\S+\.\S+$/.test(value);
const isValidPositiveInt = (value) => /^\d+$/.test(String(value)) && Number(value) > 0;

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const output = schema(req[source] || {});

    if (isPlainObject(output) && source === 'query') {
      Object.assign(req.query, output);
    } else if (isPlainObject(output)) {
      req[source] = output;
    }

    next();
  } catch (error) {
    res.status(error.statusCode || 400);
    next(error);
  }
};

const authSchemas = {
  register: (body) => {
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const displayName = normalizeString(body.displayName);

    if (!email || !password) throw fail('Please provide email and password');
    if (!isValidEmail(email)) throw fail('Please provide a valid email');
    if (password.length < 6) throw fail('Password must be at least 6 characters');
    if (displayName.length > 40) throw fail('Display name must be 40 characters or less');

    return { email, password, displayName };
  },

  login: (body) => {
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');

    if (!email || !password) throw fail('Please provide email and password');
    if (!isValidEmail(email)) throw fail('Please provide a valid email');

    return { email, password };
  },

  refresh: (body) => {
    const refreshToken = normalizeString(body.refreshToken);
    if (!refreshToken) throw fail('Refresh token required', 401);
    return { refreshToken };
  },

  updateEmail: (body) => {
    const email = normalizeEmail(body.email);
    if (!email) throw fail('Email is required');
    if (!isValidEmail(email)) throw fail('Please provide a valid email');
    return { email };
  },

  updatePassword: (body) => {
    const currentPassword = String(body.currentPassword || '');
    const newPassword = String(body.newPassword || '');

    if (!currentPassword || !newPassword) throw fail('Current and new password required');
    if (newPassword.length < 6) throw fail('New password must be at least 6 characters');

    return { currentPassword, newPassword };
  },

  updateProfile: (body) => {
    const displayName = normalizeString(body.displayName);
    const avatar = normalizeString(body.avatar);

    if (!displayName && !avatar) throw fail('Please provide profile details to update');
    if (displayName.length > 40) throw fail('Display name must be 40 characters or less');

    return { displayName, avatar };
  },
};

const movieSchemas = {
  searchQuery: (query) => {
    const searchQuery = normalizeString(query.query);
    if (!searchQuery) throw fail('Search query is required');
    return { ...query, query: searchQuery };
  },

  searchParams: (params) => {
    const query = normalizeString(params.query);
    if (!query) throw fail('Search query is required');
    return { ...params, query };
  },

  detailParams: (params) => {
    const id = normalizeString(params.id);
    if (!id) throw fail('Movie id is required');
    return { ...params, id };
  },

  rowParams: (params) => {
    const keyword = normalizeString(params.keyword).toLowerCase();
    if (!keyword) throw fail('Movie row keyword is required');
    return { ...params, keyword };
  },

  rowQuery: (query) => {
    const page = query.page === undefined ? '1' : normalizeString(query.page);
    if (!isValidPositiveInt(page)) throw fail('Page must be a positive number');
    return { ...query, page };
  },

  trailerParams: (params) => {
    const title = normalizeString(params.title);
    if (!title) throw fail('Movie title is required');
    return { ...params, title };
  },

  posterQuery: (query) => {
    const path = normalizeString(query.path);
    if (!path || !path.startsWith('/')) throw fail('Invalid poster path');
    return { ...query, path };
  },
};

const favoriteSchemas = {
  addToList: (body) => {
    const imdbID = normalizeString(body.imdbID);
    const title = normalizeString(body.title);
    const poster = normalizeString(body.poster);

    if (!imdbID || !title) throw fail('Movie id and title are required');

    return { imdbID, title, poster };
  },

  removeFromList: (params) => {
    const imdbID = normalizeString(params.imdbID);
    if (!imdbID) throw fail('Movie id is required');
    return { ...params, imdbID };
  },
};

module.exports = {
  validate,
  authSchemas,
  movieSchemas,
  favoriteSchemas,
};
