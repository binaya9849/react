import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '../services/api'

export default function About(){
  const [highlights, setHighlights] = useState([])

  useEffect(()=>{
    let mounted = true
    api.getHighlights().then(r=>{ if(!mounted) return; setHighlights(r.items || []) }).catch(()=>{})
    // listen for updates
    const bc = typeof window !== 'undefined' && 'BroadcastChannel' in window ? new BroadcastChannel('bni-updates') : null
    if(bc){ const onMsg = (ev)=>{ if(ev.data && ev.data.type === 'highlights-updated') api.getHighlights().then(r=>setHighlights(r.items || [])).catch(()=>{}) }
      bc.addEventListener('message', onMsg)
      return ()=>{ bc.removeEventListener('message', onMsg); bc.close(); mounted = false }
    }
    return ()=> mounted = false
  }, [])

  return (
    <main className="page container about-main-simple" aria-labelledby="about-title">
      <section className="about-hero-simple" role="region" aria-label="About the movement">
        <h2 id="about-title">About Nepal’s Gen Z Protests</h2>
        <p className="lead">Nepal’s Gen Z — students, young workers and online organizers — have been voicing concerns about climate resilience, education affordability, transparency, and youth representation. This movement blends peaceful street actions with digital campaigns to push for concrete, accountable change.</p>

        <div className="about-quick">
          <div className="quick-card"><h3>What</h3><p>Peaceful demonstrations, teach-ins, social media campaigns and community outreach.</p></div>
          <div className="quick-card"><h3>Why</h3><p>To demand better climate policy, affordable education, job opportunities, and transparent governance.</p></div>
          <div className="quick-card"><h3>How</h3><p>Organizing through student unions, NGOs, and verified online networks — prioritizing nonviolence and facts.</p></div>
        </div>

        <div className="about-actions">
          <Link className="btn btn-primary" to="/causes">Explore Causes</Link>
          <Link className="btn btn-outline" to="/contact">Verified Resources</Link>
        </div>
      </section>

      <section className="about-timeline" aria-label="Recent timeline">
        <h3>Recent highlights</h3>
        <ul className="timeline-list-simple">
          {highlights && highlights.length ? highlights.map((h,i)=> (
            <li key={i}><time>{h.year || ''}</time><div className="tl-body"><strong>{h.title}</strong> — {h.note}</div></li>
          )) : (
            <>
              <li><time>2023</time><div className="tl-body"><strong>Local marches</strong> — Student-led actions on education costs and transparency.</div></li>
              <li><time>2024</time><div className="tl-body"><strong>Climate days</strong> — Coordinated strikes and awareness campaigns.</div></li>
              <li><time>2025</time><div className="tl-body"><strong>Coalition building</strong> — Cross-community events and policy proposals.</div></li>
            </>
          )}
        </ul>
      </section>

      <section className="about-cta-simple" aria-label="Call to action">
        <p className="muted">Want accurate updates or to help safely? Use the Resources page for verified contacts, legal aid and safety guidance.</p>
        <div style={{marginTop:12}}>
          <Link className="btn btn-primary" to="/contact">Go to Resources</Link>
          <Link className="btn btn-outline" to="/gallery">See Photos</Link>
        </div>
      </section>
    </main>
  )
}
