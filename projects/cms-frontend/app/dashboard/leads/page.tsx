'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Eye, Trash2, Mail, Phone, FileText, Calendar, MapPin, Tag } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl } from '@/lib/api';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  created_at: string;
}

const sourceLabels: Record<string, string> = {
  homepage: 'Yêu cầu báo giá',
  project: 'Dự án',
  contact: 'Liên hệ',
};

const sourceColors: Record<string, string> = {
  homepage: 'bg-green-100 text-green-800',
  project: 'bg-blue-100 text-blue-800',
  contact: 'bg-purple-100 text-purple-800',
};

// Parse message to extract need, location, service, and otherRequest
const parseMessage = (message: string, source: string) => {
  if (source === 'contact') {
    // Format for contact: "Dịch vụ: ...\n\nLời nhắn: ..."
    const serviceMatch = message.match(/Dịch vụ:\s*(.+?)(?:\n|$)/);
    const messageMatch = message.match(/Lời nhắn:\s*(.+?)$/s);
    const service = serviceMatch ? serviceMatch[1].trim() : '';
    const otherRequest = messageMatch ? messageMatch[1].trim() : '';
    return { need: '', location: '', service, otherRequest };
  } else {
    // Format for homepage: [Nhu cầu] [Địa điểm] Yêu cầu khác
    const needMatch = message.match(/\[([^\]]+)\]/);
    const locationMatch = message.match(/\[([^\]]+)\]/g);
    const need = needMatch ? needMatch[1] : '';
    const location = locationMatch && locationMatch.length > 1 ? locationMatch[1] : '';
    const otherRequest = message.replace(/\[([^\]]+)\]/g, '').trim();
    return { need, location, service: '', otherRequest };
  }
};

export default function LeadsPage() {
  const { user, hydrate } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
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

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get<{ data: Lead[]; total: number; totalPages: number }>(
        buildApiUrl('/leads'),
        {
          params: {
            page: currentPage,
            limit: pageSize,
            ...(searchQuery && { q: searchQuery }),
            ...(sourceFilter && { source: sourceFilter }),
          },
          withCredentials: true,
        }
      );

      setLeads(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to fetch leads:', error);
      toast.error('Không thể tải danh sách yêu cầu báo giá');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, sourceFilter]);

  useEffect(() => {
    if (!isInitialized) return;
    fetchLeads();
  }, [isInitialized, fetchLeads]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa yêu cầu báo giá của "${name}"?`)) return;

    try {
      await axios.delete(buildApiUrl(`/leads/${id}`), {
        withCredentials: true,
      });
      toast.success('Đã xóa yêu cầu báo giá');
      fetchLeads();
    } catch (error: any) {
      console.error('Failed to delete lead:', error);
      toast.error(error.response?.data?.error || 'Không thể xóa yêu cầu báo giá');
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
            Quản lý Yêu cầu Báo Giá
          </h1>
          <p className="text-muted-foreground">
            Quản lý các yêu cầu báo giá từ form trang chủ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, số điện thoại, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tất cả nguồn</option>
          <option value="homepage">Trang chủ</option>
          <option value="project">Dự án</option>
          <option value="contact">Liên hệ</option>
        </select>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      ) : leads.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Chưa có yêu cầu báo giá"
          description="Các yêu cầu báo giá từ form trang chủ sẽ hiển thị ở đây"
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Nhu cầu/Dịch vụ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Địa điểm</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Liên hệ</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Nguồn</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Ngày gửi</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leads.map((lead) => {
                  const { need, location, service, otherRequest } = parseMessage(lead.message, lead.source);
                  const displayNeed = lead.source === 'contact' ? service : need;
                  return (
                    <tr key={lead.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium text-foreground">{lead.name}</div>
                      </td>
                      <td className="px-4 py-4">
                        {displayNeed ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">{displayNeed}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-foreground">{location}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span>{lead.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{lead.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${sourceColors[lead.source] || sourceColors.homepage}`}>
                          {sourceLabels[lead.source] || lead.source}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(lead.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/leads/${lead.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                            Xem
                          </Link>
                          <button
                            onClick={() => handleDelete(lead.id, lead.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} của {total} yêu cầu
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
