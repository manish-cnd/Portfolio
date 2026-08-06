/* ============================================
   PORTFOLIO — SCRIPT.JS
   All Interactivity, Animations & Theme Toggle
   ============================================ */

/* ---- Theme Toggle (Dark / Light Mode) ---- */
(function () {
  const html = document.documentElement;
  const btn  = document.getElementById('theme-toggle');

  // Load saved preference, default = dark
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next    = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);

    // Animate the button on click
    btn.style.transform = 'rotate(360deg) scale(1.2)';
    setTimeout(() => { btn.style.transform = ''; }, 400);
  });
})();


/* ---- Navbar: Scroll + Hamburger + Active Link ---- */
(function () {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const allLinks  = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
    updateActiveLink();
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  allLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  function updateActiveLink() {
    const sections = ['hero', 'about', 'skills', 'concepts', 'projects', 'experience', 'contact'];
    let current = '';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 100) current = id;
    });
    allLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
})();


/* ---- Typed Text Effect ---- */
(function () {
  const phrases = [
    'ECE Student',
    'Full Stack Developer',
    'ML Enthusiast',
    'FPGA Developer',
    'Problem Solver',
    'Open Source Contributor',
  ];
  const el = document.getElementById('typed-text');
  if (!el) return;

  let phraseIdx = 0, charIdx = 0, deleting = false, pauseFrames = 0;

  function type() {
    const phrase = phrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = phrase.substring(0, charIdx);
      if (charIdx === phrase.length) { deleting = true; pauseFrames = 55; }
    } else {
      if (pauseFrames > 0) { pauseFrames--; setTimeout(type, 18); return; }
      charIdx--;
      el.textContent = phrase.substring(0, charIdx);
      if (charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 38 : 78);
  }
  setTimeout(type, 800);
})();


/* ---- Intersection Observer: Fade-up ---- */
(function () {
  const fadeEls = document.querySelectorAll(
    '.section-header, .about-text, .about-card-grid, .skill-category, ' +
    '.project-card, .contact-info, .contact-form, .footer, .concept-block'
  );
  fadeEls.forEach(el => el.classList.add('fade-up'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => obs.observe(el));
})();


/* ---- Skill Bar Animation ---- */
/*
 * FIX: We now observe the parent .skill-category card (big, reliable)
 * instead of each tiny 4px bar (unreliable with threshold).
 * When a category card scrolls into view, all bars inside animate
 * with a small stagger so they fill in left-to-right sequentially.
 */
(function () {
  const categories = document.querySelectorAll('.skill-category');

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fills = e.target.querySelectorAll('.skill-fill');
        fills.forEach((fill, i) => {
          // stagger each bar by 80ms so they animate one after another
          setTimeout(() => fill.classList.add('animate'), i * 80);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 }); // 15% of the card visible = trigger

  categories.forEach(cat => obs.observe(cat));
})();


/* ---- Timeline Animation ---- */
(function () {
  const items = document.querySelectorAll('.timeline-item');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  items.forEach(i => obs.observe(i));
})();


/* ---- Concept Chips Stagger Animation ---- */
(function () {
  const blocks = document.querySelectorAll('.concept-block');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const chips = entry.target.querySelectorAll('.concept-chip');
        chips.forEach((chip, i) => {
          chip.style.opacity = '0';
          chip.style.transform = 'translateY(10px)';
          setTimeout(() => {
            chip.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            chip.style.opacity = '1';
            chip.style.transform = 'translateY(0)';
          }, i * 60);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  blocks.forEach(b => obs.observe(b));
})();


/* ---- Project Filter ---- */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('.project-card');

  // Inject card animation keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }
  `;
  document.head.appendChild(style);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      let visibleIdx = 0;
      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;
        if (show) {
          card.style.display = '';
          card.style.animation = `fadeInCard 0.4s ease ${visibleIdx * 0.07}s both`;
          visibleIdx++;
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();


/* ---- About Cards Stagger ---- */
(function () {
  const cards = document.querySelectorAll('.about-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(cards).indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 0.1}s`;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(card => { card.classList.add('fade-up'); obs.observe(card); });
})();


/* ---- Contact Form ---- */
(function () {
  const form      = document.getElementById('contact-form');
  const successEl = document.getElementById('form-success');
  const errorEl   = document.getElementById('form-error');
  const btn       = document.getElementById('btn-submit');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    successEl.classList.remove('show');
    errorEl.classList.remove('show');
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => el.classList.remove('error'));

    const name    = document.getElementById('form-name');
    const email   = document.getElementById('form-email');
    const message = document.getElementById('form-message');
    let valid = true;

    if (!name.value.trim())  { name.classList.add('error'); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { email.classList.add('error'); valid = false; }
    if (!message.value.trim()) { message.classList.add('error'); valid = false; }

    if (!valid) { errorEl.classList.add('show'); return; }

    btn.disabled = true;
    btn.querySelector('.btn-text').textContent = 'Sending...';
    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.querySelector('.btn-text').textContent = 'Send Message';
      successEl.classList.add('show');
      setTimeout(() => successEl.classList.remove('show'), 5000);
    }, 1400);
  });

  document.querySelectorAll('.form-group input, .form-group textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });
})();


/* ---- Download Resume Toast ---- */
(function () {
  const btn = document.getElementById('download-cv');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('📄 Resume will be available soon — connect with me directly!');
  });
})();


/* ---- Toast Helper ---- */
function showToast(msg) {
  const existing = document.querySelector('.portfolio-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'portfolio-toast';
  toast.textContent = msg;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    background:${isDark ? '#1a2234' : '#ffffff'};
    border:1.5px solid rgba(99,102,241,0.35);
    color:${isDark ? '#f1f5f9' : '#0f172a'};
    padding:14px 20px; border-radius:12px;
    font-family:'Inter',sans-serif;
    font-size:0.875rem; font-weight:500;
    box-shadow: 0 8px 32px rgba(0,0,0,${isDark ? '0.4' : '0.12'});
    animation:slideInToast 0.3s ease;
    max-width:320px; line-height:1.5;
  `;

  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes slideInToast { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }';
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}


/* ---- Smooth Scroll ---- */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
})();


/* ---- Skill Chip Tooltips ---- */
(function () {
  document.querySelectorAll('.skill-chip[data-level]').forEach(chip => {
    chip.title = `Proficiency: ${chip.dataset.level}%`;
  });
})();


/* ---- Lightweight Star Particle Background (Hero) ---- */
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hero.querySelector('.hero-bg').appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; }

  function createStars(n = 90) {
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      a: Math.random() * Math.PI * 2, speed: Math.random() * 0.003 + 0.001,
      opacity: Math.random() * 0.5 + 0.15,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const color  = isDark ? '99,102,241' : '79,70,229';
    const baseOp = isDark ? 1 : 0.4;

    stars.forEach(s => {
      s.a += s.speed;
      const o = s.opacity * (0.7 + 0.3 * Math.sin(s.a)) * baseOp;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  createStars();
  draw();
  window.addEventListener('resize', () => { resize(); createStars(); });
})();


/* ============================================================
   ⏳ PRELOADER
   To disable: comment out this entire IIFE block
   AND comment out the #preloader div in index.html
   AND comment out the PRELOADER CSS block in style.css
   ============================================================ */
(function () {
  const preloader = document.getElementById('preloader');
  const bar       = document.getElementById('preloader-bar');
  if (!preloader) return;

  // Animate progress bar from 0% → 100%
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 4;
    if (progress >= 100) { progress = 100; clearInterval(interval); }
    bar.style.width = progress + '%';
  }, 80);

  // Hide preloader once page is fully loaded (min 1.4s for effect)
  const hide = () => {
    clearInterval(interval);
    bar.style.width = '100%';
    setTimeout(() => {
      preloader.classList.add('hidden');
      // Remove from DOM after transition
      setTimeout(() => preloader.remove(), 600);
    }, 300);
  };

  if (document.readyState === 'complete') {
    setTimeout(hide, 1400);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 400));
    // Safety fallback — hide after 4s no matter what
    setTimeout(hide, 4000);
  }
})();
/* END PRELOADER */


/* ============================================================
   🔢 ANIMATED STATS COUNTER
   To disable: comment out this entire IIFE block
   (stats will still show — just as static numbers, no animation)
   ============================================================ */
(function () {
  const statEls = document.querySelectorAll('.stat-number[data-target]');
  if (!statEls.length) return;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current  = Math.floor(easeOutQuart(progress) * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix; // ensure exact end value
    }
    requestAnimationFrame(step);
  }

  // Trigger when the hero-stats section is 30% visible
  const statsContainer = document.querySelector('.hero-stats');
  if (!statsContainer) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        statEls.forEach(el => animateCounter(el));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  obs.observe(statsContainer);
})();
/* END STATS COUNTER */


/* ============================================================
   🖱️ CUSTOM CURSOR
   To disable: comment out this entire IIFE block
   AND comment out the #cursor-dot and #cursor-ring divs in index.html
   AND comment out the CUSTOM CURSOR CSS block in style.css
   ============================================================ */
(function () {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Don't run on touch-only devices
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Ring follows with smooth lag
  function animateRing() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  // Scale ring on click
  document.addEventListener('mousedown', () => { ring.style.transform = 'translate(-50%,-50%) scale(0.8)'; });
  document.addEventListener('mouseup',   () => { ring.style.transform = ''; });
})();
/* END CUSTOM CURSOR */


/* ============================================================
   🤖 PORTFOLIO CHATBOT
   To disable: comment out this entire IIFE block
   AND comment out the #chatbot-widget div in index.html
   AND comment out the CHATBOT CSS block in style.css
   ============================================================ */
(function () {
  const widget      = document.getElementById('chatbot-widget');
  const toggleBtn   = document.getElementById('chat-toggle');
  const closeBtn    = document.getElementById('chat-close');
  const chatWindow  = document.getElementById('chat-window');
  const messagesEl  = document.getElementById('chat-messages');
  const inputEl     = document.getElementById('chat-input');
  const sendBtn     = document.getElementById('chat-send');
  const suggestEl   = document.getElementById('chat-suggestions');
  const notifDot    = document.getElementById('chat-notif');
  const iconOpen    = widget.querySelector('.chat-icon-open');
  const iconClose   = widget.querySelector('.chat-icon-close');

  if (!widget) return;

  let isOpen   = false;
  let isBotTyping = false;

  /* ---- FAQ Knowledge Base ---- */
  const faqs = [
    {
      patterns: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening'],
      response: "Hey there! 👋 I'm the portfolio assistant for Manish. Ask me anything — about skills, projects, education, contact info, or anything else!",
      suggestions: ['Who is Manish?', 'What are his skills?', 'Show me his projects']
    },
    {
      patterns: ['who', 'about', 'introduce', 'tell me about', 'yourself'],
      response: "Manish Tiwari is an Electronics & Communication Engineering (ECE) student with a passion for Full Stack Development, Machine Learning, and Hardware Design (FPGA/Verilog). He bridges the gap between hardware and software — a rare combo! 🚀",
      suggestions: ['What skills does he have?', 'Is he open to internships?', 'What college does he study at?']
    },
    {
      patterns: ['college', 'university', 'study', 'education', 'degree', 'btech', 'b.tech', 'academic'],
      response: "Manish is pursuing a B.Tech in Electronics & Communication Engineering. He's actively maintaining a strong academic record with current CGPA of 9.11. Expected graduation: 2027. 🎓",
      suggestions: ['What subjects does he study?', 'What are his skills?', 'What certifications does he have?']
    },
    {
      patterns: ['skill', 'technology', 'tech stack', 'language', 'tools', 'expertise', 'know'],
      response: "Manish has skills across multiple domains:\n\n💻 Web Dev: React, Node.js, MongoDB, Express\n🐍 Programming: C, C++, Python, JavaScript\n📡 ECE/Hardware: Verilog HDL, FPGA (BASYS 3), Vivado, Cadence\n🤖 ML/AI: PyTorch\n🛠️ Tools: Git, Docker, VS Code, Linux, Google Colab",
      suggestions: ['What ECE skills does he have?', 'What ML tools does he use?', 'Show me his projects']
    },
    {
      patterns: ['ece', 'fpga', 'verilog', 'hardware', 'vlsi', 'basys', 'vivado', 'cadence', 'circuit', 'digital'],
      response: "Manish has strong ECE hardware skills: 📡\n\n• Verilog HDL — digital design & RTL coding\n• FPGA on BASYS 3 — implemented digital circuits, FSMs\n• Vivado Design Suite — synthesis & implementation\n• Cadence (basics) — schematic & simulation\n• Digital Electronics, Communication Systems, Antenna Design, Signal Processing",
      suggestions: ['What software skills does he have?', 'What are his projects?', 'What certifications does he have?']
    },
    {
      patterns: ['machine learning', 'ml', 'ai', 'deep learning', 'pytorch', 'tensorflow', 'data science'],
      response: "Manish is an ML enthusiast! 🤖\n\nHe works with PyTorch, TensorFlow, scikit-learn, and OpenCV. His ML projects include deep learning, vision transformer, KAN layer integration, computer vision and currently working on Under Water Image Enhancement. He's exploring Computer Vision and NLP.",
      suggestions: ['What ML projects has he built?', 'What other skills does he have?', 'Is he open to internships?']
    },
    {
      patterns: ['project', 'built', 'work', 'portfolio', 'app', 'application', 'what has he done'],
      response: "Manish has built some great projects! 🛠️\n\n• 🛒 E-commerce Platform — React, Tailwind CSS\n• 🎯 AquaClarity-UWIE — pytorch, Google Colab, KAN\n• 🌤 Mentorship Platform — React, Node.js, Express.js, MongoDB, socket.io, REST API\n• 📡 ElectroCircuit — React, Zustand, HTML, CSS\n\nCheck the Projects section for full details!",
      suggestions: ['Tell me about the AquaClarity project', 'What ML projects did he do?', 'Is he open to internships?']
    },
    {
      patterns: ['AquaClarity project', 'digital Circuits', 'basys', 'hardware project'],
      response: "Manish integrated KAN layer on an existing under water image enhancement model- AquaClarity to improve enhancement quality! 📡\n\nHe replaced some existing traditional encoder to modern KAN layer. This project demonstrates his ability to understand the architecture of the model.",
      suggestions: ['What other projects does he have?', 'What are his ECE skills?', 'How can I contact him?']
    },
    {
      patterns: ['certificate', 'certification', 'course', 'nptel', 'coursera', 'udemy', 'achievement'],
      response: "Manish's certifications include: 📜\n\n🎓 NPTEL — The Joy of Computing using Python (IIT Madras, Elite+Gold)\n🤖 NPTEL — Programming in modern C++ (IIT Kharagpur, Elite)\n🌐 3D printing (CDAC, Ministry of ELectronics and Information Technology)\n🔷 Remote Sensing(ISRO)\n\nHe also participated in Smart India Hackathon 2024!",
      suggestions: ['What skills does he have?', 'What are his projects?', 'How can I contact him?']
    },
    {
      patterns: ['internship', 'job', 'hire', 'available', 'open to', 'opportunity', 'work with', 'collaborate'],
      response: "Yes! Manish is actively looking for internship opportunities! 🟢\n\nHe's open to:\n• Full Stack Development roles\n• ML/AI internships\n• ECE/Hardware design opportunities\n• Remote or on-site positions\n\nFeel free to reach out via the Contact section or email directly!",
      suggestions: ['How can I contact him?', 'What skills does he have?', 'What is his email?']
    },
    {
      patterns: ['contact', 'reach', 'email', 'connect', 'linkedin', 'github', 'social', 'message'],
      response: "You can reach Manish through: 📬\n\n📧 Email — via the Contact form on this page\n💼 LinkedIn — check the Contact section\n🐙 GitHub — linked in the Contact section\n\nHe typically responds within 24 hours!",
      suggestions: ['Is he open to internships?', 'Who is Manish?', 'What are his projects?']
    },
    {
      patterns: ['github', 'code', 'open source', 'repository', 'repo'],
      response: "Manish's GitHub has all his public projects — you can find the link in the Contact section of this portfolio! 🐙 He regularly pushes code and works on open-source contributions.",
      suggestions: ['What projects has he built?', 'How can I contact him?', 'What skills does he have?']
    },
    {
      patterns: ['operating system', 'os', 'dbms', 'database', 'computer network', 'system design', 'dsa', 'data structure', 'algorithm'],
      response: "Manish has strong CS fundamentals! 💻\n\n• Operating Systems — process management, scheduling\n• DBMS — SQL, normalization, transactions\n• Computer Networks — TCP/IP, OSI model\n• System Design — scalable architecture concepts\n• DSA — strong problem-solving skills",
      suggestions: ['What programming skills does he have?', 'What ML skills does he have?', 'What are his projects?']
    },
    {
      patterns: ['cyber', 'security', 'networking', 'linux'],
      response: "Manish has foundational knowledge in Cyber Security and Linux. He works with Linux and Window-based development environments and understands network security concepts — something he's actively learning more about! 🔐",
      suggestions: ['What are his main skills?', 'What are his projects?', 'Is he open to internships?']
    },
    {
      patterns: ['hobby', 'interest', 'free time', 'passion', 'like', 'love', 'enjoy'],
      response: "Outside of tech, Manish enjoys exploring new technologies, building side project.He also enjoys playing cricket, chess and e-gaming. He's passionate about bridging hardware and software — a true ECE+CS hybrid! ⚡",
      suggestions: ['What projects has he built?', 'What are his skills?', 'Is he open to internships?']
    },
    {
      patterns: ['location', 'where', 'city', 'country', 'india'],
      response: "Manish is based in India 🇮🇳 and is open to both remote and on-site opportunities. He can relocate for the right opportunity!",
      suggestions: ['Is he open to internships?', 'How can I contact him?', 'What are his skills?']
    },
    {
      patterns: ['resume', 'cv', 'download'],
      response: "You can download Manish's resume using the 'Download CV' button in the About section of this portfolio! 📄 It has his full academic background, skills, and project details.",
      suggestions: ['How can I contact him?', 'Is he open to internships?', 'What are his projects?']
    },
    {
      patterns: ['thanks', 'thank you', 'great', 'nice', 'awesome', 'helpful', 'bye', 'goodbye'],
      response: "Happy to help! 😊 Feel free to explore the portfolio and reach out to Manish directly through the Contact section. Good luck! 🚀",
      suggestions: ['Who is Manish?', 'How can I contact him?', 'What are his projects?']
    },
  ];

  const defaultSuggestions = ['Who is Manish?', 'What are his skills?', 'Is he open to internships?', 'How to contact?'];

  /* ---- Utility Functions ---- */
  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.id = 'chat-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    isBotTyping = true;
  }

  function hideTyping() {
    const t = document.getElementById('chat-typing');
    if (t) t.remove();
    isBotTyping = false;
  }

  function setSuggestions(chips) {
    suggestEl.innerHTML = '';
    (chips || defaultSuggestions).forEach(text => {
      const chip = document.createElement('button');
      chip.className = 'chat-chip';
      chip.textContent = text;
      chip.addEventListener('click', () => handleUserMessage(text));
      suggestEl.appendChild(chip);
    });
  }

  function findResponse(query) {
    const q = query.toLowerCase().trim();
    for (const faq of faqs) {
      if (faq.patterns.some(p => q.includes(p))) {
        return faq;
      }
    }
    return {
      response: "Hmm, I'm not sure about that! 🤔 Try asking about Manish's skills, projects, education, certifications, or how to contact him.",
      suggestions: defaultSuggestions
    };
  }

  function handleUserMessage(text) {
    if (!text.trim() || isBotTyping) return;
    addMessage(text, 'user');
    inputEl.value = '';
    suggestEl.innerHTML = '';
    showTyping();

    const result = findResponse(text);
    // Simulate typing delay (800ms - 1400ms based on response length)
    const delay = Math.min(800 + result.response.length * 3, 1600);

    setTimeout(() => {
      hideTyping();
      addMessage(result.response, 'bot');
      setSuggestions(result.suggestions);
    }, delay);
  }

  /* ---- Toggle Chat Window ---- */
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    iconOpen.style.display  = 'none';
    iconClose.style.display = 'flex';
    if (notifDot) notifDot.style.display = 'none';
    inputEl.focus();
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
    iconOpen.style.display  = 'flex';
    iconClose.style.display = 'none';
  }

  toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  sendBtn.addEventListener('click',  () => handleUserMessage(inputEl.value));
  inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleUserMessage(inputEl.value); });

  /* ---- Initial greeting (with delay so preloader finishes first) ---- */
  setTimeout(() => {
    addMessage("👋 Hi! I'm the Portfolio Assistant. Ask me anything about Manish — his skills, projects, education, or how to reach him!", 'bot');
    setSuggestions(defaultSuggestions);
    // Show notif dot after 3 seconds to prompt user to open
    setTimeout(() => {
      if (!isOpen && notifDot) notifDot.style.display = 'block';
    }, 3000);
  }, 2000);

})();
/* END CHATBOT */

