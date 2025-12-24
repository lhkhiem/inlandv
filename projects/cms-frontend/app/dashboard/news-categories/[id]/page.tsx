'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';

interface NewsCategoryFormData {
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

export default function NewsCategoryFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isNew = !id || id === 'new';
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState<NewsCategoryFormData>({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
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

    const fetchCategory = async () => {
      try {
        setLoading(true);
        if (!id || id === 'undefined') {
          throw new Error('Invalid category ID');
        }
        const response = await axios.get(buildApiUrl(`/news-categories/${id}`), {
          withCredentials: true,
        });
        const data = response.data;
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          description: data.description || '',
          display_order: data.display_order || 0,
          is_active: data.is_active !== false,
        });

        // Set slugManuallyEdited if slug exists (user has edited it before)
        if (data.slug) {
          setSlugManuallyEdited(true);
        }
      } catch (error) {
        console.error('Failed to fetch news category:', error);
        alert('Không thể tải thông tin danh mục');
        router.push('/dashboard/news-categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id, isNew, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Vui lòng điền tên danh mục');
      return;
    }

    try {
      setSaving(true);

      const url = isNew ? buildApiUrl('/news-categories') : buildApiUrl(`/news-categories/${id}`);
      const method = isNew ? 'post' : 'put';
      
      await axios[method](url, formData, {
        withCredentials: true,
      });

      router.push('/dashboard/news-categories');
    } catch (error: any) {
      console.error('Failed to save news category:', error);
      alert(error.response?.data?.error || 'Không thể lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof NewsCategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isNew ? 'Tạo danh mục tin tức' : 'Chỉnh sửa danh mục tin tức'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? 'Thêm danh mục tin tức mới' : 'Cập nhật chi tiết danh mục'}
          </p>
        </div>
        <Link
          href="/dashboard/news-categories"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-2 text-sm hover:bg-accent transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Thông tin cơ bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tên danh mục <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setFormData((prev) => {
                    const newSlug = !slugManuallyEdited && newName
                      ? generateSlug(newName)
                      : prev.slug;
                    return { ...prev, name: newName, slug: newSlug };
                  });
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Slug <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, slug: e.target.value }));
                  setSlugManuallyEdited(true);
                }}
                onBlur={() => {
                  if (!formData.slug && formData.name) {
                    setFormData((prev) => ({ ...prev, slug: generateSlug(prev.name) }));
                    setSlugManuallyEdited(false);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={formData.name ? generateSlug(formData.name) : "tự-động-tạo-từ-tên"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Phiên bản thân thiện với URL của tên. Tự động tạo nếu để trống.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mô tả về danh mục..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Settings */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Cài đặt</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => updateField('display_order', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Số càng nhỏ, hiển thị càng trước
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="h-5 w-5 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                Kích hoạt danh mục
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu danh mục'}
          </button>
        </div>
      </form>
    </div>
  );
}


