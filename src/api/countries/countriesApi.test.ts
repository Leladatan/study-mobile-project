import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isValidCountryId, normalizeCountryId } from './countriesApi';

test('код страны из трёх букв проходит проверку', () => {
  assert.equal(isValidCountryId('JPN'), true);
  assert.equal(isValidCountryId('RUS'), true);
});

test('мусор вместо кода страны отклоняется', () => {
  assert.equal(isValidCountryId('12'), false);
  assert.equal(isValidCountryId('JAPAN'), false);
  assert.equal(isValidCountryId(''), false);
  assert.equal(isValidCountryId('JP'), false);
});

test('адрес в нижнем регистре приводится к коду справочника', () => {
  assert.equal(normalizeCountryId('jpn'), 'JPN');
  assert.equal(normalizeCountryId(' rus '), 'RUS');
});

test('параметр маршрута проверяется во время выполнения', () => {
  assert.equal(normalizeCountryId(undefined), undefined, 'параметра нет');
  assert.equal(normalizeCountryId(42), undefined, 'не строка');
  assert.equal(normalizeCountryId('12'), undefined, 'неверный формат');
  assert.equal(normalizeCountryId('../etc'), undefined, 'посторонний текст');
});

test('повторённый параметр берётся первым значением', () => {
  assert.equal(normalizeCountryId(['JPN', 'RUS']), 'JPN');
  assert.equal(normalizeCountryId([]), undefined);
});
