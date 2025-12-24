import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Home, Maximize, Bed, Bath, Calendar, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, getAreaRange, formatDate } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const response = await api.getProjectBySlug(slug)
    const project = response.data

    if (!project) {
      return {
        title: 'Không tìm thấy - Inland Real Estate',
      }
    }

    return {
      title: `${project.title} - Inland Real Estate`,
      description: project.description,
      openGraph: {
        images: project.thumbnail_url ? [{ url: project.thumbnail_url }] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Dự án - Inland Real Estate',
    }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params
  let project
  
  try {
    const response = await api.getProjectBySlug(slug)
    project = response.data
  } catch (error) {
    // Mock data for demo
    project = {
      id: '1',
      title: 'Vinhomes Grand Park',
      slug: slug,
      description: 'Đô thị thông minh đẳng cấp quốc tế với đầy đủ tiện ích hiện đại, không gian sống xanh mát, an ninh 24/7.',
      location: 'Quận 9, TP. Hồ Chí Minh',
      price_min: 2000000000,
      price_max: 5000000000,
      area_min: 50,
      area_max: 120,
      status: 'dang-mo-ban',
      thumbnail_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200',
      gallery: [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  if (!project) {
    notFound()
  }

  return (
    <div className="pt-24 min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-goldDark">Trang chủ</Link>
            <span>/</span>
            <Link href="/mua-ban" className="hover:text-goldDark">Mua bán</Link>
            <span>/</span>
            <span className="text-gray-900">{project.title}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <Link
          href="/mua-ban"
          className="inline-flex items-center gap-2 text-goldDark hover:opacity-80 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${project.thumbnail_url})` }}
              />
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                  project.status === 'dang-mo-ban'
                    ? 'bg-green-500 text-white'
                    : 'bg-yellow-500 text-white'
                }`}>
                  {project.status === 'dang-mo-ban' ? 'Đang mở bán' : 'Sắp mở bán'}
                </span>
              </div>
            </div>

            {/* Title & Location */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {project.title}
              </h1>
              <div className="flex items-center text-gray-600 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                {project.location}
              </div>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow">
                <Maximize className="w-8 h-8 text-goldDark mb-2" />
                <div className="text-sm text-gray-600">Diện tích</div>
                <div className="font-semibold text-gray-900">
                  {getAreaRange(project.area_min, project.area_max)}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <Home className="w-8 h-8 text-goldDark mb-2" />
                <div className="text-sm text-gray-600">Loại hình</div>
                <div className="font-semibold text-gray-900">Căn hộ</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <Bed className="w-8 h-8 text-goldDark mb-2" />
                <div className="text-sm text-gray-600">Phòng ngủ</div>
                <div className="font-semibold text-gray-900">2-4 PN</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow">
                <Bath className="w-8 h-8 text-goldDark mb-2" />
                <div className="text-sm text-gray-600">Phòng tắm</div>
                <div className="font-semibold text-gray-900">2-3 WC</div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-8 shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả dự án</h2>
              <p className="text-gray-600 leading-relaxed">
                {project.description}
              </p>
            </div>

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <div className="bg-white rounded-2xl p-8 shadow">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Hình ảnh</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.gallery.map((image: string, index: number) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center hover:scale-110 transition-transform duration-300"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-24">
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Giá từ</div>
                <div className="text-3xl font-bold text-goldDark">
                  {formatPrice(project.price_min)}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Diện tích</span>
                  <span className="font-medium text-gray-900">
                    {getAreaRange(project.area_min, project.area_max)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Trạng thái</span>
                  <span className="font-medium text-gray-900">
                    {project.status === 'dang-mo-ban' ? 'Đang mở bán' : 'Sắp mở bán'}
                  </span>
                </div>
              </div>

              <Link
                href="/lien-he"
                className="block w-full text-center px-6 py-3 bg-goldDark text-white rounded-lg font-medium hover:bg-yellow-700 transition-colors mb-4"
              >
                Liên hệ tư vấn
              </Link>

              <a
                href="tel:0896686645"
                className="block w-full text-center px-6 py-3 border-2 border-goldDark text-goldDark rounded-lg font-medium hover:bg-yellow-50 transition-colors"
              >
                Gọi ngay: 0896 686 645
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
