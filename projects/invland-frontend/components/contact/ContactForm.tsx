'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import { useSectionReveal } from '@/hooks/useSectionReveal'

interface FormData {
  fullName: string
  phone: string
  email: string
  service: string
  message: string
}

interface FormErrors {
  fullName?: string
  phone?: string
  email?: string
  service?: string
}

export default function ContactForm() {
  const revealed = useSectionReveal(2) // Section index in lien-he page
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    service: '',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên'
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số)'
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log('Form submitted:', formData)

    // Show success state
    setIsSuccess(true)
    setIsSubmitting(false)

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        service: '',
        message: '',
      })
      setIsSuccess(false)
    }, 3000)
  }

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-20 md:pt-24">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/contact-form-bg.jpg)',
        }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-16 max-w-4xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Để lại <span className="text-goldLight">thông tin</span>
            </h2>
            <p className="text-base md:text-lg text-white/90">
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất
            </p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl border border-neutral-200 p-6 md:p-8"
          >
            <div className="space-y-4">
              {/* Row 1: Full Name and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-2.5 rounded-xl border-2 
                      bg-neutral-50 text-neutral-900 placeholder-neutral-400
                      focus:outline-none focus:ring-2 focus:ring-goldDark/50 focus:border-goldDark
                      transition-all duration-300
                      ${errors.fullName ? 'border-red-400' : 'border-neutral-200'}
                    `}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-2.5 rounded-xl border-2 
                      bg-neutral-50 text-neutral-900 placeholder-neutral-400
                      focus:outline-none focus:ring-2 focus:ring-goldDark/50 focus:border-goldDark
                      transition-all duration-300
                      ${errors.phone ? 'border-red-400' : 'border-neutral-200'}
                    `}
                    placeholder="0901234567"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email and Service */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-2.5 rounded-xl border-2 
                      bg-neutral-50 text-neutral-900 placeholder-neutral-400
                      focus:outline-none focus:ring-2 focus:ring-goldDark/50 focus:border-goldDark
                      transition-all duration-300
                      ${errors.email ? 'border-red-400' : 'border-neutral-200'}
                    `}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Service */}
                <div>
                  <label htmlFor="service" className="block text-sm font-semibold text-neutral-700 mb-2">
                    Dịch vụ cần tư vấn <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className={`
                      w-full px-4 py-2.5 rounded-xl border-2 
                      bg-neutral-50 text-neutral-900
                      focus:outline-none focus:ring-2 focus:ring-goldDark/50 focus:border-goldDark
                      transition-all duration-300
                      ${errors.service ? 'border-red-400' : 'border-neutral-200'}
                      ${!formData.service ? 'text-neutral-400' : 'text-neutral-900'}
                    `}
                  >
                    <option value="" disabled>Chọn dịch vụ</option>
                    <option value="mua-ban">Mua/Bán Bất động sản</option>
                    <option value="thue-cho-thue">Thuê/Cho thuê Bất động sản</option>
                    <option value="tu-van-khac">Tư vấn khác</option>
                  </select>
                  {errors.service && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.service}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-neutral-700 mb-2">
                  Lời nhắn
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="
                    w-full px-4 py-2.5 rounded-xl border-2 border-neutral-200
                    bg-neutral-50 text-neutral-900 placeholder-neutral-400
                    focus:outline-none focus:ring-2 focus:ring-goldDark/50 focus:border-goldDark
                    transition-all duration-300 resize-none
                  "
                  placeholder="Để lại lời nhắn cho chúng tôi"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className={`
                  w-full py-3 px-6 rounded-xl font-semibold text-white text-base
                  flex items-center justify-center gap-3
                  transition-all duration-300 transform
                  ${
                    isSuccess
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-goldDark hover:bg-goldDark/90 hover:scale-[1.02] active:scale-[0.98]'
                  }
                  disabled:opacity-70 disabled:cursor-not-allowed
                  shadow-lg hover:shadow-xl
                `}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang gửi...
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Gửi thành công!
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi yêu cầu tư vấn
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-center"
            >
              <p className="text-green-700 font-medium text-sm">
                Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất có thể.
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
