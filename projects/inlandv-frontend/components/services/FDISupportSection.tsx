'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Users, Briefcase, Globe2, HeartHandshake, Building2, UserCog } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { cleanText } from '@/lib/utils/content'

interface FDISupportSectionProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

// Helper function to parse HTML content
function parseFDISupportHTML(html: string): {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  pillars: Array<{ icon: 'users' | 'briefcase' | 'globe' | 'heart'; title: string; description: string }>;
  services: string[];
  outcomes: Array<{ value: string; label: string }>;
  summary_title: string;
  summary_description: string;
  stats: Array<{ value: string; label: string }>;
} {
  const defaultData = {
    badge: 'Hỗ trợ FDI',
    title: 'Vận Hành',
    title_highlight: 'Ổn Định',
    subtitle: 'Gói dịch vụ toàn diện giúp doanh nghiệp FDI giảm ma sát khi triển khai hoạt động sản xuất và xây dựng đội ngũ tại Việt Nam.',
    pillars: [
      { icon: 'users' as const, title: 'Tuyển dụng địa phương', description: 'Kết nối nguồn nhân lực phù hợp ngành & văn hoá.' },
      { icon: 'briefcase' as const, title: 'Nhân sự & hành chính', description: 'Thiết lập quy trình nội bộ, hồ sơ lao động, bảo hiểm.' },
      { icon: 'globe' as const, title: 'Hội nhập văn hoá', description: 'Đào tạo thích ứng môi trường làm việc & pháp luật VN.' },
      { icon: 'heart' as const, title: 'Đời sống doanh nghiệp', description: 'Hoạt động gắn kết, CSR, phúc lợi cơ bản.' }
    ],
    services: [
      'Xây dựng cơ cấu tổ chức ban đầu',
      'Thiết lập thang bảng lương & chính sách phúc lợi',
      'Tuyển dụng vị trí quản lý & kỹ thuật trọng yếu',
      'Soạn thảo nội quy lao động & thỏa ước',
      'Đào tạo an toàn lao động cơ bản',
      'Tổ chức định hướng nhân viên mới (onboarding)',
      'Thiết lập kênh truyền thông nội bộ',
      'Tư vấn chiến lược nhân sự 12 tháng đầu'
    ],
    outcomes: [
      { value: '30%+', label: 'Rút ngắn thời gian tuyển' },
      { value: '100%', label: 'Hồ sơ lao động đạt chuẩn' },
      { value: '24/7', label: 'Hỗ trợ hành chính' },
      { value: '0', label: 'Sự cố pháp lý phát sinh' }
    ],
    summary_title: 'Tại sao quan trọng',
    summary_description: '12 tháng đầu là giai đoạn quyết định hiệu suất dài hạn. Inland đồng hành giúp doanh nghiệp thiết lập nền tảng nhân sự, văn hoá & quy trình chuẩn thay vì tự xử lý manh mún gây phát sinh rủi ro.',
    stats: [
      { value: 'Giảm 40% chi phí sai sót', label: 'So với thiếu chuẩn hoá ban đầu' },
      { value: 'Thiết lập nhanh hệ thống HR', label: 'Quy trình, biểu mẫu, hồ sơ' },
      { value: 'Nâng cao giữ chân nhân sự', label: 'Onboarding bài bản & phúc lợi rõ ràng' }
    ],
  };

  if (typeof window === 'undefined') {
    // Server-side: use regex parsing
    const badgeMatch = html.match(/class="section-badge"[^>]*>([^<]+)<\/div>/i);
    const titleMatch = html.match(/<h2[^>]*class="section-title"[^>]*>([\s\S]*?)<\/h2>/i);
    const highlightMatch = html.match(/<span[^>]*class="[^"]*highlight[^"]*"[^>]*>([^<]+)<\/span>/i);
    const subtitleMatch = html.match(/class="section-subtitle"[^>]*>([^<]+)<\/p>/i);
    
    const pillars: Array<{ icon: 'users' | 'briefcase' | 'globe' | 'heart'; title: string; description: string }> = [];
    const pillarMatches = html.match(/<div[^>]*class="[^"]*pillars-grid[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (pillarMatches) {
      const items = pillarMatches[1].match(/<div[^>]*class="[^"]*pillar-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
      items.forEach(item => {
        const titleMatch = item.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        const descMatch = item.match(/<p[^>]*>([^<]+)<\/p>/i);
        const iconMatch = item.match(/👥/) ? 'users' : item.match(/💼/) ? 'briefcase' : item.match(/🌐/) ? 'globe' : 'heart';
        if (titleMatch) {
          pillars.push({ icon: iconMatch as any, title: cleanText(titleMatch[1]), description: descMatch ? cleanText(descMatch[1]) : '' });
        }
      });
    }
    
    const services: string[] = [];
    const servMatches = html.match(/<div[^>]*class="[^"]*services-column[^"]*"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (servMatches) {
      const items = servMatches[1].match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
      items.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text) services.push(cleanText(text));
      });
    }
    
    const outcomes: Array<{ value: string; label: string }> = [];
    const outcomeMatches = html.match(/<div[^>]*class="[^"]*outcomes-grid[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (outcomeMatches) {
      const items = outcomeMatches[1].match(/<div[^>]*class="[^"]*outcome-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
      items.forEach(item => {
        const valueMatch = item.match(/<div[^>]*class="[^"]*outcome-value[^"]*"[^>]*>([^<]+)<\/div>/i);
        const labelMatch = item.match(/<div[^>]*class="[^"]*outcome-label[^"]*"[^>]*>([^<]+)<\/div>/i);
        if (valueMatch || labelMatch) {
          outcomes.push({ value: cleanText(valueMatch?.[1] || ''), label: cleanText(labelMatch?.[1] || '') });
        }
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
      pillars: pillars.length > 0 ? pillars : defaultData.pillars,
      services: services.length > 0 ? services : defaultData.services,
      outcomes: outcomes.length >= 4 ? outcomes.slice(0, 4) : (outcomes.length > 0 ? outcomes : defaultData.outcomes),
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
  
  const pillars: Array<{ icon: 'users' | 'briefcase' | 'globe' | 'heart'; title: string; description: string }> = [];
  doc.querySelectorAll('.pillar-item, [class*="pillar-item"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim();
    const desc = el.querySelector('p, .description')?.textContent?.trim();
    const iconEl = el.querySelector('.pillar-icon, [class*="icon"]');
    const iconText = iconEl?.textContent || '';
    const icon = iconText.includes('👥') ? 'users' : iconText.includes('💼') ? 'briefcase' : iconText.includes('🌐') ? 'globe' : 'heart';
    if (title) {
      pillars.push({ icon: icon as any, title: cleanText(title), description: desc ? cleanText(desc) : '' });
    }
  });
  
  const services: string[] = [];
  doc.querySelectorAll('.services-column li, .services li, [class*="service"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) services.push(cleanText(text));
  });
  
  const outcomes: Array<{ value: string; label: string }> = [];
  doc.querySelectorAll('.outcome-item, [class*="outcome-item"]').forEach((el) => {
    const value = el.querySelector('.outcome-value, .value')?.textContent?.trim();
    const label = el.querySelector('.outcome-label, .label')?.textContent?.trim();
    if (value || label) {
      outcomes.push({ value: cleanText(value || ''), label: cleanText(label || '') });
    }
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
    pillars: pillars.length > 0 ? pillars : defaultData.pillars,
    services: services.length > 0 ? services : defaultData.services,
    outcomes: outcomes.length >= 4 ? outcomes.slice(0, 4) : (outcomes.length > 0 ? outcomes : defaultData.outcomes),
    summary_title: cleanText(summaryTitle),
    summary_description: cleanText(summaryDesc),
    stats: stats.length >= 3 ? stats.slice(0, 3) : (stats.length > 0 ? stats : defaultData.stats),
  };
}

export default function FDISupportSection({ section }: FDISupportSectionProps = {}) {
  // Parse content from CMS (HTML string) or use defaults
  const defaultData = {
    badge: 'Hỗ trợ FDI',
    title: 'Vận Hành',
    title_highlight: 'Ổn Định',
    subtitle: 'Gói dịch vụ toàn diện giúp doanh nghiệp FDI giảm ma sát khi triển khai hoạt động sản xuất và xây dựng đội ngũ tại Việt Nam.',
    pillars: [
      { icon: Users, title: 'Tuyển dụng địa phương', desc: 'Kết nối nguồn nhân lực phù hợp ngành & văn hoá.' },
      { icon: Briefcase, title: 'Nhân sự & hành chính', desc: 'Thiết lập quy trình nội bộ, hồ sơ lao động, bảo hiểm.' },
      { icon: Globe2, title: 'Hội nhập văn hoá', desc: 'Đào tạo thích ứng môi trường làm việc & pháp luật VN.' },
      { icon: HeartHandshake, title: 'Đời sống doanh nghiệp', desc: 'Hoạt động gắn kết, CSR, phúc lợi cơ bản.' }
    ],
    services: [
      'Xây dựng cơ cấu tổ chức ban đầu',
      'Thiết lập thang bảng lương & chính sách phúc lợi',
      'Tuyển dụng vị trí quản lý & kỹ thuật trọng yếu',
      'Soạn thảo nội quy lao động & thỏa ước',
      'Đào tạo an toàn lao động cơ bản',
      'Tổ chức định hướng nhân viên mới (onboarding)',
      'Thiết lập kênh truyền thông nội bộ',
      'Tư vấn chiến lược nhân sự 12 tháng đầu'
    ],
    outcomes: [
      { value: '30%+', label: 'Rút ngắn thời gian tuyển' },
      { value: '100%', label: 'Hồ sơ lao động đạt chuẩn' },
      { value: '24/7', label: 'Hỗ trợ hành chính' },
      { value: '0', label: 'Sự cố pháp lý phát sinh' }
    ],
    summary_title: 'Tại sao quan trọng',
    summary_description: '12 tháng đầu là giai đoạn quyết định hiệu suất dài hạn. Inland đồng hành giúp doanh nghiệp thiết lập nền tảng nhân sự, văn hoá & quy trình chuẩn thay vì tự xử lý manh mún gây phát sinh rủi ro.',
    stats: [
      { value: 'Giảm 40% chi phí sai sót', label: 'So với thiếu chuẩn hoá ban đầu' },
      { value: 'Thiết lập nhanh hệ thống HR', label: 'Quy trình, biểu mẫu, hồ sơ' },
      { value: 'Nâng cao giữ chân nhân sự', label: 'Onboarding bài bản & phúc lợi rõ ràng' }
    ]
  };

  const iconMap: Record<string, typeof Users> = {
    'users': Users,
    'briefcase': Briefcase,
    'globe': Globe2,
    'heart': HeartHandshake,
  };

  let sectionData = defaultData;

  if (section?.content) {
    try {
      const parsed = parseFDISupportHTML(section.content);
      sectionData = {
        badge: parsed.badge,
        title: parsed.title,
        title_highlight: parsed.title_highlight,
        subtitle: parsed.subtitle,
        pillars: parsed.pillars.map(p => ({
          icon: iconMap[p.icon] || Users,
          title: p.title,
          desc: p.description
        })),
        services: parsed.services,
        outcomes: parsed.outcomes,
        summary_title: parsed.summary_title,
        summary_description: parsed.summary_description,
        stats: parsed.stats
      };
    } catch (error) {
      console.error('Failed to parse FDISupportSection content:', error);
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
  const revealed = useSectionReveal(3) // Section index in dich-vu page

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

  const pillars = sectionData.pillars;
  const services = sectionData.services;
  const outcomes = sectionData.outcomes;

  return (
    <section 
      className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] bg-cover bg-center bg-no-repeat ${
        isPortrait ? 'min-h-screen py-8' : 'h-screen'
      }`}
      style={{ backgroundImage: 'url(/images/processed-image-2-3.webp)' }}
    >
      {/* Dark overlay - tăng độ tối thêm 50% (từ 60% lên 90%) */}
      <div className="absolute inset-0 bg-black/90 z-10" />
      
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
          className={isPortrait ? 'w-full py-6' : 'w-full'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1600px',
            // Padding đối xứng 15px mỗi bên (theo layout ảnh)
            paddingLeft: '15px',
            paddingRight: '15px',
            // Max-height để đảm bảo không vượt quá viewport, nhưng vẫn căn giữa
            maxHeight: '85vh',
            overflowY: 'auto',
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
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {sectionData.title} <span className="text-goldLight">{sectionData.title_highlight}</span> Ngay Từ Ngày Đầu
          </h2>
          <p className="text-sm md:text-base text-gray-300 max-w-3xl mx-auto">
            {sectionData.subtitle}
          </p>
        </motion.div>

        <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-5 mb-3">
          {pillars.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: revealed ? i * 0.05 : 0 }}
                className="p-5 rounded-2xl bg-[#1f1b1b] border border-gray-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-goldLight/25 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-goldLight" />
                </div>
                <div className="font-bold text-white mb-1 text-sm md:text-base">{p.title}</div>
                <div className="text-xs md:text-sm text-gray-300 leading-relaxed">{p.desc}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Services list */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-[#2E8C4F] rounded-2xl p-6 shadow-lg border border-[#2E8C4F]"
          >
            <h3 className="text-lg font-bold text-white mb-4">Danh mục hỗ trợ</h3>
            <ul className="space-y-3">
              {services.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-md bg-white text-[#2E8C4F] flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-sm text-white">{s}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Outcomes */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#1f1b1b] rounded-2xl p-6 shadow-lg border border-gray-700"
            >
              <h3 className="text-lg font-bold text-white mb-4">Kết quả</h3>
              <div className="grid grid-cols-2 gap-4">
                {outcomes.map((o, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="text-[#2E8C4F] font-bold text-xl">{o.value}</div>
                    <div className="text-xs text-gray-900">{o.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

          {/* Summary narrative */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-goldLight/25 to-goldLight/10 rounded-2xl p-6 shadow-lg border border-goldLight/40"
          >
            <h3 className="text-lg font-bold text-white mb-3">{sectionData.summary_title}</h3>
            <p className="text-sm text-gray-100 leading-relaxed mb-4">
              {sectionData.summary_description}
            </p>
            <div className="space-y-3">
              {sectionData.stats.map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#151313] shadow-sm border border-goldLight/40">
                  <div className="text-goldLight font-bold">{stat.value}</div>
                  <div className="text-xs text-gray-200">{stat.label}</div>
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
