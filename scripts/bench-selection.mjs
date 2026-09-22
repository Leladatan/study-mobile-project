import { performance } from 'node:perf_hooks';

const WARMUP_MS = 60;
const MEASURE_MS = 300;
const SLICE_MS = 10;
const VISIBLE_ROWS = 20;
const REGION_CODES = ['EAS', 'ECS', 'LCN', 'MEA', 'NAC', 'SAS', 'SSF'];

let sink;

function measure(fn) {
  const warmupEnd = performance.now() + WARMUP_MS;
  while (performance.now() < warmupEnd) sink = fn();

  const samples = [];
  const end = performance.now() + MEASURE_MS;
  while (performance.now() < end) {
    const start = performance.now();
    let runs = 0;
    let elapsed = 0;
    do {
      sink = fn();
      runs += 1;
      elapsed = performance.now() - start;
    } while (elapsed < SLICE_MS);
    samples.push(elapsed / runs);
  }
  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

function formatTime(ms) {
  const ns = ms * 1e6;
  if (ns < 1_000) return `${ns.toFixed(0)} нс`;
  if (ns < 1_000_000) return `${(ns / 1_000).toFixed(1)} мкс`;
  return `${(ns / 1_000_000).toFixed(2)} мс`;
}

function formatRatio(before, after) {
  const k = before / after;
  if (k >= 1.15) return `в ${k.toFixed(1)} раз быстрее`;
  if (k <= 1 / 1.15) return `в ${(1 / k).toFixed(1)} раз медленнее`;
  return 'одинаково';
}

function printTable(title, sizeLabel, rows) {
  console.log(`\n${title}`);
  console.log(
    `  ${sizeLabel.padEnd(10)}${'было'.padStart(12)}${'стало'.padStart(12)}   итог`,
  );
  for (const row of rows) {
    console.log(
      `  ${row.size.toLocaleString('ru-RU').padEnd(10)}${formatTime(row.before).padStart(12)}${formatTime(row.after).padStart(12)}   ${formatRatio(row.before, row.after)}`,
    );
  }
}

function makeIds(count) {
  return Array.from({ length: count }, (_, i) => `C${String(i).padStart(6, '0')}`);
}

function makeTopics(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `C${String(i).padStart(6, '0')}`,
    title: `Country ${i} Andorra`,
    capital: `Capital ${i}`,
    regionCode: REGION_CODES[i % (REGION_CODES.length - 1)],
  }));
}

function runRenderPass() {
  const rows = [];
  for (const size of [12, 100, 1_000, 10_000]) {
    const ids = makeIds(size * 2);
    const selectedArray = ids.slice(0, size);
    const selectedSet = new Set(selectedArray);
    const step = Math.max(1, Math.floor(ids.length / VISIBLE_ROWS));
    const visible = ids.filter((_, i) => i % step === 0).slice(0, VISIBLE_ROWS);

    const before = measure(() => {
      let count = 0;
      for (const id of visible) if (selectedArray.includes(id)) count += 1;
      return count;
    });
    const after = measure(() => {
      let count = 0;
      for (const id of visible) if (selectedSet.has(id)) count += 1;
      return count;
    });
    rows.push({ size, before, after });
  }
  printTable(
    `1. Отрисовка: ${VISIBLE_ROWS} видимых карточек спрашивают «я выбрана?» — array.includes против Set.has`,
    'выбрано',
    rows,
  );
}

function runToggle() {
  const toggleArray = (previous, id) =>
    previous.includes(id) ? previous.filter((x) => x !== id) : [...previous, id];
  const toggleSet = (previous, id) => {
    const next = new Set(previous);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  };

  const rows = [];
  for (const size of [12, 100, 1_000, 10_000]) {
    const ids = makeIds(size + 1);
    const baseArray = ids.slice(0, size);
    const baseSet = new Set(baseArray);
    const newId = ids[size];
    const before = measure(() => toggleArray(baseArray, newId));
    const after = measure(() => toggleSet(baseSet, newId));
    rows.push({ size, before, after });
  }
  printTable(
    '2. Нажатие: иммутабельное переключение выбора — копия массива против копии Set',
    'выбрано',
    rows,
  );
}

function runRegions() {
  const rows = [];
  for (const size of [12, 217, 10_000, 100_000]) {
    const topics = makeTopics(size);
    const before = measure(() => [...new Set(topics.map((topic) => topic.regionCode))]);
    const after = measure(() =>
      REGION_CODES.filter((code) => topics.some((topic) => topic.regionCode === code)),
    );
    rows.push({ size, before, after });
  }
  printTable(
    `3. Список регионов: Set из всех N стран — против ${REGION_CODES.length} кодов enum × some с ранним выходом`,
    'стран',
    rows,
  );
}

function runDedupe() {
  const rows = [];
  for (const size of [100, 1_000, 5_000]) {
    const values = Array.from({ length: size }, (_, i) => `V${i % Math.ceil(size / 2)}`);
    const before = measure(() => values.filter((value, i) => values.indexOf(value) === i));
    const after = measure(() => [...new Set(values)]);
    rows.push({ size, before, after });
  }
  printTable(
    '4. Уникальные значения, когда их много: filter + indexOf O(N²) против Set O(N)',
    'элементов',
    rows,
  );
}

function runSearch() {
  const rows = [];
  for (const size of [12, 217, 10_000]) {
    const topics = makeTopics(size);
    const index = topics.map((topic) => ({
      topic,
      title: topic.title.toLowerCase(),
      capital: topic.capital.toLowerCase(),
    }));
    const needle = 'an';
    const before = measure(() =>
      topics.filter(
        (topic) =>
          topic.title.toLowerCase().includes(needle) ||
          topic.capital.toLowerCase().includes(needle),
      ),
    );
    const after = measure(() =>
      index
        .filter((entry) => entry.title.includes(needle) || entry.capital.includes(needle))
        .map((entry) => entry.topic),
    );
    rows.push({ size, before, after });
  }
  printTable(
    '5. Поиск: toLowerCase на каждый запрос против заранее подготовленного индекса',
    'стран',
    rows,
  );
}

console.log('Бенчмарк структур данных WorldDex');
console.log(`Node ${process.version}. Время — медиана на одну операцию, меньше — лучше.`);
console.log('Цифры меняются от запуска к запуску; смотрите на порядок и на то, как они растут.');

runRenderPass();
runToggle();
runRegions();
runDedupe();
runSearch();

if (sink === undefined) console.log('');
