import React from 'react'
import ContactForm from '../components/ContactForm'

export default function Contact(){
  return (
    <main className="page container">
      <h2>Verified Resources & Safety</h2>
      <p>Below are curated resources for participants and supporters. Use only verified links and follow local guidance for safety.</p>

      <section className="menu-grid">
        <div className="menu-item"><h4>Safety Guidelines</h4><p>How to stay safe during demonstrations: plan exit routes, stay with friends, carry ID and water, and avoid escalation.</p></div>
        <div className="menu-item"><h4>Legal Aid</h4><p>List of verified legal aid organizations and helplines for timely support (update with local contacts before publishing).</p></div>
        <div className="menu-item"><h4>Fact-checking</h4><p>Links to reliable fact-checkers and guidance to verify photos and claims before sharing online.</p></div>
        <div className="menu-item"><h4>Medical Help</h4><p>First-aid basics and nearest clinics. Carry basic supplies and know your local emergency numbers.</p></div>
      </section>

      <ContactForm />
    </main>
  )
}
