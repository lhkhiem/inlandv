'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MediaPicker from './MediaPicker';
import { getAssetUrl } from '@/lib/api';

interface SEOData {
  title?: string;
  description?: string;
  og_image?: string;
  keywords?: string[];
}

interface SEOPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seo: SEOData) => void;
  initialData?: SEOData | null;
}

export default function SEOPopup({ isOpen, onClose, onSave, initialData }: SEOPopupProps) {
  const [seo, setSeo] = useState<SEOData>({
    title: '',
    description: '',
    og_image: '',
    keywords: []
  });
  const [ogImageId, setOgImageId] = useState<string>('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      const data = initialData || {
        title: '',
        description: '',
        og_image: '',
        keywords: []
      };
      setSeo(data);
      setKeywordInput('');
      
      // Extract asset ID from og_image URL if it exists
      if (data.og_image) {
        // Try to find asset ID from URL
        const findAssetIdFromUrl = async (url: string) => {
          try {
            const urlParts = url.split('/');
            const filename = urlParts[urlParts.length - 1];
            
            const response = await fetch(`/api/assets?search=${encodeURIComponent(filename)}&pageSize=100`, {
              credentials: 'include'
            });
            if (response.ok) {
              const result = await response.json();
              const assets = result.data || result;
              const asset = assets.find((a: any) => 
                a.url?.includes(filename) || 
                a.cdn_url?.includes(filename) ||
                a.original_url?.includes(filename)
              );
              return asset?.id || '';
            }
          } catch (err) {
            console.warn('Could not find asset ID from URL:', err);
          }
          return '';
        };
        
        findAssetIdFromUrl(data.og_image).then(id => {
          if (id) setOgImageId(id);
        });
      } else {
        setOgImageId('');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    // Get OG image URL from asset ID if available
    let ogImageUrl = seo.og_image;
    if (ogImageId && !ogImageUrl) {
      try {
        const response = await fetch(`/api/assets/${ogImageId}`, {
          credentials: 'include'
        });
        if (response.ok) {
          const asset = await response.json();
          ogImageUrl = asset.url || asset.cdn_url || asset.original_url || '';
          // Convert to relative path if needed
          if (ogImageUrl.startsWith('http://') || ogImageUrl.startsWith('https://')) {
            try {
              const urlObj = new URL(ogImageUrl);
              ogImageUrl = urlObj.pathname;
            } catch {
              // Keep original URL if parsing fails
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch asset URL:', err);
      }
    }
    
    onSave({
      ...seo,
      og_image: ogImageUrl
    });
    onClose();
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !seo.keywords?.includes(trimmed)) {
      setSeo(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), trimmed]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeo(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg border border-border shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Cấu hình SEO</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tiêu đề SEO *
            </label>
            <input
              type="text"
              value={seo.title || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tiêu đề hiển thị trên kết quả tìm kiếm"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seo.title?.length || 0}/120 ký tự. Khuyến nghị: 50-70 ký tự
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mô tả SEO
            </label>
            <textarea
              rows={3}
              value={seo.description || ''}
              onChange={(e) => setSeo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả hiển thị trên kết quả tìm kiếm và khi chia sẻ"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {seo.description?.length || 0}/160 ký tự. Khuyến nghị: 120-160 ký tự
            </p>
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
                    setSeo(prev => ({ ...prev, og_image: '' }));
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
            <label className="block text-sm font-medium text-foreground mb-2">
              Từ khóa
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập từ khóa và nhấn Enter"
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80"
              >
                Thêm
              </button>
            </div>
            {seo.keywords && seo.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {seo.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t border-border p-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!seo.title?.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lưu
          </button>
        </div>

      </div>
    </div>
  );
}

