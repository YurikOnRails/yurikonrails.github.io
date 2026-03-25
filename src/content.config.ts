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
