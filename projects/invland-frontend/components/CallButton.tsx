'use client'

import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import { useState, useEffect } from 'react'

interface CallButtonProps {
  isVisible: boolean
}

export default function CallButton({ isVisible }: CallButtonProps) {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!isVisible || !isPortrait) return null

  return (
    <motion.a
      href="tel:0896686645"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed right-8 z-[90] group"
      style={{ bottom: 'calc(1.5rem + 60px)' }}
      aria-label="Gọi điện thoại"
      tabIndex={0}
    >
      <div className="relative flex flex-col items-center">
        {/* Phone icon container - same style as scroll button */}
        <motion.div
          animate={{
            x: [0, -2, 2, -2, 2, 0],
            y: [0, -1, 1, -1, 1, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-7 h-10 border-2 border-white/70 rounded-full flex items-center justify-center bg-[#2E8C4F] transition-colors duration-300 group-hover:border-white"
        >
          <Phone className="w-4 h-4 text-white/90 group-hover:text-white transition-colors duration-300" strokeWidth={2} />
        </motion.div>
      </div>
    </motion.a>
  )
}

