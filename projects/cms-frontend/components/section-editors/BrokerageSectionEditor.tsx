'use client';

import { useState } from 'react';
import { Plus, Trash2, Factory, Layers } from 'lucide-react';

export interface BrokerageCategory {
  icon: string; // 'factory' | 'layers'
  title: string;
  description: string;
}

export interface BrokerageSectionData {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  advantages: string[];
  process: string[];
  diverse_areas: string[];
  categories: BrokerageCategory[];
}

interface BrokerageSectionEditorProps {
  data: BrokerageSectionData;
  onChange: (data: BrokerageSectionData) => void;
}

const iconOptions = [
  { value: 'factory', label: 'Factory (Nhà xưởng)', Icon: Factory },
  { value: 'layers', label: 'Layers (Đất công nghiệp)', Icon: Layers },
];

export default function BrokerageSectionEditor({ data, onChange }: BrokerageSectionEditorProps) {
  const updateList = (field: 'advantages' | 'process' | 'diverse_areas', index: number, value: string) => {
    const newList = [...data[field]];
    newList[index] = value;
    onChange({ ...data, [field]: newList });
  };

  const addListItem = (field: 'advantages' | 'process' | 'diverse_areas') => {
    onChange({ ...data, [field]: [...data[field], ''] });
  };

  const removeListItem = (field: 'advantages' | 'process' | 'diverse_areas', index: number) => {
    const newList = data[field].filter((_, i) => i !== index);
    onChange({ ...data, [field]: newList });
  };

  const updateCategory = (index: number, field: keyof BrokerageCategory, value: string) => {
    const newCategories = [...data.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    onChange({ ...data, categories: newCategories });
  };

  const addCategory = () => {
    onChange({
      ...data,
      categories: [...data.categories, { icon: 'factory', title: '', description: '' }],
    });
  };

  const removeCategory = (index: number) => {
    onChange({ ...data, categories: data.categories.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Badge</label>
        <input
          type="text"
          value={data.badge}
          onChange={(e) => onChange({ ...data, badge: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Môi giới BĐS Công nghiệp"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Thuê / Mua"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề (highlight)</label>
          <input
            type="text"
            value={data.title_highlight}
            onChange={(e) => onChange({ ...data, title_highlight: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Hiệu Quả"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Phụ đề</label>
        <textarea
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Advantages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Ưu điểm</label>
          <button
            type="button"
            onClick={() => addListItem('advantages')}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.advantages.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateList('advantages', index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Ưu điểm..."
              />
              <button
                type="button"
                onClick={() => removeListItem('advantages', index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Quy trình</label>
          <button
            type="button"
            onClick={() => addListItem('process')}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.process.map((item, index) => (
            <div key={index} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-goldLight/30 text-goldLight text-xs font-bold">
                {index + 1}
              </span>
              <input
                type="text"
                value={item}
                onChange={(e) => updateList('process', index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Bước quy trình..."
              />
              <button
                type="button"
                onClick={() => removeListItem('process', index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Diverse Areas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Diện tích đa dạng</label>
          <button
            type="button"
            onClick={() => addListItem('diverse_areas')}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.diverse_areas.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateList('diverse_areas', index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Diện tích đa dạng..."
              />
              <button
                type="button"
                onClick={() => removeListItem('diverse_areas', index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Danh mục</label>
          <button
            type="button"
            onClick={addCategory}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm danh mục
          </button>
        </div>
        <div className="space-y-4">
          {data.categories.map((category, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Danh mục {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(index)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Icon</label>
                <select
                  value={category.icon}
                  onChange={(e) => updateCategory(index, 'icon', e.target.value)}
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
                <label className="block text-xs text-muted-foreground mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={category.title}
                  onChange={(e) => updateCategory(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Mô tả</label>
                <input
                  type="text"
                  value={category.description}
                  onChange={(e) => updateCategory(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function parseBrokerageHTML(html: string): BrokerageSectionData {
  if (typeof window === 'undefined') {
    // Server-side parsing
    return {
      badge: '',
      title: '',
      title_highlight: '',
      subtitle: '',
      advantages: [],
      process: [],
      diverse_areas: [],
      categories: [],
    };
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.badge')?.textContent?.trim() || '';
  const titleEl = doc.querySelector('h2');
  const titleText = titleEl?.textContent || '';
  const titleHighlight = titleEl?.querySelector('span')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('p')?.textContent?.trim() || '';
  
  const advantages: string[] = [];
  doc.querySelectorAll('.advantages li, [class*="advantage"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) advantages.push(text);
  });
  
  const process: string[] = [];
  doc.querySelectorAll('.process li, [class*="process"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) process.push(text);
  });
  
  const diverseAreas: string[] = [];
  doc.querySelectorAll('.diverse-areas li, [class*="diverse"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) diverseAreas.push(text);
  });
  
  const categories: BrokerageCategory[] = [];
  doc.querySelectorAll('.category-item, [class*="category"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim() || '';
    const desc = el.querySelector('p, .description')?.textContent?.trim() || '';
    if (title) {
      categories.push({ icon: 'factory', title, description: desc });
    }
  });
  
  return {
    badge,
    title: titleText.replace(titleHighlight, '').trim(),
    title_highlight: titleHighlight,
    subtitle,
    advantages,
    process,
    diverse_areas: diverseAreas,
    categories,
  };
}

export function generateBrokerageHTML(data: BrokerageSectionData): string {
  const advantagesHTML = data.advantages.map(a => `<li>${a}</li>`).join('');
  const processHTML = data.process.map((p, i) => `<li><span class="step-number">${i + 1}</span>${p}</li>`).join('');
  const diverseAreasHTML = data.diverse_areas.map(a => `<li>${a}</li>`).join('');
  const categoriesHTML = data.categories.map(c => `
    <div class="category-item">
      <div class="category-icon">${c.icon === 'factory' ? '🏭' : '📦'}</div>
      <h3>${c.title}</h3>
      <p>${c.description}</p>
    </div>
  `).join('');
  
  return `<div id="moi-gioi" class="brokerage-section">
    <div class="section-badge">${data.badge || ''}</div>
    <h2 class="section-title">${data.title || ''} <span class="highlight">${data.title_highlight || ''}</span></h2>
    <p class="section-subtitle">${data.subtitle || ''}</p>
    <div class="brokerage-content">
      <div class="advantages-column">
        <h3>Ưu điểm</h3>
        <ul>${advantagesHTML}</ul>
      </div>
      <div class="process-column">
        <h3>Quy trình</h3>
        <ol>${processHTML}</ol>
      </div>
      <div class="diverse-areas-column">
        <h3>Diện tích đa dạng</h3>
        <ul>${diverseAreasHTML}</ul>
      </div>
    </div>
    <div class="categories-grid">
      ${categoriesHTML}
    </div>
  </div>`;
}


















