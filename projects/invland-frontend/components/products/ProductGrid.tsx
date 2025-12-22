"use client"

import { products as source, Product } from '@/lib/productsData'
import ProductCard from './ProductCard'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export default function ProductGrid({ filters, pageSize = 12 }: { filters: { q?: string; type?: string; provinces?: string[]; wards?: string[]; price?: [number, number]; area?: [number, number] }; pageSize?: number }){
  const items = filterProducts(source, filters)
  const [visible, setVisible] = useState(pageSize)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(()=>{ setVisible(pageSize) }, [filters, pageSize])

  useEffect(()=>{
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      const entry = entries[0]
      if (entry.isIntersecting && !loading && visible < items.length){
        setLoading(true)
        // Simulate async fetching latency
        setTimeout(()=>{
          setVisible(v => Math.min(v + pageSize, items.length))
          setLoading(false)
        }, 500)
      }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.disconnect()
  }, [items.length, loading, pageSize, visible])

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {items.slice(0, visible).map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 12) * 0.05 }}>
            <ProductCard item={p} />
          </motion.div>
        ))}
      </motion.div>
      <div ref={sentinelRef} className="h-14" />
      {loading && (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-goldDark border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </>
  )
}

function filterProducts(list: Product[], filters: { q?: string; type?: string; provinces?: string[]; wards?: string[]; price?: [number, number]; area?: [number, number] }){
  return list.filter(p => {
    if (filters.q && !p.name.toLowerCase().includes(filters.q.toLowerCase())) return false
    if (filters.type && !(p.type === filters.type || p.category === filters.type)) return false
    if (filters.provinces && filters.provinces.length > 0 && !filters.provinces.includes(p.location.province)) return false
    if (filters.wards && filters.wards.length > 0 && !(p.location.district && filters.wards.includes(p.location.district))) return false
    if (filters.price) {
      const [min, max] = filters.price
      if (p.price < min || p.price > max) return false
    }
    if (filters.area) {
      const [amin, amax] = filters.area
      if (p.area < amin || p.area > amax) return false
    }
    return true
  })
}
