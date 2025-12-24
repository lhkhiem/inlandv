import { Product } from '@/lib/productsData'

export default function ProductDescription({ item }: { item: Product }){
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Mô tả ngắn</h3>
          <p className="text-gray-700 leading-relaxed">{item.description.short}</p>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Mô tả chi tiết</h3>
          <p className="text-gray-700 leading-relaxed">{item.description.long}</p>
        </div>
      </div>
    </div>
  )
}
