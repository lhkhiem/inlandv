// Project types (Dự án bất động sản)
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
  status: 'dang-mo-ban' | 'sap-mo-ban' | 'da-ban-het'
  thumbnail_url?: string
  gallery?: string[]
  created_at: string
  updated_at: string
}

// Property types (Bất động sản) - Compatible with both schema v2 and migration 047
export interface Property {
  id: string
  code: string                                  // Mã sản phẩm
  name: string
  slug: string
  
  // Phân loại (Schema v2 - optional, may not exist in actual DB)
  main_category?: 'kcn' | 'bds'
  sub_category?: 'trong-kcn' | 'ngoai-kcn'
  property_type?: string                         // 'dat-trong-kcn', 'dat-co-nha-xuong-trong-kcn', 'nha-pho', etc.
  transaction_type?: 'chuyen-nhuong' | 'cho-thue'
  
  // Schema migration 047 (actual schema)
  type?: string                                  // 'nha-pho', 'can-ho', 'dat-nen', 'biet-thu', 'shophouse', 'nha-xuong'
  category?: string
  has_rental?: boolean
  has_transfer?: boolean
  
  status: 'available' | 'sold' | 'rented' | 'reserved'
  
  // Reference to Industrial Park
  industrial_park_id?: string
  
  // Location
  province: string
  district?: string                              // May not exist in migration 047
  ward?: string                                  // Exists in migration 047
  address?: string
  latitude?: number
  longitude?: number
  google_maps_link?: string
  
  // Dimensions (Schema v2)
  total_area?: number                            // Diện tích tổng (Schema v2)
  area_unit?: 'm2' | 'ha'
  land_area?: number
  construction_area?: number
  
  // Legacy fields (for backward compatibility)
  area?: number                                  // Migration 047 uses 'area' instead of 'total_area'
  width?: number                                // Mặt tiền
  length?: number
  
  // Structure (for residential properties)
  bedrooms?: number
  bathrooms?: number
  floors?: number
  orientation?: string                          // Hướng nhà
  
  // Pricing (Schema v2)
  price?: number                                 // Giá tổng (chuyen-nhuong) hoặc giá/tháng (cho-thue) - may not exist
  price_unit?: string                           // 'vnd' | 'usd'
  price_per_sqm?: number
  price_range_min?: number
  price_range_max?: number
  negotiable?: boolean
  
  // Pricing (Migration 047 - actual schema)
  sale_price?: number                            // Giá bán/chuyển nhượng
  sale_price_min?: number
  sale_price_max?: number
  sale_price_per_sqm?: number
  rental_price?: number                          // Giá thuê
  rental_price_min?: number
  rental_price_max?: number
  rental_price_per_sqm?: number
  
  // Pháp lý
  legal_status?: string
  
  // Features
  furniture?: 'full' | 'basic' | 'empty'        // Nội thất
  description?: string
  description_full?: string
  
  // Media
  thumbnail_url?: string
  video_url?: string
  images?: PropertyImage[]
  amenities?: string[]                          // Tiện ích
  documents?: PropertyDocument[]
  
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

export interface PropertyImage {
  id: string
  property_id: string
  url: string
  caption?: string
  display_order: number
  created_at: string
}

export interface PropertyDocument {
  id: string
  property_id: string
  name: string
  type: string
  url: string
  file_size?: number
  created_at: string
}

// Industrial Park types (Khu công nghiệp) - Schema from migration 046
export interface IndustrialPark {
  id: string
  code: string
  name: string
  slug: string
  
  // Phân loại
  scope: 'trong-kcn' | 'ngoai-kcn'              // Phạm vi
  has_rental: boolean                           // Có dịch vụ cho thuê
  has_transfer: boolean                          // Có dịch vụ chuyển nhượng
  
  // Location
  province: string
  ward?: string                                  // Phường/Xã
  address?: string
  latitude?: number
  longitude?: number
  google_maps_link?: string
  
  // Diện tích
  total_area: number                             // Tổng diện tích (ha)
  available_area?: number                       // Diện tích còn trống (ha)
  
  // Giá cho thuê (nếu has_rental = true)
  rental_price_min?: number                     // Giá thuê tối thiểu (VND/m²/tháng)
  rental_price_max?: number                     // Giá thuê tối đa (VND/m²/tháng)
  
  // Giá chuyển nhượng (nếu has_transfer = true)
  transfer_price_min?: number                   // Giá chuyển nhượng tối thiểu (tỷ VND)
  transfer_price_max?: number                   // Giá chuyển nhượng tối đa (tỷ VND)
  
  // Hạ tầng (JSONB)
  infrastructure?: Record<string, any>          // {"power": true, "water": true, ...}
  
  // Ngành nghề
  allowed_industries?: string[]                 // Array ngành nghề
  
  // Features
  description?: string
  description_full?: string
  
  // Media
  thumbnail_url?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  published_at?: string
  
  // Legacy fields (for backward compatibility)
  district?: string
  occupancy_rate?: number
  land_price?: number                           // Alias for transfer_price_min
  advantages?: string
  video_url?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  website_url?: string
  meta_keywords?: string
  images?: IndustrialParkImage[]
  tenants?: IndustrialParkTenant[]
}

export interface IndustrialParkImage {
  id: string
  park_id: string
  url: string
  caption?: string
  display_order: number
  created_at: string
}

export interface IndustrialParkTenant {
  id: string
  park_id: string
  company_name: string
  industry?: string
  logo_url?: string
  website?: string
  created_at: string
}

// Listing types (Tin đăng)
export interface Listing {
  id: string
  property_id?: string
  industrial_park_id?: string
  title: string
  slug: string
  description?: string
  price?: number
  status: 'available' | 'sold' | 'reserved'
  created_at: string
  updated_at: string
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
  source: 'homepage' | 'property' | 'industrial_park' | 'contact'
  reference_id?: string                         // ID của property hoặc park
  reference_type?: 'property' | 'industrial_park'
  status?: 'new' | 'contacted' | 'qualified' | 'closed'
  created_at?: string
  updated_at?: string
}

// Filter types for Projects (Dự án)
export interface ProjectFilter {
  q?: string                                    // Tìm kiếm
  status?: string                               // Trạng thái: 'dang-mo-ban' | 'sap-mo-ban' | 'da-ban-het'
  location?: string                             // Địa điểm
  price_min?: number
  price_max?: number
  area_min?: number
  area_max?: number
  page?: number
  limit?: number
  sort?: 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'newest'
}

// Filter types for Properties (BĐS) - Schema v2 compatible
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
  // Legacy fields
  q?: string                                    // Tìm kiếm
  demand?: string                               // Nhu cầu: 'rent' | 'buy'
  type?: string                                 // Loại hình (alias for property_type)
  district?: string
  ward?: string
  legal_status?: string                         // Pháp lý
  bedrooms?: number
  orientation?: string                          // Hướng
  furniture?: string                            // Nội thất
  amenities?: string[]                          // Tiện ích
  page?: number
  limit?: number
  sort?: 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc' | 'newest'
}

// Filter types for Industrial Parks (KCN)
export interface IndustrialParkFilter {
  q?: string
  demand?: string                               // Nhu cầu: 'rent' | 'buy'
  province?: string
  district?: string
  rental_price_min?: number
  rental_price_max?: number
  available_area_min?: number                   // Diện tích còn trống tối thiểu
  available_area_max?: number                   // Diện tích còn trống tối đa
  industries?: string[]                         // Ngành nghề
  infrastructure?: string[]                     // Hạ tầng: ['power', 'water', 'internet']
  scope?: string                                // Phạm vi: 'trong-kcn' | 'trong-ccn' | 'ngoai-kcn' | 'ngoai-kcn-ccn'
  nx?: string                                   // Nhà xưởng: 'co' | 'khong'
  type?: string                                 // Loại: 'cho-thue' | 'chuyen-nhuong'
  category?: string                             // Danh mục: 'nha-xuong' | 'dat'
  page?: number
  limit?: number
  sort?: 'price-asc' | 'price-desc' | 'area-desc' | 'newest'
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

export interface SectionData {
  id: string;
  index: number;
  title: string;
  backgroundType?: 'image' | 'light';
}

// Detail discriminated union for shared layout
export type DetailEntity =
  | { kind: 'property'; item: Property }
  | { kind: 'industrialPark'; item: IndustrialPark };

export interface SimilarItemCardData {
  id: string;
  slug: string;
  name: string;
  thumbnail_url?: string;
  area?: number; // For property
  total_area?: number; // For industrial park
  price?: number; // For property
  rental_price_min?: number; // For industrial park
  rental_price_max?: number; // For industrial park
  province?: string;
}

// Page types (CMS Pages)
export interface Page {
  id: string;
  slug: string;
  title: string;
  page_type: 'static' | 'homepage';
  published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  sections?: PageSection[];
}

export interface PageSection {
  id: string;
  page_id: string;
  section_key: string;
  name: string;
  section_type: 'hero' | 'content' | 'team' | 'clients' | 'service' | 'form' | 'info';
  display_order: number;
  content?: string; // HTML or JSON string for structured data
  images?: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}
