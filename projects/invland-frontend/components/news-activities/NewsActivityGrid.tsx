"use client"

import { motion } from 'framer-motion'
import NewsActivityCard from './NewsActivityCard'
import { NewsActivityArticle } from '@/lib/newsActivitiesData'

export default function NewsActivityGrid({ articles }: { articles: NewsActivityArticle[] }) {
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
          <NewsActivityCard article={article} />
        </motion.div>
      ))}
    </div>
  )
}
