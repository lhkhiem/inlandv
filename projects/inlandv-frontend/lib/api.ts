import type {
  Project,
  Listing,
  Post,
  Lead,
  Job,
  Page,
  Property,
  IndustrialPark,
  ApiResponse,
  PaginatedResponse,
  ProjectFilter,
  PropertyFilter,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001'

class ApiClient {
  private baseURL: string
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map()
  private cacheTTL = 30000 // 30 seconds cache
  private pendingRequests: Map<string, Promise<any>> = new Map()

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const cacheKey = `${url}_${JSON.stringify(options?.body || {})}`
    const maxRetries = 2 // Reduced from 3 to 2
    const baseDelay = 2000 // Increased from 1s to 2s
    
    // Check cache first (only for GET requests)
    if (!options?.method || options.method === 'GET') {
      const cached = this.requestCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data as T
      }
      
      // Check if there's a pending request for the same endpoint
      const pending = this.pendingRequests.get(cacheKey)
      if (pending) {
        return pending as Promise<T>
      }
    }
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    // Create the request promise
    const requestPromise = (async () => {
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
          // Handle 429 Too Many Requests with retry (but with longer delay)
          if (response.status === 429 && retryCount < maxRetries) {
            const delay = baseDelay * Math.pow(2, retryCount) // Exponential backoff: 2s, 4s
            console.warn(`Rate limited (429). Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, delay))
            return this.request<T>(endpoint, options, retryCount + 1)
          }
        
        // For 404 on settings endpoints, try to return empty data gracefully
        if (response.status === 404 && endpoint.includes('/settings/')) {
          try {
            const errorData = await response.json()
            // If backend returns success: true with empty value, use it
            if (errorData.success && errorData.data) {
              return errorData as T
            }
          } catch {
            // If response is not JSON, continue to error handling
          }
        }
        
          // For other 404s or errors, throw structured error
          if (response.status === 404) {
            const errorData = await response.json().catch(() => ({ success: false, message: 'Not found' }))
            const error = new Error(`API Error: ${response.status} ${response.statusText}`)
            ;(error as any).status = 404
            ;(error as any).data = errorData
            throw error
          }
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        
        // Cache GET requests
        if (!options?.method || options.method === 'GET') {
          this.requestCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          })
        }
        
        return data as T
      } catch (error) {
        clearTimeout(timeoutId)
        // Log connection errors for debugging
        if (error instanceof Error) {
          const isConnectionError = 
            error.message.includes('fetch') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('ECONNREFUSED') ||
            (error as any).cause?.code === 'ECONNREFUSED'
          
          if (isConnectionError) {
            console.error(`[API] Connection failed to ${url}. Make sure backend is running.`, error)
          } else if (!(error as any).status || (error as any).status !== 404) {
            // Only log if it's not a 404 (which are expected)
            console.error('[API] Request failed:', error)
          }
        }
        throw error
      } finally {
        // Remove from pending requests
        this.pendingRequests.delete(cacheKey)
      }
    })()
    
    // Store pending request
    if (!options?.method || options.method === 'GET') {
      this.pendingRequests.set(cacheKey, requestPromise)
    }
    
    return requestPromise
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

  // Pages
  async getPageBySlug(slug: string): Promise<ApiResponse<Page>> {
    return this.request<ApiResponse<Page>>(`/pages/${slug}`)
  }

  // Properties
  async getProperties(
    filters?: PropertyFilter & { q?: string; location_types?: string[] },
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<Property>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.main_category && { main_category: filters.main_category }),
      ...(filters?.sub_category && { sub_category: filters.sub_category }),
      ...(filters?.property_type && { property_type: filters.property_type }),
      ...(filters?.transaction_type && { transaction_type: filters.transaction_type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.province && { province: filters.province }),
      ...(filters?.price_min && { price_min: filters.price_min.toString() }),
      ...(filters?.price_max && { price_max: filters.price_max.toString() }),
      ...(filters?.area_min && { area_min: filters.area_min.toString() }),
      ...(filters?.area_max && { area_max: filters.area_max.toString() }),
      ...(filters?.q && { q: filters.q }),
    })

    // Add location_types as array params
    if (filters?.location_types && filters.location_types.length > 0) {
      filters.location_types.forEach(locationType => {
        params.append('location_types', locationType)
      })
    }

    return this.request<PaginatedResponse<Property>>(
      `/properties?${params.toString()}`
    )
  }

  async getPropertyBySlug(slug: string): Promise<ApiResponse<Property>> {
    return this.request<ApiResponse<Property>>(`/properties/${slug}`)
  }

  // Get property types from database
  async getPropertyTypes(): Promise<ApiResponse<Array<{ value: string; label: string; count: number }>>> {
    return this.request<ApiResponse<Array<{ value: string; label: string; count: number }>>>(`/properties/types`)
  }

  // Products API
  async getProducts(
    filters?: {
      location_types?: string[]
      has_rental?: boolean
      has_transfer?: boolean
      has_factory?: boolean
      province?: string
      district?: string
      rental_price_min?: number
      rental_price_max?: number
      transfer_price_min?: number
      transfer_price_max?: number
      available_area_min?: number
      available_area_max?: number
      q?: string
    },
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.has_rental !== undefined && { has_rental: filters.has_rental.toString() }),
      ...(filters?.has_transfer !== undefined && { has_transfer: filters.has_transfer.toString() }),
      ...(filters?.has_factory !== undefined && { has_factory: filters.has_factory.toString() }),
      ...(filters?.province && { province: filters.province }),
      ...(filters?.district && { district: filters.district }),
      ...(filters?.rental_price_min && { rental_price_min: filters.rental_price_min.toString() }),
      ...(filters?.rental_price_max && { rental_price_max: filters.rental_price_max.toString() }),
      ...(filters?.transfer_price_min && { transfer_price_min: filters.transfer_price_min.toString() }),
      ...(filters?.transfer_price_max && { transfer_price_max: filters.transfer_price_max.toString() }),
      ...(filters?.available_area_min && { available_area_min: filters.available_area_min.toString() }),
      ...(filters?.available_area_max && { available_area_max: filters.available_area_max.toString() }),
      ...(filters?.q && { q: filters.q }),
    })

    // Add location_types as array params
    if (filters?.location_types && filters.location_types.length > 0) {
      filters.location_types.forEach(locationType => {
        params.append('location_types', locationType)
      })
    }

    return this.request<PaginatedResponse<any>>(
      `/products?${params.toString()}`
    )
  }

  async getProductBySlug(slug: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/products/${slug}`)
  }

  // Industrial Parks API
  async getIndustrialParks(
    filters?: {
      scope?: 'trong-kcn' | 'ngoai-kcn'
      has_rental?: boolean
      has_transfer?: boolean
      has_factory?: boolean
      province?: string
    },
    page = 1,
    limit = 12
  ): Promise<PaginatedResponse<IndustrialPark>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.scope && { scope: filters.scope }),
      ...(filters?.has_rental !== undefined && { has_rental: filters.has_rental.toString() }),
      ...(filters?.has_transfer !== undefined && { has_transfer: filters.has_transfer.toString() }),
      ...(filters?.has_factory !== undefined && { has_factory: filters.has_factory.toString() }),
      ...(filters?.province && { province: filters.province }),
    })

    return this.request<PaginatedResponse<IndustrialPark>>(
      `/industrial-parks?${params.toString()}`
    )
  }

  async getIndustrialParkBySlug(slug: string): Promise<ApiResponse<IndustrialPark>> {
    return this.request<ApiResponse<IndustrialPark>>(`/industrial-parks/${slug}`)
  }

  // Helper methods for homepage sections - Now using products table
  async getPropertiesChuyenNhuongTrongKCN(limit = 6): Promise<IndustrialPark[]> {
    try {
      const response = await this.getProducts(
        {
          location_types: ['trong-kcn'],
          has_transfer: true,
        },
        1,
        limit
      )
      console.log('[API] Chuyen nhuong trong KCN response:', {
        total: response.data?.length || 0,
        data: response.data,
      })
      // Map products to IndustrialPark format
      return (response.data || []).map((product: any) => {
        // Extract infrastructure from JSONB if it exists
        const infrastructure = product.infrastructure || {}
        return {
          id: product.id,
          name: product.name || '',
          slug: product.slug || '',
          code: product.code || '',
          description: product.description || product.description_full || '',
          province: product.province || '',
          district: product.district || '',
          total_area: product.total_area || product.area || 0,
          available_area: product.available_area || 0,
          rental_price_min: product.rental_price_min || undefined,
          rental_price_max: product.rental_price_max || undefined,
          transfer_price_min: product.transfer_price_min || undefined,
          transfer_price_max: product.transfer_price_max || undefined,
          thumbnail_url: product.thumbnail_url || '',
          contact_phone: product.contact_phone || '',
          allowed_industries: product.allowed_industries || [],
          infrastructure_power: infrastructure.power || false,
          infrastructure_water: infrastructure.water || false,
          infrastructure_drainage: infrastructure.drainage || false,
          infrastructure_waste: infrastructure.waste || false,
          infrastructure_internet: infrastructure.internet || false,
          infrastructure_road: infrastructure.road || false,
          infrastructure_security: infrastructure.security || false,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
        }
      })
    } catch (error) {
      console.error('Error fetching chuyen nhuong trong KCN:', error)
      return []
    }
  }

  async getPropertiesChuyenNhuongNgoaiKCN(limit = 6): Promise<IndustrialPark[]> {
    try {
      const response = await this.getProducts(
        {
          location_types: ['ngoai-kcn', 'ngoai-kcn-ccn'],
          has_transfer: true,
        },
        1,
        limit
      )
      console.log('[API] Chuyen nhuong ngoai KCN response:', {
        total: response.data?.length || 0,
        data: response.data,
      })
      // Map products to IndustrialPark format
      return (response.data || []).map((product: any) => {
        // Extract infrastructure from JSONB if it exists
        const infrastructure = product.infrastructure || {}
        return {
          id: product.id,
          name: product.name || '',
          slug: product.slug || '',
          code: product.code || '',
          description: product.description || product.description_full || '',
          province: product.province || '',
          district: product.district || '',
          total_area: product.total_area || product.area || 0,
          available_area: product.available_area || 0,
          rental_price_min: product.rental_price_min || undefined,
          rental_price_max: product.rental_price_max || undefined,
          transfer_price_min: product.transfer_price_min || undefined,
          transfer_price_max: product.transfer_price_max || undefined,
          thumbnail_url: product.thumbnail_url || '',
          contact_phone: product.contact_phone || '',
          allowed_industries: product.allowed_industries || [],
          infrastructure_power: infrastructure.power || false,
          infrastructure_water: infrastructure.water || false,
          infrastructure_drainage: infrastructure.drainage || false,
          infrastructure_waste: infrastructure.waste || false,
          infrastructure_internet: infrastructure.internet || false,
          infrastructure_road: infrastructure.road || false,
          infrastructure_security: infrastructure.security || false,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
        }
      })
    } catch (error) {
      console.error('Error fetching chuyen nhuong ngoai KCN:', error)
      return []
    }
  }

  async getPropertiesChoThue(limit = 6): Promise<IndustrialPark[]> {
    try {
      const response = await this.getProducts(
        {
          has_rental: true,
        },
        1,
        limit
      )
      console.log('[API] Cho thue response:', {
        total: response.data?.length || 0,
        data: response.data,
      })
      // Map products to IndustrialPark format
      return (response.data || []).map((product: any) => {
        // Extract infrastructure from JSONB if it exists
        const infrastructure = product.infrastructure || {}
        return {
          id: product.id,
          name: product.name || '',
          slug: product.slug || '',
          code: product.code || '',
          description: product.description || product.description_full || '',
          province: product.province || '',
          district: product.district || '',
          total_area: product.total_area || product.area || 0,
          available_area: product.available_area || 0,
          rental_price_min: product.rental_price_min || undefined,
          rental_price_max: product.rental_price_max || undefined,
          transfer_price_min: product.transfer_price_min || undefined,
          transfer_price_max: product.transfer_price_max || undefined,
          thumbnail_url: product.thumbnail_url || '',
          contact_phone: product.contact_phone || '',
          allowed_industries: product.allowed_industries || [],
          infrastructure_power: infrastructure.power || false,
          infrastructure_water: infrastructure.water || false,
          infrastructure_drainage: infrastructure.drainage || false,
          infrastructure_waste: infrastructure.waste || false,
          infrastructure_internet: infrastructure.internet || false,
          infrastructure_road: infrastructure.road || false,
          infrastructure_security: infrastructure.security || false,
          created_at: product.created_at || new Date().toISOString(),
          updated_at: product.updated_at || new Date().toISOString(),
        }
      })
    } catch (error) {
      console.error('Error fetching cho thue:', error)
      return []
    }
  }

  // Settings
  async getSettings(): Promise<ApiResponse<any[]>> {
    return this.request<ApiResponse<any[]>>('/settings')
  }

  async getSettingByNamespace(namespace: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(`/settings/${namespace}`)
  }

  // Lookup APIs
  async getLocationTypes(): Promise<ApiResponse<Array<{ code: string; label: string; name_vi: string; name_en: string; display_order: number }>>> {
    return this.request<ApiResponse<Array<{ code: string; label: string; name_vi: string; name_en: string; display_order: number }>>>(`/lookup/location-types`)
  }
}

export const api = new ApiClient(API_URL)

/**
 * Resolve asset URL from path/ID
 * If path is already a full URL (http/https), return as is
 * Otherwise, prepend backend URL
 * 
 * Handles different formats:
 * - Full URL: http://localhost:4001/uploads/5/filename.webp -> return as is
 * - Relative path: /uploads/5/filename.webp -> prepend backend URL
 * - ID only: /5 or 5 -> convert to /uploads/5/ (will need filename from asset)
 * 
 * Note: For ID-only paths, we assume the asset is served from /uploads/{id}/
 * The actual filename will be determined by the backend when serving the file.
 */
export const getAssetUrl = (path: string | null | undefined): string => {
  if (!path) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAssetUrl] Empty path provided')
    }
    return '';
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[getAssetUrl] Input path:', path)
  }
  
  // Normalize path: convert backslashes to forward slashes (Windows path to URL)
  let normalizedPath = path.replace(/\\/g, '/');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[getAssetUrl] Normalized path:', normalizedPath)
  }
  
  // If path already has protocol, normalize and return as is
  if (normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAssetUrl] Already full URL, returning:', normalizedPath)
    }
    return normalizedPath;
  }
  
  // If path starts with /uploads/, prepend backend URL
  if (normalizedPath.startsWith('/uploads/')) {
    const result = `${BACKEND_URL}${normalizedPath}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[getAssetUrl] Path starts with /uploads/, result:', result)
    }
    return result;
  }
  
  // If path is a UUID (with or without dashes), convert to /uploads/{uuid}/
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const uuidWithoutDashes = /^[0-9a-f]{32}$/i;
  if (normalizedPath.startsWith('/') && uuidPattern.test(normalizedPath.substring(1))) {
    // Path is like /abc-123-def-456-ghi, convert to /uploads/abc-123-def-456-ghi/
    return `${BACKEND_URL}/uploads${normalizedPath}/`;
  }
  if (uuidPattern.test(normalizedPath) || uuidWithoutDashes.test(normalizedPath)) {
    // Path is just a UUID like "abc-123-def-456-ghi", convert to /uploads/{uuid}/
    return `${BACKEND_URL}/uploads/${normalizedPath}/`;
  }
  
  // If path is just an ID (e.g., /5 or 5), convert to /uploads/{id}/
  // Note: This assumes the backend can serve the file from this path
  // The actual filename will be determined by the backend
  if (normalizedPath.startsWith('/') && /^\/\d+$/.test(normalizedPath)) {
    // Path is like /5, convert to /uploads/5/
    return `${BACKEND_URL}${normalizedPath.replace(/^\/(\d+)$/, '/uploads/$1/')}`;
  }
  if (/^\d+$/.test(normalizedPath)) {
    // Path is just an ID like "5", convert to /uploads/5/
    return `${BACKEND_URL}/uploads/${normalizedPath}/`;
  }
  
  // If path looks like a date-based path (e.g., 2025-12-24/uuid/filename.webp)
  // or already contains uploads structure, prepend /uploads/ if needed
  if (normalizedPath.match(/^\d{4}-\d{2}-\d{2}/) || normalizedPath.includes('/')) {
    // If it doesn't start with /uploads/, add it
    if (!normalizedPath.startsWith('/uploads/')) {
      normalizedPath = normalizedPath.startsWith('/') 
        ? `/uploads${normalizedPath}` 
        : `/uploads/${normalizedPath}`;
    }
    return `${BACKEND_URL}${normalizedPath}`;
  }
  
  // If path starts with /, prepend backend URL
  if (normalizedPath.startsWith('/')) {
    return `${BACKEND_URL}${normalizedPath}`;
  }
  
  // Otherwise, prepend backend URL with /uploads/
  return `${BACKEND_URL}/uploads/${normalizedPath}`;
}
