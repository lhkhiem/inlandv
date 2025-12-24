'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { useFullpage } from '@/components/FullpageContext'
import { Ruler, Hammer, ClipboardList, Layers, Building, BadgeCheck } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { cleanText } from '@/lib/utils/content'

interface DesignConstructionSectionProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

// Helper function to parse HTML content
function parseDesignConstructionHTML(html: string): {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  phases: Array<{ icon: 'clipboard-list' | 'ruler' | 'layers' | 'hammer' | 'building' | 'badge-check'; title: string; description: string }>;
  advantages: string[];
  quality_title: string;
  quality_description: string;
  quality_stats: Array<{ value: string; label: string }>;
  interlink_title: string;
  interlink_description: string;
  interlink_items: string[];
} {
  const defaultData = {
    badge: 'Thiết kế & Thi công',
    title: 'Triển Khai',
    title_highlight: 'Chuẩn Hoá',
    subtitle: 'Quy trình tích hợp từ khảo sát đến vận hành đầu kỳ đảm bảo hiệu suất và khả năng mở rộng trong tương lai.',
    phases: [
      { icon: 'clipboard-list' as const, title: 'Khảo sát nhu cầu', description: 'Phân tích công năng, sản lượng, quy chuẩn kỹ thuật.' },
      { icon: 'ruler' as const, title: 'Thiết kế concept', description: 'Phác thảo sơ bộ layout, tối ưu dòng chảy sản xuất.' },
      { icon: 'layers' as const, title: 'Thiết kế kỹ thuật', description: 'Bản vẽ chi tiết kiến trúc, kết cấu, MEP, phòng cháy.' },
      { icon: 'hammer' as const, title: 'Thi công & giám sát', description: 'Quản lý tiến độ, chất lượng, an toàn lao động.' },
      { icon: 'building' as const, title: 'Nghiệm thu & bàn giao', description: 'Kiểm tra thông số cuối cùng & hoàn thiện hồ sơ.' },
      { icon: 'badge-check' as const, title: 'Vận hành đầu kỳ', description: 'Tối ưu vận hành ban đầu, điều chỉnh thực tế.' }
    ],
    advantages: [
      'Tối ưu chi phí vòng đời nhà xưởng',
      'Đảm bảo tiêu chuẩn an toàn & tuân thủ',
      'Giảm thời gian điều chỉnh phát sinh',
      'Tăng hiệu suất vận hành ngay sau bàn giao'
    ],
    quality_title: 'Kiểm soát chất lượng',
    quality_description: 'Áp dụng checklist chuẩn quốc tế cho từng hạng mục thi công: vật liệu, an toàn, nghiệm thu. Hạn chế lỗi lặp lại và chi phí sửa đổi.',
    quality_stats: [
      { value: '98%', label: 'Đúng tiến độ' },
      { value: '<4%', label: 'Phát sinh điều chỉnh' },
      { value: '0', label: 'Sự cố an toàn nghiêm trọng' },
      { value: '100%', label: 'Nghiệm thu đạt chuẩn' }
    ],
    interlink_title: 'Kết nối INTERLINK',
    interlink_description: 'Tích hợp dữ liệu thiết kế với hệ thống quản lý sản xuất & vận hành giúp giảm thời gian chuyển giao sau bàn giao xây dựng.',
    interlink_items: [
      'Đồng bộ thông số thiết bị',
      'Chuẩn hoá layout digital twin',
      'API kết nối hệ thống ERP/MES',
      'Theo dõi bảo trì từ ngày đầu'
    ],
  };

  if (typeof window === 'undefined') {
    // Server-side: use regex parsing (simplified, will use client-side parsing)
    return defaultData;
  }
  
  // Client-side parsing
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const badge = doc.querySelector('.section-badge, .badge')?.textContent?.trim() || defaultData.badge;
  const titleEl = doc.querySelector('h2.section-title, h2');
  const titleText = titleEl?.textContent || '';
  const titleHighlight = titleEl?.querySelector('.highlight, [class*="highlight"]')?.textContent?.trim() || '';
  const subtitle = doc.querySelector('.section-subtitle, p')?.textContent?.trim() || defaultData.subtitle;
  
  const phases: Array<{ icon: 'clipboard-list' | 'ruler' | 'layers' | 'hammer' | 'building' | 'badge-check'; title: string; description: string }> = [];
  doc.querySelectorAll('.phase-item, [class*="phase-item"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim();
    const desc = el.querySelector('p, .description')?.textContent?.trim();
    const iconEl = el.querySelector('.phase-icon, [class*="icon"]');
    const iconText = iconEl?.textContent || '';
    let icon: 'clipboard-list' | 'ruler' | 'layers' | 'hammer' | 'building' | 'badge-check' = 'clipboard-list';
    if (iconText.includes('📋')) icon = 'clipboard-list';
    else if (iconText.includes('📏')) icon = 'ruler';
    else if (iconText.includes('📚')) icon = 'layers';
    else if (iconText.includes('🔨')) icon = 'hammer';
    else if (iconText.includes('🏢')) icon = 'building';
    else if (iconText.includes('✅')) icon = 'badge-check';
    if (title) {
      phases.push({ icon, title: cleanText(title), description: desc ? cleanText(desc) : '' });
    }
  });
  
  const advantages: string[] = [];
  doc.querySelectorAll('.advantages-column li, .advantages li, [class*="advantage"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) advantages.push(cleanText(text));
  });
  
  const qualityTitle = doc.querySelector('.quality-column h3, .quality h3')?.textContent?.trim() || defaultData.quality_title;
  const qualityDesc = doc.querySelector('.quality-column p, .quality p')?.textContent?.trim() || defaultData.quality_description;
  
  const qualityStats: Array<{ value: string; label: string }> = [];
  doc.querySelectorAll('.quality-stats-grid .stat-item, .quality .stat-item, [class*="quality"] .stat-item').forEach((el) => {
    const value = el.querySelector('.stat-value, .value')?.textContent?.trim();
    const label = el.querySelector('.stat-label, .label')?.textContent?.trim();
    if (value || label) {
      qualityStats.push({ value: cleanText(value || ''), label: cleanText(label || '') });
    }
  });
  
  const interlinkTitle = doc.querySelector('.interlink-column h3, .interlink h3')?.textContent?.trim() || defaultData.interlink_title;
  const interlinkDesc = doc.querySelector('.interlink-column p, .interlink p')?.textContent?.trim() || defaultData.interlink_description;
  
  const interlinkItems: string[] = [];
  doc.querySelectorAll('.interlink-column li, .interlink li, [class*="interlink"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) interlinkItems.push(cleanText(text));
  });
  
  return {
    badge: cleanText(badge),
    title: cleanText(titleText.replace(titleHighlight, '').trim()) || defaultData.title,
    title_highlight: cleanText(titleHighlight) || defaultData.title_highlight,
    subtitle: cleanText(subtitle),
    phases: phases.length > 0 ? phases : defaultData.phases,
    advantages: advantages.length > 0 ? advantages : defaultData.advantages,
    quality_title: cleanText(qualityTitle),
    quality_description: cleanText(qualityDesc),
    quality_stats: qualityStats.length >= 4 ? qualityStats.slice(0, 4) : (qualityStats.length > 0 ? qualityStats : defaultData.quality_stats),
    interlink_title: cleanText(interlinkTitle),
    interlink_description: cleanText(interlinkDesc),
    interlink_items: interlinkItems.length > 0 ? interlinkItems : defaultData.interlink_items,
  };
}

export default function DesignConstructionSection({ section }: DesignConstructionSectionProps = {}) {
  // Parse content from CMS (HTML string) or use defaults
  const defaultData = {
    badge: 'Thiết kế & Thi công',
    title: 'Triển Khai',
    title_highlight: 'Chuẩn Hoá',
    subtitle: 'Quy trình tích hợp từ khảo sát đến vận hành đầu kỳ đảm bảo hiệu suất và khả năng mở rộng trong tương lai.',
    phases: [
      { icon: ClipboardList, title: 'Khảo sát nhu cầu', desc: 'Phân tích công năng, sản lượng, quy chuẩn kỹ thuật.' },
      { icon: Ruler, title: 'Thiết kế concept', desc: 'Phác thảo sơ bộ layout, tối ưu dòng chảy sản xuất.' },
      { icon: Layers, title: 'Thiết kế kỹ thuật', desc: 'Bản vẽ chi tiết kiến trúc, kết cấu, MEP, phòng cháy.' },
      { icon: Hammer, title: 'Thi công & giám sát', desc: 'Quản lý tiến độ, chất lượng, an toàn lao động.' },
      { icon: Building, title: 'Nghiệm thu & bàn giao', desc: 'Kiểm tra thông số cuối cùng & hoàn thiện hồ sơ.' },
      { icon: BadgeCheck, title: 'Vận hành đầu kỳ', desc: 'Tối ưu vận hành ban đầu, điều chỉnh thực tế.' }
    ],
    advantages: [
      'Tối ưu chi phí vòng đời nhà xưởng',
      'Đảm bảo tiêu chuẩn an toàn & tuân thủ',
      'Giảm thời gian điều chỉnh phát sinh',
      'Tăng hiệu suất vận hành ngay sau bàn giao'
    ],
    quality_title: 'Kiểm soát chất lượng',
    quality_description: 'Áp dụng checklist chuẩn quốc tế cho từng hạng mục thi công: vật liệu, an toàn, nghiệm thu. Hạn chế lỗi lặp lại và chi phí sửa đổi.',
    quality_stats: [
      { value: '98%', label: 'Đúng tiến độ' },
      { value: '<4%', label: 'Phát sinh điều chỉnh' },
      { value: '0', label: 'Sự cố an toàn nghiêm trọng' },
      { value: '100%', label: 'Nghiệm thu đạt chuẩn' }
    ],
    interlink_title: 'Kết nối INTERLINK',
    interlink_description: 'Tích hợp dữ liệu thiết kế với hệ thống quản lý sản xuất & vận hành giúp giảm thời gian chuyển giao sau bàn giao xây dựng.',
    interlink_items: [
      'Đồng bộ thông số thiết bị',
      'Chuẩn hoá layout digital twin',
      'API kết nối hệ thống ERP/MES',
      'Theo dõi bảo trì từ ngày đầu'
    ]
  };

  const iconMap: Record<string, typeof ClipboardList> = {
    'clipboard-list': ClipboardList,
    'ruler': Ruler,
    'layers': Layers,
    'hammer': Hammer,
    'building': Building,
    'badge-check': BadgeCheck,
  };

  let sectionData = defaultData;

  if (section?.content) {
    try {
      const parsed = parseDesignConstructionHTML(section.content);
      sectionData = {
        badge: parsed.badge,
        title: parsed.title,
        title_highlight: parsed.title_highlight,
        subtitle: parsed.subtitle,
        phases: parsed.phases.map(p => ({
          icon: iconMap[p.icon] || ClipboardList,
          title: p.title,
          desc: p.description
        })),
        advantages: parsed.advantages,
        quality_title: parsed.quality_title,
        quality_description: parsed.quality_description,
        quality_stats: parsed.quality_stats,
        interlink_title: parsed.interlink_title,
        interlink_description: parsed.interlink_description,
        interlink_items: parsed.interlink_items
      };
    } catch (error) {
      console.error('Failed to parse DesignConstructionSection content:', error);
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
  
  const sectionRef = useRef(null)
  const [isPortrait, setIsPortrait] = useState(false)
  const revealed = useSectionReveal(4) // Section index in dich-vu page

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
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.7])
  const { currentSection } = useFullpage()

  const phases = sectionData.phases;
  const advantages = sectionData.advantages;

  return (
    <section ref={sectionRef} className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
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
          className={isPortrait ? 'w-full py-6 text-white' : 'w-full text-white'}
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
          <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-3">
            <span className="text-goldLight text-sm font-semibold tracking-wide uppercase">
              {sectionData.badge}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {sectionData.title} <span className="text-goldLight">{sectionData.title_highlight}</span> & Tối ưu Dòng Chảy Sản Xuất
          </h2>
          <p className="text-sm md:text-base text-gray-100 max-w-3xl mx-auto mb-4">
            {sectionData.subtitle}
          </p>
        </motion.div>

        <div className="grid xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
          {phases.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: revealed ? i * 0.05 : 0 }}
                className="p-4 rounded-xl bg-[#2E8C4F] border border-[#2E8C4F] hover:bg-[#2E8C4F]/90 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-[#2E8C4F]" />
                </div>
                <div className="font-semibold text-sm mb-1 text-white">{p.title}</div>
                <div className="text-[11px] leading-relaxed text-white">{p.desc}</div>
              </motion.div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white/10 rounded-2xl p-6 shadow-lg border border-white/15 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold mb-4">Lợi thế tích hợp</h3>
            <ul className="space-y-3 text-sm text-gray-100">
              {advantages.map((a, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-md bg-goldLight/30 text-goldLight flex items-center justify-center text-xs font-bold">✓</div>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 rounded-2xl p-6 shadow-lg border border-white/15 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold mb-4">{sectionData.quality_title}</h3>
            <p className="text-sm text-gray-100 leading-relaxed">
              {sectionData.quality_description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {sectionData.quality_stats.map((stat, i) => (
                <div key={i} className="p-3 rounded-xl bg-black/30 border border-white/10">
                  <div className="text-goldLight font-bold">{stat.value}</div>
                  <div>{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white/10 rounded-2xl p-6 shadow-lg border border-white/15 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold mb-3">{sectionData.interlink_title}</h3>
            <p className="text-sm text-gray-100 leading-relaxed mb-3">
              {sectionData.interlink_description}
            </p>
            <div className="space-y-2 text-xs">
              {sectionData.interlink_items.map((item, i) => (
                <div key={i} className="p-2 rounded-lg bg-black/30 border border-white/10">{item}</div>
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
