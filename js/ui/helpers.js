const Helpers = {
  // 1. رسم الخط البياني
  renderSparkline(data, color) {
    const w = 50, h = 20, min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
    return `<svg class="sparkline" viewBox="0 0 ${w} ${h}"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
  },
  // 2. العد التنازلي
  startCountdowns() {
    setInterval(() => {
      document.querySelectorAll('.countdown').forEach(el => {
        const diff = parseInt(el.getAttribute('data-time')) - Date.now();
        if (diff < 0) { el.innerText = 'LIVE'; el.style.color = 'var(--neg)'; }
        else {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          el.innerText = `⏱ ${h}h ${m}m ${s}s`;
        }
      });
    }, 1000);
  },
  // 3. تحريك الأرقام
  animateValue(id, start, end, duration, suffix = '') {
    const el = document.getElementById(id);
    if(!el) return;
    let startTimestamp = null;
    const step = (ts) => {
      if (!startTimestamp) startTimestamp = ts;
      const progress = Math.min((ts - startTimestamp) / duration, 1);
      el.innerText = Math.floor(progress * (end - start) + start) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  // 4. رسم الرادار الخماسي
  renderRadar(homeStats, awayStats) {
    const cx = 150, cy = 120, maxR = 90;
    const numAxes = 5;
    const angleStep = (Math.PI * 2) / numAxes;
    const getPoint = (value, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const r = (value / 100) * maxR;
      return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    };
    let grid = '';
    [20, 40, 60, 80, 100].forEach(level => {
      const points = Array.from({length: numAxes}, (_, i) => { const p = getPoint(level, i); return `${p.x},${p.y}`; }).join(' ');
      grid += `<polygon points="${points}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`;
    });
    let axes = '';
    for (let i = 0; i < numAxes; i++) { const p = getPoint(100, i); axes += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>`; }
    const homePoints = homeStats.map((val, i) => { const p = getPoint(val, i); return `${p.x},${p.y}`; }).join(' ');
    const awayPoints = awayStats.map((val, i) => { const p = getPoint(val, i); return `${p.x},${p.y}`; }).join(' ');
    return `<svg viewBox="0 0 300 240" style="width:100%; height:100%; overflow:visible;">${grid}${axes}<polygon points="${awayPoints}" fill="rgba(245,158,11,0.2)" stroke="var(--vip)" stroke-width="2"/><polygon points="${homePoints}" fill="rgba(6,182,212,0.2)" stroke="var(--cyan)" stroke-width="2"/></svg>`;
  }
};
