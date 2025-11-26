// API helpers that prefer the backend at http://localhost:4000, with localStorage fallback
const BASE = 'http://localhost:4000'
const GALLERY_KEY = 'nepal:gallery:images'
const MOVEMENTS_KEY = 'nepal:movements:items'

async function tryFetch(path, opts){
  try{
    const res = await fetch(BASE + path, opts)
    if(!res.ok) throw new Error('Network')
    return await res.json()
  }catch(err){
    return null
  }
}

export async function postContact(data){
  const res = await tryFetch('/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)})
  if(res) return res
  // fallback: store locally (not recommended for production)
  return new Promise((resolve)=> setTimeout(()=> resolve({ok:true}), 300))
}

function defaultGallery(){
  return ['/images/1.jpg','/images/2.jpg','/images/3.jpg','/images/4.jpg']
}

export async function getGallery(){
  const res = await tryFetch('/gallery')
  if(res && Array.isArray(res.images)) return {images: res.images}
  // fallback to localStorage
  return new Promise((resolve)=>{
    setTimeout(()=>{
      try{
        const raw = localStorage.getItem(GALLERY_KEY)
        if(raw){ resolve({images: JSON.parse(raw)}) ; return }
      }catch(e){}
      resolve({images: defaultGallery()})
    }, 200)
  })
}

// Accepts either a File object or a URL string. Prefer server upload, fallback to localStorage.
export async function postUpload(fileOrUrl){
  // if string - try server post as URL
  if(typeof fileOrUrl === 'string'){
    const res = await tryFetch('/upload', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({url: fileOrUrl})})
    if(res && res.url) return res
    // fallback: persist local
    const raw = localStorage.getItem(GALLERY_KEY)
    const arr = raw ? JSON.parse(raw) : defaultGallery()
    arr.push(fileOrUrl)
    localStorage.setItem(GALLERY_KEY, JSON.stringify(arr))
    return {ok:true, url: fileOrUrl}
  }

  // file upload via multipart
  try{
    const fd = new FormData(); fd.append('file', fileOrUrl)
    const resp = await fetch(BASE + '/upload', {method:'POST', body: fd})
    if(resp.ok){ const j = await resp.json(); return j }
  }catch(e){ /* fallthrough */ }

  // fallback: read as DataURL and persist
  return new Promise((resolve,reject)=>{
    try{
      const reader = new FileReader()
      reader.onload = function(e){
        const dataUrl = e.target.result
        try{
          const raw = localStorage.getItem(GALLERY_KEY)
          const arr = raw ? JSON.parse(raw) : defaultGallery()
          arr.push(dataUrl)
          localStorage.setItem(GALLERY_KEY, JSON.stringify(arr))
        }catch(err){}
        resolve({ok:true, url: dataUrl})
      }
      reader.onerror = function(err){ reject(err) }
      reader.readAsDataURL(fileOrUrl)
    }catch(err){ reject(err) }
  })
}

export async function getMovements(){
  const res = await tryFetch('/movements')
  if(res && Array.isArray(res.items)) return {items: res.items}
  return new Promise((resolve)=>{
    setTimeout(()=>{
      try{
        const raw = localStorage.getItem(MOVEMENTS_KEY)
        if(raw){ resolve({items: JSON.parse(raw)}) ; return }
      }catch(e){}
      resolve({items:[{title:'Student Marches', year:2023, note:'Student-led actions on education costs and transparency.'}]})
    }, 300)
  })
}

export async function postMovement(item){
  const res = await tryFetch('/movements', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item)})
  if(res) return res
  // fallback to localStorage
  return new Promise((resolve, reject)=>{
    try{
      const raw = localStorage.getItem(MOVEMENTS_KEY)
      const arr = raw ? JSON.parse(raw) : []
      const toAdd = { title: item.title || 'Untitled', year: item.year || new Date().getFullYear(), note: item.note || '' }
      arr.push(toAdd)
      localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(arr))
      resolve({ok:true, item: toAdd})
    }catch(err){ reject(err) }
  })
}

export async function getHighlights(){
  const res = await tryFetch('/highlights')
  if(res && Array.isArray(res.items)) return {items: res.items}
  return new Promise((resolve)=>{
    setTimeout(()=> resolve({items:[{year:2023,title:'Local marches',note:'Student-led actions.'},{year:2024,title:'Climate days',note:'Awareness campaigns.'}]}), 200)
  })
}

export async function postHighlight(item){
  const res = await tryFetch('/highlights', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(item)})
  if(res) return res
  return new Promise((resolve,reject)=>{
    try{
      const raw = localStorage.getItem('nepal:highlights:items')
      const arr = raw ? JSON.parse(raw) : []
      arr.push(item)
      localStorage.setItem('nepal:highlights:items', JSON.stringify(arr))
      resolve({ok:true, item})
    }catch(err){ reject(err) }
  })
}

export async function deleteHighlight(idx){
  const res = await tryFetch(`/highlights/${idx}`, {method:'DELETE'})
  if(res) return res
  return new Promise((resolve,reject)=>{
    try{
      const raw = localStorage.getItem('nepal:highlights:items')
      const arr = raw ? JSON.parse(raw) : []
      if(idx>=0 && idx < arr.length){ const removed = arr.splice(idx,1); localStorage.setItem('nepal:highlights:items', JSON.stringify(arr)); resolve({ok:true, removed}) }else resolve({error:'not found'})
    }catch(err){ reject(err) }
  })
}
