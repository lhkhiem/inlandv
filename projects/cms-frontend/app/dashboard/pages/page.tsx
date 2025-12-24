'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, FileText, Eye } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl } from '@/lib/api';
import { toast } from 'sonner';

interface Page {
  id: string;
  slug: string;
  title: string;
  page_type: string;
  published: boolean;
  meta_title?: string;
  created_at: string;
  created_by_name?: string;
}

export default function PagesPage() {
  const { user, hydrate } = useAuthStore();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

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

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Page[] }>(
        buildApiUrl('/pages'),
        {
          params: {
            ...(searchQuery && { q: searchQuery }),
            ...(typeFilter && { page_type: typeFilter }),
          },
          withCredentials: true,
        }
      );

      setPages(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch pages:', error);
      toast.error('Không thể tải danh sách trang');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter]);

  useEffect(() => {
    if (!isInitialized) return;
    fetchPages();
  }, [isInitialized, fetchPages]);

  // Delete function removed - pages can only be updated, not deleted

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Trang
          </h1>
          <p className="text-muted-foreground">
            Quản lý các trang tĩnh và homepage
          </p>
        </div>
        <Link
          href="/dashboard/pages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm trang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả loại</option>
          <option value="static">Trang tĩnh</option>
          <option value="homepage">Trang chủ</option>
        </select>
      </div>

      {/* Pages Table */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : pages.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có trang nào"
          description="Bắt đầu bằng cách thêm trang mới"
          action={
            <Link
              href="/dashboard/pages/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </Link>
          }
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Tiêu đề</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Loại</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">{page.title}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    /{page.slug}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {page.page_type === 'homepage' ? 'Trang chủ' : 'Trang tĩnh'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      page.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {page.published ? 'Đã xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/pages/${page.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit className="h-3 w-3" />
                        Sửa
                      </Link>
                      {/* Delete button removed - pages can only be updated, not deleted */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
