'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import type { Lead } from '@/lib/types'
import { validateEmail, validatePhone } from '@/lib/utils'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'
import { useCanvasScale } from '@/hooks/useCanvasScale'

export default function ContactSection() {
  const { headerHeight, timelineWidth } = useLayoutMeasurements()
  
  // Uniform Canvas Scaler: Scale content uniformly based on viewport dimensions
  // Reference: 1920×1080 (FullHD 23") = scale 1.0
  // Portrait: no scaling (scale = 1)
  const { scale: uniformScale, isLandscape, viewport } = useCanvasScale(1920, 1080, 0.5, 1.0)
  
  // Calculate adjusted scale and max-width to ensure content doesn't touch timeline
  // Content is centered on viewport, but scale must account for timeline
  const [adjustedScale, setAdjustedScale] = useState(1)
  const [maxContainerWidth, setMaxContainerWidth] = useState<number | undefined>(undefined)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    need: '',
    location: '',
    otherRequest: '',
    source: 'homepage' as const,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const needOptions = [
    { value: 'mua', label: 'Mua bất động sản' },
    { value: 'ban', label: 'Bán bất động sản' },
    { value: 'thue', label: 'Thuê bất động sản' },
    { value: 'cho-thue', label: 'Cho thuê bất động sản' },
    { value: 'khac', label: 'Dịch vụ khác' },
  ]

  const cities = [
    'TP. Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Bình Dương',
    'Đồng Nai',
    'Long An',
    'Bình Định',
    'Khác',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {const newErrors = { ...prev }; delete newErrors[name]; return newErrors })
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (!formData.need) {
      newErrors.need = 'Vui lòng chọn nhu cầu'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const leadData: Lead = {
        name: formData.name,
        phone: formData.phone,
        email: '',
        message: `[${needOptions.find(t => t.value === formData.need)?.label}] [${formData.location}] ${formData.otherRequest}`,
        source: formData.source,
      }
      
      const response = await api.createLead(leadData)
      if (response.success) {
        setSuccess(true)
        setFormData({
          name: '',
          phone: '',
          need: '',
          location: '',
          otherRequest: '',
          source: 'homepage',
        })
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Failed to submit form:', error)
      setErrors({ submit: 'Có lỗi xảy ra. Vui lòng thử lại sau.' })
    } finally {
      setLoading(false)
    }
  }

  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setIsPortrait(!isLandscape)
  }, [isLandscape])

  // Calculate max-width and scale for landscape mode
  useEffect(() => {
    if (typeof window === 'undefined' || !isLandscape) {
      setAdjustedScale(1)
      setMaxContainerWidth(undefined)
      return
    }
    
    const viewportWidth = viewport.width || window.innerWidth
    
    // Timeline right padding: md:right-10 (40px) hoặc right-6 (24px)
    const timelineRightPadding = viewportWidth >= 768 ? 40 : 24
    // Timeline left edge = viewportWidth - timelineRightPadding - timelineWidth
    const timelineLeftEdge = viewportWidth - timelineRightPadding - timelineWidth
    
    // Nội dung căn giữa viewport thiết bị (centerX = viewportWidth / 2)
    const centerX = viewportWidth / 2
    
    // Max content width (sau scale) để không chạm timeline
    // Content right edge sau scale phải <= timelineLeftEdge - 15px (buffer tối thiểu)
    // Content right edge = centerX + (scaledWidth / 2)
    // => scaledWidth <= 2 * (timelineLeftEdge - 15 - centerX)
    const maxScaledContentWidth = Math.max(0, 2 * (timelineLeftEdge - 15 - centerX))
    
    // Reference content width at FullHD (1920px)
    const referenceContentWidth = 1920
    
    // Calculate scale based on timeline constraint
    const scaleByTimeline = maxScaledContentWidth > 0
      ? maxScaledContentWidth / referenceContentWidth
      : uniformScale
    
    // Use the smaller of uniform scale and timeline-constrained scale
    const finalScale = Math.min(uniformScale, scaleByTimeline)
    
    // Clamp scale between 0.5 and 1.0
    const clampedScale = Math.max(0.5, Math.min(1.0, finalScale))
    
    // Max-width = Ngang màn hình - 2x(Ngang bộ timeline + khoảng cách từ mép màn hình đến mép phải timeline + 15px)
    const maxWidthBeforeScale = viewportWidth - 2 * (timelineWidth + timelineRightPadding + 15)
    
    setAdjustedScale(clampedScale)
    setMaxContainerWidth(maxWidthBeforeScale)
  }, [uniformScale, isLandscape, timelineWidth, viewport])

  return (
    <section 
      className={`relative w-full flex items-center justify-center overflow-hidden bg-[#151313] bg-cover bg-center bg-no-repeat ${
        isPortrait ? 'min-h-0 py-4' : 'h-screen'
      }`}
      style={{ backgroundImage: 'url(/images/processed-image-5-6.webp)' }}
    >
      {/* Dark overlay - tăng độ tối thêm 20% (từ 60% lên 80%) */}
      <div className="absolute inset-0 bg-black/80 z-10" />
      {/* Wrapper container - Căn giữa viewport (cả ngang và dọc) */}
      <div
        className={`relative z-[90] ${
          isPortrait 
            ? 'w-full flex flex-col justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20' 
            : 'absolute inset-0 flex items-center justify-center'
        }`}
        style={isPortrait ? {
          paddingTop: `${headerHeight + 15}px`
        } : {}}
      >
        {/* Content Container - Max-width động, scale như canvas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={isPortrait ? 'w-full py-4' : 'w-full max-h-[85vh] overflow-y-auto scrollbar-hide'}
          style={!isPortrait ? {
            // Max-width động để đảm bảo không chạm timeline
            maxWidth: maxContainerWidth ? `${maxContainerWidth}px` : '1600px',
            // Padding đối xứng 15px mỗi bên (theo layout ảnh)
            paddingLeft: '15px',
            paddingRight: '15px',
            // Scale toàn bộ content container như canvas
            transform: `scale(${adjustedScale})`,
            transformOrigin: 'center center',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {}}
        >
          <div className="flex flex-col">
        <div className="text-center mb-6 md:mb-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-bold text-goldLight text-[40px] md:text-[56px] lg:text-[80px] leading-[170%] tracking-normal mb-3"
          >
            Nhận Báo Giá Ngay
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-heading font-bold italic text-[14px] md:text-[18px] lg:text-[20px] leading-[170%] text-center text-white/80 max-w-3xl mx-auto whitespace-pre-line"
          >
            {`Nắm bắt nhanh nhu cầu và nhanh chóng gửi báo giá,\ntiết kiệm thời gian giá trị của Quý Khách hàng.`}
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p>Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm nhất.</p>
                </div>
              )}

              {/* Họ và tên */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border border-white rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-goldLight focus:border-goldLight transition-all ${
                    errors.name ? 'border-red-500' : 'border-white'
                  }`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>

              {/* Số điện thoại */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border border-white rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-goldLight focus:border-goldLight transition-all ${
                    errors.phone ? 'border-red-500' : 'border-white'
                  }`}
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>

              {/* Nhu cầu */}
              <div>
                <label htmlFor="need" className="block text-sm font-medium text-white mb-1">
                  Nhu cầu <span className="text-red-500">*</span>
                </label>
                <select
                  id="need"
                  name="need"
                  value={formData.need}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm border border-white rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-goldLight focus:border-goldLight transition-all ${
                    errors.need ? 'border-red-500' : 'border-white'
                  }`}
                >
                  <option value="">-- Chọn nhu cầu --</option>
                  {needOptions.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.need && <p className="mt-1 text-xs text-red-500">{errors.need}</p>}
              </div>

              {/* Địa điểm dự kiến */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-white mb-1">
                  Địa điểm dự kiến <span className="text-gray-400 text-xs">(Dropdown list thành phố)</span>
                </label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-white rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-goldLight focus:border-goldLight transition-all"
                >
                  <option value="">-- Chọn thành phố --</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Yêu cầu khác */}
              <div>
                <label htmlFor="otherRequest" className="block text-sm font-medium text-white mb-1">
                  Yêu cầu khác
                </label>
                <textarea
                  id="otherRequest"
                  name="otherRequest"
                  value={formData.otherRequest}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-white rounded-lg bg-gray-800/50 text-white focus:ring-2 focus:ring-goldLight focus:border-goldLight transition-all resize-none"
                />
              </div>

              {errors.submit && (
                <p className="text-xs md:text-sm text-red-500">{errors.submit}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 px-6 py-2.5 bg-goldLight hover:bg-[#23673b] text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi thông tin
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
