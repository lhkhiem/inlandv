'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Folder } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl } from '@/lib/api';

interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  news_count?: number;
  created_at: string;
}

export default function NewsCategoriesPage() {
  const { user, hydrate } = useAuthStore();
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: NewsCategory[]; total: number; totalPages: number }>(
        buildApiUrl('/news-categories'),
        {
          params: {
            page: currentPage,
            pageSize,
            q: searchQuery || undefined
          },
          withCredentials: true,
        }
      );

      setCategories(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch news categories:', error);
      setCategories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (!isInitialized) return;
    fetchCategories();
  }, [fetchCategories, isInitialized]);

  const handleShowAll = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    
    try {
      await axios.delete(buildApiUrl(`/news-categories/${id}`), {
        withCredentials: true,
      });
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete news category:', error);
      alert(error.response?.data?.error || 'Không thể xóa danh mục');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Danh mục Tin tức</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các danh mục tin tức
          </p>
        </div>
        <Link
          href="/dashboard/news-categories/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        
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

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Chưa có danh mục"
          description="Bắt đầu bằng cách thêm danh mục tin tức đầu tiên."
          action={{
            label: 'Thêm danh mục đầu tiên',
            onClick: () => window.location.href = '/dashboard/news-categories/new'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[30%]">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[20%]">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[25%]">Mô tả</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[10%]">Số tin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[10%]">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[5%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-accent/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{category.name}</div>
                        <div className="text-xs text-muted-foreground">Thứ tự: {category.display_order}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{category.slug}</td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {category.description || '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {category.news_count || 0}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      category.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {category.is_active ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/news-categories/${category.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
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
      {!loading && categories.length > 0 && (
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
      {!loading && categories.length === 0 && total === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy danh mục nào phù hợp với bộ lọc của bạn.</p>
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


















