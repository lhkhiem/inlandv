"use client"

import { useState } from 'react'

export default function ProductGallery({ images }: { images: string[] }){
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  return (
    <div>
      <div className="relative h-[420px] rounded-2xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-center bg-cover cursor-zoom-in" onClick={()=>setLightbox(true)} style={{ backgroundImage:`url(${images[current]})` }} />
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {images.map((src, i) => (
          <button key={i} onClick={()=>setCurrent(i)} className={`h-16 rounded-lg overflow-hidden border ${current===i?'border-goldDark':'border-transparent hover:border-goldLight/60'}`}>
            <div className="w-full h-full bg-center bg-cover" style={{ backgroundImage:`url(${src})` }} />
          </button>
        ))}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={()=>setLightbox(false)}>
          <img src={images[current]} className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  )
}
