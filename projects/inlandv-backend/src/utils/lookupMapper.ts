import { query } from '../database/db'

// Cache để tránh query nhiều lần
let lookupCache: {
  productTypes?: Map<string, string>
  transactionTypes?: Map<string, string>
  locationTypes?: Map<string, string>
  industries?: Map<string, string>
  cacheTime?: number
} = {}

const CACHE_DURATION = 5 * 60 * 1000 // 5 phút

// Load lookup data từ database
async function loadLookupData() {
  const now = Date.now()
  
  // Kiểm tra cache
  if (lookupCache.cacheTime && (now - lookupCache.cacheTime) < CACHE_DURATION) {
    return lookupCache
  }

  try {
    // Load product types
    const productTypesResult = await query(
      `SELECT code, name_vi FROM product_types WHERE is_active = true`
    )
    lookupCache.productTypes = new Map()
    productTypesResult.rows.forEach((row: any) => {
      lookupCache.productTypes!.set(row.code, row.name_vi)
    })

    // Load transaction types
    const transactionTypesResult = await query(
      `SELECT code, name_vi FROM transaction_types WHERE is_active = true`
    )
    lookupCache.transactionTypes = new Map()
    transactionTypesResult.rows.forEach((row: any) => {
      lookupCache.transactionTypes!.set(row.code, row.name_vi)
    })

    // Load location types
    const locationTypesResult = await query(
      `SELECT code, name_vi FROM location_types WHERE is_active = true`
    )
    lookupCache.locationTypes = new Map()
    locationTypesResult.rows.forEach((row: any) => {
      lookupCache.locationTypes!.set(row.code, row.name_vi)
    })

    // Load industries
    const industriesResult = await query(
      `SELECT code, name_vi FROM industries`
    )
    lookupCache.industries = new Map()
    industriesResult.rows.forEach((row: any) => {
      lookupCache.industries!.set(row.code, row.name_vi)
    })

    lookupCache.cacheTime = now
  } catch (error) {
    console.error('Error loading lookup data:', error)
    // Fallback to default mappings nếu không query được
    lookupCache.productTypes = new Map([
      ['dat', 'Đất'],
      ['nha-xuong', 'Nhà xưởng'],
      ['dat-co-nha-xuong', 'Đất có nhà xưởng'],
    ])
    lookupCache.transactionTypes = new Map([
      ['chuyen-nhuong', 'Chuyển nhượng'],
      ['cho-thue', 'Cho thuê'],
    ])
    lookupCache.locationTypes = new Map([
      ['trong-kcn', 'Trong KCN'],
      ['ngoai-kcn', 'Ngoài KCN'],
      ['trong-ccn', 'Trong CCN'],
      ['ngoai-ccn', 'Ngoài CCN'],
      ['ngoai-kcn-ccn', 'Ngoài KCN / CCN'],
    ])
    lookupCache.industries = new Map()
  }

  return lookupCache
}

// Map array of codes to array of objects with code and name_vi
export async function mapCodesToVietnamese(
  codes: string[] | null | undefined,
  type: 'product_types' | 'transaction_types' | 'location_types' | 'industries'
): Promise<Array<{ code: string; name_vi: string }>> {
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return []
  }

  const lookup = await loadLookupData()
  let map: Map<string, string> | undefined

  switch (type) {
    case 'product_types':
      map = lookup.productTypes
      break
    case 'transaction_types':
      map = lookup.transactionTypes
      break
    case 'location_types':
      map = lookup.locationTypes
      break
    case 'industries':
      map = lookup.industries
      break
  }

  if (!map) {
    return codes.map(code => ({ code, name_vi: code }))
  }

  return codes
    .filter(code => code && typeof code === 'string')
    .map(code => ({
      code,
      name_vi: map!.get(code) || code, // Fallback to code nếu không tìm thấy
    }))
}

// Map province code to province name
// Using a simple lookup table for common provinces
const PROVINCE_CODE_TO_NAME: Record<string, string> = {
  '1': 'Hà Nội',
  '2': 'Hà Giang',
  '4': 'Cao Bằng',
  '6': 'Bắc Kạn',
  '8': 'Tuyên Quang',
  '10': 'Lào Cai',
  '11': 'Điện Biên',
  '12': 'Lai Châu',
  '14': 'Sơn La',
  '15': 'Yên Bái',
  '17': 'Hoà Bình',
  '19': 'Thái Nguyên',
  '20': 'Lạng Sơn',
  '22': 'Quảng Ninh',
  '24': 'Bắc Giang',
  '25': 'Phú Thọ',
  '26': 'Vĩnh Phúc',
  '27': 'Bắc Ninh',
  '30': 'Hải Dương',
  '31': 'Hải Phòng',
  '33': 'Hưng Yên',
  '34': 'Thái Bình',
  '35': 'Hà Nam',
  '36': 'Nam Định',
  '37': 'Ninh Bình',
  '38': 'Thanh Hóa',
  '40': 'Nghệ An',
  '42': 'Hà Tĩnh',
  '44': 'Quảng Bình',
  '45': 'Quảng Trị',
  '46': 'Thừa Thiên Huế',
  '48': 'Đà Nẵng',
  '49': 'Quảng Nam',
  '51': 'Quảng Ngãi',
  '52': 'Bình Định',
  '54': 'Phú Yên',
  '56': 'Khánh Hòa',
  '58': 'Ninh Thuận',
  '60': 'Bình Thuận',
  '62': 'Kon Tum',
  '64': 'Gia Lai',
  '66': 'Đắk Lắk',
  '67': 'Đắk Nông',
  '68': 'Lâm Đồng',
  '70': 'Bình Phước',
  '72': 'Tây Ninh',
  '74': 'Bình Dương',
  '75': 'Đồng Nai',
  '77': 'Bà Rịa - Vũng Tàu',
  '79': 'Hồ Chí Minh',
  '80': 'Long An',
  '82': 'Tiền Giang',
  '83': 'Bến Tre',
  '84': 'Trà Vinh',
  '86': 'Vĩnh Long',
  '87': 'Đồng Tháp',
  '89': 'An Giang',
  '91': 'Kiên Giang',
  '92': 'Cần Thơ',
  '93': 'Hậu Giang',
  '94': 'Sóc Trăng',
  '95': 'Bạc Liêu',
  '96': 'Cà Mau',
}

// Helper function to map province code to name
function mapProvinceCodeToName(province: string | null | undefined): string {
  if (!province) return ''
  
  const trimmed = String(province).trim()
  
  // If it's already a name (contains non-digit characters), return as is
  if (/[^\d]/.test(trimmed)) {
    return trimmed
  }
  
  // If it's a code (only digits), map to name
  if (/^\d+$/.test(trimmed)) {
    return PROVINCE_CODE_TO_NAME[trimmed] || trimmed
  }
  
  return trimmed
}

// Enrich product data với tiếng Việt
export async function enrichProductWithVietnamese(product: any): Promise<any> {
  const enriched = { ...product }

  // Map province code to name
  if (product.province) {
    enriched.province = mapProvinceCodeToName(product.province)
  }

  // Map product_types
  if (product.product_types) {
    enriched.product_types_vi = await mapCodesToVietnamese(
      product.product_types,
      'product_types'
    )
  }

  // Map transaction_types
  if (product.transaction_types) {
    enriched.transaction_types_vi = await mapCodesToVietnamese(
      product.transaction_types,
      'transaction_types'
    )
  }

  // Map location_types
  if (product.location_types) {
    enriched.location_types_vi = await mapCodesToVietnamese(
      product.location_types,
      'location_types'
    )
  }

  // Map allowed_industries (nếu là mã, không phải tiếng Việt)
  if (product.allowed_industries) {
    // Kiểm tra xem có phải là mã hay đã là tiếng Việt
    const firstIndustry = Array.isArray(product.allowed_industries) 
      ? product.allowed_industries[0] 
      : null
    
    // Nếu là mã (có dấu gạch ngang hoặc không có dấu tiếng Việt), thì map
    if (firstIndustry && typeof firstIndustry === 'string' && /^[a-z0-9-]+$/i.test(firstIndustry)) {
      enriched.allowed_industries_vi = await mapCodesToVietnamese(
        product.allowed_industries,
        'industries'
      )
    } else {
      // Đã là tiếng Việt rồi, giữ nguyên
      enriched.allowed_industries_vi = Array.isArray(product.allowed_industries)
        ? product.allowed_industries.map((name: string) => ({ code: name, name_vi: name }))
        : []
    }
  }

  return enriched
}

// Enrich array of products
export async function enrichProductsWithVietnamese(products: any[]): Promise<any[]> {
  return Promise.all(products.map(product => enrichProductWithVietnamese(product)))
}




