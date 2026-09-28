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
      }, 5000 + boxIndex * 400);
    });
  }

  // simple lightbox for the gallery
  const galleryLinks = document.querySelectorAll('.gallery-item');
  if(galleryLinks.length){
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
    galleryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        lightboxImg.src = link.getAttribute('href');
        lightboxImg.alt = link.querySelector('img').alt || '';
        lightboxCaption.textContent = link.dataset.caption || '';
        overlay.classList.add('open');
      });
    });
  }
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
    const note = document.getElementById('admFormNote');
    const waAdminBtn = document.getElementById('btnWaAdmin');
    const waOfficeBtn = document.getElementById('btnWaOffice');
    const emailBtn = document.getElementById('btnEmailAdm');
    if(!nameInput || !note) return;

    function showNote(){
      note.classList.add('show');
      nameInput.focus();
    }
    function hideNote(){
      note.classList.remove('show');
    }
    nameInput.addEventListener('input', () => {
      if(nameInput.value.trim()) hideNote();
    });

    function buildWhatsAppMessage(fullName, childName, className){
      const lines = [];
      if(childName) lines.push("Child's Name: " + childName);
      if(className) lines.push('Class Applying For: ' + className);
      const parts = [
        'Hello, my name is ' + fullName + '. I would like to make an enquiry regarding admission for my child/children at Success Private Schools.'
      ];
      if(lines.length) parts.push(lines.join('\n'));
      parts.push('Kindly provide me with information about the admission process, admission requirements, fees, and any other relevant details.');
      parts.push('Thank you. I look forward to your response.');
      return parts.join('\n\n');
    }

    function buildEmailBody(fullName, childName, className){
      const lines = [];
      if(childName) lines.push("Child's Name: " + childName);
      if(className) lines.push('Class Applying For: ' + className);
      const parts = [
        'Dear Success Private Schools,',
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
        className: classInput ? classInput.value.trim() : ''
      };
    }

    function openWhatsApp(number){
      const v = getFormValues();
      if(!v.fullName){ showNote(); return; }
      const message = buildWhatsAppMessage(v.fullName, v.childName, v.className);
      const url = 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener');
    }

    waAdminBtn?.addEventListener('click', () => openWhatsApp('2347031302021'));
    waOfficeBtn?.addEventListener('click', () => openWhatsApp('2347036209278'));

    emailBtn?.addEventListener('click', () => {
      const v = getFormValues();
      if(!v.fullName){ showNote(); return; }
      const subject = 'Admission Enquiry — Success Private Schools';
      const body = buildEmailBody(v.fullName, v.childName, v.className);
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
    const subject = 'Enquiry from ' + fullName + ' — Success Private Schools Website';
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

// Home page loader: show the rolling logo ring briefly, then reveal the page and start the hero animation
(function(){
  const pre = document.getElementById('preloader');
  const root = document.documentElement;
  if(!pre){ root.classList.remove('preloading'); return; }
  const t0 = performance.now();
  function reveal(){
    const wait = Math.max(0, 900 - (performance.now() - t0));
    setTimeout(()=>{ pre.classList.add('done'); root.classList.remove('preloading'); }, wait);
  }
  if(document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal);
})();
