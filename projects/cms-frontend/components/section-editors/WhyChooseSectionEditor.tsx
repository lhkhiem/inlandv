'use client';

import { useState } from 'react';
import { Plus, Trash2, Award, Users, Network, Shield } from 'lucide-react';

export interface WhyChooseFeature {
  id?: string;
  icon: string; // 'award' | 'users' | 'network' | 'shield' | 'custom'
  title: string;
  subtitle: string;
  description: string;
}

export interface WhyChooseSectionData {
  badge: string;
  title: string;
  subtitle: string;
  features: WhyChooseFeature[];
}

interface WhyChooseSectionEditorProps {
  data: WhyChooseSectionData;
  onChange: (data: WhyChooseSectionData) => void;
}

const iconOptions = [
  { value: 'award', label: 'Award (Kinh nghiệm)', Icon: Award },
  { value: 'users', label: 'Users (Đội ngũ)', Icon: Users },
  { value: 'network', label: 'Network (Mạng lưới)', Icon: Network },
  { value: 'shield', label: 'Shield (Minh bạch)', Icon: Shield },
];

export default function WhyChooseSectionEditor({ data, onChange }: WhyChooseSectionEditorProps) {
  const addFeature = () => {
    onChange({
      ...data,
      features: [
        ...data.features,
        {
          icon: 'award',
          title: '',
          subtitle: '',
          description: '',
        },
      ],
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = data.features.filter((_, i) => i !== index);
    onChange({ ...data, features: newFeatures });
  };

  const updateFeature = (index: number, field: keyof WhyChooseFeature, value: string) => {
    const newFeatures = [...data.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    onChange({ ...data, features: newFeatures });
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
          placeholder="UY TÍN & CHẤT LƯỢNG"
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
          placeholder="Tại sao nên chọn Inlandv"
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
          placeholder="Những điểm mạnh tạo nên uy tín và sự tin cậy..."
        />
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">
            Tính năng / Điểm mạnh
          </label>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm tính năng
          </button>
        </div>

        {data.features.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có tính năng nào. Click "Thêm tính năng" để bắt đầu.
          </p>
        ) : (
          <div className="space-y-4">
            {data.features.map((feature, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">
                    Tính năng {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Icon
                  </label>
                  <select
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Tiêu đề <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Kinh nghiệm dày dặn"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Phụ đề
                  </label>
                  <input
                    type="text"
                    value={feature.subtitle}
                    onChange={(e) => updateFeature(index, 'subtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Hơn 15 năm trong lĩnh vực BĐS"
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Với hơn 15 năm kinh nghiệm..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
export function parseWhyChooseHTML(html: string): WhyChooseSectionData {
  // Check if content is JSON format (for about page)
  if (html.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(html);
      // Map items to features format
      const items = (parsed.items || []).map((item: any) => ({
        id: item.id?.toString() || '',
        icon: (item.icon || 'award').toLowerCase(),
        title: item.title || '',
        subtitle: item.subtitle || '',
        description: item.description || '',
      }));
      return {
        badge: parsed.badge || '',
        title: parsed.title || '',
        subtitle: parsed.subtitle || '',
        features: items,
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
    
    const features: WhyChooseFeature[] = [];
    const featureMatches = html.matchAll(/<div[^>]*class=["'][^"']*feature-item[^"']*["'][^>]*>([\s\S]*?)<\/div>/g);
    for (const match of featureMatches) {
      const featureHTML = match[1];
      const titleMatch = featureHTML.match(/<h3[^>]*>([^<]+)<\/h3>/);
      const subtitleMatch = featureHTML.match(/<p[^>]*class=["'][^"']*subtitle[^"']*["'][^>]*>([^<]+)<\/p>/);
      const descMatch = featureHTML.match(/<p[^>]*class=["'][^"']*description[^"']*["'][^>]*>([^<]+)<\/p>/);
      const iconMatch = featureHTML.match(/<div[^>]*class=["'][^"']*icon[^"']*["'][^>]*>.*?class=["']([^"']+)["']/);
      
      features.push({
        icon: iconMatch ? iconMatch[1] : 'award',
        title: titleMatch ? titleMatch[1].trim() : '',
        subtitle: subtitleMatch ? subtitleMatch[1].trim() : '',
        description: descMatch ? descMatch[1].trim() : '',
      });
    }
    
    return {
      badge,
      title,
      subtitle,
      features: features.length > 0 ? features : [],
    };
  }
  
  // Client-side parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.section-badge, .badge')?.textContent?.trim() || '';
  const title = doc.querySelector('h2')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('.section-subtitle, .subtitle')?.textContent?.trim() || '';
  
  const features: WhyChooseFeature[] = [];
  const featureElements = doc.querySelectorAll('.feature-item, [class*="feature"]');
  featureElements.forEach((el) => {
    const title = el.querySelector('h3')?.textContent?.trim() || '';
    const subtitle = el.querySelector('.feature-subtitle, .subtitle')?.textContent?.trim() || '';
    const description = el.querySelector('p:not(.subtitle)')?.textContent?.trim() || '';
    const iconEl = el.querySelector('.feature-icon, .icon');
    const icon = iconEl?.classList.contains('award') ? 'award' :
                 iconEl?.classList.contains('users') ? 'users' :
                 iconEl?.classList.contains('network') ? 'network' :
                 iconEl?.classList.contains('shield') ? 'shield' : 'award';
    
    if (title) {
      features.push({ icon, title, subtitle, description });
    }
  });
  
  return {
    badge,
    title,
    subtitle,
    features: features.length > 0 ? features : [],
  };
}

// Generate JSON format for why choose section (for about page)
export function generateWhyChooseJSON(data: WhyChooseSectionData, backgroundImage?: string): string {
  // Map icon from lowercase (award, users, etc.) to capitalized (Award, Users, etc.)
  const iconMap: Record<string, string> = {
    'award': 'Award',
    'users': 'Users',
    'network': 'Network',
    'shield': 'Shield',
  };
  
  const items = (data.features || []).map((item: any) => {
    const iconKey = (item.icon || 'award').toLowerCase();
    return {
      icon: iconMap[iconKey] || 'Award',
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || '',
    };
  });
  
  const jsonData: any = {
    badge: data.badge || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    items: items,
  };
  
  if (backgroundImage) {
    jsonData.backgroundImage = backgroundImage;
  }
  
  return JSON.stringify(jsonData);
}

export function generateWhyChooseHTML(data: WhyChooseSectionData): string {
  const iconMap: Record<string, string> = {
    award: '🛡️',
    users: '👥',
    network: '🌐',
    shield: '✅',
  };
  
  const featuresHTML = data.features
    .filter(f => f.title)
    .map(
      (feature) => `
        <div class="feature-item">
          <div class="feature-icon">${iconMap[feature.icon] || '📊'}</div>
          <h3>${feature.title}</h3>
          <p class="feature-subtitle">${feature.subtitle || ''}</p>
          <p>${feature.description || ''}</p>
        </div>
      `
    )
    .join('');

  return `<div id="tai-sao" class="why-choose-section">
    <div class="section-badge">${data.badge || 'UY TÍN & CHẤT LƯỢNG'}</div>
    <h2 class="section-title">${data.title || 'Tại sao nên chọn'} <span class="highlight">Inlandv</span></h2>
    <p class="section-subtitle">${data.subtitle || ''}</p>
    <div class="features-grid">
      ${featuresHTML}
    </div>
  </div>`;
}


