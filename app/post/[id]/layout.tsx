import { Metadata } from 'next'
import { prisma } from '@/lib/db'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mancia-e-statti-zitto-da-sasa.site'
const siteName = 'Mancia e statti zitto da Sasà'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const numId = parseInt(id, 10)
  if (isNaN(numId) || !prisma) {
    return { title: 'Post | ' + siteName }
  }
  try {
    const post = await prisma.post.findUnique({
      where: { id: numId },
      select: { title: true, description: true, createdAt: true },
    })
    if (!post) return { title: 'Post | ' + siteName }
    const title = post.title?.trim() || 'Post del giorno'
    const description = post.description.slice(0, 160).trim() + (post.description.length > 160 ? '...' : '')
    return {
      title: `${title} | ${siteName}`,
      description,
      openGraph: {
        title: `${title} | ${siteName}`,
        description,
        url: `${siteUrl}/post/${id}`,
        type: 'article',
        publishedTime: post.createdAt.toISOString(),
      },
      alternates: {
        canonical: `${siteUrl}/post/${id}`,
      },
    }
  } catch {
    return { title: 'Post | ' + siteName }
  }
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
