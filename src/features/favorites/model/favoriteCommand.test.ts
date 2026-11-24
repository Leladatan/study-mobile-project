import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { configureStore } from '@reduxjs/toolkit';
import { catalogApi } from '../../posts/api/catalogApi';
import { favoriteDemoService } from '../api/favoriteDemoService';
import { toggleFavorite } from './favoriteCommand';
import favoritesReducer from './favoritesSlice';

function createTestStore() {
  return configureStore({
    reducer: {
      favorites: favoritesReducer,
      [catalogApi.reducerPath]: catalogApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(catalogApi.middleware),
  });
}

describe('toggleFavorite', () => {
  it('повторный вызов при pending не обращается к сервису второй раз', async () => {
    const store = createTestStore();
    let calls = 0;

    const original = favoriteDemoService.set;
    favoriteDemoService.set = async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 30));
    };

    try {
      const first = store.dispatch(toggleFavorite('JPN'));
      const second = store.dispatch(toggleFavorite('JPN'));
      await Promise.all([first, second]);

      assert.equal(calls, 1);
      assert.equal(store.getState().favorites.selected.JPN, true);
      assert.equal(store.getState().favorites.pending.JPN, undefined);
    } finally {
      favoriteDemoService.set = original;
    }
  });

  it('при отказе восстанавливает previous', async () => {
    const store = createTestStore();
    const original = favoriteDemoService.set;
    favoriteDemoService.set = async () => {
      throw new Error('boom');
    };

    try {
      await store.dispatch(toggleFavorite('JPN'));
      assert.equal(store.getState().favorites.selected.JPN, undefined);
      assert.match(
        store.getState().favorites.errors.JPN ?? '',
        /не подтверждено/i,
      );
    } finally {
      favoriteDemoService.set = original;
    }
  });
});
