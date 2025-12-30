import { notFound } from 'next/navigation'
import NewsDetailPageClient from './NewsDetailPageClient'
import { api } from '@/lib/api'
import { mapPostToNewsArticle, mapCategoryToNewsCategory } from '@/lib/newsUtils'
import type { NewsArticle } from '@/lib/newsData'

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string }
}

export default async function NewsDetailPage({ params }: PageProps) {
  // Handle both Promise and direct params
  const resolvedParams = params instanceof Promise ? await params : params
  
  try {
    // Fetch post by slug from API
    const response = await api.getPostBySlug(resolvedParams.slug)
    
    if (!response.success || !response.data) {
      notFound()
    }

    const post = response.data
    const category = mapCategoryToNewsCategory(post.category)
    const article: NewsArticle = mapPostToNewsArticle(post, category)

    // Get related articles from the same category
    let relatedArticles: NewsArticle[] = []
    try {
      const relatedResponse = await api.getPosts(category, 1, 6)
      if (relatedResponse.data) {
        relatedArticles = relatedResponse.data
          .filter(p => p.id !== post.id)
          .slice(0, 6)
          .map(p => mapPostToNewsArticle(p, category))
      }
    } catch (err) {
      console.error('Error fetching related articles:', err)
      // Continue without related articles
    }

    return (
      <NewsDetailPageClient 
        article={article}
        relatedArticles={relatedArticles}
      />
    )
  } catch (error) {
    console.error('Error fetching news article:', error)
    notFound()
  }
}
