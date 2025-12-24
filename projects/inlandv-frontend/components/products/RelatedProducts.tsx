"use client"

import { products, Product } from '@/lib/productsData'
import ProductCard from './ProductCard'

export default function RelatedProducts({ currentId, category }: { currentId: string; category?: string }){
  const related = products
    .filter(p => p.id !== currentId && (!category || p.category === category))
    .slice(0, 4)
  if (related.length === 0) return null
  return (
    <section className="mt-12">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Sản phẩm liên quan</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((p: Product) => <ProductCard key={p.id} item={p} />)}
      </div>
    </section>
  )
}
