import React from 'react'
import DetailLayout from '../../../components/products/detail/DetailLayout'
import { Property } from '../../../lib/types'

// Structural only – placeholder data, no real fetching.
export default async function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mock: Property = {
    id: 'p1',
    code: 'P-001',
    name: 'Biệt thự ven sông sang trọng',
    slug: slug,
    province: 'Hồ Chí Minh',
    type: 'biet-thu',
    status: 'available',
    legal_status: 'Sổ đỏ đầy đủ',
    area: 420,
    price: 12500000000,
    price_per_sqm: 29760000,
    negotiable: true,
    latitude: 10.742,
    longitude: 106.678,
    contact_phone: '0901234567',
    description: 'Biệt thự thiết kế hiện đại, không gian mở, view sông.',
    description_full: `Biệt thự ven sông mang phong cách nhiệt đới đương đại, nhấn mạnh sự hòa quyện giữa ánh sáng tự nhiên và vật liệu sang trọng. Không gian phòng khách mở ra sân vườn xanh mát, nơi hồ bơi dài tạo điểm nhấn thư giãn. Khu vực bếp được bố trí với đảo trung tâm tối ưu cho việc chuẩn bị và tiếp khách. Tầng trên là các phòng ngủ hướng nhìn thẳng ra mặt nước, ban công thoáng đãng đón gió. Thiết kế ưu tiên thông gió chéo, sử dụng kính Low-E hạn chế nhiệt, đảm bảo tiết kiệm năng lượng. Đây là nơi lý tưởng cho gia chủ tìm kiếm sự riêng tư nhưng vẫn kết nối với thiên nhiên đô thị.`,
    images: [
      { id: 'i1', property_id: 'p1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', display_order: 1, created_at: '' },
      { id: 'i2', property_id: 'p1', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', display_order: 2, created_at: '' },
      { id: 'i3', property_id: 'p1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', display_order: 3, created_at: '' },
      { id: 'i4', property_id: 'p1', url: 'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80', display_order: 4, created_at: '' }
    ],
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    amenities: ['Hồ bơi', 'Sân vườn', 'Garage', 'An ninh 24/7'],
    created_at: '',
    updated_at: ''
  }

  return (
    <DetailLayout
      entity={{ kind: 'property', item: mock }}
      similarItems={[
        {
          id: 'p2',
          slug: 'can-ho-vista-verde',
          name: 'Căn hộ Vista Verde 2PN',
          thumbnail_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
          area: 85,
          price: 3200000000,
          province: 'Hồ Chí Minh'
        },
        {
          id: 'p3',
          slug: 'nha-pho-thu-duc',
          name: 'Nhà phố Thủ Đức 1 trệt 2 lầu',
          thumbnail_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80',
          area: 120,
          price: 8500000000,
          province: 'Hồ Chí Minh'
        },
        {
          id: 'p4',
          slug: 'biet-thu-quan-2',
          name: 'Biệt thự Quận 2 view sông',
          thumbnail_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&q=80',
          area: 350,
          price: 15000000000,
          province: 'Hồ Chí Minh'
        }
      ]}
    />
  )
}
