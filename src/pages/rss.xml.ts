import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const allEssays = await getCollection('essays')
  const essays = allEssays
    .filter((e) => e.data.status === 'published')
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())

  return rss({
    title: 'Fieldnotes',
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
