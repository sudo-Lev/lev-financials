# План реалізації локального фінансового дашборда

## Зафіксовані рішення

- React, TypeScript і Vite.
- HextaUI поверх shadcn/ui та Tailwind CSS.
- Chart.js через `react-chartjs-2`.
- TanStack Table для таблиці транзакцій.
- Dexie та IndexedDB для локального зберігання.
- Без бекенду, авторизації та серверного завантаження виписок.
- Українська мова інтерфейсу; структура готова до майбутньої локалізації.
- PDF із текстовим шаром, XLSX і CSV; OCR не входить у scope.
- Перший спеціалізований PDF-парсер — Millennium Bank.
- Чиста domain/application/infrastructure архітектура.
- Власні design tokens для UI, категорій і графіків.
- Грошові суми зберігаються в minor units, без обчислень через floating point.

## Правила роботи з Git

1. Один комміт вирішує одну завершену задачу.
2. Тести бізнес-логіки додаються в тому самому комміті, що й логіка.
3. Після кожного комміту мають проходити typecheck, lint і релевантні тести.
4. Не змішувати рефакторинг, форматування та нову поведінку без потреби.
5. Не коммітити сирі банківські виписки або персональні фінансові дані.
6. Для parser fixtures використовувати лише санітизовані дані.
7. Назви коммітів — у Conventional Commits форматі.
8. Кожна фаза завершується робочим вертикальним сценарієм, а не набором нез'єднаних модулів.

## Фаза 0. Репозиторій і базова якість

### 1. `docs: add implementation roadmap`

- Ініціалізувати Git.
- Додати цей roadmap.
- Додати базовий `.gitignore` для локальних, generated і фінансових файлів.

### 2. `chore: scaffold React TypeScript app`

- Створити Vite React TypeScript застосунок.
- Зафіксувати package manager.
- Додати базові scripts: `dev`, `build`, `typecheck`, `lint`, `test`.

### 3. `chore: configure quality tooling`

- Налаштувати lint і formatting.
- Додати Vitest та Testing Library.
- Додати path aliases.
- Додати CI-friendly команду `check`.

**Gate фази:** чистий застосунок запускається, тестується та збирається однією командою.

## Фаза 1. Design system та application shell

### 4. `feat(ui): add design tokens and themes`

- Підключити Tailwind CSS і shadcn foundation.
- Додати semantic color tokens, typography, spacing, radii та shadows.
- Додати light/dark themes.
- Окремо визначити `income`, `expense`, `transfer`, `warning` і chart palette.

### 5. `feat(ui): add HextaUI primitives`

- Додати лише потрібні компоненти: Button, Card, Dialog, Sheet, Sidebar, Table, Tabs, Tooltip, Select, Badge, Skeleton, Empty, Sonner.
- Створити стабільний public API в `shared/ui`.
- Не імпортувати HextaUI напряму з feature-модулів.

### 6. `feat(app): add responsive application shell`

- Додати router.
- Створити sidebar і mobile navigation.
- Додати сторінки-заглушки: Огляд, Транзакції, Категорії, Регулярні платежі, Імпорт, Налаштування.
- Додати українські labels і базову i18n-ready структуру.

**Gate фази:** адаптивний shell працює на desktop і mobile та використовує єдині design tokens.

## Фаза 2. Домен і локальне зберігання

### 7. `feat(domain): add money and currency value objects`

- Реалізувати `Money` у minor units.
- Додати безпечне додавання, віднімання, порівняння та форматування.
- Додати підтримку PLN, USD, EUR та UAH без прив'язки домену до конкретного списку валют.
- Покрити правила unit-тестами.

### 8. `feat(domain): model statements and transactions`

- Додати `Account`, `Statement`, `Transaction`, `Merchant` та source metadata.
- Розділити booking date і transaction date.
- Додати direction, balance, original currency та exchange rate.
- Додати стани validation/confidence.

### 9. `feat(domain): model categories and recurring payments`

- Додати `Category`, `CategoryRule`, `RecurringPayment`, `Tag`, `Note` та `Budget`.
- Визначити інваріанти й типи recurring payment: subscription, bill, tax, transfer.

### 10. `feat(storage): add IndexedDB schema and repositories`

- Додати Dexie schema v1.
- Реалізувати repository interfaces з domain/application шару.
- Додати adapters для IndexedDB.
- Додати механізм міграцій.
- Не зберігати оригінальний PDF за замовчуванням.

**Gate фази:** доменні сутності зберігаються й відновлюються після reload без залежності домену від Dexie.

## Фаза 3. Перший вертикальний import pipeline

### 11. `feat(import): add local file intake`

- Додати drag-and-drop і file picker.
- Перевіряти формат і розмір файлу.
- Показувати статус локальної обробки та privacy notice.

### 12. `feat(import): add PDF text extraction adapter`

- Підключити PDF.js.
- Витягувати текст разом із координатами та сторінкою.
- Повертати структурований extraction result, не domain-транзакції.
- Явно повідомляти про PDF без текстового шару; OCR не запускати.

### 13. `feat(import): parse Millennium statements`

- Визначати формат Millennium Bank.
- Парсити період, валюту, opening/closing balance та місячні totals.
- Парсити booking date, transaction date, operation type, description, amount і balance after.
- Підтримати польський формат сум і trailing minus.
- Підтримати original amount, currency та exchange rate.
- Додати санітизовані fixtures і parser tests.

### 14. `feat(import): normalize and deduplicate transactions`

- Нормалізувати описи й merchant names.
- Генерувати стабільний fingerprint.
- Виявляти дублікати між повторними імпортами.
- Не об'єднувати різні операції з однаковою сумою та датою без достатніх ознак.

### 15. `feat(import): reconcile statement balances`

- Перевіряти `opening + credits - debits = closing`.
- Звіряти running balance, якщо він присутній.
- Показувати warnings для неповного або сумнівного імпорту.
- Не дозволяти silent partial import.

### 16. `feat(import): add review and confirm flow`

- Показувати preview до запису в IndexedDB.
- Виводити totals, кількість транзакцій, duplicates та issues.
- Дозволити підтвердити або скасувати імпорт.
- Зберігати statement і transactions атомарно.

**Gate фази:** санітизована Millennium-виписка проходить шлях file → preview → reconciliation → IndexedDB.

## Фаза 4. Транзакції та категоризація

### 17. `feat(transactions): add transaction table`

- Підключити TanStack Table з HextaUI styling.
- Додати сортування, пошук, filters, pagination та column visibility.
- Показувати category, merchant, amount, currency, dates і flags.
- Передбачити virtualization для великих виписок.

### 18. `feat(transactions): add transaction editing`

- Редагувати category, merchant, tags і note.
- Додавати `excludedFromAnalytics` та `isInternalTransfer`.
- Додати bulk category editing.

### 19. `feat(categories): add default taxonomy`

- Додати стартове дерево категорій українською.
- Розділити consumption, taxes, transfers, cash та income.
- Дозволити створювати, перейменовувати й архівувати категорії.

### 20. `feat(categories): add deterministic rules engine`

- Додати правила за merchant, description, operation type та amount range.
- Зберігати priority і confidence.
- Дозволити створити правило з ручного виправлення.
- Додати explainability: показувати, чому спрацювала категорія.

### 21. `feat(categories): categorize imported statements`

- Запускати rules engine після normalization.
- Додати queue «Потребує перевірки».
- Дозволити безпечно перезапустити категоризацію без втрати manual overrides.

**Gate фази:** користувач імпортує виписку, переглядає транзакції, виправляє категорію та створює повторно застосовуване правило.

## Фаза 5. Аналітика та дашборд

### 22. `feat(analytics): add financial calculations`

- Рахувати income, expenses, net cash flow і category totals.
- Виключати internal transfers та excluded transactions.
- Розділяти cash flow і consumption analytics.
- Додати month-over-month calculations.
- Покрити всі агрегати unit-тестами.

### 23. `feat(charts): add themed Chart.js primitives`

- Створити typed wrappers для line, bar і doughnut charts.
- Зв'язати Chart.js із design tokens.
- Додати accessible legends, tooltips, empty та loading states.

### 24. `feat(dashboard): add monthly overview`

- Додати KPI cards.
- Додати cash-flow timeline.
- Додати breakdown за категоріями.
- Додати порівняння місяців, найбільші витрати та uncategorized summary.
- Додати period/account filters.

**Gate фази:** червень і липень можна порівняти без подвійного врахування власних переказів.

## Фаза 6. Регулярні платежі

### 25. `feat(recurring): detect recurring transactions`

- Групувати за normalized merchant/counterparty.
- Аналізувати інтервал, суму та original currency.
- Відрізняти subscription, bill, tax і transfer.
- Розраховувати confidence та прогноз наступної дати.
- Додати unit-тести на monthly, irregular і false-positive сценарії.

### 26. `feat(recurring): add recurring payments workspace`

- Показувати candidates і confirmed items.
- Додавати status: possible, active, ignored, cancelled.
- Показувати monthly та annualized cost.
- Дозволити ручне підтвердження та виправлення.

**Gate фази:** система знаходить повторювані платежі, але не називає регулярний податок підпискою.

## Фаза 7. Дані, приватність і завершення MVP

### 27. `feat(data): add backup and restore`

- Експортувати versioned JSON backup.
- Імпортувати backup із schema validation.
- Експортувати transactions у CSV.

### 28. `feat(settings): add privacy and data controls`

- Видаляти statement разом із похідними даними.
- Повністю очищати локальне сховище з підтвердженням.
- Показувати storage usage і schema version.

### 29. `test: cover critical user journeys`

- Додати Playwright smoke tests.
- Перевірити import, review, category edit, dashboard persistence та backup restore.
- Додати accessibility checks для ключових сторінок.

### 30. `chore: prepare production build`

- Перевірити bundle size та lazy loading.
- Додати error boundary і recoverable error states.
- Додати README з локальним запуском та privacy model.
- Зафіксувати MVP limitations.

**Gate фази:** production build проходить усі перевірки, критичні сценарії покриті, дані можна відновити або повністю видалити.

## Поза scope першої ітерації

- OCR.
- Серверне зберігання та синхронізація між пристроями.
- Авторизація.
- Банківські API та автоматична синхронізація.
- AI-категоризація через зовнішній сервіс.
- Спільні сімейні акаунти.
- Нативні мобільні застосунки.

## Робочий ритм

Після кожного комміту:

1. Запустити релевантні тести.
2. Запустити `typecheck` і `lint`.
3. Для UI-змін перевірити desktop і mobile.
4. Коротко зафіксувати, що змінилося і який наступний комміт.

Починаємо з комміту 1 і не переходимо до наступного gate, доки поточний вертикальний сценарій не працює.
