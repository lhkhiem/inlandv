'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Home, Copy } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { getProvinces, getWardsByProvince, type Province } from '@/lib/provinces-api';

interface RealEstate {
  id: string;
  code: string;
  name: string;
  slug: string;
  type: 'nha-pho' | 'can-ho' | 'dat-nen' | 'biet-thu' | 'shophouse' | 'nha-xuong';
  status: 'available' | 'sold' | 'reserved';
  province: string;
  ward?: string;
  area: number;
  has_rental: boolean;
  has_transfer: boolean;
  sale_price?: number;
  sale_price_min?: number;
  sale_price_max?: number;
  rental_price?: number;
  rental_price_min?: number;
  rental_price_max?: number;
  price?: number;
  thumbnail_url?: string;
  description?: string;
  created_at: string;
}

const typeLabels: Record<string, string> = {
  'nha-pho': 'Nhà phố',
  'can-ho': 'Căn hộ',
  'dat-nen': 'Đất nền',
  'biet-thu': 'Biệt thự',
  'shophouse': 'Shophouse',
  'nha-xuong': 'Nhà xưởng'
};

const statusLabels: Record<string, string> = {
  'available': 'Có sẵn',
  'sold': 'Đã bán',
  'reserved': 'Đã đặt cọc'
};

// Component to display ward name (async loading)
function WardNameDisplay({ provinceCode, wardCode }: { provinceCode?: string; wardCode?: string }) {
  const [wardName, setWardName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!provinceCode || !wardCode) {
      setWardName('');
      setLoading(false);
      return;
    }

    const loadWardName = async () => {
      try {
        const provinceCodeNum = parseInt(String(provinceCode), 10);
        const wardCodeNum = parseInt(String(wardCode), 10);
        if (isNaN(provinceCodeNum) || isNaN(wardCodeNum)) {
          setWardName('');
          setLoading(false);
          return;
        }

        const wards = await getWardsByProvince(provinceCodeNum);
        const ward = wards.find(w => w.code === wardCodeNum);
        if (ward) {
          setWardName(ward.name);
        } else {
          // If not found, don't display anything (better than showing code)
          setWardName('');
        }
      } catch (error) {
        console.error('Failed to load ward name:', error);
        setWardName('');
      } finally {
        setLoading(false);
      }
    };

    loadWardName();
  }, [provinceCode, wardCode]);

  if (loading) return null;
  if (!wardName) return null;
  return <div className="text-xs text-muted-foreground mt-1">{wardName}</div>;
}

export default function RealEstatePage() {
  const { user, hydrate } = useAuthStore();
  const [properties, setProperties] = useState<RealEstate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);

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
      
      // Load provinces for display
      try {
        const provincesData = await getProvinces();
        if (isMounted) {
          setProvinces(provincesData);
        }
      } catch (error) {
        console.error('Failed to load provinces:', error);
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

  // Debounce search query
  useEffect(() => {
    if (!isInitialized) return;
    
    let isMounted = true;
    const timer = setTimeout(() => {
      if (!isMounted) return;
      setCurrentPage(1);
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, isInitialized]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: RealEstate[]; total: number; totalPages: number }>(
        buildApiUrl('/properties'),
        {
          params: {
            page: currentPage,
            pageSize,
            type: typeFilter || undefined,
            status: statusFilter || undefined,
            province: provinceFilter || undefined,
            q: searchQuery || undefined
          },
          withCredentials: true,
        }
      );

      setProperties(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch real estates:', error);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, typeFilter, statusFilter, provinceFilter, searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (!isInitialized) return;
    fetchProperties();
  }, [fetchProperties, isInitialized]);

  const handleShowAll = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStatusFilter('');
    setProvinceFilter('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bất động sản "${name}"?`)) return;
    
    try {
      await axios.delete(buildApiUrl(`/properties/${id}`), {
        withCredentials: true,
      });
      await fetchProperties();
    } catch (error) {
      console.error('Failed to delete real estate:', error);
      alert('Không thể xóa bất động sản');
    }
  };

  const handleCopy = async (id: string, name: string) => {
    if (!confirm(`Bạn có muốn copy bất động sản "${name}"?`)) return;
    
    try {
      const response = await axios.post(
        buildApiUrl(`/properties/${id}/copy`),
        {},
        {
          withCredentials: true,
        }
      );
      
      if (response.data.success && response.data.data) {
        // Redirect to edit page of the copied property
        window.location.href = `/dashboard/real-estate/${response.data.data.id}`;
      } else {
        alert('Copy thành công nhưng không thể chuyển đến trang chỉnh sửa');
        await fetchProperties(); // Refresh list
      }
    } catch (error: any) {
      console.error('Failed to copy property:', error);
      alert(error.response?.data?.error || 'Không thể copy bất động sản');
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const getDisplayPrice = (property: RealEstate) => {
    if (property.has_transfer && property.sale_price) {
      return formatPrice(property.sale_price);
    }
    if (property.has_transfer && property.sale_price_min && property.sale_price_max) {
      return `${formatPrice(property.sale_price_min)} - ${formatPrice(property.sale_price_max)}`;
    }
    if (property.has_rental && property.rental_price) {
      return `${formatPrice(property.rental_price)}/tháng`;
    }
    if (property.has_rental && property.rental_price_min && property.rental_price_max) {
      return `${formatPrice(property.rental_price_min)} - ${formatPrice(property.rental_price_max)}/tháng`;
    }
    if (property.price) {
      return formatPrice(property.price);
    }
    return '—';
  };

  const formatArea = (area?: number) => {
    if (!area) return '—';
    return `${Number(area).toLocaleString('vi-VN')} m²`;
  };

  const getProvinceName = (provinceCode: string | number | undefined): string => {
    if (!provinceCode) return '—';
    const code = typeof provinceCode === 'string' ? parseInt(provinceCode, 10) : provinceCode;
    if (isNaN(code)) return String(provinceCode);
    const province = provinces.find(p => p.code === code);
    return province ? province.name : String(provinceCode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Bất động sản</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách bất động sản
          </p>
        </div>
        <Link
          href="/dashboard/real-estate/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm bất động sản
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm bất động sản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả loại</option>
          <option value="nha-pho">Nhà phố</option>
          <option value="can-ho">Căn hộ</option>
          <option value="dat-nen">Đất nền</option>
          <option value="biet-thu">Biệt thự</option>
          <option value="shophouse">Shophouse</option>
          <option value="nha-xuong">Nhà xưởng</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="available">Có sẵn</option>
          <option value="sold">Đã bán</option>
          <option value="reserved">Đã đặt cọc</option>
        </select>
        <input
          type="text"
          placeholder="Tỉnh/Thành phố"
          value={provinceFilter}
          onChange={(e) => {
            setProvinceFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-4">
          <span>Hiển thị</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>mỗi trang</span>
        </div>

        <button
          onClick={handleShowAll}
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Hiển thị tất cả
        </button>
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={Home}
          title="Chưa có bất động sản"
          description="Bắt đầu bằng cách thêm bất động sản đầu tiên. Bạn có thể thêm thông tin chi tiết, hình ảnh, giá và vị trí."
          action={{
            label: 'Thêm bất động sản đầu tiên',
            onClick: () => window.location.href = '/dashboard/real-estate/new'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[25%]">Bất động sản</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[10%]">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[15%]">Vị trí</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[10%]">Diện tích</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Giá</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[8%]">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[8%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-accent/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {property.thumbnail_url ? (
                        <img
                          src={getAssetUrl(property.thumbnail_url)}
                          alt={property.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Home className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{property.name}</div>
                        <div className="text-xs text-muted-foreground">{property.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{property.code}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {typeLabels[property.type] || property.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div>{getProvinceName(property.province)}</div>
                    {property.ward && (
                      <WardNameDisplay provinceCode={property.province} wardCode={property.ward} />
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatArea(property.area)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div>{getDisplayPrice(property)}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {property.has_rental && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Cho thuê
                        </span>
                      )}
                      {property.has_transfer && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Bán
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      property.status === 'available' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : property.status === 'sold'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {statusLabels[property.status] || property.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/real-estate/${property.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleCopy(property.id, property.name)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(property.id, property.name)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Results Info and Pagination */}
      {!loading && properties.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, total)} trong tổng số {total} kết quả
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    const pageNum = currentPage <= 3 ? idx + 1 : currentPage - 2 + idx;
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-input bg-background hover:bg-accent'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {!loading && properties.length === 0 && total === 0 && (typeFilter || statusFilter || provinceFilter || searchQuery) && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy bất động sản nào phù hợp với bộ lọc của bạn.</p>
          <button
            onClick={handleShowAll}
            className="mt-2 text-primary hover:underline"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}


