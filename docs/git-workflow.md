# Git-процесс

Каждый спринт делается в отдельной ветке и попадает в `main` через pull request.

## Шаги

1. Создать ветку от свежего `main`:

   ```bash
   git checkout main
   git pull
   git checkout -b feature/sprint-N-name
   ```

2. Закоммитить и запушить изменения:

   ```bash
   git add -A
   git commit -m "Sprint N: описание"
   git push -u origin feature/sprint-N-name
   ```

3. Открыть на GitHub pull request в `main` и влить его.

4. Обновить `main` у себя:

   ```bash
   git checkout main
   git pull
   ```

5. Поставить тег:

   ```bash
   git tag -a sprint-N -m "Sprint N: описание"
   git push origin sprint-N
   ```

Тег ставится только после шагов 3 и 4. Перед этим стоит выполнить `git log --oneline -1`:
верхний коммит должен быть слиянием pull request.

## Спринты

| Спринт | Ветка | Pull request | Тег |
| --- | --- | --- | --- |
| 0 | `feature/sprint-0-project-concept` | #1 | `sprint-0` |
| 1 | `feature/sprint-1-basic-ui` | #2 | `sprint-1` |
| 2 | `feature/sprint-2-interactive-catalog` | #3 | `sprint-2` |

## Доступ

Репозиторий публичный: https://github.com/Leladatan/study-mobile-project. Если преподавателю
нужен доступ на запись: Settings → Collaborators → Add people.

## Если что-то пошло не так

- **Тег поставлен не на тот коммит.** Удалить его и поставить заново:

  ```bash
  git tag -d sprint-N
  git push origin --delete sprint-N
  ```

- **Нужно перенести существующий тег** на текущий коммит:

  ```bash
  git tag -f -a sprint-N -m "Sprint N: описание"
  git push origin sprint-N --force
  ```

- **`Deletion of directory ... failed` при смене ветки.** Папку держит OneDrive. Ответить `n`
  и на время работы с ветками поставить синхронизацию OneDrive на паузу.
