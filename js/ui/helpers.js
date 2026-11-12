const Helpers = {
  renderStars(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const cls = i <= n ? 'star-f' : 'star-e';
      html += `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    }
    return html;
  },
  translateWeather(desc) {
    const map = { 'Clear': 'صافٍ', 'Rain': 'ممطر', 'Windy': 'رياح', 'Cloudy': 'غائم' };
    if (STATE.lang === 'ar') { for (const key in map) { if (desc.includes(key)) return map[key]; } }
    return desc;
  },
  translateReferee(ref) {
    if (STATE.lang === 'ar') { const map = { 'Strict': 'متشدد', 'Lenient': 'متساهل', 'Balanced': 'متوازن' }; return map[ref] || ref; }
    return ref;
  },
  translateFatigue(f) { if (STATE.lang === 'ar') return f === 'Fresh' ? 'جاهز' : 'مرهق'; return f; },
  translateCoach(c) {
    if (STATE.lang === 'ar') { const map = { 'Offensive': 'هجومي', 'Defensive': 'دفاعي', 'Balanced': 'متوازن' }; return map[c] || c; }
    return c;
  },
  haptic() { if (navigator.vibrate) navigator.vibrate(15); },
  playClick() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext(); const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  },
  animateValue(element, start, end, duration, suffix = '') {
    if (!element) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * (end - start) + start);
      element.textContent = current + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
      else element.textContent = end + suffix;
    };
    window.requestAnimationFrame(step);
  },
  renderSparkline(data, color) {
    if (!data || !data.length) return '';
    const w = 60, h = 20, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const points = data.map((val, i) => `${(i / (data.length - 1)) * w},${h - ((val - min) / range) * h}`).join(' ');
    return `<svg class="sparkline-wrap" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  },
  startCountdowns() {
    setInterval(() => {
      document.querySelectorAll('.countdown-timer').forEach(el => {
        const targetTime = new Date(el.getAttribute('data-time')).getTime();
        const diff = targetTime - new Date().getTime();
        if (diff < 0) { el.innerHTML = `● LIVE NOW`; el.style.color = 'var(--red)'; }
        else {
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          el.innerHTML = `⏱ ${h}h ${m}m ${s}s`;
        }
      });
    }, 1000);
  },
  renderRadar(homeStats, awayStats) {
    const cx = 130, cy = 110, maxR = 80;
    const numAxes = 5;
    const angleStep = (Math.PI * 2) / numAxes;
    const getPoint = (value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = ((value || 0) / 100) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };
    let grid = '';
    [20, 40, 60, 80, 100].forEach(level => {
      const points = Array.from({length: numAxes}, (_, i) => {
        const p = getPoint(level, i); return `${p.x},${p.y}`;
      }).join(' ');
      grid += `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    });
    let axes = '';
    for (let i = 0; i < numAxes; i++) {
      const p = getPoint(100, i);
      axes += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    }
    const homePoints = Object.values(homeStats).map((val, i) => { const p = getPoint(val, i); return `${p.x},${p.y}`; }).join(' ');
    const awayPoints = Object.values(awayStats).map((val, i) => { const p = getPoint(val, i); return `${p.x},${p.y}`; }).join(' ');
    return `<svg viewBox="0 0 260 220" style="width:100%; height:100%; overflow:visible;">${grid}${axes}<polygon points="${awayPoints}" fill="rgba(245,158,11,0.2)" stroke="var(--vip)" stroke-width="2"/><polygon points="${homePoints}" fill="rgba(6,182,212,0.2)" stroke="var(--cyan)" stroke-width="2"/></svg>`;
  }
};
