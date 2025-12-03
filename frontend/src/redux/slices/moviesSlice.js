import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  searchResults: [],
  movieDetail: null,
  rows: {},
  isLoading: false,
  isError: false,
  message: '',
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
  }
);

export const getTrailer = createAsyncThunk(
  'movies/trailer',
  async (title, thunkAPI) => {
    try {
      const response = await api.get(`/movies/trailer/${encodeURIComponent(title)}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue('Trailer not found');
    }
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearMovieDetail: (state) => {
      state.movieDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMovies.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.Search || [];
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMovieDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMovieDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movieDetail = action.payload;
      })
      .addCase(getMovieDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getMovieRow.fulfilled, (state, action) => {
        state.rows[action.payload.keyword] = action.payload.data.Search || [];
      });
  },
});

export const { clearSearchResults, clearMovieDetail } = moviesSlice.actions;
export default moviesSlice.reducer;
