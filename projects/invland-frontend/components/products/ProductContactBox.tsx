import Link from 'next/link'

export default function ProductContactBox(){
  return (
    <aside className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
      <h3 className="text-lg font-bold text-gray-900">Liên hệ tư vấn</h3>
      <p className="text-sm text-gray-600 mt-1">Đội ngũ Inland sẵn sàng hỗ trợ 24/7.</p>
      <form className="mt-4 space-y-3">
        <input placeholder="Họ và tên" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-goldDark" />
        <input placeholder="Số điện thoại" className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-goldDark" />
        <textarea placeholder="Nội dung quan tâm" rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-goldDark" />
        <button type="submit" className="w-full bg-goldDark text-white font-semibold rounded-lg py-2 hover:bg-[#c99822] transition">Gửi yêu cầu</button>
      </form>
      <div className="mt-4 text-sm text-gray-600">
        Hoặc gọi trực tiếp: <Link href="tel:0896686645" className="text-gray-900 font-semibold underline">0896 686 645</Link>
      </div>
    </aside>
  )
}
