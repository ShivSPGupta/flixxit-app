const apiBaseUrl = import.meta.env.VITE_API_URL || '';
const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, '');
const defaultFallbackPoster = '/images/no-poster.svg';
const tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/w500';

const resolveLegacyProxyPoster = (poster) => {
  if (!poster.includes('/api/movies/poster')) return null;

  try {
    const url = new URL(poster, window.location.origin);
    const posterPath = url.searchParams.get('path');
    return posterPath ? `${tmdbImageBaseUrl}${posterPath}` : null;
  } catch {
    return null;
  }
};

export const resolvePosterUrl = (poster, fallbackPoster = defaultFallbackPoster) => {
  if (!poster || poster === 'N/A') return fallbackPoster;

  const legacyPosterUrl = resolveLegacyProxyPoster(poster);
  if (legacyPosterUrl) return legacyPosterUrl;

  if (/^https?:\/\//i.test(poster) || poster.startsWith('data:')) {
    return poster;
  }

  if (poster.startsWith('/api/')) {
    return apiOrigin ? `${apiOrigin}${poster}` : poster;
  }

  return poster;
};

export const posterFallback = defaultFallbackPoster;
