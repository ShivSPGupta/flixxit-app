import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  searchResults: [],
  movieDetail: null,
  rows: {},
  rowStatus: {},
  search: {
    isLoading: false,
    isError: false,
    message: '',
  },
  detail: {
    isLoading: false,
    isError: false,
    message: '',
  },
};

export const searchMovies = createAsyncThunk(
  'movies/search',
  async (query, thunkAPI) => {
    try {
      const response = await api.get(`/movies/search/${query}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMovieDetail = createAsyncThunk(
  'movies/detail',
  async (imdbID, thunkAPI) => {
    try {
      const response = await api.get(`/movies/detail/${imdbID}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getMovieRow = createAsyncThunk(
  'movies/row',
  async ({ keyword, page = 1 }, thunkAPI) => {
    try {
      const response = await api.get(`/movies/row/${keyword}?page=${page}`);
      return { keyword, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
  {
    condition: ({ keyword, page = 1 }, { getState }) => {
      if (!keyword) return false;

      const { movies } = getState();
      const isAlreadyLoaded =
        page === 1 &&
        Array.isArray(movies.rows[keyword]) &&
        movies.rows[keyword].length > 0;
      const isAlreadyLoading = movies.rowStatus[keyword] === 'loading';

      return !isAlreadyLoaded && !isAlreadyLoading;
    },
  }
);

export const getTrailer = createAsyncThunk(
  'movies/trailer',
  async (title, thunkAPI) => {
    try {
      const response = await api.get(`/movies/trailer/${encodeURIComponent(title)}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Trailer not found'
      );
    }
  }
);

// Helper function to remove duplicates
const removeDuplicates = (movies) => {
  if (!Array.isArray(movies)) return [];
  const seen = new Set();
  return movies.filter(movie => {
    if (seen.has(movie.imdbID)) {
      return false;
    }
    seen.add(movie.imdbID);
    return true;
  });
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.search.isError = false;
      state.search.message = '';
    },
    clearMovieDetail: (state) => {
      state.movieDetail = null;
      state.detail.isLoading = false;
      state.detail.isError = false;
      state.detail.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMovies.pending, (state) => {
        state.search.isLoading = true;
        state.search.isError = false;
        state.search.message = '';
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.search.isLoading = false;
        state.search.isError = false;
        state.search.message = '';
        // Remove duplicates from search results
        state.searchResults = removeDuplicates(action.payload.Search || []);
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.search.isLoading = false;
        state.search.isError = true;
        state.search.message = action.payload;
      })
      .addCase(getMovieDetail.pending, (state) => {
        state.detail.isLoading = true;
        state.detail.isError = false;
        state.detail.message = '';
      })
      .addCase(getMovieDetail.fulfilled, (state, action) => {
        state.detail.isLoading = false;
        state.detail.isError = false;
        state.detail.message = '';
        state.movieDetail = action.payload;
      })
      .addCase(getMovieDetail.rejected, (state, action) => {
        state.detail.isLoading = false;
        state.detail.isError = true;
        state.detail.message = action.payload;
      })
      .addCase(getMovieRow.pending, (state, action) => {
        const keyword = action.meta?.arg?.keyword;
        if (keyword) {
          state.rowStatus[keyword] = 'loading';
        }
        state.search.isLoading = true;
        state.search.isError = false;
        state.search.message = '';
      })
      .addCase(getMovieRow.fulfilled, (state, action) => {
        state.rowStatus[action.payload.keyword] = 'idle';
        state.search.isLoading = false;
        state.search.isError = false;
        state.search.message = '';
        // Remove duplicates before storing
        const movies = action.payload.data.Search || [];
        state.rows[action.payload.keyword] = removeDuplicates(movies);
      })
      .addCase(getMovieRow.rejected, (state, action) => {
        const keyword = action.meta?.arg?.keyword;
        if (keyword) {
          state.rowStatus[keyword] = 'idle';
        }
        state.search.isLoading = false;
        state.search.isError = true;
        state.search.message = action.payload;
      });
  },
});

export const { clearSearchResults, clearMovieDetail } = moviesSlice.actions;
export default moviesSlice.reducer;
