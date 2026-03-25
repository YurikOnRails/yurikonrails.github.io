import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getPublishedEssays } from '../lib/content'
import { SITE_NAME } from '../data/config'

export async function GET(context: APIContext) {
  const essays = await getPublishedEssays()

  return rss({
    title: SITE_NAME,
    description: 'Essays on tech, travel, and ideas.',
    site: context.site!,
    items: essays.map((essay) => ({
      title: essay.data.title,
      description: essay.data.excerpt,
      pubDate: essay.data.publishedAt,
      link: `/essays/${essay.id}`,
    })),
  })
}
