'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Award, Shield, Users, TrendingUp, Heart } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Tầm Nhìn',
    description: 'Trở thành sàn giao dịch bất động sản hàng đầu Việt Nam, mang đến những giá trị bền vững cho cộng đồng và xã hội.',
  },
  {
    icon: Award,
    title: 'Sứ Mệnh',
    description: 'Cung cấp dịch vụ tư vấn chuyên nghiệp, minh bạch và tận tâm. Đồng hành cùng khách hàng trong mọi quyết định đầu tư.',
  },
  {
    icon: Shield,
    title: 'Giá Trị Cốt Lõi',
    description: 'Uy tín - Chuyên nghiệp - Tận tâm - Minh bạch - Đổi mới sáng tạo trong mọi hoạt động kinh doanh.',
  },
  {
    icon: Users,
    title: 'Đội Ngũ',
    description: 'Hơn 200 chuyên viên tư vấn giàu kinh nghiệm, được đào tạo bài bản và am hiểu sâu sắc về thị trường BĐS.',
  },
  {
    icon: TrendingUp,
    title: 'Lợi Thế',
    description: 'Kết nối đa dạng dự án, thủ tục nhanh chóng, hỗ trợ tài chính tối ưu, chăm sóc khách hàng chu đáo.',
  },
  {
    icon: Heart,
    title: 'Trách Nhiệm Xã Hội',
    description: 'Cam kết đóng góp vào sự phát triển bền vững của cộng đồng và xã hội thông qua các hoạt động thiện nguyện.',
  },
]

export default function AboutValuesSection() {
  const [isPortrait, setIsPortrait] = useState(false)

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

  return (
    <section className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] ${
      isPortrait ? 'min-h-screen py-8' : 'h-screen'
    }`}>
      <div className={`w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-6 md:py-8 ${
        isPortrait ? 'flex flex-col justify-start' : 'max-h-[85vh] overflow-y-auto scrollbar-hide flex flex-col justify-center'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Giá Trị Cốt Lõi
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Những giá trị định hướng mọi hoạt động của chúng tôi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#1f1b1b] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-14 h-14 bg-[#2E8C4F]/20 rounded-full flex items-center justify-center mb-4">
                <value.icon className="w-7 h-7 text-goldLight" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                {value.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
