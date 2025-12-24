'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Building2, Copy } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/lib/provinces-api';

interface IndustrialPark {
  id: string;
  code: string;
  name: string;
  slug: string;
  scope: 'trong-kcn' | 'ngoai-kcn';
  has_rental: boolean;
  has_transfer: boolean;
  province: string;
  ward?: string;
  total_area: number;
  available_area?: number;
  rental_price_min?: number;
  rental_price_max?: number;
  transfer_price_min?: number;
  transfer_price_max?: number;
  thumbnail_url?: string;
  description?: string;
  created_at: string;
}

// Component to display ward name (async loading)
function WardNameDisplay({ provinceCode, wardCode }: { provinceCode?: string; wardCode?: string }) {
  const [wardName, setWardName] = useState<string>(wardCode || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!provinceCode || !wardCode) {
      setWardName('');
      setLoading(false);
      return;
    }

    const loadWardName = async () => {
      try {
        const provinceCodeNum = parseInt(provinceCode, 10);
        const wardCodeNum = parseInt(wardCode, 10);
        if (isNaN(provinceCodeNum) || isNaN(wardCodeNum)) {
          setWardName(wardCode);
          setLoading(false);
          return;
        }

        const wards = await getWardsByProvince(provinceCodeNum);
        const ward = wards.find(w => w.code === wardCodeNum);
        setWardName(ward ? ward.name : wardCode);
      } catch (error) {
        console.error('Failed to load ward name:', error);
        setWardName(wardCode);
      } finally {
        setLoading(false);
      }
    };

    loadWardName();
  }, [provinceCode, wardCode]);

  if (loading) return <div className="text-xs text-muted-foreground">...</div>;
  return <div className="text-xs text-muted-foreground">{wardName}</div>;
}

export default function IndustrialParksPage() {
  const { user, hydrate } = useAuthStore();
  const [parks, setParks] = useState<IndustrialPark[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [isInitialized, setIsInitialized] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wardsCache, setWardsCache] = useState<Record<number, Ward[]>>({});

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

  const fetchParks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: IndustrialPark[]; total: number; totalPages: number }>(
        buildApiUrl('/industrial-parks'),
        {
          params: {
            page: currentPage,
            pageSize,
            scope: scopeFilter || undefined,
            province: provinceFilter || undefined,
            q: searchQuery || undefined
          },
          withCredentials: true,
        }
      );

      setParks(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch industrial parks:', error);
      setParks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, scopeFilter, provinceFilter, searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (!isInitialized) return;
    fetchParks();
  }, [fetchParks, isInitialized]);

  const handleShowAll = () => {
    setSearchQuery('');
    setScopeFilter('');
    setProvinceFilter('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khu công nghiệp "${name}"?`)) return;
    
    try {
      await axios.delete(buildApiUrl(`/industrial-parks/${id}`), {
        withCredentials: true,
      });
      await fetchParks();
    } catch (error) {
      console.error('Failed to delete industrial park:', error);
      alert('Không thể xóa khu công nghiệp');
    }
  };

  const handleCopy = async (id: string, name: string) => {
    if (!confirm(`Bạn có muốn copy khu công nghiệp "${name}"?`)) return;
    
    try {
      const response = await axios.post(
        buildApiUrl(`/industrial-parks/${id}/copy`),
        {},
        {
          withCredentials: true,
        }
      );
      
      if (response.data.success && response.data.data) {
        // Redirect to edit page of the copied park
        window.location.href = `/dashboard/industrial-parks/${response.data.data.id}`;
      } else {
        alert('Copy thành công nhưng không thể chuyển đến trang chỉnh sửa');
        await fetchParks(); // Refresh list
      }
    } catch (error: any) {
      console.error('Failed to copy industrial park:', error);
      alert(error.response?.data?.error || 'Không thể copy khu công nghiệp');
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

  const formatArea = (area?: number) => {
    if (!area) return '—';
    return `${Number(area).toLocaleString('vi-VN')} ha`;
  };

  // Helper function to get province name
  const getProvinceName = (provinceCode: string | undefined): string => {
    if (!provinceCode) return '';
    const codeNum = parseInt(provinceCode, 10);
    if (isNaN(codeNum)) return provinceCode;
    const province = provinces.find(p => p.code === codeNum);
    return province ? province.name : provinceCode;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Khu công nghiệp</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý danh sách các khu công nghiệp
          </p>
        </div>
        <Link
          href="/dashboard/industrial-parks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm khu công nghiệp
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khu công nghiệp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <select
          value={scopeFilter}
          onChange={(e) => {
            setScopeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả phạm vi</option>
          <option value="trong-kcn">Trong KCN</option>
          <option value="ngoai-kcn">Ngoài KCN</option>
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

      {/* Industrial Parks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : parks.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Chưa có khu công nghiệp"
          description="Bắt đầu bằng cách thêm khu công nghiệp đầu tiên. Bạn có thể thêm thông tin chi tiết, hình ảnh, giá và vị trí."
          action={{
            label: 'Thêm khu công nghiệp đầu tiên',
            onClick: () => window.location.href = '/dashboard/industrial-parks/new'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[25%]">Khu công nghiệp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[10%]">Mã</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Phạm vi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[15%]">Vị trí</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Diện tích</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Dịch vụ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[14%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {parks.map((park) => (
                <tr key={park.id} className="hover:bg-accent/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {park.thumbnail_url ? (
                        <img
                          src={getAssetUrl(park.thumbnail_url)}
                          alt={park.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{park.name}</div>
                        <div className="text-xs text-muted-foreground">{park.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{park.code}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {park.scope === 'trong-kcn' ? 'Trong KCN' : 'Ngoài KCN'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div>{getProvinceName(park.province)}</div>
                    {park.ward && (
                      <WardNameDisplay provinceCode={park.province} wardCode={park.ward} />
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div>Tổng: {formatArea(park.total_area)}</div>
                    {park.available_area && (
                      <div className="text-xs text-muted-foreground">Còn trống: {formatArea(park.available_area)}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div className="flex flex-wrap gap-1">
                      {park.has_rental && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Cho thuê
                        </span>
                      )}
                      {park.has_transfer && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          Chuyển nhượng
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/industrial-parks/${park.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleCopy(park.id, park.name)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(park.id, park.name)}
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
      {!loading && parks.length > 0 && (
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
      {!loading && parks.length === 0 && total === 0 && (scopeFilter || provinceFilter || searchQuery) && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy khu công nghiệp nào phù hợp với bộ lọc của bạn.</p>
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
