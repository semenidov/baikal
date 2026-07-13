# Деплой на Vercel

Сайт статический (Astro → `dist/`). Ниже — путь через GitHub + Vercel с авто-деплоем на каждый коммит.

## Что нужно один раз
- Аккаунт **GitHub** (github.com)
- Аккаунт **Vercel** (vercel.com) — проще всего войти кнопкой «Continue with GitHub»

## Шаг 1. Создать пустой репозиторий на GitHub
1. github.com → **New repository**.
2. Имя, например `baikal-site`. Приватный или публичный — на твой выбор.
3. **Ничего не добавляй** (без README, .gitignore, лицензии) — репозиторий должен быть пустым.
4. Создать.

## Шаг 2. Запушить проект
Локальный репозиторий уже готов (git инициализирован, первый коммит сделан). Останется добавить remote и запушить — подставь свой логин:

```bash
cd D:/sandbox/claude/baikal-site
git remote add origin https://github.com/<твой-логин>/baikal-site.git
git push -u origin main
```

## Шаг 3. Импортировать в Vercel
1. vercel.com → **Add New… → Project**.
2. **Import** репозиторий `baikal-site`.
3. Vercel сам определит фреймворк **Astro** (Build Command `astro build`, Output `dist` — менять не нужно).
4. **Deploy**.

Через ~минуту получишь живую ссылку вида `https://baikal-site-xxxx.vercel.app`.

## Дальше
- Любой `git push` в ветку `main` → сайт пересобирается и обновляется автоматически.
- Правки контента — в `src/data/site.ts`, дальше `git add -A && git commit -m "..." && git push`.
- **Свой домен** (когда будет название): Vercel → проект → **Settings → Domains → Add**. Добавляешь домен, прописываешь у регистратора указанные Vercel записи (A/CNAME) — HTTPS Vercel выпустит сам.

## Альтернатива без GitHub (Vercel CLI)
```bash
npm i -g vercel
cd D:/sandbox/claude/baikal-site
vercel        # первый раз — залогинит и задеплоит превью
vercel --prod # продакшн-деплой
```

## Примечание про аудиторию из РФ
Vercel из России обычно открывается штатно. Если на реальном запуске (с доменом) заметишь проблемы со скоростью/доступом — рассмотрим переезд на российский хостинг (Timeweb / Yandex Cloud). Сейчас, для превью, Vercel — оптимально.
