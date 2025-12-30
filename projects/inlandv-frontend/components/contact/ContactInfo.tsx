'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useSectionReveal } from '@/hooks/useSectionReveal'
import { api } from '@/lib/api'

const LeafletMap = dynamic(() => import('../products/detail/LeafletMap'), { ssr: false })

interface ContactSettings {
  address?: string
  hotline?: string
  email?: string
  googleMapLink?: string
  latitude?: number
  longitude?: number
}

const defaultContactInfo = [
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
  const [contactInfo, setContactInfo] = useState(defaultContactInfo)
  const [mapData, setMapData] = useState({
    latitude: 10.7769,
    longitude: 106.7009,
    address: 'Tầng 12, Tòa nhà ABC, 123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    googleMapLink: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        // Try to fetch from 'contact' namespace first, then fallback to 'general'
        let settings: ContactSettings = {}
        
        try {
          console.log('[ContactInfo] Fetching contact settings from "contact" namespace...')
          const contactResponse = await api.getSettingByNamespace('contact')
          console.log('[ContactInfo] Contact response:', contactResponse)
          
          if (contactResponse.success && contactResponse.data) {
            // Handle both direct value and nested value structure
            const value = contactResponse.data.value || contactResponse.data
            if (value && typeof value === 'object') {
              // Check if value has actual data (not just empty object)
              const hasData = Object.keys(value).length > 0 && (
                value.address || value.hotline || value.email || 
                value.phone || value.latitude || value.longitude
              )
              
              if (hasData) {
                settings = value
                console.log('[ContactInfo] Loaded from contact namespace:', settings)
              } else {
                console.log('[ContactInfo] Contact namespace exists but is empty, trying general...')
                throw new Error('Contact namespace is empty')
              }
            }
          } else {
            throw new Error('Contact namespace not found or invalid response')
          }
        } catch (e) {
          console.log('[ContactInfo] Contact namespace not found or empty, trying general...', e)
          
          // If 'contact' namespace doesn't exist or is empty, try 'general'
          try {
            const generalResponse = await api.getSettingByNamespace('general')
            console.log('[ContactInfo] General response:', generalResponse)
            
            if (generalResponse.success && generalResponse.data) {
              // Handle both direct value and nested value structure
              const general = generalResponse.data.value || generalResponse.data
              console.log('[ContactInfo] General data:', general)
              
              if (general && typeof general === 'object') {
                // Map from general.businessInfo to contact settings format
                settings = {
                  address: general.businessInfo?.address || general.address || '',
                  hotline: general.businessInfo?.phone || general.hotline || general.phone || '',
                  email: general.businessInfo?.email || general.email || '',
                  googleMapLink: general.businessInfo?.googleMapLink || general.businessInfo?.google_maps_link || general.googleMapLink || general.google_maps_link || '',
                  latitude: general.businessInfo?.latitude || general.latitude,
                  longitude: general.businessInfo?.longitude || general.longitude,
                }
                console.log('[ContactInfo] Mapped settings from general:', settings)
              }
            }
          } catch (e2) {
            // Both failed, use defaults
            console.warn('[ContactInfo] Failed to fetch contact settings from both namespaces:', e2)
          }
        }
        
        console.log('[ContactInfo] Final settings to use:', settings)
        
        // Update contact info
        const updatedContactInfo = [
          {
            icon: MapPin,
            label: 'Địa chỉ',
            value: settings.address || defaultContactInfo[0].value,
            link: null,
          },
          {
            icon: Phone,
            label: 'Hotline',
            value: settings.hotline || defaultContactInfo[1].value,
            link: settings.hotline ? `tel:${settings.hotline.replace(/\s/g, '')}` : defaultContactInfo[1].link,
          },
          {
            icon: Mail,
            label: 'Email',
            value: settings.email || defaultContactInfo[2].value,
            link: settings.email ? `mailto:${settings.email}` : defaultContactInfo[2].link,
          },
        ]
        
        console.log('[ContactInfo] Updated contact info:', updatedContactInfo)
        setContactInfo(updatedContactInfo)
        
        // Update map data
        if (settings.googleMapLink) {
          // Priority: Use Google Maps link if available
          setMapData(prev => ({
            ...prev,
            googleMapLink: settings.googleMapLink || '',
            address: settings.address || prev.address,
            latitude: settings.latitude || prev.latitude,
            longitude: settings.longitude || prev.longitude,
          }))
        } else if (settings.latitude && settings.longitude) {
          // Fallback: Use coordinates if available
          setMapData({
            latitude: settings.latitude,
            longitude: settings.longitude,
            address: settings.address || mapData.address,
            googleMapLink: '',
          })
        } else if (settings.address) {
          // Update address even if no coordinates or map link
          setMapData(prev => ({
            ...prev,
            address: settings.address || prev.address,
          }))
        }
      } catch (error) {
        // Log error for debugging
        console.error('[ContactInfo] Failed to fetch contact settings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactSettings()
  }, [])

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center bg-[#F5F5F5] overflow-hidden pt-20 md:pt-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #2E8C4F 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-goldDark/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-goldLight/5 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#2E8C4F] mb-3">
            Thông tin <span className="text-goldLight">liên hệ</span>
          </h2>
          <p className="text-base text-[#2E8C4F] max-w-2xl mx-auto">
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
                  group relative bg-white/50 backdrop-blur-sm border border-goldDark/20
                  rounded-2xl p-6 text-center h-full flex flex-col
                  hover:bg-white/80 hover:border-goldDark/40 hover:shadow-xl hover:shadow-goldDark/10
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
                <p className="text-sm text-[#2E8C4F] leading-relaxed group-hover:text-[#2E8C4F] transition-colors duration-300 flex-grow">
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
          <div className="bg-white/50 backdrop-blur-sm border border-goldDark/20 rounded-2xl p-4 overflow-hidden">
            <h3 className="text-lg font-semibold text-goldLight mb-3 text-center">Bản đồ dẫn đường</h3>
            <div className="rounded-xl overflow-hidden">
              <LeafletMap
                latitude={mapData.latitude}
                longitude={mapData.longitude}
                address={mapData.address}
                googleMapLink={mapData.googleMapLink}
                height={300}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
