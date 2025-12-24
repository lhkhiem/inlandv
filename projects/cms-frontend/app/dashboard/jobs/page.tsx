'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Calendar, MapPin, DollarSign, Users, FileText } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl } from '@/lib/api';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  slug: string;
  location?: string;
  salary_range?: string;
  quantity: number;
  deadline?: string;
  status: string;
  view_count: number;
  created_at: string;
  created_by_name?: string;
}

const statusLabels: Record<string, string> = {
  active: 'Đang tuyển',
  closed: 'Đã đóng',
  draft: 'Nháp',
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  draft: 'bg-yellow-100 text-yellow-800',
};

export default function JobsPage() {
  const { user, hydrate } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Job[]; total: number; totalPages: number }>(
        buildApiUrl('/jobs'),
        {
          params: {
            page: currentPage,
            pageSize,
            ...(searchQuery && { q: searchQuery }),
            ...(statusFilter && { status: statusFilter }),
          },
          withCredentials: true,
        }
      );

      setJobs(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Không thể tải danh sách tuyển dụng');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    if (!isInitialized) return;
    fetchJobs();
  }, [isInitialized, fetchJobs]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vị trí "${title}"?`)) return;

    try {
      await axios.delete(buildApiUrl(`/jobs/${id}`), {
        withCredentials: true,
      });
      toast.success('Đã xóa vị trí tuyển dụng');
      fetchJobs();
    } catch (error: any) {
      console.error('Failed to delete job:', error);
      toast.error(error.response?.data?.error || 'Không thể xóa vị trí tuyển dụng');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không giới hạn';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Vị trí Tuyển dụng
          </h1>
          <p className="text-muted-foreground">
            Quản lý các vị trí tuyển dụng
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
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
            placeholder="Tìm kiếm vị trí tuyển dụng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang tuyển</option>
          <option value="closed">Đã đóng</option>
          <option value="draft">Nháp</option>
        </select>
      </div>

      {/* Jobs Table */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có vị trí tuyển dụng"
          description="Bắt đầu bằng cách thêm vị trí tuyển dụng mới"
          action={
            <Link
              href="/dashboard/jobs/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm mới
            </Link>
          }
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Vị trí</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Thông tin</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Hạn nộp</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Lượt xem</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{job.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{job.slug}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salary_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{job.salary_range}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{job.quantity} vị trí</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className={isDeadlinePassed(job.deadline) ? 'text-destructive' : ''}>
                          {formatDate(job.deadline)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[job.status] || statusColors.draft}`}>
                        {statusLabels[job.status] || job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {job.view_count || 0}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                        >
                          <Edit className="h-3 w-3" />
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id, job.title)}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} của {total} vị trí
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-lg border border-input bg-background text-foreground text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-3 py-1 text-sm text-foreground">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-lg border border-input bg-background text-foreground text-sm hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
