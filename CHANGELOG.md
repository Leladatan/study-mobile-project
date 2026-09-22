# Changelog

## [Unreleased]

### Изменено

- `RegionId` и `IncomeLevel` заменены на `enum RegionCode` и `enum IncomeLevel`, поле `regionId`
  переименовано в `regionCode`.
- Выбранные карточки хранятся в `Set` вместо массива.
- `TopicCard` передаёт в `onPress` только `id`.
- `TopicCard`, `SearchField` и `RegionFilter` обёрнуты в `memo`.
- Список регионов и поисковый индекс считаются один раз при загрузке модуля.
- `expo` обновлён до 57.0.24, `@expo/metro-runtime` — до 57.0.16.

### Добавлено

- ESLint и команда `npm run lint`.
- Бенчмарк и команда `npm run bench`.

## [sprint-2] — 09.09.2026

### Добавлено

- Hook `useCatalog`: поиск с задержкой 250 мс, фильтр по региону, выбор карточек.
- `SearchField` — поле поиска с кнопкой очистки.
- `RegionFilter` — фильтр по региону.
- Счётчики «N из 12» и «Выбрано», пустое состояние с кнопкой сброса.
- Скриншот и видео в `assets/`.
- `docs/retrospective.md`.

### Изменено

- `CatalogScreen` выводит карточки через `FlatList`.
- У `TopicCard` появился prop `selected`.

## [sprint-1] — 09.09.2026

### Добавлено

- Тип `Topic` и данные 12 стран в `src/data/topics.ts`.
- Компонент `TopicCard`.
- Экран `CatalogScreen`.
- Зависимости для запуска в браузере: `react-dom`, `react-native-web`, `@expo/metro-runtime`.
- Скриншот `assets/sprint-1.png`.

### Изменено

- `App.tsx` показывает каталог вместо заглушки.
- Backlog перепланирован под методички.

## [sprint-0] — 09.09.2026

### Добавлено

- Проект Expo на TypeScript.
- Концепция, backlog, описание среды и git-процесса.
- Резервные данные `assets/data/countries.fallback.json`.
- Экран-заглушка в `App.tsx`.
- В `.gitignore` добавлены `.env` и `.env.*`.
