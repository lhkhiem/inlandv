"use client"

import { motion } from 'framer-motion'
import { JobPosting } from '@/lib/careersData'
import { CheckCircle2 } from 'lucide-react'

export default function JobDetailContent({ job }: { job: JobPosting }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-10"
      >
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả công việc</h2>
          <p className="text-gray-700 leading-relaxed">{job.description.overview}</p>
        </section>

        {/* Responsibilities */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trách nhiệm công việc</h2>
          <ul className="space-y-3">
            {job.description.responsibilities.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-goldDark flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Yêu cầu công việc</h2>
          <ul className="space-y-3">
            {job.description.requirements.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-goldDark flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quyền lợi</h2>
          <ul className="space-y-3">
            {job.description.benefits.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-goldDark flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </motion.div>
    </div>
  )
}
