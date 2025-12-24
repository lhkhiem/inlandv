'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, FileText, Eye, Copy } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';

interface News {
  id: string;
  title: string;
  slug: string;
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  thumbnail?: string;
  excerpt?: string;
  featured: boolean;
  view_count: number;
  published_at?: string;
  author_name?: string;
  created_at: string;
}

export default function NewsPage() {
  const { user, hydrate } = useAuthStore();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
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
      
      // Load categories
      try {
        const catResponse = await axios.get(buildApiUrl('/news-categories'), {
          params: { pageSize: 100 },
          withCredentials: true,
        });
        if (isMounted) {
          setCategories(catResponse.data?.data || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
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

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: News[]; total: number; totalPages: number }>(
        buildApiUrl('/news'),
        {
          params: {
            page: currentPage,
            pageSize,
            category_id: categoryFilter || undefined,
            featured: featuredFilter || undefined,
            q: searchQuery || undefined
          },
          withCredentials: true,
        }
      );

      setNews(response.data?.data || []);
      setTotal(response.data?.total || 0);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      setNews([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, categoryFilter, featuredFilter, searchQuery]);

  // Fetch when filters/pagination change
  useEffect(() => {
    if (!isInitialized) return;
    fetchNews();
  }, [fetchNews, isInitialized]);

  const handleShowAll = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setFeaturedFilter('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa tin tức "${title}"?`)) return;
    
    try {
      await axios.delete(buildApiUrl(`/news/${id}`), {
        withCredentials: true,
      });
      await fetchNews();
    } catch (error: any) {
      console.error('Failed to delete news:', error);
      alert(error.response?.data?.error || 'Không thể xóa tin tức');
    }
  };

  const handleCopy = async (id: string, title: string) => {
    if (!confirm(`Bạn có muốn copy tin tức "${title}"?`)) return;
    
    try {
      const response = await axios.post(
        buildApiUrl(`/news/${id}/copy`),
        {},
        {
          withCredentials: true,
        }
      );
      
      if (response.data.success && response.data.data) {
        // Redirect to edit page of the copied news
        window.location.href = `/dashboard/news/${response.data.data.id}`;
      } else {
        alert('Copy thành công nhưng không thể chuyển đến trang chỉnh sửa');
        await fetchNews(); // Refresh list
      }
    } catch (error: any) {
      console.error('Failed to copy news:', error);
      alert(error.response?.data?.error || 'Không thể copy tin tức');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý Tin tức</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý các bài tin tức
          </p>
        </div>
        <Link
          href="/dashboard/news/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm tin tức
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm tin tức..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={featuredFilter}
          onChange={(e) => {
            setFeaturedFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả</option>
          <option value="true">Tin nổi bật</option>
          <option value="false">Tin thường</option>
        </select>
        
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

      {/* News List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
        </div>
      ) : news.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có tin tức"
          description="Bắt đầu bằng cách thêm tin tức đầu tiên. Bạn có thể thêm nội dung, hình ảnh và phân loại."
          action={{
            label: 'Thêm tin tức đầu tiên',
            onClick: () => window.location.href = '/dashboard/news/new'
          }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[30%]">Tin tức</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[15%]">Danh mục</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Tác giả</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[12%]">Ngày xuất bản</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[8%]">Lượt xem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[8%]">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-[15%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.thumbnail ? (
                        <img
                          src={getAssetUrl(item.thumbnail)}
                          alt={item.title}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{item.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{item.slug}</div>
                        {item.excerpt && (
                          <div className="text-xs text-muted-foreground truncate mt-1">{item.excerpt}</div>
                        )}
                      </div>
                      {item.featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Nổi bật
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {item.category_name || '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {item.author_name || '—'}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatDate(item.published_at)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {item.view_count || 0}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      item.published_at 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {item.published_at ? 'Đã xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/news/${item.id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleCopy(item.id, item.title)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white"
                        title="Copy"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
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
      {!loading && news.length > 0 && (
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
      {!loading && news.length === 0 && total === 0 && (categoryFilter || featuredFilter || searchQuery) && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Không tìm thấy tin tức nào phù hợp với bộ lọc của bạn.</p>
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




