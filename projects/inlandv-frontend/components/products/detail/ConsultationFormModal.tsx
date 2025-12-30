"use client"
import React, { useState } from 'react'
import { X, Send } from 'lucide-react'

interface ConsultationFormModalProps {
  isOpen: boolean
  onClose: () => void
  productName?: string
}

export const ConsultationFormModal: React.FC<ConsultationFormModalProps> = ({ isOpen, onClose, productName }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consultationType: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Integrate with backend API
    console.log('Form submitted:', formData)
    alert('Cảm ơn bạn! Chúng tôi sẽ liên hệ sớm.')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-white/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 my-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold mb-2">Đặt hẹn tư vấn</h2>
        {productName && <p className="text-sm text-gray-600 mb-4 md:mb-6">Dự án: {productName}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#358b4e]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="0901234567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#358b4e]/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#358b4e]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Cần tư vấn <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.consultationType}
                onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#358b4e]/50 bg-white"
              >
                <option value="">-- Chọn nhu cầu --</option>
                <option value="rent">Cho thuê</option>
                <option value="buy">Mua bán</option>
                <option value="invest">Đầu tư</option>
                <option value="legal">Pháp lý</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Lời nhắn <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tôi muốn tìm hiểu về..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#358b4e]/50 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#d4a23e] hover:bg-[#c49335] text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition shadow-md"
          >
            <Send className="h-5 w-5" />
            Gửi thông tin
          </button>
        </form>
      </div>
    </div>
  )
}

export default ConsultationFormModal
