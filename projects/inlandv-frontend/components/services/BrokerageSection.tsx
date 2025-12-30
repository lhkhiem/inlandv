'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Factory, MapPin, Workflow, Layers } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { useCanvasScale } from '@/hooks/useCanvasScale'
import { cleanText } from '@/lib/utils/content'

interface BrokerageSectionProps {
  section?: {
    content?: string;
    images?: string[];
  };
}

// Helper function to parse HTML content
function parseBrokerageHTML(html: string): {
  badge: string;
  title: string;
  title_highlight: string;
  subtitle: string;
  advantages: string[];
  process: string[];
  diverse_areas: string[];
  categories: Array<{ icon: 'factory' | 'layers'; title: string; desc: string }>;
} {
  const defaultData = {
    badge: 'Môi giới BĐS Công nghiệp',
    title: 'Thuê / Mua',
    title_highlight: 'Hiệu Quả',
    subtitle: 'Giải pháp tối ưu kết nối nhu cầu doanh nghiệp FDI với nguồn cung nhà xưởng & đất công nghiệp chất lượng cao.',
    advantages: [
      'Tiếp cận nhanh danh mục nhà xưởng & đất công nghiệp chất lượng',
      'Quy trình minh bạch, pháp lý rõ ràng',
      'Tư vấn tối ưu chi phí & thời gian thuê/mua',
      'Hỗ trợ đàm phán & ký kết hợp đồng an toàn'
    ],
    process: [
      'Tiếp nhận nhu cầu & tiêu chí',
      'Khảo sát & đề xuất địa điểm phù hợp',
      'Pháp lý & thẩm định điều kiện',
      'Đàm phán & ký kết',
      'Bàn giao & hỗ trợ vận hành đầu kỳ'
    ],
    diverse_areas: [
      'Đa dạng diện tích từ vài trăm m² đến hàng chục nghìn m²',
      'Nhiều loại hình: nhà xưởng xây sẵn, đất nền, kho bãi',
      'Phân bố tại các KCN trọng điểm: Long An, Bình Dương, Bình Phước, Tây Ninh',
      'Đáp ứng mọi nhu cầu từ sản xuất nhỏ đến quy mô lớn'
    ],
    categories: [
      { icon: 'factory' as const, title: 'Nhà xưởng xây sẵn', desc: 'Tiết kiệm thời gian, sẵn sàng vận hành' },
      { icon: 'layers' as const, title: 'Đất công nghiệp', desc: 'Phù hợp mở rộng sản xuất dài hạn' }
    ],
  };

  if (typeof window === 'undefined') {
    // Server-side: use regex parsing
    const badgeMatch = html.match(/class="section-badge"[^>]*>([^<]+)<\/div>/i);
    const titleMatch = html.match(/<h2[^>]*class="section-title"[^>]*>([\s\S]*?)<\/h2>/i);
    const highlightMatch = html.match(/<span[^>]*class="[^"]*highlight[^"]*"[^>]*>([^<]+)<\/span>/i);
    const subtitleMatch = html.match(/class="section-subtitle"[^>]*>([^<]+)<\/p>/i);
    
    const advantages: string[] = [];
    const advMatches = html.match(/<div[^>]*class="[^"]*advantages[^"]*"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (advMatches) {
      const items = advMatches[1].match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
      items.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text) advantages.push(cleanText(text));
      });
    }
    
    const process: string[] = [];
    const procMatches = html.match(/<div[^>]*class="[^"]*process[^"]*"[^>]*>[\s\S]*?<ol[^>]*>([\s\S]*?)<\/ol>/i);
    if (procMatches) {
      const items = procMatches[1].match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
      items.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text) process.push(cleanText(text));
      });
    }
    
    const diverseAreas: string[] = [];
    const divMatches = html.match(/<div[^>]*class="[^"]*diverse-areas[^"]*"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
    if (divMatches) {
      const items = divMatches[1].match(/<li[^>]*>([^<]+)<\/li>/gi) || [];
      items.forEach(item => {
        const text = item.replace(/<[^>]+>/g, '').trim();
        if (text) diverseAreas.push(cleanText(text));
      });
    }
    
    const categories: Array<{ icon: 'factory' | 'layers'; title: string; desc: string }> = [];
    const catMatches = html.match(/<div[^>]*class="[^"]*categories[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (catMatches) {
      const items = catMatches[1].match(/<div[^>]*class="[^"]*category[^"]*"[^>]*>([\s\S]*?)<\/div>/gi) || [];
      items.forEach(item => {
        const titleMatch = item.match(/<h3[^>]*>([^<]+)<\/h3>/i);
        const descMatch = item.match(/<p[^>]*>([^<]+)<\/p>/i);
        const iconMatch = item.match(/🏭/) ? 'factory' : 'layers';
        if (titleMatch) {
          categories.push({
            icon: iconMatch as 'factory' | 'layers',
            title: cleanText(titleMatch[1]),
            desc: descMatch ? cleanText(descMatch[1]) : ''
          });
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
      advantages: advantages.length > 0 ? advantages : defaultData.advantages,
      process: process.length > 0 ? process : defaultData.process,
      diverse_areas: diverseAreas.length > 0 ? diverseAreas : defaultData.diverse_areas,
      categories: categories.length > 0 ? categories : defaultData.categories,
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
  
  const advantages: string[] = [];
  doc.querySelectorAll('.advantages li, [class*="advantage"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) advantages.push(cleanText(text));
  });
  
  const process: string[] = [];
  doc.querySelectorAll('.process li, [class*="process"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) process.push(cleanText(text));
  });
  
  const diverseAreas: string[] = [];
  doc.querySelectorAll('.diverse-areas li, [class*="diverse"] li').forEach((el) => {
    const text = el.textContent?.trim();
    if (text) diverseAreas.push(cleanText(text));
  });
  
  const categories: Array<{ icon: 'factory' | 'layers'; title: string; desc: string }> = [];
  doc.querySelectorAll('.category-item, [class*="category"]').forEach((el) => {
    const title = el.querySelector('h3, .title')?.textContent?.trim();
    const desc = el.querySelector('p, .description')?.textContent?.trim();
    const iconEl = el.querySelector('.category-icon, [class*="icon"]');
    const icon = iconEl?.textContent?.includes('🏭') ? 'factory' : 'layers';
    if (title) {
      categories.push({ icon: icon as 'factory' | 'layers', title: cleanText(title), desc: desc ? cleanText(desc) : '' });
    }
  });
  
  return {
    badge: cleanText(badge),
    title: cleanText(titleText.replace(titleHighlight, '').trim()) || defaultData.title,
    title_highlight: cleanText(titleHighlight) || defaultData.title_highlight,
    subtitle: cleanText(subtitle),
    advantages: advantages.length > 0 ? advantages : defaultData.advantages,
    process: process.length > 0 ? process : defaultData.process,
    diverse_areas: diverseAreas.length > 0 ? diverseAreas : defaultData.diverse_areas,
    categories: categories.length > 0 ? categories : defaultData.categories,
  };
}

export default function BrokerageSection({ section }: BrokerageSectionProps = {}) {
  // Parse content from CMS (HTML string) or use defaults
  const defaultData = {
    badge: 'Môi giới BĐS Công nghiệp',
    title: 'Thuê / Mua',
    title_highlight: 'Hiệu Quả',
    subtitle: 'Giải pháp tối ưu kết nối nhu cầu doanh nghiệp FDI với nguồn cung nhà xưởng & đất công nghiệp chất lượng cao.',
    advantages: [
      'Tiếp cận nhanh danh mục nhà xưởng & đất công nghiệp chất lượng',
      'Quy trình minh bạch, pháp lý rõ ràng',
      'Tư vấn tối ưu chi phí & thời gian thuê/mua',
      'Hỗ trợ đàm phán & ký kết hợp đồng an toàn'
    ],
    process: [
      'Tiếp nhận nhu cầu & tiêu chí',
      'Khảo sát & đề xuất địa điểm phù hợp',
      'Pháp lý & thẩm định điều kiện',
      'Đàm phán & ký kết',
      'Bàn giao & hỗ trợ vận hành đầu kỳ'
    ],
    diverseAreas: [
      'Đa dạng diện tích từ vài trăm m² đến hàng chục nghìn m²',
      'Nhiều loại hình: nhà xưởng xây sẵn, đất nền, kho bãi',
      'Phân bố tại các KCN trọng điểm: Long An, Bình Dương, Bình Phước, Tây Ninh',
      'Đáp ứng mọi nhu cầu từ sản xuất nhỏ đến quy mô lớn'
    ],
    categories: [
      { icon: Factory, title: 'Nhà xưởng xây sẵn', desc: 'Tiết kiệm thời gian, sẵn sàng vận hành' },
      { icon: Layers, title: 'Đất công nghiệp', desc: 'Phù hợp mở rộng sản xuất dài hạn' }
    ]
  };

  let sectionData = defaultData;

  if (section?.content) {
    try {
      const parsed = parseBrokerageHTML(section.content);
      sectionData = {
        badge: parsed.badge,
        title: parsed.title,
        title_highlight: parsed.title_highlight,
        subtitle: parsed.subtitle,
        advantages: parsed.advantages,
        process: parsed.process,
        diverseAreas: parsed.diverse_areas,
        categories: parsed.categories.map(cat => ({
          icon: cat.icon === 'factory' ? Factory : Layers,
          title: cat.title,
          desc: cat.desc
        }))
      };
    } catch (error) {
      console.error('Failed to parse BrokerageSection content:', error);
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
  const revealed = useSectionReveal(1) // Section index in dich-vu page

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


  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#F5F5F5] ${
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
            {sectionData.title} {sectionData.title_highlight && <span className="text-goldLight">{sectionData.title_highlight}</span>}
          </h2>
          {sectionData.subtitle && (
            <p className="text-base md:text-lg text-[#2E8C4F] max-w-3xl mx-auto">
              {sectionData.subtitle}
            </p>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Advantages */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: revealed ? 0.1 : 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4">Ưu điểm</h3>
            <ul className="space-y-3">
              {sectionData.advantages.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-goldLight/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-goldLight" />
                  </div>
                  <span className="text-sm text-[#2E8C4F]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Middle: Process */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4">Quy trình</h3>
            <ol className="space-y-3 list-none">
              {sectionData.process.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-goldLight/30 text-goldLight flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <span className="text-sm text-[#2E8C4F]">{step}</span>
                </li>
              ))}
            </ol>
          </motion.div>

          {/* Right: Diverse Areas */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4">Diện tích đa dạng</h3>
            <ul className="space-y-3">
              {sectionData.diverseAreas.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-goldLight/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-goldLight" />
                  </div>
                  <span className="text-sm text-[#2E8C4F]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4 mt-6 md:mt-7"
        >
          {sectionData.categories.map((cat, i) => {
            const Icon = cat.icon
            return (
              <div key={i} className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-md border border-gray-300 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-goldLight/20 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-goldLight" />
                </div>
                <div>
                  <div className="font-bold text-[#2E8C4F] mb-1">{cat.title}</div>
                  <div className="text-sm text-[#2E8C4F]">{cat.desc}</div>
                </div>
              </div>
            )
          })}
        </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
