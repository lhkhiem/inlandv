'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, Trash2, Mail, Phone, FileText, Calendar, Briefcase } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { toast } from 'sonner';

interface JobApplication {
  id: string;
  job_id: string;
  job_title?: string;
  job_slug?: string;
  full_name: string;
  email: string;
  phone: string;
  cv_url?: string;
  cover_letter?: string;
  status: string;
  notes?: string;
  created_at: string;
}

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  reviewing: 'Đang xem xét',
  interviewed: 'Đã phỏng vấn',
  accepted: 'Đã chấp nhận',
  rejected: 'Đã từ chối',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewing: 'bg-blue-100 text-blue-800',
  interviewed: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function JobApplicationsPage() {
  const { user, hydrate } = useAuthStore();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
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
      
      // Load jobs for filter
      try {
        const jobsResponse = await axios.get(buildApiUrl('/jobs'), {
          params: { pageSize: 100 },
          withCredentials: true,
        });
        if (isMounted) {
          setJobs(jobsResponse.data?.data || []);
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
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

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: JobApplication[]; total: number; totalPages: number }>(
        buildApiUrl('/job-applications'),
        {
          params: {
            page: currentPage,
            pageSize,
            ...(searchQuery && { q: searchQuery }),
            ...(statusFilter && { status: statusFilter }),
            ...(jobFilter && { job_id: jobFilter }),
          },
          withCredentials: true,
        }
      );

      setApplications(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch applications:', error);
      toast.error('Không thể tải danh sách đơn ứng tuyển');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, jobFilter]);

  useEffect(() => {
    if (!isInitialized) return;
    fetchApplications();
  }, [isInitialized, fetchApplications]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn ứng tuyển của "${name}"?`)) return;

    try {
      await axios.delete(buildApiUrl(`/job-applications/${id}`), {
        withCredentials: true,
      });
      toast.success('Đã xóa đơn ứng tuyển');
      fetchApplications();
    } catch (error: any) {
      console.error('Failed to delete application:', error);
      toast.error(error.response?.data?.error || 'Không thể xóa đơn ứng tuyển');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Đơn Ứng Tuyển
          </h1>
          <p className="text-muted-foreground">
            Quản lý các đơn ứng tuyển
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
          <option value="pending">Chờ xử lý</option>
          <option value="reviewing">Đang xem xét</option>
          <option value="interviewed">Đã phỏng vấn</option>
          <option value="accepted">Đã chấp nhận</option>
          <option value="rejected">Đã từ chối</option>
        </select>
        <select
          value={jobFilter}
          onChange={(e) => {
            setJobFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả vị trí</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có đơn ứng tuyển"
          description="Các đơn ứng tuyển sẽ hiển thị ở đây"
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ứng viên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Vị trí ứng tuyển</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Liên hệ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ngày nộp</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{app.full_name}</div>
                    </td>
                    <td className="px-4 py-4">
                      {app.job_title ? (
                        <div className="flex items-center gap-1 text-sm">
                          <Briefcase className="h-3 w-3 text-muted-foreground" />
                          <span className="text-foreground">{app.job_title}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{app.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{app.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[app.status] || statusColors.pending}`}>
                        {statusLabels[app.status] || app.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(app.created_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/job-applications/${app.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Xem
                        </Link>
                        <button
                          onClick={() => handleDelete(app.id, app.full_name)}
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
                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} của {total} đơn
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
