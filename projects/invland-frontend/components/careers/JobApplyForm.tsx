"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import CVUpload from './CVUpload'
import { Send } from 'lucide-react'

export default function JobApplyForm({ jobTitle }: { jobTitle: string }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    note: ''
  })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cvFile) {
      alert('Vui lòng upload CV')
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setShowSuccess(true)
    
    // Reset form
    setFormData({ fullName: '', email: '', phone: '', note: '' })
    setCvFile(null)
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Ứng tuyển ngay
          </h2>
          <p className="text-gray-600 mb-8">
            Điền thông tin và gửi hồ sơ của bạn cho vị trí: <span className="font-semibold text-goldDark">{jobTitle}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-goldDark focus:border-transparent transition-all"
                placeholder="Nhập họ và tên của bạn"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-goldDark focus:border-transparent transition-all"
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-goldDark focus:border-transparent transition-all"
                placeholder="0912345678"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-goldDark focus:border-transparent transition-all resize-none"
                placeholder="Thông tin thêm về bạn..."
              />
            </div>

            {/* CV Upload */}
            <CVUpload onFileChange={setCvFile} />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-goldDark text-white py-4 rounded-lg font-semibold hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Nộp hồ sơ
                </>
              )}
            </button>
          </form>

          {/* Success Toast */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
            >
              ✓ Nộp hồ sơ thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
