// Mapping từ mã sang tiếng Việt cho các lookup types

// Location types mapping
export const locationTypesMap: Record<string, string> = {
  'trong-kcn': 'Trong KCN',
  'ngoai-kcn': 'Ngoài KCN',
  'trong-ccn': 'Trong CCN',
  'ngoai-ccn': 'Ngoài CCN',
  'ngoai-kcn-ccn': 'Ngoài KCN / CCN',
  // Fallback cho các giá trị đã là tiếng Việt
  'Trong KCN': 'Trong KCN',
  'Ngoài KCN': 'Ngoài KCN',
  'Trong CCN': 'Trong CCN',
  'Ngoài CCN': 'Ngoài CCN',
  'Ngoài KCN / CCN': 'Ngoài KCN / CCN',
};

// Product types mapping
export const productTypesMap: Record<string, string> = {
  'dat': 'Đất',
  'nha-xuong': 'Nhà xưởng',
  'dat-co-nha-xuong': 'Đất có nhà xưởng',
};

// Transaction types mapping
export const transactionTypesMap: Record<string, string> = {
  'chuyen-nhuong': 'Chuyển nhượng',
  'cho-thue': 'Cho thuê',
};

/**
 * Map location type code to Vietnamese name
 */
export function getLocationTypeLabel(code: string): string {
  return locationTypesMap[code] || code;
}

/**
 * Map product type code to Vietnamese name
 */
export function getProductTypeLabel(code: string): string {
  return productTypesMap[code] || code;
}

/**
 * Map transaction type code to Vietnamese name
 */
export function getTransactionTypeLabel(code: string): string {
  return transactionTypesMap[code] || code;
}

/**
 * Map array of location type codes to Vietnamese labels
 */
export function mapLocationTypes(codes: string[] | null | undefined): string[] {
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return [];
  }
  return codes.map(code => getLocationTypeLabel(code));
}

/**
 * Map array of product type codes to Vietnamese labels
 */
export function mapProductTypes(codes: string[] | null | undefined): string[] {
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return [];
  }
  return codes.map(code => getProductTypeLabel(code));
}

/**
 * Map array of transaction type codes to Vietnamese labels
 */
export function mapTransactionTypes(codes: string[] | null | undefined): string[] {
  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    return [];
  }
  return codes.map(code => getTransactionTypeLabel(code));
}












