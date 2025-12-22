'use client'

import Link from 'next/link'
import { Calendar, Rocket, Heart, LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface ActivityCategoryBlockProps {
  title: string
  description: string
  href: string
  icon: LucideIcon
  color: string
}

function ActivityCategoryBlock({ title, description, href, icon: Icon, color }: ActivityCategoryBlockProps) {
  return (
    <Link href={href} className="group block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden h-full"
      >
        {/* Color accent bar */}
        <div className={`h-2 ${color}`} />
        
        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-full ${color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className={`w-8 h-8 ${color.replace('bg-', 'text-')}`} />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#358b4e] transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed mb-6">
            {description}
          </p>

          {/* Link */}
          <div className="flex items-center gap-2 text-[#358b4e] font-semibold group-hover:gap-3 transition-all">
            <span>Xem chi tiết</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 group-hover:opacity-10 transition-opacity">
          <Icon className="w-full h-full" />
        </div>
      </motion.div>
    </Link>
  )
}

export default function ActivitiesSection() {
  return (
    <section data-bg-type="dark" className="py-16 md:py-24 bg-[#358b4e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Hoạt động INLANDV
          </h2>
          <div className="w-24 h-1 bg-white mx-auto mb-6" />
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            Cam kết phát triển bền vững và đóng góp cho cộng đồng
          </p>
        </div>

        {/* Activity Categories Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <ActivityCategoryBlock
            title="Sự kiện đã tham gia"
            description="Các hội thảo, diễn đàn và sự kiện ngành mà INLANDV tham gia và đồng tổ chức"
            href="/tin-tuc-hoat-dong/su-kien-tham-gia"
            icon={Calendar}
            color="bg-blue-500"
          />
          
          <ActivityCategoryBlock
            title="Dự án mới triển khai"
            description="Các dự án bất động sản công nghiệp mới được INLANDV phân phối và phát triển"
            href="/tin-tuc-hoat-dong/du-an-moi"
            icon={Rocket}
            color="bg-green-500"
          />
          
          <ActivityCategoryBlock
            title="Hoạt động CSR"
            description="Trách nhiệm xã hội doanh nghiệp và các hoạt động vì cộng đồng"
            href="/tin-tuc-hoat-dong/hoat-dong-csr"
            icon={Heart}
            color="bg-red-500"
          />
        </div>
      </div>
    </section>
  )
}
