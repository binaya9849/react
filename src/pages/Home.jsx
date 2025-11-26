import React, { useEffect, useRef } from 'react'
import Card from '../components/Card'
import { Link } from 'react-router-dom'

export default function Home(){
  const heroRef = useRef(null)

  useEffect(()=>{
    const el = heroRef.current
    if(!el) return
    function onMove(e){
      const w = window.innerWidth; const h = window.innerHeight
      const cx = (e.clientX - w/2) / (w/2)
      const cy = (e.clientY - h/2) / (h/2)
      el.style.transform = `translate(${cx * 6}px, ${cy * 6}px) rotate(${cx * 1.2}deg)`
    }
    window.addEventListener('mousemove', onMove)
    return ()=> window.removeEventListener('mousemove', onMove)
  },[])

  return (
    <>
      <main className="hero">
        <div className="container hero-grid">
          <div className="hero-left">
            <div className="kicker">Youth-led</div>
            <h1 className="hero-title">Nepal’s Gen Z: raising voices for change</h1>
            <p className="hero-sub">In recent months Nepal’s Gen Z has organized peaceful demonstrations, online campaigns, and community actions demanding accountability, better climate policy, educational reforms, and more representation. This site summarizes causes, major movements, social impact, and how you can access verified resources.</p>

            <div className="hero-cta">
              <Link className="btn btn-primary" to="/causes">See Causes</Link>
              <Link className="btn btn-outline" to="/contact">Get Resources</Link>
            </div>
          </div>

          <div className="hero-right">
            <div className="cup-wrap">
              <img id="heroImg" ref={heroRef} className="cup" src="/images/gettyimages-2233742364.jpg" alt="Protest crowd" />
            </div>
          </div>
        </div>
      </main>

      <section className="info container">
        <div className="cards">
          <Card title="Digital Mobilization">Gen Z is using social media and messaging to organize rapid, decentralized actions that are both online and offline.</Card>
          <Card title="Intersectional Demands">Protests emphasize climate justice, student rights, economic opportunity and accountability for institutions.</Card>
          <Card title="Nonviolent Action">Many events emphasize peaceful demonstration, awareness campaigns, and community engagement.</Card>
        </div>
      </section>
    </>
  )
}
