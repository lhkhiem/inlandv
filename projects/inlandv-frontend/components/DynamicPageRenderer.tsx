'use client'

import type { Page, PageSection } from '@/lib/types'
import AboutHero from '@/components/about/AboutHero'
import StoryOrigin from '@/components/about/StoryOrigin'
import KeyTeam from '@/components/about/KeyTeam'
import MissionVision from '@/components/about/MissionVision'
import KeyClients from '@/components/about/KeyClients'

// Map section_key to component
const sectionComponentMap: Record<string, React.ComponentType<any>> = {
  'hero': AboutHero,
  'cau-chuyen': StoryOrigin,
  'doi-ngu': KeyTeam,
  'tai-sao': MissionVision,
  'khach-hang': KeyClients,
}

interface DynamicPageRendererProps {
  page: Page
}

export default function DynamicPageRenderer({ page }: DynamicPageRendererProps) {
  if (!page.sections || page.sections.length === 0) {
    return null
  }

  return (
    <>
      {page.sections.map((section) => {
        const Component = sectionComponentMap[section.section_key]
        if (!Component) {
          // Render generic section if no component mapped
          return (
            <section key={section.id} className="min-h-screen flex items-center justify-center bg-[#151313]">
              <div className="container mx-auto px-6">
                <h2 className="text-3xl font-bold mb-4 text-white">{section.name}</h2>
                {section.content && (
                  <div 
                    className="prose prose-invert max-w-none text-white"
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
                {section.images && section.images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {section.images.map((img, idx) => (
                      <img key={idx} src={img} alt={`${section.name} ${idx + 1}`} className="rounded-lg" />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )
        }
        return <Component key={section.id} section={section} />
      })}
    </>
  )
}

