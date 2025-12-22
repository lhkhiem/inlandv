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

// Property types (Bất động sản)
export interface Property {
  id: string
  code: string                                  // Mã sản phẩm
  name: string
  slug: string
  
  // Location
  province: string
  district?: string
  ward?: string
  street?: string
  address?: string
  latitude?: number
  longitude?: number
  
  // Property details
  type: 'nha-pho' | 'can-ho' | 'dat-nen' | 'biet-thu' | 'shophouse' | 'nha-xuong'
  category?: string
  status: 'available' | 'sold' | 'reserved'
  legal_status?: string                         // Pháp lý
  
  // Dimensions
  area: number                                  // Diện tích (m²)
  land_area?: number
  construction_area?: number
  width?: number                                // Mặt tiền
  length?: number
  
  // Structure
  bedrooms?: number
  bathrooms?: number
  floors?: number
  orientation?: string                          // Hướng nhà
  
  // Pricing
  price: number
  price_per_sqm?: number
  negotiable?: boolean
  
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

// Industrial Park types (Khu công nghiệp)
export interface IndustrialPark {
  id: string
  code: string
  name: string
  slug: string
  
  // Location
  province: string
  district?: string
  address?: string
  latitude?: number
  longitude?: number
  
  // Park details
  total_area: number                            // Tổng diện tích (ha)
  available_area?: number                       // Diện tích còn trống
  occupancy_rate?: number                       // Tỷ lệ lấp đầy (%)
  
  // Infrastructure
  infrastructure_power?: boolean
  infrastructure_water?: boolean
  infrastructure_drainage?: boolean
  infrastructure_waste?: boolean
  infrastructure_internet?: boolean
  infrastructure_road?: boolean
  infrastructure_security?: boolean
  
  // Pricing
  rental_price_min?: number                     // Giá thuê từ (VND/m²/tháng)
  rental_price_max?: number
  land_price?: number
  
  // Industries allowed
  allowed_industries?: string[]                 // Ngành nghề được phép
  
  // Features
  description?: string
  description_full?: string
  advantages?: string
  
  // Media
  thumbnail_url?: string
  video_url?: string
  images?: IndustrialParkImage[]
  tenants?: IndustrialParkTenant[]              // Doanh nghiệp
  
  // Contact
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  website_url?: string
  
  // SEO
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  published_at?: string
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

// Filter types for Properties (BĐS)
export interface PropertyFilter {
  q?: string                                    // Tìm kiếm
  demand?: string                               // Nhu cầu: 'rent' | 'buy'
  type?: string                                 // Loại hình
  province?: string
  district?: string
  ward?: string
  price_min?: number
  price_max?: number
  area_min?: number
  area_max?: number
  status?: string                               // Tình trạng
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
