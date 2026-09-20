/* ==========================================================================
   SEVEN DIGITAL — main.js
   Sem dependências. Cada recurso é um módulo independente e degrada bem:
   sem IntersectionObserver, com movimento reduzido ou em telas de toque,
   o site continua totalmente utilizável.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqFine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reduced = function () { return mqReduced.matches; };
  var hasIO = 'IntersectionObserver' in window;
  var raf = window.requestAnimationFrame.bind(window);

  window.__sevenReady = true;

  /* ---------- Header: muda de aparência ao rolar ---------- */
  function headerState() {
    var header = $('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; raf(update); }
    }, { passive: true });
    update();
  }

  /* ---------- Menu mobile: acessível (foco preso, ESC, aria) ---------- */
  function mobileMenu() {
    var toggle = $('.menu-toggle');
    var menu = $('#menu');
    var header = $('.site-header');
    if (!toggle || !menu) return;
    var lastFocus = null;

    function isOpen() { return menu.classList.contains('is-open'); }

    function open() {
      lastFocus = doc.activeElement;
      menu.classList.add('is-open');
      header.classList.add('is-menu-open');
      root.classList.add('menu-lock');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      var first = $('a', menu);
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 60);
    }

    function close(restoreFocus) {
      if (!isOpen()) return;
      menu.classList.remove('is-open');
      header.classList.remove('is-menu-open');
      root.classList.remove('menu-lock');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      if (restoreFocus && lastFocus) lastFocus.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', function () { isOpen() ? close(true) : open(); });

    // Clicar em qualquer link fecha o menu e a rolagem suave segue normalmente
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { close(true); return; }
      if (e.key !== 'Tab') return;
      var items = [toggle].concat($$('a[href]', menu));
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Se a janela crescer para desktop com o menu aberto, fecha
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) {
      if (e.matches) close(false);
    });
  }

  /* ---------- Link ativo na navegação (scroll spy) ---------- */
  function scrollSpy() {
    if (!hasIO) return;
    var map = {
      inicio: 'inicio', confianca: 'inicio', problema: null, solucoes: 'solucoes',
      portfolio: 'portfolio', 'case': 'portfolio', planos: null, processo: 'processo',
      diferenciais: null, orcamento: null, contato: 'contato'
    };
    var links = $$('.nav-desktop a, .menu-list a');
    function setCurrent(id) {
      links.forEach(function (a) {
        if (id && a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setCurrent(map[en.target.id]);
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = doc.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- Scroll reveal ---------- */
  function reveal() {
    // Escalonamento suave dentro de grupos
    $$('[data-stagger]').forEach(function (group) {
      $$('[data-reveal]', group).forEach(function (el, i) {
        if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', ((i % 3) * 0.09).toFixed(2) + 's');
      });
    });

    // Terminada a entrada, o elemento devolve o controle ao próprio CSS
    // (senão o estado "revelado" anula o hover de elevação dos cards).
    function release(el) {
      var delay = (parseFloat(el.style.getPropertyValue('--d')) || 0) * 1000;
      setTimeout(function () {
        el.removeAttribute('data-reveal');
        el.style.removeProperty('--d');
      }, 1000 + delay);
    }

    var els = $$('[data-reveal]');
    if (!hasIO || reduced()) {
      els.forEach(function (el) { el.classList.add('is-visible'); el.removeAttribute('data-reveal'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
          release(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores (somente com números reais) ---------- */
  function counters() {
    var els = $$('.counter');
    if (!els.length) return;
    function fmt(el, v) {
      var pad = parseInt(el.getAttribute('data-pad') || '0', 10);
      var s = String(v);
      while (s.length < pad) s = '0' + s;
      el.textContent = s;
    }
    function final(el) { fmt(el, parseInt(el.getAttribute('data-to'), 10)); }
    if (!hasIO || reduced()) { els.forEach(final); return; }

    els.forEach(function (el) { fmt(el, 0); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var to = parseInt(el.getAttribute('data-to'), 10);
        var start = null;
        var dur = 1400;
        (function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          fmt(el, Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf(step);
        })(performance.now());
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Filtro do portfólio ---------- */
  function projectFilter() {
    var buttons = $$('.filters [data-filter]');
    var cards = $$('.project[data-cat]');
    var status = $('#filter-status');
    if (!buttons.length || !cards.length) return;
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        buttons.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        var shown = 0;
        cards.forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-cat') === f;
          card.hidden = !show;
          if (show) {
            shown++;
            card.classList.add('is-visible');
            card.classList.remove('filter-in');
            void card.offsetWidth; // reinicia a animação
            card.classList.add('filter-in');
          }
        });
        if (status) status.textContent = shown + (shown === 1 ? ' projeto exibido' : ' projetos exibidos');
      });
    });
  }

  /* ---------- Timeline: linha dourada acompanha a rolagem ---------- */
  function timeline() {
    var t = $('[data-timeline]');
    if (!t) return;
    var steps = $$('.step', t);
    var ticking = false;
    function update() {
      ticking = false;
      var r = t.getBoundingClientRect();
      var focal = window.innerHeight * 0.62;
      var p = Math.max(0, Math.min(1, (focal - r.top) / r.height));
      t.style.setProperty('--p', p.toFixed(4));
      steps.forEach(function (s) {
        var n = $('.step-node', s).getBoundingClientRect();
        s.classList.toggle('is-active', n.top + n.height / 2 < focal);
      });
    }
    function onScroll() { if (!ticking) { ticking = true; raf(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- Partículas douradas discretas no hero (canvas) ---------- */
  function particles() {
    var canvas = $('.hero-canvas');
    if (!canvas || reduced() || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = 0, h = 0, pts = [], running = false, inView = true, frame = null;

    function size() {
      var r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(64, (w * h) / 24000));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16 - 0.02,
          r: Math.random() * 1.3 + 0.4, a: Math.random() * 0.5 + 0.2
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(217,169,40,' + p.a + ')';
        ctx.fill();
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          dx = p.x - q.x; dy = p.y - q.y;
          d = dx * dx + dy * dy;
          if (d < 9600) {
            ctx.strokeStyle = 'rgba(217,169,40,' + ((1 - d / 9600) * 0.14).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      frame = raf(draw);
    }

    function start() { if (!running && inView && !doc.hidden) { running = true; frame = raf(draw); } }
    function stop() { running = false; if (frame) { cancelAnimationFrame(frame); frame = null; } }

    size();
    start();
    if (hasIO) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; inView ? start() : stop(); }).observe(host);
    }
    doc.addEventListener('visibilitychange', function () { doc.hidden ? stop() : start(); });
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(size, 200); });
  }

  /* ---------- Parallax sutil por rolagem ---------- */
  function parallax() {
    if (reduced()) return;
    var items = $$('[data-parallax]').map(function (el) {
      return { el: el, k: parseFloat(el.getAttribute('data-parallax')) || 0, ref: el.closest('section') || el.parentElement, vis: !hasIO };
    });
    if (!items.length) return;
    var ticking = false;
    function update() {
      ticking = false;
      var vh = window.innerHeight;
      items.forEach(function (it) {
        if (!it.vis) return;
        var r = it.ref.getBoundingClientRect();
        var off = (r.top + r.height / 2 - vh / 2) * it.k;
        it.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      });
    }
    function onScroll() { if (!ticking) { ticking = true; raf(update); } }
    if (hasIO) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          items.forEach(function (it) { if (it.ref === en.target) it.vis = en.isIntersecting; });
        });
        onScroll();
      });
      var seen = [];
      items.forEach(function (it) { if (seen.indexOf(it.ref) < 0) { seen.push(it.ref); io.observe(it.ref); } });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- Inclinação 3D leve do palco do hero (desktop) ---------- */
  function heroTilt() {
    var stage = $('.visual-stage');
    var hero = $('.hero');
    if (!stage || !hero || reduced() || !mqFine.matches) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, loop = null;
    function tick() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      stage.style.transform = 'rotateY(' + (cx * 5).toFixed(2) + 'deg) rotateX(' + (-cy * 4).toFixed(2) + 'deg)';
      loop = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? raf(tick) : null;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!loop) loop = raf(tick);
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!loop) loop = raf(tick); });
  }

  /* ---------- Glow dourado que segue o cursor + spotlight nos cards ---------- */
  function pointerEffects() {
    if (!mqFine.matches) return;
    doc.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest('.fx');
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    var glow = $('.cursor-glow');
    if (!glow || reduced()) return;
    var x = 0, y = 0, tx = 0, ty = 0, on = false, loop = null;
    function tick() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      glow.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      loop = (Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) ? raf(tick) : null;
    }
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!on) { on = true; x = tx; y = ty; glow.classList.add('is-on'); }
      if (!loop) loop = raf(tick);
    }, { passive: true });
    doc.addEventListener('mouseleave', function () { glow.classList.remove('is-on'); on = false; });
  }

  /* ---------- Inicialização ---------- */
  headerState();
  mobileMenu();
  scrollSpy();
  reveal();
  counters();
  projectFilter();
  timeline();
  particles();
  parallax();
  heroTilt();
  pointerEffects();
})();
