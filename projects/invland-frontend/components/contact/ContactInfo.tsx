'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useSectionReveal } from '@/hooks/useSectionReveal'

const LeafletMap = dynamic(() => import('../products/detail/LeafletMap'), { ssr: false })

const contactInfo = [
  {
    icon: MapPin,
    label: 'Địa chỉ',
    value: 'Tầng 12, Tòa nhà ABC, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    link: null,
  },
  {
    icon: Phone,
    label: 'Hotline',
    value: '0896 686 645',
    link: 'tel:0896686645',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'property.inlandv@gmail.com',
    link: 'mailto:property.inlandv@gmail.com',
  },
]

export default function ContactInfo() {
  const revealed = useSectionReveal(1) // Section index in lien-he page

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden pt-20 md:pt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-goldDark/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-goldLight/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Thông tin <span className="text-goldLight">liên hệ</span>
          </h2>
          <p className="text-base text-neutral-300 max-w-2xl mx-auto">
            Hãy để chúng tôi giúp bạn tìm kiếm cơ hội bất động sản hoàn hảo
          </p>
        </motion.div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {contactInfo.map((item, index) => {
            const Icon = item.icon
            const content = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: revealed ? index * 0.15 : 0 }}
                className={`
                  group relative bg-neutral-800/50 backdrop-blur-sm border border-goldDark/20
                  rounded-2xl p-6 text-center h-full flex flex-col
                  hover:bg-neutral-800/80 hover:border-goldDark/40 hover:shadow-xl hover:shadow-goldDark/10
                  transition-all duration-300
                  ${item.link ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mb-4 mx-auto rounded-full bg-goldDark/10 border border-goldDark/30 group-hover:bg-goldDark/20 group-hover:border-goldLight/50 transition-all duration-300">
                  <Icon className="w-7 h-7 text-goldLight group-hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Label */}
                <h3 className="text-base font-semibold text-goldLight mb-2 uppercase tracking-wide">
                  {item.label}
                </h3>

                {/* Value */}
                <p className="text-sm text-neutral-200 leading-relaxed group-hover:text-white transition-colors duration-300 flex-grow">
                  {item.value}
                </p>

                {/* Hover Effect Line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-goldDark to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
              </motion.div>
            )

            // Wrap with link if applicable
            if (item.link) {
              return (
                <a key={index} href={item.link} className="block">
                  {content}
                </a>
              )
            }

            return <div key={index}>{content}</div>
          })}
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <div className="bg-neutral-800/50 backdrop-blur-sm border border-goldDark/20 rounded-2xl p-4 overflow-hidden">
            <h3 className="text-lg font-semibold text-goldLight mb-3 text-center">Bản đồ dẫn đường</h3>
            <div className="rounded-xl overflow-hidden">
              <LeafletMap
                latitude={10.7769}
                longitude={106.7009}
                address="Tầng 12, Tòa nhà ABC, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
                height={300}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
