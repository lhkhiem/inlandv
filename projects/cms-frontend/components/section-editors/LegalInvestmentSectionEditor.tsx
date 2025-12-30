'use client';

import { useState } from 'react';
import { Plus, Trash2, FileCheck, Hammer, ShieldCheck, ScrollText } from 'lucide-react';

export interface LegalService {
  icon: string; // 'file-check' | 'hammer' | 'scroll-text' | 'shield-check'
  title: string;
  description: string;
}

export interface LegalStat {
  value: string;
  label: string;
}

export interface LegalInvestmentSectionData {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  services: LegalService[];
  benefits: string[];
  summary_title: string;
  summary_description: string;
  stats: LegalStat[];
}

interface LegalInvestmentSectionEditorProps {
  data: LegalInvestmentSectionData;
  onChange: (data: LegalInvestmentSectionData) => void;
}

const iconOptions = [
  { value: 'file-check', label: 'File Check (Giấy phép)', Icon: FileCheck },
  { value: 'hammer', label: 'Hammer (Xây dựng)', Icon: Hammer },
  { value: 'scroll-text', label: 'Scroll Text (Hợp đồng)', Icon: ScrollText },
  { value: 'shield-check', label: 'Shield Check (Tuân thủ)', Icon: ShieldCheck },
];

export default function LegalInvestmentSectionEditor({ data, onChange }: LegalInvestmentSectionEditorProps) {
  const updateService = (index: number, field: keyof LegalService, value: string) => {
    const newServices = [...data.services];
    newServices[index] = { ...newServices[index], [field]: value };
    onChange({ ...data, services: newServices });
  };

  const addService = () => {
    onChange({
      ...data,
      services: [...data.services, { icon: 'file-check', title: '', description: '' }],
    });
  };

  const removeService = (index: number) => {
    onChange({ ...data, services: data.services.filter((_, i) => i !== index) });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...data.benefits];
    newBenefits[index] = value;
    onChange({ ...data, benefits: newBenefits });
  };

  const addBenefit = () => {
    onChange({ ...data, benefits: [...data.benefits, ''] });
  };

  const removeBenefit = (index: number) => {
    onChange({ ...data, benefits: data.benefits.filter((_, i) => i !== index) });
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
          placeholder="Tư vấn Pháp lý & Đầu tư"
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
            placeholder="An Toàn"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề (highlight)</label>
          <input
            type="text"
            value={data.title_highlight}
            onChange={(e) => onChange({ ...data, title_highlight: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Pháp Lý"
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

      {/* Services */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Dịch vụ cụ thể</label>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm dịch vụ
          </button>
        </div>
        <div className="space-y-4">
          {data.services.map((service, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Dịch vụ {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Icon</label>
                <select
                  value={service.icon}
                  onChange={(e) => updateService(index, 'icon', e.target.value)}
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
                  value={service.title}
                  onChange={(e) => updateService(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Mô tả</label>
                <input
                  type="text"
                  value={service.description}
                  onChange={(e) => updateService(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-foreground">Lợi ích</label>
          <button
            type="button"
            onClick={addBenefit}
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-background text-foreground px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-2">
          {data.benefits.map((benefit, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={benefit}
                onChange={(e) => updateBenefit(index, e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => removeBenefit(index)}
                className="p-2 rounded hover:bg-destructive/10 text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
          placeholder="Kết quả mang lại"
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
                  placeholder="100%"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nhãn</label>
                <input
                  type="text"
                  value={stat.label}
                  onChange={(e) => updateStat(index, 'label', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Hồ sơ đạt chuẩn"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function parseLegalInvestmentHTML(html: string): LegalInvestmentSectionData {
  if (typeof window === 'undefined') {
    return {
      badge: '',
      title: '',
      title_highlight: '',
      subtitle: '',
      services: [],
      benefits: [],
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
  
  const services: LegalService[] = [];
  doc.querySelectorAll('.service-item, [class*="service"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim() || '';
    const desc = el.querySelector('p, .description')?.textContent?.trim() || '';
    if (title) {
      services.push({ icon: 'file-check', title, description: desc });
    }
  });
  
  const benefits: string[] = [];
  doc.querySelectorAll('.benefits li, [class*="benefit"]').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) benefits.push(text);
  });
  
  const summaryTitle = doc.querySelector('.summary h3')?.textContent?.trim() || '';
  const summaryDesc = doc.querySelector('.summary p')?.textContent?.trim() || '';
  
  const stats: LegalStat[] = [];
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
    services,
    benefits,
    summary_title: summaryTitle,
    summary_description: summaryDesc,
    stats: stats.length >= 3 ? stats.slice(0, 3) : stats.concat(Array(3 - stats.length).fill({ value: '', label: '' })).slice(0, 3),
  };
}

export function generateLegalInvestmentHTML(data: LegalInvestmentSectionData): string {
  const servicesHTML = data.services.map(s => `
    <div class="service-item">
      <div class="service-icon">${s.icon === 'file-check' ? '📄' : s.icon === 'hammer' ? '🔨' : s.icon === 'scroll-text' ? '📜' : '🛡️'}</div>
      <h3>${s.title}</h3>
      <p>${s.description}</p>
    </div>
  `).join('');
  
  const benefitsHTML = data.benefits.map(b => `<li>${b}</li>`).join('');
  const statsHTML = data.stats.map(s => `
    <div class="stat-item">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
    </div>
  `).join('');
  
  return `<div id="phap-ly" class="legal-investment-section">
    <div class="section-badge">${data.badge || ''}</div>
    <h2 class="section-title">${data.title || ''} <span class="highlight">${data.title_highlight || ''}</span></h2>
    <p class="section-subtitle">${data.subtitle || ''}</p>
    <div class="legal-content">
      <div class="services-column">
        <h3>Dịch vụ cụ thể</h3>
        <div class="services-list">${servicesHTML}</div>
      </div>
      <div class="benefits-column">
        <h3>Lợi ích</h3>
        <ul>${benefitsHTML}</ul>
      </div>
      <div class="summary-column">
        <h3>${data.summary_title || 'Kết quả mang lại'}</h3>
        <p>${data.summary_description || ''}</p>
        <div class="stats-grid">${statsHTML}</div>
      </div>
    </div>
  </div>`;
}


















