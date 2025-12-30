'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';
import { toast } from 'sonner';

interface JobFormData {
  title: string;
  slug: string;
  location: string;
  salary_range: string;
  quantity: number;
  deadline: string;
  description_overview: string;
  description_responsibilities: string;
  description_requirements: string;
  description_benefits: string;
  status: string;
}

export default function JobFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isNew = !id || id === 'new';
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    slug: '',
    location: '',
    salary_range: '',
    quantity: 1,
    deadline: '',
    description_overview: '',
    description_responsibilities: '',
    description_requirements: '',
    description_benefits: '',
    status: 'active',
  });

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
    if (!isInitialized || isNew || !id) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        if (!id || id === 'undefined') {
          throw new Error('Invalid job ID');
        }
        const response = await axios.get(buildApiUrl(`/jobs/${id}`), {
          withCredentials: true,
        });
        const data = response.data;
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          location: data.location || '',
          salary_range: data.salary_range || '',
          quantity: data.quantity || 1,
          deadline: data.deadline ? data.deadline.split('T')[0] : '',
          description_overview: data.description_overview || '',
          description_responsibilities: data.description_responsibilities || '',
          description_requirements: data.description_requirements || '',
          description_benefits: data.description_benefits || '',
          status: data.status || 'active',
        });
      } catch (error: any) {
        console.error('Failed to fetch job:', error);
        toast.error('Không thể tải thông tin vị trí tuyển dụng');
        router.push('/dashboard/jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, isNew, isInitialized, router]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManuallyEdited && formData.title && isNew) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(prev.title),
      }));
    }
  }, [formData.title, slugManuallyEdited, isNew]);

  const updateField = (field: keyof JobFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      setSaving(true);

      const data: any = {
        ...formData,
        deadline: formData.deadline || null,
        quantity: parseInt(String(formData.quantity)) || 1,
      };

      const url = isNew ? buildApiUrl('/jobs') : buildApiUrl(`/jobs/${id}`);
      const method = isNew ? 'post' : 'put';
      
      await axios[method](url, data, {
        withCredentials: true,
      });

      toast.success(isNew ? 'Đã tạo vị trí tuyển dụng' : 'Đã cập nhật vị trí tuyển dụng');
      router.push('/dashboard/jobs');
    } catch (error: any) {
      console.error('Failed to save job:', error);
      toast.error(error.response?.data?.error || 'Không thể lưu vị trí tuyển dụng');
    } finally {
      setSaving(false);
    }
  };

  if (!isInitialized || loading) {
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
            {isNew ? 'Tạo vị trí tuyển dụng' : 'Chỉnh sửa vị trí tuyển dụng'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? 'Thêm vị trí tuyển dụng mới' : 'Cập nhật thông tin vị trí tuyển dụng'}
          </p>
        </div>
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  updateField('title', e.target.value);
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  setSlugManuallyEdited(true);
                }}
                onBlur={() => {
                  if (!formData.slug && formData.title) {
                    setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
                    setSlugManuallyEdited(false);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={formData.title ? generateSlug(formData.title) : "tự-động-tạo-từ-tiêu-đề"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phiên bản thân thiện với URL của tiêu đề. Tự động tạo nếu để trống.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="VD: Hà Nội, TP. Hồ Chí Minh"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mức lương
                </label>
                <input
                  type="text"
                  value={formData.salary_range}
                  onChange={(e) => updateField('salary_range', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="VD: 10-15 triệu, Thỏa thuận"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Số lượng <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hạn nộp hồ sơ
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Job Descriptions */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Mô tả công việc</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tổng quan
              </label>
              <TinyMCEEditor
                value={formData.description_overview}
                onChange={(content) => updateField('description_overview', content)}
                height={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trách nhiệm công việc
              </label>
              <TinyMCEEditor
                value={formData.description_responsibilities}
                onChange={(content) => updateField('description_responsibilities', content)}
                height={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Yêu cầu ứng viên
              </label>
              <TinyMCEEditor
                value={formData.description_requirements}
                onChange={(content) => updateField('description_requirements', content)}
                height={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quyền lợi
              </label>
              <TinyMCEEditor
                value={formData.description_benefits}
                onChange={(content) => updateField('description_benefits', content)}
                height={200}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Trạng thái</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Đang tuyển</option>
                <option value="closed">Đã đóng</option>
                <option value="draft">Nháp</option>
              </select>
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
              {saving ? 'Đang lưu...' : isNew ? 'Tạo mới' : 'Cập nhật'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


















