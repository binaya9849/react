// site-wide JS: mobile menus, hero image float, contact form handler
(function(){
  // set year placeholders
  document.addEventListener('DOMContentLoaded', ()=>{
    const now = new Date().getFullYear();
    ['year','yearAbout','yearMenu','yearTest','yearGallery','yearContact'].forEach(id=>{
      const el = document.getElementById(id);
      if(el) el.textContent = now;
    });

    // menu toggles (works for multiple pages by id prefix)
    document.querySelectorAll('.menu-toggle').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        // find nearest mobile nav (same page)
        const ids = ['mobileNav','mobileNavAbout','mobileNavMenu','mobileNavTest','mobileNavGallery','mobileNavContact'];
        let shown = null;
        for(const id of ids){
          const m = document.getElementById(id);
          if(m) shown = m;
        }
        if(shown){
          const visible = shown.style.display === 'block';
          shown.style.display = visible ? 'none' : 'block';
          shown.setAttribute('aria-hidden', String(visible));
        }
      });
    });

    // hero image float effect
    const heroImg = document.getElementById('heroImg');
    if(heroImg){
      document.addEventListener('mousemove', (e)=>{
        const w = window.innerWidth; const h = window.innerHeight;
        const cx = (e.clientX - w/2) / (w/2);
        const cy = (e.clientY - h/2) / (h/2);
        heroImg.style.transform = `translate(${cx * 6}px, ${cy * 6}px) rotate(${cx * 1.2}deg)`;
      });
    }

    // contact form demo handler
    const form = document.getElementById('contactForm');
    if(form){
      form.addEventListener('submit', (e)=>{
        e.preventDefault();
        const msg = document.getElementById('formMsg');
        msg.textContent = 'Sending...';
        setTimeout(()=>{
          msg.textContent = 'Thanks! Your message has been received.';
          form.reset();
        }, 700);
      });
    }
  });
})();

// ABOUT page: reveal elements and animate counters when visible
(function(){
  function revealOnScroll() {
    const items = document.querySelectorAll('.reveal');
    if(!items.length) return;
    const obs = new IntersectionObserver((entries, o)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          o.unobserve(e.target);
        }
      });
    }, {threshold: 0.18});
    items.forEach(i => obs.observe(i));
  }

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    if(!counters.length) return;
    const obs = new IntersectionObserver((entries, o)=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.getAttribute('data-target');
        const duration = 900;
        const stepTime = Math.max(12, Math.floor(duration / target));
        let current = 0;
        const step = () => {
          current += Math.ceil(target / (duration / stepTime));
          if(current >= target){
            el.textContent = target;
          } else {
            el.textContent = current;
            requestAnimationFrame(step);
          }
        };
        step();
        o.unobserve(el);
      });
    }, {threshold: 0.4});
    counters.forEach(c => obs.observe(c));
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    revealOnScroll();
    animateCounters();
  });
})();
// Smooth scroll for same-site CTA anchors
(function(){
  document.addEventListener('click', function(e){
    const a = e.target.closest('a');
    if(!a) return;
    const href = a.getAttribute('href') || '';
    // smooth scroll only for internal links to our pages or anchors
    if(href.startsWith('#')){
      const target = document.querySelector(href);
      if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth'}); }
    }
  }, false);
})();
