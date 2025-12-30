'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface LanguageSwitcherProps {
  scrolled?: boolean
  backgroundType?: 'light' | 'image' | 'dark'
}

interface LangOption {
  code: string
  label: string
}

const options: LangOption[] = [
  { code: 'VI', label: 'VI' },
  { code: 'EN', label: 'EN' },
  { code: 'ZH', label: '中文' }, // Chinese ideographic label
]

export default function LanguageSwitcher({ scrolled, backgroundType = 'image' }: LanguageSwitcherProps) {
  const [current, setCurrent] = useState<LangOption>(options[0])
  const [open, setOpen] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isLight = backgroundType === 'light'
  // Force green color on portrait mode for button only
  const forceGreen = isPortrait
  const baseColor = forceGreen || scrolled ? '#2E8C4F' : (isLight ? '#358b4e' : '#ffffff')
  // Button color (current language display)
  const buttonColor = forceGreen || scrolled ? 'text-[#2E8C4F] hover:text-[#2E8C4F]' : (isLight ? 'text-[#358b4e] hover:text-[#2E8C4F]' : 'text-white hover:text-[#2E8C4F]')
  // Dropdown colors: active (selected) = green, inactive = white
  const dropdownActiveColor = 'text-[#2E8C4F]' // Always green for selected language
  const dropdownInactiveColor = 'text-white hover:text-[#2E8C4F]' // White for other languages, green on hover

  return (
    <div ref={ref} className="relative select-none">
      <motion.button
        whileTap={{ scale: 0.92 }}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold transition-colors ${buttonColor}`}
        style={{ background: 'transparent' }}
      >
        <span>{current.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} style={{ color: baseColor }} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className={`absolute mt-1 right-0 w-24 rounded-md shadow-lg ring-1 ring-black/10 backdrop-blur-sm ${
              scrolled ? 'bg-white/90' : 'bg-white/90'
            } py-1`} 
            role="listbox"
          >
            {options.map(opt => {
              const active = opt.code === current.code
              return (
                <li key={opt.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => { setCurrent(opt); setOpen(false) }}
                    className={`w-full text-left px-3 py-1 text-xs font-medium transition-colors ${active ? dropdownActiveColor : dropdownInactiveColor}`}
                    style={{ background: 'transparent' }}
                  >
                    {opt.label}
                  </button>
                </li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
