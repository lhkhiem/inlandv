'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { FileCheck, Hammer, ShieldCheck, ScrollText } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { cleanText } from '@/lib/utils/content'

interface LegalInvestmentSectionProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

// Helper function to parse HTML content
function parseLegalInvestmentHTML(html: string): {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  services: Array<{ icon: 'file-check' | 'hammer' | 'scroll-text' | 'shield'; title: string; description: string }>;
  benefits: string[];
  summary_title: string;
  summary_description: string;
  stats: Array<{ value: string; label: string }>;
} {
  const defaultData = {
    badge: 'Tư vấn Pháp lý & Đầu tư',
    title: 'An Toàn',
    title_highlight: 'Pháp Lý',
    subtitle: 'Dịch vụ chuyên sâu đảm bảo dự án đầu tư tuân thủ đúng quy định, tối ưu chi phí & thời gian vận hành.',
    services: [
      { icon: 'file-check' as const, title: 'Giấy phép đầu tư', description: 'Tư vấn hồ sơ & tối ưu thời gian xử lý' },
      { icon: 'hammer' as const, title: 'Thủ tục xây dựng', description: 'Hỗ trợ xin giấy phép xây dựng & PCCC' },
      { icon: 'scroll-text' as const, title: 'Hợp đồng & pháp chế', description: 'Rà soát rủi ro, đảm bảo tính pháp lý' },
      { icon: 'shield' as const, title: 'Tuân thủ & bảo hộ', description: 'Đảm bảo hoạt động phù hợp quy định hiện hành' }
    ],
    benefits: [
      'Giảm thiểu rủi ro pháp lý ngay từ đầu',
      'Tối ưu thời gian triển khai dự án',
      'Đảm bảo tính hợp lệ hồ sơ & chứng từ',
      'Đồng hành xuyên suốt trong và sau cấp phép'
    ],
    summary_title: 'Kết quả mang lại',
    summary_description: 'Đảm bảo dự án vận hành hợp pháp, hạn chế tối đa rủi ro trong các giai đoạn tiếp theo: xây dựng, mở rộng, chuyển giao.',
    stats: [
      { value: '100% Hồ sơ đạt chuẩn', label: 'Được thẩm định trước khi nộp' },
      { value: 'Giảm 30% thời gian xử lý', label: 'So với tự triển khai' },
      { value: 'Tư vấn liên tục', label: 'Trong & sau cấp phép đầu tư' }
    ],
  };

  if (typeof window === 'undefined') {
    // Server-side: use regex parsing
    const badgeMatch = html.match(/class="section-badge"[^>]*>([^<]+)<\/div>/i);
    const titleMatch = html.match(/<h2[^>]*class="section-title"[^>]*>([\s\S]*?)<\/h2>/i);
    const highlightMatch = html.match(/<span[^>]*class="[^"]*highlight[^"]*"[^>]*>([^<]+)<\/span>/i);
    const subtitleMatch = html.match(/class="section-subtitle"[^>]*>([^<]+)<\/p>/i);
    
    const services: Array<{ icon: 'file-check' | 'hammer' | 'scroll-text' | 'shield'; title: string; description: string }> = [];
    const servMatches = html.match(/<div[^>]*class="[^"]*services-list[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (servMatches) {
      const items = servMatches[1].match(/<div[^>]*class="[^"]*service-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
      items.forEach(item => {
        const titleMatch = item.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        const descMatch = item.match(/<p[^>]*>([^<]+)<\/p>/i);
        const iconMatch = item.match(/📄/) ? 'file-check' : item.match(/🔨/) ? 'hammer' : item.match(/📜/) ? 'scroll-text' : 'shield';
        if (titleMatch) {
          services.push({ icon: iconMatch as any, title: cleanText(titleMatch[1]), description: descMatch ? cleanText(descMatch[1]) : '' });
        }
      });
    }
    
    const benefits: string[] = [];
    const benMatches = html.match(/<div[^>]*class="[^"]*benefits-column[^"]*"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (benMatches) {
      const items = benMatches[1].match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
      items.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text) benefits.push(cleanText(text));
      });
    }
    
    const summaryTitleMatch = html.match(/<div[^>]*class="[^"]*summary-column[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([^<]+)<\/h3>/i);
    const summaryDescMatch = html.match(/<div[^>]*class="[^"]*summary-column[^"]*"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/i);
    
    const stats: Array<{ value: string; label: string }> = [];
    const statsMatch = html.match(/<div[^>]*class="[^"]*stats-grid[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (statsMatch) {
      const items = statsMatch[1].match(/<div[^>]*class="[^"]*stat-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
      items.forEach(item => {
        const valueMatch = item.match(/<div[^>]*class="[^"]*stat-value[^"]*"[^>]*>([^<]+)<\/div>/i);
        const labelMatch = item.match(/<div[^>]*class="[^"]*stat-label[^"]*"[^>]*>([^<]+)<\/div>/i);
        if (valueMatch || labelMatch) {
          stats.push({ value: cleanText(valueMatch?.[1] || ''), label: cleanText(labelMatch?.[1] || '') });
        }
      });
    }
    
    const titleText = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, ' ').trim() : '';
    const highlightText = highlightMatch ? highlightMatch[1].trim() : '';
    
    return {
      badge: badgeMatch ? cleanText(badgeMatch[1]) : defaultData.badge,
      title: cleanText(titleText.replace(highlightText, '').trim()) || defaultData.title,
      title_highlight: cleanText(highlightText) || defaultData.title_highlight,
      subtitle: subtitleMatch ? cleanText(subtitleMatch[1]) : defaultData.subtitle,
      services: services.length > 0 ? services : defaultData.services,
      benefits: benefits.length > 0 ? benefits : defaultData.benefits,
      summary_title: summaryTitleMatch ? cleanText(summaryTitleMatch[1]) : defaultData.summary_title,
      summary_description: summaryDescMatch ? cleanText(summaryDescMatch[1]) : defaultData.summary_description,
      stats: stats.length >= 3 ? stats.slice(0, 3) : (stats.length > 0 ? stats : defaultData.stats),
    };
  }
  
  // Client-side parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.section-badge, .badge')?.textContent?.trim() || defaultData.badge;
  const titleEl = doc.querySelector('h2.section-title, h2');
  const titleText = titleEl?.textContent || '';
  const titleHighlight = titleEl?.querySelector('.highlight, [class*="highlight"]')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('.section-subtitle, p')?.textContent?.trim() || defaultData.subtitle;
  
  const services: Array<{ icon: 'file-check' | 'hammer' | 'scroll-text' | 'shield'; title: string; description: string }> = [];
  doc.querySelectorAll('.service-item, [class*="service-item"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim();
    const desc = el.querySelector('p, .description')?.textContent?.trim();
    const iconEl = el.querySelector('.service-icon, [class*="icon"]');
    const iconText = iconEl?.textContent || '';
    const icon = iconText.includes('📄') ? 'file-check' : iconText.includes('🔨') ? 'hammer' : iconText.includes('📜') ? 'scroll-text' : 'shield';
    if (title) {
      services.push({ icon: icon as any, title: cleanText(title), description: desc ? cleanText(desc) : '' });
    }
  });
  
  const benefits: string[] = [];
  doc.querySelectorAll('.benefits-column li, .benefits li, [class*="benefit"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) benefits.push(cleanText(text));
  });
  
  const summaryTitle = doc.querySelector('.summary-column h3, .summary h3')?.textContent?.trim() || defaultData.summary_title;
  const summaryDesc = doc.querySelector('.summary-column p, .summary p')?.textContent?.trim() || defaultData.summary_description;
  
  const stats: Array<{ value: string; label: string }> = [];
  doc.querySelectorAll('.stat-item, [class*="stat-item"]').forEach((el) => {
    const value = el.querySelector('.stat-value, .value')?.textContent?.trim();
    const label = el.querySelector('.stat-label, .label')?.textContent?.trim();
    if (value || label) {
      stats.push({ value: cleanText(value || ''), label: cleanText(label || '') });
    }
  });
  
  return {
    badge: cleanText(badge),
    title: cleanText(titleText.replace(titleHighlight, '').trim()) || defaultData.title,
    title_highlight: cleanText(titleHighlight) || defaultData.title_highlight,
    subtitle: cleanText(subtitle),
    services: services.length > 0 ? services : defaultData.services,
    benefits: benefits.length > 0 ? benefits : defaultData.benefits,
    summary_title: cleanText(summaryTitle),
    summary_description: cleanText(summaryDesc),
    stats: stats.length >= 3 ? stats.slice(0, 3) : (stats.length > 0 ? stats : defaultData.stats),
  };
}

export default function LegalInvestmentSection({ section }: LegalInvestmentSectionProps = {}) {
  // Parse content from CMS (HTML string) or use defaults
  const defaultData = {
    badge: 'Tư vấn Pháp lý & Đầu tư',
    title: 'An Toàn',
    title_highlight: 'Pháp Lý',
    subtitle: 'Dịch vụ chuyên sâu đảm bảo dự án đầu tư tuân thủ đúng quy định, tối ưu chi phí & thời gian vận hành.',
    services: [
      { icon: FileCheck, title: 'Giấy phép đầu tư', desc: 'Tư vấn hồ sơ & tối ưu thời gian xử lý' },
      { icon: Hammer, title: 'Thủ tục xây dựng', desc: 'Hỗ trợ xin giấy phép xây dựng & PCCC' },
      { icon: ScrollText, title: 'Hợp đồng & pháp chế', desc: 'Rà soát rủi ro, đảm bảo tính pháp lý' },
      { icon: ShieldCheck, title: 'Tuân thủ & bảo hộ', desc: 'Đảm bảo hoạt động phù hợp quy định hiện hành' }
    ],
    benefits: [
      'Giảm thiểu rủi ro pháp lý ngay từ đầu',
      'Tối ưu thời gian triển khai dự án',
      'Đảm bảo tính hợp lệ hồ sơ & chứng từ',
      'Đồng hành xuyên suốt trong và sau cấp phép'
    ],
    summary_title: 'Kết quả mang lại',
    summary_description: 'Đảm bảo dự án vận hành hợp pháp, hạn chế tối đa rủi ro trong các giai đoạn tiếp theo: xây dựng, mở rộng, chuyển giao.',
    stats: [
      { value: '100% Hồ sơ đạt chuẩn', label: 'Được thẩm định trước khi nộp' },
      { value: 'Giảm 30% thời gian xử lý', label: 'So với tự triển khai' },
      { value: 'Tư vấn liên tục', label: 'Trong & sau cấp phép đầu tư' }
    ]
  };

  const iconMap: Record<string, typeof FileCheck> = {
    'file-check': FileCheck,
    'hammer': Hammer,
    'scroll-text': ScrollText,
    'shield': ShieldCheck,
  };

  let sectionData = defaultData;

  if (section?.content) {
    try {
      const parsed = parseLegalInvestmentHTML(section.content);
      sectionData = {
        badge: parsed.badge,
        title: parsed.title,
        title_highlight: parsed.title_highlight,
        subtitle: parsed.subtitle,
        services: parsed.services.map(s => ({
          icon: iconMap[s.icon] || FileCheck,
          title: s.title,
          desc: s.description
        })),
        benefits: parsed.benefits,
        summary_title: parsed.summary_title,
        summary_description: parsed.summary_description,
        stats: parsed.stats
      };
    } catch (error) {
      console.error('Failed to parse LegalInvestmentSection content:', error);
    }
  }

  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  // Tăng scale max lên 1.15 để hiển thị to hơn ở fullHD
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.15)
  
  // Calculate adjusted scale and max-width to ensure content doesn't touch timeline
  // Content is centered on viewport, but scale must account for timeline
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  const [isPortrait, setIsPortrait] = useState(false)
  const revealed = useSectionReveal(2) // Section index in dich-vu page

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  // Calculate max-width and scale for landscape mode
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    
    // Timeline right padding: md:right-10 (40px) hoặc right-6 (24px)
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    // Timeline left edge = viewportWidth - timelineRightPadding - timelineWidth
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    
    // Nội dung căn giữa viewport thiết bị (centerX = viewportWidth / 2)
    const centerX = viewportWidth / 2
    
    // Max content width (sau scale) để không chạm timeline
    // Tăng buffer space lên 30px (thay vì 15px) để đảm bảo không chạm ở màn hình lớn
    // Content right edge sau scale phải <= timelineLeftEdge - buffer
    // Content right edge = centerX + (scaledWidth / 2)
    // => scaledWidth <= 2 * (timelineLeftEdge - buffer - centerX)
    const bufferSpace = 30 // Tăng buffer để tránh chạm timeline ở màn hình lớn
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - bufferSpace - centerX))
    
    // Reference content width - giảm xuống để scale to hơn ở fullHD
    // Ở fullHD (1920px), nếu dùng 1600px làm reference thì scale sẽ lớn hơn (~1.2x)
    const referenceContentWidth = 1600
    
    // Calculate scale based on timeline constraint
    const scaleByTimeline = maxScaledContentWidth > 0
      ? maxScaledContentWidth / referenceContentWidth
      : uniformScale
    
    // Use the smaller of uniform scale and timeline-constrained scale
    // Đảm bảo không vượt quá timeline constraint
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    
    // Clamp scale between 0.5 and 1.15 (cho phép scale to hơn ở fullHD)
    const clampedScale = Math.max(0.5, Math.min(1.15, finalScale))
    
    // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + buffer)
    // Tăng buffer để đảm bảo không chạm timeline ở màn hình lớn
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + bufferSpace)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  const services = sectionData.services;
  const benefits = sectionData.benefits;

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${encodeURI('/images/PressUp - SOoMBKcIfH-2.webp')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* White Overlay */}
      <div className="absolute inset-0 bg-white/70 z-[1]" />
      
      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? {
          paddingTop: `${headerHeight + 15}px`
        } : {}}
      >
        {/* Content Container - Max-width động, scale như canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={isPortrait ? 'w-full py-6' : 'w-full max-h-[85vh] overflow-y-auto scrollbar-hide'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1600px',
            // Padding đối xứng 15px mỗi bên (theo layout ảnh)
            paddingLeft: '15px',
            paddingRight: '15px',
            // Scale toàn bộ content container như canvas
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 md:mb-6"
        >
          <div className="inline-block px-4 py-2 bg-goldLight/10 rounded-full mb-3">
            <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
              {sectionData.badge}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E8C4F] mb-2 md:mb-3">
            {sectionData.title} <span className="text-goldLight">{sectionData.title_highlight}</span>
          </h2>
          <p className="text-base md:text-lg text-[#2E8C4F] max-w-3xl mx-auto">
            {sectionData.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Services list */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: revealed ? 0.1 : 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4">Dịch vụ cụ thể</h3>
            <div className="space-y-4">
              {services.map((s, i) => {
                const Icon = s.icon
                return (
                  <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-goldLight/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-goldLight" />
                    </div>
                    <div>
                      <div className="font-bold text-[#2E8C4F] text-sm md:text-base mb-1">{s.title}</div>
                      <div className="text-xs md:text-sm text-[#2E8C4F]">{s.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4">Lợi ích</h3>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-md bg-goldLight/30 text-goldDark flex items-center justify-center text-xs font-bold">✓</div>
                  <span className="text-sm text-[#2E8C4F]">{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-goldLight/25 to-goldLight/10 rounded-2xl p-6 shadow-lg border border-goldLight/40"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-3">{sectionData.summary_title}</h3>
            <p className="text-sm text-[#2E8C4F] leading-relaxed mb-4">
              {sectionData.summary_description}
            </p>
            <div className="space-y-3">
              {sectionData.stats.map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-white shadow-sm border border-goldLight/40">
                  <div className="text-goldLight font-bold">{stat.value}</div>
                  <div className="text-xs text-[#2E8C4F]">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
