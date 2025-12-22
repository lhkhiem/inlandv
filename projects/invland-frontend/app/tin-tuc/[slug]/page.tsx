import { notFound } from 'next/navigation'
import NewsDetailPageClient from './NewsDetailPageClient'
import { newsArticles } from '@/lib/newsData'

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export default async function NewsDetailPage({ params }: PageProps) {
  // Handle both Promise and direct params
  const resolvedParams = params instanceof Promise ? await params : params
  const article = newsArticles.find(a => a.slug === resolvedParams.slug)

  if (!article) {
    notFound()
  }

  // Get related articles (exclude current article)
  const relatedArticles = newsArticles
    .filter(a => a.id !== article.id)
    .slice(0, 6)

  return (
    <NewsDetailPageClient 
      article={article}
      relatedArticles={relatedArticles}
    />
  )
}
