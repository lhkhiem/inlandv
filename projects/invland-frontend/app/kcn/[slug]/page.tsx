import React from 'react'
import DetailLayout from '../../../components/products/detail/DetailLayout'
import { IndustrialPark } from '../../../lib/types'

// Structural only – placeholder data, no real fetching.
export default async function IndustrialParkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const mock: IndustrialPark = {
    id: 'ip1',
    code: 'IP-001',
    name: 'KCN Long Hậu',
    slug: slug,
    province: 'Long An',
    total_area: 500,
    available_area: 120,
    allowed_industries: ['Cơ khí', 'Điện tử', 'Thực phẩm'],
    rental_price_min: 35000,
    rental_price_max: 45000,
    latitude: 10.652,
    longitude: 106.582,
    contact_phone: '0287 3847 568',
    description: 'Khu công nghiệp với hạ tầng hoàn chỉnh, vị trí chiến lược.',
    description_full: `Khu công nghiệp Long Hậu định vị là trung tâm sản xuất xanh và thông minh vùng kinh tế trọng điểm phía Nam. Quy hoạch mở tối ưu dòng chảy logistic với trục giao thông liên kết cảng và cao tốc. Hệ thống điện dự phòng nhiều lớp đảm bảo tính liên tục, cùng giải pháp nước tuần hoàn giảm tải chi phí vận hành. Hạ tầng viễn thông tích hợp cáp quang và IoT gateway cho phép doanh nghiệp triển khai chuyển đổi số nhanh chóng. Mô hình quản lý tập trung hỗ trợ doanh nghiệp về pháp lý, nhân lực và môi trường, tạo hệ sinh thái sản xuất hiệu quả, bền vững.`,
    infrastructure_power: true,
    infrastructure_water: true,
    infrastructure_road: true,
    infrastructure_internet: true,
    infrastructure_security: true,
    infrastructure_drainage: false,
    infrastructure_waste: true,
    images: [
      { id: 'i1', park_id: 'ip1', url: 'https://images.unsplash.com/photo-1565008576549-57569a49371d?w=1200&q=80', display_order: 1, created_at: '' },
      { id: 'i2', park_id: 'ip1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80', display_order: 2, created_at: '' },
      { id: 'i3', park_id: 'ip1', url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80', display_order: 3, created_at: '' },
      { id: 'i4', park_id: 'ip1', url: 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=1200&q=80', display_order: 4, created_at: '' }
    ],
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    created_at: '',
    updated_at: ''
  }

  return (
    <DetailLayout
      entity={{ kind: 'industrialPark', item: mock }}
      similarItems={[
        {
          id: 'ip2',
          slug: 'kcn-tan-duc',
          name: 'KCN Tân Đức',
          thumbnail_url: 'https://images.unsplash.com/photo-1577495917082-5dce8a0e3e92?w=400&q=80',
          total_area: 380,
          rental_price_min: 30000,
          rental_price_max: 40000,
          province: 'Long An'
        },
        {
          id: 'ip3',
          slug: 'kcn-hoa-phu',
          name: 'KCN Hóa Phú',
          thumbnail_url: 'https://images.unsplash.com/photo-1590422749897-dcd8275c01d8?w=400&q=80',
          total_area: 620,
          rental_price_min: 38000,
          rental_price_max: 50000,
          province: 'Bình Dương'
        }
      ]}
    />
  )
}
