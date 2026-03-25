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

**Normal width** -- for diagrams, screenshots, schemas. Stays within the text column with a small bleed:

```markdown
![Database schema diagram](/essays/my-post/schema.png)
```

**Full width** -- for high-resolution travel photography, cinematic shots. Stretches edge-to-edge across the entire viewport. Add `"wide"` after the URL:

```markdown
![Sunset over the mountains](/essays/my-post/sunset.jpeg "wide")
```

### Guidelines

- Use `"wide"` for landscape photography, travel shots, cinematic images
- Keep diagrams, code screenshots, and schemas at normal width
- Recommended resolution: 2000px+ wide for `"wide"` images, 1200px+ for normal
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
