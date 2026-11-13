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
