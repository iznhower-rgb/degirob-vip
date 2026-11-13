const Helpers = {
  teamName(name) {
    if (!name) return '';
    if (STATE.lang !== 'ar') return name;
    if (typeof TEAMS_AR === 'undefined') return name;
    if (TEAMS_AR[name]) return TEAMS_AR[name];
    const lower = name.toLowerCase();
    for (const key in TEAMS_AR) {
      if (key.toLowerCase() === lower) return TEAMS_AR[key];
    }
    return name;
  },

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

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  animateValue(el, start, end, duration, prefix, suffix, decimals) {
    if (!el) return;
    const startTime = performance.now();
    const diff = end - start;
    const d = decimals || 0;
    const p = prefix || '';
    const s = suffix || '';
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + diff * eased;
      el.textContent = p + (d > 0 ? current.toFixed(d) : Math.round(current)) + s;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  },

  formatCountdown(kickoff) {
    if (!kickoff) return null;
    const diff = kickoff - Date.now();
    if (diff <= 0) return null;
    const day = Math.floor(diff / 86400000);
    const hour = Math.floor((diff % 86400000) / 3600000);
    const min = Math.floor((diff % 3600000) / 60000);
    const ar = STATE.lang === 'ar';
    if (day > 0) return ar ? `بعد ${day}ي ${hour}س` : `in ${day}d ${hour}h`;
    if (hour > 0) return ar ? `بعد ${hour}س ${min}د` : `in ${hour}h ${min}m`;
    if (min > 0) return ar ? `بعد ${min}د` : `in ${min}m`;
    return ar ? 'قريباً' : 'soon';
  },

  translateWeather(desc) {
    const map = { 'Clear': 'صافٍ', 'Rain': 'ممطر', 'Windy': 'رياح', 'Cloudy': 'غائم' };
    if (STATE.lang === 'ar') {
      for (const key in map) {
        if (desc.includes(key)) return map[key];
      }
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
  }
};
