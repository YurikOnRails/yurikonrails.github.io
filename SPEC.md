# Fieldnotes — Specification

> Personal publishing platform. Travel photography, essays, projects, books.
> Last updated: 2026-03-25

---

## Tech Stack

| Layer        | Tool                          | Notes                                              |
|--------------|-------------------------------|----------------------------------------------------|
| Framework    | Astro 6                       | SSG, Content Layer API, CSP, Fonts API, Zod v4     |
| Styles       | Tailwind CSS 4                | Utility-first via CSS `@theme`, dark theme only    |
| Editor       | Obsidian                      | Points at `src/content/` as vault                  |
| Travel photos| Cloudflare R2                 | AVIF, multi-size, no egress fees, custom domain    |
| Book covers  | Git repo (`public/books/`)    | AVIF, shipped with site via GitHub Pages           |
| Video        | YouTube (embedded)            | Iframe embed, no self-hosting video                |
| Hosting      | GitHub Pages                  | Auto-deploy on push to `main`                      |
| Maps         | MapLibre GL JS + OpenFreeMap  | Vector tiles, dark theme, free, no API key         |
| Transitions  | Astro View Transitions        | Built-in, shared element morphing between pages    |
| Animation    | GSAP + ScrollTrigger          | Hero reveals, text animations, photo parallax      |
| Smooth scroll| Lenis                         | Buttery scroll feel, progressive enhancement       |
| 3D           | Three.js                      | Interactive globe on /field only (lazy loaded)      |
| Icons        | SVG (inline)                  | Custom icons, no icon font, no emoji               |
| RSS          | `@astrojs/rss`                | Official Astro package                             |
| Sitemap      | `@astrojs/sitemap`            | Official Astro package                             |
| Fonts        | Astro 6 Fonts API             | Prata + Onest + Spectral + JetBrains Mono          |

### Баланс производительности

Принцип: каждая библиотека загружается **только на странице, где нужна**.

| Библиотека       | Размер (gzip) | Где загружается            | Стратегия                    |
|------------------|---------------|----------------------------|------------------------------|
| Lenis            | ~4 KB         | Глобально                  | `client:load`                |
| GSAP+ScrollTrigger| ~25 KB       | Home, Essays, Field        | `client:visible`             |
| MapLibre GL JS   | ~80 KB        | `/field/[slug]` только     | `client:visible`             |
| Three.js         | ~150 KB       | `/field` index только      | `client:idle`, lazy import   |

**Бюджет:** целевой First Contentful Paint < 1.2s, Total JS на любой странице < 200 KB gzip.

Lenis инициализируется как progressive enhancement — если JS отключён или не загрузился, нативный скролл работает нормально.

---

## SEO & Meta Strategy

### Принцип

Поведенческие факторы важнее технического SEO. Сайт должен быть настолько хорош, что люди остаются, читают, возвращаются. Но базовые технические основы должны быть безупречны с первого дня.

### Base Layout Meta

Каждая страница получает полный набор мета-тегов из `Base.astro`:

```astro
---
interface Props {
  title: string
  description: string
  image?: string        // OG image URL (R2, local, or default)
  canonicalUrl?: string // override for canonical
  type?: 'website' | 'article'
  publishedAt?: string  // ISO date, for articles
}
---
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{title} — Fieldnotes</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl || Astro.url.href} />

  <!-- Open Graph -->
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image || defaultOgImage} />
  <meta property="og:type" content={type || 'website'} />
  <meta property="og:url" content={Astro.url.href} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image || defaultOgImage} />

  <!-- Article-specific -->
  {publishedAt && <meta property="article:published_time" content={publishedAt} />}

  <!-- Structured data -->
  <script type="application/ld+json" set:html={JSON.stringify(structuredData)} />
</head>
```

### OG Images

- **По умолчанию:** статичная OG-картинка `public/og-default.avif` — тёмный фон, лого, название сайта
- **Для эссе с обложкой:** обложка статьи как OG image
- **Для серий Field:** cover фото серии как OG image
- Формат: 1200×630px, AVIF с JPEG fallback для соцсетей

### Structured Data (JSON-LD)

- **Home:** `Person` schema
- **Essays:** `Article` schema с author, datePublished, image
- **Builds:** `CreativeWork` schema
- **Books:** `Review` schema с rating

### Технические основы

- `robots.txt` — разрешает всё, указывает на sitemap
- `sitemap.xml` — генерируется `@astrojs/sitemap`
- RSS feed — `/rss.xml` для essays
- Canonical URLs на каждой странице
- Семантический HTML: `<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`
- `<html lang="en">` (или `ru` — определить при запуске)

---

## Design System

### Философия

Сайт — кинематографический. Не уютный и пасторальный, а атмосферный и документальный. Тёмный лес, туман, рассветный свет сквозь хвою. Фотографии из путешествий живут в этом пространстве как кадры из документального фильма. Технический контент про Rust и Rails органично вписывается в тёмную атмосферу — точность и сырая мощь систем.

Это современная картина и самовыражение. Каждый элемент продуман как в дорогом арт-буке.

Референсы настроения: Тарковский, National Geographic Dark, A24 film palette.

### Colors

| Token              | Value                        | Ощущение                         |
|--------------------|------------------------------|----------------------------------|
| `bg-base`          | `#080d0b`                    | Ночной лес                       |
| `bg-surface`       | `#111a15`                    | Хвоя в темноте                   |
| `bg-card`          | `#162019`                    | Тёмная зелень                    |
| `border-subtle`    | `rgba(127,176,105,0.08)`     | Едва видимый зелёный контур      |
| `text-primary`     | `#e8e0d4`                    | Тёплый туман                     |
| `text-secondary`   | `#5a6e62`                    | Мох, второстепенное              |
| `accent`           | `#7fb069`                    | Молодая трава на солнце          |
| `accent-dim`       | `rgba(127,176,105,0.15)`     | Hover-состояния, подсветки       |

**Тёмная тема — единственная.** Без light mode.

Зелёный акцент `#7fb069` используется точечно: ссылки, активные элементы, теги. Не как декорация — как сигнал.

### Typography

| Role | Font | Weight | Где используется | Загрузка |
|---|---|---|---|---|
| Заголовки, титры, обложки | **Prata** | 400 | Все страницы | Глобально |
| UI, навигация, подписи | **Onest** | 400, 500, 600 | Все страницы | Глобально |
| Тело статей (длинное чтение) | **Spectral** | 400, 400i, 600 | `/essays/[slug]`, `/now` | Per-page |
| Код | **JetBrains Mono** | 400 | Страницы с code-блоками | Per-page |

**Все четыре шрифта с родной кириллицей:**
- **Prata** — высококонтрастный дидон (Bodoni/Didot семейство), Google Fonts, полная кириллица
- **Onest** — создан Александром Коваленко, русский шрифт, кириллица — оригинал, не адаптация
- **Spectral** — экранный serif, спроектирован для длинного чтения на экранах (Production Type для Google), кириллица полная
- **JetBrains Mono** — JetBrains (Чехия), кириллица первоклассная, лигатуры для `->`, `=>`, `|>`

Шрифты подключаются через **Astro 6 Fonts API** — автоматический self-hosting, оптимизация загрузки, `font-display: swap`. Ноль внешних запросов. Spectral и JetBrains Mono грузятся **только на страницах, где используются** — не утяжеляют остальной сайт.

**Иерархия:**
- Заголовки (h1–h3) — Prata 400, крупные, с воздухом. Тонкие засечки на тёмном фоне — как титры арт-фильма
- UI (навигация, теги, даты, кнопки, подписи к фото) — Onest, мягкий и человечный
- Тело статей — Spectral 400 на страницах эссе, комфортная ширина `65ch`, межстрочный интервал `1.8`. Читать как книгу
- Мелкий текст (даты, мета) — Onest 400, `text-secondary`
- Код — JetBrains Mono, `bg-surface` фон, лигатуры включены

### Spacing & Layout

- Максимальная ширина текста: `768px` (статьи, now)
- Максимальная ширина сеток: `1200px` (builds, books, field)
- Базовая единица: Tailwind default (4px)
- Карточки: `rounded-2xl`, border `border-subtle`, без box-shadow
- Фотографии: всегда full-bleed или с минимальными отступами — дышат

### Текстуры и атмосфера

- Еле видимый grain (зернистость плёнки) поверх фона — CSS или SVG filter
- Туманный gradient на hero-изображениях: снизу `bg-base` fade
- Фотографии из путешествий не обрезаются в карточки — показываем как кадр, с пропорциями оригинала

### Icons

SVG-иконки, inline в компонентах. Единый стиль:
- Stroke-based, 24×24 viewBox
- `stroke-width: 1.5`, `stroke: currentColor`
- Файлы хранятся в `src/icons/*.svg`
- Импортируются через Astro компонент `<Icon name="..." />`

Без emoji, без иконочных шрифтов, без внешних спрайтов.

---

## Animations & Interactivity

Принцип: анимации точечные и осмысленные. Каждый инструмент используется только там, где он даёт максимальный эффект.

### Astro View Transitions — переходы между страницами

Самая заметная WOW-фича. Включается одной строкой в Base layout.

**Что делает:**
- При переходе essay list → essay page обложка **плавно морфится** в hero-изображение
- Переходы между страницами выглядят как нативное iOS-приложение
- Работает через браузерный View Transitions API, без лишнего JS

```astro
<!-- Base.astro -->
<ClientRouter />
```

```astro
<!-- PostCard.astro — обложка получает уникальное имя -->
<img transition:name={`cover-${id}`} src={cover} />

<!-- essays/[...slug].astro — тот же name = морфинг -->
<img transition:name={`cover-${id}`} src={cover} />
```

**Применяется:** на всех страницах (глобально).

---

### GSAP + ScrollTrigger — scroll-анимации

**Применяется точечно:**

| Место | Анимация |
|---|---|
| Home hero | Имя + bio появляются с fade+slide при загрузке |
| Essay hero | Заголовок разбивается на слова, каждое появляется с задержкой (stagger) |
| /field фото | Parallax: фото двигается медленнее фона при скролле |
| Карточки (essays, builds, books) | Появляются при входе в viewport (fade up) — через CSS, не GSAP |

```typescript
// Пример: stagger reveal заголовка
gsap.from(words, {
  opacity: 0,
  y: 40,
  stagger: 0.05,
  duration: 0.8,
  ease: 'power3.out',
  scrollTrigger: { trigger: heading, start: 'top 80%' }
})
```

**НЕ применяется:** к навигации, тексту статей, карточкам книг.

---

### CSS Scroll-driven Animations — карточки

Карточки появляются при скролле без JS — через нативный браузерный API.

```css
@keyframes card-reveal {
  from { opacity: 0; translate: 0 32px; }
  to   { opacity: 1; translate: 0 0; }
}

.card {
  animation: card-reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 25%;
}

/* Fallback для браузеров без поддержки scroll-driven animations */
@supports not (animation-timeline: view()) {
  .card {
    animation: none;
    opacity: 1;
  }
}
```

**Применяется:** PostCard, BuildCard, BookCard, PhotoGrid thumbnails.

---

### Lenis — smooth scroll

Заменяет нативный скролл браузера на плавный "масляный". Меняет ощущение всего сайта.

```typescript
// Инициализируется один раз в Base layout
import Lenis from 'lenis'
const lenis = new Lenis()
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

**Применяется:** глобально на всех страницах как progressive enhancement.

---

### Three.js — 3D глобус на `/field`

Единственное место где используется Three.js. Вместо плоской карты — интерактивный 3D глобус с точками путешествий.

**Что делает:**
- Вращающийся глобус (авто-ротация, останавливается при hover)
- Светящиеся маркеры на координатах каждой серии
- Hover на маркер → показывает название места и thumbnail
- Клик → переход на `/field/[slug]`
- Тёмная текстура глобуса, зелёные маркеры (в тон акценту `#7fb069`)

**Реализация:** отдельный компонент `Globe.astro` с `client:idle`, загружается только на `/field`. Three.js подгружается через dynamic import для минимизации начальной загрузки.

**НЕ заменяет** MapLibre на странице серии (`/field/[slug]`) — там остаётся плоская карта для геолокации фото.

---

### Что намеренно НЕ делаем

| Идея | Причина отказа |
|---|---|
| Three.js фон на главной | Убивает перфоманс, отвлекает от контента |
| Particle effects | Устаревший тренд |
| Кастомный курсор | Почти всегда выглядит дёшево |
| Loading экран / preloader | Раздражает, замедляет восприятие |
| Анимация навигации | Мешает быстрой навигации |
| GSAP на каждом элементе | Потеря ощущения скорости сайта |
| Emoji как иконки | Нестабильно кросс-платформенно, выглядит непрофессионально |

---

## Project Structure

```
fieldnotes/
├── public/
│   ├── fonts/                    ← managed by Astro 6 Fonts API
│   │   ├── Prata-Regular.woff2
│   │   ├── Onest-Variable.woff2
│   │   ├── Spectral-Regular.woff2
│   │   ├── Spectral-Italic.woff2
│   │   ├── Spectral-SemiBold.woff2
│   │   └── JetBrainsMono-Variable.woff2
│   ├── books/                    ← book covers (AVIF, ~600px wide)
│   │   ├── sapiens.avif
│   │   └── ...
│   ├── og-default.avif          ← default OG image
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── content/                  ← Obsidian vault root
│   │   ├── essays/
│   │   │   └── *.md
│   │   ├── field/
│   │   │   └── *.md
│   │   └── now/
│   │       └── current.md
│   ├── content.config.ts         ← Content Layer schemas (Astro 6, Zod v4)
│   ├── data/
│   │   ├── profile.ts
│   │   ├── builds.ts
│   │   └── books.ts
│   ├── icons/                    ← SVG icons
│   │   ├── github.svg
│   │   ├── telegram.svg
│   │   ├── arrow-right.svg
│   │   └── ...
│   ├── layouts/
│   │   └── Base.astro            ← dark theme, fonts, SEO meta, Lenis
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Icon.astro            ← SVG icon loader
│   │   ├── PostCard.astro        ← essay card
│   │   ├── BuildCard.astro       ← project card
│   │   ├── BookCard.astro        ← book with star rating
│   │   ├── PhotoGrid.astro       ← masonry gallery
│   │   ├── Globe.astro           ← Three.js globe (client:idle)
│   │   ├── Map.astro             ← MapLibre GL (client:visible)
│   │   ├── StarRating.astro      ← 1–5 stars
│   │   └── SEOHead.astro         ← meta tags, OG, JSON-LD
│   ├── pages/
│   │   ├── index.astro           → /
│   │   ├── essays/
│   │   │   ├── index.astro       → /essays
│   │   │   ├── [...slug].astro   → /essays/[slug]
│   │   │   └── tag/
│   │   │       └── [tag].astro   → /essays/tag/[tag]
│   │   ├── builds.astro          → /builds
│   │   ├── books.astro           → /books
│   │   ├── field/
│   │   │   ├── index.astro       → /field
│   │   │   └── [...slug].astro   → /field/[slug]
│   │   ├── now.astro             → /now
│   │   ├── 404.astro             → /404
│   │   └── rss.xml.ts            → /rss.xml
│   └── styles/
│       └── global.css            ← Tailwind @theme, @font-face, grain
├── astro.config.mjs
├── tsconfig.json
└── SPEC.md                       ← this file
```

**Без `tailwind.config.mjs`** — Tailwind CSS 4 настраивается через `@theme` директиву в `global.css`.

---

## Sections

### 1. Home `/`

**Purpose:** Profile page — who I am, links to all sections.

**Layout:**
- Hero: avatar + name + short bio
- Grid of large tiles linking to: /essays, /builds, /books, /field, /now

**Data:** `src/data/profile.ts`

```typescript
export interface Profile {
  name: string
  bio: string
  avatar: string       // path to image in public/
  location: string
  email?: string
  social: {
    github?: string
    twitter?: string
    telegram?: string
  }
}
```

---

### 2. Essays `/essays`

**Purpose:** Long-form writing — tech, travel, ideas.

**Routes:**
- `/essays` — paginated list of published essays
- `/essays/[slug]` — single essay (slug = filename)
- `/essays/tag/[tag]` — essays filtered by tag

**Data:** `src/content/essays/*.md`

**Frontmatter schema:**
```yaml
title: string           # required
excerpt: string         # required, shown on list page
status: draft | published   # drafts hidden in production
publishedAt: YYYY-MM-DD     # required
cover: string           # optional, R2 URL (AVIF) for travel essays, or local path
location: string        # optional, e.g. "Moscow, Russia"
lat: number             # optional
lng: number             # optional
tags: string[]          # optional
```

Slug генерируется автоматически из имени файла. Файл `my-first-essay.md` → URL `/essays/my-first-essay`.

**Features:**
- Drafts filtered out in production (`import.meta.env.PROD`)
- Cover images served from R2 (AVIF format, multiple sizes)
- Tag pages at `/essays/tag/[tag]` — список эссе с конкретным тегом, тот же PostCard layout
- RSS feed at `/rss.xml` (published essays only)

**Tag page `/essays/tag/[tag]`:**
- Заголовок: `#[tag]` — с акцентным цветом
- Список эссе — те же PostCard, отфильтрованные по тегу
- Ссылка "All essays" назад
- `getStaticPaths()` собирает все уникальные теги из коллекции

---

### 3. Builds `/builds`

**Purpose:** Portfolio — projects, tools, communities.

**Routes:**
- `/builds` — single page, all projects as cards

**Data:** `src/data/builds.ts`

```typescript
export interface Build {
  title: string
  description: string
  url: string
  icon: string                                           // SVG icon name from src/icons/
  status: 'active' | 'paused' | 'completed' | 'archived'
  kind: 'business' | 'oss' | 'media' | 'community'
  position: number                                       // display order
  startedOn: string                                      // ISO date
  finishedOn?: string
  cover?: string                                         // path in public/ or R2 URL
}
```

**Features:**
- Sorted by `position`
- Status badge (color varies by status)
- Filterable by `kind` (future)

---

### 4. Books `/books`

**Purpose:** Reading log with ratings and key takeaways. Визуально — как витрина арт-магазина.

**Routes:**
- `/books` — grid of all books

**Data:** `src/data/books.ts`

```typescript
export interface Book {
  title: string
  author: string
  cover: string          // path in public/books/, e.g. "sapiens" → /books/sapiens.avif
  yearRead: number
  rating: 1 | 2 | 3 | 4 | 5
  keyIdea: string        // one-liner takeaway, shown on card
  review?: string        // optional short text
  status: 'reading' | 'finished' | 'dropped'
  tags?: string[]
}
```

**Хранение обложек:**
- Обложки лежат в `public/books/` — деплоятся вместе с сайтом на GitHub Pages
- Формат: AVIF, один размер ~600px по ширине (обложки лёгкие, не нужен srcset)
- Путь: `public/books/[slug].avif` → доступна как `/books/[slug].avif`
- Все обложки добавляются вручную — полный контроль над качеством

**Visual design:**
- Обложки книг — высокое качество, хостятся прямо в репозитории
- Карточка: обложка крупно, под ней — название, автор, рейтинг звёздами
- Hover-эффект: обложка слегка приподнимается (`translate-y`, `scale`), тень углубляется
- `keyIdea` появляется на hover как overlay с backdrop-blur
- Responsive: 4 колонки на desktop, 2 на мобильном
- Filter by year / rating (future)

**Без внешних сервисов для обложек.** Всё вручную, всё под контролем.

---

### 5. Field `/field`

**Purpose:** Travel photo gallery with geolocation and interactive map.

**Routes:**
- `/field` — interactive 3D globe + grid of photo series
- `/field/[slug]` — single photo series page

**Data:** `src/content/field/*.md`

**Frontmatter schema:**
```yaml
title: string
description: string
kind: photo | video | mixed
location: string        # human-readable
takenOn: YYYY-MM-DD
lat: number
lng: number
tags: string[]
cover: string           # R2 URL, used in grid thumbnail
photos:                 # optional (for photo/mixed series)
  - src: string         # R2 URL (AVIF format)
    caption: string     # optional
videos:                 # optional (for video/mixed series)
  - youtube: string     # YouTube video ID (e.g. "dQw4w9WgXcQ")
    title: string       # video title for accessibility
    caption: string     # optional
```

Slug генерируется автоматически из имени файла.

**Photo storage (Cloudflare R2):**
- Все фотографии из путешествий hosted на **Cloudflare R2**
- Format: **AVIF** (manually pre-processed)
- Размеры: **3 варианта** при конвертации:
  - `640w` — мобильные устройства
  - `1280w` — планшеты и обычные экраны
  - `1920w` — desktop и retina
- URL pattern: `https://r2.yourdomain.com/field/[series]/[filename]-[width]w.avif`
- Naming convention: `photo-01-640w.avif`, `photo-01-1280w.avif`, `photo-01-1920w.avif`

**Video (YouTube embed):**
- Видео хостятся на YouTube, в frontmatter хранится только video ID
- Embed через `<iframe>` с `loading="lazy"` и `srcdoc` (превью без загрузки YouTube JS до клика)
- Стилизация: тёмный контейнер `rounded-xl`, пропорции 16:9, кнопка play в стиле сайта
- `srcdoc` паттерн для производительности:
```html
<iframe
  srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:48px;width:68px;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 16px rgba(0,0,0,.5)}</style><a href='https://www.youtube.com/embed/{id}?autoplay=1'><img src='https://img.youtube.com/vi/{id}/maxresdefault.jpg'><span>▶</span></a>"
  loading="lazy"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

**Responsive images в HTML:**
```html
<picture>
  <source
    type="image/avif"
    srcset="
      photo-01-640w.avif   640w,
      photo-01-1280w.avif 1280w,
      photo-01-1920w.avif 1920w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  />
  <img
    src="photo-01-1280w.avif"
    alt={caption}
    loading="lazy"
    decoding="async"
  />
</picture>
```

**Map (on `/field/[slug]`):**
- Library: MapLibre GL JS (`client:visible`)
- Tiles: OpenFreeMap (free, no API key)
- Style: dark theme
- Markers для каждого фото серии (из `lat`/`lng`)
- Fly-to animation between markers

**3D Globe (on `/field` index):**
- Library: Three.js (`client:idle`, dynamic import)
- Вращающийся глобус с маркерами путешествий
- Клик на маркер → переход на `/field/[slug]`
- Полное описание в секции Animations

**Photo grid (on `/field/[slug]`):**
- Masonry layout
- Lightbox on click (future)
- Caption below each photo
- Lazy loading для фото ниже viewport

---

### 6. Now `/now`

**Purpose:** "What I'm doing right now" — nownownow.com convention.

**Routes:**
- `/now` — single page

**Data:** `src/content/now/current.md`

```yaml
---
updatedAt: YYYY-MM-DD
---

Free markdown content here.
```

**Features:**
- Shows "Last updated: [date]" from frontmatter
- History preserved in git (no DB needed)

---

### 7. 404 Page

**Purpose:** Стильная страница ошибки, которая не ломает атмосферу сайта.

**Route:** `/404` — Astro автоматически использует `src/pages/404.astro`

**Дизайн:**
- Полноэкранный тёмный фон `bg-base`
- Крупный типографический акцент: число `404` — огромным Prata, полупрозрачное, как туман. Тонкие засечки дидона на тёмном фоне
- Под ним: короткая фраза в стиле сайта — *"The trail ends here"* или *"Тропа обрывается здесь"*
- Субтекст мелким `text-secondary`: *"This page doesn't exist or has been moved"*
- Единственная кнопка: `← Back to base` — ведёт на `/`, стилизована под accent
- Еле видимый grain-эффект на фоне, как на остальных страницах
- Без лишних элементов, без навигации — минималистично и атмосферно
- View Transition анимация при переходе на главную

---

## Content Schemas (`src/content.config.ts`)

```typescript
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'                    // Astro 6: Zod v4 из astro/zod

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    status: z.enum(['draft', 'published']),
    publishedAt: z.coerce.date(),
    cover: z.string().optional(),
    location: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    tags: z.array(z.string()).optional().default([]),
  }),
})

const field = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/field' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    kind: z.enum(['photo', 'video', 'mixed']),
    location: z.string(),
    takenOn: z.coerce.date(),
    lat: z.number(),
    lng: z.number(),
    tags: z.array(z.string()).optional().default([]),
    cover: z.string(),
    photos: z.array(z.object({
      src: z.string(),
      caption: z.string().optional(),
    })).optional().default([]),
    videos: z.array(z.object({
      youtube: z.string(),
      title: z.string(),
      caption: z.string().optional(),
    })).optional().default([]),
  }),
})

const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/now' }),
  schema: z.object({
    updatedAt: z.coerce.date(),
  }),
})

export const collections = { essays, field, now }
```

**Astro 6 особенности:**
- Файл: `src/content.config.ts` (не `src/content/config.ts`)
- Zod импортируется из `astro/zod` (Zod v4, не из `zod` напрямую)
- Используется `glob()` loader вместо устаревшего `type: 'content'`
- Slug генерируется из имени файла автоматически (`entry.id`)
- `slug` убран из frontmatter схем — нет дублирования
- `<ClientRouter />` вместо удалённого `<ViewTransitions />`
- Live Content Collections — контент обновляется в dev без перезагрузки
- CSP: `csp: true` в `astro.config.mjs` для автоматических Content-Security-Policy заголовков

---

## Build Order

- [x] Spec document
- [ ] Scaffold: Astro 6 + Tailwind CSS 4 + Base layout + Fonts API + SEO meta
- [ ] Header + Footer + Icon system
- [ ] Home page: profile hero + section tiles
- [ ] Essays: Content Collection + list page + single post + tag pages
- [ ] Builds: data file + cards grid + SVG icons
- [ ] Books: data file + cards with hover effects + ratings
- [ ] Field: Content Collection + photo grid + responsive images + MapLibre
- [ ] Field index: Three.js globe
- [ ] Now: simple markdown page
- [ ] 404 page
- [ ] Polish: RSS, sitemap, OG images, structured data
- [ ] Deploy: GitHub Pages + Cloudflare R2

---

## Obsidian Workflow

```
1. Open src/content/ as Obsidian vault
2. Create/edit markdown files with frontmatter
3. Preview: npm run dev → localhost:4321
4. git push → GitHub Pages auto-deploys
```

Add `.obsidian/` to `.gitignore`.
No Obsidian plugins needed. No sync scripts.

---

## Asset Strategy

| Тип контента    | Хранение                | Почему                                         |
|-----------------|-------------------------|------------------------------------------------|
| Book covers     | `public/books/` (git)   | Маленькие файлы (~30-50KB), деплоятся с сайтом |
| Travel photos   | Cloudflare R2           | Тяжёлые файлы, не раздувают репозиторий        |
| Travel videos   | YouTube (embed)         | Видео не хостим, только ссылки                 |
| Essay covers    | Cloudflare R2 или git   | Зависит от размера — решается per-case         |
| OG images       | `public/` (git)         | Статичные, маленькие                           |
| Fonts           | Astro 6 Fonts API       | Auto self-hosted, ноль внешних запросов         |

---

## Photo Upload Workflow (Cloudflare R2)

```
1. Edit photos in Lightroom
2. Export as high-quality JPEG (full resolution)
3. Manually convert to AVIF in 3 sizes:
   - 640w  (mobile)
   - 1280w (tablet / default)
   - 1920w (desktop / retina)
   Tools: macOS Preview, Photoshop, or sharp script:
     node -e "const sharp = require('sharp');
       [640,1280,1920].forEach(w =>
         sharp('photo.jpg').resize(w).avif({quality:85}).toFile(\`photo-\${w}w.avif\`))"
4. Upload all sizes to Cloudflare R2 (dashboard or wrangler CLI)
5. Reference base URL in frontmatter (component adds size suffixes)
```

**Качество AVIF: 85** — высокое качество без видимых артефактов, при значительной экономии размера (~60-70% меньше JPEG).

---

## Book Cover Workflow

```
1. Найти качественное изображение обложки (фото своей книги или издательский арт)
2. Обрезать до пропорций ~2:3 (стандарт книжных обложек)
3. Ресайз до ~600px по ширине (достаточно для карточки, не раздувает репозиторий)
4. Конвертировать в AVIF (quality: 90 — обложки должны быть чёткими)
5. Положить в public/books/[slug].avif
6. Указать slug в books.ts — компонент автоматически строит путь /books/[slug].avif
```

**Обложки хранятся в git-репозитории** и деплоятся через GitHub Pages вместе с сайтом. Это надёжнее внешнего CDN для статичных маленьких файлов (~30-50 KB на обложку в AVIF).
