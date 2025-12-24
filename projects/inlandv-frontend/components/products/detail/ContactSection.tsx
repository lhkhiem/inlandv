"use client"
import React from 'react'
import InfoCard from './InfoCard'
import { Phone, FileText } from 'lucide-react'

interface ContactSectionProps {
  type: 'property' | 'industrialPark'
  phoneNumber?: string
  onOpenForm: () => void
}

export const ContactSection: React.FC<ContactSectionProps> = ({ type, phoneNumber = '0896686645', onOpenForm }) => {
  return (
    <InfoCard title="Liên hệ" icon={Phone}>
      <div className="flex flex-col gap-3">
        <a
          href={`tel:${phoneNumber}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#358b4e] px-5 py-3 text-sm font-semibold text-white shadow hover:bg-[#2d7540] transition"
        >
          <Phone className="h-4 w-4" />
          {phoneNumber}
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
