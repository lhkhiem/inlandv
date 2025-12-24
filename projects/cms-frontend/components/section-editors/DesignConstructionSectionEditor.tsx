'use client';

import { useState } from 'react';
import { Plus, Trash2, Ruler, Hammer, ClipboardList, Layers, Building, BadgeCheck } from 'lucide-react';

export interface DesignPhase {
  icon: string; // 'clipboard-list' | 'ruler' | 'layers' | 'hammer' | 'building' | 'badge-check'
  title: string;
  description: string;
}

export interface DesignStat {
  value: string;
  label: string;
}

export interface DesignConstructionSectionData {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  phases: DesignPhase[];
  advantages: string[];
  quality_title: string;
  quality_description: string;
  quality_stats: DesignStat[];
  interlink_title: string;
  interlink_description: string;
  interlink_items: string[];
}

interface DesignConstructionSectionEditorProps {
  data: DesignConstructionSectionData;
  onChange: (data: DesignConstructionSectionData) => void;
}

const iconOptions = [
  { value: 'clipboard-list', label: 'Clipboard List (Khảo sát)', Icon: ClipboardList },
  { value: 'ruler', label: 'Ruler (Concept)', Icon: Ruler },
  { value: 'layers', label: 'Layers (Kỹ thuật)', Icon: Layers },
  { value: 'hammer', label: 'Hammer (Thi công)', Icon: Hammer },
  { value: 'building', label: 'Building (Nghiệm thu)', Icon: Building },
  { value: 'badge-check', label: 'Badge Check (Vận hành)', Icon: BadgeCheck },
];

export default function DesignConstructionSectionEditor({ data, onChange }: DesignConstructionSectionEditorProps) {
  const updatePhase = (index: number, field: keyof DesignPhase, value: string) => {
    const newPhases = [...data.phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    onChange({ ...data, phases: newPhases });
  };

  const addPhase = () => {
    onChange({
      ...data,
      phases: [...data.phases, { icon: 'clipboard-list', title: '', description: '' }],
    });
  };

  const removePhase = (index: number) => {
    onChange({ ...data, phases: data.phases.filter((_, i) => i !== index) });
  };

  const updateAdvantage = (index: number, value: string) => {
    const newAdvantages = [...data.advantages];
    newAdvantages[index] = value;
    onChange({ ...data, advantages: newAdvantages });
  };

  const addAdvantage = () => {
    onChange({ ...data, advantages: [...data.advantages, ''] });
  };

  const removeAdvantage = (index: number) => {
    onChange({ ...data, advantages: data.advantages.filter((_, i) => i !== index) });
  };

  const updateQualityStat = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...data.quality_stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...data, quality_stats: newStats });
  };

  const updateInterlinkItem = (index: number, value: string) => {
    const newItems = [...data.interlink_items];
    newItems[index] = value;
    onChange({ ...data, interlink_items: newItems });
  };

  const addInterlinkItem = () => {
    onChange({ ...data, interlink_items: [...data.interlink_items, ''] });
  };

  const removeInterlinkItem = (index: number) => {
    onChange({ ...data, interlink_items: data.interlink_items.filter((_, i) => i !== index) });
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
          placeholder="Thiết kế & Thi công"
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
            placeholder="Triển Khai"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề (highlight)</label>
          <input
            type="text"
            value={data.title_highlight}
            onChange={(e) => onChange({ ...data, title_highlight: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Chuẩn Hoá"
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

      {/* Phases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Các giai đoạn</label>
          <button
            type="button"
            onClick={addPhase}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm giai đoạn
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {data.phases.map((phase, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Giai đoạn {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removePhase(index)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Icon</label>
                <select
                  value={phase.icon}
                  onChange={(e) => updatePhase(index, 'icon', e.target.value)}
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
                  value={phase.title}
                  onChange={(e) => updatePhase(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Mô tả</label>
                <input
                  type="text"
                  value={phase.description}
                  onChange={(e) => updatePhase(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advantages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Lợi thế tích hợp</label>
          <button
            type="button"
            onClick={addAdvantage}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.advantages.map((advantage, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={advantage}
                onChange={(e) => updateAdvantage(index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeAdvantage(index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Control */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề kiểm soát chất lượng</label>
        <input
          type="text"
          value={data.quality_title}
          onChange={(e) => onChange({ ...data, quality_title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Kiểm soát chất lượng"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Mô tả kiểm soát chất lượng</label>
        <textarea
          value={data.quality_description}
          onChange={(e) => onChange({ ...data, quality_description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Thống kê chất lượng (4 thống kê)</label>
        <div className="grid grid-cols-2 gap-4">
          {data.quality_stats.map((stat, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Giá trị</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateQualityStat(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="98%"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nhãn</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateQualityStat(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Đúng tiến độ"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERLINK */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề INTERLINK</label>
        <input
          type="text"
          value={data.interlink_title}
          onChange={(e) => onChange({ ...data, interlink_title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Kết nối INTERLINK"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Mô tả INTERLINK</label>
        <textarea
          value={data.interlink_description}
          onChange={(e) => onChange({ ...data, interlink_description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Danh sách INTERLINK</label>
          <button
            type="button"
            onClick={addInterlinkItem}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.interlink_items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateInterlinkItem(index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeInterlinkItem(index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function parseDesignConstructionHTML(html: string): DesignConstructionSectionData {
  if (typeof window === 'undefined') {
    return {
      badge: '',
      title: '',
      title_highlight: '',
      subtitle: '',
      phases: [],
      advantages: [],
      quality_title: '',
      quality_description: '',
      quality_stats: [],
      interlink_title: '',
      interlink_description: '',
      interlink_items: [],
    };
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.badge')?.textContent?.trim() || '';
  const titleEl = doc.querySelector('h2');
  const titleText = titleEl?.textContent || '';
  const titleHighlight = titleEl?.querySelector('span')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('p')?.textContent?.trim() || '';
  
  const phases: DesignPhase[] = [];
  doc.querySelectorAll('.phase-item, [class*="phase"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim() || '';
    const desc = el.querySelector('p, .description')?.textContent?.trim() || '';
    if (title) {
      phases.push({ icon: 'clipboard-list', title, description: desc });
    }
  });
  
  const advantages: string[] = [];
  doc.querySelectorAll('.advantages li, [class*="advantage"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) advantages.push(text);
  });
  
  const qualityTitle = doc.querySelector('.quality h3')?.textContent?.trim() || '';
  const qualityDesc = doc.querySelector('.quality p')?.textContent?.trim() || '';
  
  const qualityStats: DesignStat[] = [];
  doc.querySelectorAll('.quality .stat-item, .quality [class*="stat"]').forEach((el) => {
    const value = el.querySelector('.value')?.textContent?.trim() || '';
    const label = el.querySelector('.label')?.textContent?.trim() || '';
    if (value || label) {
      qualityStats.push({ value, label });
    }
  });
  
  const interlinkTitle = doc.querySelector('.interlink h3')?.textContent?.trim() || '';
  const interlinkDesc = doc.querySelector('.interlink p')?.textContent?.trim() || '';
  
  const interlinkItems: string[] = [];
  doc.querySelectorAll('.interlink li, .interlink [class*="item"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) interlinkItems.push(text);
  });
  
  return {
    badge,
    title: titleText.replace(titleHighlight, '').trim(),
    title_highlight: titleHighlight,
    subtitle,
    phases,
    advantages,
    quality_title: qualityTitle,
    quality_description: qualityDesc,
    quality_stats: qualityStats.length >= 4 ? qualityStats.slice(0, 4) : qualityStats.concat(Array(4 - qualityStats.length).fill({ value: '', label: '' })).slice(0, 4),
    interlink_title: interlinkTitle,
    interlink_description: interlinkDesc,
    interlink_items: interlinkItems,
  };
}

export function generateDesignConstructionHTML(data: DesignConstructionSectionData): string {
  const phasesHTML = data.phases.map(p => `
    <div class="phase-item">
      <div class="phase-icon">${p.icon === 'clipboard-list' ? '📋' : p.icon === 'ruler' ? '📏' : p.icon === 'layers' ? '📚' : p.icon === 'hammer' ? '🔨' : p.icon === 'building' ? '🏢' : '✅'}</div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
    </div>
  `).join('');
  
  const advantagesHTML = data.advantages.map(a => `<li>${a}</li>`).join('');
  const qualityStatsHTML = data.quality_stats.map(s => `
    <div class="stat-item">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
  const interlinkItemsHTML = data.interlink_items.map(i => `<li>${i}</li>`).join('');
  
  return `<div id="thiet-ke-thi-cong" class="design-construction-section">
    <div class="section-badge">${data.badge || ''}</div>
    <h2 class="section-title">${data.title || ''} <span class="highlight">${data.title_highlight || ''}</span></h2>
    <p class="section-subtitle">${data.subtitle || ''}</p>
    <div class="phases-grid">${phasesHTML}</div>
    <div class="design-content">
      <div class="advantages-column">
        <h3>Lợi thế tích hợp</h3>
        <ul>${advantagesHTML}</ul>
      </div>
      <div class="quality-column">
        <h3>${data.quality_title || 'Kiểm soát chất lượng'}</h3>
        <p>${data.quality_description || ''}</p>
        <div class="quality-stats-grid">${qualityStatsHTML}</div>
      </div>
      <div class="interlink-column">
        <h3>${data.interlink_title || 'Kết nối INTERLINK'}</h3>
        <p>${data.interlink_description || ''}</p>
        <ul>${interlinkItemsHTML}</ul>
      </div>
    </div>
  </div>`;
}


