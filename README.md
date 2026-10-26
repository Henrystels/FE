# Todo App (Quasar + Vue 3 + TypeScript)

Учебный проект по практическим работам 1–11: ToDo-приложение с Pinia, Vue Router, mock API, валидацией, тестами и деплоем на GitHub Pages.

## Запуск

```bash
cd todo-app
npm install
npm run mock:install
npm run mock:start   # терминал 1 — API на :3001
npm run dev          # терминал 2 — приложение
```

Демо-вход: `demo@todo.app` / `password`

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Режим разработки |
| `npm run build` | Сборка production |
| `npm run test:run` | Unit и компонентные тесты (Vitest) |
| `npm run typecheck` | Проверка TypeScript |
| `npm run mock:start` | Mock backend (json-server + JWT) |

## Структура

- `src/` — приложение (компоненты, stores, services, composables)
- `mock/` — локальный API (практика 7)
- `tests/` — тесты (практика 10)
- `.github/workflows/deploy.yml` — CI и GitHub Pages (практика 11)
