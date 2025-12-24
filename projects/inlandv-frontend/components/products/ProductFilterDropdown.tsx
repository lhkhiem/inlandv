"use client"

import { ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

type Option = { label: string; value: string; children?: Option[] }

export default function ProductFilterDropdown({
  label,
  options,
  value,
  onChange,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string
  options: Option[]
  value?: string
  onChange: (val: string) => void
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = isOpen !== undefined ? isOpen : internalOpen
  const ref = useRef<HTMLDivElement>(null)

  const toggleOpen = () => {
    if (isOpen !== undefined) {
      if (open) onClose?.()
      else onOpen?.()
    } else {
      setInternalOpen(s => !s)
    }
  }

  const closeDropdown = () => {
    if (isOpen !== undefined) {
      onClose?.()
    } else {
      setInternalOpen(false)
    }
  }

  useEffect(() => {
    if (!open) return
    
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        if (isOpen !== undefined) {
          onClose?.()
        } else {
          setInternalOpen(false)
        }
      }
    }
    
    // Use setTimeout to avoid race condition with button click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, isOpen, onClose])

  const selected = options.find(o => o.value === value)
  const isPlaceholder = !selected
  const display = selected?.label ?? label

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggleOpen}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white flex items-center justify-between text-gray-700 hover:border-goldDark/50"
      >
        <span className={`truncate ${isPlaceholder ? 'text-gray-400' : 'text-gray-800'}`}>{display}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full max-h-72 overflow-auto bg-white rounded-xl shadow-xl border border-gray-100">
          {options.map((opt) => {
            const isSelected = (value === '' && opt.value === '') || (value !== '' && value === opt.value)
            return (
            <div key={opt.value || 'empty'} className="">
              <button
                type="button"
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${isSelected ? 'text-goldDark font-semibold': 'text-gray-700'}`}
                onClick={(e) => { 
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(opt.value)
                  closeDropdown()
                }}
              >
                {opt.label}
              </button>
              {opt.children && (
                <div className="pl-4">
                  {opt.children.map(child => (
                    <button
                      key={child.value || 'empty'}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      onClick={(e) => { 
                        e.preventDefault()
                        e.stopPropagation()
                        onChange(child.value)
                        closeDropdown()
                      }}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
