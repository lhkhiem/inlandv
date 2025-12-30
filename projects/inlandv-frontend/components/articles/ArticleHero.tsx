'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Calendar, User } from 'lucide-react'

interface ArticleHeroProps {
  title: string
  author?: string
  publishDate?: string
  heroImage: string
  category?: string
}

export default function ArticleHero({ 
  title, 
  author, 
  publishDate, 
  heroImage,
  category 
}: ArticleHeroProps) {
  return (
    <section className="relative w-full bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Category Badge */}
        {category && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 bg-brand-green/10 text-brand-green text-sm font-medium rounded-full text-white">
              {category}
            </span>
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Meta Info */}
        {(author || publishDate) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center gap-6 mb-12 text-gray-300"
          >
            {author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="text-base">{author}</span>
              </div>
            )}
            {publishDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-base">{publishDate}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl"
        >
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1280px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}
