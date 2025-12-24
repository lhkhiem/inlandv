'use client';

import { useState } from 'react';
import { Plus, Trash2, Building2, Users, Award, Star } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { getAssetUrl } from '@/lib/api';

export interface ClientStat {
  icon: string; // 'building' | 'users' | 'award' | 'star'
  number: string;
  label: string;
}

export interface ClientCategory {
  id?: string;
  name: string;
  description: string;
  projects_count: string;
  logo_urls: string[];
}

export interface ClientsSectionData {
  badge: string;
  title: string;
  subtitle: string;
  stats: ClientStat[];
  categories: ClientCategory[];
  footer_note?: string;
}

interface ClientsSectionEditorProps {
  data: ClientsSectionData;
  onChange: (data: ClientsSectionData) => void;
}

const statIconOptions = [
  { value: 'building', label: 'Building (KCN)', Icon: Building2 },
  { value: 'users', label: 'Users (Khách hàng)', Icon: Users },
  { value: 'award', label: 'Award (Đối tác)', Icon: Award },
  { value: 'star', label: 'Star (Hài lòng)', Icon: Star },
];

export default function ClientsSectionEditor({ data, onChange }: ClientsSectionEditorProps) {
  const [categoryImageIds, setCategoryImageIds] = useState<Record<number, string[]>>({});

  const updateStat = (index: number, field: 'icon' | 'number' | 'label', value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...data, stats: newStats });
  };

  const addCategory = () => {
    onChange({
      ...data,
      categories: [
        ...data.categories,
        {
          name: '',
          description: '',
          projects_count: '',
          logo_urls: [],
        },
      ],
    });
  };

  const removeCategory = (index: number) => {
    const newCategories = data.categories.filter((_, i) => i !== index);
    onChange({ ...data, categories: newCategories });
    
    // Clean up image IDs
    const newImageIds: Record<number, string[]> = {};
    Object.keys(categoryImageIds).forEach((key) => {
      const idx = parseInt(key);
      if (idx < index) {
        newImageIds[idx] = categoryImageIds[idx];
      } else if (idx > index) {
        newImageIds[idx - 1] = categoryImageIds[idx];
      }
    });
    setCategoryImageIds(newImageIds);
  };

  const updateCategory = (index: number, field: keyof ClientCategory, value: string | string[]) => {
    const newCategories = [...data.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    onChange({ ...data, categories: newCategories });
  };

  const handleCategoryImagesChange = (index: number, ids: string[]) => {
    setCategoryImageIds(prev => ({ ...prev, [index]: ids }));
    // Store IDs directly, not full URLs - URLs will be resolved on frontend
    updateCategory(index, 'logo_urls', ids);
  };

  return (
    <div className="space-y-6">
      {/* Badge */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Badge
        </label>
        <input
          type="text"
          value={data.badge}
          onChange={(e) => onChange({ ...data, badge: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="KHÁCH HÀNG & ĐỐI TÁC"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tiêu đề <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Khách hàng Tiêu biểu"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phụ đề
        </label>
        <textarea
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Hợp tác cùng các công ty FDI hàng đầu..."
        />
      </div>

      {/* Stats */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Thống kê (4 thống kê)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {data.stats.map((stat, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">
                  Thống kê {index + 1}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Icon</label>
                <select
                  value={stat.icon}
                  onChange={(e) => updateStat(index, 'icon', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {statIconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Số</label>
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => updateStat(index, 'number', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="50+"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nhãn</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="KCN hợp tác"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">
            Danh mục đối tác
          </label>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        </div>

        {data.categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có danh mục nào. Click "Thêm danh mục" để bắt đầu.
          </p>
        ) : (
          <div className="space-y-4">
            {data.categories.map((category, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Danh mục {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => updateCategory(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Logo các công ty FDI tiêu biểu"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Mô tả
                  </label>
                  <input
                    type="text"
                    value={category.description}
                    onChange={(e) => updateCategory(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Logo công ty FDI tiêu biểu"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Số dự án thành công
                  </label>
                  <input
                    type="text"
                    value={category.projects_count}
                    onChange={(e) => updateCategory(index, 'projects_count', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="15+"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Logo (nhiều hình)
                  </label>
                  <MediaPicker
                    multiple
                    maxFiles={10}
                    label="Chọn hình ảnh"
                    value={categoryImageIds[index] || []}
                    onChange={(ids) => handleCategoryImagesChange(index, ids)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Note */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Ghi chú cuối trang
        </label>
        <input
          type="text"
          value={data.footer_note || ''}
          onChange={(e) => onChange({ ...data, footer_note: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="* Logo các đối tác sẽ được cập nhật trong phiên bản chính thức"
        />
      </div>
    </div>
  );
}

// Helper functions
export function parseClientsHTML(html: string): ClientsSectionData {
  // Check if content is JSON format (for about page)
  if (html.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(html);
      const stats = (parsed.stats || []).map((stat: any) => ({
        icon: stat.icon?.toLowerCase() || 'building',
        number: stat.value || '',
        label: stat.label || '',
      }));
      // Map clients array to categories format
      const categories = (parsed.clients || []).map((client: any, index: number) => {
        // Extract logo IDs from logo_urls if they exist
        let logoUrls: string[] = [];
        if (client.logo_urls && Array.isArray(client.logo_urls)) {
          logoUrls = client.logo_urls.map((url: string) => {
            // If it's already an ID (no http/https), use it directly
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
              // Remove /uploads/ prefix if present
              return url.replace(/^\/uploads\//, '').replace(/\/$/, '');
            }
            // If it's a full URL, extract ID
            const match = url.match(/\/uploads\/([^\/\?]+)/);
            return match ? match[1] : url;
          });
        }
        return {
          id: client.id?.toString() || index.toString(),
          name: client.name || '',
          description: client.description || '',
          projects_count: client.projects || '',
          logo_urls: logoUrls,
        };
      });
      return {
        badge: parsed.badge || '',
        title: parsed.title || '',
        subtitle: parsed.subtitle || '',
        stats: stats,
        categories: categories,
        footer_note: parsed.footerNote || '',
      };
    } catch (e) {
      // If JSON parse fails, fall through to HTML parsing
      console.warn('Failed to parse as JSON, trying HTML:', e);
    }
  }
  if (typeof window === 'undefined') {
    // Server-side parsing
    const badgeMatch = html.match(/<div[^>]*class=["'][^"']*badge[^"']*["'][^>]*>([^<]+)<\/div>/);
    const badge = badgeMatch ? badgeMatch[1].trim() : '';
    
    const titleMatch = html.match(/<h2[^>]*>.*?<span[^>]*>([^<]+)<\/span>.*?<\/h2>/s);
    const title = titleMatch ? titleMatch[0].replace(/<[^>]+>/g, ' ').trim() : '';
    
    const subtitleMatch = html.match(/<p[^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>([^<]+)<\/p>/);
    const subtitle = subtitleMatch ? subtitleMatch[1].trim() : '';
    
    const stats: ClientStat[] = [];
    const statMatches = html.matchAll(/<div[^>]*class=["'][^"']*stat-item[^"']*["'][^>]*>[\s\S]*?<div[^>]*class=["'][^"']*stat-number[^"']*["'][^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class=["'][^"']*stat-label[^"']*["'][^>]*>([^<]+)<\/div>/g);
    for (const match of statMatches) {
      stats.push({ icon: 'building', number: match[1].trim(), label: match[2].trim() });
    }
    
    const categories: ClientCategory[] = [];
    const categoryMatches = html.matchAll(/<div[^>]*class=["'][^"']*client-category[^"']*["'][^>]*>([\s\S]*?)<\/div>/g);
    for (const match of categoryMatches) {
      const catHTML = match[1];
      const nameMatch = catHTML.match(/<h3[^>]*>([^<]+)<\/h3>/);
      const descMatch = catHTML.match(/<p[^>]*class=["'][^"']*category-subtitle[^"']*["'][^>]*>([^<]+)<\/p>/);
      const countMatch = catHTML.match(/<span[^>]*class=["'][^"']*highlight-number[^"']*["'][^>]*>([^<]+)<\/span>/);
      
      categories.push({
        name: nameMatch ? nameMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
        projects_count: countMatch ? countMatch[1].trim() : '',
        logo_urls: [],
      });
    }
    
    const footerMatch = html.match(/<p[^>]*class=["'][^"']*footer-note[^"']*["'][^>]*>([^<]+)<\/p>/);
    const footerNote = footerMatch ? footerMatch[1].trim() : '';
    
    return {
      badge,
      title,
      subtitle,
      stats: stats.length >= 4 ? stats.slice(0, 4) : stats.concat(Array(4 - stats.length).fill({ icon: 'building', number: '', label: '' })).slice(0, 4),
      categories: categories.length > 0 ? categories : [],
      footer_note: footerNote,
    };
  }
  
  // Client-side parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.section-badge, .badge')?.textContent?.trim() || '';
  const title = doc.querySelector('h2')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('.section-subtitle, .subtitle')?.textContent?.trim() || '';
  
  const stats: ClientStat[] = [];
  const statElements = doc.querySelectorAll('.stat-item, [class*="stat"]');
  statElements.forEach((el) => {
    const number = el.querySelector('.stat-number')?.textContent?.trim() || '';
    const label = el.querySelector('.stat-label')?.textContent?.trim() || '';
    const iconEl = el.querySelector('.stat-icon, .icon');
    const icon = iconEl?.classList.contains('building') ? 'building' :
                 iconEl?.classList.contains('users') ? 'users' :
                 iconEl?.classList.contains('award') ? 'award' :
                 iconEl?.classList.contains('star') ? 'star' : 'building';
    
    if (number || label) {
      stats.push({ icon, number, label });
    }
  });
  
  const categories: ClientCategory[] = [];
  const categoryElements = doc.querySelectorAll('.client-category, [class*="category"]');
  categoryElements.forEach((el) => {
    const name = el.querySelector('h3')?.textContent?.trim() || '';
    const description = el.querySelector('.category-subtitle, .subtitle')?.textContent?.trim() || '';
    const count = el.querySelector('.highlight-number, .projects-count')?.textContent?.trim() || '';
    const logos = Array.from(el.querySelectorAll('.logos-grid img, img')).map(img => (img as HTMLImageElement).src);
    
    if (name) {
      categories.push({ name, description, projects_count: count, logo_urls: logos });
    }
  });
  
  const footerNote = doc.querySelector('.footer-note, .note')?.textContent?.trim() || '';
  
  return {
    badge,
    title,
    subtitle,
    stats: stats.length >= 4 ? stats.slice(0, 4) : stats.concat(Array(4 - stats.length).fill({ icon: 'building', number: '', label: '' })).slice(0, 4),
    categories: categories.length > 0 ? categories : [],
    footer_note: footerNote,
  };
}

// Generate JSON format for clients section (for about page)
export function generateClientsJSON(data: ClientsSectionData, backgroundImage?: string): string {
  const stats = (data.stats || []).map(stat => ({
    icon: stat.icon || 'Building2',
    value: stat.number || '',
    label: stat.label || '',
  }));
  
  // Map categories to clients format for about page
  // Include logo_urls (IDs) so frontend can resolve them
  const clients = (data.categories || []).map(category => {
    // Ensure logo_urls are IDs, not full URLs
    const logoIds = (category.logo_urls || []).map((url: string) => {
      // If it's already an ID (no http/https), use it directly
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // Remove /uploads/ prefix if present
        return url.replace(/^\/uploads\//, '').replace(/\/$/, '');
      }
      // If it's a full URL, extract ID
      const match = url.match(/\/uploads\/([^\/\?]+)/);
      return match ? match[1] : url;
    });
    
    return {
      name: category.name || '',
      description: category.description || '',
      projects: category.projects_count || '',
      logo_urls: logoIds, // Store IDs, not full URLs
    };
  });
  
  const jsonData: any = {
    badge: data.badge || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    stats: stats,
    clients: clients,
  };
  
  if (backgroundImage) {
    // Extract background image ID from URL if needed
    let bgImageValue = backgroundImage;
    const bgUrlMatch = backgroundImage.match(/\/uploads\/([^\/\?]+)/) || 
                      backgroundImage.match(/\/([^\/\?]+)$/);
    if (bgUrlMatch && bgUrlMatch[1]) {
      bgImageValue = `/${bgUrlMatch[1]}`;
    } else if (!backgroundImage.startsWith('http://') && !backgroundImage.startsWith('https://')) {
      bgImageValue = backgroundImage.startsWith('/') ? backgroundImage : `/${backgroundImage}`;
    } else {
      const bgParts = backgroundImage.split('/');
      const bgLastPart = bgParts[bgParts.length - 1];
      if (bgLastPart && !bgLastPart.includes('.')) {
        bgImageValue = `/${bgLastPart}`;
      }
    }
    jsonData.backgroundImage = bgImageValue;
  }
  
  if (data.footer_note) {
    jsonData.footerNote = data.footer_note;
  }
  
  return JSON.stringify(jsonData);
}

export function generateClientsHTML(data: ClientsSectionData): string {
  const iconMap: Record<string, string> = {
    building: '🏭',
    users: '👥',
    award: '🎖️',
    star: '⭐',
  };
  
  const statsHTML = data.stats
    .filter(s => s.number || s.label)
    .map(
      (stat) => `
        <div class="stat-item">
          <div class="stat-icon">${iconMap[stat.icon] || '🏢'}</div>
          <div class="stat-number">${stat.number || ''}</div>
          <div class="stat-label">${stat.label || ''}</div>
        </div>
      `
    )
    .join('');

  const categoriesHTML = data.categories
    .filter(c => c.name)
    .map(
      (category) => `
        <div class="client-category">
          <div class="category-icon">🏢</div>
          <h3>${category.name}</h3>
          <p class="category-subtitle">${category.description || ''}</p>
          <div class="projects-count">
            <span>Dự án thành công</span>
            <span class="highlight-number">${category.projects_count || '0+'}</span>
          </div>
          <div class="logos-grid">
            ${category.logo_urls.map(url => `<img src="${url}" alt="Logo" />`).join('')}
          </div>
        </div>
      `
    )
    .join('');

  return `<div id="khach-hang" class="clients-section">
    <div class="section-badge">${data.badge || 'KHÁCH HÀNG & ĐỐI TÁC'}</div>
    <h2 class="section-title">${data.title || 'Khách hàng'} <span class="highlight">Tiêu biểu</span></h2>
    <p class="section-subtitle">${data.subtitle || ''}</p>
    <div class="clients-stats">
      ${statsHTML}
    </div>
    <div class="clients-categories">
      ${categoriesHTML}
    </div>
    ${data.footer_note ? `<p class="footer-note">${data.footer_note}</p>` : ''}
  </div>`;
}


