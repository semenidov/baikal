# Документация проекта «Байкал» — лендинг турагентства

> Живой документ — полная актуальная картина проекта. Источник правды для Claude:
> сверяться с ним вместо перечитывания всего кода. Обновлять после значимых изменений.
> Последнее обновление: 2026-07-20
>
> Составлено по коду проекта (`src/`, `astro.config.mjs`, `package.json`,
> `.github/workflows/ci.yml`). Пункты, не подтверждённые кодом, помечены как предположение.

## 1. Обзор

- Назначение: одностраничный сайт турагентства из Иркутска — авторские зимние туры на Байкал. Задача — вызвать доверие и привести к заявке в Telegram.
- Тип: статический лендинг (SSG, 0 JS по умолчанию; на клиенте — только аналитика).
- Аудитория / заказчик: клиенты турагентства; онлайн-оплаты и бронирования нет — единственная конверсия — переход/сообщение в Telegram.
- Целевое действие: клик по ссылке `t.me/…`; трекается как событие `telegram_click` с указанием секции.

## 2. Стек и версии

- Astro `^7.0.7` — статическая генерация, файловый роутинг, компоненты `.astro`.
- Tailwind CSS v4 `^4.3.2` через плагин `@tailwindcss/vite` (без `tailwind.config` — конфиг CSS-first в `global.css`).
- Шрифты: Unbounded (заголовки) + Inter Variable (текст), самохостинг из `public/fonts/` (пакеты `@fontsource*` стоят, но подключение идёт через локальные `@font-face`, см. §4.4).
- `@astrojs/sitemap` — sitemap при сборке.
- `@vercel/analytics` — веб-аналитика + кастомные события.
- Node ≥ 22.12. Пакетный менеджер — **npm** (отличие от дефолтного pnpm рабочего пространства).
- Тулинг качества: ESLint 10 (flat config) + Prettier 3 + typescript-eslint 8 + eslint-plugin-astro 3 (см. §9).

## 3. Структура проекта

```text
src/
├── data/site.ts          # ← ВЕСЬ контент и данные (единая точка правки)
├── styles/global.css     # дизайн-система «Ice-Blue»: @font-face, @theme, компоненты
├── layouts/Base.astro    # <head>, SEO/OG, JSON-LD, аналитика, <slot/>
├── pages/index.astro     # порядок секций страницы
├── components/           # секции (см. §3.2)
└── assets/photos/        # фото, оптимизируются при сборке (astro:assets)
public/                   # отдаётся как есть: fonts/, favicon, og-image, манифест, robots
```

- Точка входа: `src/pages/index.astro` (единственная страница).
- Данные: `src/data/site.ts` — компоненты только читают отсюда, тексты в разметке не хардкодятся.
- Каркас документа: `src/layouts/Base.astro`.

### 3.1. Модель данных (`src/data/site.ts`)

Все экспорты — типизированные объекты `as const` / с явными типами. Каждый компонент импортирует свой срез.

| Экспорт          | Форма                                                                        | Кто потребляет             |
| :--------------- | :--------------------------------------------------------------------------- | :------------------------- |
| `site`           | `{ brand, brandTagline, telegram, telegramHandle, meta{title,description} }` | `Base`, `Header`, `Footer` |
| `hero`           | `{ eyebrow, title, subtitle, ctaPrimary, ctaSecondary }`                     | `Hero`                     |
| `founders`       | `{ eyebrow, title, lead, story[], people[]{name,role,note,photo} }`          | `Founders`                 |
| `tours`          | `Tour[]` (тип `Tour` экспортируется)                                         | `Tours`                    |
| `pricing`        | `{ hint, note }`                                                             | `Tours`                    |
| `individualTour` | `{ title, text, cta }`                                                       | `Tours`                    |
| `howItWorks`     | `{ eyebrow, title, steps[]{n,title,text} }`                                  | `HowItWorks`               |
| `trust`          | `{ eyebrow, title, points[]{title,text} }`                                   | `Trust`                    |
| `reviews`        | `{ eyebrow, title, subtitle, items[]{photo,name} }`                          | `Reviews`                  |
| `faq`            | `{ eyebrow, title, items[]{q,a} }`                                           | `Faq`                      |
| `gallery`        | `{ id, caption }[]`                                                          | `Gallery`                  |
| `contact`        | `{ eyebrow, title, text, cta }`                                              | `ContactCta`               |

Тип `Tour`: `{ id, name, duration, season, summary, days[]{day,text}, included[], notIncluded[], addons[] }`.

**Ключевая договорённость:** поля `photo`/`id` в данных — это строковые **ключи**, а не пути. Соответствие «ключ → реальный файл» задаётся внутри компонента (`Record<string, ImageMetadata>`), потому что `astro:assets` требует статических `import`-ов изображений. Значит: добавить фото = и запись в `site.ts`, и `import` + строка в маппинге компонента.

### 3.2. Каталог компонентов (`src/components/`)

Порядок на странице задан в `src/pages/index.astro`. Якоря (`id`) — цели навигации из `Header`.

| Компонент    | Якорь секции | Данные                               | Особенности                                                                            |
| :----------- | :----------- | :----------------------------------- | :------------------------------------------------------------------------------------- |
| `Header`     | — (sticky)   | `site`                               | Нав-ссылки на `#about/#tours/#how/#faq`, CTA на `#contact`. Логотип — буква из бренда. |
| `Hero`       | —            | `hero`                               | Первый экран, две CTA.                                                                 |
| `Founders`   | `#about`     | `founders`                           | Фото 2 основателей через `astro:assets`, `object-position` под кадр.                   |
| `Tours`      | `#tours`     | `tours`, `pricing`, `individualTour` | Программы по дням, что входит/не входит, доп-опции.                                    |
| `HowItWorks` | `#how`       | `howItWorks`                         | 4 шага «от сообщения до поездки».                                                      |
| `Trust`      | —            | `trust`                              | Блок доверия (4 пункта).                                                               |
| `Reviews`    | —            | `reviews`                            | Отзывы как **скриншоты** переписки (фото), не перепечатка текста.                      |
| `Gallery`    | —            | `gallery`                            | Сетка фото с подписями.                                                                |
| `Faq`        | `#faq`       | `faq`                                | Частые вопросы (9 шт.).                                                                |
| `ContactCta` | `#contact`   | `contact`                            | Финальный CTA в Telegram.                                                              |
| `Footer`     | —            | `site`                               | Подвал.                                                                                |

> Навигация из `Header` ссылается на `#about/#tours/#how/#faq` — эти якоря обязаны существовать в соответствующих секциях; при переименовании id править обе стороны.

## 4. Как это работает

### 4.1. Рендеринг

Astro на этапе билда собирает единственную страницу из секций (`index.astro`), оборачивая их в `Base.astro`. JS на клиент не отгружается, кроме двух инлайн-скриптов аналитики в `Base` (см. §4.5). Все тексты подставляются из `site.ts` на этапе сборки.

### 4.2. SEO и мета (`Base.astro`)

- `title`/`description` — из `site.meta`, переопределяемы через `Props`.
- `canonical`, Open Graph (для Telegram/VK/Facebook), Twitter Card — абсолютные URL строятся из `Astro.site` (задан в `astro.config.mjs`).
- OG-картинка: `public/og-image.jpg`, 1200×630.
- JSON-LD `schema.org/TravelAgency`: имя, url, лого, `areaServed` = озеро Байкал, `sameAs` = Telegram. **Цена в разметку намеренно не выводится** (по брифу «уточняется в переписке» — чтобы фиксированное число не попало в поисковый сниппет).

### 4.3. Изображения

`astro:assets` (`<Image>`) с адаптивными `widths`/`sizes` и `object-cover`. Импорт файлов статический; связь с данными — через маппинг-объект в компоненте (см. §3.1). Оптимизация форматов/размеров — на билде.

### 4.4. Шрифты

Самохостинг из `public/fonts/`: по два `@font-face` на семейство (cyrillic + latin subset) с явными `unicode-range` в `global.css`. Критические (cyrillic) `<link rel="preload">` в `Base.astro` — меньше мигания при первой загрузке. `font-display: swap`.

### 4.5. Аналитика и конверсия

- `@vercel/analytics/astro` — компонент `<Analytics />` в `Base`.
- Инлайн-скрипт вешает слушатель на все `a[href*="t.me/"]` и шлёт событие `telegram_click` с полем `section` (id ближайшего родителя с `id`, иначе `header`) — так видно, из какой секции идут заявки.

## 5. Запуск и окружение

- Требования: Node ≥ 22.12, npm.
- Установка: `npm install`
- Команды:
  - `npm run dev` — локальный сервер на `localhost:4321`
  - `npm run build` — сборка в `./dist/`
  - `npm run preview` — предпросмотр собранной версии
  - `npm run check` — `astro check` (проверка типов)
  - `npm run lint` / `lint:fix` — ESLint
  - `npm run format` / `format:check` — Prettier
- Переменные окружения: не используются (сайт статический), `.env` не требуется.

## 6. Внешние сервисы и интеграции

- Хостинг: Vercel.
- Аналитика: Vercel Analytics (`@vercel/analytics`) + кастомное событие `telegram_click`.
- Единственный внешний канал: Telegram (ссылка в `site.telegram`).
- CI: GitHub Actions (`.github/workflows/ci.yml`).

## 7. Деплой

- Где хостится: Vercel, боевой адрес `https://baikal-tour.vercel.app` (плейсхолдер-домен, задан в `astro.config.mjs` → `site`).
- Как деплоится: push в `main` → авто-пересборка и публикация на Vercel.
- CI (на push в `main` и на PR): `npm ci` → `npm run lint` → `npm run format:check` → `npm run check` → `npm run build`. PR/пуш падают при нарушении линта, форматирования, типов или сборки.
- Кастомный домен: Vercel → Settings → Domains; после подключения обновить `site` в `astro.config.mjs`.

## 8. Известные ограничения и TODO

- Плейсхолдеры контента: финальное название бренда и домен; отзывы; актуальные даты сезона и цены (сейчас ориентир «от ~94 000 ₽»).
- Тесты не настроены (для статики без бизнес-логики предмета тестирования нет; при появлении логики — Vitest).
- `astro check` даёт 1 non-blocking hint на `eslint.config.mjs` (tsconfig покрывает `**/*`); на сборку/CI не влияет.

## 9. Качество кода (линт и формат)

- **ESLint 10**, flat config — `eslint.config.mjs`. Наборы: `@eslint/js` recommended + `typescript-eslint` recommended + `eslint-plugin-astro` recommended + `eslint-config-prettier` (гасит стилевые правила, конфликтующие с Prettier). Правило `@typescript-eslint/no-explicit-any: error`. Базовый `no-undef` отключён для `*.ts`/`*.astro` (глобальные TS-типы вроде `ImageMetadata` проверяет TypeScript, а не ESLint).
- **Prettier 3** — `.prettierrc.json`: `printWidth 100`, `tabWidth 2`, `semi`, `singleQuote`, плагин `prettier-plugin-astro`. Игнор — `.prettierignore`.
- Разделение обязанностей: ESLint ловит ошибки/анти-паттерны, Prettier форматирует. Не конфликтуют (config-prettier идёт последним).
- Кодовая база отформатирована целиком (`npm run format`). Статус: `npm run lint` и `npm run format:check` проходят чисто; оба включены в CI (§7).
