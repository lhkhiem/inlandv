"use client"

const cats = [
  { key: 'mua-ban', label: 'Mua bán' },
  { key: 'cho-thue', label: 'Cho thuê' },
  { key: 'nha-xuong', label: 'Nhà xưởng' },
  { key: 'nha-pho', label: 'Nhà phố' },
  { key: 'can-ho', label: 'Căn hộ' },
  { key: 'van-phong', label: 'Văn phòng' },
]

export default function ProductCategorySidebar({
  active,
  onChange
}: {
  active?: string
  onChange: (key: string) => void
}){
  return (
    <aside className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sticky top-24">
      <div className="font-bold text-gray-900 mb-3">Danh mục</div>
      <div className="flex flex-col gap-1">
        {cats.map((c) => (
          <button
            key={c.key}
            onClick={()=>onChange(c.key)}
            className={`text-left px-3 py-2 rounded-lg transition-colors ${active===c.key? 'bg-goldLight/15 text-goldDark font-semibold':'text-gray-700 hover:bg-gray-50'}`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </aside>
  )
}
