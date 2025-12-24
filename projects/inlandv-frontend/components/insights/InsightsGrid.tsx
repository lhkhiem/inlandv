"use client"

import { motion } from 'framer-motion'
import InsightsCard from './InsightsCard'
import { InsightArticle } from '@/lib/insightsData'

export default function InsightsGrid({ articles }: { articles: InsightArticle[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, i) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <InsightsCard article={article} />
        </motion.div>
      ))}
    </div>
  )
}
