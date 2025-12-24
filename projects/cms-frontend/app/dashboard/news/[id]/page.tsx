'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Plus, Edit2, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import MediaPicker from '@/components/MediaPicker';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import SEOPopup from '@/components/SEOPopup';
import { useAuthStore } from '@/store/authStore';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import { generateSlug } from '@/lib/slug';

interface NewsFormData {
  title: string;
  slug: string;
  category_id: string;
  thumbnail?: string;
  excerpt?: string;
  content: string;
  author?: string;
  featured: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function NewsFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const isNew = !id || id === 'new';
  const { user, hydrate } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string>('');
  const [showSeoPopup, setShowSeoPopup] = useState(false);
  const [ogImageId, setOgImageId] = useState<string>('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    slug: '',
    category_id: '',
    thumbnail: '',
    excerpt: '',
    content: '',
    author: '',
    featured: false,
    published_at: isNew ? getTodayDate() : undefined,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
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
      
      // Load categories
      await loadCategories();
      
      // Set author from logged-in user for new posts
      if (isMounted && isNew && useAuthStore.getState().user?.name) {
        setFormData(prev => ({
          ...prev,
          author: useAuthStore.getState().user?.name || prev.author
        }));
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

  const loadCategories = async () => {
    try {
      const catResponse = await axios.get(buildApiUrl('/news-categories'), {
        params: { pageSize: 100 },
        withCredentials: true,
      });
      setCategories(catResponse.data?.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      slug: '',
      description: '',
      display_order: categories.length,
      is_active: true,
    });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      display_order: category.display_order || 0,
      is_active: category.is_active !== false,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update
        await axios.put(buildApiUrl(`/news-categories/${editingCategory.id}`), categoryFormData, {
          withCredentials: true,
        });
      } else {
        // Create
        const response = await axios.post(buildApiUrl('/news-categories'), categoryFormData, {
          withCredentials: true,
        });
        // Select newly created category
        if (response.data?.id) {
          setFormData(prev => ({ ...prev, category_id: response.data.id }));
        }
      }
      await loadCategories();
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.error || 'Không thể lưu danh mục');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    
    try {
      await axios.delete(buildApiUrl(`/news-categories/${id}`), {
        withCredentials: true,
      });
      // Clear selection if deleted category was selected
      if (formData.category_id === id) {
        setFormData(prev => ({ ...prev, category_id: '' }));
      }
      await loadCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.error || 'Không thể xóa danh mục');
    }
  };

  useEffect(() => {
    if (!isInitialized || isNew || !id) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        if (!id || id === 'undefined') {
          throw new Error('Invalid news ID');
        }
        const response = await axios.get(buildApiUrl(`/news/${id}`), {
          withCredentials: true,
        });
        const data = response.data;
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          category_id: data.category_id || '',
          thumbnail: data.thumbnail || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          author: data.author || '',
          featured: data.featured || false,
          published_at: data.published_at ? (data.published_at.split('T')[0] || undefined) : undefined,
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
        });

        // Set slugManuallyEdited if slug exists (user has edited it before)
        if (data.slug) {
          setSlugManuallyEdited(true);
        }

        // Load thumbnail image
        if (data.thumbnail) {
          const thumbId = await findAssetIdFromUrl(data.thumbnail);
          if (thumbId) setThumbnailId(thumbId);
        }

        // Load OG image if exists
        if ((data as any).meta_og_image) {
          const ogId = await findAssetIdFromUrl((data as any).meta_og_image);
          if (ogId) setOgImageId(ogId);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        alert('Không thể tải thông tin tin tức');
        router.push('/dashboard/news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, isNew, isInitialized, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id || !formData.content) {
      alert('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    try {
      setSaving(true);

      // Get thumbnail URL from asset ID
      let thumbnailUrl = formData.thumbnail || null;
      if (thumbnailId) {
        try {
          const assetResponse = await axios.get(buildApiUrl(`/assets/${thumbnailId}`), {
            withCredentials: true,
          });
          thumbnailUrl = getAssetUrl(assetResponse.data.url);
        } catch (err) {
          console.warn('Could not fetch thumbnail asset:', err);
        }
      }

      // Normalize published_at to YYYY-MM-DD for date input compatibility
      const publishedAt = formData.published_at
        ? formData.published_at.split('T')[0]
        : null;

      // Use logged-in user name as author if author is empty
      const authorName = formData.author || user?.name || null;

      const data: any = {
        ...formData,
        author: authorName,
        published_at: publishedAt,
        thumbnail: thumbnailUrl,
      };

      const url = isNew ? buildApiUrl('/news') : buildApiUrl(`/news/${id}`);
      const method = isNew ? 'post' : 'put';
      
      await axios[method](url, data, {
        withCredentials: true,
      });

      router.push('/dashboard/news');
    } catch (error: any) {
      console.error('Failed to save news:', error);
      alert(error.response?.data?.error || 'Không thể lưu tin tức');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof NewsFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleThumbnailChange = (value: string | string[]) => {
    const id = Array.isArray(value) ? (value[0] || '') : (value || '');
    setThumbnailId(id);
  };

  // Helper function to find asset ID from URL
  const findAssetIdFromUrl = async (url: string): Promise<string | null> => {
    if (!url) return null;
    
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      const assetsResponse = await axios.get(buildApiUrl('/assets'), {
        params: { 
          search: filename,
          pageSize: 100 
        },
        withCredentials: true,
      });
      
      const assets = assetsResponse.data?.data || [];
      
      let matchingAsset = assets.find((asset: any) => 
        asset.url === url || 
        asset.original_url === url ||
        asset.thumb_url === url ||
        asset.medium_url === url ||
        asset.large_url === url
      );
      
      if (!matchingAsset) {
        matchingAsset = assets.find((asset: any) => 
          asset.url?.includes(filename) ||
          asset.file_name === filename ||
          asset.url?.endsWith(filename)
        );
      }
      
      return matchingAsset?.id || null;
    } catch (err) {
      console.warn('Could not find asset ID for URL:', url, err);
      return null;
    }
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
            {isNew ? 'Tạo tin tức' : 'Chỉnh sửa tin tức'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? 'Thêm tin tức mới' : 'Cập nhật chi tiết tin tức'}
          </p>
        </div>
        <Link
          href="/dashboard/news"
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
                Tiêu đề <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData((prev) => {
                    const newSlug = !slugManuallyEdited && newTitle
                      ? generateSlug(newTitle)
                      : prev.slug;
                    return { ...prev, title: newTitle, slug: newSlug };
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-foreground">
                    Danh mục <span className="text-destructive">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm mới
                  </button>
                </div>
                <div className="flex gap-2">
                  <select
                    value={formData.category_id}
                    onChange={(e) => updateField('category_id', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories
                      .filter(cat => cat.is_active !== false)
                      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                  {formData.category_id && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const category = categories.find(c => c.id === formData.category_id);
                          if (category) handleOpenEditCategory(category);
                        }}
                        className="px-2 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors"
                        title="Sửa danh mục"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const category = categories.find(c => c.id === formData.category_id);
                          if (category) handleDeleteCategory(category.id, category.name);
                        }}
                        className="px-2 py-2 rounded-lg border border-input bg-background text-destructive hover:bg-destructive/10 transition-colors"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tác giả
                </label>
                <input
                  type="text"
                  value={formData.author || user?.name || ''}
                  onChange={(e) => updateField('author', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={user?.name || 'Tên tác giả'}
                />
                {user?.name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Mặc định: {user.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Nội dung</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Mô tả ngắn
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => updateField('excerpt', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mô tả ngắn về tin tức..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nội dung <span className="text-destructive">*</span>
              </label>
              <TinyMCEEditor
                value={formData.content || ''}
                onChange={(value) => updateField('content', value)}
                placeholder="Nhập nội dung tin tức..."
                id="news-content"
              />
            </div>
          </div>

          {/* Media */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Media</h3>
            
            <div>
              <MediaPicker
                label="Hình đại diện"
                value={thumbnailId}
                onChange={handleThumbnailChange}
                multiple={false}
                previewSize={200}
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
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => updateField('featured', e.target.checked)}
                  className="h-5 w-5 rounded border-input text-primary focus:ring-2 focus:ring-ring focus:ring-offset-0"
                />
                Tin nổi bật
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-card-foreground">SEO</h3>
              <button
                type="button"
                onClick={() => setShowSeoPopup(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
              >
                Cấu hình SEO
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Title
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => updateField('meta_title', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tiêu đề SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Description
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => updateField('meta_description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Mô tả SEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meta Keywords
              </label>
              <input
                type="text"
                value={formData.meta_keywords}
                onChange={(e) => updateField('meta_keywords', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Từ khóa (phân cách bằng dấu phẩy)"
              />
            </div>
          </div>

          {/* Published Date */}
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-medium text-card-foreground">Xuất bản</h3>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Ngày xuất bản
              </label>
              <input
                type="date"
                value={formData.published_at || ''}
                onChange={(e) => updateField('published_at', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Để trống nếu muốn lưu dưới dạng nháp
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu tin tức'}
          </button>
        </div>
      </form>

      {/* SEO Popup */}
      {showSeoPopup && (
        <SEOPopup
          isOpen={showSeoPopup}
          onClose={() => setShowSeoPopup(false)}
          onSave={(seoData) => {
            updateField('meta_title', seoData.title || '');
            updateField('meta_description', seoData.description || '');
            if (seoData.keywords && seoData.keywords.length > 0) {
              updateField('meta_keywords', seoData.keywords.join(', '));
            }
            if (seoData.og_image) {
              console.log('OG Image URL:', seoData.og_image);
            }
            setShowSeoPopup(false);
          }}
          initialData={{
            title: formData.meta_title,
            description: formData.meta_description,
            og_image: ogImageId ? getAssetUrl(ogImageId) : '',
            keywords: formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()).filter(k => k) : []
          }}
        />
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCategoryModal(false);
              setEditingCategory(null);
            }
          }}
        >
          <div 
            className="bg-card rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tên danh mục <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setCategoryFormData(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug || generateSlug(name),
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nhập tên danh mục"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Tự động tạo từ tên"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Phiên bản thân thiện với URL. Tự động tạo nếu để trống.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Mô tả
                </label>
                <textarea
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Mô tả về danh mục"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={categoryFormData.display_order}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="flex items-center pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryFormData.is_active}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded border-input"
                    />
                    <span className="text-sm text-foreground">Kích hoạt</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                  {editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-input bg-background text-foreground hover:bg-muted transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

