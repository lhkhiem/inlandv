"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export default function MultiSelectDropdown({
  label,
  options,
  values,
  onChange,
  placeholder,
  disabled = false,
  display = 'summary',
  showLabel = true,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string
  options: Array<{ label: string; value: string }>
  values: string[]
  onChange: (vals: string[]) => void
  placeholder?: string
  disabled?: boolean
  display?: 'tags' | 'summary'
  showLabel?: boolean
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}){
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

  useEffect(()=>{
    if (!open) return
    
    const onClick = (e: MouseEvent) => { 
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
      document.addEventListener('mousedown', onClick)
    }, 0)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, isOpen, onClose])

  const selected = useMemo(()=> options.filter(o=> values.includes(o.value)), [options, values])

  const toggle = (val: string) => {
    const set = new Set(values)
    if (set.has(val)) set.delete(val); else set.add(val)
    onChange(Array.from(set))
  }

  const remove = (val: string) => onChange(values.filter(v=> v!==val))

  const hint = placeholder ?? label

  return (
    <div className={`relative ${disabled? 'opacity-60 pointer-events-none':''}`} ref={ref}>
      {showLabel && (<div className="text-sm text-gray-500 mb-1">{label}</div>)}
      <button type="button" onClick={toggleOpen} className="w-full h-12 px-3 border border-gray-200 rounded-xl bg-white flex items-center justify-between">
        {display === 'tags' ? (
          <div className="flex gap-2 flex-wrap">
            {selected.length === 0 && (
              <span className="text-gray-400">{hint}</span>
            )}
            {selected.map(s => (
              <span key={s.value} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-goldLight/15 text-goldDark text-sm">
                {s.label}
                <button type="button" className="p-0.5" onClick={(e)=>{ e.stopPropagation(); remove(s.value) }}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="flex-1 min-w-0 text-left">
            <span className={`block truncate ${selected.length ? 'text-gray-800' : 'text-gray-400'}`}>
              {selected.length === 0 ? (
                hint
              ) : selected.length === 1 ? (
                selected[0].label
              ) : (
                `${selected[0].label} +${selected.length - 1}`
              )}
            </span>
          </div>
        )}
        <ChevronDown className="w-5 h-5 text-gray-500 ml-2 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full max-h-72 overflow-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {options.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Không có dữ liệu</div>
          )}
          {options.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
              <input type="checkbox" checked={values.includes(opt.value)} onChange={()=>toggle(opt.value)} />
              <span className="text-gray-700">{opt.label}</span>
            </label>
          ))}
          {options.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-2 flex justify-between">
              <button className="text-sm text-gray-600 hover:text-gray-900" onClick={()=>onChange([])}>Bỏ chọn</button>
              <button className="text-sm text-goldDark font-semibold" onClick={closeDropdown}>Xong</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
