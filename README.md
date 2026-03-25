# Fieldnotes

Personal publishing platform. Essays, travel photography, reading log, project documentation. Built with Astro 6, Tailwind CSS 4, dark theme "Cold Ink".

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start local dev server at `localhost:4321`   |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview build locally before deploying       |

## Images in essays

Place images in `public/essays/<slug>/`. Reference them in markdown as `/essays/<slug>/filename.jpeg`.

### Two image modes

**Wide (default)** -- all images are displayed wide (up to 1400px, centered). No extra markup needed:

```markdown
![Sunset over the mountains](/essays/my-post/sunset.jpeg)
```

**Narrow** -- for diagrams, screenshots, schemas. Stays within the text column. Add `"narrow"` after the URL:

```markdown
![Database schema diagram](/essays/my-post/schema.png "narrow")
```

### Guidelines

- Photos are wide by default — no extra markup needed
- Use `"narrow"` for diagrams, code screenshots, and schemas
- Recommended resolution: 2000px+ wide for photos, 1200px+ for narrow
- Formats: JPEG for photos, PNG for diagrams, AVIF/WebP for optimized delivery

## Images in field

Place photos in `public/field/<slug>/`. Reference in frontmatter:

```yaml
cover: /field/altai/cover.avif
photos:
  - src: /field/altai/photo-01.avif
    caption: Valley at dawn
```

## Content structure

```
src/content/
  essays/       -- long-form writing (markdown + images)
  books/        -- reading log with reviews
  field/        -- travel photography series
  now/          -- /now page updates
src/data/
  builds.ts     -- project cards for /builds
```
