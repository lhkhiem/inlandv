'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, FileSpreadsheet, ArrowRightCircle } from 'lucide-react'
import { useSectionReveal } from '@/hooks/useSectionReveal'

export default function ServicesCTASection() {
  const sectionRef = useRef(null)
  const [isPortrait, setIsPortrait] = useState(false)
  const revealed = useSectionReveal(7) // Section index in dich-vu page
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start']
  })
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.7])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  const actions = [
    { icon: Mail, label: 'Liên hệ tư vấn', href: '/lien-he', desc: 'Trao đổi nhanh với đội ngũ chuyên môn.' },
    { icon: FileSpreadsheet, label: 'Gửi yêu cầu dự án', href: '/lien-he#yeu-cau', desc: 'Nhận đề xuất giải pháp & timeline sơ bộ.' },
    { icon: ArrowRightCircle, label: 'Xem thêm năng lực', href: '/gioi-thieu#ho-so-nang-luc', desc: 'Khám phá kinh nghiệm & quy trình Inland.' }
  ]

  return (
    <section ref={sectionRef} className={`relative w-full isolate flex items-center justify-center overflow-hidden ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ y }}
      >
        <div className="absolute inset-0 bg-white/70 z-[5]" />
        <div
          className="absolute inset-0 w-full h-[120%]"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2000&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </motion.div>
      <div className={`relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 ${
        isPortrait ? 'py-8' : ''
      } text-center`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8"
        >
          <div className="inline-block px-4 py-2 bg-white/10 rounded-full mb-3">
            <span className="text-goldLight text-sm font-semibold tracking-wide uppercase">
              Bắt đầu hợp tác
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E8C4F] mb-3 md:mb-4">
            Tăng Tốc <span className="text-goldLight">Dự Án FDI</span> Của Bạn
          </h2>
          <p className="text-base md:text-lg text-[#2E8C4F] max-w-2xl mx-auto">
            Chọn hành động phù hợp để Inland đồng hành cùng bạn trong giai đoạn tiếp theo: tư vấn định hướng, đánh giá nhu cầu hay cung cấp hồ sơ năng lực.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {actions.map((a, i) => {
            const Icon = a.icon
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5, delay: revealed ? i * 0.05 : 0 }}
                className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition"
              >
                <Icon className="w-8 h-8 text-goldLight mb-4 mx-auto" />
                <div className="font-bold text-[#2E8C4F] mb-2 text-sm md:text-base">{a.label}</div>
                <div className="text-xs md:text-sm text-[#2E8C4F] mb-4 leading-relaxed">{a.desc}</div>
                <Link
                  href={a.href}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-goldLight/20 text-goldLight text-xs font-semibold hover:bg-goldLight/30 transition"
                >
                  Bắt đầu <ArrowRightCircle className="w-4 h-4" />
                </Link>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-10 text-[11px] text-[#2E8C4F]"
        >
          * Inland bảo mật thông tin & chỉ sử dụng để tư vấn chuyên môn.
        </motion.div>
      </div>
    </section>
  )
}
