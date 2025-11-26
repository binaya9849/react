import React, { useEffect, useState } from 'react'
import auth from '../services/auth'

function apiFetch(path, opts){
  const base = 'http://localhost:4000'
  return fetch(base + path, opts).then(r=>{
    if(!r.ok) throw new Error('Network error')
    return r.json()
  })
}

export default function Admin(){
  const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('bni-updates') : null
  const [authOk, setAuthOk] = useState(()=> auth.isAuthenticated())
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(()=>{
    const e = auth.getExpiry();
    return e ? Math.max(0, Math.round((e - Date.now())/1000)) : null
  })
  const [contacts, setContacts] = useState([])
  const [movements, setMovements] = useState([])
  const [gallery, setGallery] = useState([])
  const [highlights, setHighlights] = useState([])
  const [newHighlight, setNewHighlight] = useState({year:'', title:'', note:''})
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(!authOk) return
    loadAll()
  },[authOk])

  function checkPassword(){
    // use auth service which persists a short-lived session
    if(auth.login(password)){
      setAuthOk(true)
      setPassword('')
    }else{
      alert('Wrong password')
    }
  }

  // auto-logout when stored expiry elapses
  useEffect(()=>{
    if(!authOk) return
    const expiry = auth.getExpiry()
    if(!expiry) return
    const ms = expiry - Date.now()
    if(ms <= 0){ auth.logout(); setAuthOk(false); return }
    const t = setTimeout(()=>{
      auth.logout(); setAuthOk(false); alert('Admin session expired')
    }, ms)
    return ()=> clearTimeout(t)
  }, [authOk])

  // realtime ticking seconds left
  useEffect(()=>{
    if(!authOk) { setSecondsLeft(null); return }
    const tick = () => {
      const e = auth.getExpiry()
      if(!e){ setSecondsLeft(null); return }
      const s = Math.max(0, Math.round((e - Date.now())/1000))
      setSecondsLeft(s)
      if(s <= 0){ auth.logout(); setAuthOk(false); alert('Admin session expired') }
    }
    tick()
    const id = setInterval(tick, 1000)
    return ()=> clearInterval(id)
  }, [authOk])

  async function loadAll(){
    setLoading(true)
    try{
      const c = await apiFetch('/contacts')
      const m = await apiFetch('/movements')
      const g = await apiFetch('/gallery')
      const h = await apiFetch('/highlights')
      setContacts(c.items || [])
      setMovements(m.items || [])
      setHighlights(h.items || [])
      // convert uploaded paths to absolute backend URLs so images load cross-origin
      const base = 'http://localhost:4000'
      const imgs = (g.images || []).map(i => {
        if(typeof i !== 'string') return i
        if(i.startsWith('/uploads/')) return base + i
        return i
      })
      setGallery(imgs)
    }catch(err){
      console.error(err)
      alert('Failed to contact backend. Is the server running at http://localhost:4000 ?')
    }finally{ setLoading(false) }
  }

  async function deleteContact(i){
    if(!confirm('Delete contact?')) return
    try{ await apiFetch(`/contacts/${i}`, {method:'DELETE'})
      setContacts(prev => prev.filter((_,idx)=>idx!==i))
    }catch(e){ alert('Failed') }
  }

  async function deleteMovement(i){
    if(!confirm('Delete movement?')) return
    try{ await apiFetch(`/movements/${i}`, {method:'DELETE'})
      setMovements(prev => prev.filter((_,idx)=>idx!==i))
      if(bc) bc.postMessage({type:'movements-updated'})
    }catch(e){ alert('Failed') }
  }

  async function submitHighlight(e){
    e && e.preventDefault && e.preventDefault()
    if(!newHighlight.title) return alert('Title required')
    try{
      const res = await apiFetch('/highlights', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({year: newHighlight.year ? Number(newHighlight.year) : undefined, title:newHighlight.title, note:newHighlight.note})})
      if(res && res.item) setHighlights(prev => [...prev, res.item])
      setNewHighlight({year:'', title:'', note:''})
      if(bc) bc.postMessage({type:'highlights-updated'})
    }catch(err){ alert('Failed to add highlight') }
  }

  async function deleteHighlight(i){
    if(!confirm('Delete highlight?')) return
    try{ await apiFetch(`/highlights/${i}`, {method:'DELETE'})
      setHighlights(prev => prev.filter((_,idx)=>idx!==i))
      if(bc) bc.postMessage({type:'highlights-updated'})
    }catch(e){ alert('Failed') }
  }

  // Add movement from admin
  const [newMove, setNewMove] = useState({title:'', year:'', note:''})
  function onNewChange(e){
    const {name, value} = e.target
    setNewMove(s=>({...s, [name]: value}))
  }

  async function submitNew(e){
    e.preventDefault()
    if(!newMove.title) return alert('Title required')
    try{
      const res = await apiFetch('/movements', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title:newMove.title, year: newMove.year ? Number(newMove.year) : undefined, note:newMove.note})})
      if(res && res.item){
        setMovements(prev => [...prev, res.item])
      }
      setNewMove({title:'', year:'', note:''})
      if(bc) bc.postMessage({type:'movements-updated'})
    }catch(err){
      alert('Failed to add movement')
    }
  }

  async function deleteUpload(itemOrFilename){
    if(!confirm('Delete uploaded file?')) return
    const base = 'http://localhost:4000'
    // accept either full url or plain filename
    const filename = itemOrFilename.includes('/') ? itemOrFilename.split('/').pop() : itemOrFilename
    try{
      await apiFetch(`/uploads/${filename}`, {method:'DELETE'})
      setGallery(prev => prev.filter(p => !p.endsWith('/' + filename)))
    }catch(e){ alert('Failed') }
  }

  async function onFile(e){
    const file = e.target.files && e.target.files[0]
    if(!file) return
    const fd = new FormData(); fd.append('file', file)
    try{
      const res = await fetch('http://localhost:4000/upload', {method:'POST', body: fd})
      const j = await res.json()
      if(j && j.url){
        const url = j.url.startsWith('/uploads/') ? ('http://localhost:4000' + j.url) : j.url
        setGallery(prev => [...prev, url])
        if(bc) bc.postMessage({type:'gallery-updated'})
      }
    }catch(err){ alert('Upload failed') }
  }

  if(!authOk) return (
    <main className="page container">
      <div className="admin-login">
        <div className="admin-login-card">
          <h2>🔐 Admin Login</h2>
          <p className="muted">Enter admin password to continue — session lasts 15 minutes.</p>
          <div className="login-row">
            <div className="login-input-wrap">
              <input
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                onKeyDown={e => e.key === 'Enter' && checkPassword()}
              />
              <button
                type="button"
                className="toggle-pass"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={()=>setShowPassword(v=>!v)}
              >{showPassword ? '🙈' : '👁️'}</button>
            </div>
            <button className="btn btn-primary" onClick={checkPassword}>Enter</button>
          </div>
          <div className="login-footer muted">Tip: use the admin password provided during setup.</div>
        </div>
      </div>
    </main>
  )

  return (
    <main className="page container admin-page">
      <header className="admin-header">
        <div>
          <h1>🛠️ Admin Panel</h1>
          <p className="muted">Manage contacts, movements and gallery uploads</p>
        </div>
        <div className="admin-actions">
          <div className="admin-countdown">Session: <strong>{secondsLeft !== null ? secondsLeft + 's' : '—'}</strong></div>
          <button className="btn btn-outline" onClick={()=>{ auth.logout(); setAuthOk(false) }}>Logout</button>
        </div>
      </header>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>📥 Contacts</h3>
          {loading ? <div className="muted">Loading…</div> : contacts.length === 0 ? <div className="muted">No contacts</div> : (
            <div className="admin-list">
              {contacts.map((c,i)=> (
                <div key={i} className="admin-list-item">
                  <div className="admin-item-meta"><strong>{c.name}</strong> <span className="muted">— {c.email}</span></div>
                  <div className="admin-item-body">{c.message}</div>
                  <div className="admin-item-actions"><button className="btn btn-danger" onClick={()=>deleteContact(i)}>Delete</button></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="admin-card">
          <h3>⚡ Movements</h3>
          <form onSubmit={submitNew} className="movement-form">
            <input name="title" value={newMove.title} onChange={onNewChange} placeholder="Title" required />
            <input name="year" value={newMove.year} onChange={onNewChange} placeholder="Year" />
            <input name="note" value={newMove.note} onChange={onNewChange} placeholder="Note (short)" />
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" type="submit">Add movement</button>
              <button type="button" className="btn" onClick={loadAll}>Refresh</button>
            </div>
          </form>

          <div className="admin-list" style={{marginTop:12}}>
            {movements.length === 0 ? <div className="muted">No movements</div> : movements.map((m,i)=> (
              <div key={i} className="admin-list-item">
                <div className="admin-item-meta"><strong>{m.title}</strong> <span className="badge">{m.year}</span></div>
                <div className="admin-item-body">{m.note}</div>
                <div className="admin-item-actions"><button className="btn btn-outline" onClick={()=>deleteMovement(i)}>Delete</button></div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3>⭐ Recent highlights</h3>
          <form onSubmit={submitHighlight} className="movement-form">
            <input name="title" value={newHighlight.title} onChange={e=>setNewHighlight(s=>({...s, title:e.target.value}))} placeholder="Title" required />
            <input name="year" value={newHighlight.year} onChange={e=>setNewHighlight(s=>({...s, year:e.target.value}))} placeholder="Year" />
            <input name="note" value={newHighlight.note} onChange={e=>setNewHighlight(s=>({...s, note:e.target.value}))} placeholder="Note (short)" />
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-primary" type="submit">Add highlight</button>
            </div>
          </form>

          <div className="admin-list" style={{marginTop:12}}>
            {highlights.length === 0 ? <div className="muted">No highlights</div> : highlights.map((h,i)=> (
              <div key={i} className="admin-list-item">
                <div className="admin-item-meta"><strong>{h.title}</strong> <span className="badge">{h.year}</span></div>
                <div className="admin-item-body">{h.note}</div>
                <div className="admin-item-actions"><button className="btn btn-danger" onClick={()=>deleteHighlight(i)}>Delete</button></div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card">
          <h3>🖼️ Gallery Uploads</h3>
          <div className="upload-row">
            <input type="file" onChange={onFile} />
          </div>
          <div className="admin-list" style={{marginTop:12}}>
            {gallery.length === 0 ? <div className="muted">No images</div> : gallery.map((g,i)=> (
              <div key={i} className="admin-list-item admin-gallery-item">
                <img src={g} alt="img" />
                <div className="admin-item-body" style={{flex:1}}>{g}</div>
                <div className="admin-item-actions">
                  {g.includes('/uploads/') ? (
                    <button className="btn btn-danger" onClick={()=>{ deleteUpload(g); if(bc) bc.postMessage({type:'gallery-updated'}) }}>Delete</button>
                  ): null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
