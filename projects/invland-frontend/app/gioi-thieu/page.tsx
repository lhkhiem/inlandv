import type { Metadata } from 'next'
import { Suspense } from 'react'
import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import SectionNavigationHandler from '@/components/SectionNavigationHandler'
import AboutHero from '@/components/about/AboutHero'
import StoryOrigin from '@/components/about/StoryOrigin'
import MissionVision from '@/components/about/MissionVision'
import KeyTeam from '@/components/about/KeyTeam'
import KeyClients from '@/components/about/KeyClients'

export const metadata: Metadata = {
  title: 'Giới thiệu - Inland Real Estate',
  description: 'Tìm hiểu về Inland Real Estate - Sàn giao dịch bất động sản uy tín với hơn 15 năm kinh nghiệm',
}

const sections: SectionData[] = [
  { id: 'hero', index: 0, title: 'Mở đầu', backgroundType: 'dark' },
  { id: 'cau-chuyen', index: 1, title: 'Câu chuyện Inlandv', backgroundType: 'dark' },
  { id: 'doi-ngu', index: 2, title: 'Đội ngũ lãnh đạo', backgroundType: 'dark' },
  { id: 'tai-sao', index: 3, title: 'Tại sao nên chọn Inlandv', backgroundType: 'dark' },
  { id: 'khach-hang', index: 4, title: 'Khách hàng & Đối tác tiêu biểu', backgroundType: 'dark' },
]

export default function AboutPage() {
  return (
    <div className="relative">
      <Suspense fallback={null}>
        <SectionNavigationHandler sections={sections} />
      </Suspense>
      <FullpageScroll sections={sections}>
        <AboutHero />
        <StoryOrigin />
        <KeyTeam />
        <MissionVision />
        <KeyClients />
      </FullpageScroll>
    </div>
  )
}
