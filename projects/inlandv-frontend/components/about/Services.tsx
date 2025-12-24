'use client'

import { motion } from 'framer-motion'
import { Home, TrendingUp, FileCheck, HandshakeIcon, Building, Sparkles } from 'lucide-react'

const services = [
  {
    icon: Home,
    title: 'Mua Bán BĐS',
    description: 'Tư vấn mua bán căn hộ, nhà phố, biệt thự và đất nền với giá tốt nhất thị trường.'
  },
  {
    icon: TrendingUp,
    title: 'Tư Vấn Đầu Tư',
    description: 'Phân tích thị trường, định hướng đầu tư sinh lời bền vững và an toàn.'
  },
  {
    icon: FileCheck,
    title: 'Thẩm Định Pháp Lý',
    description: 'Kiểm tra, thẩm định đầy đủ hồ sơ pháp lý để đảm bảo giao dịch an toàn.'
  },
  {
    icon: HandshakeIcon,
    title: 'Môi Giới Chuyên Nghiệp',
    description: 'Kết nối mua - bán nhanh chóng với mạng lưới khách hàng rộng khắp.'
  },
  {
    icon: Building,
    title: 'Phân Phối Dự Án',
    description: 'Đại lý phân phối độc quyền các dự án bất động sản cao cấp từ chủ đầu tư.'
  },
  {
    icon: Sparkles,
    title: 'Dịch Vụ Hậu Mãi',
    description: 'Hỗ trợ thủ tục sổ hồng, cho thuê và chăm sóc khách hàng lâu dài.'
  }
]

export default function Services() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-block px-4 py-2 bg-goldLight/10 rounded-full mb-4">
            <span className="text-goldDark text-sm font-semibold tracking-wide uppercase">
              Dịch vụ của chúng tôi
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Ngành Nghề
            <br />
            <span className="text-goldDark">& Dịch Vụ</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Giải pháp toàn diện cho mọi nhu cầu bất động sản của bạn
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-2xl hover:border-goldLight/30 transition-all duration-300"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-goldDark/5 to-goldLight/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-goldDark/10 to-goldLight/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-7 h-7 text-goldDark" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-goldDark transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-4 flex items-center text-goldDark opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-semibold">Tìm hiểu thêm</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
