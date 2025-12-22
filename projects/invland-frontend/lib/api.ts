import type {
  Project,
  Listing,
  Post,
  Lead,
  Job,
  ApiResponse,
  PaginatedResponse,
  ProjectFilter,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      // Silently handle network errors - component will use mock data
      if (error instanceof Error) {
        // Only log if it's not a network error (which is expected in dev)
        if (!error.message.includes('fetch') && 
            !error.message.includes('Failed to fetch') &&
            !error.message.includes('aborted')) {
          console.error('API request failed:', error)
        }
      }
      throw error
    }
  }

  // Projects
  async getProjects(
    filters?: ProjectFilter,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Project>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    } as any)

    return this.request<PaginatedResponse<Project>>(
      `/projects?${params.toString()}`
    )
  }

  async getProjectBySlug(slug: string): Promise<ApiResponse<Project>> {
    return this.request<ApiResponse<Project>>(`/projects/${slug}`)
  }

  async getFeaturedProjects(limit = 6): Promise<ApiResponse<Project[]>> {
    return this.request<ApiResponse<Project[]>>(
      `/projects/featured?limit=${limit}`
    )
  }

  // Listings
  async getListings(
    projectId?: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Listing>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(projectId && { project_id: projectId }),
    })

    return this.request<PaginatedResponse<Listing>>(
      `/listings?${params.toString()}`
    )
  }

  async getListingById(id: string): Promise<ApiResponse<Listing>> {
    return this.request<ApiResponse<Listing>>(`/listings/${id}`)
  }

  // Posts
  async getPosts(
    category?: string,
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
    })

    return this.request<PaginatedResponse<Post>>(`/posts?${params.toString()}`)
  }

  async getPostBySlug(slug: string): Promise<ApiResponse<Post>> {
    return this.request<ApiResponse<Post>>(`/posts/${slug}`)
  }

  async getFeaturedPosts(limit = 3): Promise<ApiResponse<Post[]>> {
    return this.request<ApiResponse<Post[]>>(`/posts/featured?limit=${limit}`)
  }

  // Leads
  async createLead(lead: Lead): Promise<ApiResponse<Lead>> {
    return this.request<ApiResponse<Lead>>('/leads', {
      method: 'POST',
      body: JSON.stringify(lead),
    })
  }

  // Jobs
  async getJobs(page = 1, limit = 10): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    return this.request<PaginatedResponse<Job>>(`/jobs?${params.toString()}`)
  }

  async getJobBySlug(slug: string): Promise<ApiResponse<Job>> {
    return this.request<ApiResponse<Job>>(`/jobs/${slug}`)
  }
}

export const api = new ApiClient(API_URL)
