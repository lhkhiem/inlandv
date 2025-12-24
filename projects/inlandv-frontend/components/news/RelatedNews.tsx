"use client"

import { motion } from 'framer-motion'
import NewsCard from './NewsCard'
import { NewsArticle } from '@/lib/newsData'

export default function RelatedNews({ articles, currentId }: { articles: NewsArticle[]; currentId: string }) {
  const related = articles.filter(a => a.id !== currentId).slice(0, 3)
  
  if (related.length === 0) return null

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Tin liên quan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {related.map((article, i) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <NewsCard article={article} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
