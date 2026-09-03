# API Contract — AcademicSpace ↔ Flask backend

Заполняется по ходу разработки фронтенда (см. `CLAUDE.md` §5). Формат
каждой записи:

```
*** Метод: GET|POST|PUT|PATCH|DELETE
*** URL: /api/v1/...
*** Отправляем: {поля тела / квери-параметры}
*** Ожидаем получить: {форма ответа}
```

Правило: каждый TanStack Query хук в `hooks/api/*`, который сейчас
смотрит на мок в `mocks/handlers/*`, обязан иметь соответствующую запись
здесь — даже пока бекенда нет. Так бекендер сможет писать Flask-эндпоинты
по этому файлу, а замена мока на реальный fetch в Фазе 7 не потребует
менять форму данных.

## Auth
```
*** Метод: POST
*** URL: /api/v1/auth/signup
*** Отправляем: {email, password, grade}
*** Ожидаем получить: {token, user: {id, name, email, grade}}

*** Метод: POST
*** URL: /api/v1/auth/signin
*** Отправляем: {email, password}
*** Ожидаем получить: {token, user: {id, name, email, grade}}
```

## Profile
```
*** Метод: GET
*** URL: /api/v1/profile/me
*** Отправляем: token
*** Ожидаем получить: {id, name, avatarUrl, level, xp, xpToNextLevel,
    plan: "free"|"premium", subscription: {period, renewsAt} | null}
```

## Questionnaire / Universities
```
*** Метод: GET
*** URL: /api/v1/questionnaire
*** Отправляем: token
*** Ожидаем получить: {filled: boolean, interests: [...],
    groups: [{title, fields: [{label, value}]}]}

*** Метод: POST
*** URL: /api/v1/questionnaire
*** Отправляем: token, {academics: {...}, interests: [...], preferences: {...}}
*** Ожидаем получить: {questionnaireId, filled: true}

*** Метод: POST
*** URL: /api/v1/universities/search
*** Отправляем: token, {country, universities: [...], faculty, language, costRange}
*** Ожидаем получить: {country, matchesCount, rating,
    groups: [{category: "safety"|"match"|"reach",
    items: [{id, name, city, chance, tags: []}]}]}

*** Метод: GET
*** URL: /api/v1/universities/:id
*** Отправляем: token
*** Ожидаем получить: {id, name, city, description, admissionsUrl,
    requiredDocuments: [...] | null}
```

## AI Mentor
```
*** Метод: POST
*** URL: /api/v1/ai/portfolio
*** Отправляем: token, {resume, motivationLetters: [...], activities: [...], achievements: [...]}
*** Ожидаем получить: {analysisId, status: "processing"}

*** Метод: GET
*** URL: /api/v1/ai/analysis/:analysisId
*** Отправляем: token
*** Ожидаем получить: {status, previewText, fullText: string | null}

*** Метод: POST
*** URL: /api/v1/ai/chat/messages
*** Отправляем: token, {text}
*** Ожидаем получить: {reply: {text, module: {kind, title, sub, description} | null}}
```

## Tasks / Modules
```
*** Метод: GET
*** URL: /api/v1/tasks
*** Отправляем: token
*** Ожидаем получить: [{id, kind, title, meta, xp, items: [{label, done}], isTimer}]

*** Метод: PATCH
*** URL: /api/v1/tasks/:taskId/items/:itemIndex
*** Отправляем: token, {done}
*** Ожидаем получить: {task: {...обновлённая задача}}
```

## Document Vaults
```
*** Метод: GET
*** URL: /api/v1/vaults
*** Отправляем: token
*** Ожидаем получить: [{id, universityId, universityName,
    cells: [{documentName, uploaded, fileUrl}]}]

*** Метод: POST
*** URL: /api/v1/vaults/:vaultId/cells/:cellIndex
*** Отправляем: token, file (multipart)
*** Ожидаем получить: {cell: {...обновлённая ячейка}}
```

## Subscription
```
*** Метод: GET
*** URL: /api/v1/subscription/plans
*** Отправляем: token
*** Ожидаем получить: [{id, period: "week"|"month", price, label}]

*** Метод: POST
*** URL: /api/v1/subscription/subscribe
*** Отправляем: token, {planId, paymentMethod}
*** Ожидаем получить: {status: "success"|"failed", subscription: {...}}
```

## TBD (добавлять по ходу Фазы 3–4)
- Achievement Log endpoints
- Focus tools trackers persistence
- Settings / notifications preferences
