const AUTH_KEY = 'bni-admin-auth'
const ADMIN_PASSWORD = 'admin'
const TTL = 15 * 60 * 1000 // 15 minutes in ms

function now(){ return Date.now() }

function save(obj){
  try{ localStorage.setItem(AUTH_KEY, JSON.stringify(obj)) }catch(e){}
}

function load(){
  try{ const v = localStorage.getItem(AUTH_KEY); return v ? JSON.parse(v) : null }catch(e){ return null }
}

export default {
  login(password){
    if(password !== ADMIN_PASSWORD) return false
    save({ expiry: now() + TTL })
    return true
  },
  logout(){
    try{ localStorage.removeItem(AUTH_KEY) }catch(e){}
  },
  isAuthenticated(){
    const v = load()
    if(!v || !v.expiry) return false
    if(v.expiry < now()){ this.logout(); return false }
    return true
  },
  getExpiry(){
    const v = load()
    return v && v.expiry ? v.expiry : null
  }
}
