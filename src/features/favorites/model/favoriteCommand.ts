import { nanoid } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../../../app/store';
import { favoriteDemoService } from '../api/favoriteDemoService';
import { failed, started, succeeded } from './favoritesSlice';

export const toggleFavorite = (id: string) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState().favorites;
    if (state.pending[id]) return;

    const next = state.selected[id] !== true;
    const requestId = nanoid();

    dispatch(started({ id, next, requestId }));

    try {
      await favoriteDemoService.set(id, next);
      dispatch(succeeded({ id, requestId }));
    } catch {
      dispatch(
        failed({
          id,
          requestId,
          message: 'Изменение не подтверждено. Повторите попытку.',
        }),
      );
    }
  };
};
