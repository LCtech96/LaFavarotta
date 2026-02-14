import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mancia-e-statti-zitto-da-sasa.site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/menu`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/chi-siamo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/carrello`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/maps`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  let postPages: MetadataRoute.Sitemap = []
  if (prisma) {
    try {
      const posts = await prisma.post.findMany({
        select: { id: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
      postPages = posts.map((p) => ({
        url: `${siteUrl}/post/${p.id}`,
        lastModified: p.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    } catch {
      // ignore
    }
  }

  return [...staticPages, ...postPages]
}






