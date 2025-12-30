'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Mail, Phone, FileText, Calendar, Briefcase, Download } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { toast } from 'sonner';

interface JobApplication {
  id: string;
  job_id: string;
  job_title?: string;
  job_slug?: string;
  job_location?: string;
  full_name: string;
  email: string;
  phone: string;
  cv_url?: string;
  cover_letter?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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

export default function JobApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [application, setApplication] = useState<JobApplication | null>(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');

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

    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await axios.get(buildApiUrl(`/job-applications/${id}`), {
          withCredentials: true,
        });
        const data = response.data;
        setApplication(data);
        setStatus(data.status || 'pending');
        setNotes(data.notes || '');
      } catch (error: any) {
        console.error('Failed to fetch application:', error);
        toast.error('Không thể tải thông tin đơn ứng tuyển');
        router.push('/dashboard/job-applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!application) return;

    try {
      setSaving(true);
      
      await axios.put(buildApiUrl(`/job-applications/${id}`), {
        status,
        notes,
      }, {
        withCredentials: true,
      });

      toast.success('Đã cập nhật đơn ứng tuyển');
      router.push('/dashboard/job-applications');
    } catch (error: any) {
      console.error('Failed to update application:', error);
      toast.error(error.response?.data?.error || 'Không thể cập nhật đơn ứng tuyển');
    } finally {
      setSaving(false);
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

  if (!isInitialized || loading || !application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Chi tiết Đơn Ứng Tuyển
          </h1>
          <p className="text-sm text-muted-foreground">
            Xem và quản lý đơn ứng tuyển
          </p>
        </div>
        <Link
          href="/dashboard/job-applications"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin Ứng viên</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Họ và tên
                </label>
                <div className="px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  {application.full_name}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                  <Mail className="h-4 w-4" />
                  {application.email}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Số điện thoại
              </label>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                <Phone className="h-4 w-4" />
                {application.phone}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Vị trí ứng tuyển
              </label>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-muted text-foreground text-sm">
                <Briefcase className="h-4 w-4" />
                {application.job_title || 'N/A'}
                {application.job_location && (
                  <span className="text-muted-foreground"> - {application.job_location}</span>
                )}
              </div>
            </div>

            {application.cv_url && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  CV/Resume
                </label>
                <a
                  href={getAssetUrl(application.cv_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Tải xuống CV
                </a>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {application.cover_letter && (
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="font-medium text-card-foreground">Thư xin việc</h3>
              <div className="prose prose-sm max-w-none">
                <div 
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ __html: application.cover_letter }}
                />
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ngày nộp đơn:</span>
                <span className="text-foreground">{formatDate(application.created_at)}</span>
              </div>
              {application.updated_at !== application.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Cập nhật lần cuối:</span>
                  <span className="text-foreground">{formatDate(application.updated_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Quản lý</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="reviewing">Đang xem xét</option>
                <option value="interviewed">Đã phỏng vấn</option>
                <option value="accepted">Đã chấp nhận</option>
                <option value="rejected">Đã từ chối</option>
              </select>
              {application.status !== status && (
                <div className="mt-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColors[application.status] || statusColors.pending}`}>
                    Trước: {statusLabels[application.status] || application.status}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ghi chú
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Thêm ghi chú về ứng viên..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


















