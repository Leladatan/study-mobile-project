import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiErrorCode, isApiError } from '../../shared/api/errors';
import { IncomeLevel, RegionCode } from '../../types/topic';
import {
  isAggregate,
  parseCountryDto,
  parseCountryPage,
  parsePopulation,
  toTopic,
} from './countryDto';

const japan = {
  id: 'JPN',
  iso2Code: 'JP',
  name: 'Japan',
  region: { id: 'EAS', iso2code: 'Z4', value: 'East Asia & Pacific' },
  adminregion: { id: '', iso2code: '', value: '' },
  incomeLevel: { id: 'HIC', iso2code: 'XD', value: 'High income' },
  lendingType: { id: 'LNX', iso2code: 'XX', value: 'Not classified' },
  capitalCity: 'Tokyo',
  longitude: '139.77',
  latitude: '35.67',
};

const aggregate = {
  id: 'AFE',
  iso2Code: 'ZH',
  name: 'Africa Eastern and Southern',
  region: { id: 'NA', iso2code: 'NA', value: 'Aggregates' },
  adminregion: { id: '', iso2code: '', value: '' },
  incomeLevel: { id: 'NA', iso2code: 'NA', value: 'Aggregates' },
  lendingType: { id: '', iso2code: '', value: 'Aggregates' },
  capitalCity: '',
  longitude: '',
  latitude: '',
};

const meta = { page: 1, pages: 6, per_page: '50', total: 296 };

function failureOf(run: () => unknown): { code: ApiErrorCode; message: string } {
  try {
    run();
  } catch (error) {
    assert.ok(isApiError(error), 'ожидали ApiError');
    return { code: error.code, message: error.message };
  }

  assert.fail('ожидали ошибку, но её не было');
}

test('корректная запись проходит проверку', () => {
  const dto = parseCountryDto(japan);

  assert.equal(dto.id, 'JPN');
  assert.equal(dto.name, 'Japan');
  assert.equal(dto.capitalCity, 'Tokyo');
  assert.equal(dto.region.id, 'EAS');
});

test('страна без столицы разбирается: в справочнике такие есть', () => {
  const dto = parseCountryDto({ ...japan, capitalCity: '' });

  assert.equal(dto.capitalCity, '');
});

test('null вместо названия отклоняется как contract_error', () => {
  const failure = failureOf(() => parseCountryDto({ ...japan, name: null }));

  assert.equal(failure.code, ApiErrorCode.Contract);
  assert.equal(failure.message, 'country.name');
});

test('пустое название отклоняется', () => {
  const failure = failureOf(() => parseCountryDto({ ...japan, name: '   ' }));

  assert.equal(failure.code, ApiErrorCode.Contract);
});

test('потерянный вложенный объект отклоняется с именем поля', () => {
  const failure = failureOf(() => parseCountryDto({ ...japan, region: undefined }));

  assert.equal(failure.code, ApiErrorCode.Contract);
  assert.equal(failure.message, 'country.region');
});

test('строка вместо записи отклоняется', () => {
  const failure = failureOf(() => parseCountryDto('Japan'));

  assert.equal(failure.code, ApiErrorCode.Contract);
  assert.equal(failure.message, 'country');
});

test('toTopic переносит поля в модель приложения', () => {
  const topic = toTopic(parseCountryDto(japan));

  assert.equal(topic.id, 'JPN');
  assert.equal(topic.title, 'Japan');
  assert.equal(topic.capital, 'Tokyo');
  assert.equal(topic.regionCode, RegionCode.EAS);
  assert.equal(topic.regionName, 'Восточная Азия и Тихий океан');
  assert.equal(topic.incomeLevel, IncomeLevel.High);
  assert.equal(topic.imageUrl, 'https://flagcdn.com/w320/jp.png');
  assert.equal(topic.population, undefined);
  assert.equal(topic.latitude, 35.67);
  assert.equal(topic.longitude, 139.77);
});

test('пустые координаты не становятся нулями', () => {
  const topic = toTopic(parseCountryDto({ ...japan, longitude: '', latitude: '' }));

  assert.equal(topic.latitude, undefined);
  assert.equal(topic.longitude, undefined);
});

test('неизвестный регион отклоняется, а не подставляется молча', () => {
  const dto = parseCountryDto({ ...japan, region: { id: 'ZZZ', value: 'Mars' } });
  const failure = failureOf(() => toTopic(dto));

  assert.equal(failure.code, ApiErrorCode.Contract);
  assert.equal(failure.message, 'country.region.id');
});

test('агрегаты отличаются от стран по region.id', () => {
  assert.equal(isAggregate(parseCountryDto(aggregate)), true);
  assert.equal(isAggregate(parseCountryDto(japan)), false);
});

test('страница читает meta и отбрасывает агрегаты', () => {
  const page = parseCountryPage([meta, [japan, aggregate]]);

  assert.equal(page.page, 1);
  assert.equal(page.pages, 6);
  assert.equal(page.total, 296);
  assert.equal(page.items.length, 1);
  assert.equal(page.items[0].id, 'JPN');
});

test('ответ 200 с телом ошибки превращается в not_found', () => {
  const body = [{ message: [{ id: '120', key: 'Invalid value', value: 'not valid' }] }];
  const failure = failureOf(() => parseCountryPage(body));

  assert.equal(failure.code, ApiErrorCode.NotFound);
});

test('ответ не того вида отклоняется', () => {
  const failure = failureOf(() => parseCountryPage({ items: [] }));

  assert.equal(failure.code, ApiErrorCode.Contract);
  assert.equal(failure.message, 'response');
});

test('население читается из ответа индикатора', () => {
  const body = [
    { page: 1, pages: 1, per_page: 1, total: 1 },
    [{ countryiso3code: 'JPN', date: '2025', value: 123366734 }],
  ];

  const fact = parsePopulation(body);

  assert.deepEqual(fact, { value: 123366734, year: '2025' });
});

test('отсутствующее значение населения — это не ошибка', () => {
  const body = [
    { page: 1, pages: 1, per_page: 1, total: 1 },
    [{ countryiso3code: 'JPN', date: '2025', value: null }],
  ];

  assert.equal(parsePopulation(body), null);
});

test('пустой список наблюдений даёт null', () => {
  assert.equal(parsePopulation([{ page: 1, pages: 0, total: 0 }, []]), null);
});
