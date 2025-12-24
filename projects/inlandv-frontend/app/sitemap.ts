import { MetadataRoute } from 'next'
import { api } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://inlandrealestate.vn'

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/gioi-thieu`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mua-ban`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cho-thue`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tuyen-dung`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/lien-he`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  try {
    // Dynamic project routes
    const projectsResponse = await api.getProjects({}, 1, 100)
    const projectRoutes = projectsResponse.data?.map((project) => ({
      url: `${baseUrl}/mua-ban/${project.slug}`,
      lastModified: new Date(project.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })) || []

    // Dynamic post routes
    const postsResponse = await api.getPosts(undefined, 1, 100)
    const postRoutes = postsResponse.data?.map((post) => ({
      url: `${baseUrl}/tin-tuc/${post.slug}`,
      lastModified: new Date(post.created_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })) || []

    return [...routes, ...projectRoutes, ...postRoutes]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return routes
  }
}
