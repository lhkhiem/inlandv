'use client';

export interface ServicesHeroData {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  button_text: string;
  button_link: string;
}

interface ServicesHeroEditorProps {
  data: ServicesHeroData;
  onChange: (data: ServicesHeroData) => void;
}

export default function ServicesHeroEditor({ data, onChange }: ServicesHeroEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Badge
        </label>
        <input
          type="text"
          value={data.badge}
          onChange={(e) => onChange({ ...data, badge: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Giải pháp toàn diện"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tiêu đề (phần đầu) <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Giải Pháp Bất Động Sản Công Nghiệp"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Tiêu đề (phần highlight) <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={data.title_highlight}
          onChange={(e) => onChange({ ...data, title_highlight: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Toàn Diện Cho Doanh Nghiệp FDI."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Phụ đề
        </label>
        <textarea
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Đồng hành trên mọi chặng đường..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Text nút
          </label>
          <input
            type="text"
            value={data.button_text}
            onChange={(e) => onChange({ ...data, button_text: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Tải Brochure"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Link nút
          </label>
          <input
            type="text"
            value={data.button_link}
            onChange={(e) => onChange({ ...data, button_link: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="/brochures/dich-vu.pdf"
          />
        </div>
      </div>
    </div>
  );
}

export function parseServicesHeroHTML(html: string): ServicesHeroData {
  if (typeof window === 'undefined') {
    const badgeMatch = html.match(/<span[^>]*>([^<]+)<\/span>/);
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const subtitleMatch = html.match(/<p[^>]*>([^<]+)<\/p>/);
    const buttonMatch = html.match(/<a[^>]*>([^<]+)<\/a>/);
    const buttonLinkMatch = html.match(/<a[^>]+href=["']([^"']+)["']/);
    
    return {
      badge: badgeMatch ? badgeMatch[1].trim() : '',
      title: titleMatch ? titleMatch[1].replace(/<[^>]+>/g, ' ').trim().split('Toàn Diện')[0].trim() : '',
      title_highlight: titleMatch ? titleMatch[1].match(/Toàn Diện[^<]*/)?.[0] || '' : '',
      subtitle: subtitleMatch ? subtitleMatch[1].trim() : '',
      button_text: buttonMatch ? buttonMatch[1].trim() : '',
      button_link: buttonLinkMatch ? buttonLinkMatch[1] : '',
    };
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.badge, [class*="badge"]')?.textContent?.trim() || '';
  const titleEl = doc.querySelector('h1');
  const titleText = titleEl?.textContent || '';
  const titleHighlight = titleEl?.querySelector('span')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('p')?.textContent?.trim() || '';
  const button = doc.querySelector('a');
  const buttonText = button?.textContent?.trim() || '';
  const buttonLink = button?.getAttribute('href') || '';
  
  return {
    badge,
    title: titleText.replace(titleHighlight, '').trim(),
    title_highlight: titleHighlight,
    subtitle,
    button_text: buttonText,
    button_link: buttonLink,
  };
}

export function generateServicesHeroHTML(data: ServicesHeroData): string {
  return `<div id="hero" class="services-hero-section">
    <div class="hero-badge">${data.badge || 'Giải pháp toàn diện'}</div>
    <h1 class="hero-title">
      ${data.title || 'Giải Pháp Bất Động Sản Công Nghiệp'}
      <br />
      <span class="highlight">${data.title_highlight || 'Toàn Diện Cho Doanh Nghiệp FDI.'}</span>
    </h1>
    <p class="hero-subtitle">${data.subtitle || 'Đồng hành trên mọi chặng đường, từ tìm kiếm đến xây dựng và phát triển.'}</p>
    <a href="${data.button_link || '/brochures/dich-vu.pdf'}" download class="hero-button">
      ${data.button_text || 'Tải Brochure'}
    </a>
  </div>`;
}


















