import type { Metadata } from 'next'
import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import ContactIntro from '@/components/contact/ContactIntro'
import ContactInfo from '@/components/contact/ContactInfo'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Liên hệ - INLANDV Real Estate',
  description: 'Liên hệ với INLANDV để được tư vấn các giải pháp bất động sản tối ưu. Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.',
}

const sections: SectionData[] = [
  { id: 'gioi-thieu', index: 0, title: 'Giới thiệu', backgroundType: 'image' },
  { id: 'thong-tin', index: 1, title: 'Thông tin', backgroundType: 'dark' },
  { id: 'lien-he', index: 2, title: 'Liên hệ', backgroundType: 'image' },
]

export default function ContactPage() {
  return (
    <div className="relative">
      <FullpageScroll sections={sections}>
        <ContactIntro />
        <ContactInfo />
        <ContactForm />
      </FullpageScroll>
    </div>
  )
}
