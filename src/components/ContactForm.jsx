import React, { useState } from 'react'
import * as api from '../services/api'

export default function ContactForm(){
  const [status, setStatus] = useState('')
  const [form, setForm] = useState({name:'', email:'', message:''})
  const [showAlert, setShowAlert] = useState(false)

  function onChange(e){
    setForm(f=>({...f, [e.target.name]: e.target.value}))
  }

  async function submit(e){
    e.preventDefault()
    setStatus('Sending...')
    try{
      await api.postContact(form)
      setStatus('Thanks! Your message has been received.')
      // show a dismissible success alert for accessibility/visibility
      setShowAlert(true)
      // auto-hide after a few seconds
      setTimeout(()=> setShowAlert(false), 4000)
      setForm({name:'', email:'', message:''})
    }catch(err){
      setStatus('Failed to send - please try again later.')
    }
  }

  return (
    <>
      {showAlert && (
        <div role="status" aria-live="polite" style={{background:'rgba(255,176,59,0.12)',color:'#ffb03b',padding:12,borderRadius:8,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <div><strong>Message sent</strong><div style={{opacity:0.95}}>{status}</div></div>
          <button onClick={()=>setShowAlert(false)} style={{background:'transparent',border:0,color:'#ffb03b',fontSize:18}} aria-label="Dismiss">×</button>
        </div>
      )}

      <form className="contact-form" onSubmit={submit}>
        <label>Name<input name="name" value={form.name} onChange={onChange} required /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={onChange} required /></label>
        <label>Message<textarea name="message" rows="4" value={form.message} onChange={onChange} required placeholder="Request for information, offer support, or report a verified resource"></textarea></label>
        <button className="btn btn-primary" type="submit">Send</button>
        <div className="muted" style={{marginTop:10}}>{status}</div>
      </form>
    </>
  )
}
