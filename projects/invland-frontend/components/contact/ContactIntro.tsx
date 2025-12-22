'use client'

import { motion } from 'framer-motion'

export default function ContactIntro() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 md:pt-24">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/contact-intro-bg.jpg)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Small label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-2 text-sm font-medium text-goldLight bg-goldDark/30 rounded-full border border-goldLight/30 backdrop-blur-sm">
              LIÊN HỆ VỚI CHÚNG TÔI
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8"
          >
            INLANDV luôn sẵn sàng <br className="hidden md:block" />
            <span className="text-goldLight">lắng nghe và mang đến</span><br className="hidden md:block" /> 
            giải pháp bất động sản tối ưu <br className="hidden md:block" />
            cho nhu cầu của bạn.
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed"
          >
            Chỉ cần điền thông tin bên dưới, đội ngũ INLANDV sẽ nhanh chóng kết nối và tư vấn cho bạn dự án phù hợp nhất.
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-12 mx-auto w-24 h-1 bg-gradient-to-r from-goldLight via-goldDark to-goldLight rounded-full"
          />
        </motion.div>
      </div>
    </section>
  )
}
