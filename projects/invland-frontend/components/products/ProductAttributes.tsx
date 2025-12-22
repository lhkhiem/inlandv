import { Product } from '@/lib/productsData'

export default function ProductAttributes({ item }: { item: Product }){
  const rows = [
    { k:'Loại hình', v: label(item.category) },
    { k:'Tổng diện tích', v: `${item.area} m²` },
    { k:'Giá sản phẩm', v: formatPrice(item.price) },
    { k:'Vị trí', v: `${item.location.province}${item.location.district?`, ${item.location.district}`:''}` },
    { k:'Mã sản phẩm', v: item.code },
  ]
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin sản phẩm</h3>
      <div className="divide-y divide-gray-100">
        {rows.map(r => (
          <div key={r.k} className="py-3 flex items-center justify-between text-sm">
            <div className="text-gray-500">{r.k}</div>
            <div className="text-gray-900 font-medium">{r.v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const label = (key:string)=>{
  switch(key){
    case 'nha-xuong': return 'Nhà xưởng'
    case 'nha-pho': return 'Nhà phố'
    case 'can-ho': return 'Căn hộ'
    case 'van-phong': return 'Văn phòng'
    case 'mua-ban': return 'Mua bán'
    case 'cho-thue': return 'Cho thuê'
    default: return key
  }
}

const formatPrice = (n:number) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND', maximumFractionDigits:0 }).format(n)
