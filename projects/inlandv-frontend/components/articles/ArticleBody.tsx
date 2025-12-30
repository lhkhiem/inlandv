'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface ArticleBodyProps {
  content: string
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  // Parse content and render with proper styling
  // This is a simple implementation - you can enhance with a proper markdown/rich text parser
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="max-w-4xl mx-auto px-6 py-16"
    >
      <div 
        className="article-content prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      <style jsx global>{`
        .article-content {
          color: #2E8C4F;
          line-height: 1.8;
          /* Font handled by global CSS: NotoSerif for content, GMV DIN Pro for headings */
        }

        .article-content h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #2E8C4F;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
          /* Font handled by global CSS: GMV DIN Pro for headings */
        }

        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2E8C4F;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          /* Font handled by global CSS: GMV DIN Pro for headings */
        }

        .article-content p {
          font-size: 1.125rem;
          margin-bottom: 1.5rem;
          max-width: 760px;
          color: #2E8C4F;
          /* Font handled by global CSS: NotoSerif for content */
        }

        .article-content blockquote {
          border-left: 4px solid #358b4e;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #2E8C4F;
          background: #f5f5f5;
          padding: 1.5rem;
          border-radius: 0.5rem;
          /* Font handled by global CSS: NotoSerif for content */
        }

        .article-content ul,
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }

        .article-content li {
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          color: #2E8C4F;
          /* Font handled by global CSS: NotoSerif for content */
        }

        .article-content img {
          border-radius: 1rem;
          margin: 2rem auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          max-width: 100%;
          height: auto;
        }

        .article-content a {
          color: #358b4e;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .article-content a:hover {
          color: #2d7440;
        }

        .article-content strong {
          font-weight: 600;
          color: #2E8C4F;
          /* Font handled by global CSS: NotoSerif for content */
        }

        .article-content code {
          background: #f5f5f5;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
          color: #e74c3c;
        }

        @media (max-width: 768px) {
          .article-content h2 {
            font-size: 1.75rem;
            margin-top: 2rem;
          }

          .article-content h3 {
            font-size: 1.25rem;
            margin-top: 1.5rem;
          }

          .article-content p,
          .article-content li {
            font-size: 1rem;
          }
        }
      `}</style>
    </motion.article>
  )
}
