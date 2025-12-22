// Shared TypeScript types for all projects

// Project types
export interface Project {
  id: string
  title: string
  slug: string
  description: string
  location: string
  price_min: number
  price_max: number
  area_min: number
  area_max: number
  status: 'dang-mo-ban' | 'sap-mo-ban' | 'da-ban'
  thumbnail_url: string
  gallery: string[]
  created_at: string
  updated_at: string
}

// Listing types
export interface Listing {
  id: string
  project_id: string
  type: 'can-ho' | 'nha-pho' | 'dat-nen' | 'biet-thu' | 'shophouse'
  price: number
  area: number
  bedrooms: number
  bathrooms: number
  thumbnail_url: string
  gallery: string[]
  description: string
  created_at: string
}

// Post types
export interface Post {
  id: string
  title: string
  slug: string
  category: string
  thumbnail_url: string
  content: string
  excerpt?: string
  created_at: string
}

// Lead types
export interface Lead {
  id?: string
  name: string
  phone: string
  email: string
  message: string
  source: 'homepage' | 'project' | 'contact'
  created_at?: string
}

// Job types
export interface Job {
  id: string
  title: string
  slug: string
  location: string
  salary_range: string
  description: string
  requirements: string
  created_at: string
}

// User types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'sale'
  created_at: string
}

// Filter types
export interface ProjectFilter {
  location?: string
  price_min?: number
  price_max?: number
  status?: string
  type?: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

