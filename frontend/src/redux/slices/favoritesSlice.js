import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  list: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const getFavorites = createAsyncThunk(
  'favorites/getList',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/user/list');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/add',
  async (movie, thunkAPI) => {
    try {
      const response = await api.post('/user/list', movie);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/remove',
  async (imdbID, thunkAPI) => {
    try {
      const response = await api.delete(`/user/list/${imdbID}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.list = action.payload;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.list = action.payload;
      });
  },
});

export default favoritesSlice.reducer;