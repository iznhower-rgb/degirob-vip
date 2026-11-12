const Helpers = {
  renderStars(n) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
      const cls = i <= n ? 'star-f' : 'star-e';
      html += `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>`;
    }
    return html;
  },

  translateWeather(desc) {
    const map = { 'Clear': 'صافٍ', 'Rain': 'ممطر', 'Windy': 'رياح', 'Cloudy': 'غائم' };
    if (STATE.lang === 'ar') {
      for (const key in map) { if (desc.includes(key)) return map[key]; }
    }
    return desc;
  },

  translateReferee(ref) {
    if (STATE.lang === 'ar') {
      const map = { 'Strict': 'متشدد', 'Lenient': 'متساهل', 'Balanced': 'متوازن' };
      return map[ref] || ref;
    }
    return ref;
  },

  translateFatigue(f) {
    if (STATE.lang === 'ar') return f === 'Fresh' ? 'جاهز' : 'مرهق';
    return f;
  },

  translateCoach(c) {
    if (STATE.lang === 'ar') {
      const map = { 'Offensive': 'هجومي', 'Defensive': 'دفاعي', 'Balanced': 'متوازن' };
      return map[c] || c;
    }
    return c;
  },

  // ✨ Haptic Feedback (اهتزاز الهاتف)
  haptic() {
    if (navigator.vibrate) navigator.vibrate(15);
  },

  // 🔊 Sound Feedback (نغمة ضغطة خفيفة)
  playClick() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
  },

  // 🔢 Animate Numbers (عداد الأرقام المتحرك)
  animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3); // تأثير بطيء في النهاية
      const current = Math.floor(easeOut * (end - start) + start);
      element.textContent = current + suffix;
      if (progress < 1) window.requestAnimationFrame(step);
      else element.textContent = end + suffix;
    };
    window.requestAnimationFrame(step);
  },

  // 📈 Sparkline (المخطط الخطي المصغر)
  renderSparkline(data, color) {
    if (!data || !data.length) return '';
    const w = 60, h = 20;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((val - min) / range) * h;
      return `${x},${y}`;
    }).join(' ');
    return `<svg class="sparkline-wrap" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  },

  // ⏱️ Countdown Timer (المؤقت التنازلي)
  startCountdowns() {
    setInterval(() => {
      document.querySelectorAll('.countdown-timer').forEach(el => {
        const targetTime = new Date(el.getAttribute('data-time')).getTime();
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff < 0) {
          el.innerHTML = `● LIVE NOW`;
          el.style.color = 'var(--red)';
        } else {
          const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((diff % (1000 * 60)) / 1000);
          el.innerHTML = `⏱ ${h}h ${m}m ${s}s`;
        }
      });
    }, 1000);
  }
};
