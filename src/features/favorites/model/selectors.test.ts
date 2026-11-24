import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { RootState } from '../../../app/store';
import {
  selectFavoriteCount,
  selectFavoriteIds,
  selectIsFavorite,
} from './selectors';
import type { FavoritesState } from './favoritesSlice';

function stateWithFavorites(favorites: FavoritesState): RootState {
  return {
    favorites,
    catalogApi: {
      queries: {},
      mutations: {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: true,
        refetchOnFocus: false,
        refetchOnReconnect: false,
        refetchOnMountOrArgChange: false,
        keepUnusedDataFor: 60,
        reducerPath: 'catalogApi',
      },
    },
  } as RootState;
}

describe('favorites selectors', () => {
  it('не дублирует id и считает верно', () => {
    const state = stateWithFavorites({
      selected: { JPN: true, USA: true, FRA: undefined },
      pending: {},
      errors: {},
    });

    assert.deepEqual(selectFavoriteIds(state).sort(), ['JPN', 'USA']);
    assert.equal(selectFavoriteCount(state), 2);
    assert.equal(selectIsFavorite(state, 'JPN'), true);
    assert.equal(selectIsFavorite(state, 'FRA'), false);
  });

  it('при неизменном selected возвращает тот же массив по ссылке', () => {
    const state = stateWithFavorites({
      selected: { JPN: true },
      pending: {},
      errors: {},
    });

    const first = selectFavoriteIds(state);
    const second = selectFavoriteIds(state);
    assert.equal(first, second);
  });
});
