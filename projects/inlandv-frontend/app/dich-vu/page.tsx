import type { Metadata } from 'next'
import { Suspense } from 'react'
import FullpageScroll, { SectionData } from '@/components/FullpageScroll'
import SectionNavigationHandler from '@/components/SectionNavigationHandler'
import ServicesHero from '@/components/services/ServicesHero'
import BrokerageSection from '@/components/services/BrokerageSection'
import LegalInvestmentSection from '@/components/services/LegalInvestmentSection'
import FDISupportSection from '@/components/services/FDISupportSection'
import DesignConstructionSection from '@/components/services/DesignConstructionSection'
import { api } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Dịch vụ - Inland Real Estate',
  description: 'Giải pháp bất động sản công nghiệp toàn diện cho doanh nghiệp FDI – Môi giới, Tư vấn pháp lý, Hỗ trợ FDI, Thiết kế & Thi công, Case Study, Testimonials.'
}

// Default sections (fallback if CMS data not available)
const defaultSections: SectionData[] = [
  { id: 'hero', index: 0, title: 'Mở đầu', backgroundType: 'image' },
  { id: 'moi-gioi', index: 1, title: 'Môi giới BĐS Công nghiệp', backgroundType: 'light' },
  { id: 'phap-ly', index: 2, title: 'Tư vấn Pháp lý & Đầu tư', backgroundType: 'light' },
  { id: 'fdi', index: 3, title: 'Hỗ trợ FDI', backgroundType: 'light' },
  { id: 'thiet-ke-thi-cong', index: 4, title: 'Thiết kế & Thi công', backgroundType: 'image' }
]

export default async function ServicesPage() {
  // Fetch page data from CMS
  let pageData = null
  let sections = defaultSections

  try {
    console.log('🔍 Fetching dich-vu page data from API...')
    const response = await api.getPageBySlug('dich-vu')
    console.log('📥 API Response:', {
      success: response.success,
      hasData: !!response.data,
      sectionsCount: response.data?.sections?.length || 0
    })
    
    if (response.success && response.data) {
      pageData = response.data
      console.log('✅ Fetched dich-vu page data from CMS:', {
        pageId: pageData.id,
        pageTitle: pageData.title,
        sectionsCount: pageData.sections?.length || 0,
        sectionKeys: pageData.sections?.map((s: any) => s.section_key) || []
      })
      // Map CMS sections to SectionData format
      // Use title mapping to ensure correct Vietnamese text (not from CMS name field)
      const titleMap: Record<string, string> = {
        'hero': 'Mở đầu',
        'moi-gioi': 'Môi giới BĐS Công nghiệp',
        'phap-ly': 'Tư vấn Pháp lý & Đầu tư',
        'fdi': 'Hỗ trợ FDI',
        'thiet-ke-thi-cong': 'Thiết kế & Thi công'
      }
      
      if (pageData.sections && pageData.sections.length > 0) {
        sections = pageData.sections.map((section: any, index: number) => ({
          id: section.section_key,
          index,
          title: titleMap[section.section_key] || section.name || defaultSections[index]?.title || 'Section',
          backgroundType: (section.section_key === 'hero' || section.section_key === 'thiet-ke-thi-cong') ? 'image' as const : 'light' as const,
        }))
      }
    } else {
      console.log('⚠️ API response not successful:', response)
    }
  } catch (error: any) {
    // Log all errors in development for debugging
    console.error('❌ Error fetching dich-vu page data:', {
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
        <ServicesHero section={sectionMap['hero']} />
        <BrokerageSection section={sectionMap['moi-gioi']} />
        <LegalInvestmentSection section={sectionMap['phap-ly']} />
        <FDISupportSection section={sectionMap['fdi']} />
        <DesignConstructionSection section={sectionMap['thiet-ke-thi-cong']} />
      </FullpageScroll>
    </div>
  )
}
