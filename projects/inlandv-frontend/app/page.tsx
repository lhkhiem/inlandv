import { Suspense } from 'react'
import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import SectionNavigationHandler from '@/components/SectionNavigationHandler'
import Section from '@/components/Section'
import HeroSection from '@/components/sections/HeroSection'
import IndustrialLandTransferKCNSection from '@/components/sections/IndustrialLandTransferKCNSection'
import IndustrialLandTransferOutsideKCNSection from '@/components/sections/ProjectsSection'
import IndustrialLeaseSection from '@/components/sections/PortfolioSection'
import NewsSection from '@/components/sections/NewsSection'
import ContactSection from '@/components/sections/ContactSection'

const sections: SectionData[] = [
  { id: 'hero', index: 0, title: 'Trang Chủ', backgroundType: 'dark' },
  { id: 'chuyen-nhuong-kcn', index: 1, title: 'Chuyển nhượng đất trong KCN', backgroundType: 'dark' },
  { id: 'chuyen-nhuong-ngoai-kcn', index: 2, title: 'Chuyển nhượng đất ngoài KCN', backgroundType: 'dark' },
  { id: 'cho-thue', index: 3, title: 'Cho Thuê', backgroundType: 'dark' },
  { id: 'tin-tuc', index: 4, title: 'Tin Tức', backgroundType: 'dark' },
  { id: 'bao-gia-ngay', index: 5, title: 'Báo giá ngay', backgroundType: 'dark' },
]

export default function HomePage() {
  return (
    <div className="relative">
      <Suspense fallback={null}>
        <SectionNavigationHandler sections={sections} />
      </Suspense>
      <FullpageScroll sections={sections}>
        <HeroSection />
        <IndustrialLandTransferKCNSection />
        <IndustrialLandTransferOutsideKCNSection />
        <IndustrialLeaseSection />
        <NewsSection />
        <ContactSection />
      </FullpageScroll>
    </div>
  )
}
