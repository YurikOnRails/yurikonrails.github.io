# Fieldnotes — Cinematic Map Scrollytelling

## Implementation Guide & AI Prompt

---

## Part 1. Architecture Overview

### What We're Building

A cinematic scrollytelling experience where scrolling through text chapters drives a synchronized map + media scene. Left column is a sticky "viewport" (map + photo/video overlay), right column is scrollable narrative text.

This is the format used by NYT Interactives, Bloomberg, and National Geographic digital stories.

### Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Astro 6 | Static generation, Content Layer API, Islands |
| Styling | Tailwind CSS 4 | Utility classes, dark theme |
| Maps | MapLibre GL JS + OpenFreeMap | Free, self-hostable, dark tiles |
| Animation | GSAP 3 + ScrollTrigger | Scroll-driven transitions |
| Smooth Scroll | Lenis | Momentum scroll, mobile support |
| Fonts | Cormorant Garamond / Onest / JetBrains Mono | Display / UI / Code |
| Images | Cloudflare R2 | AVIF, custom domain CDN |
| Video | YouTube (lazy embed) | Lite approach, thumbnail-first |

### Font System

```
Cormorant Garamond  →  Chapter titles, hero text, quotes over media
Onest               →  Body text, navigation, UI labels, lower-thirds
JetBrains Mono      →  Coordinates on map, technical data, code blocks
```

---

## Part 2. Critical Technical Decisions

### 2.1. Scroll-Driven Camera (NOT event-driven)

This is the most important architectural decision. There are two approaches to syncing scroll with map camera:

**Approach A (naive, problematic):**
```javascript
// ScrollTrigger fires event → map.flyTo() runs its own animation
// Two animation engines fighting each other
ScrollTrigger.create({
  onEnter: () => map.flyTo({ center, zoom, duration: 2 })
});
```

Problems: flyTo is async with its own timing. Fast scroll = interrupted animations = visual stutter. No way to scrub backwards. Camera position disconnected from scroll position.

**Approach B (correct, scroll-driven):**
```javascript
// Scroll position directly controls camera via interpolation
// One source of truth: scroll progress
ScrollTrigger.create({
  trigger: chapterEl,
  start: "top center",
  end: "bottom center",
  onUpdate: (self) => {
    const p = self.progress;
    map.jumpTo({
      center: lerpCoords(prevChapter.coords, currChapter.coords, p),
      zoom: lerp(prevChapter.zoom, currChapter.zoom, p),
      pitch: lerp(prevChapter.pitch, currChapter.pitch, p),
      bearing: lerp(prevChapter.bearing, currChapter.bearing, p),
    });
  }
});
```

This means: scroll 50% through a chapter = camera is exactly 50% between two positions. Scroll backwards = camera goes back. Scrub = buttery smooth. One animation engine (GSAP), one consumer (MapLibre jumpTo).

### 2.2. Lenis + ScrollTrigger Integration

Lenis overrides native scroll. ScrollTrigger listens to native scroll. They must be explicitly connected:

```javascript
const lenis = new Lenis({ smooth: true });

// Connect Lenis to GSAP ticker
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Without this bridge, ScrollTrigger markers fire late and all transitions feel "laggy."

### 2.3. YouTube Embed Strategy

Standard YouTube iframes load ~800KB each. With 5+ chapters containing video, this kills scroll performance.

Strategy: ultra-lazy loading.

1. Default state: static thumbnail from `https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`
2. On chapter enter + 1.5s dwell time: replace thumbnail with lite iframe
3. On chapter exit: destroy iframe, restore thumbnail

Never preload YouTube iframes. Never have more than one active iframe at a time.

### 2.4. Mobile Layout

Two-column sticky layout breaks on mobile. Plan from the start:

- Desktop (>= 1024px): sticky left (55%) + scrolling right (45%)
- Tablet (768-1023px): sticky left (50%) + scrolling right (50%)
- Mobile (< 768px): map as sticky header (45vh) + full-width scrolling text below

On mobile, media overlays become full-width between text chapters (inline, not overlay).

### 2.5. MapLibre Initialization

MapLibre GL JS is heavy (~200KB). Initialize exactly once, never destroy/recreate.

```javascript
// Astro component with client:visible
// Initialize only in browser
if (typeof window === 'undefined') return;

const map = new maplibregl.Map({
  container: 'map-container',
  style: 'https://tiles.openfreemap.org/styles/liberty', // or custom dark style
  center: [initialLng, initialLat],
  zoom: initialZoom,
  pitch: 0,
  bearing: 0,
  attributionControl: false,
  dragRotate: false,     // disable during scroll storytelling
  touchZoomRotate: false, // disable during scroll storytelling
  scrollZoom: false,      // scroll is for storytelling, not map zoom
});
```

Disable all user interactions with the map during storytelling mode. The scroll controls the camera, not mouse/touch on the map.

---

## Part 3. Content Schema

### Zod Schema for Astro Content Layer

```typescript
import { z, defineCollection } from 'astro:content';

const chapterSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  title: z.string(),
  subtitle: z.string().optional(),

  // Map camera
  coordinates: z.tuple([z.number(), z.number()]),
  camera: z.object({
    zoom: z.number().min(1).max(20).default(12),
    pitch: z.number().min(0).max(85).default(0),
    bearing: z.number().min(-180).max(180).default(0),
    speed: z.number().min(0.1).max(5).default(1), // transition speed multiplier
  }),

  // Media overlay (optional — some chapters are map-only)
  media: z.object({
    type: z.enum(['image', 'youtube']),
    src: z.string(), // filename for images, video ID for youtube
    alt: z.string().default(''),
    caption: z.string().optional(),
    opacity: z.number().min(0).max(1).default(0.85), // overlay opacity over map
  }).optional(),

  // Content
  content: z.string(), // Markdown body text

  // Visual overrides
  theme: z.enum(['dark', 'light']).default('dark'),
});

const storySchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  coverImage: z.string().optional(),
  baseMediaUrl: z.string().url(), // Cloudflare R2 base URL
  chapters: z.array(chapterSchema).min(1),
});

export const collections = {
  stories: defineCollection({ schema: storySchema }),
};
```

### Example Content File

```yaml
# src/content/stories/korea-migrants.yaml
title: "Наши в Корее"
description: "Выпуск о жизни трудовых мигрантов из СНГ"
date: 2026-03-01
coverImage: "korea-cover.avif"
baseMediaUrl: "https://media.fieldnotes.dev"
chapters:
  - id: "arrival"
    order: 1
    title: "Прибытие"
    coordinates: [126.978, 37.566]
    camera:
      zoom: 11
      pitch: 45
      bearing: -20
    media:
      type: image
      src: "korea/incheon-airport.avif"
      alt: "Аэропорт Инчхон"
    content: |
      Каждый год тысячи граждан стран СНГ прилетают
      в аэропорт Инчхон. Для большинства это первое
      знакомство с Южной Кореей...

  - id: "factory-district"
    order: 2
    title: "Промышленные районы"
    coordinates: [127.004, 37.481]
    camera:
      zoom: 14
      pitch: 60
      bearing: 30
    media:
      type: youtube
      src: "dQw4w9WgXcQ"
      alt: "Рабочий район Ансан"
    content: |
      Город Ансан — неофициальная столица трудовых
      мигрантов. Здесь сконцентрированы фабрики,
      общежития, магазины с вывесками на русском...

  - id: "daily-life"
    order: 3
    title: "Повседневность"
    subtitle: "12 часов смены"
    coordinates: [126.831, 37.322]
    camera:
      zoom: 16
      pitch: 0
      bearing: 0
    content: |
      Рабочий день начинается в шесть утра.
      Автобус от общежития до фабрики —
      двадцать минут через рисовые поля...
```

---

## Part 4. Implementation Phases

### Phase 1: Skeleton (2-3 days)

Goal: two-column layout with working scroll tracking.

- Astro page with sticky left / scrolling right
- MapLibre initialization with OpenFreeMap dark tiles
- 3 hardcoded chapters
- Simple `jumpTo` on scroll (no interpolation yet)
- Mobile fallback layout
- Fonts loaded and applied

**Done when:** scrolling through text changes map position. Ugly but functional.

### Phase 2: Scroll-Driven Camera (3-4 days)

Goal: buttery smooth camera transitions.

- GSAP ScrollTrigger setup per chapter
- Lenis integration (ticker bridge)
- Camera interpolation via `onUpdate` (lerp coordinates, zoom, pitch, bearing)
- Custom easing (`power2.inOut` or custom cubic bezier)
- Handle resize events (`ScrollTrigger.refresh()`)

**Done when:** scrolling feels like flying over a map. Reverse scroll works perfectly.

### Phase 3: Media Layer (3-4 days)

Goal: images and video overlay the map contextually.

- Media container above map with `pointer-events: none`
- AVIF images from Cloudflare R2 with fade transitions
- YouTube lazy loading (thumbnail → iframe on dwell)
- Only one media visible at a time (crossfade between chapters)
- Preload next chapter's image when current chapter is 50% scrolled

**Done when:** photos appear and disappear smoothly over the map during scroll.

### Phase 4: Visual Polish (3-4 days)

Goal: National Geographic aesthetic.

- Dark map style (custom or OpenFreeMap dark)
- 3D terrain / hillshade layer
- Cormorant Garamond for chapter titles over media (text-shadow for readability)
- JetBrains Mono for coordinates overlay (bottom-left of map, updating live)
- Onest for body text styling
- Vignette gradient on map edges
- Progress indicator (thin line or dots showing chapter position)

**Done when:** looks like a professional interactive documentary.

### Phase 5: Content Layer (1-2 days)

Goal: data-driven, not hardcoded.

- Migrate hardcoded chapters to Astro Content Layer + Zod
- YAML/JSON content files
- Markdown rendering for chapter text
- Type safety end-to-end

**Done when:** adding a new story = adding a YAML file + images. No code changes.

### Phase 6: Performance & Accessibility (1-2 days)

- Lighthouse audit (target 90+)
- `loading="lazy"` on all images
- `<noscript>` fallback (static images + text)
- Keyboard navigation between chapters
- `prefers-reduced-motion`: disable map animations, show static positions
- `aria-live` regions for chapter changes

---

## Part 5. File Structure

```
src/
├── content/
│   └── stories/
│       └── korea-migrants.yaml
├── components/
│   └── scrollytelling/
│       ├── ScrollytellingScene.astro      # Main Astro island wrapper
│       ├── ScrollytellingClient.tsx        # Client-side React/Preact component
│       ├── MapLayer.ts                     # MapLibre init + camera control
│       ├── MediaLayer.ts                   # Image/YouTube overlay management
│       ├── ScrollManager.ts               # GSAP + Lenis + ScrollTrigger setup
│       ├── ChapterText.astro              # Individual chapter text block
│       └── utils/
│           ├── lerp.ts                    # Linear interpolation helpers
│           └── youtube.ts                 # Lazy YouTube embed logic
├── layouts/
│   └── StoryLayout.astro                  # Full-width immersive layout
├── pages/
│   └── stories/
│       └── [slug].astro                   # Dynamic story pages
└── styles/
    └── scrollytelling.css                 # Custom styles, CSS variables
```

---

## Part 6. Key Utility Functions

```typescript
// lerp.ts
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpCoords(
  a: [number, number],
  b: [number, number],
  t: number
): [number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
}

// Clamp progress to 0-1 range
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(Math.max(value, min), max);
}
```

---

## Part 7. CSS Variables (Design Tokens)

```css
:root {
  /* Palette: Cinematic Forest */
  --color-bg: #080d0b;
  --color-surface: #111a15;
  --color-accent: #7fb069;
  --color-text: #e8e0d4;
  --color-muted: #5a6e62;

  /* Fonts */
  --font-display: 'Cormorant Garamond', 'Georgia', serif;
  --font-body: 'Onest', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Transitions */
  --ease-cinematic: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --duration-camera: 2s;
  --duration-fade: 0.8s;

  /* Layout */
  --scene-width: 55%;
  --text-width: 45%;
  --scene-width-tablet: 50%;
  --text-width-tablet: 50%;
}

@media (max-width: 767px) {
  :root {
    --scene-width: 100%;
    --text-width: 100%;
  }
}
```

---

## Part 8. Performance Budget

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Total Blocking Time | < 200ms |
| Cumulative Layout Shift | < 0.1 |
| MapLibre JS (gzipped) | ~75KB |
| GSAP + ScrollTrigger (gzipped) | ~30KB |
| Lenis (gzipped) | ~5KB |
| Font files (subset, woff2) | < 150KB total |
| Initial tile load | < 500KB |

Subsetting fonts is critical. Cormorant Garamond: only weights 400 and 700 + Cyrillic + Latin subsets. Onest: weights 400, 500, 600, 800. JetBrains Mono: weight 400 only.

---

## Part 9. Known Pitfalls

1. **MapLibre `jumpTo` vs `flyTo`**: Use `jumpTo` in scroll-driven mode. `flyTo` has its own animation loop that conflicts with GSAP.

2. **ScrollTrigger + dynamic content**: If chapter text height changes (images loading, font swap), call `ScrollTrigger.refresh()` after all content is settled.

3. **OpenFreeMap tile limits**: No API key needed, but heavy usage may get rate-limited. Consider self-hosting tiles on your Hetzner server for production.

4. **Cloudflare R2 CORS**: Configure CORS headers on R2 bucket for your domain. Without this, AVIF images may fail to load.

5. **Safari + AVIF**: Safari 16+ supports AVIF. For older versions, provide WebP fallback via `<picture>` element.

6. **Lenis on iOS**: Lenis smooth scroll can conflict with iOS rubber-band scrolling. Test on real devices, not just simulators.

7. **YouTube Privacy**: Use `youtube-nocookie.com` domain for embeds to comply with GDPR.

8. **3D Terrain + Performance**: MapLibre terrain (DEM tiles) adds significant GPU load. Disable on mobile or use lower-resolution DEM.

---

## Part 10. AI Prompt

The following prompt is designed for use with Claude Code, Cursor, or any AI coding assistant.

---

```markdown
# Role

You are a senior frontend developer specializing in interactive storytelling,
cartography, and animation. You have deep expertise in Astro, GSAP, MapLibre GL JS,
and performance optimization.

# Project Context

"Fieldnotes" is a cinematic travel scrollytelling platform. Each story is a
scroll-driven interactive experience where the user reads narrative text on the right
side while a synchronized map + media scene updates on the left side.

Think: New York Times Interactives meets National Geographic visual essays.

# Tech Stack

- Astro 6 (Content Layer API, Zod schemas, Islands architecture)
- Tailwind CSS 4
- MapLibre GL JS + OpenFreeMap (dark theme, no API key required)
- GSAP 3 + ScrollTrigger (scroll-driven animations)
- Lenis (smooth scroll)
- TypeScript (strict mode)
- Fonts: Cormorant Garamond (display), Onest (UI/body), JetBrains Mono (code/data)
- Images: Cloudflare R2 (AVIF format, custom domain)
- Video: YouTube lazy embeds (thumbnail-first, iframe on dwell)

# Architecture Rules

## Layout
- Desktop: sticky left column (55vw, h-screen) + scrolling right column (45vw)
- Mobile (<768px): sticky map header (45vh) + full-width scrolling text below
- Left column has two layers: MapLibre canvas (base) + media overlay (above)
- Map interactions (drag, zoom, rotate) are DISABLED during storytelling

## Scroll-Driven Camera (CRITICAL)
- NEVER use map.flyTo() from ScrollTrigger callbacks
- Camera position is a FUNCTION of scroll progress, not a reaction to events
- Use map.jumpTo() with interpolated values from GSAP onUpdate
- Linear interpolation (lerp) between chapter camera positions based on progress
- This means: scroll 50% = camera is 50% between two chapters
- Reverse scroll = camera goes back smoothly

## Lenis + ScrollTrigger Bridge
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

## Media Layer
- Only one media item visible at a time
- Crossfade transitions (opacity 0→1, duration 0.8s)
- Images: AVIF from Cloudflare R2, preload next chapter at 50% scroll
- YouTube: show thumbnail first, load iframe only after 1.5s dwell on chapter
- Destroy YouTube iframe when leaving chapter
- Media container has pointer-events: none (scroll passes through)

## Visual Style
- Dark cinematic palette: bg #080d0b, surface #111a15, accent #7fb069, text #e8e0d4
- Map: dark theme, minimal labels, 3D terrain (hillshade) on desktop
- Cormorant Garamond for titles over media (with text-shadow for readability)
- JetBrains Mono for live coordinates display (bottom-left of map)
- Onest for all body text and UI elements
- Custom easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

## Performance Requirements
- Initialize MapLibre once, never destroy/recreate
- Use client:visible for the main Astro island
- Guard all browser APIs: if (typeof window === 'undefined') return
- Handle resize: ScrollTrigger.refresh() on window resize (debounced)
- Subset fonts (only needed weights + Cyrillic + Latin)
- prefers-reduced-motion: skip animations, show static camera positions
- Target Lighthouse 90+ on all metrics

## File Structure
src/
├── content/stories/           # YAML story files
├── components/scrollytelling/
│   ├── ScrollytellingScene.astro
│   ├── ScrollytellingClient.tsx
│   ├── MapLayer.ts
│   ├── MediaLayer.ts
│   ├── ScrollManager.ts
│   ├── ChapterText.astro
│   └── utils/ (lerp.ts, youtube.ts)
├── layouts/StoryLayout.astro
├── pages/stories/[slug].astro
└── styles/scrollytelling.css

# Code Style
- TypeScript strict, no `any`
- Functional style, no classes unless wrapping MapLibre
- Small focused modules (<200 lines each)
- Comments in English, UI strings in Russian (Cyrillic)
- Use CSS custom properties for all colors, fonts, spacing
- Tailwind for layout utilities, custom CSS for animations
```

---

**End of document.**
