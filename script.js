const menuBtn = document.getElementById('menuBtn');
  menuBtn?.addEventListener('click', () => {
    const links = document.querySelector('nav.links');
    const open = links.style.display === 'flex';
    links.style.display = open ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.gap = '14px';
    links.style.position = 'absolute';
    links.style.top = '64px';
    links.style.left = '0';
    links.style.right = '0';
    links.style.background = 'var(--chalk)';
    links.style.padding = '18px 24px';
    links.style.borderBottom = '1px solid var(--line)';
    links.style.zIndex = '55';
    if(!open){
      links.querySelectorAll('a').forEach(a=>{
        a.addEventListener('click', ()=>{ links.style.display='none'; }, {once:true});
      });
    }
  });

  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive:true });

  const revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el=> io.observe(el));
  } else {
    revealEls.forEach(el=> el.classList.add('is-visible'));
  }

  const reduceMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)').matches;

  // subtle crossfade slideshow for the Nursery / Primary / Secondary photo cards
  if(!reduceMotion){
    document.querySelectorAll('.photo-slideshow').forEach((box, boxIndex) => {
      const imgs = box.querySelectorAll('img');
      if(imgs.length < 2) return;
      let current = 0;
      setInterval(() => {
        imgs[current].classList.remove('active');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('active');
      }, 4700);
    });
  }

  // simple lightbox for the gallery (photos and slideshow photos)
  const galleryLinks = document.querySelectorAll('.gallery-item');
  const slidePhotos = document.querySelectorAll('.gs-slide img');
  if(galleryLinks.length || slidePhotos.length){
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = '<button class="lightbox-close" aria-label="Close">&times;</button><img alt=""><p class="lightbox-caption"></p>';
    document.body.appendChild(overlay);
    const lightboxImg = overlay.querySelector('img');
    const lightboxCaption = overlay.querySelector('.lightbox-caption');
    const closeLightbox = () => { overlay.classList.remove('open'); };
    overlay.addEventListener('click', (e) => { if(e.target === overlay) closeLightbox(); });
    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLightbox(); });
    function openLightbox(src, alt, caption){
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightboxCaption.textContent = caption || '';
      overlay.classList.add('open');
    }
    galleryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        openLightbox(link.getAttribute('href'), link.querySelector('img').alt, link.dataset.caption);
      });
    });
    slidePhotos.forEach(img => {
      img.addEventListener('click', () => {
        const cap = img.closest('.gallery-slideshow').querySelector('figcaption');
        openLightbox(img.currentSrc || img.src, img.alt, cap ? cap.textContent : '');
      });
    });
  }

  // School Life slideshows: change by themselves every 3.5s (CSS timing bar), arrows / dots / swipe, pause on hover
  document.querySelectorAll('.gallery-slideshow').forEach(box => {
    const slides = [...box.querySelectorAll('.gs-slide')];
    const dots = [...box.querySelectorAll('.gs-dots button')];
    if(slides.length < 2) return;
    let current = 0;
    function show(n){
      current = (n + slides.length) % slides.length;
      slides.forEach((sl,i)=>{
        sl.classList.toggle('active', i === current);
        sl.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      });
      dots.forEach((d,i)=> d.classList.toggle('active', i === current));
    }
    slides.forEach(sl=>{
      sl.querySelector('.gs-progress').addEventListener('animationend', ()=> show(current + 1));
    });
    box.querySelector('.gs-next').addEventListener('click', ()=> show(current + 1));
    box.querySelector('.gs-prev').addEventListener('click', ()=> show(current - 1));
    dots.forEach((d,i)=> d.addEventListener('click', ()=> show(i)));
    const pause = ()=> box.classList.add('paused');
    const resume = ()=> box.classList.remove('paused');
    box.addEventListener('mouseenter', pause);
    box.addEventListener('mouseleave', resume);
    box.addEventListener('focusin', pause);
    box.addEventListener('focusout', resume);
    let x0 = null;
    box.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; }, {passive:true});
    box.addEventListener('touchend', e=>{
      if(x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if(Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      x0 = null;
    }, {passive:true});
  });
  // curriculum accordion — one panel open at a time, animated height
  document.querySelectorAll('.curr-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.curr-trigger').forEach(other => {
        other.setAttribute('aria-expanded', 'false');
        other.nextElementSibling.style.maxHeight = null;
      });
      if(!isOpen){
        btn.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });
  });

  // ============================================
  // ADMISSION SECTION — WhatsApp & Email enquiry
  // ============================================
  (function(){
    const nameInput = document.getElementById('admFullName');
    const childInput = document.getElementById('admChildName');
    const classInput = document.getElementById('admClass');
    const locationInput = document.getElementById('admLocation');
    const note = document.getElementById('admFormNote');
    const waAdminBtn = document.getElementById('btnWaAdmin');
    const waOfficeBtn = document.getElementById('btnWaOffice');
    const emailBtn = document.getElementById('btnEmailAdm');
    if(!nameInput || !note) return;

    function showNote(){
      note.classList.add('show');
      if(!nameInput.value.trim()) nameInput.focus();
      else if(locationInput) locationInput.focus();
    }
    function hideNote(){
      note.classList.remove('show');
    }
    function refreshNote(){
      if(nameInput.value.trim() && (!locationInput || locationInput.value)) hideNote();
    }
    nameInput.addEventListener('input', refreshNote);
    locationInput?.addEventListener('change', refreshNote);

    function buildWhatsAppMessage(fullName, childName, className, location){
      const lines = [];
      if(location) lines.push('Location: ' + location);
      if(childName) lines.push("Child's Name: " + childName);
      if(className) lines.push('Class Applying For: ' + className);
      const parts = [
        'Hello, my name is ' + fullName + '. I would like to make an enquiry regarding admission for my child/children at Success Private School.'
      ];
      if(lines.length) parts.push(lines.join('\n'));
      parts.push('Kindly provide me with information about the admission process, admission requirements, fees, and any other relevant details.');
      parts.push('Thank you.');
      return parts.join('\n\n');
    }

    function buildEmailBody(fullName, childName, className, location){
      const lines = [];
      if(location) lines.push('Location: ' + location);
      if(childName) lines.push("Child's Name: " + childName);
      if(className) lines.push('Class Applying For: ' + className);
      const parts = [
        'Dear Success Private School,',
        'My name is ' + fullName + ', and I would like to make an enquiry regarding admission for my child/children.'
      ];
      if(lines.length) parts.push(lines.join('\n'));
      parts.push('Kindly provide me with information about the admission process, admission requirements, fees, and any other relevant details.');
      parts.push('Thank you.');
      parts.push('Kind regards,\n' + fullName);
      return parts.join('\n\n');
    }

    function getFormValues(){
      return {
        fullName: nameInput.value.trim(),
        childName: childInput ? childInput.value.trim() : '',
        className: classInput ? classInput.value.trim() : '',
        location: locationInput ? locationInput.value.trim() : ''
      };
    }

    function openWhatsApp(number){
      const v = getFormValues();
      if(!v.fullName || !v.location){ showNote(); return; }
      const message = buildWhatsAppMessage(v.fullName, v.childName, v.className, v.location);
      const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener');
    }

    waAdminBtn?.addEventListener('click', () => openWhatsApp('2347031302021'));
    waOfficeBtn?.addEventListener('click', () => openWhatsApp('2347036209278'));

    emailBtn?.addEventListener('click', () => {
      const v = getFormValues();
      if(!v.fullName || !v.location){ showNote(); return; }
      const subject = 'Admission Enquiry — Success Private School (' + v.location + ')';
      const body = buildEmailBody(v.fullName, v.childName, v.className, v.location);
      window.location.href = 'mailto:successruth70@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  })();

// ============================================
// CONTACT PAGE — simple enquiry form (mailto)
// ============================================
(function(){
  const nameInput = document.getElementById('ctFullName');
  const emailInput = document.getElementById('ctEmail');
  const messageInput = document.getElementById('ctMessage');
  const note = document.getElementById('ctFormNote');
  const sendBtn = document.getElementById('btnCtSend');
  if(!nameInput || !note || !sendBtn) return;

  function showNote(){
    note.classList.add('show');
    nameInput.focus();
  }
  nameInput.addEventListener('input', () => {
    if(nameInput.value.trim()) note.classList.remove('show');
  });

  sendBtn.addEventListener('click', () => {
    const fullName = nameInput.value.trim();
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    if(!fullName){ showNote(); return; }
    const subject = 'Enquiry from ' + fullName + ' — Success Private School Website';
    const bodyParts = [
      'Name: ' + fullName,
      email ? 'Email: ' + email : '',
      '',
      message || '(No message entered)'
    ].filter(Boolean);
    window.location.href = 'mailto:successruth70@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyParts.join('\n'));
  });
})();

// Home hero slideshow: 4.5s per slide (driven by the CSS timing bar), pauses on hover/focus, swipe on phones
(function(){
  const slider = document.querySelector('.hero-slider');
  if(!slider) return;
  const slides = [...slider.querySelectorAll('.hero-slide')];
  const dots = [...slider.querySelectorAll('.hero-dots button')];
  let current = 0;
  function show(n){
    current = (n + slides.length) % slides.length;
    slides.forEach((s,i)=>{
      s.classList.toggle('active', i === current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
    });
    dots.forEach((d,i)=> d.classList.toggle('active', i === current));
  }
  slider.querySelectorAll('.hero-progress').forEach(bar=>{
    bar.addEventListener('animationend', ()=> show(current + 1));
  });
  slider.querySelector('.hero-next').addEventListener('click', ()=> show(current + 1));
  slider.querySelector('.hero-prev').addEventListener('click', ()=> show(current - 1));
  dots.forEach((d,i)=> d.addEventListener('click', ()=> show(i)));
  const pause = ()=> slider.classList.add('paused');
  const resume = ()=> slider.classList.remove('paused');
  slider.addEventListener('mouseenter', pause);
  slider.addEventListener('mouseleave', resume);
  slider.addEventListener('focusin', pause);
  slider.addEventListener('focusout', resume);
  let x0 = null;
  slider.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; }, {passive:true});
  slider.addEventListener('touchend', e=>{
    if(x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if(Math.abs(dx) > 45) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  }, {passive:true});
})();

// Page loader (rolling logo ring): shows when any page opens, and again when you click through to another page
(function(){
  const pre = document.getElementById('preloader');
  const root = document.documentElement;
  if(!pre){ root.classList.remove('preloading'); return; }
  const t0 = performance.now();
  function reveal(){
    const wait = Math.max(0, 900 - (performance.now() - t0));
    setTimeout(()=>{ pre.classList.remove('show'); pre.classList.add('done'); root.classList.remove('preloading'); }, wait);
  }
  if(document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal);
  // coming back with the browser Back button: make sure the loader is not stuck on screen
  window.addEventListener('pageshow', (e)=>{ if(e.persisted){ pre.classList.remove('show'); pre.classList.add('done'); root.classList.remove('preloading'); } });

  // show the loader as soon as an internal page link is clicked
  document.addEventListener('click', (e)=>{
    const a = e.target.closest && e.target.closest('a[href]');
    if(!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if(a.target && a.target !== '_self') return;
    if(a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if(url.origin !== location.origin && location.protocol !== 'file:') return;
    if(!/^(https?|file):$/.test(url.protocol)) return;
    if(url.pathname === location.pathname && url.search === location.search) return; // same page / #anchor
    e.preventDefault();
    pre.classList.remove('done');
    pre.classList.add('show');
    setTimeout(()=>{ location.href = a.href; }, 350);
  });
})();


// Home "Our School" photo slideshow: always slides forward (never back and forth) every 4.7s, arrows + swipe, pauses on hover/touch
(function(){
  const box = document.getElementById('introShow');
  if(!box) return;
  const track = box.querySelector('.intro-track');
  const realSlides = [...track.querySelectorAll('.intro-slide')];
  const N = realSlides.length;
  if(!N) return;
  // a copy of the first slide sits after the last one so the loop keeps moving forward
  if(N > 1){
    const clone = realSlides[0].cloneNode(true);
    clone.classList.remove('active');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  }
  const all = [...track.querySelectorAll('.intro-slide')];
  const INTERVAL = 4700;
  let index = 0, timer = null;
  function place(i, animate){
    track.classList.toggle('no-anim', !animate);
    track.style.transform = 'translateX(' + (-100 * i) + '%)';
  }
  function paint(){
    all.forEach((s,i)=>{
      s.classList.toggle('active', i === index);
      s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      if(i === index){ const im = s.querySelector('img'); if(im) im.loading = 'eager'; }
    });
  }
  function snapToStart(){
    index = 0;
    place(0, false);
    paint();
    void track.offsetWidth;
  }
  function next(){
    if(N < 2) return;
    if(index >= N) snapToStart();
    index += 1;
    place(index, true);
    paint();
  }
  function prev(){
    if(N < 2) return;
    if(index >= N) snapToStart();
    if(index === 0){
      index = N;
      place(N, false);
      void track.offsetWidth;
    }
    index -= 1;
    place(index, true);
    paint();
  }
  track.addEventListener('transitionend', e=>{
    if(e.target === track && index >= N) snapToStart();
  });
  function start(){ stop(); if(reduceMotion || N < 2) return; timer = setInterval(next, INTERVAL); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }
  box.querySelector('.intro-next').addEventListener('click', ()=>{ next(); start(); });
  box.querySelector('.intro-prev').addEventListener('click', ()=>{ prev(); start(); });
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', start);
  let x0 = null;
  box.addEventListener('touchstart', e=>{ x0 = e.touches[0].clientX; stop(); }, {passive:true});
  box.addEventListener('touchend', e=>{
    if(x0 !== null){
      const dx = e.changedTouches[0].clientX - x0;
      if(Math.abs(dx) > 40){ if(dx < 0) next(); else prev(); }
    }
    x0 = null; start();
  }, {passive:true});
  paint();
  start();
})();
