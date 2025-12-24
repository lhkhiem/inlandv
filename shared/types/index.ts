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

// ============================================
// CMS Types - From migration 044_cms_integration
// ============================================

// Settings
export interface Setting {
  id: string
  namespace: 'general' | 'seo' | 'appearance' | 'security' | 'advanced' | 'email' | 'social'
  value: Record<string, any>
  updated_at: string
}

// Menu System
export interface MenuLocation {
  id: string
  name: string
  slug: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  menu_location_id: string
  parent_id?: string
  title: string
  url?: string
  icon?: string
  type: 'custom' | 'property' | 'industrial_park' | 'news' | 'insight' | 'case_study' | 'page'
  entity_id?: string
  target: '_self' | '_blank'
  rel?: string
  css_classes?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  children?: MenuItem[]
}

// Page Metadata
export interface PageMetadata {
  id: string
  path: string
  title?: string
  description?: string
  og_image?: string
  keywords?: string[]
  enabled: boolean
  auto_generated: boolean
  created_at: string
  updated_at: string
}

// Activity Logs
export interface ActivityLog {
  id: string
  user_id?: string
  action: string
  entity_type: string
  entity_id?: string
  entity_name?: string
  description?: string
  metadata?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Media Management
export interface AssetFolder {
  id: string
  name: string
  parent_id?: string
  path?: string
  created_at: string
  updated_at: string
}

export interface Asset {
  id: string
  folder_id?: string
  type: 'image' | 'video' | 'document' | 'audio' | 'other'
  provider: 'local' | 's3' | 'cloudinary' | 'cdn'
  url: string
  cdn_url?: string
  filename?: string
  mime_type?: string
  file_size?: number
  width?: number
  height?: number
  format?: string
  sizes?: Record<string, string>
  alt_text?: string
  caption?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

// FAQ
export interface FAQCategory {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FAQQuestion {
  id: string
  category_id: string
  question: string
  answer: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Tracking Scripts
export interface TrackingScript {
  id: string
  name: string
  type: 'analytics' | 'pixel' | 'custom' | 'tag-manager' | 'heatmap' | 'live-chat'
  provider?: string
  position: 'head' | 'body'
  script_code: string
  is_active: boolean
  load_strategy: 'sync' | 'async' | 'defer'
  pages: string[] | ['all']
  priority: number
  description?: string
  created_at: string
  updated_at: string
}

// Newsletter Subscriptions
export interface NewsletterSubscription {
  id: string
  email: string
  status: 'active' | 'unsubscribed' | 'bounced'
  subscribed_at: string
  unsubscribed_at?: string
  source?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
}

// Property types (for properties table - schema-v2)
export interface Property {
  id: string
  code: string
  name: string
  slug: string
  
  // Phân loại
  main_category: 'kcn' | 'bds'
  sub_category?: 'trong-kcn' | 'ngoai-kcn'
  property_type: string
  transaction_type: 'chuyen-nhuong' | 'cho-thue'
  status: 'available' | 'sold' | 'rented' | 'reserved'
  
  // Reference to Industrial Park
  industrial_park_id?: string
  
  // Location
  province: string
  district?: string
  ward?: string
  address?: string
  latitude?: number
  longitude?: number
  google_maps_link?: string
  
  // Diện tích
  total_area: number
  area_unit?: 'm2' | 'ha'
  land_area?: number
  construction_area?: number
  
  // Giá cả
  price: number
  price_unit?: string
  price_per_sqm?: number
  price_range_min?: number
  price_range_max?: number
  negotiable?: boolean
  
  // Pháp lý
  legal_status?: string
  
  // Mô tả
  description?: string
  description_full?: string
  
  // Media
  thumbnail_url?: string
  video_url?: string
  
  // Contact
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  published_at?: string
}

// Property Filter types
export interface PropertyFilter {
  main_category?: 'kcn' | 'bds'
  sub_category?: 'trong-kcn' | 'ngoai-kcn'
  property_type?: string
  transaction_type?: 'chuyen-nhuong' | 'cho-thue'
  status?: 'available' | 'sold' | 'rented' | 'reserved'
  province?: string
  price_min?: number
  price_max?: number
  area_min?: number
  area_max?: number
}

