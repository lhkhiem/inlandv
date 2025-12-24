"use client"

import { motion } from 'framer-motion'
import { JobPosting } from '@/lib/careersData'
import { useRouter } from 'next/navigation'

export default function JobTable({ jobs }: { jobs: JobPosting[] }) {
  const router = useRouter()

  const handleRowClick = (slug: string) => {
    router.push(`/tin-tuc/tuyen-dung/${slug}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-goldDark text-white">
            <th className="py-3 px-4 text-center font-bold text-sm uppercase w-20">STT</th>
            <th className="py-3 px-4 text-left font-bold text-sm uppercase">Vị trí tuyển dụng</th>
            <th className="py-3 px-4 text-center font-bold text-sm uppercase w-32">Số lượng</th>
            <th className="py-3 px-4 text-center font-bold text-sm uppercase w-48">Ngày hết hạn</th>
          </tr>
        </thead>
        <tbody className="bg-[#1f1b1b]">
          {jobs.map((job, index) => (
            <motion.tr
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleRowClick(job.slug)}
              className="border-b border-gray-700 hover:bg-[#2a2525] transition-colors cursor-pointer"
            >
              <td className="py-4 px-4 text-gray-300 text-center">{index + 1}</td>
              <td className="py-4 px-4">
                <span className="text-white hover:text-goldDark transition-colors">
                  {job.title}
                </span>
              </td>
              <td className="py-4 px-4 text-gray-300 text-center">{job.quantity}</td>
              <td className="py-4 px-4 text-gray-300 text-center">
                {new Date(job.deadline).toLocaleDateString('vi-VN')}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      
      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          Hiện tại chưa có vị trí tuyển dụng nào.
        </div>
      )}
    </div>
  )
}
