import type { Post, Job } from './types'
import type { NewsArticle, NewsCategory } from './newsData'
import type { JobPosting } from './careersData'
import { getAssetUrl } from './api'

/**
 * Map Post from API to NewsArticle format for component compatibility
 */
export function mapPostToNewsArticle(post: Post, category: NewsCategory): NewsArticle {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: category,
    thumbnail: post.thumbnail_url ? getAssetUrl(post.thumbnail_url) : 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800',
    excerpt: post.excerpt || (typeof post.content === 'string' ? post.content.substring(0, 150).replace(/<[^>]*>/g, '') : '') || '',
    content: typeof post.content === 'string' ? post.content : '',
    date: post.published_at || post.created_at || new Date().toISOString(),
    author: post.author,
    featured: post.featured || false,
  }
}

/**
 * Map Job from API to NewsArticle format (for tuyen-dung category)
 */
export function mapJobToNewsArticle(job: Job): NewsArticle {
  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    category: 'tuyen-dung',
    thumbnail: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=800',
    excerpt: job.description || `Tuyển dụng tại ${job.location}. ${job.salary_range}`,
    content: job.description || '',
    date: job.created_at,
  }
}

/**
 * Map category name/slug from API to NewsCategory type
 */
export function mapCategoryToNewsCategory(category: string): NewsCategory {
  // If already a valid NewsCategory slug, return it
  if (['tin-thi-truong', 'quy-hoach-chinh-sach', 'tu-van-hoi-dap', 'tuyen-dung'].includes(category)) {
    return category as NewsCategory
  }
  
  // Map by name
  const lowerCategory = category.toLowerCase()
  if (lowerCategory.includes('thị trường') || lowerCategory.includes('thi truong')) {
    return 'tin-thi-truong'
  }
  if (lowerCategory.includes('quy hoạch') || lowerCategory.includes('quy hoach') || lowerCategory.includes('chính sách') || lowerCategory.includes('chinh sach')) {
    return 'quy-hoach-chinh-sach'
  }
  if (lowerCategory.includes('tư vấn') || lowerCategory.includes('tu van') || lowerCategory.includes('hỏi đáp') || lowerCategory.includes('hoi dap')) {
    return 'tu-van-hoi-dap'
  }
  if (lowerCategory.includes('tuyển dụng') || lowerCategory.includes('tuyen dung')) {
    return 'tuyen-dung'
  }
  
  // Default to tin-thi-truong
  return 'tin-thi-truong'
}

/**
 * Map Job from API to JobPosting format for JobTable component
 */
export function mapJobToJobPosting(job: Job): JobPosting {
  // Parse description fields if they're JSON strings
  let responsibilities: string[] = []
  let requirements: string[] = []
  let benefits: string[] = []
  
  try {
    if (job.description_responsibilities) {
      responsibilities = typeof job.description_responsibilities === 'string' 
        ? (JSON.parse(job.description_responsibilities) || [])
        : []
    }
  } catch {
    // If not JSON, treat as plain text and split by newlines
    if (job.description_responsibilities) {
      responsibilities = job.description_responsibilities.split('\n').filter(Boolean)
    }
  }
  
  try {
    if (job.description_requirements) {
      requirements = typeof job.description_requirements === 'string'
        ? (JSON.parse(job.description_requirements) || [])
        : []
    }
  } catch {
    if (job.description_requirements) {
      requirements = job.description_requirements.split('\n').filter(Boolean)
    }
  }
  
  try {
    if (job.description_benefits) {
      benefits = typeof job.description_benefits === 'string'
        ? (JSON.parse(job.description_benefits) || [])
        : []
    }
  } catch {
    if (job.description_benefits) {
      benefits = job.description_benefits.split('\n').filter(Boolean)
    }
  }

  return {
    id: job.id,
    slug: job.slug,
    title: job.title,
    quantity: job.quantity || 1,
    deadline: job.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: {
      overview: job.description_overview || job.description || '',
      responsibilities,
      requirements,
      benefits,
    },
  }
}

