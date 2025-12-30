"use client"
import React from 'react'
import InfoCard from './InfoCard'
import { Phone, FileText } from 'lucide-react'
import { useContactSettings } from '@/hooks/useContactSettings'

interface ContactSectionProps {
  type: 'property' | 'industrialPark'
  phoneNumber?: string // Fallback if settings not available
  onOpenForm: () => void
}

export const ContactSection: React.FC<ContactSectionProps> = ({ type, phoneNumber, onOpenForm }) => {
  const { settings: contactSettings, loading } = useContactSettings()
  
  // Use phone from settings, fallback to prop, then default
  const displayPhone = contactSettings.hotline || phoneNumber || '0896686645'
  
  // Remove spaces and format for tel: link
  const telPhone = displayPhone.replace(/\s+/g, '')
  
  return (
    <InfoCard title="Liên hệ" icon={Phone}>
      <div className="flex flex-col gap-3">
        <a
          href={`tel:${telPhone}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#358b4e] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#2d7540] transition"
        >
          <Phone className="h-4 w-4" />
          {displayPhone}
        </a>
        <button
          onClick={onOpenForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#358b4e] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#2d7540] transition"
        >
          <FileText className="h-4 w-4" />
          Đặt hẹn tư vấn
        </button>
      </div>
    </InfoCard>
  )
}

export default ContactSection
