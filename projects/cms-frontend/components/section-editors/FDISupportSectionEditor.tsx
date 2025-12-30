'use client';

import { useState } from 'react';
import { Plus, Trash2, Users, Briefcase, Globe2, HeartHandshake } from 'lucide-react';

export interface FDIPillar {
  icon: string; // 'users' | 'briefcase' | 'globe2' | 'heart-handshake'
  title: string;
  description: string;
}

export interface FDIOutcome {
  value: string;
  label: string;
}

export interface FDIStat {
  value: string;
  label: string;
}

export interface FDISupportSectionData {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  pillars: FDIPillar[];
  services: string[];
  outcomes: FDIOutcome[];
  summary_title: string;
  summary_description: string;
  stats: FDIStat[];
}

interface FDISupportSectionEditorProps {
  data: FDISupportSectionData;
  onChange: (data: FDISupportSectionData) => void;
}

const iconOptions = [
  { value: 'users', label: 'Users (Tuyển dụng)', Icon: Users },
  { value: 'briefcase', label: 'Briefcase (Nhân sự)', Icon: Briefcase },
  { value: 'globe2', label: 'Globe (Hội nhập)', Icon: Globe2 },
  { value: 'heart-handshake', label: 'Heart Handshake (Đời sống)', Icon: HeartHandshake },
];

export default function FDISupportSectionEditor({ data, onChange }: FDISupportSectionEditorProps) {
  const updatePillar = (index: number, field: keyof FDIPillar, value: string) => {
    const newPillars = [...data.pillars];
    newPillars[index] = { ...newPillars[index], [field]: value };
    onChange({ ...data, pillars: newPillars });
  };

  const addPillar = () => {
    onChange({
      ...data,
      pillars: [...data.pillars, { icon: 'users', title: '', description: '' }],
    });
  };

  const removePillar = (index: number) => {
    onChange({ ...data, pillars: data.pillars.filter((_, i) => i !== index) });
  };

  const updateService = (index: number, value: string) => {
    const newServices = [...data.services];
    newServices[index] = value;
    onChange({ ...data, services: newServices });
  };

  const addService = () => {
    onChange({ ...data, services: [...data.services, ''] });
  };

  const removeService = (index: number) => {
    onChange({ ...data, services: data.services.filter((_, i) => i !== index) });
  };

  const updateOutcome = (index: number, field: 'value' | 'label', value: string) => {
    const newOutcomes = [...data.outcomes];
    newOutcomes[index] = { ...newOutcomes[index], [field]: value };
    onChange({ ...data, outcomes: newOutcomes });
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    const newStats = [...data.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onChange({ ...data, stats: newStats });
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
          placeholder="Hỗ trợ FDI"
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
            placeholder="Vận Hành Ổn Định Ngay Từ Ngày Đầu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề (highlight)</label>
          <input
            type="text"
            value={data.title_highlight}
            onChange={(e) => onChange({ ...data, title_highlight: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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

      {/* Pillars */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">4 Trụ cột</label>
          <button
            type="button"
            onClick={addPillar}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm trụ cột
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {data.pillars.map((pillar, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Trụ cột {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removePillar(index)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Icon</label>
                <select
                  value={pillar.icon}
                  onChange={(e) => updatePillar(index, 'icon', e.target.value)}
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
                  value={pillar.title}
                  onChange={(e) => updatePillar(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Mô tả</label>
                <input
                  type="text"
                  value={pillar.description}
                  onChange={(e) => updatePillar(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Danh mục hỗ trợ</label>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.services.map((service, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={service}
                onChange={(e) => updateService(index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeService(index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Outcomes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Kết quả (4 kết quả)</label>
        <div className="grid grid-cols-2 gap-4">
          {data.outcomes.map((outcome, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Giá trị</label>
                <input
                  type="text"
                  value={outcome.value}
                  onChange={(e) => updateOutcome(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="30%+"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nhãn</label>
                <input
                  type="text"
                  value={outcome.label}
                  onChange={(e) => updateOutcome(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Rút ngắn thời gian tuyển"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề phần tóm tắt</label>
        <input
          type="text"
          value={data.summary_title}
          onChange={(e) => onChange({ ...data, summary_title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Tại sao quan trọng"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Mô tả phần tóm tắt</label>
        <textarea
          value={data.summary_description}
          onChange={(e) => onChange({ ...data, summary_description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Stats */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Thống kê (3 thống kê)</label>
        <div className="space-y-3">
          {data.stats.map((stat, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-2">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Giá trị</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => updateStat(index, 'value', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nhãn</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
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

export function parseFDISupportHTML(html: string): FDISupportSectionData {
  if (typeof window === 'undefined') {
    return {
      badge: '',
      title: '',
      title_highlight: '',
      subtitle: '',
      pillars: [],
      services: [],
      outcomes: [],
      summary_title: '',
      summary_description: '',
      stats: [],
    };
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.badge')?.textContent?.trim() || '';
  const titleEl = doc.querySelector('h2');
  const titleText = titleEl?.textContent || '';
  const titleHighlight = titleEl?.querySelector('span')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('p')?.textContent?.trim() || '';
  
  const pillars: FDIPillar[] = [];
  doc.querySelectorAll('.pillar-item, [class*="pillar"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim() || '';
    const desc = el.querySelector('p, .description')?.textContent?.trim() || '';
    if (title) {
      pillars.push({ icon: 'users', title, description: desc });
    }
  });
  
  const services: string[] = [];
  doc.querySelectorAll('.services li, [class*="service"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) services.push(text);
  });
  
  const outcomes: FDIOutcome[] = [];
  doc.querySelectorAll('.outcome-item, [class*="outcome"]').forEach((el) => {
    const value = el.querySelector('.value')?.textContent?.trim() || '';
    const label = el.querySelector('.label')?.textContent?.trim() || '';
    if (value || label) {
      outcomes.push({ value, label });
    }
  });
  
  const summaryTitle = doc.querySelector('.summary h3')?.textContent?.trim() || '';
  const summaryDesc = doc.querySelector('.summary p')?.textContent?.trim() || '';
  
  const stats: FDIStat[] = [];
  doc.querySelectorAll('.stat-item, [class*="stat"]').forEach((el) => {
    const value = el.querySelector('.stat-value, .value')?.textContent?.trim() || '';
    const label = el.querySelector('.stat-label, .label')?.textContent?.trim() || '';
    if (value || label) {
      stats.push({ value, label });
    }
  });
  
  return {
    badge,
    title: titleText.replace(titleHighlight, '').trim(),
    title_highlight: titleHighlight,
    subtitle,
    pillars,
    services,
    outcomes: outcomes.length >= 4 ? outcomes.slice(0, 4) : outcomes.concat(Array(4 - outcomes.length).fill({ value: '', label: '' })).slice(0, 4),
    summary_title: summaryTitle,
    summary_description: summaryDesc,
    stats: stats.length >= 3 ? stats.slice(0, 3) : stats.concat(Array(3 - stats.length).fill({ value: '', label: '' })).slice(0, 3),
  };
}

export function generateFDISupportHTML(data: FDISupportSectionData): string {
  const pillarsHTML = data.pillars.map(p => `
    <div class="pillar-item">
      <div class="pillar-icon">${p.icon === 'users' ? '👥' : p.icon === 'briefcase' ? '💼' : p.icon === 'globe2' ? '🌐' : '🤝'}</div>
      <h3>${p.title}</h3>
      <p>${p.description}</p>
    </div>
  `).join('');
  
  const servicesHTML = data.services.map(s => `<li>${s}</li>`).join('');
  const outcomesHTML = data.outcomes.map(o => `
    <div class="outcome-item">
      <div class="outcome-value">${o.value}</div>
      <div class="outcome-label">${o.label}</div>
    </div>
  `).join('');
  const statsHTML = data.stats.map(s => `
    <div class="stat-item">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
  
  return `<div id="fdi" class="fdi-support-section">
    <div class="section-badge">${data.badge || ''}</div>
    <h2 class="section-title">${data.title || ''} <span class="highlight">${data.title_highlight || ''}</span></h2>
    <p class="section-subtitle">${data.subtitle || ''}</p>
    <div class="pillars-grid">${pillarsHTML}</div>
    <div class="fdi-content">
      <div class="services-column">
        <h3>Danh mục hỗ trợ</h3>
        <ul>${servicesHTML}</ul>
      </div>
      <div class="outcomes-column">
        <h3>Kết quả</h3>
        <div class="outcomes-grid">${outcomesHTML}</div>
      </div>
      <div class="summary-column">
        <h3>${data.summary_title || 'Tại sao quan trọng'}</h3>
        <p>${data.summary_description || ''}</p>
        <div class="stats-grid">${statsHTML}</div>
      </div>
    </div>
  </div>`;
}


















