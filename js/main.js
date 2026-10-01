/* Paraíso das Massagens — cenas em ritmo de respiração (GSAP + ScrollTrigger + Lenis + SplitType) */
(() => {
  const doc = document.documentElement;
  const sel = (s, c = document) => c.querySelector(s);
  const selTodos = (s, c = document) => [...c.querySelectorAll(s)];
  const cenas = selTodos('.cena');
  let paradas = [];
  let levarA = (y) => window.scrollTo({ top: y });
  let segura = () => {};
  let libera = () => {};

  selTodos('.frame img').forEach((img) => {
    const f = img.closest('.frame');
    img.addEventListener('error', () => f.classList.add('vazio'));
    img.addEventListener('load', () => f.classList.remove('vazio'));
    if (img.complete && img.naturalWidth === 0) f.classList.add('vazio');
  });

  menu();

  if (!doc.classList.contains('motion') || !(window.gsap && window.ScrollTrigger && window.Lenis)) {
    doc.classList.remove('motion');
    doc.classList.add('sereno');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  // rolagem mais lenta e macia que o normal: o site inteiro "respira"
  const lenis = new Lenis({ lerp: 0.055, wheelMultiplier: 0.75, touchMultiplier: 1.2 });
  lenis.stop();
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  levarA = (y) => lenis.scrollTo(y, { duration: 2.6, easing: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) });
  segura = () => lenis.stop();
  libera = () => lenis.start();
  window.__levarA = levarA;

  const traco = (path) => {
    const L = path.getTotalLength();
    gsap.set(path, { strokeDasharray: L, strokeDashoffset: L });
    return L;
  };

  /* ---------- Preloader: a lótus se desenha e abre pétala por pétala ---------- */
  const petalas = selTodos('.pre-p');
  const comps = petalas.map(traco);
  const base = sel('.pre-base');
  const compBase = traco(base);
  const num = sel('.pre-num span');
  const est = { p: 0 };
  const florescer = () => {
    const n = petalas.length;
    petalas.forEach((pt, k) => {
      const local = gsap.utils.clamp(0, 1, est.p * n - k * 0.85);
      pt.style.strokeDashoffset = comps[k] * (1 - local);
      gsap.set(pt, { rotation: Number(pt.dataset.a) * local, svgOrigin: '0 0' });
    });
    base.style.strokeDashoffset = compBase * (1 - est.p);
    num.textContent = Math.round(est.p * 100);
  };
  florescer();
  const ateSete = (p) => Promise.race([p, new Promise((ok) => setTimeout(ok, 7000))]);
  const fontes = document.fonts ? document.fonts.ready : Promise.resolve();
  const tarefas = [
    fontes,
    new Promise((ok) => (document.readyState === 'complete' ? ok() : addEventListener('load', ok, { once: true }))),
  ].map(ateSete);
  let prontas = 0;
  let tw = gsap.to(est, { p: 0.15, duration: 1.2, ease: 'sine.inOut', onUpdate: florescer });
  tarefas.forEach((t) => t.then(() => {
    prontas++;
    tw.kill();
    tw = gsap.to(est, { p: prontas / tarefas.length, duration: 1.4, ease: 'sine.inOut', onUpdate: florescer });
  }));

  fontes.then(() => {
    if (window.SplitType) selTodos('[data-split]').forEach((n) => new SplitType(n, { types: 'lines,words' }));
    montar();
  });
  Promise.all(tarefas).then(() => gsap.delayedCall(1.5, entrar));

  function entrar() {
    ScrollTrigger.refresh();
    gsap.timeline({ onComplete: () => { sel('.pre').remove(); libera(); } })
      .to(est, { p: 1, duration: 0.8, ease: 'sine.inOut', onUpdate: florescer })
      .to('.pre-lotus', { scale: 1.08, duration: 1.2, ease: 'sine.inOut' }, '+=0.2')
      .to('.pre', { opacity: 0, duration: 1.4, ease: 'sine.inOut' }, '-=0.5')
      .fromTo('.ab-l:nth-child(2)', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'sine.out' }, '-=0.9')
      .to(['.topo', '.prog', '.zap'], { opacity: 1, duration: 1 }, '-=1');
  }

  /* ---------- Cenas ---------- */
  function montar() {
    gsap.matchMedia().add({ desk: '(min-width: 769px)', mob: '(max-width: 768px)' }, (ctx) => {
      const { desk } = ctx.conditions;
      abertura();
      respire();
      massagens();
      objetivos(desk);
      quemCuida();
      agenda(desk);
      final();
    });
    respiracaoComDedo();
    progresso();
  }

  const fixa = (alvo, fim) => ({ trigger: alvo, start: 'top top', end: fim, scrub: 1.6, pin: true, invalidateOnRefresh: true });
  const respira = 'sine.inOut';

  // 1 · As frases entram uma a uma (expandem e assentam) enquanto o fundo esquenta.
  // Saída: uma maré cor de vinho sobe.
  function abertura() {
    const linhas = selTodos('.ab-l');
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: fixa('#abertura', '+=320%') })
      .fromTo('.ab-dica', { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0)
      .fromTo('.calor-1', { opacity: 0 }, { opacity: 1, duration: 1.6 }, 0)
      .fromTo(linhas[1], { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.8, ease: respira }, 0.3)
      .fromTo(linhas[2], { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.8, ease: respira }, 1.2)
      .fromTo('.calor-2', { opacity: 0 }, { opacity: 0.85, duration: 1.4 }, 1.4)
      .fromTo('.ab-sub .word', { opacity: 0 }, { opacity: 1, stagger: 0.04, duration: 0.4 }, 0.5)
      .to({}, { duration: 0.5 })
      .fromTo('.mare', { y: 0 }, { y: () => -sel('.mare').offsetHeight, duration: 1.2, ease: respira });
  }

  // 2 · Cena principal: o círculo cresce (inspira) e encolhe (solta), duas vezes.
  // Saída: o miolo se expande cor-de-rosa até cobrir a tela.
  function respire() {
    const anel = sel('.respiro-scroll');
    const insp = sel('.resp-inspira');
    const solt = sel('.resp-solta');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: fixa('#respire', '+=520%') });
    tl.fromTo('.resp-tit', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 }, 0);
    let t = 0.4;
    for (let ciclo = 0; ciclo < 2; ciclo++) {
      tl.fromTo(insp, { opacity: 0 }, { opacity: 1, duration: 0.25 }, t)
        .fromTo(anel, { scale: 0.42 }, { scale: 1, duration: 1.2, ease: respira, immediateRender: ciclo === 0 }, t)
        .to(insp, { opacity: 0, duration: 0.25 }, t + 1.3)
        .fromTo(solt, { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, t + 1.5)
        .to(anel, { scale: 0.42, duration: 1.2, ease: respira }, t + 1.5)
        .to(solt, { opacity: 0, duration: 0.25 }, t + 2.75);
      t += 3.1;
    }
    tl.fromTo('.resp-dica', { opacity: 1 }, { opacity: 0, duration: 0.3 }, t - 0.4)
      .fromTo('.resp-fim', { opacity: 0 }, { opacity: 1, duration: 0.4 }, t)
      .to({}, { duration: 0.5 })
      .fromTo('.resp-cobre', { scale: 0 }, { scale: () => (Math.hypot(innerWidth, innerHeight) / 5) * 1.1, duration: 1.2, ease: 'power2.in' });
  }

  // Respirar no próprio ritmo: segurar o dedo (ou o mouse) no círculo enche; soltar esvazia.
  function respiracaoComDedo() {
    const alvo = sel('.respiro');
    const dedo = sel('.respiro-dedo');
    const inspirar = () => gsap.to(dedo, { scale: 1.4, duration: 4, ease: respira, overwrite: true });
    const soltar = () => gsap.to(dedo, { scale: 1, duration: 4, ease: respira, overwrite: true });
    alvo.addEventListener('pointerdown', (e) => { alvo.setPointerCapture(e.pointerId); inspirar(); });
    alvo.addEventListener('pointerup', soltar);
    alvo.addEventListener('pointercancel', soltar);
  }

  // 3 · Uma massagem por vez, com a ilustração do material.
  // Saída: duas "pálpebras" fecham devagar sobre a cena.
  function massagens() {
    const itens = selTodos('.mass');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: fixa('#massagens', `+=${itens.length * 115 + 80}%`) });
    tl.fromTo('.mass-tit', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    itens.forEach((it, i) => {
      const t = 0.2 + i * 2;
      const ilu = sel('.ilu', it);
      const palavras = selTodos('.mass-nome .word', it);
      const meta = [sel('.mass-n', it), sel('.mass-dados', it)];
      tl.set(ilu, { opacity: 1, scale: 1 }, t);
      switch (it.dataset.ilu) {
        case 'pedras':
          tl.fromTo(selTodos('.pedra', ilu), { y: -300, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, ease: 'power2.out' }, t);
          selTodos('.vapor', ilu).forEach((v) => { const L = traco(v); tl.fromTo(v, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.6 }, t + 0.7); });
          break;
        case 'bambu':
          tl.fromTo(selTodos('.bambu', ilu), { x: -320, rotation: -18, opacity: 0, transformOrigin: '50% 50%' }, { x: 0, rotation: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power2.out' }, t);
          break;
        case 'ventosa':
          tl.fromTo(selTodos('.copo', ilu), { scale: 0, opacity: 0, transformOrigin: '50% 100%' }, { scale: 1, opacity: 1, stagger: 0.18, duration: 0.6, ease: 'back.out(1.6)' }, t);
          break;
        default:
          selTodos('.fluxo', ilu).forEach((f, k) => { const L = traco(f); tl.fromTo(f, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.9 }, t + k * 0.1); });
      }
      tl.fromTo(palavras, { yPercent: 110, opacity: 1 }, { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: respira }, t + 0.2)
        .fromTo(meta, { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5 }, t + 0.5);
      if (i < itens.length - 1) {
        tl.to(ilu, { opacity: 0, scale: 0.92, duration: 0.5 }, t + 1.5)
          .to(palavras, { yPercent: -110, opacity: 0, stagger: 0.05, duration: 0.5 }, t + 1.5)
          .to(meta, { opacity: 0, duration: 0.4 }, t + 1.5);
      }
    });
    tl.to({}, { duration: 0.4 })
      .fromTo('.palpebra', { scaleY: 0 }, { scaleY: 1, duration: 1, ease: respira });
  }

  // 4 · Os serviços agrupados por objetivo; cada grupo sobe e dá lugar ao próximo.
  // Saída: o tom clareia para rosa.
  function objetivos(desk) {
    const grupos = selTodos('.grupo');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: fixa('#objetivos', '+=340%') });
    tl.fromTo('.obj-tit', { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);
    grupos.forEach((g, i) => {
      const t = 0.2 + i * 1.7;
      const nome = sel('.grupo-nome', g);
      const itens = selTodos('.grupo-itens li', g);
      tl.fromTo(nome, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: respira }, t)
        .fromTo(itens, { opacity: 0, x: desk ? 40 : 20 }, { opacity: 1, x: 0, stagger: 0.12, duration: 0.5, ease: respira }, t + 0.3);
      if (i < grupos.length - 1) {
        tl.to(nome, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.5, ease: respira }, t + 1.3)
          .to(itens, { opacity: 0, x: desk ? -40 : -20, stagger: 0.05, duration: 0.4 }, t + 1.3);
      }
    });
    tl.to({}, { duration: 0.5 })
      .fromTo('.obj-tom', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: respira });
  }

  // 5 · Quem cuida: a foto sobe dentro de um oval e a fala aparece com calma.
  function quemCuida() {
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: fixa('#quem-cuida', '+=280%') })
      .fromTo('.quem-foto .frame', { clipPath: 'inset(100% 0% 0% 0% round 50%)' }, { clipPath: 'inset(0% 0% 0% 0% round 50%)', duration: 1, ease: respira }, 0)
      .fromTo('.quem-foto img', { scale: 1.2 }, { scale: 1, duration: 1.4 }, 0)
      .fromTo('.quem-lotus', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.6)' }, 0.8)
      .fromTo('.quem-tit .word', { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 0.5, ease: respira }, 0.2)
      .fromTo('.quem-nome', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.7)
      .fromTo('.quem-fala .word', { opacity: 0.12 }, { opacity: 1, stagger: 0.03, duration: 0.2 }, 0.9)
      .fromTo('.quem-obs', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 1.9)
      .to({}, { duration: 1.4 });
  }

  // 6 · Como agendar: sobe por cima da cena anterior; a onda liga os três passos.
  function agenda(desk) {
    const onda = sel('.ag-onda path');
    const L = traco(onda);
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: fixa('#como-agendar', '+=240%') });
    tl.fromTo('.ag-tit .word', { yPercent: 110 }, { yPercent: 0, stagger: 0.08, duration: 0.5, ease: respira }, 0);
    if (desk) tl.fromTo(onda, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6 }, 0.3);
    selTodos('.ag-passos li').forEach((li, i) => {
      const t = 0.4 + i * 0.55;
      tl.fromTo(sel('.ag-n', li), { scale: 0 }, { scale: 1, duration: 0.3, ease: 'back.out(1.8)' }, t)
        .fromTo([sel('h3', li), sel('p', li)], { opacity: 0 }, { opacity: 1, stagger: 0.08, duration: 0.3 }, t + 0.1);
    });
    tl.fromTo('.ag-info', { opacity: 0 }, { opacity: 1, duration: 0.4 }, 2.2)
      .to({}, { duration: 0.6 });
  }

  // 7 · O final sobe como um arco.
  function final() {
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '#final', start: 'top bottom', end: 'top 10%', scrub: 1.6 } })
      .fromTo('.cena-final', { clipPath: 'inset(30% 0% 0% 0% round 50% 50% 0% 0% / 30% 30% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0% / 0% 0% 0% 0%)', duration: 1, ease: respira }, 0)
      .fromTo('.final-tit .word', { opacity: 0 }, { opacity: 1, stagger: 0.08, duration: 0.3 }, 0.5);
  }

  /* ---------- Progresso: linha ondulada ---------- */
  function topoDe(sec) {
    const alvo = sec.parentElement.classList.contains('pin-spacer') ? sec.parentElement : sec;
    return alvo.getBoundingClientRect().top + window.scrollY;
  }

  function progresso() {
    const nav = sel('.prog');
    const svg = sel('.prog-svg');
    const linhaBase = sel('.prog-base');
    const cheio = sel('.prog-cheio');
    const pontos = selTodos('.prog-pontos li');
    let comp = 1;

    const desenhar = () => {
      const w = nav.offsetWidth;
      const h = nav.offsetHeight;
      const deitada = w > h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const pts = [];
      for (let k = 0; k <= 90; k++) {
        const t = k / 90;
        pts.push(deitada ? [t * w, h / 2 + (h / 2 - 2) * Math.sin(t * Math.PI * 9)] : [w / 2 + (w / 2 - 5) * Math.sin(t * Math.PI * 6), t * h]);
      }
      const d = `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;
      linhaBase.setAttribute('d', d);
      cheio.setAttribute('d', d);
      comp = cheio.getTotalLength();
      cheio.style.strokeDasharray = comp;
      const max = ScrollTrigger.maxScroll(window) || 1;
      paradas = cenas.map(topoDe);
      pontos.forEach((li, i) => {
        const pt = cheio.getPointAtLength(comp * Math.min(paradas[i] / max, 1));
        li.style.left = `${pt.x}px`;
        li.style.top = `${pt.y}px`;
      });
    };
    ScrollTrigger.addEventListener('refresh', desenhar);
    desenhar();
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (s) => {
        cheio.style.strokeDashoffset = comp * (1 - s.progress);
        const y = window.scrollY + innerHeight * 0.45;
        let atual = 0;
        paradas.forEach((p, i) => { if (y >= p) atual = i; });
        marcar(atual);
      },
    });
  }

  /* ---------- Menu ---------- */
  function marcar(i) {
    selTodos('.prog-pontos li').forEach((li, j) => li.classList.toggle('atual', j === i));
    selTodos('.mapa-lista li').forEach((li, j) => {
      sel('.aqui', li).hidden = j !== i;
      sel('a', li).toggleAttribute('aria-current', j === i);
    });
  }

  function irPara(i) {
    levarA(paradas[i] ?? topoDe(cenas[i]));
  }

  function menu() {
    const lista = sel('.mapa-lista');
    const pontos = sel('.prog-pontos');
    cenas.forEach((sec, i) => {
      const nome = sec.dataset.nome;
      lista.insertAdjacentHTML('beforeend',
        `<li><a href="#${sec.id}"><span class="mapa-n">${i + 1}</span><span class="mapa-nome">${nome}</span><span class="aqui"${i ? ' hidden' : ''}>você está aqui</span></a></li>`);
      pontos.insertAdjacentHTML('beforeend',
        `<li${i ? '' : ' class="atual"'}><button type="button" aria-label="Ir para ${nome}"><span class="rotulo">${nome}</span></button></li>`);
    });
    const mapa = sel('#mapa');
    const btn = sel('.menu-btn');
    const anima = () => doc.classList.contains('motion');
    const abrir = () => {
      mapa.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      segura();
      if (window.gsap && anima()) gsap.fromTo('.mapa-lista li', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.7, ease: 'sine.out' });
      sel('.mapa-fechar').focus();
    };
    const fechar = (foco = true) => {
      mapa.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      libera();
      if (foco) btn.focus();
    };
    btn.addEventListener('click', abrir);
    sel('.mapa-fechar').addEventListener('click', () => fechar());
    mapa.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fechar();
      if (e.key !== 'Tab') return;
      const f = selTodos('button, a', mapa);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    selTodos('.mapa-lista a').forEach((a, i) => a.addEventListener('click', (e) => {
      fechar(false);
      if (!anima()) return;
      e.preventDefault();
      irPara(i);
    }));
    selTodos('.prog-pontos button').forEach((b, i) => b.addEventListener('click', () => irPara(i)));
    sel('.marca').addEventListener('click', (e) => {
      if (!anima()) return;
      e.preventDefault();
      irPara(0);
    });
  }
})();
