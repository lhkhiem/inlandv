'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Filter, X } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { getProvinces, type Province } from '@/lib/provinces-api';

interface Property {
  id: string;
  code: string;
  name: string;
  slug: string;
  main_category?: 'kcn' | 'bds';
  status: 'available' | 'sold' | 'rented' | 'reserved';
  province: string;
  area: number;
  price?: number;
  sale_price?: number;
  rental_price?: number;
  thumbnail_url?: string;
  description?: string;
  created_at: string;
  industrial_park_id?: string;
  industrial_cluster_id?: string;
}

interface FilterState {
  search: string;
  main_category: 'kcn' | 'bds' | '';
  status: string;
  province: string;
}

const statusLabels: Record<string, string> = {
  'available': 'Có sẵn',
  'sold': 'Đã bán',
  'rented': 'Đã cho thuê',
  'reserved': 'Đã đặt cọc'
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    main_category: '',
    status: '',
    province: ''
  });

  // Load provinces
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Fetch properties with filters
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.main_category) params.append('main_category', filters.main_category);
      if (filters.status) params.append('status', filters.status);
      if (filters.province) params.append('province', filters.province);

      const response = await axios.get(buildApiUrl(`/properties?${params.toString()}`), {
        withCredentials: true
      });

      setProperties(response.data?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch properties:', error);
      alert('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      setDeletingId(id);
      await axios.delete(buildApiUrl(`/properties/${id}`), {
        withCredentials: true
      });
      fetchProperties();
    } catch (error: any) {
      console.error('Failed to delete property:', error);
      alert('Không thể xóa sản phẩm');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      main_category: '',
      status: '',
      province: ''
    });
  };

  const activeFiltersCount = 
    (filters.search ? 1 : 0) +
    (filters.main_category ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.province ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Bất Động Sản</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các sản phẩm bất động sản (nhà phố, căn hộ, đất nền, biệt thự, shophouse, nhà xưởng)
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo sản phẩm
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <Filter className="h-4 w-4" />
            Bộ lọc
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Tìm theo tên, mã, mô tả..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Main Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Loại chính
              </label>
              <select
                value={filters.main_category}
                onChange={(e) => handleFilterChange('main_category', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Tất cả</option>
                <option value="kcn">Khu Công Nghiệp</option>
                <option value="bds">Bất Động Sản</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trạng thái
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Tất cả</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tỉnh/Thành phố
              </label>
              <select
                value={filters.province}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Tất cả</option>
                {provinces.map((province) => (
                  <option key={province.code} value={String(province.code)}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm"
          description="Bắt đầu bằng cách tạo sản phẩm mới"
          action={
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Tạo sản phẩm đầu tiên
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
            >
              {property.thumbnail_url && (
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={getAssetUrl(property.thumbnail_url)}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-foreground line-clamp-2">
                    {property.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {property.code}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {property.area?.toLocaleString('vi-VN')} m²
                  </span>
                  <span className="font-medium text-foreground">
                    {property.sale_price || property.rental_price
                      ? `${((property.sale_price || property.rental_price) / 1000000).toFixed(1)} triệu`
                      : 'Liên hệ'}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(property.id)}
                    disabled={deletingId === property.id}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/50 bg-background px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
