'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import MediaPicker from '@/components/MediaPicker';
import RichTextEditor from '@/components/RichTextEditor';
import SEOPopup from '@/components/SEOPopup';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api';

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Infrastructure {
  [key: string]: boolean | undefined;
  power?: boolean;
  water?: boolean;
  drainage?: boolean;
  waste?: boolean;
  internet?: boolean;
  road?: boolean;
  security?: boolean;
}

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  // Safely extract id from params
  const parkId = params?.id ? String(params.id) : null;
  const isEdit = !!parkId && parkId !== 'new';

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    slug: '',
    has_rental: false,
    has_transfer: false,
    has_factory: false,
    province: '',
    ward: '',
    address: '',
    total_area: '',
    available_area: '',
    rental_price_min: '',
    rental_price_max: '',
    transfer_price_min: '',
    transfer_price_max: '',
    description: '',
    description_full: '',
    video_url: '',
    meta_title: '',
    meta_description: '',
    published_at: '',
    // KCN redesign fields
    product_types: [] as string[],
    transaction_types: [] as string[],
    location_types: [] as string[],
  });

  const [infrastructure, setInfrastructure] = useState<Infrastructure>({
    power: false,
    water: false,
    drainage: false,
    waste: false,
    internet: false,
    road: false,
    security: false,
  });

  const [allowedIndustries, setAllowedIndustries] = useState<string[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [galleryImageIds, setGalleryImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPark, setLoadingPark] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const fetchAttemptedRef = useRef(false);
  const [formKey, setFormKey] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [seo, setSeo] = useState<any>(null);
  const [showSeoPopup, setShowSeoPopup] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  // States for KCN redesign lookup data
  const [productTypes, setProductTypes] = useState<Array<{ code: string; name_vi: string; name_en: string }>>([]);
  const [transactionTypes, setTransactionTypes] = useState<Array<{ code: string; name_vi: string; name_en: string }>>([]);
  const [locationTypes, setLocationTypes] = useState<Array<{ code: string; name_vi: string; name_en: string }>>([]);
  const [loadingLookupData, setLoadingLookupData] = useState(false);

  // Common industries list with Vietnamese labels
  const industriesList = [
    { value: 'co-khi', label: 'Cơ khí' },
    { value: 'dien-tu', label: 'Điện tử' },
    { value: 'thuc-pham', label: 'Thực phẩm' },
    { value: 'may-mac', label: 'May mặc' },
    { value: 'hoa-chat', label: 'Hóa chất' },
    { value: 'xay-dung', label: 'Xây dựng' },
    { value: 'nang-luong', label: 'Năng lượng' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'cong-nghe', label: 'Công nghệ' },
    { value: 'dau-tu', label: 'Đầu tư' },
  ];

  // Infrastructure labels in Vietnamese
  const infrastructureLabels: Record<keyof Infrastructure, string> = {
    power: 'Điện',
    water: 'Nước',
    drainage: 'Thoát nước',
    waste: 'Xử lý chất thải',
    internet: 'Internet',
    road: 'Đường giao thông',
    security: 'An ninh',
  };

  // Custom options state
  const [customInfrastructure, setCustomInfrastructure] = useState<Array<{ key: string; label: string }>>([]);
  const [customIndustries, setCustomIndustries] = useState<Array<{ value: string; label: string }>>([]);
  const [newInfrastructureKey, setNewInfrastructureKey] = useState('');
  const [newInfrastructureLabel, setNewInfrastructureLabel] = useState('');
  const [newIndustryValue, setNewIndustryValue] = useState('');
  const [newIndustryLabel, setNewIndustryLabel] = useState('');

  // Get available wards based on selected province
  // Load provinces and lookup data on mount
  useEffect(() => {
    loadProvinces();
    loadLookupData();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const data = await getProvinces();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load wards when province changes
  useEffect(() => {
    if (formData.province) {
      loadWardsByProvince(formData.province);
    } else {
      setWards([]);
      setFormData(prev => ({ ...prev, ward: '' }));
    }
  }, [formData.province]);

  // Load lookup data (product_types, transaction_types, location_types)
  const loadLookupData = async () => {
    try {
      setLoadingLookupData(true);
      const [productRes, transactionRes, locationRes] = await Promise.all([
        axios.get(buildApiUrl('/lookup/product-types'), { withCredentials: true }),
        axios.get(buildApiUrl('/lookup/transaction-types'), { withCredentials: true }),
        axios.get(buildApiUrl('/lookup/location-types'), { withCredentials: true }),
      ]);
      
      if (productRes.data?.success && productRes.data?.data) {
        setProductTypes(productRes.data.data);
      }
      if (transactionRes.data?.success && transactionRes.data?.data) {
        setTransactionTypes(transactionRes.data.data);
      }
      if (locationRes.data?.success && locationRes.data?.data) {
        setLocationTypes(locationRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load lookup data:', error);
    } finally {
      setLoadingLookupData(false);
    }
  };

  const loadWardsByProvince = async (provinceCode: string): Promise<Ward[]> => {
    if (!provinceCode) {
      setWards([]);
      return [];
    }

    try {
      // Convert string to number for API v2
      const provinceCodeNum = parseInt(provinceCode, 10);
      if (isNaN(provinceCodeNum)) {
        console.warn('Invalid province code:', provinceCode);
        setWards([]);
        return [];
      }
      
      // Use API v2 to get wards directly from province
      // This function already handles errors internally and returns empty array on failure
      const wardsData = await getWardsByProvince(provinceCodeNum);
      setWards(wardsData);
      return wardsData;
    } catch (error: any) {
      // Silently handle errors - getWardsByProvince already returns empty array on failure
      console.warn('Failed to load wards for province:', provinceCode, error?.message || error);
      setWards([]);
      return [];
    }
  };

  useEffect(() => {
    if (isEdit && parkId) {
      setDataLoaded(false);
      setFormData({
        code: '',
        name: '',
        slug: '',
        has_rental: false,
        has_transfer: false,
        has_factory: false,
        province: '',
        ward: '',
        address: '',
        latitude: '',
        longitude: '',
        google_maps_link: '',
        total_area: '',
        available_area: '',
        rental_price_min: '',
        rental_price_max: '',
        transfer_price_min: '',
        transfer_price_max: '',
        description: '',
        description_full: '',
        meta_title: '',
        meta_description: '',
        published_at: !isEdit ? getTodayDate() : '',
        // KCN redesign fields
        product_types: [],
        transaction_types: [],
        location_types: [],
      });
      setInfrastructure({
        power: false,
        water: false,
        drainage: false,
        waste: false,
        internet: false,
        road: false,
        security: false,
      });
      setAllowedIndustries([]);
      setThumbnailId('');
      setGalleryImageIds([]);
      fetchAttemptedRef.current = false;
    }
  }, [parkId, isEdit]);

  useEffect(() => {
    if (isEdit && parkId && !fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      fetchPark();
    } else if (!isEdit) {
      setDataLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkId, isEdit]);

  const fetchPark = async (retryCount = 0) => {
    if (!parkId) {
      setError('Product ID is missing');
      return;
    }

    try {
      setLoadingPark(true);
      setError(null);
      
      const response: any = await axios.get(buildApiUrl(`/products/${parkId}`), {
        withCredentials: true,
        timeout: 10000,
      });
      
      const park = response.data?.data || response.data;
      
      if (!park || !park.id) {
        throw new Error('Invalid product data received');
      }
      
      console.log('Loaded product data:', park);
      
      // Load provinces if not loaded yet
      if (provinces.length === 0) {
        await loadProvinces();
      }
      
      // Find province code from name (if stored as name) or use as-is (if stored as code)
      let provinceCode = park.province ? String(park.province) : '';
      const currentProvinces = provinces.length > 0 ? provinces : await getProvinces();
      
      // Try to find by code first (convert to number for comparison)
      const provinceCodeNum = parseInt(provinceCode, 10);
      let foundProvince = !isNaN(provinceCodeNum)
        ? currentProvinces.find(p => p.code === provinceCodeNum)
        : null;
      
      if (!foundProvince) {
        // If not found by code, try to find by name (backward compatibility)
        foundProvince = currentProvinces.find(p => p.name === provinceCode);
        if (foundProvince) {
          provinceCode = String(foundProvince.code);
        }
      } else {
        provinceCode = String(foundProvince.code);
      }

      // Load wards if province is set
      if (provinceCode) {
        await loadWardsByProvince(provinceCode);
      }

      // Ward (phường/xã) - find ward code from name (if stored as name) or use as-is (if stored as code)
      let wardCode = park.ward ? String(park.ward) : '';
      if (wardCode && provinceCode) {
        const currentWards = wards.length > 0 ? wards : await loadWardsByProvince(provinceCode);
        // Try to find by code (convert to number if needed)
        const wardCodeNum = parseInt(wardCode, 10);
        let foundWard = !isNaN(wardCodeNum) 
          ? currentWards.find(w => w.code === wardCodeNum)
          : null;
        
        if (!foundWard) {
          // If not found by code, try to find by name (backward compatibility)
          foundWard = currentWards.find(w => w.name === wardCode);
          if (foundWard) {
            wardCode = String(foundWard.code);
          }
        } else {
          wardCode = String(foundWard.code);
        }
      }

      setFormData({
        code: park.code || '',
        name: park.name || '',
        slug: park.slug || '',
        has_rental: Boolean(park.has_rental),
        has_transfer: Boolean(park.has_transfer),
        has_factory: Boolean(park.has_factory),
        province: provinceCode,
        ward: wardCode,
        address: park.address || '',
        total_area: park.total_area ? String(park.total_area) : '',
        available_area: park.available_area ? String(park.available_area) : '',
        rental_price_min: park.rental_price_min ? String(park.rental_price_min) : '',
        rental_price_max: park.rental_price_max ? String(park.rental_price_max) : '',
        transfer_price_min: park.transfer_price_min ? String(park.transfer_price_min) : '',
        transfer_price_max: park.transfer_price_max ? String(park.transfer_price_max) : '',
        description: park.description || '',
        description_full: park.description_full || '',
        video_url: park.video_url || '',
        meta_title: park.meta_title || '',
        meta_description: park.meta_description || '',
        published_at: park.published_at ? (park.published_at.split('T')[0] || '') : '',
        // KCN redesign fields
        product_types: Array.isArray(park.product_types) ? park.product_types : [],
        // Đồng bộ transaction_types với has_rental và has_transfer
        transaction_types: (() => {
          const baseTypes = Array.isArray(park.transaction_types) ? park.transaction_types : [];
          const types = [...baseTypes];
          
          // Nếu has_rental = true nhưng chưa có 'cho-thue' trong transaction_types
          if (Boolean(park.has_rental) && !types.includes('cho-thue')) {
            types.push('cho-thue');
          }
          
          // Nếu has_transfer = true nhưng chưa có 'chuyen-nhuong' trong transaction_types
          if (Boolean(park.has_transfer) && !types.includes('chuyen-nhuong')) {
            types.push('chuyen-nhuong');
          }
          
          return types;
        })(),
        location_types: Array.isArray(park.location_types) ? park.location_types : [],
      });

      // Load infrastructure
      if (park.infrastructure && typeof park.infrastructure === 'object') {
        const infra: Infrastructure = {
          power: Boolean(park.infrastructure.power),
          water: Boolean(park.infrastructure.water),
          drainage: Boolean(park.infrastructure.drainage),
          waste: Boolean(park.infrastructure.waste),
          internet: Boolean(park.infrastructure.internet),
          road: Boolean(park.infrastructure.road),
          security: Boolean(park.infrastructure.security),
        };
        
        // Load custom infrastructure
        const customInfra: Array<{ key: string; label: string }> = [];
        Object.keys(park.infrastructure).forEach(key => {
          if (!['power', 'water', 'drainage', 'waste', 'internet', 'road', 'security'].includes(key)) {
            infra[key] = Boolean(park.infrastructure[key]);
            // Try to infer label from key or use key as label
            const label = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            customInfra.push({ key, label });
          }
        });
        
        setInfrastructure(infra);
        setCustomInfrastructure(customInfra);
      }

      // Load allowed industries
      // DB stores Vietnamese names (labels), but we need to convert to codes (values) for checkboxes
      if (park.allowed_industries && Array.isArray(park.allowed_industries)) {
        const industries = park.allowed_industries.map((item: any) => {
          // Extract Vietnamese name from DB
          let vietnameseName = '';
          if (typeof item === 'string') {
            vietnameseName = item;
          } else if (item && typeof item === 'object') {
            vietnameseName = item.name || item.label || item.industry_code || item.code || String(item);
          } else {
            vietnameseName = String(item);
          }
          
          // Find matching code (value) from industriesList by label
          const matching = industriesList.find(ind => ind.label === vietnameseName);
          if (matching) {
            return matching.value;
          }
          
          // Check custom industries
          const customMatch = customIndustries.find(ind => ind.label === vietnameseName);
          if (customMatch) {
            return customMatch.value;
          }
          
          // If not found, it might be a code (backward compatibility)
          // Check if it's already a code format (lowercase, no spaces, no Vietnamese chars)
          const isCodeFormat = /^[a-z0-9-]+$/.test(vietnameseName) && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/.test(vietnameseName);
          if (isCodeFormat) {
            return vietnameseName;
          }
          
          // If it's Vietnamese text but not in list, return empty (will be filtered)
          return '';
        }).filter(Boolean);
        setAllowedIndustries(industries);
        console.log('[CMS] Loaded allowed industries from DB:', park.allowed_industries);
        console.log('[CMS] Converted to codes for checkboxes:', industries);
      } else {
        setAllowedIndustries([]);
      }

      // Load thumbnail - Find asset ID from URL
      if (park.thumbnail_url) {
        setThumbnailUrl(park.thumbnail_url);
        const assetId = await findAssetIdFromUrl(park.thumbnail_url);
        setThumbnailId(assetId || '');
      } else {
        setThumbnailId('');
        setThumbnailUrl(null);
      }

      // Load gallery images - products table uses JSONB array
      // Handle both old format (array of objects) and new format (JSONB array)
      if (park.images) {
        let imageArray: any[] = [];
        if (typeof park.images === 'string') {
          try {
            imageArray = JSON.parse(park.images);
          } catch (e) {
            imageArray = [];
          }
        } else if (Array.isArray(park.images)) {
          imageArray = park.images;
        }
        
        if (imageArray.length > 0) {
          const imageUrls = imageArray.map((img: any) => img.url || img).filter(Boolean);
          if (imageUrls.length > 0) {
            const foundIds: string[] = [];
            for (const imageUrl of imageUrls) {
              const assetId = await findAssetIdFromUrl(imageUrl);
              if (assetId) {
                foundIds.push(assetId);
              }
            }
            setGalleryImageIds(foundIds);
          } else {
            setGalleryImageIds([]);
          }
        } else {
          setGalleryImageIds([]);
        }
      } else {
        setGalleryImageIds([]);
      }

      setDataLoaded(true);
      setTimeout(() => {
        setFormKey(prev => prev + 1);
      }, 50);
    } catch (error: any) {
      console.error('Failed to fetch industrial park:', error);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Failed to load industrial park data';
      
      setError(errorMessage);
      
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying fetch park in ${delay}ms... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          fetchPark(retryCount + 1);
        }, delay);
      } else {
        alert(`Không thể tải sản phẩm: ${errorMessage}\n\nVui lòng làm mới trang hoặc thử lại sau.`);
      }
    } finally {
      setLoadingPark(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name || !formData.code || !formData.province || !formData.total_area) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc: Tên, Mã, Tỉnh/Thành, Diện tích tổng');
      return;
    }

    if (!formData.has_rental && !formData.has_transfer) {
      alert('Phải chọn ít nhất một dịch vụ: Cho thuê hoặc Chuyển nhượng');
      return;
    }

    setLoading(true);

    try {
      // Fetch asset URLs from IDs
      let finalThumbnailUrl = null;
      if (thumbnailId) {
        try {
          const assetRes = await axios.get(buildApiUrl(`/assets/${thumbnailId}`), {
            withCredentials: true
          });
          finalThumbnailUrl = assetRes.data?.url || assetRes.data?.data?.url || thumbnailId;
        } catch (err) {
          // If fetch fails, assume thumbnailId is already a URL
          finalThumbnailUrl = thumbnailId;
        }
      }

      const imageUrls: Array<{ url: string; caption?: string; display_order?: number; is_primary?: boolean }> = [];
      for (let i = 0; i < galleryImageIds.length; i++) {
        const imageId = galleryImageIds[i];
        try {
          const assetRes = await axios.get(buildApiUrl(`/assets/${imageId}`), {
            withCredentials: true
          });
          const url = assetRes.data?.url || assetRes.data?.data?.url || imageId;
          imageUrls.push({
            url,
            display_order: i,
            is_primary: i === 0
          });
        } catch (err) {
          // If fetch fails, assume imageId is already a URL
          imageUrls.push({
            url: imageId,
            display_order: i,
            is_primary: i === 0
          });
        }
      }

      // Convert allowedIndustries (codes/values) to Vietnamese names (labels) for database
      // DB stores Vietnamese names with diacritics, not codes
      let allowedIndustriesData: string[] | null = null;
      
      if (Array.isArray(allowedIndustries) && allowedIndustries.length > 0) {
        const vietnameseNames = allowedIndustries
          .map((code: string) => {
            // Find matching label from industriesList
            const matching = industriesList.find(ind => ind.value === code);
            if (matching) {
              return matching.label; // Return Vietnamese name with diacritics
            }
            
            // Check custom industries
            const customMatch = customIndustries.find(ind => ind.value === code);
            if (customMatch) {
              return customMatch.label; // Return Vietnamese name with diacritics
            }
            
            // If not found, return empty (will be filtered)
            return '';
          })
          .filter((item): item is string => typeof item === 'string' && item.length > 0);
        
        // Only set as array if we have valid Vietnamese names
        if (vietnameseNames.length > 0) {
          allowedIndustriesData = vietnameseNames;
        }
        // If filtered is empty, allowedIndustriesData stays null
      }
      
      console.log('[CMS] Allowed industries state (codes):', allowedIndustries);
      console.log('[CMS] Submitting allowed industries (Vietnamese names):', allowedIndustriesData === null ? 'NULL' : allowedIndustriesData);
      console.log('[CMS] Allowed industries count:', allowedIndustriesData?.length || 0);

      // Ensure infrastructure is always an object
      const infrastructureData = infrastructure && typeof infrastructure === 'object' 
        ? infrastructure 
        : {};

      // Ensure location fields are properly formatted (use codes like real-estate)
      // Province and ward are stored as codes (strings)
      const provinceCode = formData.province ? String(formData.province) : null;
      const wardCode = formData.ward ? String(formData.ward) : null;

      // Normalize published_at to YYYY-MM-DD for date input compatibility
      const publishedAt = formData.published_at
        ? formData.published_at.split('T')[0]
        : null;

      const data: any = {
        code: formData.code,
        name: formData.name,
        slug: formData.slug || null,
        has_rental: Boolean(formData.has_rental),
        has_transfer: Boolean(formData.has_transfer),
        has_factory: Boolean(formData.has_factory),
        // Store province and ward as codes (strings)
        province: provinceCode,
        ward: wardCode,
        address: formData.address && formData.address.trim() ? formData.address.trim() : null,
        total_area: parseFloat(formData.total_area),
        available_area: formData.available_area ? parseFloat(formData.available_area) : null,
        // Convert to string for BIGINT in database
        rental_price_min: formData.rental_price_min ? String(formData.rental_price_min) : null,
        rental_price_max: formData.rental_price_max ? String(formData.rental_price_max) : null,
        transfer_price_min: formData.transfer_price_min ? String(formData.transfer_price_min) : null,
        transfer_price_max: formData.transfer_price_max ? String(formData.transfer_price_max) : null,
        infrastructure: infrastructureData,
        allowed_industries: allowedIndustriesData,
        description: formData.description && formData.description.trim() ? formData.description.trim() : null,
        description_full: formData.description_full && formData.description_full.trim() ? formData.description_full.trim() : null,
        // Always send thumbnail_url and images, even if empty/null
        thumbnail_url: finalThumbnailUrl || null,
        // KCN redesign fields
        product_types: Array.isArray(formData.product_types) ? formData.product_types : [],
        transaction_types: Array.isArray(formData.transaction_types) ? formData.transaction_types : [],
        location_types: Array.isArray(formData.location_types) ? formData.location_types : [],
        video_url: formData.video_url && formData.video_url.trim() ? formData.video_url.trim() : null,
        meta_title: formData.meta_title && formData.meta_title.trim() ? formData.meta_title.trim() : null,
        meta_description: formData.meta_description && formData.meta_description.trim() ? formData.meta_description.trim() : null,
        published_at: publishedAt,
        // Products table uses JSONB arrays - always send, even if empty
        images: Array.isArray(imageUrls) ? imageUrls : [],
        documents: [], // Can be added later if needed
        tenants: [], // Can be added later if needed
      };

      console.log('[Form Submit] thumbnail_url being sent:', finalThumbnailUrl);
      console.log('[Form Submit] images being sent:', imageUrls);
      console.log('[Form Submit] images count:', imageUrls.length);

      console.log('[Form Submit] Full data being sent:', JSON.stringify({
        ...data,
        allowed_industries: allowedIndustriesData,
        infrastructure: infrastructureData
      }, null, 2));

      let response;
      if (isEdit && parkId) {
        console.log('[Form Submit] Updating product:', parkId);
        response = await axios.put(buildApiUrl(`/products/${parkId}`), data, {
          withCredentials: true
        });
        console.log('[Form Submit] Update response:', response.data);
      } else {
        console.log('[Form Submit] Creating new product');
        response = await axios.post(buildApiUrl('/products'), data, {
          withCredentials: true
        });
        console.log('[Form Submit] Create response:', response.data);
      }

      // Verify the saved data
      if (isEdit && parkId) {
        const verifyResponse = await axios.get(buildApiUrl(`/products/${parkId}`), {
          withCredentials: true
        });
        console.log('[Form Submit] Verified saved data - allowed_industries:', verifyResponse.data?.allowed_industries);
      }

      router.push('/dashboard/products');
    } catch (error: any) {
      console.error('[Form Submit] Failed to save industrial park:', error);
      console.error('[Form Submit] Error response:', error.response?.data);
      console.error('[Form Submit] Error status:', error.response?.status);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Không thể lưu sản phẩm';
      alert(`Lỗi: ${errorMsg}\n\nVui lòng kiểm tra console để xem chi tiết.`);
    } finally {
      setLoading(false);
    }
  };

  const handleIndustryToggle = (industry: string) => {
    setAllowedIndustries(prev => 
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleThumbnailChange = (value: string | string[]) => {
    // MediaPicker returns asset ID (string or string[])
    const id = Array.isArray(value) ? (value[0] || '') : (value || '');
    setThumbnailId(id);
  };

  const handleGalleryChange = (value: string | string[]) => {
    // MediaPicker with multiple=true returns string[] of asset IDs
    const ids = Array.isArray(value) ? value : (value ? [value] : []);
    setGalleryImageIds(ids);
  };

  // Helper function to find asset ID from URL
  const findAssetIdFromUrl = async (url: string): Promise<string | null> => {
    if (!url) return null;
    
    try {
      // Extract filename from URL
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      // Search assets by URL or filename
      const assetsResponse = await axios.get(buildApiUrl('/assets'), {
        params: { 
          search: filename,
          pageSize: 100 
        },
        withCredentials: true,
      });
      
      const assets = assetsResponse.data?.data || [];
      
      // Try exact URL match first
      let matchingAsset = assets.find((asset: any) => 
        asset.url === url || 
        asset.original_url === url ||
        asset.thumb_url === url ||
        asset.medium_url === url ||
        asset.large_url === url
      );
      
      // If not found, try filename match
      if (!matchingAsset) {
        matchingAsset = assets.find((asset: any) => 
          asset.url?.includes(filename) ||
          asset.file_name === filename ||
          asset.url?.endsWith(filename)
        );
      }
      
      return matchingAsset?.id || null;
    } catch (err) {
      console.warn('Could not find asset ID for URL:', url, err);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? 'Chỉnh sửa sản phẩm khu công nghiệp' : 'Tạo sản phẩm khu công nghiệp'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Cập nhật chi tiết sản phẩm khu công nghiệp' : 'Thêm sản phẩm khu công nghiệp mới'}
          </p>
        </div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            <strong>Lỗi khi tải sản phẩm:</strong> {error}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              fetchAttemptedRef.current = false;
              fetchPark();
            }}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {loadingPark && (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-2" />
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu sản phẩm...</p>
        </div>
      )}

      {/* Form */}
      {!loadingPark && (isEdit ? dataLoaded : true) && (
        <form key={`form-${formKey}-${dataLoaded}`} onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-medium text-card-foreground">Thông tin cơ bản</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mã KCN *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="VD: INL-KCN-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên khu công nghiệp *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setFormData((prev) => {
                      const newSlug = !slugManuallyEdited && newName
                        ? generateSlug(newName)
                        : prev.slug;
                      return { ...prev, name: newName, slug: newSlug };
                    });
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, slug: e.target.value }));
                    setSlugManuallyEdited(true);
                  }}
                  onBlur={() => {
                    if (!formData.slug && formData.name) {
                      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
                      setSlugManuallyEdited(false);
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={formData.name ? generateSlug(formData.name) : "tự-động-tạo-từ-tên"}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Phiên bản thân thiện với URL của tên. Tự động tạo nếu để trống.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mô tả ngắn
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Mô tả ngắn về khu công nghiệp..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mô tả chi tiết
                </label>
                <RichTextEditor
                  key={`editor-${String(params?.id || 'new')}`}
                  value={formData.description_full}
                  onChange={(html) => setFormData({ ...formData, description_full: html })}
                  placeholder="Nhập mô tả chi tiết về khu công nghiệp..."
                />
              </div>
            </div>


            {/* Location */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-medium text-card-foreground">Vị trí</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tỉnh/Thành phố *
                  </label>
                  <select
                    required
                    value={formData.province}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        province: e.target.value
                      });
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Chọn Tỉnh/Thành phố --</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={String(province.code)}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phường/Xã
                  </label>
                  <select
                    value={formData.ward}
                    onChange={(e) => {
                      setFormData({ ...formData, ward: e.target.value });
                    }}
                    disabled={!formData.province || wards.length === 0}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={String(ward.code)}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                  {!formData.province && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Vui lòng chọn Tỉnh/Thành phố trước
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Địa chỉ <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phố...)"
                  required
                />
              </div>
            </div>

            {/* Area */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-medium text-card-foreground">Diện tích</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Diện tích tổng (ha) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.total_area}
                    onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Diện tích còn trống (ha)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.available_area}
                    onChange={(e) => setFormData({ ...formData, available_area: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            </div>


            {/* Media */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-medium text-card-foreground">Media</h3>
              
              <div className="space-y-4">
                <div>
                  <MediaPicker
                    label="Hình đại diện"
                    value={thumbnailId}
                    onChange={handleThumbnailChange}
                    multiple={false}
                    previewSize={200}
                  />
                </div>

                <div>
                  <MediaPicker
                    label="Hình ảnh thư viện"
                    value={galleryImageIds}
                    onChange={handleGalleryChange}
                    multiple={true}
                    maxFiles={20}
                    previewSize={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL video
                  </label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Phân loại KCN */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-5">
              <h3 className="font-semibold text-base text-card-foreground pb-2 border-b border-border">Phân loại KCN</h3>
              
              {/* Loại sản phẩm */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Loại sản phẩm
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {loadingLookupData ? (
                    <p className="text-sm text-muted-foreground col-span-full">Đang tải...</p>
                  ) : (
                    productTypes.map((pt) => (
                      <label key={pt.code} className="flex items-center space-x-2.5 cursor-pointer group py-1">
                        <input
                          type="checkbox"
                          checked={formData.product_types?.includes(pt.code) || false}
                          onChange={(e) => {
                            const current = formData.product_types || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, product_types: [...current, pt.code] });
                            } else {
                              setFormData({ ...formData, product_types: current.filter((c) => c !== pt.code) });
                            }
                          }}
                          className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                        />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">{pt.name_vi}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Loại giao dịch / Dịch vụ */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <label className="block text-sm font-medium text-foreground">
                  Loại giao dịch / Dịch vụ
                </label>
                <div className="space-y-3">
                  {loadingLookupData ? (
                    <p className="text-sm text-muted-foreground">Đang tải...</p>
                  ) : (
                    <>
                      {/* Cho thuê và Chuyển nhượng - hàng ngang */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Cho thuê */}
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2.5 cursor-pointer group py-1">
                            <input
                              type="checkbox"
                              checked={formData.has_rental || (formData.transaction_types?.includes('cho-thue') || false)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const current = formData.transaction_types || [];
                                const transactionCode = 'cho-thue';
                                
                                setFormData(prev => ({ ...prev, has_rental: checked }));
                                
                                if (checked) {
                                  if (!current.includes(transactionCode)) {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      transaction_types: [...current, transactionCode] 
                                    }));
                                  }
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    transaction_types: current.filter((c) => c !== transactionCode),
                                    rental_price_min: '',
                                    rental_price_max: ''
                                  }));
                                }
                              }}
                              className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                            />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">Cho thuê</span>
                          </label>
                          {formData.has_rental && (
                            <div className="ml-7 space-y-2 bg-muted/30 rounded p-3">
                              <h4 className="text-xs font-medium text-muted-foreground">Giá (đ/m²/tháng)</h4>
                              <div className="flex flex-col gap-3">
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1.5">Tối thiểu</label>
                                  <input
                                    type="number"
                                    step="1"
                                    value={formData.rental_price_min}
                                    onChange={(e) => setFormData({ ...formData, rental_price_min: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Nhập giá tối thiểu"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1.5">Tối đa</label>
                                  <input
                                    type="number"
                                    step="1"
                                    value={formData.rental_price_max}
                                    onChange={(e) => setFormData({ ...formData, rental_price_max: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Nhập giá tối đa"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Chuyển nhượng */}
                        <div className="space-y-2">
                          <label className="flex items-center space-x-2.5 cursor-pointer group py-1">
                            <input
                              type="checkbox"
                              checked={formData.has_transfer || (formData.transaction_types?.includes('chuyen-nhuong') || false)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const current = formData.transaction_types || [];
                                const transactionCode = 'chuyen-nhuong';
                                
                                setFormData(prev => ({ ...prev, has_transfer: checked }));
                                
                                if (checked) {
                                  if (!current.includes(transactionCode)) {
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      transaction_types: [...current, transactionCode] 
                                    }));
                                  }
                                } else {
                                  setFormData(prev => ({ 
                                    ...prev, 
                                    transaction_types: current.filter((c) => c !== transactionCode),
                                    transfer_price_min: '',
                                    transfer_price_max: ''
                                  }));
                                }
                              }}
                              className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                            />
                            <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">Chuyển nhượng</span>
                          </label>
                          {formData.has_transfer && (
                            <div className="ml-7 space-y-2 bg-muted/30 rounded p-3">
                              <h4 className="text-xs font-medium text-muted-foreground">Giá (tỷ VND)</h4>
                              <div className="flex flex-col gap-3">
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1.5">Tối thiểu</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={formData.transfer_price_min}
                                    onChange={(e) => setFormData({ ...formData, transfer_price_min: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Nhập giá tối thiểu"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-muted-foreground mb-1.5">Tối đa</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={formData.transfer_price_max}
                                    onChange={(e) => setFormData({ ...formData, transfer_price_max: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="Nhập giá tối đa"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Các loại giao dịch khác từ lookup */}
                      {transactionTypes.filter(tt => tt.code !== 'cho-thue' && tt.code !== 'chuyen-nhuong').length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border/50">
                          {transactionTypes
                            .filter(tt => tt.code !== 'cho-thue' && tt.code !== 'chuyen-nhuong')
                            .map((tt) => (
                              <label key={tt.code} className="flex items-center space-x-2.5 cursor-pointer group py-1">
                                <input
                                  type="checkbox"
                                  checked={formData.transaction_types?.includes(tt.code) || false}
                                  onChange={(e) => {
                                    const current = formData.transaction_types || [];
                                    if (e.target.checked) {
                                      setFormData({ ...formData, transaction_types: [...current, tt.code] });
                                    } else {
                                      setFormData({ ...formData, transaction_types: current.filter((c) => c !== tt.code) });
                                    }
                                  }}
                                  className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                                />
                                <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">{tt.name_vi}</span>
                              </label>
                            ))
                          }
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Loại vị trí */}
              <div className="space-y-2 pt-3 border-t border-border/50">
                <label className="block text-sm font-medium text-foreground">
                  Loại vị trí
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {loadingLookupData ? (
                    <p className="text-sm text-muted-foreground col-span-full">Đang tải...</p>
                  ) : (
                    locationTypes.map((lt) => (
                      <label key={lt.code} className="flex items-center space-x-2.5 cursor-pointer group py-1">
                        <input
                          type="checkbox"
                          checked={formData.location_types?.includes(lt.code) || false}
                          onChange={(e) => {
                            const current = formData.location_types || [];
                            if (e.target.checked) {
                              setFormData({ ...formData, location_types: [...current, lt.code] });
                            } else {
                              setFormData({ ...formData, location_types: current.filter((c) => c !== lt.code) });
                            }
                          }}
                          className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                        />
                        <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">{lt.name_vi}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-base text-card-foreground pb-2 border-b border-border">Hạ tầng</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Standard infrastructure options */}
                {Object.entries(infrastructureLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2.5 cursor-pointer group py-1">
                    <input
                      type="checkbox"
                      checked={infrastructure[key as keyof Infrastructure] || false}
                      onChange={(e) => setInfrastructure(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                      {label}
                    </span>
                  </label>
                ))}
                
                {/* Custom infrastructure options */}
                {customInfrastructure.map((custom) => (
                  <label key={custom.key} className="flex items-center gap-2.5 cursor-pointer group py-1">
                    <input
                      type="checkbox"
                      checked={infrastructure[custom.key as keyof Infrastructure] || false}
                      onChange={(e) => setInfrastructure(prev => ({ ...prev, [custom.key]: e.target.checked }))}
                      className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight flex-1">
                      {custom.label}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCustomInfrastructure(prev => prev.filter(item => item.key !== custom.key));
                        setInfrastructure(prev => {
                          const newInfra = { ...prev };
                          delete newInfra[custom.key as keyof Infrastructure];
                          return newInfra;
                        });
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5 rounded hover:bg-destructive/10"
                    >
                      ×
                    </button>
                  </label>
                ))}
              </div>

              {/* Add custom infrastructure */}
              <div className="pt-4 border-t border-border">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newInfrastructureKey}
                    onChange={(e) => setNewInfrastructureKey(e.target.value)}
                    placeholder="Key (VD: gas)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={newInfrastructureLabel}
                    onChange={(e) => setNewInfrastructureLabel(e.target.value)}
                    placeholder="Tên hiển thị (VD: Khí đốt)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInfrastructureKey && newInfrastructureLabel) {
                        setCustomInfrastructure(prev => [...prev, { key: newInfrastructureKey, label: newInfrastructureLabel }]);
                        setNewInfrastructureKey('');
                        setNewInfrastructureLabel('');
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>
            </div>

            {/* Allowed Industries */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-base text-card-foreground pb-2 border-b border-border">Ngành nghề được phép</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Standard industries */}
                {industriesList.map((industry) => (
                  <label key={industry.value} className="flex items-center gap-2.5 cursor-pointer group py-1">
                    <input
                      type="checkbox"
                      checked={allowedIndustries.includes(industry.value)}
                      onChange={() => handleIndustryToggle(industry.value)}
                      className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                    />
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                      {industry.label}
                    </span>
                  </label>
                ))}
                
                {/* Custom industries */}
                {customIndustries.length > 0 && (
                  <div className="col-span-full pt-2 border-t border-border/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {customIndustries.map((custom) => (
                        <label key={custom.value} className="flex items-center gap-2.5 cursor-pointer group py-1">
                          <input
                            type="checkbox"
                            checked={allowedIndustries.includes(custom.value)}
                            onChange={() => handleIndustryToggle(custom.value)}
                            className="w-6 h-6 rounded border-2 border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-all flex-shrink-0"
                          />
                          <span className="text-sm text-foreground group-hover:text-primary transition-colors leading-tight flex-1">
                            {custom.label}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setCustomIndustries(prev => prev.filter(item => item.value !== custom.value));
                              setAllowedIndustries(prev => prev.filter(item => item !== custom.value));
                            }}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors px-1.5 py-0.5 rounded hover:bg-destructive/10"
                          >
                            ×
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add custom industry */}
              <div className="pt-4 border-t border-border">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newIndustryValue}
                    onChange={(e) => setNewIndustryValue(e.target.value)}
                    placeholder="Giá trị (VD: bao-bi)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <input
                    type="text"
                    value={newIndustryLabel}
                    onChange={(e) => setNewIndustryLabel(e.target.value)}
                    placeholder="Tên hiển thị (VD: Bao bì)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newIndustryValue && newIndustryLabel) {
                        // Normalize value to code format (lowercase, no spaces, no special chars)
                        const normalizedValue = newIndustryValue
                          .toLowerCase()
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '');
                        
                        setCustomIndustries(prev => [...prev, { value: normalizedValue, label: newIndustryLabel }]);
                        setNewIndustryValue('');
                        setNewIndustryLabel('');
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                  >
                    Thêm
                  </button>
                  <p className="text-xs text-muted-foreground mt-1">
                    <strong>Lưu ý:</strong> Giá trị sẽ được tự động chuyển thành code (chữ thường, không dấu). Ví dụ: "Bao bì" → "bao-bi"
                  </p>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-card-foreground">SEO</h3>
                <button
                  type="button"
                  onClick={() => setShowSeoPopup(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Cấu hình SEO
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Published Date */}
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-medium text-card-foreground">Xuất bản</h3>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Ngày xuất bản
                </label>
                <input
                  type="date"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      )}

      {/* SEO Popup */}
      {showSeoPopup && (
        <SEOPopup
          title={formData.meta_title}
          description={formData.meta_description}
          image={thumbnailUrl}
          keywords={[]}
          onSave={(data) => {
            setFormData(prev => ({
              ...prev,
              meta_title: data.title || '',
              meta_description: data.description || '',
            }));
            if (data.image) {
              setThumbnailId(data.image);
            }
            setShowSeoPopup(false);
          }}
          onClose={() => setShowSeoPopup(false)}
        />
      )}
    </div>
  );
}

