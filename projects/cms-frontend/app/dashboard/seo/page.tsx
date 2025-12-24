'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Code, Search, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl, getAssetUrl } from '@/lib/api';
import MediaPicker from '@/components/MediaPicker';
import axios from 'axios';

interface PageMetadata {
  id: string;
  path: string;
  title?: string;
  description?: string;
  og_image?: string;
  keywords?: string[];
  enabled: boolean;
  auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export default function SEOPage() {
  const [metadata, setMetadata] = useState<PageMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PageMetadata | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    path: '',
    title: '',
    description: '',
    og_image: '',
    keywords: '',
    enabled: true,
    auto_generated: false,
  });
  const [ogImageId, setOgImageId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

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
        asset.cdn_url === url ||
        asset.url?.includes(filename) ||
        asset.original_url?.includes(filename) ||
        asset.thumb_url?.includes(filename) ||
        asset.cdn_url?.includes(filename)
      );
      
      return matchingAsset?.id || null;
    } catch (error) {
      console.warn('Could not find asset ID from URL:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl('/page-metadata'), {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch page metadata');

      const data = await response.json();
      setMetadata(data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch page metadata:', error);
      toast.error(error.message || 'Failed to load page metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (path: string) => {
    if (!confirm(`Are you sure you want to delete SEO metadata for "${path}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(`/page-metadata/path/${encodeURIComponent(path)}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete page metadata');

      toast.success('Page metadata deleted successfully');
      fetchMetadata();
    } catch (error) {
      console.error('Failed to delete page metadata:', error);
      toast.error('Failed to delete page metadata');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.path) {
      toast.error('Path is required');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingItem
        ? buildApiUrl(`/page-metadata/path/${encodeURIComponent(editingItem.path)}`)
        : buildApiUrl('/page-metadata');

      const method = editingItem ? 'PUT' : 'POST';

      // Convert ogImageId to URL before sending
      let ogImageUrl = null;
      if (ogImageId) {
        try {
          const assetResponse = await axios.get(buildApiUrl(`/assets/${ogImageId}`), { withCredentials: true });
          ogImageUrl = getAssetUrl(assetResponse.data.url);
        } catch (err) {
          console.warn('Could not fetch OG image asset:', err);
        }
      }

      const body = {
        ...formData,
        og_image: ogImageUrl,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save page metadata');
      }

      toast.success(editingItem ? 'Page metadata updated successfully' : 'Page metadata created successfully');
      setShowModal(false);
      setEditingItem(null);
      setFormData({
        path: '',
        title: '',
        description: '',
        og_image: '',
        keywords: '',
        enabled: true,
        auto_generated: false,
      });
      setOgImageId('');
      fetchMetadata();
    } catch (error: any) {
      console.error('Failed to save page metadata:', error);
      toast.error(error.message || 'Failed to save page metadata');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (item: PageMetadata) => {
    setEditingItem(item);
    setFormData({
      path: item.path,
      title: item.title || '',
      description: item.description || '',
      og_image: item.og_image || '',
      keywords: item.keywords?.join(', ') || '',
      enabled: item.enabled,
      auto_generated: item.auto_generated,
    });
    
    // Convert OG image URL to ID if exists
    if (item.og_image) {
      const ogId = await findAssetIdFromUrl(item.og_image);
      if (ogId) {
        setOgImageId(ogId);
      } else {
        setOgImageId('');
      }
    } else {
      setOgImageId('');
    }
    
    setShowModal(true);
  };

  const filteredMetadata = metadata.filter(item =>
    item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Quản lý SEO
          </h1>
          <p className="text-muted-foreground">
            Quản lý metadata và SEO cho các trang
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setFormData({
              path: '',
              title: '',
              description: '',
              og_image: '',
              keywords: '',
              enabled: true,
              auto_generated: false,
            });
            setOgImageId('');
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm Metadata
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Tìm kiếm theo path hoặc title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-muted-foreground">Loading page metadata...</p>
        </div>
      ) : filteredMetadata.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            {searchQuery ? 'No results found' : 'No page metadata yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            {searchQuery
              ? 'Try a different search query'
              : 'Create your first page metadata to manage SEO settings.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add Page Metadata
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMetadata.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono text-foreground">{item.path}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-foreground">
                        {item.title || <span className="text-muted-foreground">No title</span>}
                      </div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.enabled ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          Disabled
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.auto_generated ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          Auto
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 hover:bg-accent rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.path)}
                          className="p-2 hover:bg-accent rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setEditingItem(null);
              setOgImageId('');
            }
          }}
        >
          <div
            className="bg-card rounded-lg p-6 max-w-2xl w-full my-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-foreground mb-6">
              {editingItem ? 'Edit Page Metadata' : 'Add Page Metadata'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="path" className="block text-sm font-medium text-foreground mb-2">
                  Path <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="/about, /products/slug, etc."
                  required
                  disabled={!!editingItem}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {editingItem ? 'Path cannot be changed after creation' : 'URL path for this page'}
                </p>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Page title for SEO"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Meta Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Meta description for SEO"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  OG Image (Ảnh chia sẻ)
                </label>
                <div className="space-y-2">
                  <MediaPicker
                    label="Chọn ảnh"
                    value={ogImageId}
                    onChange={(value) => {
                      if (Array.isArray(value)) {
                        setOgImageId(value[0] || '');
                      } else {
                        setOgImageId(value || '');
                      }
                    }}
                    multiple={false}
                    previewSize={200}
                  />
                  {ogImageId && (
                    <button
                      type="button"
                      onClick={() => {
                        setOgImageId('');
                        setFormData(prev => ({ ...prev, og_image: '' }));
                      }}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm hover:bg-destructive/90"
                    >
                      Xóa ảnh
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ảnh hiển thị khi chia sẻ lên mạng xã hội (khuyến nghị: 1200x630px)
                </p>
              </div>

              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-foreground mb-2">
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-foreground">
                    Enabled
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="auto_generated"
                    checked={formData.auto_generated}
                    onChange={(e) => setFormData({ ...formData, auto_generated: e.target.checked })}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/50"
                  />
                  <label htmlFor="auto_generated" className="text-sm font-medium text-foreground">
                    Auto-generated
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setOgImageId('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-input bg-background hover:bg-accent transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
