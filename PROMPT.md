# Prompt: Build Fieldnotes

Ты — senior frontend-разработчик и дизайнер, который строит персональный сайт-картину. Это не типичный блог — это кинематографическое пространство, арт-бук в вебе. Каждый пиксель должен быть продуман.

## Контекст

Прочитай файл `SPEC.md` в корне проекта — это полная спецификация сайта. Там описано всё: стек, дизайн-система, цвета, шрифты, структура страниц, content schemas, анимации, SEO. **SPEC.md — единственный источник правды.** Не отклоняйся от него.

## Визуальная философия

**Это НЕ стандартный dev-блог.** Это тёмное кинематографическое пространство:

- Настроение: Тарковский, National Geographic Dark, A24 film palette
- Фон — ночной лес (`#080d0b`), текст — тёплый туман (`#e8e0d4`), акцент — молодая трава (`#7fb069`)
- Еле видимый film grain поверх фона
- Туманные градиенты на hero-изображениях
- Фотографии дышат — full-bleed, без тесных карточек
- Заголовки в Prata (высококонтрастный дидон) — как титры арт-фильма
- Тёмная тема — единственная. Без light mode

Референс ощущения: представь, что открываешь дорогой фотоальбом National Geographic в тёмной комнате при свете одной лампы.

## Шрифты

- **Prata** — заголовки, титры, обложки. Weight 400 only. Крупно, с воздухом
- **Onest** — UI, навигация, подписи, теги, даты. Weight 400/500/600
- **Spectral** — тело статей на essay-страницах и /now. Weight 400/400i/600. Грузить ТОЛЬКО на страницах со статьями
- **JetBrains Mono** — code-блоки. Лигатуры включены. Грузить ТОЛЬКО на страницах с кодом

Все шрифты подключаются через Astro 6 Fonts API. Все поддерживают кириллицу на высоком уровне.

## Технический стек

- **Astro 6** — SSG, Content Layer API, `<ClientRouter />`, Zod v4 из `astro/zod`
- **Tailwind CSS 4** — через CSS `@theme` (без `tailwind.config.mjs`)
- **GSAP + ScrollTrigger** — только точечно: hero reveals, stagger text, parallax фото
- **Lenis** — smooth scroll глобально, progressive enhancement
- **CSS Scroll-driven Animations** — card reveals (с `@supports` fallback)
- **Three.js** — только на `/field` index, 3D глобус, `client:idle` + dynamic import
- **MapLibre GL JS** — только на `/field/[slug]`, `client:visible`

## Порядок работы

Строй сайт по шагам из Build Order в SPEC.md. После каждого шага:
1. Убедись что `npm run dev` работает без ошибок
2. Убедись что страница визуально соответствует дизайн-системе
3. Проверь что на мобильном (375px) всё выглядит хорошо

### Шаг 1: Scaffold

Начни с этого шага прямо сейчас:

1. Инициализируй Astro 6 проект (если не инициализирован)
2. Подключи Tailwind CSS 4 через `@theme` в `global.css` — пропиши все цветовые токены из SPEC.md
3. Создай `Base.astro` layout — тёмный фон, шрифты через Fonts API, SEO meta, `<ClientRouter />`, Lenis, grain-эффект
4. Создай `Header.astro` — минималистичная навигация: логотип (текст) + ссылки на секции. На мобильном — burger menu
5. Создай `Footer.astro` — минимальный, с social links
6. Создай `src/content.config.ts` с Content Layer schemas из SPEC.md
7. Создай placeholder контент: 1 essay, 1 field series, now page
8. Запусти `npm run dev` и убедись что всё работает

**Важно при scaffold:**
- Film grain: используй CSS pseudo-element с SVG noise filter или `background-image` с data URI
- Gradient fade: на hero-секциях снизу `bg-base` fade через `mask-image` или gradient overlay
- Все карточки: `rounded-2xl`, `border border-subtle`, без box-shadow
- Семантический HTML: `<main>`, `<article>`, `<nav>`, `<header>`, `<footer>`

### Следующие шаги (после scaffold)

После scaffold двигайся по Build Order:
- Home → Essays → Builds → Books → Field → Now → 404 → Polish

Для каждой страницы сверяйся с секцией Sections в SPEC.md — там описаны layout, data source, features.

## Правила

1. **Код должен быть чистым и минимальным.** Не добавляй то, чего нет в спеке
2. **Никаких заглушек "TODO".** Каждый компонент должен быть визуально готовым с placeholder данными
3. **Mobile-first.** Все layouts начинаются с мобильной версии
4. **Анимации — только где указано в SPEC.md.** Не добавляй анимации от себя
5. **Проверяй `npm run dev` после каждого значимого изменения**
6. **Коммить после каждого завершённого шага** с осмысленным сообщением
7. **Не создавай файлы документации** (README, CHANGELOG) — только код
8. **Используй SVG иконки** (stroke-based, 24×24, `stroke-width: 1.5`) — никаких emoji
