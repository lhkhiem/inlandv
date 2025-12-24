'use client'

import { motion } from 'framer-motion'
import { Target, Compass, Shield } from 'lucide-react'

const values = [
  {
    icon: Target,
    title: 'Tầm Nhìn',
    description: 'Trở thành sàn giao dịch bất động sản hàng đầu Việt Nam, tiên phong trong việc ứng dụng công nghệ và mang đến những giá trị bền vững cho cộng đồng và xã hội.',
    gradient: 'from-goldDark/10 to-goldLight/10'
  },
  {
    icon: Compass,
    title: 'Sứ Mệnh',
    description: 'Cung cấp dịch vụ tư vấn bất động sản chuyên nghiệp, minh bạch và tận tâm. Đồng hành cùng khách hàng trong mọi quyết định đầu tư, mang đến trải nghiệm tốt nhất.',
    gradient: 'from-goldLight/10 to-goldDark/10'
  },
  {
    icon: Shield,
    title: 'Giá Trị Cốt Lõi',
    description: 'Uy tín - Chuyên nghiệp - Tận tâm - Minh bạch - Đổi mới sáng tạo. Đây là nền tảng cho mọi hoạt động kinh doanh và phát triển bền vững của Inland.',
    gradient: 'from-goldDark/10 to-goldLight/10'
  }
]

export default function VisionMission() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block px-4 py-2 bg-goldLight/10 rounded-full mb-4">
            <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
              Triết lý kinh doanh
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tầm Nhìn - Sứ Mệnh
            <br />
            <span className="text-goldDark">Giá Trị Cốt Lõi</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những giá trị định hướng và dẫn dắt mọi hoạt động phát triển của Inland
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className={`
                absolute inset-0 bg-gradient-to-br ${value.gradient} rounded-3xl 
                transform group-hover:scale-105 transition-transform duration-300
              `} />
              
              <div className="relative bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-goldDark to-goldLight flex items-center justify-center mb-6 transform group-hover:rotate-6 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>

                {/* Decorative bottom line */}
                <div className="mt-6 h-1 w-16 bg-gradient-to-r from-goldDark to-goldLight rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
