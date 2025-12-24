// Service for provinces.open-api.vn API v2 (2025 - After administrative merge)
// API documentation: https://provinces.open-api.vn/
// OpenAPI spec: /api/v2

const API_BASE_URL = 'https://provinces.open-api.vn/api/v2';

export interface Province {
  code: number; // Changed from string to number
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface Ward {
  code: number; // Changed from string to number
  name: string;
  division_type: string;
  codename: string;
  province_code: number;
}

// Cache for API responses
const cache: {
  provinces?: Province[];
  wards: Record<number, Ward[]>; // Changed key from string to number
} = {
  wards: {},
};

// Get all provinces
export const getProvinces = async (): Promise<Province[]> => {
  if (cache.provinces) {
    return cache.provinces;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/p/`);
    if (!response.ok) {
      throw new Error('Failed to fetch provinces');
    }
    const data = await response.json();
    
    // Transform API response to our format
    const provinces: Province[] = data.map((item: any) => ({
      code: item.code,
      name: item.name,
      division_type: item.division_type,
      codename: item.codename,
      phone_code: item.phone_code,
    }));

    cache.provinces = provinces;
    return provinces;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error;
  }
};

// Get wards (phường/xã) by province code (directly from province, no districts)
export const getWardsByProvince = async (provinceCode: number): Promise<Ward[]> => {
  if (cache.wards[provinceCode]) {
    return cache.wards[provinceCode];
  }

  try {
    // Try method 1: Get province with depth=2 to include wards
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract wards from the response (wards are directly in province response)
        const wards: Ward[] = (data.wards || []).map((item: any) => ({
          code: item.code,
          name: item.name,
          division_type: item.division_type,
          codename: item.codename,
          province_code: item.province_code || provinceCode,
        }));

        if (wards.length > 0) {
          cache.wards[provinceCode] = wards;
          return wards;
        }
      } else {
        console.warn(`Method 1 returned status ${response.status} for province ${provinceCode}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`Method 1 timeout for province ${provinceCode}`);
      } else {
        console.warn(`Method 1 failed for province ${provinceCode}, trying fallback...`, err);
      }
    }

    // Fallback method 2: Get wards using /w/ endpoint with province filter
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/w/?province=${provinceCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        // Transform API response to our format
        const wards: Ward[] = (Array.isArray(data) ? data : []).map((item: any) => ({
          code: item.code,
          name: item.name,
          division_type: item.division_type,
          codename: item.codename,
          province_code: item.province_code || provinceCode,
        }));

        if (wards.length > 0) {
          cache.wards[provinceCode] = wards;
          return wards;
        }
      } else {
        console.warn(`Method 2 returned status ${response.status} for province ${provinceCode}`);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`Method 2 timeout for province ${provinceCode}`);
      } else {
        console.warn(`Method 2 failed for province ${provinceCode}`, err);
      }
    }

    // If both methods fail, return empty array
    console.warn(`Could not fetch wards for province ${provinceCode} using any method`);
    return [];
  } catch (error) {
    console.error(`Error fetching wards for province ${provinceCode}:`, error);
    return [];
  }
};

// Alternative: Get wards using /w/ endpoint with province filter
export const getWardsByProvinceFilter = async (provinceCode: number): Promise<Ward[]> => {
  if (cache.wards[provinceCode]) {
    return cache.wards[provinceCode];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/w/?province=${provinceCode}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch wards for province ${provinceCode}`);
    }
    const data = await response.json();
    
    // Transform API response to our format
    const wards: Ward[] = (data || []).map((item: any) => ({
      code: item.code,
      name: item.name,
      division_type: item.division_type,
      codename: item.codename,
      province_code: item.province_code,
    }));

    cache.wards[provinceCode] = wards;
    return wards;
  } catch (error) {
    console.error(`Error fetching wards for province ${provinceCode}:`, error);
    return [];
  }
};

// Clear cache (useful for testing or refreshing data)
export const clearCache = () => {
  cache.provinces = undefined;
  cache.wards = {};
};

