export type Product = {
  id: string
  slug: string
  name: string
  code: string
  type: 'nha-xuong' | 'nha-pho' | 'can-ho' | 'van-phong' | 'mua-ban' | 'cho-thue'
  category: string
  location: {
    province: string
    district?: string
  }
  price: number
  area: number
  thumbnail: string
  gallery: string[]
  description: {
    short: string
    long: string
  }
}

export const products: Product[] = [
  {
    id: 'p1',
    slug: 'nha-pho-lux-ngu-hanh-son',
    name: 'Nhà phố LUX Ngũ Hành Sơn',
    code: 'INL-NP-001',
    type: 'nha-pho',
    category: 'nha-pho',
    location: { province: 'TP.HCM', district: 'Quận 7' },
    price: 4800000000,
    area: 120,
    thumbnail: 'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200'
    ],
    description: {
      short: 'Nhà phố 1 trệt 2 lầu, thiết kế hiện đại, nội thất cao cấp, khu dân cư an ninh.',
      long: 'Sở hữu vị trí đắc địa tại trung tâm Quận 7, kết nối nhanh đến Phú Mỹ Hưng. Thiết kế tinh tế, tối ưu công năng, nội thất nhập khẩu, sân trước rộng rãi, gara ô tô. Pháp lý minh bạch, sổ hồng riêng.'
    }
  },
  {
    id: 'p2',
    slug: 'can-ho-skyline-riverside',
    name: 'Căn hộ Skyline Riverside',
    code: 'INL-CH-021',
    type: 'can-ho',
    category: 'can-ho',
    location: { province: 'TP.HCM', district: 'Bình Thạnh' },
    price: 2200000000,
    area: 72,
    thumbnail: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200'
    ],
    description: {
      short: 'Căn hộ 2PN view sông, tiện ích 5 sao, an ninh 24/7.',
      long: 'Không gian sống đẳng cấp giữa lòng thành phố. Tận hưởng hệ thống tiện ích nội khu hoàn hảo: hồ bơi tràn bờ, gym & yoga, vườn thiền, khu BBQ. Kết nối giao thông thuận tiện.'
    }
  },
  {
    id: 'p3',
    slug: 'van-phong-luxury-center',
    name: 'Văn phòng Luxury Center',
    code: 'INL-VP-105',
    type: 'van-phong',
    category: 'van-phong',
    location: { province: 'TP.HCM', district: 'Quận 1' },
    price: 35000000,
    area: 180,
    thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200',
      'https://images.unsplash.com/photo-1460891053196-b9d4d9483d9b?q=80&w=1200'
    ],
    description: {
      short: 'Văn phòng hạng A trung tâm Quận 1, thiết kế sang trọng.',
      long: 'Diện tích linh hoạt, sàn phẳng, trần cao, hệ thống điều hoà trung tâm, bãi đậu xe rộng. Tiện ích xung quanh đầy đủ, phù hợp doanh nghiệp quy mô vừa và lớn.'
    }
  }
]
