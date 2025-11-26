import React from 'react'
import { useLocation } from 'react-router-dom'

export default function Footer(){
  const location = useLocation()
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <strong>Contact</strong>
          <div className="muted">Verified resources and support links — see Resources page</div>
        </div>
        <div className="muted">© <span>{year}</span> Nepal Gen Z Awareness</div>
      </div>
    </footer>
  )
}
