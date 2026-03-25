# Fieldnotes — Specification

> Personal publishing platform. Travel photography, essays, projects, books.
> My painting, my public diary, my modern portfolio.
> Last updated: 2026-03-25

---

## Tech Stack

| Layer        | Tool                          | Notes                                              |
|--------------|-------------------------------|----------------------------------------------------|
| Framework    | Astro 6                       | SSG, Content Layer API, Fonts API, Zod v4          |
| Styles       | Tailwind CSS 4                | Utility-first via CSS `@theme`, dark theme only    |
| Editor       | Obsidian                      | Points at `src/content/` as vault                  |
| Travel photos| Cloudflare R2                 | AVIF, multi-size, no egress fees, custom domain    |
| Book covers  | Git repo (`public/books/`)    | AVIF, shipped with site via GitHub Pages           |
| Video        | YouTube (embedded)            | Iframe embed, no self-hosting video                |
| Hosting      | GitHub Pages                  | Auto-deploy on push to `main`                      |
| Maps         | MapLibre GL JS + OpenFreeMap  | Vector tiles, dark theme, free, no API key         |
| Transitions  | Astro View Transitions        | `<ClientRouter />`, SPA-like page transitions      |
| Animation    | CSS-only                      | `@keyframes`, `animation-timeline: view()`, staggered delays |
| Smooth scroll| Lenis                         | Buttery scroll feel, progressive enhancement       |
| Icons        | SVG (inline)                  | Custom icons, no icon font, no emoji               |
| RSS          | `@astrojs/rss`                | Official Astro package                             |
| Sitemap      | `@astrojs/sitemap`            | Official Astro package                             |
| Fonts        | Astro 6 Fonts API             | Cormorant Garamond + Onest + Spectral + IBM Plex Mono |

### Performance Budget

Principle: each library loads **only on the page where it's needed**.

| Library          | Size (gzip) | Where loaded               | Strategy                     |
|------------------|-------------|----------------------------|------------------------------|
| Lenis            | ~4 KB       | Global (Base.astro)        | Inline `<script>`            |
| MapLibre GL JS   | ~80 KB      | `/field`, `/field/[slug]`  | Dynamic `import()` on load   |

**Budget:** target First Contentful Paint < 1.2s, Total JS on any page < 200 KB gzip.

Lenis initializes as progressive enhancement — if JS is disabled, native scroll works normally.

**No GSAP, no Three.js.** All animations are CSS-only (`@keyframes` with `animation-delay` for stagger, `animation-timeline: view()` for scroll-driven reveals). Maps use MapLibre GL JS with OpenFreeMap vector tiles — no 3D globe.

---

## SEO & Meta Strategy

### Principle

Behavioral factors matter more than technical SEO. The site should be so good that people stay, read, and return. But the technical foundations must be flawless from day one.

### Base Layout Meta

Every page gets a full set of meta tags from `Base.astro`:

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

  <!-- Fonts via Astro 6 Fonts API -->
  <Font cssVariable="--font-heading" />
  <Font cssVariable="--font-ui" />
  <Font cssVariable="--font-body" />

  <ClientRouter />
</head>
```

### OG Images

- **Default:** static OG image `public/og-default.avif` — dark bg, logo, site name
- **Essays with cover:** article cover as OG image
- **Field series:** cover photo as OG image
- Format: 1200×630px, AVIF

### Structured Data (JSON-LD)

- **All pages:** `Article` or `WebSite` schema (auto-detected from `type` prop)
- Includes: name, description, url, datePublished (for articles)

### Technical Foundations

- `robots.txt` — allows all, points to sitemap
- `sitemap.xml` — generated by `@astrojs/sitemap`
- RSS feed — `/rss.xml` for essays
- Canonical URLs on every page
- Semantic HTML: `<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`
- `<html lang="en">`

---

## Design System

### Philosophy

The site is my painting, my public diary, and my modern fieldnotes. I share thoughts, high-quality photography, projects, and books. Design is paramount — I want to use cutting-edge web technologies so the site stands out and creates a "wow" effect while remaining convenient and interesting.

Cinematic, atmospheric, documentary. Dark spaces where travel photography lives like frames from a film. Technical content fits naturally into the dark aesthetic — precision and raw power of systems.

Every element is considered as in an expensive art book.

References: Tarkovsky, National Geographic Dark, A24 film palette.

### Colors — Cold Ink palette

| Token              | Value                        | Usage                            |
|--------------------|------------------------------|----------------------------------|
| `--color-base`     | `#09090b`                    | Page background                  |
| `--color-surface`  | `#18181b`                    | Cards, code blocks, map bg       |
| `--color-card`     | `#27272a`                    | Elevated surfaces                |
| `--color-subtle`   | `rgba(255, 255, 255, 0.06)`  | Borders, dividers                |
| `--color-primary`  | `#fafafa`                    | Main text                        |
| `--color-secondary`| `#a1a1aa`                    | Secondary text, captions         |
| `--color-accent`   | `#e8622c`                    | Links, active states, orange signal |
| `--color-accent-dim`| `rgba(232, 98, 44, 0.12)`   | Hover states, selection bg       |

**Dark theme only.** No light mode.

Orange accent `#e8622c` is used surgically: links, active elements, drop caps, status badges. Not as decoration — as signal.

**Known Tailwind v4 limitation:** opacity modifier syntax (`text-primary/70`) does NOT work on custom colors defined via `@theme`. Use explicit hex values (`text-[#b4b4bb]`) or inline `style` attributes instead.

### Typography

| Role | Font | Weight | Where used | Loading |
|---|---|---|---|---|
| Headings, titles, covers | **Cormorant Garamond** | 400, 600 | All pages | Global (Fonts API) |
| UI, navigation, captions | **Onest** | 400, 500, 600 | All pages | Global (Fonts API) |
| Article body (long reading) | **Spectral** | 400, 400i, 600 | `/essays/[slug]`, `/now` | Global (Fonts API) |
| Code, coordinates, mono | **IBM Plex Mono** | 400 | Pages with code/coords | Global (Fonts API) |

**All four fonts have native Cyrillic:**
- **Cormorant Garamond** — elegant high-contrast serif (Garamond family), Google Fonts, full Cyrillic
- **Onest** — designed by Alexander Kovalenko, Russian font, Cyrillic is the original
- **Spectral** — screen serif, designed for long reading (Production Type for Google), full Cyrillic
- **IBM Plex Mono** — IBM, excellent Cyrillic, clean and professional

Fonts loaded via **Astro 6 Fonts API** — automatic self-hosting, optimized loading, `font-display: swap`. Zero external requests.

**Hierarchy:**
- Headings (h1–h3) — Cormorant Garamond, light weight (300-400), generous spacing. Thin serifs on dark background — like art film titles
- UI (navigation, tags, dates, buttons, photo captions) — Onest, soft and human
- Article body — Spectral 400, comfortable width `768px`, line-height `1.8`. Read like a book
- Small text (dates, meta) — Onest 400, `text-secondary`
- Code & coordinates — IBM Plex Mono, `bg-surface` background

### Spacing & Layout

- Max prose width: `768px` (`--container-prose`) — articles, now
- Max grid width: `1200px` (`--container-grid`) — builds, books, field
- Base unit: Tailwind default (4px)
- Cards: `rounded-sm` (2px), border `border-subtle`, hover shadow effects
- Photos: full-bleed by default (up to `1400px` wide), `cursor: zoom-in`
- Narrow images: `img[title="narrow"]` — prose width with small bleed

### Icons

SVG icons, inline via `<Icon>` component. Consistent style:
- Stroke-based, 24×24 viewBox
- `stroke-width: 1.5` or `2`, `stroke: currentColor`
- Files in `src/icons/*.svg`
- Imported via `<Icon name="..." size={N} />`

Current icon set:
- `github.svg` — GitHub social link
- `telegram.svg` — Telegram social link
- `arrow-right.svg` — Navigation arrows
- `arrow-left.svg` — Back navigation
- `arrow-up-right.svg` — External links (builds)
- `menu.svg` — Mobile hamburger
- `x.svg` — Close button
- `rss.svg` — RSS feed
- `mail.svg` — Email
- `map-pin.svg` — Location markers
- `heart.svg` — Footer decoration

No emoji, no icon fonts, no external sprites.

---

## Animations & Interactivity

Principle: animations are purposeful and CSS-only. No heavy animation libraries.

### Astro View Transitions — page transitions

The most noticeable wow feature. Enabled via `<ClientRouter />` in Base layout.

**What it does:**
- SPA-like transitions between pages
- Works through browser View Transitions API, no extra JS

```astro
<!-- Base.astro -->
<ClientRouter />
```

**Applied:** on all pages (globally).

---

### CSS Scroll-driven Animations — cards

Cards appear on scroll without JS — via native browser API.

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

/* Fallback for browsers without scroll-driven animations */
@supports not (animation-timeline: view()) {
  .card {
    animation: none;
    opacity: 1;
  }
}
```

**Applied:** PostCard, BuildCard, field series cards.

---

### CSS Keyframe Animations — staggered reveals

Page sections use CSS keyframes with `animation-delay` for staggered fade-in effects:

```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Applied via inline `style="animation: fade-in-up 0.6s ease-out Xms both"` with increasing delays for each element.

---

### Lenis — smooth scroll

Replaces native browser scroll with buttery smooth feel. Changes the entire site's sensation.

```typescript
// Initialized once in Base layout
import Lenis from 'lenis'
const lenis = new Lenis()
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
```

Re-initialized on `astro:after-swap` for view transition support.

**Applied:** globally on all pages as progressive enhancement.

---

### Mobile Menu Animation

The mobile menu is a full-screen overlay with layered animation:

1. **Backdrop** — opacity fade from 0 to 1 (`bg-base`, fully opaque)
2. **Panel** — slides down + fades in (`translate-y` + `opacity` transition, 300ms)
3. **Links** — staggered appearance, each with increasing `transition-delay` (80ms + 40ms × index)
4. **Close** — reverse animation, stagger delays reset for next open

The menu lives **outside `<header>`** at `z-[100]` to avoid stacking context issues with the fixed header.

---

### Lightbox — image zoom

Implemented in `Lightbox.astro`. Click any image with `cursor: zoom-in` to open:

- **Open:** ghost image morphs from original position to centered/zoomed (0.35s cubic-bezier)
- **Close:** reverse morph back to original position
- **Backdrop:** animates from transparent to 92% black
- Keyboard support (Escape to close)
- Click overlay or image to close
- Re-initialized on `astro:after-swap`

---

### What we intentionally DON'T do

| Idea | Reason |
|---|---|
| Three.js / WebGL | Overkill for this site, kills performance |
| GSAP / ScrollTrigger | CSS animations are sufficient, smaller bundle |
| Particle effects | Outdated trend |
| Custom cursor | Almost always looks cheap |
| Loading screen / preloader | Annoying, slows perception |
| Navigation animation | Interferes with fast navigation |
| Emoji as icons | Unstable cross-platform, unprofessional |

---

## Project Structure

```
fieldnotes/
├── public/
│   ├── books/                    ← book covers (AVIF, ~600px wide)
│   │   ├── sapiens.avif
│   │   └── ...
│   ├── og-default.avif          ← default OG image
│   ├── avatar.avif              ← profile avatar
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── content/                  ← Obsidian vault root
│   │   ├── essays/
│   │   │   └── *.md
│   │   ├── field/
│   │   │   └── *.md
│   │   ├── books/
│   │   │   └── *.md
│   │   └── now/
│   │       └── current.md
│   ├── content.config.ts         ← Content Layer schemas (Astro 6, Zod v4)
│   ├── data/
│   │   ├── config.ts             ← SITE_NAME
│   │   ├── profile.ts            ← author info
│   │   ├── navigation.ts         ← nav links array
│   │   └── builds.ts             ← projects data
│   ├── icons/                    ← SVG icons
│   │   ├── github.svg
│   │   ├── telegram.svg
│   │   ├── arrow-right.svg
│   │   ├── arrow-left.svg
│   │   ├── arrow-up-right.svg
│   │   ├── menu.svg
│   │   ├── x.svg
│   │   ├── rss.svg
│   │   ├── mail.svg
│   │   ├── map-pin.svg
│   │   └── heart.svg
│   ├── layouts/
│   │   └── Base.astro            ← dark theme, fonts, SEO meta, Lenis, ClientRouter
│   ├── components/
│   │   ├── Header.astro          ← fixed nav + animated mobile menu
│   │   ├── Footer.astro          ← nav, social, bio, responsive grid
│   │   ├── Icon.astro            ← SVG icon loader
│   │   ├── PostCard.astro        ← essay card
│   │   ├── BuildCard.astro       ← project card with stack badges
│   │   ├── Map.astro             ← MapLibre GL detail map (field/[slug])
│   │   ├── GlobeMap.astro        ← MapLibre GL overview map (field index)
│   │   └── Lightbox.astro        ← image zoom modal
│   ├── pages/
│   │   ├── index.astro           → /
│   │   ├── essays/
│   │   │   ├── index.astro       → /essays
│   │   │   ├── [...slug].astro   → /essays/[slug]
│   │   │   └── tag/
│   │   │       └── [tag].astro   → /essays/tag/[tag]
│   │   ├── builds.astro          → /builds
│   │   ├── books/
│   │   │   ├── index.astro       → /books
│   │   │   └── [...slug].astro   → /books/[slug]
│   │   ├── field/
│   │   │   ├── index.astro       → /field
│   │   │   └── [...slug].astro   → /field/[slug]
│   │   ├── now.astro             → /now
│   │   ├── 404.astro             → /404
│   │   └── rss.xml.ts            → /rss.xml
│   ├── lib/
│   │   └── utils.ts              ← formatDate, reading time helpers
│   └── styles/
│       └── global.css            ← Tailwind @theme, prose styles, scroll animations
├── astro.config.mjs
├── tsconfig.json
└── SPEC.md                       ← this file
```

**No `tailwind.config.mjs`** — Tailwind CSS 4 is configured via `@theme` directive in `global.css`.

---

## Sections

### 1. Home `/`

**Purpose:** Profile page — who I am, links to all sections.

**Layout:**
- Hero: name + bio (Cormorant Garamond heading, Onest bio text)
- 5 section tile cards in responsive grid (1 col → 2 col → 3 col):
  - Essays, Builds, Books, Field, Now
  - Each with title, description, hover accent color transition, arrow icon
  - `rounded-sm` corners

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
- `/essays` — list of published essays with hero card + grid
- `/essays/[slug]` — single essay with prose typography, TOC, drop cap
- `/essays/tag/[tag]` — essays filtered by tag

**Data:** `src/content/essays/*.md`

**Frontmatter schema:**
```yaml
title: string           # required
excerpt: string         # required, shown on list page
status: draft | published
publishedAt: YYYY-MM-DD
cover: string           # optional, R2 URL or local path
lat: number             # optional
lng: number             # optional
tags: string[]          # optional
```

**Features:**
- Drafts filtered out in production (`import.meta.env.PROD`)
- Hero card for latest essay (21:9 cover aspect ratio if available)
- Tag filter buttons with active state
- Reading time calculation (words / 200)
- Staggered fade-in animations
- Prose typography: Spectral body, Cormorant Garamond headings, drop cap, section dividers (`· · ·`)
- Images: full-bleed (up to 1400px), `cursor: zoom-in` with Lightbox
- Tag pages at `/essays/tag/[tag]`
- RSS feed at `/rss.xml`

---

### 3. Builds `/builds`

**Purpose:** Portfolio — projects, tools, communities.

**Routes:**
- `/builds` — hero feature + active grid + upcoming section

**Data:** `src/data/builds.ts`

```typescript
export interface Build {
  title: string
  description: string
  url?: string                                          // optional — some projects have no link yet
  icon: string                                          // SVG icon name from src/icons/
  logo?: string                                         // optional logo image path
  cover?: string                                        // optional cover image for hero card
  status: 'active' | 'soon' | 'paused' | 'completed' | 'archived'
  kind: 'business' | 'oss' | 'media' | 'community'
  progress: number                                      // 0-100, not displayed visually
  position: number                                      // display order
  stack?: string[]                                      // tech stack labels
  startedOn?: string                                    // ISO date
  finishedOn?: string
}
```

**Layout:**
- **Hero card** — first active build with cover image, gradient overlay (`from-base from-20% via-base/85 via-60% to-base/30`), kind + status badges, title, description, stack badges, "Since" date, arrow CTA
- **Active projects** — 2-column grid of `BuildCard` components
- **"On the horizon"** section — upcoming (`soon` status) projects with divider line
- Staggered fade-in animations

**BuildCard features:**
- Kind label + status badge (color-coded: active=accent, paused=yellow, completed=blue, archived=secondary)
- Title with `arrow-up-right` icon if URL exists (hover animation)
- Description, tech stack badges (mono font, semi-transparent bg)
- "Since" date footer
- Hover glow: `shadow-[0_0_40px_rgba(232,98,44,0.06)]`
- Top stripe: `bg-white/[0.06]`

---

### 4. Books `/books`

**Purpose:** Reading log with ratings and key takeaways.

**Routes:**
- `/books` — list with currently reading + finished + dropped sections
- `/books/[slug]` — individual book detail page

**Data:** `src/content/books/*.md` (Content Collection, not data file)

**Frontmatter schema:**
```yaml
title: string
author: string
cover: string          # path in public/books/
status: reading | finished | dropped
rating: skip | good | essential   # optional, text-based (not numeric stars)
yearRead: number
keyIdea: string        # one-liner takeaway
tags: string[]         # optional
```

**Layout:**
- **Currently reading** — highlighted section with accent color, cover + details (if any books with `status: reading`)
- **Book list** — finished + dropped books, sorted by yearRead descending
  - Compact entries: cover thumbnail, title, author, year
  - Rating badges: `essential` (accent color), `good` (green), `skip` (gray)
  - Dropped books at 40% opacity
  - Key idea excerpt (2-line clamp)
- Kafka quote at top
- `rounded-sm` cards

**Book covers** stored in `public/books/` — AVIF, ~600px wide, shipped with site.

---

### 5. Field `/field`

**Purpose:** Travel photo gallery with geolocation and interactive map.

**Routes:**
- `/field` — GlobeMap overview + year filter + series grid
- `/field/[slug]` — single photo series with Map + photo grid + videos

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
photos:                 # optional
  - src: string         # R2 URL (AVIF format)
    caption: string     # optional
    lat: number         # optional — geotagged photo coordinate
    lng: number         # optional — geotagged photo coordinate
videos:                 # optional
  - youtube: string     # YouTube video ID
    title: string       # video title for accessibility
    caption: string     # optional
```

**GlobeMap (on `/field` index):**
- MapLibre GL JS with OpenFreeMap vector tiles
- Dark theme matching Cold Ink palette
- Accent-colored markers at each series' coordinates
- Hover popup: title + location
- Click marker → fly-to animation → navigate to `/field/[slug]`
- Year filter integration — markers fade when filtered out
- Zoom controls with touch-friendly buttons (44px on `pointer: coarse`)
- Live coordinates display on mousemove

**Map (on `/field/[slug]`):**
- MapLibre GL JS detail map
- Main crosshair marker at series coordinates
- Small dot markers for geotagged photos
- Click photo marker → scroll to photo in page
- Click coordinate button below photo → map flies to location
- Custom zoom controls, scroll zoom disabled
- Fly-to animation on load

**Photo grid (on `/field/[slug]`):**
- Vertical stack, full-bleed images (up to 1400px)
- Caption + coordinate button below each photo
- Lightbox on click (zoom modal)
- Lazy loading

**Video (YouTube embed):**
- `srcdoc` pattern for performance (no YouTube JS until click)
- Dark container `rounded-sm`, 16:9 aspect ratio
- Play button overlay

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
- **Live indicator** — pulsing emerald dot with dual-ring animation when fresh (< 14 days):
  - 12px dot with green glow shadow
  - Two concentric pulse rings (`now-ping`, `now-ping-delay`) scaling to ~30px
  - Stale state: static gray dot, no animation
- **Relative date** — "today", "yesterday", "3 days ago", etc. + absolute date
- Rendered markdown content in prose typography
- Fade-in animations
- History preserved in git (no DB needed)

---

### 7. 404 Page

**Route:** `/404`

**Design:**
- Full-screen dark background `bg-base`
- Large `404` in Cormorant Garamond, semi-transparent
- Short phrase: *"The trail ends here"*
- Subtext: *"This page doesn't exist or has been moved"*
- Single button: `← Back to base` — accent styled, links to `/`
- Minimal, atmospheric, no extra navigation

---

## Content Schemas (`src/content.config.ts`)

```typescript
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    status: z.enum(['draft', 'published']),
    publishedAt: z.coerce.date(),
    cover: z.string().optional(),
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
      lat: z.number().optional(),
      lng: z.number().optional(),
    })).optional().default([]),
    videos: z.array(z.object({
      youtube: z.string(),
      title: z.string(),
      caption: z.string().optional(),
    })).optional().default([]),
  }),
})

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string(),
    status: z.enum(['reading', 'finished', 'dropped']),
    rating: z.enum(['skip', 'good', 'essential']).optional(),
    yearRead: z.number(),
    keyIdea: z.string(),
    tags: z.array(z.string()).optional().default([]),
  }),
})

const now = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/now' }),
  schema: z.object({
    updatedAt: z.coerce.date(),
  }),
})

export const collections = { essays, field, books, now }
```

**Astro 6 specifics:**
- File: `src/content.config.ts` (not `src/content/config.ts`)
- Zod imported from `astro/zod` (Zod v4, not from `zod` directly)
- Uses `glob()` loader instead of deprecated `type: 'content'`
- Slug generated from filename automatically (`entry.id`)
- `slug` removed from frontmatter schemas — no duplication
- `<ClientRouter />` instead of removed `<ViewTransitions />`
- Live Content Collections — content updates in dev without reload

---

## Build Order

- [x] Spec document
- [x] Scaffold: Astro 6 + Tailwind CSS 4 + Base layout + Fonts API + SEO meta
- [x] Header + Footer + Icon system
- [x] Home page: profile hero + section tiles
- [x] Essays: Content Collection + list page + single post + tag pages
- [x] Builds: data file + hero card + active grid + upcoming section
- [x] Books: Content Collection + list page + detail pages + text ratings
- [x] Field: Content Collection + photo grid + responsive images + MapLibre
- [x] Field index: GlobeMap with MapLibre (interactive 2D map with markers)
- [x] Now: markdown page + live indicator + relative date
- [x] 404 page
- [x] Lightbox: image zoom modal with morph animation
- [x] Mobile: animated menu, touch targets, responsive layouts
- [x] Polish: RSS, sitemap, OG images, structured data
- [x] Deploy: GitHub Pages

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

| Content type    | Storage                 | Why                                            |
|-----------------|-------------------------|------------------------------------------------|
| Book covers     | `public/books/` (git)   | Small files (~30-50KB), deploy with site        |
| Travel photos   | Cloudflare R2           | Heavy files, don't bloat repository             |
| Travel videos   | YouTube (embed)         | Don't self-host video, links only               |
| Essay covers    | Cloudflare R2 or git    | Depends on size — decided per case              |
| OG images       | `public/` (git)         | Static, small                                   |
| Fonts           | Astro 6 Fonts API       | Auto self-hosted, zero external requests        |

---

## Photo Upload Workflow (Cloudflare R2)

```
1. Edit photos in Lightroom
2. Export as high-quality JPEG (full resolution)
3. Convert to AVIF:
   Tools: macOS Preview, Photoshop, or sharp script
4. Upload to Cloudflare R2 (dashboard or wrangler CLI)
5. Reference URL in frontmatter
```

**AVIF quality: 85** — high quality without visible artifacts, ~60-70% smaller than JPEG.

---

## Book Cover Workflow

```
1. Find quality cover image
2. Crop to ~2:3 proportions (book cover standard)
3. Resize to ~600px width
4. Convert to AVIF (quality: 90)
5. Place in public/books/[slug].avif
6. Create markdown file in src/content/books/ with frontmatter
```

Covers stored in git repository, deployed via GitHub Pages.
