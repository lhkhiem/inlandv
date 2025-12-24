'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Trash2, Mail, Phone, FileText, Calendar, MapPin, Tag, MessageSquare } from 'lucide-react';
import Link from 'next/link';
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
    const matches = message.match(/\[([^\]]+)\]/g);
    const need = matches && matches[0] ? matches[0].replace(/[\[\]]/g, '') : '';
    const location = matches && matches[1] ? matches[1].replace(/[\[\]]/g, '') : '';
    const otherRequest = message.replace(/\[([^\]]+)\]/g, '').trim();
    return { need, location, service: '', otherRequest };
  }
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);

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

  useEffect(() => {
    if (!isInitialized || !id) return;

    const fetchLead = async () => {
      try {
        setLoading(true);
        const response = await axios.get(buildApiUrl(`/leads/${id}`), {
          withCredentials: true,
        });
        setLead(response.data.data);
      } catch (error: any) {
        console.error('Failed to fetch lead:', error);
        toast.error('Không thể tải thông tin yêu cầu báo giá');
        router.push('/dashboard/leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id, isInitialized, router]);

  const handleDelete = async () => {
    if (!lead) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa yêu cầu báo giá của "${lead.name}"?`)) return;

    try {
      await axios.delete(buildApiUrl(`/leads/${id}`), {
        withCredentials: true,
      });
      toast.success('Đã xóa yêu cầu báo giá');
      router.push('/dashboard/leads');
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

  if (!isInitialized || loading || !lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  const { need, location, service, otherRequest } = parseMessage(lead.message, lead.source);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Chi tiết Yêu cầu Báo Giá
          </h1>
          <p className="text-sm text-muted-foreground">
            Xem thông tin chi tiết yêu cầu báo giá
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-destructive px-3 py-2 text-sm hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin Khách hàng</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Họ và tên
                </label>
                <div className="px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  {lead.name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Số điện thoại
                </label>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  <Phone className="h-4 w-4" />
                  {lead.phone}
                </div>
              </div>
            </div>

            {lead.email && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  <Mail className="h-4 w-4" />
                  {lead.email}
                </div>
              </div>
            )}
          </div>

          {/* Request Details */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Chi tiết Yêu cầu</h3>
            
            {(need || service) && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {lead.source === 'contact' ? 'Dịch vụ' : 'Nhu cầu'}
                </label>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  <Tag className="h-4 w-4" />
                  {lead.source === 'contact' ? service : need}
                </div>
              </div>
            )}

            {location && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Địa điểm dự kiến
                </label>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  {location}
                </div>
              </div>
            )}

            {otherRequest && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Yêu cầu khác
                </label>
                <div className="px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm whitespace-pre-wrap">
                  {otherRequest}
                </div>
              </div>
            )}

            {!need && !location && !otherRequest && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tin nhắn
                </label>
                <div className="flex items-start gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm whitespace-pre-wrap">
                  <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{lead.message || 'Không có nội dung'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày gửi:</span>
                <span className="text-foreground">{formatDate(lead.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Source */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Nguồn</h3>
            <div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${sourceColors[lead.source] || sourceColors.homepage}`}>
                {sourceLabels[lead.source] || lead.source}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thao tác nhanh</h3>
            <div className="space-y-2">
              <a
                href={`tel:${lead.phone}`}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Phone className="h-4 w-4" />
                Gọi điện
              </a>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}`}
                  className="w-full flex items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Gửi email
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

