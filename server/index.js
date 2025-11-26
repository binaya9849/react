const express = require('express')
const cors = require('cors')
const multer = require('multer')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

// prepare uploads dir
const UPLOAD_DIR = path.join(__dirname, 'uploads')
if(!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// static serve uploaded images
app.use('/uploads', express.static(UPLOAD_DIR))

// simple storage for movements and contacts
const DATA_DIR = path.join(__dirname, 'data')
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function readJSON(name, fallback){
  try{
    const p = path.join(DATA_DIR, name)
    if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8'))
  }catch(e){}
  return fallback
}
function writeJSON(name, obj){
  const p = path.join(DATA_DIR, name)
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8')
}

// endpoints
app.post('/contact', (req, res) => {
  const body = req.body || {}
  const contacts = readJSON('contacts.json', [])
  contacts.push({...body, receivedAt: new Date().toISOString()})
  writeJSON('contacts.json', contacts)
  res.json({ok:true})
})

app.get('/gallery', (req, res) => {
  // return list of uploaded files and sample images
  const uploads = fs.readdirSync(UPLOAD_DIR).map(f => `/uploads/${f}`)
  const samples = [
    '/images/1.jpg','/images/2.jpg','/images/3.jpg','/images/4.jpg'
  ].filter(Boolean)
  res.json({images: [...samples, ...uploads]})
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g,'_')
    cb(null, safe)
  }
})
const upload = multer({ storage })

app.post('/upload', upload.single('file'), (req, res) => {
  if(!req.file) return res.status(400).json({error:'no file'})
  const url = `/uploads/${req.file.filename}`
  res.json({ok:true, url})
})

app.get('/movements', (req, res) => {
  const items = readJSON('movements.json', [
    {title:'Student Marches', year:2023, note:'Student-led actions on education costs and transparency.'}
  ])
  res.json({items})
})

// highlights endpoints
app.get('/highlights', (req, res) => {
  const items = readJSON('highlights.json', [
    {year:2023, title:'Local marches', note:'Student-led actions on education costs and transparency.'},
    {year:2024, title:'Climate days', note:'Coordinated strikes and awareness campaigns.'},
  ])
  res.json({items})
})

app.post('/highlights', (req, res) => {
  const item = req.body || {}
  const items = readJSON('highlights.json', [])
  items.push(item)
  writeJSON('highlights.json', items)
  res.json({ok:true, item})
})

app.delete('/highlights/:idx', (req, res) => {
  const idx = Number(req.params.idx)
  const items = readJSON('highlights.json', [])
  if(Number.isFinite(idx) && idx >=0 && idx < items.length){
    const removed = items.splice(idx, 1)
    writeJSON('highlights.json', items)
    return res.json({ok:true, removed})
  }
  res.status(404).json({error:'not found'})
})

app.post('/movements', (req, res) => {
  const item = req.body || {}
  const items = readJSON('movements.json', [])
  items.push(item)
  writeJSON('movements.json', items)
  res.json({ok:true, item})
})

// contacts listing and deletion
app.get('/contacts', (req, res) => {
  const items = readJSON('contacts.json', [])
  res.json({items})
})

app.delete('/contacts/:idx', (req, res) => {
  const idx = Number(req.params.idx)
  const items = readJSON('contacts.json', [])
  if(Number.isFinite(idx) && idx >=0 && idx < items.length){
    items.splice(idx, 1)
    writeJSON('contacts.json', items)
    return res.json({ok:true})
  }
  res.status(404).json({error:'not found'})
})

// delete a movement by index
app.delete('/movements/:idx', (req, res) => {
  const idx = Number(req.params.idx)
  const items = readJSON('movements.json', [])
  if(Number.isFinite(idx) && idx >=0 && idx < items.length){
    const removed = items.splice(idx, 1)
    writeJSON('movements.json', items)
    return res.json({ok:true, removed})
  }
  res.status(404).json({error:'not found'})
})

// delete uploaded file
app.delete('/uploads/:filename', (req, res) => {
  const fn = req.params.filename
  const p = path.join(UPLOAD_DIR, fn)
  if(fs.existsSync(p)){
    try{ fs.unlinkSync(p) }catch(e){ }
    return res.json({ok:true})
  }
  res.status(404).json({error:'not found'})
})

app.listen(PORT, ()=>{
  console.log(`Backend server running on http://localhost:${PORT}`)
})
