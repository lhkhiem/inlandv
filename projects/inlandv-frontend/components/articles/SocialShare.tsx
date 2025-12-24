'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Share2, Check } from 'lucide-react'

interface SocialShareProps {
  url: string
  title: string
}

export default function SocialShare({ url, title }: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareLinks = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: 'bg-[#1877F2] hover:bg-[#0C63D4]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: 'bg-[#0A66C2] hover:bg-[#004182]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: 'bg-[#000000] hover:bg-[#333333]',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-6 py-12 bg-black"
    >
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-center gap-8 p-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
        {/* Title */}
        <div className="flex items-center gap-3">
          <Share2 className="w-6 h-6 text-brand-green" />
          <span className="text-lg font-semibold text-gray-900">Chia sẻ bài viết</span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          {shareLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className={`w-12 h-12 rounded-full ${social.color} text-white flex items-center justify-center shadow-lg transition-all duration-300`}
              aria-label={`Share on ${social.name}`}
            >
              {social.icon}
            </motion.a>
          ))}

          {/* Copy Link Button */}
          <motion.button
            onClick={handleCopyLink}
            whileHover={{ scale: 1.1, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={`w-12 h-12 rounded-full ${
              copied 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gray-700 hover:bg-gray-800'
            } text-white flex items-center justify-center shadow-lg transition-all duration-300`}
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5 text-brand-green" />
            <span className="text-base font-semibold text-gray-900">Chia sẻ bài viết</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          {shareLinks.map((social) => (
            <motion.a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.95 }}
              className={`w-12 h-12 rounded-full ${social.color} text-white flex items-center justify-center shadow-lg`}
              aria-label={`Share on ${social.name}`}
            >
              {social.icon}
            </motion.a>
          ))}
          <motion.button
            onClick={handleCopyLink}
            whileTap={{ scale: 0.95 }}
            className={`w-12 h-12 rounded-full ${
              copied ? 'bg-green-500' : 'bg-gray-700'
            } text-white flex items-center justify-center shadow-lg`}
            aria-label="Copy link"
          >
            {copied ? (
              <Check className="w-6 h-6" />
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
