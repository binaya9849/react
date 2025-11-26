import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar(){
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const toggleRef = useRef(null)

  useEffect(()=>{
    setOpen(false)
  },[location.pathname])

  return (
    <header className={`topbar ${location.pathname === '/' ? 'home-header' : location.pathname === '/about' ? 'about-header' : location.pathname === '/causes' ? 'menu-header' : location.pathname === '/movements' ? 'testimonials-header' : location.pathname === '/gallery' ? 'gallery-header' : 'contact-header'}`}>
      <div className="container">
        <div className="logo">
          <div className="icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#fff" opacity="0.9"/>
              <path d="M8 12h8" stroke="#3b0f12" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>Nepal <span>GenZ</span></h3>
        </div>

        <button className="menu-toggle" aria-expanded={open} onClick={()=>setOpen(v=>!v)} ref={toggleRef}>☰</button>

        <nav className="navlinks" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/causes">Causes</Link>
          <Link to="/movements">Movements</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/contact">Resources</Link>
        </nav>
      </div>

      <div className="mobile-nav" style={{display: open ? 'block' : 'none'}} aria-hidden={!open}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/causes">Causes</Link>
        <Link to="/movements">Movements</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/contact">Resources</Link>
      </div>
    </header>
  )
}
