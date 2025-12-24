'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import MediaPicker from '@/components/MediaPicker';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import SEOPopup from '@/components/SEOPopup';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api';

interface RealEstateFormData {
  code: string;
  name: string;
  slug: string;
  province: string; // Province code (string)
  ward: string; // Ward code (string)
  address: string; // Address (string, nhập tay)
  type: 'nha-pho' | 'can-ho' | 'dat-nen' | 'biet-thu' | 'shophouse' | 'nha-xuong';
  category?: string;
  status: 'available' | 'sold' | 'reserved';
  legal_status?: string;
  area: number;
  land_area?: number;
  construction_area?: number;
  width?: number;
  length?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  orientation?: string;
  has_rental: boolean;
  has_transfer: boolean;
  sale_price?: number;
  sale_price_min?: number;
  sale_price_max?: number;
  sale_price_per_sqm?: number;
  rental_price?: number;
  rental_price_min?: number;
  rental_price_max?: number;
  rental_price_per_sqm?: number;
  price?: number;
  price_per_sqm?: number;
  negotiable: boolean;
  furniture?: 'full' | 'basic' | 'empty';
  description?: string;
  description_full?: string;
  thumbnail_url?: string;
  video_url?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  published_at?: string;
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function RealEstateFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  // Treat missing id as "new" to avoid hitting undefined PUT URLs
  const isNew = !id || id === 'new';
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [thumbnailId, setThumbnailId] = useState<string>('');
  const [galleryImageIds, setGalleryImageIds] = useState<string[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<Array<{ value: string; label: string; count?: number }>>([]);
  const [loadingPropertyTypes, setLoadingPropertyTypes] = useState(false);
  const [showSeoPopup, setShowSeoPopup] = useState(false);
  const [ogImageId, setOgImageId] = useState<string>('');

  const [formData, setFormData] = useState<RealEstateFormData>({
    code: '',
    name: '',
    slug: '',
    province: '',
    ward: '',
    address: '',
    type: 'nha-pho',
    category: '',
    status: 'available',
    legal_status: '',
    area: 0,
    land_area: undefined,
    construction_area: undefined,
    width: undefined,
    length: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    floors: undefined,
    orientation: '',
    has_rental: false,
    has_transfer: false,
    sale_price: undefined,
    sale_price_min: undefined,
    sale_price_max: undefined,
    sale_price_per_sqm: undefined,
    rental_price: undefined,
    rental_price_min: undefined,
    rental_price_max: undefined,
    rental_price_per_sqm: undefined,
    price: undefined,
    price_per_sqm: undefined,
    negotiable: false,
    furniture: undefined,
    description: '',
    description_full: '',
    thumbnail_url: '',
    video_url: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    published_at: isNew ? getTodayDate() : undefined,
  });

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      if (!user) {
        await hydrate();
        if (!isMounted) return;
        if (!useAuthStore.getState().user) {
          window.location.href = '/login';
          return;
        }
      }
      
      if (isMounted) {
        setIsInitialized(true);
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load property types on mount
  useEffect(() => {
    loadPropertyTypes();
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

  const loadPropertyTypes = async () => {
    try {
      setLoadingPropertyTypes(true);
      const response = await axios.get(buildApiUrl('/properties/types'), {
        withCredentials: true,
      });
      if (response.data?.success && response.data?.data) {
        setPropertyTypes(response.data.data);
      } else {
        // Fallback to default types if API fails
        setPropertyTypes([
          { value: 'nha-pho', label: 'Nhà phố' },
          { value: 'can-ho', label: 'Căn hộ' },
          { value: 'dat-nen', label: 'Đất nền' },
          { value: 'biet-thu', label: 'Biệt thự' },
          { value: 'shophouse', label: 'Shophouse' },
          { value: 'nha-xuong', label: 'Nhà xưởng' },
        ]);
      }
    } catch (error) {
      console.error('Failed to load property types:', error);
      // Fallback to default types on error
      setPropertyTypes([
        { value: 'nha-pho', label: 'Nhà phố' },
        { value: 'can-ho', label: 'Căn hộ' },
        { value: 'dat-nen', label: 'Đất nền' },
        { value: 'biet-thu', label: 'Biệt thự' },
        { value: 'shophouse', label: 'Shophouse' },
        { value: 'nha-xuong', label: 'Nhà xưởng' },
      ]);
    } finally {
      setLoadingPropertyTypes(false);
    }
  };

  // Load wards when province changes
  useEffect(() => {
    if (formData.province) {
      loadWardsByProvince(formData.province);
    } else {
      setWards([]);
      updateField('ward', '');
    }
  }, [formData.province]);

  const loadWardsByProvince = async (provinceCode: string) => {
    try {
      // Convert string to number for API v2
      const provinceCodeNum = parseInt(provinceCode, 10);
      if (isNaN(provinceCodeNum)) {
        console.error('Invalid province code:', provinceCode);
        setWards([]);
        return;
      }
      
      // Use API v2 to get wards directly from province
      const wardsData = await getWardsByProvince(provinceCodeNum);
      setWards(wardsData);
    } catch (error) {
      console.error('Failed to load wards:', error);
      setWards([]);
    }
  };

  useEffect(() => {
    if (!isInitialized || isNew || !id) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        if (!id || id === 'undefined') {
          throw new Error('Invalid property ID');
        }
        const response = await axios.get(buildApiUrl(`/properties/${id}`), {
          withCredentials: true,
        });
        const data = response.data;
        setFormData({
          code: data.code || '',
          name: data.name || '',
          slug: data.slug || '',
          // Load province and ward as strings for select inputs
          province: data.province ? String(data.province) : '',
          ward: data.ward ? String(data.ward) : '',
          address: data.address || '',
          type: data.type || 'nha-pho',
          category: data.category || '',
          status: data.status || 'available',
          legal_status: data.legal_status || '',
          area: data.area ? parseFloat(data.area) : 0,
          land_area: data.land_area ? parseFloat(data.land_area) : undefined,
          construction_area: data.construction_area ? parseFloat(data.construction_area) : undefined,
          width: data.width ? parseFloat(data.width) : undefined,
          length: data.length ? parseFloat(data.length) : undefined,
          bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
          bathrooms: data.bathrooms ? parseInt(data.bathrooms) : undefined,
          floors: data.floors ? parseInt(data.floors) : undefined,
          orientation: data.orientation || '',
          has_rental: data.has_rental || false,
          has_transfer: data.has_transfer || false,
          sale_price: data.sale_price ? parseFloat(data.sale_price) : undefined,
          sale_price_min: data.sale_price_min ? parseFloat(data.sale_price_min) : undefined,
          sale_price_max: data.sale_price_max ? parseFloat(data.sale_price_max) : undefined,
          sale_price_per_sqm: data.sale_price_per_sqm ? parseFloat(data.sale_price_per_sqm) : undefined,
          rental_price: data.rental_price ? parseFloat(data.rental_price) : undefined,
          rental_price_min: data.rental_price_min ? parseFloat(data.rental_price_min) : undefined,
          rental_price_max: data.rental_price_max ? parseFloat(data.rental_price_max) : undefined,
          rental_price_per_sqm: data.rental_price_per_sqm ? parseFloat(data.rental_price_per_sqm) : undefined,
          price: data.price ? parseFloat(data.price) : undefined,
          price_per_sqm: data.price_per_sqm ? parseFloat(data.price_per_sqm) : undefined,
          negotiable: data.negotiable || false,
          furniture: data.furniture || undefined,
          description: data.description || '',
          description_full: data.description_full || '',
          thumbnail_url: data.thumbnail_url || '',
          video_url: data.video_url || '',
          contact_name: data.contact_name || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          published_at: data.published_at ? (data.published_at.split('T')[0] || undefined) : undefined,
        });

        // Set slugManuallyEdited if slug exists (user has edited it before)
        if (data.slug) {
          setSlugManuallyEdited(true);
        }

        // Load wards if province is set
        if (data.province) {
          await loadWardsByProvince(String(data.province));
        }

        // Load thumbnail and gallery images
        if (data.thumbnail_url) {
          const thumbId = await findAssetIdFromUrl(data.thumbnail_url);
          if (thumbId) setThumbnailId(thumbId);
        }
        
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          const imageIds = await Promise.all(
            data.images.map((img: any) => findAssetIdFromUrl(typeof img === 'string' ? img : img.url))
          );
          setGalleryImageIds(imageIds.filter((id): id is string => id !== null));
        }

        // Load OG image if exists (from meta_og_image or similar field)
        // Note: Backend might need to add this field, for now we'll check if it exists
        if ((data as any).meta_og_image) {
          const ogId = await findAssetIdFromUrl((data as any).meta_og_image);
          if (ogId) setOgImageId(ogId);
        }
      } catch (error) {
        console.error('Failed to fetch property:', error);
        alert('Không thể tải thông tin bất động sản');
        router.push('/dashboard/real-estate');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, isNew, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.type || !formData.province || !formData.area) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    if (!formData.has_rental && !formData.has_transfer) {
      alert('Vui lòng chọn ít nhất một dịch vụ (Cho thuê hoặc Bán/Chuyển nhượng)');
      return;
    }

    try {
      setSaving(true);

      // Get thumbnail URL from asset ID
      let thumbnailUrl = formData.thumbnail_url || null;
      if (thumbnailId) {
        try {
          const assetResponse = await axios.get(buildApiUrl(`/assets/${thumbnailId}`), {
            withCredentials: true,
          });
          thumbnailUrl = getAssetUrl(assetResponse.data.url);
        } catch (err) {
          console.warn('Could not fetch thumbnail asset:', err);
        }
      }

      // Get gallery image URLs from asset IDs
      const imageUrls: string[] = [];
      if (galleryImageIds.length > 0) {
        try {
          await Promise.all(
            galleryImageIds.map(async (assetId) => {
              try {
                const assetResponse = await axios.get(buildApiUrl(`/assets/${assetId}`), {
                  withCredentials: true,
                });
                imageUrls.push(getAssetUrl(assetResponse.data.url));
              } catch (err) {
                console.warn(`Could not fetch asset ${assetId}:`, err);
              }
            })
          );
        } catch (err) {
          console.warn('Error fetching gallery images:', err);
        }
      }

      // Normalize published_at to YYYY-MM-DD for date input compatibility
      const publishedAt = formData.published_at
        ? formData.published_at.split('T')[0]
        : null;

      // Use checkbox values directly - respect user's explicit choice
      // The checkbox state is the source of truth
      const hasTransferFlag = Boolean(formData.has_transfer);
      const hasRentalFlag = Boolean(formData.has_rental);

      // Ensure location fields are properly formatted
      // Convert empty strings to null for optional fields to maintain data integrity
      const data: any = {
        ...formData,
        // Province and ward are strings (codes from API)
        province: formData.province ? String(formData.province) : null,
        ward: formData.ward ? String(formData.ward) : null,
        address: formData.address && formData.address.trim() ? formData.address.trim() : null,
        // Use checkbox values directly - respect user's choice
        has_transfer: hasTransferFlag,
        has_rental: hasRentalFlag,
        // Ensure price fields are properly formatted (convert to string for BIGINT in DB)
        sale_price: formData.sale_price ? String(formData.sale_price) : null,
        sale_price_min: formData.sale_price_min ? String(formData.sale_price_min) : null,
        sale_price_max: formData.sale_price_max ? String(formData.sale_price_max) : null,
        sale_price_per_sqm: formData.sale_price_per_sqm ? String(formData.sale_price_per_sqm) : null,
        rental_price: formData.rental_price ? String(formData.rental_price) : null,
        rental_price_min: formData.rental_price_min ? String(formData.rental_price_min) : null,
        rental_price_max: formData.rental_price_max ? String(formData.rental_price_max) : null,
        rental_price_per_sqm: formData.rental_price_per_sqm ? String(formData.rental_price_per_sqm) : null,
        published_at: publishedAt,
        thumbnail_url: thumbnailUrl,
        images: imageUrls,
      };

      // Guard against missing id when editing
      const propertyId = !isNew ? id : undefined;
      if (!isNew && !propertyId) {
        throw new Error('Missing property id for update');
      }

      const url = isNew ? buildApiUrl('/properties') : buildApiUrl(`/properties/${propertyId}`);
      const method = isNew ? 'post' : 'put';
      
      await axios[method](url, data, {
        withCredentials: true,
      });

      router.push('/dashboard/real-estate');
    } catch (error: any) {
      console.error('Failed to save property:', error);
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.message 
        || error.message 
        || 'Không thể lưu bất động sản';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof RealEstateFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (value: string | string[]) => {
    const id = Array.isArray(value) ? (value[0] || '') : (value || '');
    setThumbnailId(id);
  };

  const handleGalleryChange = (value: string | string[]) => {
    const ids = Array.isArray(value) ? value : (value ? [value] : []);
    setGalleryImageIds(ids);
  };

  // Helper function to find asset ID from URL
  const findAssetIdFromUrl = async (url: string): Promise<string | null> => {
    if (!url) return null;
    
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      const assetsResponse = await axios.get(buildApiUrl('/assets'), {
        params: { 
          search: filename,
          pageSize: 100 
        },
        withCredentials: true,
      });
      
      const assets = assetsResponse.data?.data || [];
      
      let matchingAsset = assets.find((asset: any) => 
        asset.url === url || 
        asset.original_url === url ||
        asset.thumb_url === url ||
        asset.medium_url === url ||
        asset.large_url === url
      );
      
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

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? 'Tạo bất động sản' : 'Chỉnh sửa bất động sản'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? 'Thêm bất động sản mới' : 'Cập nhật chi tiết bất động sản'}
          </p>
        </div>
        <Link
          href="/dashboard/real-estate"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium text-card-foreground">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mã bất động sản <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => updateField('code', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Loại <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={loadingPropertyTypes}
              >
                {loadingPropertyTypes ? (
                  <option value="">Đang tải...</option>
                ) : (
                  propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tên bất động sản <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug <span className="text-destructive">*</span>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trạng thái <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="available">Có sẵn</option>
                <option value="sold">Đã bán</option>
                <option value="reserved">Đã đặt cọc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Danh mục
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => updateField('category', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium text-card-foreground">Vị trí</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tỉnh/Thành phố <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => {
                  updateField('province', e.target.value);
                  updateField('ward', ''); // Reset ward when province changes
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
                disabled={loadingProvinces}
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
                onChange={(e) => updateField('ward', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={!formData.province || wards.length === 0}
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
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Địa chỉ <span className="text-destructive">*</span>
              </label>
              <textarea
                value={formData.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phố...)"
                required
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium text-card-foreground">Chi tiết bất động sản</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Diện tích (m²) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.area}
                onChange={(e) => updateField('area', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Diện tích đất (m²)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.land_area || ''}
                onChange={(e) => updateField('land_area', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Diện tích xây dựng (m²)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.construction_area || ''}
                onChange={(e) => updateField('construction_area', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chiều rộng (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.width || ''}
                onChange={(e) => updateField('width', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Chiều dài (m)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.length || ''}
                onChange={(e) => updateField('length', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số phòng ngủ
              </label>
              <input
                type="number"
                value={formData.bedrooms || ''}
                onChange={(e) => updateField('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số phòng tắm
              </label>
              <input
                type="number"
                value={formData.bathrooms || ''}
                onChange={(e) => updateField('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số tầng
              </label>
              <input
                type="number"
                value={formData.floors || ''}
                onChange={(e) => updateField('floors', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Hướng
              </label>
              <input
                type="text"
                value={formData.orientation}
                onChange={(e) => updateField('orientation', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="VD: Đông, Tây, Nam, Bắc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nội thất
              </label>
              <select
                value={formData.furniture || ''}
                onChange={(e) => updateField('furniture', e.target.value || undefined)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Chọn nội thất</option>
                <option value="full">Đầy đủ</option>
                <option value="basic">Cơ bản</option>
                <option value="empty">Trống</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tình trạng pháp lý
              </label>
              <input
                type="text"
                value={formData.legal_status}
                onChange={(e) => updateField('legal_status', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium text-card-foreground">Mô tả</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mô tả ngắn
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Mô tả ngắn về bất động sản..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mô tả chi tiết
            </label>
            <TinyMCEEditor
              value={formData.description_full || ''}
              onChange={(value) => updateField('description_full', value)}
              placeholder="Nhập mô tả chi tiết về bất động sản..."
              id="real-estate-description-full"
            />
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
                onChange={(e) => updateField('video_url', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h3 className="font-medium text-card-foreground">Liên hệ</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên người liên hệ
              </label>
              <input
                type="text"
                value={formData.contact_name}
                onChange={(e) => updateField('contact_name', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số điện thoại
              </label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Services */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Dịch vụ</h3>
            
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formData.has_rental ?? false}
                onChange={(e) => updateField('has_rental', e.target.checked)}
                className="h-5 w-5 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
              />
              Cho thuê
            </label>

            {formData.has_rental && (
              <div className="ml-6 space-y-2 border-l-2 border-primary/20 pl-4">
                <h4 className="text-xs font-medium text-muted-foreground">Giá cho thuê (VND/tháng)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tối thiểu</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.rental_price_min || ''}
                      onChange={(e) => updateField('rental_price_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-1.5 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tối đa</label>
                    <input
                      type="number"
                      step="1"
                      value={formData.rental_price_max || ''}
                      onChange={(e) => updateField('rental_price_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-1.5 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formData.has_transfer ?? false}
                onChange={(e) => updateField('has_transfer', e.target.checked)}
                className="h-5 w-5 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
              />
              Chuyển nhượng
            </label>

            {formData.has_transfer && (
              <div className="ml-6 space-y-2 border-l-2 border-primary/20 pl-4">
                <h4 className="text-xs font-medium text-muted-foreground">Giá chuyển nhượng (VND)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tối thiểu</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price_min || ''}
                      onChange={(e) => updateField('sale_price_min', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-1.5 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Tối đa</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price_max || ''}
                      onChange={(e) => updateField('sale_price_max', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="w-full px-3 py-1.5 rounded border border-input bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.negotiable ?? false}
                  onChange={(e) => updateField('negotiable', e.target.checked)}
                  className="h-5 w-5 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                Có thể thương lượng
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-card-foreground">SEO</h3>
              <button
                type="button"
                onClick={() => setShowSeoPopup(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
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
                onChange={(e) => updateField('meta_title', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tiêu đề SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => updateField('meta_description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mô tả SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={formData.meta_keywords}
                onChange={(e) => updateField('meta_keywords', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Từ khóa (phân cách bằng dấu phẩy)"
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
                value={formData.published_at || ''}
                onChange={(e) => updateField('published_at', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu bất động sản'}
          </button>
        </div>
      </form>

      {/* SEO Popup */}
      {showSeoPopup && (
        <SEOPopup
          isOpen={showSeoPopup}
          onClose={() => setShowSeoPopup(false)}
          onSave={(seoData) => {
            updateField('meta_title', seoData.title || '');
            updateField('meta_description', seoData.description || '');
            if (seoData.keywords && seoData.keywords.length > 0) {
              updateField('meta_keywords', seoData.keywords.join(', '));
            }
            // Handle OG image - we'll need to fetch the asset URL from ID
            if (seoData.og_image) {
              // Store the og_image URL (it's already a relative path from MediaPicker)
              // We might need to add a field for this in the backend
              console.log('OG Image URL:', seoData.og_image);
            }
            setShowSeoPopup(false);
          }}
          initialData={{
            title: formData.meta_title,
            description: formData.meta_description,
            og_image: ogImageId ? getAssetUrl(ogImageId) : '',
            keywords: formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k) : []
          }}
        />
      )}
    </div>
  );
}


