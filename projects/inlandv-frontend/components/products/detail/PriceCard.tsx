import React from 'react'
import { DollarSign } from 'lucide-react'
import InfoCard from './InfoCard'

interface PriceCardProps {
  type: 'property' | 'industrialPark'
  price?: number
  pricePerSqm?: number
  rentalPriceMin?: number
  rentalPriceMax?: number
  transferPriceMin?: number // Giá chuyển nhượng tối thiểu (tỷ VND)
  transferPriceMax?: number // Giá chuyển nhượng tối đa (tỷ VND)
  negotiable?: boolean
  hasRental?: boolean // Có dịch vụ cho thuê
  hasTransfer?: boolean // Có dịch vụ chuyển nhượng
}

export const PriceCard: React.FC<PriceCardProps> = ({
  type,
  price,
  pricePerSqm,
  rentalPriceMin,
  rentalPriceMax,
  transferPriceMin,
  transferPriceMax,
  negotiable,
  hasRental,
  hasTransfer
}) => {
  return (
    <InfoCard title="Tầm giá" icon={DollarSign}>
      <div className="space-y-3 text-sm">
        {type === 'property' && (
          <>
            {price && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giá bán:</span>
                <span className="font-semibold text-[#358b4e]">{price.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            {pricePerSqm && (
              <div className="flex justify-between">
                <span className="text-gray-600">Giá/m²:</span>
                <span className="font-medium">{pricePerSqm.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            {negotiable && (
              <div className="mt-2 text-xs text-amber-600 font-medium">* Giá có thể thương lượng</div>
            )}
          </>
        )}
        {type === 'industrialPark' && (
          <>
            {/* Giá thuê */}
            {hasRental && (
              <>
                {rentalPriceMin && rentalPriceMax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá thuê:</span>
                    <span className="font-semibold text-[#358b4e]">
                      {rentalPriceMin.toLocaleString('vi-VN')} - {rentalPriceMax.toLocaleString('vi-VN')}₫/m²/tháng
                    </span>
                  </div>
                )}
                {rentalPriceMin && !rentalPriceMax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá thuê:</span>
                    <span className="font-semibold text-[#358b4e]">Từ {rentalPriceMin.toLocaleString('vi-VN')}₫/m²/tháng</span>
                  </div>
                )}
                {!rentalPriceMin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá thuê:</span>
                    <span className="font-medium text-gray-500">Liên hệ</span>
                  </div>
                )}
              </>
            )}
            
            {/* Giá chuyển nhượng */}
            {hasTransfer && (
              <>
                {transferPriceMin && transferPriceMax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá chuyển nhượng:</span>
                    <span className="font-semibold text-[#358b4e]">
                      {transferPriceMin.toLocaleString('vi-VN')} - {transferPriceMax.toLocaleString('vi-VN')} tỷ VND
                    </span>
                  </div>
                )}
                {transferPriceMin && !transferPriceMax && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá chuyển nhượng:</span>
                    <span className="font-semibold text-[#358b4e]">Từ {transferPriceMin.toLocaleString('vi-VN')} tỷ VND</span>
                  </div>
                )}
                {!transferPriceMin && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá chuyển nhượng:</span>
                    <span className="font-medium text-gray-500">Liên hệ</span>
                  </div>
                )}
              </>
            )}
            
            {/* Nếu không có dịch vụ nào */}
            {!hasRental && !hasTransfer && (
              <div className="text-sm text-gray-500">Liên hệ để biết giá</div>
            )}
            
            {/* Disclaimer */}
            {(hasRental || hasTransfer) && (
              <div className="mt-2 text-xs text-gray-500">* Giá tham khảo, liên hệ để biết thêm chi tiết</div>
            )}
          </>
        )}
        {type === 'property' && !price && !pricePerSqm && (
          <div className="text-sm text-gray-500">Liên hệ để biết giá</div>
        )}
      </div>
    </InfoCard>
  )
}

export default PriceCard
