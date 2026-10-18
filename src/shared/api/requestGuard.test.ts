import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequestGuard } from './requestGuard';

test('актуален только последний запрос', () => {
  const guard = createRequestGuard();

  const first = guard.start();
  assert.equal(guard.isCurrent(first), true);

  const second = guard.start();
  assert.equal(guard.isCurrent(second), true);
  assert.equal(guard.isCurrent(first), false);
});

test('поздний ответ медленного запроса отбрасывается', () => {
  const guard = createRequestGuard();

  const slow = guard.start();
  const fast = guard.start();

  assert.equal(guard.isCurrent(fast), true, 'быстрый ответ применяется');
  assert.equal(guard.isCurrent(slow), false, 'ответ «jap» не перезапишет выдачу «japan»');
});

test('drop обесценивает все незавершённые запросы', () => {
  const guard = createRequestGuard();

  const pending = guard.start();
  guard.drop();

  assert.equal(guard.isCurrent(pending), false);
});

test('у разных экранов свои счётчики', () => {
  const catalog = createRequestGuard();
  const card = createRequestGuard();

  const catalogToken = catalog.start();
  card.start();
  card.start();

  assert.equal(catalog.isCurrent(catalogToken), true);
});
