import React from 'react'

export default function GalleryItem({src, alt, movementActive, idx}){
  // small variation on animation timing using index
  const style = {
    display:'block',
    marginBottom:12,
    width: '100%',
    borderRadius:8,
    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
    transition: 'transform .35s ease, box-shadow .25s ease, filter .25s ease',
  }
  return (
    <div className={`gallery-item ${movementActive ? 'movement-on' : ''}`} style={{overflow:'hidden', borderRadius:8}}>
      <img src={src} alt={alt} style={style} />
      <div className="gallery-overlay">{alt}</div>
    </div>
  )
}
