'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Quote } from 'lucide-react'
import CaseStudySlider from './CaseStudySlider'
import type { CaseStudy } from '@/lib/caseStudiesData'
import { useLayoutMeasurements } from '@/components/LayoutMeasurementsContext'

interface CaseStudySectionProps {
  caseStudy: CaseStudy
  layout: 'left' | 'right' // 'left' = image on left, 'right' = image on right
}

export default function CaseStudySection({ caseStudy, layout }: CaseStudySectionProps) {
  const isImageLeft = layout === 'left'
  const { headerHeight } = useLayoutMeasurements()

  return (
    <div 
      className="h-full w-full flex items-center justify-center px-6 md:px-12 lg:px-16 overflow-y-auto scrollbar-hide"
      style={{ paddingTop: `${headerHeight + 20}px`, paddingBottom: '40px' }}
    >
      <div className="max-w-6xl w-full">
        <div className={`grid md:grid-cols-2 gap-6 lg:gap-10 items-center ${isImageLeft ? '' : 'md:grid-flow-dense'}`}>
          
          {/* Image Slider */}
          <motion.div
            initial={{ opacity: 0, x: isImageLeft ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className={`${isImageLeft ? 'md:col-start-1' : 'md:col-start-2'}`}
          >
            <CaseStudySlider 
              images={caseStudy.images}
              projectName={caseStudy.projectName}
              video={caseStudy.video}
            />
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: isImageLeft ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`space-y-4 ${isImageLeft ? 'md:col-start-2' : 'md:col-start-1'}`}
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-xs text-[#358b4e] font-semibold mb-1.5">
                <span className="w-6 h-0.5 bg-[#358b4e]"></span>
                <span className="uppercase tracking-wider">{caseStudy.industry}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5">
                {caseStudy.projectName}
              </h2>
              <div className="flex items-center gap-3 text-gray-600 text-xs">
                <span>{caseStudy.client}</span>
                <span>•</span>
                <span>{caseStudy.location}</span>
                <span>•</span>
                <span>{caseStudy.year}</span>
              </div>
            </div>

            {/* Challenge */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">Thách thức</h3>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {caseStudy.challenge}
              </p>
            </div>

            {/* Solution */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1.5">Giải pháp của INLANDV</h3>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {caseStudy.solution}
              </p>
            </div>

            {/* Results */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Kết quả</h3>
              <div className="grid grid-cols-3 gap-3">
                {caseStudy.results.map((result, index) => (
                  <div key={index} className="bg-gradient-to-br from-[#358b4e]/10 to-[#2b6f3e]/5 p-3 rounded-lg border border-[#358b4e]/20">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#358b4e]" />
                      <span className="text-[10px] text-gray-600 font-medium">{result.metric}</span>
                    </div>
                    <div className="text-xl font-bold text-[#358b4e] mb-0.5">
                      {result.value}
                    </div>
                    <p className="text-[10px] text-gray-600 leading-tight line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#358b4e] relative">
              <Quote className="absolute top-3 right-3 w-6 h-6 text-[#358b4e]/20" />
              <p className="text-xs text-gray-700 italic mb-3 leading-relaxed line-clamp-2">
                &ldquo;{caseStudy.testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#358b4e] to-[#2b6f3e] flex items-center justify-center text-white font-bold text-base">
                  {caseStudy.testimonial.author.split(' ').pop()?.[0]}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{caseStudy.testimonial.author}</div>
                  <div className="text-xs text-gray-600">
                    {caseStudy.testimonial.role}, {caseStudy.testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
