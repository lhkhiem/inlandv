import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ArticleHero from '@/components/articles/ArticleHero'
import ArticleBody from '@/components/articles/ArticleBody'
import SocialShare from '@/components/articles/SocialShare'
import RelatedArticles from '@/components/articles/RelatedArticles'
import BackToTopMount from '@/components/layout/BackToTopMount'
import { newsActivityArticles, newsActivityCategoryLabels } from '@/lib/newsActivitiesData'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all news activity articles
export async function generateStaticParams() {
  return newsActivityArticles.map((article) => ({
    slug: article.slug,
  }))
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = newsActivityArticles.find((a) => a.slug === slug)

  if (!article) {
    return {
      title: 'Bài viết không tồn tại',
    }
  }

  return {
    title: `${article.title} - INLANDV`,
    description: article.excerpt,
    keywords: `${newsActivityCategoryLabels[article.category]}, tin tức, hoạt động, INLANDV`,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [
        {
          url: article.thumbnail,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
  }
}

export default async function NewsActivityArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = newsActivityArticles.find((a) => a.slug === slug)

  if (!article) {
    notFound()
  }

  // Get related articles from the same category
  const relatedArticles = newsActivityArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 6)
    .map((a) => ({
      slug: a.slug,
      title: a.title,
      thumbnail: a.thumbnail,
      category: newsActivityCategoryLabels[a.category],
    }))

  // Fallback to any articles if no same-category articles
  const finalRelatedArticles = relatedArticles.length > 0
    ? relatedArticles
    : newsActivityArticles
        .filter((a) => a.slug !== article.slug)
        .slice(0, 6)
        .map((a) => ({
          slug: a.slug,
          title: a.title,
          thumbnail: a.thumbnail,
          category: newsActivityCategoryLabels[a.category],
        }))

  const fullUrl = `https://inlandv.com/tin-tuc-hoat-dong/${article.slug}`

  return (
    <main className="min-h-screen bg-white">
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
        category={newsActivityCategoryLabels[article.category]}
      />

      {/* Article Body */}
      <ArticleBody content={article.content} />

      {/* Social Share */}
      <SocialShare url={fullUrl} title={article.title} />

      {/* Related Articles */}
      {finalRelatedArticles.length > 0 && (
        <RelatedArticles 
          articles={finalRelatedArticles} 
          basePath="/tin-tuc-hoat-dong"
        />
      )}

      {/* Back to Top Button */}
      <BackToTopMount />
    </main>
  )
}
