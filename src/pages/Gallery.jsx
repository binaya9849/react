import React, { useEffect, useState, useRef } from 'react'
import GalleryItem from '../components/GalleryItem'
import * as api from '../services/api'

export default function Gallery(){
  const [images, setImages] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [movements, setMovements] = useState([])
  const [selectedMovement, setSelectedMovement] = useState(null)
  const fileRef = useRef(null)

  useEffect(()=>{
    let mounted = true
    const base = 'http://localhost:4000'
    async function load(){
      const r = await api.getGallery().catch(()=>null)
      const mv = await api.getMovements().catch(()=>null)
      if(!mounted) return
      const imgs = (r && r.images ? r.images : ['/images/1.jpg','/images/2.jpg','/images/3.jpg','/images/4.jpg']).map(i=> typeof i === 'string' && i.startsWith('/uploads/') ? base + i : i)
      setImages(imgs)
      setMovements(mv && mv.items ? mv.items : [])
    }
    load()

    // listen for admin updates via BroadcastChannel
    const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('bni-updates') : null
    if(bc){
      const onMsg = (ev) => { if(ev.data && ev.data.type === 'gallery-updated') load() }
      bc.addEventListener('message', onMsg)
      return ()=>{ mounted = false; bc.removeEventListener('message', onMsg); bc.close() }
    }
    return ()=> mounted = false
  },[])

  async function onUpload(e){
    e.preventDefault()
    const file = fileRef.current && fileRef.current.files && fileRef.current.files[0]
    if(!file) return
    // show immediate preview while upload persists
    const preview = URL.createObjectURL(file)
    setImages(prev => [...prev, preview])
    setShowForm(false)
    if(fileRef.current) fileRef.current.value = null
    try{
      const res = await api.postUpload(file)
      if(res && res.url){
        // replace preview with persistent URL (data URL or backend URL); ensure absolute backend path
        const url = typeof res.url === 'string' && res.url.startsWith('/uploads/') ? ('http://localhost:4000' + res.url) : res.url
        setImages(prev => prev.map(i => i === preview ? url : i))
        // revoke preview object URL
        URL.revokeObjectURL(preview)
        // notify other pages
        if(typeof window !== 'undefined' && 'BroadcastChannel' in window){ const bc = new BroadcastChannel('bni-updates'); bc.postMessage({type:'gallery-updated'}); bc.close() }
      }
    }catch(err){
      // on error, leave preview (or remove) — for now we keep it
      console.error('upload failed', err)
    }
  }

  async function addByUrl(e){
    e.preventDefault()
    const url = e.target.elements.url && e.target.elements.url.value && e.target.elements.url.value.trim()
    if(!url) return
    setShowForm(false)
    e.target.reset()
    try{
      const res = await api.postUpload(url)
      if(res && res.url){
        const finalUrl = typeof res.url === 'string' && res.url.startsWith('/uploads/') ? ('http://localhost:4000' + res.url) : res.url
        setImages(prev => [...prev, finalUrl])
        if(typeof window !== 'undefined' && 'BroadcastChannel' in window){ const bc = new BroadcastChannel('bni-updates'); bc.postMessage({type:'gallery-updated'}); bc.close() }
      }else{
        setImages(prev => [...prev, url])
      }
    }catch(err){
      setImages(prev => [...prev, url])
    }
  }

  return (
    <main className="page container">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <h2>Gallery</h2>
        <div>
          <button className="btn btn-primary" onClick={()=>setShowForm(v=>!v)}>{showForm ? 'Close' : 'Add Image'}</button>
        </div>
      </div>

      {movements.length > 0 && (
        <div style={{marginTop:12, display:'flex',gap:8,alignItems:'center',overflowX:'auto'}}>
          {movements.map((m,i)=> (
            <button key={i} className={`btn ${selectedMovement===i? 'btn-primary' : 'btn-outline'}`} onClick={()=> setSelectedMovement(selectedMovement===i? null : i)} style={{whiteSpace:'nowrap'}}>
              {m.title} {m.year ? `(${m.year})` : ''}
            </button>
          ))}
        </div>
      )}

      {selectedMovement !== null && movements[selectedMovement] && (
        <div className="movement-banner" style={{marginTop:12}}>
          <strong>{movements[selectedMovement].title}</strong>
          <span style={{marginLeft:10}} className="muted">{movements[selectedMovement].note}</span>
        </div>
      )}

      {showForm && (
        <div style={{marginTop:12}}>
          <form onSubmit={onUpload} style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input ref={fileRef} type="file" accept="image/*" />
            <button className="btn btn-primary" type="submit">Upload</button>
          </form>
          <form onSubmit={addByUrl} style={{marginTop:8,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <input name="url" placeholder="Image URL" style={{padding:8,borderRadius:6,border:'1px solid rgba(255,255,255,0.06)',background:'transparent',color:'white',minWidth:240}} />
            <button className="btn btn-outline" type="submit">Add by URL</button>
          </form>
        </div>
      )}

      <div className={`gallery-grid ${selectedMovement !== null ? 'with-movement' : ''}`} style={{marginTop:14}}>
        {images.map((s,i)=> <GalleryItem key={i} src={s} alt={`Protest image ${i+1}`} movementActive={selectedMovement !== null} idx={i} />)}
      </div>
    </main>
  )
}
