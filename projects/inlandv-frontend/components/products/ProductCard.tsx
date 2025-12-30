import Link from 'next/link'
import { Product } from '@/lib/productsData'

export default function ProductCard({ item }: { item: Product }){
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
      <div className="relative h-56">
        <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-xs font-semibold bg-goldDark text-white">
          {labelFromType(item.type)}
        </div>
        <div className="absolute inset-0 bg-center bg-cover transform group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: `url(${item.thumbnail})` }} />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-[#2E8C4F] group-hover:text-goldDark transition-colors line-clamp-1">
            {item.name}
          </h3>
          <div className="text-xs text-[#2E8C4F]">{item.code}</div>
        </div>
        <div className="text-sm text-[#2E8C4F] mb-2">
          {item.location.province}{item.location.district ? `, ${item.location.district}`:''}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[#2E8C4F]">Giá</div>
            <div className="text-goldDark font-bold">{formatPrice(item.price)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#2E8C4F]">Diện tích</div>
            <div className="text-[#2E8C4F] font-semibold">{item.area} m²</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-[#2E8C4F] line-clamp-2">{item.description.short}</p>

        <Link 
          href={
            // KCN properties (main_category='kcn') vẫn là Property, không phải IndustrialPark
            // Nên link đến route property detail, không phải /kcn
            item.main_category === 'bds'
              ? `/bat-dong-san/${item.slug}`
              : `/san-pham/${item.slug}`
          } 
          className="mt-4 inline-flex items-center text-goldDark font-semibold"
        >
          Xem chi tiết →
        </Link>
      </div>
    </div>
  )
}

const labelFromType = (t: Product['type']) => {
  switch(t){
    case 'nha-xuong': return 'Nhà xưởng'
    case 'nha-pho': return 'Nhà phố'
    case 'can-ho': return 'Căn hộ'
    case 'van-phong': return 'Văn phòng'
    case 'mua-ban': return 'Mua bán'
    case 'cho-thue': return 'Cho thuê'
  }
}

const formatPrice = (n:number) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND', maximumFractionDigits:0 }).format(n)
