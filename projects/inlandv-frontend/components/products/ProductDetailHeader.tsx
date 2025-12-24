import { Product } from '@/lib/productsData'

export default function ProductDetailHeader({ item }: { item: Product }){
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="text-sm text-gray-500 mb-2">Trang chủ / Sản phẩm / {item.category}</div>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{item.name}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>Mã: <strong className="text-gray-900">{item.code}</strong></span>
            <span className="inline-block px-2 py-0.5 rounded-full bg-goldLight/20 text-goldDark font-semibold">{item.category}</span>
            <span className="text-goldDark font-bold">{formatPrice(item.price)}</span>
          </div>
          <div className="mt-1 text-gray-600 text-sm">
            {item.location.province}{item.location.district?`, ${item.location.district}`:''} • {item.area} m²
          </div>
        </div>
      </div>
    </div>
  )
}

const formatPrice = (n:number) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND', maximumFractionDigits:0 }).format(n)
