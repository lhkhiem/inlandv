"use client"

import NewsFloatingButtons from '@/components/news/NewsFloatingButtons'
import ArticleHero from '@/components/articles/ArticleHero'
import ArticleBody from '@/components/articles/ArticleBody'
import SocialShare from '@/components/articles/SocialShare'
import RelatedArticles from '@/components/articles/RelatedArticles'
import BackToTopMount from '@/components/layout/BackToTopMount'
import { NewsArticle, newsCategoryLabels } from '@/lib/newsData'

interface NewsDetailPageClientProps {
  article: NewsArticle
  relatedArticles: NewsArticle[]
}

export default function NewsDetailPageClient({ article, relatedArticles }: NewsDetailPageClientProps) {
  const fullUrl = typeof window !== 'undefined' ? window.location.href : `https://inlandv.com/tin-tuc/${article.slug}`

  // Transform related articles to match RelatedArticles component format
  const formattedRelatedArticles = relatedArticles.map((a) => ({
    slug: a.slug,
    title: a.title,
    thumbnail: a.thumbnail,
    category: newsCategoryLabels[a.category],
  }))

  return (
    <main className="min-h-screen bg-black">
      <NewsFloatingButtons />

      {/* Hero Section */}
      <ArticleHero
        title={article.title}
        author={article.author}
        publishDate={new Date(article.date).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
        heroImage={article.thumbnail}
        category={newsCategoryLabels[article.category]}
      />

      {/* Article Body */}
      <ArticleBody content={article.content} />

      {/* Social Share */}
      <SocialShare url={fullUrl} title={article.title} />

      {/* Related Articles */}
      {formattedRelatedArticles.length > 0 && (
        <RelatedArticles 
          articles={formattedRelatedArticles} 
          basePath="/tin-tuc"
        />
      )}

      {/* Back to Top Button */}
      <BackToTopMount />
    </main>
  )
}
