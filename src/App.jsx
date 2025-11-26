import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Causes from './pages/Causes'
import Movements from './pages/Movements'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Admin from './pages/Admin'

export default function App(){
  useEffect(()=>{
    // reveal on scroll
    const items = Array.from(document.querySelectorAll('.reveal'))
    if(items.length){
      const obs = new IntersectionObserver((entries, o)=>{
        entries.forEach(e=>{
          if(e.isIntersecting){
            e.target.classList.add('visible')
            o.unobserve(e.target)
          }
        })
      }, {threshold: 0.18})
      items.forEach(i=> obs.observe(i))
    }

    // animate counters
    const counters = Array.from(document.querySelectorAll('.stat-number[data-target]'))
    if(counters.length){
      const obs2 = new IntersectionObserver((entries, o)=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting) return
          const el = entry.target
          const target = +el.getAttribute('data-target')
          const duration = 900
          const stepTime = Math.max(12, Math.floor(duration / Math.max(1,target)))
          let current = 0
          const step = ()=>{
            current += Math.ceil(target / (duration / stepTime))
            if(current >= target){ el.textContent = target }
            else { el.textContent = current; requestAnimationFrame(step) }
          }
          step()
          o.unobserve(el)
        })
      }, {threshold: 0.4})
      counters.forEach(c => obs2.observe(c))
    }

    // smooth anchor links for hashes
    function onClick(e){
      const a = e.target.closest && e.target.closest('a')
      if(!a) return
      const href = a.getAttribute('href') || ''
      if(href.startsWith('#')){
        const target = document.querySelector(href)
        if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}) }
      }
    }
    document.addEventListener('click', onClick)
    return ()=> document.removeEventListener('click', onClick)
  }, [])

  return (
    <div className="site">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/causes" element={<Causes/>} />
          <Route path="/movements" element={<Movements/>} />
          <Route path="/gallery" element={<Gallery/>} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
