'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Quote, Star, Users } from 'lucide-react'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useSectionReveal } from '@/hooks/useSectionReveal'

export default function ServicesTestimonialsSection() {
  const { headerHeight } = useLayoutMeasurements()
  const paddingTop = headerHeight + 30
  const [isPortrait, setIsPortrait] = useState(false)
  const revealed = useSectionReveal(6) // Section index in dich-vu page

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

  const testimonials = [
    {
      quote: 'Inland giúp chúng tôi giảm đáng kể thời gian chuẩn bị nhà xưởng và ổn định nhân sự nội địa ngay trong quý đầu tiên.',
      author: 'TGĐ doanh nghiệp FDI Nhật Bản',
      role: 'Lĩnh vực linh kiện chính xác'
    },
    {
      quote: 'Quy trình pháp lý & đầu tư được chuẩn hoá rõ ràng. Gần như không phát sinh điều chỉnh lớn khi đi vào triển khai.',
      author: 'Giám đốc dự án Hàn Quốc',
      role: 'Sản xuất điện tử'
    },
    {
      quote: 'Đội ngũ tư vấn thiết kế tối ưu hoá được dòng thao tác, giúp giảm lãng phí vận chuyển nội bộ.',
      author: 'Quản lý vận hành',
      role: 'Kho logistics tự động'
    }
  ]

  const metrics = [
    { value: '92%', label: 'Khách hàng tái ký' },
    { value: '4.8/5', label: 'Mức độ hài lòng' },
    { value: '85%', label: 'Giảm ma sát triển khai' },
    { value: '100%', label: 'Tuân thủ pháp lý' }
  ]

  return (
    <section className={`relative w-full isolate flex items-start justify-start overflow-hidden bg-[#F5F5F5] ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
      <div 
        className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 flex flex-col ${
          isPortrait ? 'py-6' : 'pb-8 h-full'
        }`}
        style={!isPortrait ? { paddingTop: `${paddingTop}px` } : {}}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={revealed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-5 md:mb-6"
        >
          <div className="inline-block px-4 py-2 bg-goldLight/10 rounded-full mb-3">
            <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
              Đánh giá khách hàng
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#2E8C4F] mb-2 md:mb-3">
            Niềm Tin <span className="text-goldLight">Khách Hàng</span>
          </h2>
          <p className="text-base md:text-lg text-[#2E8C4F] max-w-3xl mx-auto">
            Phản hồi thực tế từ các doanh nghiệp FDI đã đồng hành cùng Inland trong nhiều giai đoạn triển khai dự án.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Testimonials carousel style grid */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
            transition={{ duration: 0.6, delay: revealed ? 0.1 : 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4 flex items-center gap-2"><Quote className="w-5 h-5 text-goldLight" /> Chia sẻ</h3>
            <div className="space-y-5 max-h-[300px] overflow-y-auto pr-2">
              {testimonials.map((t, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-none">
                  <p className="text-sm text-[#2E8C4F] mb-2 leading-relaxed">"{t.quote}"</p>
                  <div className="text-xs text-[#2E8C4F]">{t.author} — {t.role}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-300"
          >
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-goldLight" /> Chỉ số</h3>
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((m, i) => (
                <div key={i} className="p-4 rounded-xl bg-white border border-gray-300">
                  <div className="text-goldLight font-bold text-xl">{m.value}</div>
                  <div className="text-xs text-[#2E8C4F]">{m.label}</div>
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
            <h3 className="text-lg font-bold text-[#2E8C4F] mb-3 flex items-center gap-2"><Users className="w-5 h-5 text-goldLight" /> Giá trị duy trì</h3>
            <p className="text-sm text-[#2E8C4F] leading-relaxed mb-4">
              Sự kết hợp giữa tư vấn đầu tư, pháp lý, thiết kế và nhân sự tạo ra chuỗi hỗ trợ xuyên suốt giúp giảm ma sát, tăng tốc độ ổn định tổ chức và hiệu quả vận hành.
            </p>
            <div className="space-y-3 text-xs text-[#2E8C4F]">
              <div className="p-3 rounded-xl bg-white shadow-sm border border-goldLight/40">Liên hệ hỗ trợ nội bộ phản hồi trong 2h làm việc.</div>
              <div className="p-3 rounded-xl bg-white shadow-sm border border-goldLight/40">Checklist tiêu chuẩn áp dụng nhất quán giữa các dự án.</div>
              <div className="p-3 rounded-xl bg-white shadow-sm border border-goldLight/40">Đánh giá cải tiến định kỳ theo giai đoạn mở rộng.</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
