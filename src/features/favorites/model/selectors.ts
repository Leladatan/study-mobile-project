import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../app/store';
import { catalogApi } from '../../posts/api/catalogApi';
import type { Topic } from '../../../types/topic';

const selectSelected = (state: RootState) => state.favorites.selected;
const selectPending = (state: RootState) => state.favorites.pending;
const selectErrors = (state: RootState) => state.favorites.errors;

export const selectFavoriteIds = createSelector([selectSelected], (selected) =>
  Object.keys(selected).filter((id) => selected[id] === true),
);

export const selectFavoriteCount = createSelector(
  [selectFavoriteIds],
  (ids) => ids.length,
);

export const selectIsFavorite = (state: RootState, id: string): boolean =>
  state.favorites.selected[id] === true;

export const selectIsFavoritePending = (state: RootState, id: string): boolean =>
  state.favorites.pending[id] !== undefined;

export const selectFavoriteError = (state: RootState, id: string): string | undefined =>
  state.favorites.errors[id];

export const selectFavoritePendingEntries = createSelector([selectPending], (pending) =>
  Object.entries(pending).flatMap(([id, op]) => (op ? [{ id, ...op }] : [])),
);

export const selectFavoriteErrorEntries = createSelector([selectErrors], (errors) =>
  Object.entries(errors).flatMap(([id, message]) =>
    message ? [{ id, message }] : [],
  ),
);

const selectAllCachedTopics = createSelector(
  [(state: RootState) => state[catalogApi.reducerPath]],
  (apiState) => {
    const topics = new Map<string, Topic>();

    for (const entry of Object.values(apiState.queries)) {
      if (!entry || entry.status !== 'fulfilled' || entry.data === undefined) continue;
      const data = entry.data as { items?: Topic[] } | Topic;
      if (data && typeof data === 'object' && 'items' in data && Array.isArray(data.items)) {
        for (const topic of data.items) {
          topics.set(topic.id, topic);
        }
      } else if (
        data &&
        typeof data === 'object' &&
        'id' in data &&
        typeof (data as Topic).id === 'string'
      ) {
        topics.set((data as Topic).id, data as Topic);
      }
    }

    return topics;
  },
);

export type FavoriteListItem = {
  id: string;
  topic: Topic | null;
};

export const selectFavoriteListItems = createSelector(
  [selectFavoriteIds, selectAllCachedTopics],
  (ids, topics): FavoriteListItem[] =>
    ids.map((id) => ({
      id,
      topic: topics.get(id) ?? null,
    })),
);
