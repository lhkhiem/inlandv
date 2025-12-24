'use client';

import { useState, useEffect } from 'react';
import MediaPicker from '@/components/MediaPicker';
import { getAssetUrl } from '@/lib/api';

export interface HeroSectionData {
  logo_url?: string;
  logo_id?: string; // Store logo ID directly from MediaPicker
  logo_alt?: string;
  description: string;
  stats: {
    number: string;
    label: string;
  }[];
}

interface HeroSectionEditorProps {
  data: HeroSectionData;
  onChange: (data: HeroSectionData) => void;
}

export default function HeroSectionEditor({ data, onChange }: HeroSectionEditorProps) {
  const [logoId, setLogoId] = useState<string>('');

  useEffect(() => {
    console.log('[HeroSectionEditor] useEffect - data:', { logo_id: data.logo_id, logo_url: data.logo_url });
    
    // Prioritize logo_id if available (direct from MediaPicker or parsed from JSON)
    let extractedLogoId = '';
    if (data.logo_id) {
      console.log('[HeroSectionEditor] Using logo_id:', data.logo_id);
      extractedLogoId = data.logo_id;
    } else if (data.logo_url) {
      // Fallback: Extract logo ID from URL if exists
      console.log('[HeroSectionEditor] Extracting from logo_url:', data.logo_url);
      // Try multiple patterns to extract ID
      const match = data.logo_url.match(/\/uploads\/([^\/\?]+)/) || 
                    data.logo_url.match(/\/assets\/([^\/\?]+)/) ||
                    data.logo_url.match(/\/([^\/\?]+)$/);
      if (match && match[1]) {
        // Extract ID from URL (e.g., http://localhost:4001/5 -> 5)
        console.log('[HeroSectionEditor] Extracted ID from URL:', match[1]);
        extractedLogoId = match[1];
      } else if (!data.logo_url.includes('/') && !data.logo_url.includes('http')) {
        // If it's already an ID (no slashes, no http)
        console.log('[HeroSectionEditor] Using logo_url as ID:', data.logo_url);
        extractedLogoId = data.logo_url;
      } else if (data.logo_url.startsWith('http://') || data.logo_url.startsWith('https://')) {
        // If it's a full URL, extract last part
        const parts = data.logo_url.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && !lastPart.includes('.')) {
          // Last part is likely an ID (no file extension)
          console.log('[HeroSectionEditor] Extracted last part as ID:', lastPart);
          extractedLogoId = lastPart;
        }
      }
    }
    
    setLogoId(extractedLogoId);
  }, [data.logo_url, data.logo_id]);

  const handleLogoChange = (value: string | string[]) => {
    const ids = Array.isArray(value) ? value : [value];
    const newLogoId = ids[0] || '';
    console.log('[HeroSectionEditor] handleLogoChange:', { value, ids, newLogoId });
    setLogoId(newLogoId);
    const updatedData = {
      ...data,
      logo_url: newLogoId ? getAssetUrl(newLogoId) : '',
      logo_id: newLogoId, // Store ID directly for saving to JSON
    };
    console.log('[HeroSectionEditor] Updated data:', updatedData);
    onChange(updatedData);
  };

  const updateDescription = (description: string) => {
    onChange({ ...data, description });
  };

  const updateStat = (index: number, field: 'number' | 'label', value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...data, stats: newStats });
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Logo
        </label>
        <MediaPicker
          value={logoId ? [logoId] : []}
          onChange={handleLogoChange}
          multiple={false}
          label="Chọn hình ảnh"
          previewSize={80}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Mô tả <span className="text-destructive">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => updateDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Với hơn 15 năm kinh nghiệm trong lĩnh vực bất động sản..."
        />
      </div>

      {/* Stats */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Thống kê
        </label>
        <div className="grid grid-cols-2 gap-4">
          {data.stats.map((stat, index) => (
            <div key={index} className="space-y-2 p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  Thống kê {index + 1}
                </span>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Số
                </label>
                <input
                  type="text"
                  value={stat.number}
                  onChange={(e) => updateStat(index, 'number', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="15+"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">
                  Nhãn
                </label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Năm Kinh Nghiệm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions to convert between HTML and structured data
export function parseHeroHTML(html: string): HeroSectionData {
  // Check if content is JSON format (for about page)
  if (html.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(html);
      // Convert from JSON format to HeroSectionData format
      const stats = (parsed.stats || []).map((stat: any) => ({
        number: `${stat.value || 0}${stat.suffix || ''}`,
        label: stat.label || ''
      }));
      
      // Ensure we have 4 stats
      while (stats.length < 4) {
        stats.push({ number: '', label: '' });
      }
      
      // Extract logo ID from JSON
      // Logo in JSON can be: "/5", "5", "/uploads/5/filename.webp", or "http://localhost:4001/5"
      let logoId = '';
      let logoUrl = '';
      const logoValue = parsed.logo || '';
      
      console.log('[parseHeroHTML] Parsing logo from JSON:', logoValue);
      
      if (logoValue) {
        // Pattern 1: Relative path like "/5" or "/uploads/5/filename.webp"
        if (logoValue.startsWith('/')) {
          // Remove leading slash and extract ID
          const pathParts = logoValue.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            // First part after / is usually the ID (e.g., "/5" -> "5", "/uploads/5/filename" -> "uploads")
            // But for "/5", we want "5"
            // For "/uploads/5/filename", we want "5"
            if (pathParts[0] === 'uploads' || pathParts[0] === 'assets') {
              // Format: /uploads/5/filename -> extract "5"
              logoId = pathParts[1] || '';
            } else {
              // Format: /5 -> extract "5"
              logoId = pathParts[0] || '';
            }
          }
        }
        // Pattern 2: Full URL like "http://localhost:4001/5"
        else if (logoValue.startsWith('http://') || logoValue.startsWith('https://')) {
          try {
            const url = new URL(logoValue);
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
              // Extract last part or ID part
              if (pathParts[0] === 'uploads' || pathParts[0] === 'assets') {
                logoId = pathParts[1] || '';
              } else {
                logoId = pathParts[pathParts.length - 1] || '';
              }
            }
          } catch (e) {
            console.warn('[parseHeroHTML] Failed to parse URL:', e);
          }
        }
        // Pattern 3: Just an ID like "5"
        else {
          logoId = logoValue;
        }
        
        // Generate full URL for display
        if (logoId) {
          logoUrl = getAssetUrl(logoId);
        }
      }
      
      console.log('[parseHeroHTML] Extracted logo:', { logoId, logoUrl, original: logoValue });
      
      return {
        logo_url: logoUrl,
        logo_id: logoId, // Store ID for saving
        logo_alt: '',
        description: parsed.description || '',
        stats: stats.slice(0, 4),
      };
    } catch (e) {
      // If JSON parse fails, fall through to HTML parsing
      console.warn('Failed to parse as JSON, trying HTML:', e);
    }
  }
  
  if (typeof window === 'undefined') {
    // Server-side: use regex parsing
    const logoMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/);
    const logoUrl = logoMatch ? logoMatch[1] : '';
    const logoAltMatch = html.match(/<img[^>]+alt=["']([^"']+)["'][^>]*>/);
    const logoAlt = logoAltMatch ? logoAltMatch[1] : '';
    
    const descMatch = html.match(/<p[^>]*class=["'][^"']*hero-description[^"']*["'][^>]*>([^<]+)<\/p>/);
    const description = descMatch ? descMatch[1].trim() : '';
    
    const stats: { number: string; label: string }[] = [];
    const statMatches = html.matchAll(/<div[^>]*class=["'][^"']*stat-item[^"']*["'][^>]*>[\s\S]*?<div[^>]*class=["'][^"']*stat-number[^"']*["'][^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*class=["'][^"']*stat-label[^"']*["'][^>]*>([^<]+)<\/div>/g);
    for (const match of statMatches) {
      stats.push({ number: match[1].trim(), label: match[2].trim() });
    }
    
    while (stats.length < 4) {
      stats.push({ number: '', label: '' });
    }
    
    return {
      logo_url: logoUrl,
      logo_alt: logoAlt,
      description,
      stats: stats.slice(0, 4),
    };
  }
  
  // Client-side: use DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract logo
  const logoImg = doc.querySelector('.logo-container img');
  const logoUrl = logoImg?.getAttribute('src') || '';
  const logoAlt = logoImg?.getAttribute('alt') || '';

  // Extract description
  const descriptionEl = doc.querySelector('.hero-description');
  const description = descriptionEl?.textContent?.trim() || '';

  // Extract stats
  const stats: { number: string; label: string }[] = [];
  const statItems = doc.querySelectorAll('.stat-item');
  statItems.forEach((item) => {
    const number = item.querySelector('.stat-number')?.textContent?.trim() || '';
    const label = item.querySelector('.stat-label')?.textContent?.trim() || '';
    if (number || label) {
      stats.push({ number, label });
    }
  });

  // Ensure we have at least 4 stats
  while (stats.length < 4) {
    stats.push({ number: '', label: '' });
  }

  return {
    logo_url: logoUrl,
    logo_alt: logoAlt,
    description,
    stats: stats.slice(0, 4),
  };
}

export function generateHeroHTML(data: HeroSectionData): string {
  const logoHTML = data.logo_url
    ? `<div class="logo-container">
        <img src="${data.logo_url}" alt="${data.logo_alt || 'Logo'}" class="logo-image" />
      </div>`
    : `<div class="logo-container">
        <div class="logo-icon">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 10H50V50H10V10Z" stroke="#00C853" stroke-width="2"/>
            <path d="M10 20H50M10 30H50M10 40H50" stroke="#00C853" stroke-width="1"/>
          </svg>
        </div>
        <h1 class="logo-text">INLANDV</h1>
        <p class="logo-subtitle">信缘房地产服务企业顾问</p>
      </div>`;

  const statsHTML = data.stats
    .filter(stat => stat.number || stat.label)
    .map(
      (stat) => `
        <div class="stat-item">
          <div class="stat-number">${stat.number || '0+'}</div>
          <div class="stat-label">${stat.label || ''}</div>
        </div>
      `
    )
    .join('');

  return `<div id="hero" class="hero-section">
    <div class="hero-content">
      ${logoHTML}
      <p class="hero-description">${data.description || ''}</p>
      <div class="stats-grid">
        ${statsHTML}
      </div>
    </div>
  </div>`;
}

// Generate JSON format for hero section (for about page)
export function generateHeroJSON(data: HeroSectionData, backgroundImage?: string, logoId?: string): string {
  // Convert stats format from {number, label} to {value, suffix, label}
  const stats = data.stats
    .filter(stat => stat.number || stat.label)
    .map(stat => {
      // Parse number and suffix (e.g., "15+" -> value: 15, suffix: "+")
      const numberStr = stat.number || '0';
      const match = numberStr.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (match) {
        const value = parseFloat(match[1]);
        const suffix = match[2] || '';
        return {
          value: isNaN(value) ? 0 : value,
          suffix: suffix,
          label: stat.label || ''
        };
      }
      return {
        value: 0,
        suffix: '',
        label: stat.label || ''
      };
    });

  // Use logoId parameter if provided (direct from MediaPicker), otherwise try to extract from data
  let logoValue = '/logo-1.png'; // default
  if (logoId) {
    // Direct ID from MediaPicker - use it directly
    logoValue = `/${logoId}`;
    console.log('[generateHeroJSON] Using logoId directly:', logoValue);
  } else if (data.logo_id) {
    // Use logo_id from data if available
    logoValue = `/${data.logo_id}`;
    console.log('[generateHeroJSON] Using logo_id from data:', logoValue);
  } else if (data.logo_url) {
    // Fallback: extract from URL
    console.log('[generateHeroJSON] Extracting from logo_url:', data.logo_url);
    // Try to extract ID from URL
    // Pattern 1: /uploads/{id}/filename or /assets/{id}/filename
    let urlMatch = data.logo_url.match(/\/uploads\/([^\/\?]+)/) || 
                   data.logo_url.match(/\/assets\/([^\/\?]+)/);
    if (urlMatch && urlMatch[1]) {
      // Extract ID from /uploads/{id}/ or /assets/{id}/
      logoValue = `/${urlMatch[1]}`;
    } else {
      // Pattern 2: Full URL like http://localhost:4001/5
      // Extract last part after the last /
      const parts = data.logo_url.split('/');
      const lastPart = parts[parts.length - 1];
      if (lastPart && !lastPart.includes('.')) {
        // Last part is likely an ID (no file extension)
        logoValue = `/${lastPart}`;
      } else if (!data.logo_url.startsWith('http://') && !data.logo_url.startsWith('https://')) {
        // Pattern 3: Already a relative path or ID
        logoValue = data.logo_url.startsWith('/') ? data.logo_url : `/${data.logo_url}`;
      } else {
        // Pattern 4: Full URL but can't extract ID, keep as is (fallback)
        logoValue = data.logo_url;
      }
    }
  }

  const jsonData: any = {
    logo: logoValue,
    description: data.description || '',
    stats: stats
  };

  if (backgroundImage) {
    // Extract background image ID/relative path from URL
    let bgImageValue = backgroundImage;
    const bgUrlMatch = backgroundImage.match(/\/uploads\/([^\/\?]+)/) || 
                      backgroundImage.match(/\/assets\/([^\/\?]+)/) ||
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

  return JSON.stringify(jsonData);
}

