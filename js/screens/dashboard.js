const Dashboard = {
  render() {
    if (STATE.apiStatus === 'error' || !STATE.matches.length) {
      this.updateStatsEmpty();
      this.showError();
      this.renderStatusBadge();
      return;
    }

    const sorted = [...STATE.matches].sort((a, b) => b.analysis.ev - a.analysis.ev);
    const golden = sorted.filter(m => m.analysis.confidence !== 'low').slice(0, 3);
    const more = sorted.filter(m => !golden.includes(m)).slice(0, 5);

    const goldenEl = document.getElementById('goldenPicks');
    const moreEl = document.getElementById('morePicks');

    goldenEl.innerHTML = golden.length
      ? golden.map(m => this.renderCard(m, true)).join('')
      : `<div class="empty-state"><div class="empty-state-title">${I18n.t('noMatches')}</div></div>`;

    moreEl.innerHTML = more.map(m => this.renderCard(m, false)).join('');

    this.updateStats();
    this.renderStatusBadge();
  },

  updateStats() {
    if (!STATE.matches.length) return this.updateStatsEmpty();

    const avgEV = STATE.matches.reduce((s, m) => s + m.analysis.ev, 0) / STATE.matches.length;
    const avgStars = STATE.matches.reduce((s, m) => s + m.analysis.stars, 0) / STATE.matches.length;
    const accuracy = Math.round((avgStars / 5) * 100);

    this.animateStat('statPicks', STATE.matches.length, '', '', 0);
    this.animateStat('statEV', avgEV, '+', '%', 1);
    this.animateStat('statAccuracy', accuracy, '', '%', 0);

    const accEl = document.getElementById('statAccuracy');
    accEl.style.color = accuracy >= 65 ? 'var(--pos)'
                      : accuracy >= 50 ? 'var(--vip)'
                      : 'var(--neg)';
  },

  animateStat(id, target, prefix, suffix, decimals) {
    const el = document.getElementById(id);
    if (!el) return;

    const currentText = el.textContent || '';
    const currentNum = parseFloat(currentText.replace(/[^0-9.-]/g, ''));
    const current = isNaN(currentNum) ? 0 : currentNum;

    // إذا كانت القيمة الحالية = الهدف → لا نعيد الأنيميشن
    if (Math.abs(current - target) < 0.05) {
      el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : Math.round(target)) + suffix;
      return;
    }

    const duration = 800;
    const startTime = performance.now();
    const startVal = current;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = startVal + (target - startVal) * eased;
      el.textContent = prefix + (decimals > 0 ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (decimals > 0 ? target.toFixed(decimals) : Math.round(target)) + suffix;
    };
    requestAnimationFrame(tick);
  },

  updateStatsEmpty() {
    document.getElementById('statPicks').textContent = '0';
    document.getElementById('statEV').textContent = '+0%';
    const accEl = document.getElementById('statAccuracy');
    accEl.textContent = '0%';
    accEl.style.color = 'var(--neg)';
  },

  renderStatusBadge() {
    let badge = document.getElementById('statusBadge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'statusBadge';
      badge.style.cssText =
        'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:999;' +
        'padding:7px 16px;border-radius:20px;font-size:10px;font-weight:900;' +
        'letter-spacing:1.5px;backdrop-filter:blur(10px);text-transform:uppercase;' +
        'cursor:pointer;font-family:ui-monospace,monospace;';
      badge.addEventListener('click', () => {
        if (window.eruda) eruda.show();
      });
      document.body.appendChild(badge);
    }
    const map = {
      loading: { bg: 'rgba(139,92,246,0.15)', bd: 'rgba(139,92,246,0.5)', cl: '#8B5CF6', tx: '⏳ LOADING' },
      live:    { bg: 'rgba(16,185,129,0.15)', bd: 'rgba(16,185,129,0.5)', cl: '#10B981', tx: '🟢 LIVE ' + STATE.matches.length },
      error:   { bg: 'rgba(244,63,94,0.15)',  bd: 'rgba(244,63,94,0.5)',  cl: '#F43F5E', tx: '🔴 ' + (STATE.apiError?.code || 'ERROR') }
    };
    const s = map[STATE.apiStatus] || map.loading;
    badge.style.background = s.bg;
    badge.style.border = '1px solid ' + s.bd;
    badge.style.color = s.cl;
    badge.textContent = s.tx;
    badge.style.display = 'block';
  },

  showLoading() {
    const sk = `
      <div class="skeleton-card">
        <div class="skeleton skeleton-line" style="width:40%"></div>
        <div class="skeleton skeleton-line" style="width:80%;height:20px;margin-top:14px"></div>
        <div class="skeleton skeleton-line" style="width:60%;height:20px;margin-top:10px"></div>
        <div class="skeleton skeleton-line" style="width:100%;height:1px;margin-top:20px"></div>
      </div>`;
    const g = document.getElementById('goldenPicks');
    const m = document.getElementById('morePicks');
    if (g) g.innerHTML = sk + sk + sk;
    if (m) m.innerHTML = '';
  },

  showError() {
    const e = STATE.apiError || { code: 'UNKNOWN', message: 'خطأ غير معروف', detail: '' };
    const friendly = {
      'NO_API_KEY': 'لم يتم إعداد مفتاح API',
      'KEY_INVALID': 'المفتاح غير صالح',
      'NO_MATCHES': '0 مباريات اليوم — جرّب لاحقاً',
      'NORMALIZE_FAILED': 'تعذّر تحويل البيانات',
      'API_ERROR': 'خطأ من API-Football',
      'UNKNOWN': 'خطأ غير معروف'
    };
    const html = `
      <div class="empty-state" style="padding:40px 20px">
        <div style="font-size:40px;margin-bottom:16px">⚠️</div>
        <div class="empty-state-title" style="margin-bottom:10px;font-size:15px">
          ${friendly[e.code] || e.message}
        </div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:6px;font-family:ui-monospace,monospace">${e.code}</div>
        <div style="font-size:10px;color:var(--text-3);margin-bottom:24px;font-family:ui-monospace,monospace;word-break:break-all;max-width:340px;margin:0 auto">${(e.detail || e.message || '').substring(0, 200)}</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="retry-btn" onclick="App.loadMatches()">🔄 إعادة المحاولة</button>
          <button class="retry-btn" style="background:linear-gradient(135deg,#F43F5E,#DC2626)" onclick="API.clearCache();location.reload()">🗑️ مسح cache</button>
          <button class="retry-btn" style="background:linear-gradient(135deg,#6B7280,#4B5563)" onclick="if(window.eruda)eruda.show()">🔍 Console</button>
        </div>
      </div>`;
    const g = document.getElementById('goldenPicks');
    const m = document.getElementById('morePicks');
    if (g) g.innerHTML = html;
    if (m) m.innerHTML = '';
  },

  renderBadge(name, logoUrl) {
    const letter = Helpers.escapeHtml(name.charAt(0));
    if (!logoUrl) {
      return `<div class="team-badge"><span class="team-letter">${letter}</span></div>`;
    }
    const safeUrl = Helpers.escapeHtml(logoUrl);
    return `<div class="team-badge has-logo"><span class="team-letter">${letter}</span><img src="${safeUrl}" class="team-logo" alt="" onerror="this.parentNode.classList.remove('has-logo')"></div>`;
  },

  renderCard(m, isGolden) {
    const a = m.analysis;
    const marketClass = a.market === 'clean' ? 'trap-clean' : a.market === 'trap' ? 'trap-trap' : 'trap-caution';
    const marketText = a.market === 'clean' ? 'CLEAN' : a.market === 'trap' ? 'TRAP' : 'CAUTION';

    const homeName = Helpers.teamName(m.home);
    const awayName = Helpers.teamName(m.away);

    return `
      <div class="pick-card ${isGolden ? 'golden' : ''}" onclick="Detail.open('${m.id}')">
        <div class="pick-header">
          <div class="league-tag">
            <span class="league-badge">${m.leagueBadge}</span>
            <span>${m.league}</span>
          </div>
          <div class="time-tag">${m.time}</div>
        </div>
        <div class="pick-teams">
          <div class="team-row">
            ${this.renderBadge(homeName, m.homeLogo)}
            <div class="team-name">${homeName}</div>
          </div>
          <div class="team-row">
            ${this.renderBadge(awayName, m.awayLogo)}
            <div class="team-name">${awayName}</div>
          </div>
        </div>
        <div class="pick-footer">
          <div class="ev-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
            +${a.ev}% EV
          </div>
          <div class="stars">${Helpers.renderStars(a.stars)}</div>
          <div class="trap-indicator ${marketClass}">● ${marketText}</div>
        </div>
      </div>
    `;
  }
};
