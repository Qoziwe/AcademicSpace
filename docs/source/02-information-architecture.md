# Information Architecture (STEP 4)

```text
UniPath
│
├── Onboarding                          [Guest]
│   ├── Splash
│   ├── Welcome
│   └── Auth
│       ├── SignUp
│       ├── SignIn
│       └── LoadingHandoff            (2.5s "Ваш навигатор активирован")
│
├── Main (Tab Navigation)               [Free | Premium]
│   ├── Dashboard                      (главная)
│   ├── Universities                   (анкета → фильтры → результаты)
│   ├── AI Mentor                      (портфолио, чат, preview/paywall)   [Premium контент]
│   ├── Active Tasks                   (только рендерится если есть активные Module)  [Premium]
│   └── Profile
│
├── Universities (Stack, вложен в Main)
│   ├── Questionnaire (базовая анкета)
│   ├── FilterCountry
│   ├── FilterUniversity
│   ├── FilterFaculty
│   ├── FilterLanguage
│   ├── FilterCostScholarship
│   ├── Results (Safety / Match / Reach)
│   └── UniversityDetails
│       └── RequiredDocuments          [Premium-only, недоступен на Free]
│
├── AI Mentor (Stack)
│   ├── PortfolioUpload                (резюме, письма, активности, достижения)
│   ├── AnalysisLoading                (анимация "ИИ анализирует...")
│   ├── AnalysisPreview                (заблюренный ответ + paywall card)
│   ├── Paywall / SubscriptionOffer
│   └── Chat                           [Premium, разблокирован]
│       └── ModuleCreatedConfirmation  (карточка-подтверждение в чате)
│
├── Active Tasks / Модули (Stack)       [Premium]
│   ├── ActiveTasksList
│   ├── RoadmapDetail
│   ├── PlanDetail
│   ├── ChecklistDetail
│   ├── TimerDetail
│   └── TaskDetail
│
├── Document Vault (Stack)              [Premium]
│   ├── VaultsList                     (по одной на вуз)
│   └── VaultDetail
│       └── DocumentCellUpload
│
├── Focus & Productivity (Stack)        [Premium]
│   ├── FocusSounds                    (белый шум, дождь и т.д.)
│   └── ProductivityTrackers
│
├── Profile (Stack)
│   ├── Overview                       (уровень, XP, статистика)
│   ├── DeepPortfolio
│   ├── AchievementLog                 ("Журнал выполненных заданий")
│   ├── DocumentVaults                 (список копилок) [Premium]
│   ├── Subscription
│   │   ├── PlanSelection              (Неделя / Месяц)
│   │   ├── PaymentFlow
│   │   └── ManageSubscription
│   └── Settings
│       ├── Account
│       ├── Notifications
│       ├── About
│       └── Legal (ToS/Privacy)
│
└── System
    ├── Error
    ├── Offline
    ├── Maintenance
    └── UpdateRequired
```

## Примечания к IA

- **Burger-меню** (упомянуто в концепте на дашборде) дублирует доступ к
  `Settings`, `About`, `Subscription` — не отдельная ветка IA, а точка
  входа (навигационная, см. `06-navigation.md`).
- **`Active Tasks`** как таб виден только когда `role = Premium` **и**
  есть хотя бы один активный Module — иначе таб не резервирует место
  (жёсткое требование концепта: «этого блока на экране нет вообще»).
  Технически это решается на уровне Navigation config, а не просто
  visual hidden — см. `06-navigation.md`.
- **`RequiredDocuments`** физически недостижим для Free-роли — экран
  существует в дереве, но route guard (`Premium: true`) не пускает
  Free-пользователя, редиректя на `Paywall`.
