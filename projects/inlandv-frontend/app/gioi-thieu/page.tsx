import type { Metadata } from 'next'
import { Suspense } from 'react'
import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import SectionNavigationHandler from '@/components/SectionNavigationHandler'
import AboutHero from '@/components/about/AboutHero'
import StoryOrigin from '@/components/about/StoryOrigin'
import MissionVision from '@/components/about/MissionVision'
import KeyTeam from '@/components/about/KeyTeam'
import KeyClients from '@/components/about/KeyClients'
import { api } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Giới thiệu - Inland Real Estate',
  description: 'Tìm hiểu về Inland Real Estate - Sàn giao dịch bất động sản uy tín với hơn 15 năm kinh nghiệm',
}

// Default sections (fallback if CMS data not available)
const defaultSections: SectionData[] = [
  { id: 'hero', index: 0, title: 'Mở đầu', backgroundType: 'dark' },
  { id: 'cau-chuyen', index: 1, title: 'Câu chuyện Inlandv', backgroundType: 'dark' },
  { id: 'doi-ngu', index: 2, title: 'Đội ngũ lãnh đạo', backgroundType: 'dark' },
  { id: 'tai-sao', index: 3, title: 'Tại sao nên chọn Inlandv', backgroundType: 'dark' },
  { id: 'khach-hang', index: 4, title: 'Khách hàng & Đối tác tiêu biểu', backgroundType: 'dark' },
]

export default async function AboutPage() {
  // Fetch page data from CMS
  let pageData = null
  let sections = defaultSections

  try {
    console.log('🔍 Fetching page data from API...')
    const response = await api.getPageBySlug('gioi-thieu')
    console.log('📥 API Response:', {
      success: response.success,
      hasData: !!response.data,
      sectionsCount: response.data?.sections?.length || 0
    })
    
    if (response.success && response.data) {
      pageData = response.data
      console.log('✅ Fetched page data from CMS:', {
        pageId: pageData.id,
        pageTitle: pageData.title,
        sectionsCount: pageData.sections?.length || 0,
        sectionKeys: pageData.sections?.map((s: any) => s.section_key) || []
      })
      // Map CMS sections to SectionData format
      if (pageData.sections && pageData.sections.length > 0) {
        sections = pageData.sections.map((section, index) => ({
          id: section.section_key,
          index,
          title: section.name,
          backgroundType: 'dark' as const,
        }))
      }
    } else {
      console.log('⚠️ API response not successful:', response)
    }
  } catch (error: any) {
    // Log all errors in development for debugging
    console.error('❌ Error fetching page data:', {
      message: error?.message,
      status: error?.status,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    })
    
    // Fallback to default sections - this is the expected behavior
  }

  // Map section_key to component for passing section data
  const sectionMap: Record<string, any> = {}
  if (pageData?.sections) {
    pageData.sections.forEach((section: any) => {
      sectionMap[section.section_key] = section
    })
    console.log('📋 Section map created:', Object.keys(sectionMap))
  } else {
    console.log('⚠️ No pageData or sections, using defaults')
  }

  return (
    <div className="relative">
      <Suspense fallback={null}>
        <SectionNavigationHandler sections={sections} />
      </Suspense>
      <FullpageScroll sections={sections}>
        <AboutHero section={sectionMap['hero']} />
        <StoryOrigin section={sectionMap['cau-chuyen']} />
        <KeyTeam section={sectionMap['doi-ngu']} />
        <MissionVision section={sectionMap['tai-sao']} />
        <KeyClients section={sectionMap['khach-hang']} />
      </FullpageScroll>
    </div>
  )
}
