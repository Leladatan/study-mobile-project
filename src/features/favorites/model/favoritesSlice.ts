import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type Pending = { requestId: string; previous: boolean };

export type FavoritesState = {
  selected: Record<string, true | undefined>;
  pending: Record<string, Pending | undefined>;
  errors: Record<string, string | undefined>;
};

const initialState: FavoritesState = {
  selected: {},
  pending: {},
  errors: {},
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    started(
      state,
      action: PayloadAction<{ id: string; next: boolean; requestId: string }>,
    ) {
      const { id, next, requestId } = action.payload;
      if (state.pending[id]) return;

      state.pending[id] = {
        requestId,
        previous: state.selected[id] === true,
      };

      if (next) state.selected[id] = true;
      else delete state.selected[id];

      delete state.errors[id];
    },

    succeeded(state, action: PayloadAction<{ id: string; requestId: string }>) {
      const { id, requestId } = action.payload;
      const op = state.pending[id];
      if (!op || op.requestId !== requestId) return;
      delete state.pending[id];
    },

    failed(
      state,
      action: PayloadAction<{ id: string; requestId: string; message: string }>,
    ) {
      const { id, requestId, message } = action.payload;
      const op = state.pending[id];
      if (!op || op.requestId !== requestId) return;

      if (op.previous) state.selected[id] = true;
      else delete state.selected[id];

      delete state.pending[id];
      state.errors[id] = message;
    },

    clearError(state, action: PayloadAction<{ id: string }>) {
      delete state.errors[action.payload.id];
    },
  },
});

export const { started, succeeded, failed, clearError } = favoritesSlice.actions;
export default favoritesSlice.reducer;
