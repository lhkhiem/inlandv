import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import CaseStudyHero from '@/components/case-studies/CaseStudyHero'
import CaseStudySection from '@/components/case-studies/CaseStudySection'
import ContactSection from '@/components/sections/ContactSection'
import { caseStudies } from '@/lib/caseStudiesData'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dự Án Đã Thực Hiện - INLANDV Real Estate',
  description: 'Khám phá các dự án tiêu biểu mà INLANDV đã đồng hành và triển khai thành công. Từ khu công nghiệp đến bất động sản nhà ở và logistics.',
  keywords: 'dự án bất động sản, case studies, INLANDV projects, khu công nghiệp, logistics, căn hộ',
  openGraph: {
    title: 'Dự Án Đã Thực Hiện - INLANDV Real Estate',
    description: 'Những dự án tiêu biểu mà INLANDV đã đồng hành và triển khai thành công',
    images: [
      {
        url: '/images/case-studies-og.jpg',
        width: 1200,
        height: 630,
        alt: 'INLANDV Case Studies',
      },
    ],
  },
}

export default function CaseStudiesPage() {
  // Build sections array for FullpageScroll - MUST match children count exactly
  const sections: SectionData[] = [
    {
      id: 'hero',
      index: 0,
      title: 'Giới thiệu',
      backgroundType: 'dark',
    },
    ...caseStudies.map((caseStudy, index) => ({
      id: caseStudy.slug,
      index: index + 1,
      title: `Dự án ${index + 1}`, // Keep short for timeline
      backgroundType: 'light' as const,
    })),
    {
      id: 'contact',
      index: caseStudies.length + 1,
      title: 'Liên hệ',
      backgroundType: 'dark',
    }
  ]

  // Build children array explicitly
  const children = [
    <CaseStudyHero key="hero" />,
    ...caseStudies.map((caseStudy, index) => (
      <CaseStudySection 
        key={caseStudy.slug}
        caseStudy={caseStudy} 
        layout={index % 2 === 0 ? 'left' : 'right'}
      />
    )),
    <ContactSection key="contact" />
  ]

  console.log('=== CASE STUDIES PAGE DEBUG ===')
  console.log('caseStudies.length:', caseStudies.length)
  console.log('sections.length:', sections.length)
  console.log('children.length:', children.length)

  return (
    <main>
      <FullpageScroll sections={sections}>
        {children}
      </FullpageScroll>
    </main>
  )
}
