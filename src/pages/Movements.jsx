import React, { useEffect, useState } from 'react'
import * as api from '../services/api'

export default function Movements(){
  const [items, setItems] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({title:'', year:'', note:''})

  useEffect(()=>{
    let mounted = true
    const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('bni-updates') : null
    async function load(){
      const r = await api.getMovements().catch(()=>null)
      if(!mounted) return
      setItems(r && r.items ? r.items : [])
    }
    load()
    if(bc){
      const onMsg = (ev) => { if(ev.data && ev.data.type === 'movements-updated') load() }
      bc.addEventListener('message', onMsg)
      return ()=>{ mounted = false; bc.removeEventListener('message', onMsg); bc.close() }
    }
    return ()=> mounted = false
  },[])

  function onChange(e){
    const {name, value} = e.target
    setForm(f=>({...f, [name]: value}))
  }

  async function onSubmit(e){
    e.preventDefault()
    if(!form.title) return
    const payload = {title: form.title, year: form.year ? Number(form.year) : undefined, note: form.note}
    try{
      const res = await api.postMovement(payload)
      if(res && res.item){
        setItems(prev => [...prev, res.item])
        if(typeof window !== 'undefined' && 'BroadcastChannel' in window){ const bc = new BroadcastChannel('bni-updates'); bc.postMessage({type:'movements-updated'}); bc.close() }
      }
      setForm({title:'', year:'', note:''})
      setShowForm(false)
    }catch(err){
      console.error(err)
    }
  }

  return (
    <main className="page container">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <h2>Major Movements & Campaigns</h2>
        <button className="btn btn-primary" onClick={()=>setShowForm(v=>!v)}>{showForm ? 'Close' : 'Add Movement'}</button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} style={{marginTop:12,display:'grid',gap:8,maxWidth:560}}>
          <label>Title<input name="title" value={form.title} onChange={onChange} required /></label>
          <label>Year<input name="year" value={form.year} onChange={onChange} /></label>
          <label>Note<textarea name="note" rows={3} value={form.note} onChange={onChange} /></label>
          <div>
            <button className="btn btn-primary" type="submit">Save</button>
          </div>
        </form>
      )}

      <div className="testimonials" style={{marginTop:14}}>
        {items.map((it, idx)=> (
          <blockquote key={idx} className="testimonial">
            {it.title && `"${it.title}"`} {it.note ? (<div style={{marginTop:8}}>{it.note}</div>) : null}
            <cite>— {it.year || 'Overview'}</cite>
          </blockquote>
        ))}
      </div>
    </main>
  )
}
