"use client"

import { motion } from 'framer-motion'
import { JobPosting } from '@/lib/careersData'

export default function JobDetailHero({ job }: { job: JobPosting }) {
  return (
    <div className="relative bg-gradient-to-br from-goldDark to-goldLight py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {job.title}
          </h1>
          
          <div className="flex flex-wrap gap-6 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Số lượng:</span>
              <span>{job.quantity} người</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Hạn nộp:</span>
              <span>{new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
