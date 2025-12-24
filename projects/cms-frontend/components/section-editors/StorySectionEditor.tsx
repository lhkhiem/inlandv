'use client';

import { Eye, Rocket, Heart } from 'lucide-react';

export interface StorySectionData {
  paragraphs: string[]; // 3 paragraphs
  vision: {
    title: string;
    content: string;
  };
  mission: {
    title: string;
    content: string;
  };
  coreValues: {
    title: string;
    content: string;
  };
}

interface StorySectionEditorProps {
  data: StorySectionData;
  onChange: (data: StorySectionData) => void;
}

const iconOptions = [
  { value: 'eye', label: 'Eye (Tầm nhìn)', Icon: Eye },
  { value: 'rocket', label: 'Rocket (Sứ mệnh)', Icon: Rocket },
  { value: 'heart', label: 'Heart (Giá trị)', Icon: Heart },
];

export default function StorySectionEditor({ data, onChange }: StorySectionEditorProps) {
  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...data.paragraphs];
    newParagraphs[index] = value;
    onChange({ ...data, paragraphs: newParagraphs });
  };

  const updateVision = (field: 'title' | 'content', value: string) => {
    onChange({
      ...data,
      vision: { ...data.vision, [field]: value },
    });
  };

  const updateMission = (field: 'title' | 'content', value: string) => {
    onChange({
      ...data,
      mission: { ...data.mission, [field]: value },
    });
  };

  const updateCoreValues = (field: 'title' | 'content', value: string) => {
    onChange({
      ...data,
      coreValues: { ...data.coreValues, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Paragraphs */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Đoạn văn (3 đoạn)
        </label>
        {[0, 1, 2].map((index) => (
          <div key={index} className="mb-4">
            <label className="block text-xs text-muted-foreground mb-2">
              Đoạn {index + 1}
            </label>
            <textarea
              value={data.paragraphs[index] || ''}
              onChange={(e) => updateParagraph(index, e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={`Nhập nội dung đoạn ${index + 1}...`}
            />
          </div>
        ))}
      </div>

      {/* Vision, Mission, Core Values */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Tầm nhìn, Sứ mệnh, Giá trị cốt lõi
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vision */}
          <div className="space-y-2 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-[#2E8C4F]" />
              <span className="text-sm font-medium text-foreground">Tầm nhìn</span>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tiêu đề</label>
              <input
                type="text"
                value={data.vision.title}
                onChange={(e) => updateVision('title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tầm nhìn:"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nội dung</label>
              <textarea
                value={data.vision.content}
                onChange={(e) => updateVision('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="INLANDV hướng đến vị thế dẫn đầu..."
              />
            </div>
          </div>

          {/* Mission */}
          <div className="space-y-2 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-4 w-4 text-[#2E8C4F]" />
              <span className="text-sm font-medium text-foreground">Sứ mệnh</span>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tiêu đề</label>
              <input
                type="text"
                value={data.mission.title}
                onChange={(e) => updateMission('title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Sứ mệnh:"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nội dung</label>
              <textarea
                value={data.mission.content}
                onChange={(e) => updateMission('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="INLANDV cam kết mang đến..."
              />
            </div>
          </div>

          {/* Core Values */}
          <div className="space-y-2 p-4 border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-[#2E8C4F]" />
              <span className="text-sm font-medium text-foreground">Giá trị cốt lõi</span>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Tiêu đề</label>
              <input
                type="text"
                value={data.coreValues.title}
                onChange={(e) => updateCoreValues('title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Giá trị cốt lõi:"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Nội dung</label>
              <textarea
                value={data.coreValues.content}
                onChange={(e) => updateCoreValues('content', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Tận tâm - Chuyên nghiệp - Minh bạch – Bền vững."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
export function parseStoryHTML(html: string): StorySectionData {
  // Check if content is JSON format (for about page)
  if (html.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(html);
      return {
        paragraphs: parsed.paragraphs || [],
        vision: parsed.vision || { title: 'Tầm nhìn', content: '' },
        mission: parsed.mission || { title: 'Sứ mệnh', content: '' },
        coreValues: parsed.coreValues || { title: 'Giá trị cốt lõi', content: '' },
      };
    } catch (e) {
      // If JSON parse fails, fall through to HTML parsing
      console.warn('Failed to parse as JSON, trying HTML:', e);
    }
  }
  if (typeof window === 'undefined') {
    // Server-side parsing with regex
    const paragraphs: string[] = [];
    const paraMatches = html.matchAll(/<p[^>]*class=["'][^"']*text-[^"']*["'][^>]*>([^<]+)<\/p>/g);
    for (const match of paraMatches) {
      paragraphs.push(match[1].trim());
    }
    
    const visionMatch = html.match(/<h3[^>]*>.*?Tầm nhìn:.*?<\/h3>/s);
    const visionContent = visionMatch ? visionMatch[0].replace(/<[^>]+>/g, ' ').trim() : '';
    
    const missionMatch = html.match(/<h3[^>]*>.*?Sứ mệnh:.*?<\/h3>/s);
    const missionContent = missionMatch ? missionMatch[0].replace(/<[^>]+>/g, ' ').trim() : '';
    
    const valuesMatch = html.match(/<h3[^>]*>.*?Giá trị cốt lõi:.*?<\/h3>/s);
    const valuesContent = valuesMatch ? valuesMatch[0].replace(/<[^>]+>/g, ' ').trim() : '';
    
    return {
      paragraphs: paragraphs.slice(0, 3).concat(['', '', '']).slice(0, 3),
      vision: { title: 'Tầm nhìn:', content: visionContent.replace('Tầm nhìn:', '').trim() },
      mission: { title: 'Sứ mệnh:', content: missionContent.replace('Sứ mệnh:', '').trim() },
      coreValues: { title: 'Giá trị cốt lõi:', content: valuesContent.replace('Giá trị cốt lõi:', '').trim() },
    };
  }
  
  // Client-side parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const paragraphs: string[] = [];
  const paraElements = doc.querySelectorAll('p.text-base, p.text-lg');
  paraElements.forEach((el) => {
    const text = el.textContent?.trim() || '';
    if (text && !text.includes('Tầm nhìn') && !text.includes('Sứ mệnh') && !text.includes('Giá trị')) {
      paragraphs.push(text);
    }
  });
  
  const visionEl = doc.querySelector('.vision-section, [class*="vision"]');
  const visionTitle = visionEl?.querySelector('h3')?.textContent?.trim() || 'Tầm nhìn:';
  const visionContent = visionEl?.querySelector('p')?.textContent?.trim() || '';
  
  const missionEl = doc.querySelector('.mission-section, [class*="mission"]');
  const missionTitle = missionEl?.querySelector('h3')?.textContent?.trim() || 'Sứ mệnh:';
  const missionContent = missionEl?.querySelector('p')?.textContent?.trim() || '';
  
  const valuesEl = doc.querySelector('.values-section, [class*="values"]');
  const valuesTitle = valuesEl?.querySelector('h3')?.textContent?.trim() || 'Giá trị cốt lõi:';
  const valuesContent = valuesEl?.querySelector('p')?.textContent?.trim() || '';
  
  return {
    paragraphs: paragraphs.slice(0, 3).concat(['', '', '']).slice(0, 3),
    vision: { title: visionTitle, content: visionContent },
    mission: { title: missionTitle, content: missionContent },
    coreValues: { title: valuesTitle, content: valuesContent },
  };
}

// Generate JSON format for story section (for about page)
export function generateStoryJSON(data: StorySectionData): string {
  return JSON.stringify({
    paragraphs: data.paragraphs || [],
    vision: data.vision || { title: 'Tầm nhìn', content: '' },
    mission: data.mission || { title: 'Sứ mệnh', content: '' },
    coreValues: data.coreValues || { title: 'Giá trị cốt lõi', content: '' },
  });
}

export function generateStoryHTML(data: StorySectionData): string {
  const paragraphsHTML = data.paragraphs
    .filter(p => p.trim())
    .map(p => `<p class="text-base md:text-lg leading-relaxed italic font-semibold text-justify">${p}</p>`)
    .join('\n              ');

  return `<div id="cau-chuyen" class="story-section">
    <div class="story-content">
      <div class="top-section">
        ${paragraphsHTML}
      </div>
      <div class="vision-mission-values">
        <div class="value-card vision-card">
          <div class="value-icon">
            <svg class="w-8 h-8 text-[#2E8C4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 class="value-title">${data.vision.title || 'Tầm nhìn:'}</h3>
          <p class="value-content">${data.vision.content || ''}</p>
        </div>
        <div class="value-card mission-card">
          <div class="value-icon">
            <svg class="w-8 h-8 text-[#2E8C4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="value-title">${data.mission.title || 'Sứ mệnh:'}</h3>
          <p class="value-content">${data.mission.content || ''}</p>
        </div>
        <div class="value-card values-card">
          <div class="value-icon">
            <svg class="w-8 h-8 text-[#2E8C4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 class="value-title">${data.coreValues.title || 'Giá trị cốt lõi:'}</h3>
          <p class="value-content">${data.coreValues.content || ''}</p>
        </div>
      </div>
    </div>
  </div>`;
}

