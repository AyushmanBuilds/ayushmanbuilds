(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  // Header
  const header = $('.site-header');
  const menuToggle = $('.menu-toggle');
  const nav = $('.nav-links');
  const serviceNav = $('.nav-services');
  const serviceToggle = $('.nav-services-toggle');


  // Theme system: light by default, dark mode stays persistent per device.
  const themeToggle = $('.theme-toggle');
  const root = document.documentElement;
  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    root.dataset.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('ab-theme', isDark ? 'dark' : 'light');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', isDark ? '#05070b' : '#f6f9ff');
  };
  applyTheme(localStorage.getItem('ab-theme') === 'dark' ? 'dark' : 'light');
  themeToggle?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  const updateHeader = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    const btn = $('.back-top');
    if (btn) btn.classList.toggle('show', window.scrollY > 500);
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, {passive:true});

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }
  $$('.nav-links > a').forEach(a => a.addEventListener('click', () => {
    nav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded','false');
  }));
  if (serviceToggle && serviceNav) {
    serviceToggle.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 820px)').matches) {
        e.preventDefault();
        serviceNav.classList.toggle('open');
      }
    });
  }

  // Mobile active state
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-links a[data-page]').forEach(a => {
    if (a.dataset.page === path) a.classList.add('active');
  });

  // Reveal
  const reveal = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12});
    reveal.forEach(el => io.observe(el));
  } else reveal.forEach(el => el.classList.add('in'));

  // Animated counters
  const counters = $$('.count');
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target, target = Number(el.dataset.count || 0), suffix = el.dataset.suffix || '';
        const start = performance.now(), duration = 1300;
        const tick = now => {
          const p = Math.min(1, (now-start)/duration);
          const eased = 1 - Math.pow(1-p,3);
          el.textContent = Math.round(target*eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, {threshold:.4});
    counters.forEach(el => cio.observe(el));
  }

  // Back to top
  const back = $('.back-top');
  if (back) back.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  // Cursor glow
  if (!window.matchMedia('(pointer: coarse)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    let mx = innerWidth/2, my = innerHeight/2, gx = mx, gy = my;
    window.addEventListener('pointermove', e => { mx=e.clientX; my=e.clientY; }, {passive:true});
    const render = () => {
      gx += (mx-gx)*.08; gy += (my-gy)*.08;
      glow.style.left=gx+'px'; glow.style.top=gy+'px';
      requestAnimationFrame(render);
    };
    render();
  }

  // Tilt cards
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !window.matchMedia('(pointer: coarse)').matches) {
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        card.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) translateY(-5px)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform='');
    });
  }

  // FAQ
  $$('.faq-item').forEach(item => {
    const q = $('.faq-q', item);
    q?.addEventListener('click', () => {
      const open = item.classList.contains('open');
      $$('.faq-item').forEach(i => i.classList.remove('open'));
      if (!open) item.classList.add('open');
    });
  });

  // Portfolio filters + modal
  const filters = $$('.filter');
  const projects = $$('.project-card');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projects.forEach(card => {
      const show = filter==='all' || card.dataset.cat===filter;
      card.style.display = show ? '' : 'none';
    });
  }));

  const modal = $('.project-modal');
  const modalImg = $('.modal-shot img');
  const modalTitle = $('.modal-title');
  const modalDesc = $('.modal-desc');
  const modalTag = $('.modal-tag');
  const modalVisit = $('.modal-visit');
  if (modal) {
    $$('.project-card').forEach(card => card.addEventListener('click', () => {
      const img = $('.project-image', card);
      modalImg.src = img?.src || '';
      modalImg.alt = img?.alt || '';
      modalTitle.textContent = card.dataset.title || '';
      modalDesc.textContent = card.dataset.desc || '';
      modalTag.textContent = card.dataset.tag || '';
      if (card.dataset.live && card.dataset.live !== '#') {
        modalVisit.href = card.dataset.live;
        modalVisit.style.display='';
      } else modalVisit.style.display='none';
      modal.classList.add('open');
      document.body.style.overflow='hidden';
    }));
    const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow=''; };
    $('.modal-close', modal)?.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target===modal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });
  }

  // Contact form -> WhatsApp handoff (static-site safe)
  const form = $('#project-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name') || '';
      const company = data.get('company') || '';
      const email = data.get('email') || '';
      const service = data.get('service') || '';
      const budget = data.get('budget') || '';
      const brief = data.get('brief') || '';
      const message =
        `Hello Ayushmanbuilds,%0A%0A`+
        `Name: ${encodeURIComponent(name)}%0A`+
        `Company: ${encodeURIComponent(company)}%0A`+
        `Email: ${encodeURIComponent(email)}%0A`+
        `Service: ${encodeURIComponent(service)}%0A`+
        `Budget: ${encodeURIComponent(budget)}%0A`+
        `Project brief: ${encodeURIComponent(brief)}`;
      const success = $('#form-success');
      if (success) {
        success.classList.add('show');
        success.textContent = 'Your project brief is ready. WhatsApp will open so you can send it directly.';
      }
      window.open(`https://wa.me/918018017529?text=${message}`,'_blank','noopener');
    });
  }

  // Lightweight Three.js scene
  const canvas = $('#hero-canvas');
  if (canvas && window.THREE && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(44, canvas.clientWidth/canvas.clientHeight, .1, 100);
    camera.position.set(0,0,7);
    const renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
    renderer.setSize(canvas.clientWidth,canvas.clientHeight,false);
    const group = new THREE.Group();
    scene.add(group);

    const geo = new THREE.IcosahedronGeometry(1.1,1);
    const mat = new THREE.MeshPhysicalMaterial({
      color:0x2a7fff, metalness:.45, roughness:.24, transparent:true, opacity:.55,
      emissive:0x0e3b8a, emissiveIntensity:.25
    });
    const core = new THREE.Mesh(geo,mat);
    group.add(core);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({color:0x83c7ff,transparent:true,opacity:.32})
    );
    group.add(wire);

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.75,.018,12,180),
      new THREE.MeshBasicMaterial({color:0x6bc2ff,transparent:true,opacity:.22})
    );
    torus.rotation.x=.95; group.add(torus);

    const particles = new THREE.BufferGeometry();
    const count = 180;
    const pos = new Float32Array(count*3);
    for(let i=0;i<count*3;i++) pos[i]=(Math.random()-.5)*8;
    particles.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const points = new THREE.Points(particles,new THREE.PointsMaterial({color:0x6db9ff,size:.015,transparent:true,opacity:.55}));
    scene.add(points);

    const light = new THREE.PointLight(0x338dff,4,12); light.position.set(3,2,4); scene.add(light);
    const light2 = new THREE.PointLight(0x31d6ff,2.3,10); light2.position.set(-3,-1,3); scene.add(light2);

    let targetX=0,targetY=0,px=0,py=0;
    canvas.parentElement.addEventListener('pointermove',e=>{
      const r=canvas.getBoundingClientRect();
      targetX=(e.clientX-r.left)/r.width-.5;
      targetY=(e.clientY-r.top)/r.height-.5;
    },{passive:true});

    const resize=()=>{
      const w=canvas.clientWidth,h=canvas.clientHeight;
      renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    };
    window.addEventListener('resize',resize); resize();

    const clock=new THREE.Clock();
    const loop=()=>{
      const t=clock.getElapsedTime();
      px += (targetX-px)*.03; py += (targetY-py)*.03;
      group.rotation.y = t*.18 + px*.24;
      group.rotation.x = Math.sin(t*.5)*.12 + py*.15;
      torus.rotation.z=t*.16;
      points.rotation.y=t*.025;
      core.scale.setScalar(1+Math.sin(t*1.1)*.035);
      renderer.render(scene,camera);
      requestAnimationFrame(loop);
    };
    loop();
  }

  // Testimonials carousel
  const rotator = $('.testimonial-rotator');
  if (rotator) {
    const quotes = JSON.parse(rotator.dataset.quotes || '[]');
    const quoteText=$('.rot-quote',rotator), quoteName=$('.rot-name',rotator), quoteBiz=$('.rot-biz',rotator), dots=$('.rot-dots',rotator);
    let index=0;
    const paint=()=>{
      const q=quotes[index%quotes.length]; if(!q)return;
      quoteText.textContent=`“${q.text}”`; quoteName.textContent=q.name; quoteBiz.textContent=q.biz;
      dots && (dots.innerHTML=quotes.map((_,i)=>`<button type="button" aria-label="Show testimonial ${i+1}" class="${i===index?'active':''}"></button>`).join(''));
      $$('.rot-dots button',rotator).forEach((b,i)=>b.addEventListener('click',()=>{index=i;paint()}));
    };
    paint();
    setInterval(()=>{index=(index+1)%quotes.length;paint()},5600);
  }
})();

/* =========================================================
   Service capability animation — all six items visible, one active
   ========================================================= */
(function initServiceCapabilityStages(){
  const stages = document.querySelectorAll('[data-feature-stage]');
  if (!stages.length) return;

  stages.forEach(stage => {
    const sourceItems = Array.from(document.querySelectorAll('.feature-grid .feature')).map((item, index) => ({
      title: item.querySelector('strong')?.textContent.trim() || `Feature ${String(index + 1).padStart(2,'0')}`,
      desc: item.querySelector('span:not(.feature-icon)')?.textContent.trim() || '',
      number: String(index + 1).padStart(2,'0')
    })).slice(0, 6);

    if (!sourceItems.length) return;

    const list = stage.querySelector('[data-feature-list]');
    const indexEl = stage.querySelector('[data-feature-index]');
    const progress = stage.querySelector('[data-feature-progress]');
    if (!list || !indexEl || !progress) return;

    list.innerHTML = sourceItems.map((item, i) => `
      <div class="feature-stage-item${i === 0 ? ' is-active' : ''}" data-feature-stage-item="${i}" role="group" aria-label="${item.title}">
        <span class="feature-stage-number">${item.number}</span>
        <span class="feature-stage-copy">
          <strong class="feature-stage-title">${item.title}</strong>
          <span class="feature-stage-desc">${item.desc}</span>
        </span>
        <span class="feature-stage-signal" aria-hidden="true"></span>
      </div>
    `).join('');

    const items = Array.from(list.querySelectorAll('[data-feature-stage-item]'));
    let activeIndex = 0;
    let timer = null;
    const cycleMs = 1900;

    const render = (nextIndex, animate = true) => {
      activeIndex = (nextIndex + items.length) % items.length;
      items.forEach((item, i) => item.classList.toggle('is-active', i === activeIndex));
      indexEl.textContent = String(activeIndex + 1).padStart(2,'0');
      progress.style.width = `${((activeIndex + 1) / items.length) * 100}%`;
      if (animate) {
        progress.animate([
          { transform: 'scaleX(0)' },
          { transform: 'scaleX(1)' }
        ], { duration: cycleMs, easing: 'linear' });
      }
    };

    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => render(activeIndex + 1), cycleMs);
    };
    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => {
        stop();
        render(i, false);
      });
      item.addEventListener('focusin', () => {
        stop();
        render(i, false);
      });
    });

    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', () => {
      render(activeIndex, false);
      start();
    });
    stage.addEventListener('focusin', stop);
    stage.addEventListener('focusout', e => {
      if (!stage.contains(e.relatedTarget)) start();
    });

    render(0, false);
    start();
  });
})();


/* =========================================================
   Home services — Ferris-wheel scroll motion
   Rows ride a big circular arc as they pass the viewport centre,
   the background wheel turns with scroll, gondolas stay upright.
   ========================================================= */
(function initFerrisServices(){
  const wrap = document.querySelector('[data-ferris]');
  if (!wrap) return;
  const rows = Array.from(wrap.querySelectorAll('.home-service-row'));
  const cars = Array.from(wrap.querySelectorAll('.ferris-car'));
  if (rows.length < 2) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const small  = window.matchMedia('(max-width: 820px)');
  const clamp  = (v, a, b) => Math.min(b, Math.max(a, v));
  let ticking = false;

  const reset = () => {
    rows.forEach(r => { r.style.transform = ''; r.style.opacity = ''; r.classList.remove('is-active'); });
    wrap.style.setProperty('--ferris-rot', '0deg');
  };

  const update = () => {
    ticking = false;
    if (reduce.matches) { reset(); return; }

    const vh  = window.innerHeight;
    const mid = vh / 2;
    const isSmall = small.matches;

    // Tunables
    const R      = isSmall ? 520 : 820;    // arc radius (px)
    const amp    = isSmall ? .07 : .42;    // how far rows swing sideways
    const sway   = isSmall ? .8  : 2.2;    // max gondola tilt (deg)

    const centers = rows.map(r => {
      const b = r.getBoundingClientRect();
      return b.top + b.height / 2;
    });

    rows.forEach((row, i) => {
      const d    = centers[i] - mid;                      // + below centre, − above
      const th   = clamp(d / R, -1.1, 1.1);               // angle on the wheel
      const x    = -R * amp * (1 - Math.cos(th));         // slide along the arc
      const tilt = clamp(d / vh, -1, 1) * sway;           // gentle gondola sway
      const away = Math.min(Math.abs(d) / (vh * .95), 1);
      row.style.transform = `translate3d(${x.toFixed(1)}px,0,0) rotate(${tilt.toFixed(2)}deg)`;
      row.style.opacity   = (1 - away * .5).toFixed(3);
    });

    // Fractional index of the row currently at the viewport centre
    const n = rows.length;
    let f;
    if (mid <= centers[0]) {
      f = (mid - centers[0]) / (centers[1] - centers[0]);
    } else if (mid >= centers[n - 1]) {
      f = (n - 1) + (mid - centers[n - 1]) / (centers[n - 1] - centers[n - 2]);
    } else {
      f = 0;
      for (let i = 0; i < n - 1; i++) {
        if (mid >= centers[i] && mid < centers[i + 1]) {
          f = i + (mid - centers[i]) / (centers[i + 1] - centers[i]);
          break;
        }
      }
    }
    f = clamp(f, -.6, n - 1 + .6);
    wrap.style.setProperty('--ferris-rot', (-f * 60).toFixed(2) + 'deg');

    const active = clamp(Math.round(f), 0, n - 1);
    rows.forEach((r, i) => r.classList.toggle('is-active', i === active));
    cars.forEach((c, i) => c.classList.toggle('on', i === active));
  };

  const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  // Only do work while the section is near the screen
  let listening = false;
  const on  = () => { if (listening) return; listening = true;  window.addEventListener('scroll', request, {passive:true}); window.addEventListener('resize', request); request(); };
  const off = () => { if (!listening) return; listening = false; window.removeEventListener('scroll', request); window.removeEventListener('resize', request); };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? on() : off()), {rootMargin:'300px 0px'}).observe(wrap);
  } else on();

  reduce.addEventListener?.('change', request);
  small.addEventListener?.('change', () => { reset(); request(); });
  window.addEventListener('load', request);
})();

/* CITY:START */
/* Berhampur city scene — only animate while it is on screen */
(function initCityScene(){
  const sec = document.getElementById('berhampur-seo');
  if (!sec || !('IntersectionObserver' in window)) { sec && sec.classList.add('is-live'); return; }
  new IntersectionObserver(es => es.forEach(e => sec.classList.toggle('is-live', e.isIntersecting)), {rootMargin:'120px 0px'}).observe(sec);
})();

/* CITY:END */