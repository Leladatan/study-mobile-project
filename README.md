# WorldDex

Мобильный справочник стран мира. Учебный проект по дисциплине «Разработка мобильных приложений»,
Институт бизнеса и дизайна, 5 семестр.

![Каталог стран](assets/sprint-2.png)

## Что умеет

- Показывает карточки 12 стран: флаг, столица, регион, население.
- Ищет по названию и столице без учёта регистра.
- Фильтрует страны по региону.
- Отмечает карточки и показывает, сколько выбрано.

Данные пока хранятся в самом приложении, в `src/data/topics.ts`. Загрузка из World Bank API
запланирована на Sprint 3.

## Для кого

Для студентов и школьников, которые готовят доклады по географии и экономике и ищут факты
о стране с телефона.

Основной сценарий: открыть приложение, ввести в поиск `jap`, открыть Japan и посмотреть столицу,
регион, население и уровень дохода, затем вернуться к списку. Отдельный экран страны появится
вместе с навигацией, сейчас эти данные видны прямо в карточке списка.

Подробнее — в [концепции](docs/product-concept.md).

## Стек

- React Native 0.86, Expo SDK 57
- TypeScript
- ESLint с правилами `eslint-config-expo`

## Запуск

```bash
npm install
npm start
```

Отсканируйте QR-код в приложении Expo Go или нажмите `w`, чтобы открыть приложение в браузере.

Проект лежит в папке OneDrive, и после `npm install` Metro иногда падает с ошибкой
`EINVAL: readlink`. В этом случае запускайте с очисткой кэша:

```bash
npx expo start --clear
```

## Команды

| Команда | Что делает |
| --- | --- |
| `npm start` | запускает Metro |
| `npm run web` | открывает приложение в браузере |
| `npm run android` | запускает на Android-эмуляторе |
| `npm run typecheck` | проверяет типы |
| `npm run lint` | запускает ESLint |
| `npm run doctor` | проверяет конфигурацию Expo |
| `npm run bench` | сравнивает скорость массива и `Set` |

## Структура

```
worlddex/
├── App.tsx                          корневой компонент
├── index.ts                         точка входа
├── src/
│   ├── types/topic.ts               тип Topic, RegionCode, IncomeLevel
│   ├── data/topics.ts               данные 12 стран
│   ├── hooks/useCatalog.ts          поиск, фильтр и выбор
│   ├── components/
│   │   ├── TopicCard.tsx            карточка страны
│   │   ├── SearchField.tsx          поле поиска
│   │   └── RegionFilter.tsx         фильтр по региону
│   ├── screens/CatalogScreen.tsx    экран каталога
│   ├── lib/format.ts                форматирование чисел
│   └── theme.ts                     цвета и отступы
├── assets/                          иконки, скриншоты, резервные данные
├── scripts/bench-selection.mjs      бенчмарк
├── docs/                            документация
└── reports/                         отчёты по практическим работам
```

## Как устроен код

Экран не хранит состояние сам, всё лежит в hook `useCatalog`:

```tsx
const { visibleTopics, query, setQuery, toggleSelection, isSelected } = useCatalog();
```

- **Поиск.** `query` меняется на каждую букву, а список фильтруется по `appliedQuery`. Он
  обновляется через 250 мс после последнего ввода: `useEffect` ставит таймер, cleanup его отменяет.
- **Фильтр.** В `regionCode` хранится выбранный регион или `null`.
- **Выбор.** Отмеченные `id` лежат в `Set`. При нажатии создаётся копия `new Set(previous)`,
  старый объект не меняется.
- **Список.** `FlatList` получает `visibleTopics`, ключ строки — `item.id`.
- **Карточка.** `TopicCard` получает страну через props и при нажатии вызывает `onPress(topic.id)`.
  Она обёрнута в `memo`, поэтому при выборе перерисовывается только одна карточка.

## Как проверить

1. Запустить приложение — на экране 12 карточек.
2. Ввести `an` — останется «6 из 12». `JAPAN` и `japan` дают одинаковый результат.
3. Выбрать регион «Европа и Центральная Азия» — останутся 4 страны.
4. Нажать на две карточки — появятся галочки и «Выбрано: 2».
5. Ввести `zzz` — появится «Ничего не найдено» и кнопка сброса.

## Данные

- API: [World Bank Indicators API v2](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation), ключ не нужен.
- Флаги: [flagcdn.com](https://flagcdn.com).
- Резервный набор: [assets/data/countries.fallback.json](assets/data/countries.fallback.json).
- Лицензия данных: CC BY-4.0.

## Документация

- [Концепция](docs/product-concept.md)
- [Backlog](docs/backlog.md)
- [Среда разработки](docs/environment.md)
- [Git-процесс](docs/git-workflow.md)
- [Ретроспектива](docs/retrospective.md)
- [CHANGELOG](CHANGELOG.md)
- Отчёты: [№ 0](reports/REPORT-00.md), [№ 1](reports/REPORT-01.md), [№ 2](reports/REPORT-02.md)
