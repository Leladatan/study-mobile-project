import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import favoritesReducer, { failed, started, succeeded } from './favoritesSlice';

describe('favoritesSlice', () => {
  it('started сразу меняет selected и пишет pending', () => {
    const state = favoritesReducer(
      undefined,
      started({ id: 'JPN', next: true, requestId: 'r1' }),
    );

    assert.equal(state.selected.JPN, true);
    assert.deepEqual(state.pending.JPN, { requestId: 'r1', previous: false });
    assert.equal(state.errors.JPN, undefined);
  });

  it('started игнорирует повтор, пока есть pending', () => {
    const first = favoritesReducer(
      undefined,
      started({ id: 'JPN', next: true, requestId: 'r1' }),
    );
    const second = favoritesReducer(
      first,
      started({ id: 'JPN', next: false, requestId: 'r2' }),
    );

    assert.equal(second.selected.JPN, true);
    assert.equal(second.pending.JPN?.requestId, 'r1');
  });

  it('succeeded снимает pending и оставляет новое значение', () => {
    const pending = favoritesReducer(
      undefined,
      started({ id: 'JPN', next: true, requestId: 'r1' }),
    );
    const done = favoritesReducer(pending, succeeded({ id: 'JPN', requestId: 'r1' }));

    assert.equal(done.selected.JPN, true);
    assert.equal(done.pending.JPN, undefined);
  });

  it('failed откатывает добавление', () => {
    const pending = favoritesReducer(
      undefined,
      started({ id: 'JPN', next: true, requestId: 'r1' }),
    );
    const rolled = favoritesReducer(
      pending,
      failed({ id: 'JPN', requestId: 'r1', message: 'fail' }),
    );

    assert.equal(rolled.selected.JPN, undefined);
    assert.equal(rolled.pending.JPN, undefined);
    assert.equal(rolled.errors.JPN, 'fail');
  });

  it('failed откатывает удаление', () => {
    let state = favoritesReducer(
      undefined,
      started({ id: 'JPN', next: true, requestId: 'r1' }),
    );
    state = favoritesReducer(state, succeeded({ id: 'JPN', requestId: 'r1' }));
    state = favoritesReducer(
      state,
      started({ id: 'JPN', next: false, requestId: 'r2' }),
    );
    state = favoritesReducer(
      state,
      failed({ id: 'JPN', requestId: 'r2', message: 'fail remove' }),
    );

    assert.equal(state.selected.JPN, true);
    assert.equal(state.errors.JPN, 'fail remove');
  });

  it('чужой requestId игнорируется', () => {
    const pending = favoritesReducer(
      undefined,
      started({ id: 'JPN', next: true, requestId: 'r1' }),
    );
    const ignored = favoritesReducer(
      pending,
      failed({ id: 'JPN', requestId: 'other', message: 'nope' }),
    );

    assert.equal(ignored.selected.JPN, true);
    assert.equal(ignored.pending.JPN?.requestId, 'r1');
    assert.equal(ignored.errors.JPN, undefined);
  });

  it('ошибка A не меняет B', () => {
    let state = favoritesReducer(
      undefined,
      started({ id: 'A', next: true, requestId: 'ra' }),
    );
    state = favoritesReducer(state, started({ id: 'B', next: true, requestId: 'rb' }));
    state = favoritesReducer(
      state,
      failed({ id: 'A', requestId: 'ra', message: 'A failed' }),
    );
    state = favoritesReducer(state, succeeded({ id: 'B', requestId: 'rb' }));

    assert.equal(state.selected.A, undefined);
    assert.equal(state.selected.B, true);
    assert.equal(state.errors.A, 'A failed');
    assert.equal(state.pending.B, undefined);
  });
});
