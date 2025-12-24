// Simplified Vietnam administrative data (post-merger placeholder)
export const provinces = [
  'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai', 'Long An', 'Bà Rịa - Vũng Tàu', 'Cần Thơ', 'Hải Phòng', 'Thừa Thiên Huế'
]

export const wardsByProvince: Record<string, string[]> = {
  'TP.HCM': [
    'Phường Bến Nghé','Phường Bến Thành','Phường Tân Định','Phường Thảo Điền','Phường An Phú','Phường Tân Phong','Phường Tân Phú','Phường Phú Mỹ','Phường Thảo Điền','Phường Linh Tây'
  ],
  'Hà Nội': [
    'Phường Tràng Tiền','Phường Hàng Bài','Phường Cửa Đông','Phường Phúc Tân','Phường Dịch Vọng','Phường Yên Hòa','Phường Mỹ Đình 1','Phường Mỹ Đình 2'
  ],
  'Đà Nẵng': ['Phường Thạch Thang','Phường Hải Châu 1','Phường Hải Châu 2','Phường Mỹ An','Phường An Hải Bắc'],
  'Bình Dương': ['Phường Hoà Phú','Phường Phú Lợi','Phường Dĩ An','Phường An Phú'],
  'Đồng Nai': ['Phường Trung Dũng','Phường Thống Nhất','Phường Tam Hòa'],
  'Long An': ['Phường 1','Phường 2','Phường 3'],
  'Bà Rịa - Vũng Tàu': ['Phường 1','Phường 3','Phường Thắng Tam'],
  'Cần Thơ': ['Phường Tân An','Phường Cái Khế','Phường Hưng Lợi'],
  'Hải Phòng': ['Phường Máy Tơ','Phường Cầu Đất','Phường Lạch Tray'],
  'Thừa Thiên Huế': ['Phường Vỹ Dạ','Phường Phú Hội','Phường Thuận Hòa']
}
