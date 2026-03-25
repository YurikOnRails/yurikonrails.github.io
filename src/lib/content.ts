import { getCollection } from 'astro:content'

export async function getPublishedEssays() {
  const allEssays = await getCollection('essays')
  return allEssays
    .filter((e) => !import.meta.env.PROD || e.data.status === 'published')
    .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
}
