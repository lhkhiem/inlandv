"use client"
import React from 'react'
import { SimilarItemCardData } from '../../../lib/types'
import { Info } from 'lucide-react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

interface SimilarItemsSectionProps {
  items: SimilarItemCardData[]
  title?: string
  basePath?: string
}

export const SimilarItemsSection: React.FC<SimilarItemsSectionProps> = ({ items, title = 'Sản phẩm tương tự', basePath = '/bat-dong-san' }) => {
  const hasEnoughForSlider = items.length >= 4
  
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có sản phẩm phù hợp khác theo nhu cầu của bạn</div>
      ) : hasEnoughForSlider ? (
        <div className="similar-items-slider px-1 py-2">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="w-full pb-2"
          >
            {items.map((it) => (
              <SwiperSlide key={it.id} className="h-auto">
                <Link
                  href={`${basePath}/${it.slug}`}
                  className="flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
                >
                  <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                    {it.thumbnail_url ? (
                      <img src={it.thumbnail_url} alt={it.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
                    )}
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug">{it.name}</h3>
                  <div className="space-y-1 text-xs text-gray-600">
                    {it.area && <div>Diện tích: {it.area} m²</div>}
                    {it.total_area && <div>Tổng diện tích: {it.total_area} ha</div>}
                    {it.price && <div>Giá: {it.price.toLocaleString('vi-VN')}₫</div>}
                    {it.rental_price_min && (
                      <div>
                        Giá thuê: {it.rental_price_min.toLocaleString('vi-VN')} -
                        {it.rental_price_max?.toLocaleString('vi-VN')}₫/m²/tháng
                      </div>
                    )}
                    {it.province && <div>{it.province}</div>}
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-1 py-2">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`${basePath}/${it.slug}`}
              className="flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full"
            >
              <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
                {it.thumbnail_url ? (
                  <img src={it.thumbnail_url} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
                )}
              </div>
              <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug">{it.name}</h3>
              <div className="space-y-1 text-xs text-gray-600">
                {it.area && <div>Diện tích: {it.area} m²</div>}
                {it.total_area && <div>Tổng diện tích: {it.total_area} ha</div>}
                {it.price && <div>Giá: {it.price.toLocaleString('vi-VN')}₫</div>}
                {it.rental_price_min && (
                  <div>
                    Giá thuê: {it.rental_price_min.toLocaleString('vi-VN')} - {it.rental_price_max?.toLocaleString('vi-VN')}₫/m²/tháng
                  </div>
                )}
                {it.province && <div>{it.province}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
      <style jsx global>{`
        .similar-items-slider .swiper-wrapper {
          padding-bottom: 8px;
        }
        .similar-items-slider .swiper-slide {
          height: auto;
          display: flex;
          padding: 4px;
        }
        .similar-items-slider .swiper-button-next,
        .similar-items-slider .swiper-button-prev {
          color: #358b4e;
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .similar-items-slider .swiper-button-next:after,
        .similar-items-slider .swiper-button-prev:after {
          font-size: 16px;
          font-weight: bold;
        }
      `}</style>
    </section>
  )
}

export default SimilarItemsSection
