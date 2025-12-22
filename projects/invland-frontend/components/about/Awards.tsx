'use client'

import { motion } from 'framer-motion'
import { Award, Trophy, Medal, Star, Shield, CheckCircle2 } from 'lucide-react'

const achievements = [
  {
    icon: Trophy,
    title: 'Top 10 Sàn BĐS Uy Tín',
    year: '2023 - 2024',
    description: 'Được bình chọn trong Top 10 sàn giao dịch bất động sản uy tín nhất Việt Nam'
  },
  {
    icon: Award,
    title: 'Doanh Nghiệp Tiêu Biểu',
    year: '2022',
    description: 'Giải thưởng Doanh nghiệp tiêu biểu trong lĩnh vực BĐS do Hiệp hội BĐS trao tặng'
  },
  {
    icon: Medal,
    title: 'Đại Lý Phân Phối Xuất Sắc',
    year: '2021 - 2024',
    description: 'Liên tục được các chủ đầu tư lớn trao tặng danh hiệu đại lý xuất sắc'
  },
  {
    icon: Star,
    title: 'Chứng Nhận ISO 9001:2015',
    year: '2020',
    description: 'Chứng nhận hệ thống quản lý chất lượng theo tiêu chuẩn quốc tế ISO 9001:2015'
  },
  {
    icon: Shield,
    title: 'Thương Hiệu Tin Cậy',
    year: '2019 - 2024',
    description: 'Thương hiệu tin cậy được bình chọn bởi hàng nghìn khách hàng trên toàn quốc'
  },
  {
    icon: CheckCircle2,
    title: 'Đối Tác Chiến Lược',
    year: '2018 - 2024',
    description: 'Đối tác chiến lược của hơn 50 chủ đầu tư và tập đoàn bất động sản lớn'
  }
]

export default function Awards() {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-white">
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
              Thành tựu
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Thành Tựu
            <br />
            <span className="text-goldDark">& Chứng Nhận</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Những giải thưởng và chứng nhận uy tín khẳng định vị thế của Inland
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-goldLight/50 transition-all duration-300 h-full">
                {/* Background pattern on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-goldDark/5 to-goldLight/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative">
                  {/* Icon with animated background */}
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-goldDark to-goldLight rounded-xl transform rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                    <div className="relative w-full h-full bg-white rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                      <achievement.icon className="w-8 h-8 text-goldDark" />
                    </div>
                  </div>

                  {/* Year badge */}
                  <div className="inline-block px-3 py-1 bg-goldLight/20 rounded-full mb-3">
                    <span className="text-goldDark text-xs font-bold">{achievement.year}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">
                    {achievement.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {achievement.description}
                  </p>

                  {/* Decorative line */}
                  <div className="mt-4 h-1 w-12 bg-gradient-to-r from-goldDark to-goldLight rounded-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stat */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-10 text-center"
        >
          <p className="text-gray-600">
            Hơn <span className="font-bold text-goldDark text-xl">20+ giải thưởng</span> và chứng nhận uy tín trong 15 năm hoạt động
          </p>
        </motion.div>
      </div>
    </section>
  )
}
