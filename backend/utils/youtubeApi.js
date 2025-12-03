const axios = require('axios');

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
const API_KEY = process.env.YOUTUBE_API_KEY;

exports.searchTrailer = async (movieTitle) => {
  try {
    const response = await axios.get(YOUTUBE_BASE_URL, {
      params: {
        key: API_KEY,
        q: `${movieTitle} official trailer`,
        part: 'snippet',
        type: 'video',
        maxResults: 1,
        videoEmbeddable: true
      }
    });
    
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error('YouTube API error:', error.message);
    return null;
  }
};