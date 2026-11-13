const Dashboard = {
  _countdownInterval: null,

  render() {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }

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
    this.updateCountdowns();
    this._countdownInterval = setInterval(() => this.updateCountdowns(), 30000);
  },

  updateStats() {
    if (!STATE.matches.length) return this.updateStatsEmpty();
    const avgEV = STATE.matches.reduce((s, m) => s + m.analysis.ev, 0) / STATE.matches.length;
    const avgStars = STATE.matches.reduce((s, m) => s + m.analysis.stars, 0) / STATE.matches.length;
    const accuracy = Math.round((avgStars / 5) * 100);

    Helpers.animateValue(document.getElementById('statPicks'), 0, STATE.matches.length, 800, '', '', 0);
    Helpers.animateValue(document.getElementById('statEV'), 0, avgEV, 800, '+', '%', 1);
    Helpers.animateValue(document.getElementById('statAccuracy'), 0, accuracy, 800, '', '%', 0);

    const accEl = document.getElementById('statAccuracy');
    accEl.style.color = accuracy >= 65 ? 'var(--pos)' : accuracy >= 50 ? 'var(--vip)' : 'var(--neg)';
  },

  updateStatsEmpty() {
    document.getElementById('statPicks').textContent = '0';
    document.getElementById('statEV').textContent = '+0%';
    const accEl = document.getElementById('statAccuracy');
    accEl.textContent = '0%';
    accEl.style.color = 'var(--neg)';
  },

  updateCountdowns() {
    document.querySelectorAll('[data-kickoff]').forEach(el => {
      const kickoff = parseInt(el.getAttribute('data-kickoff'), 10);
      const formatted = Helpers.formatCountdown(kickoff);
      if (formatted) {
        const timeEl = el.querySelector('.countdown-time');
        if (timeEl) timeEl.textContent = formatted;
        el.style.display = 'flex';
      } else {
        el.style.display = 'none';
      }
    });
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

  renderCard(m, isGolden) {
    const a = m.analysis;
    const marketClass = a.market === 'clean' ? 'trap-clean' : a.market === 'trap' ? 'trap-trap' : 'trap-caution';
    const marketText = a.market === 'clean' ? 'CLEAN' : a.market === 'trap' ? 'TRAP' : 'CAUTION';

    const homeName = Helpers.teamName(m.home);
    const awayName = Helpers.teamName(m.away);

    const homeBadge = m.homeLogo
      ? `<div class="team-badge has-logo"><img src="${m.homeLogo}" class="team-logo" alt="" loading="lazy" onerror="this.parentNode.classList.remove('has-logo');this.parentNode.textContent='${homeName.charAt(0)}';this.remove()"></div>`
      : `<div class="team-badge">${homeName.charAt(0)}</div>`;

    const awayBadge = m.awayLogo
      ? `<div class="team-badge has-logo"><img src="${m.awayLogo}" class="team-logo" alt="" loading="lazy" onerror="this.parentNode.classList.remove('has-logo');this.parentNode.textContent='${awayName.charAt(0)}';this.remove()"></div>`
      : `<div class="team-badge">${awayName.charAt(0)}</div>`;

    const headerRight = m.isLive
      ? `<span class="live-pulse"><span class="live-dot"></span>LIVE${m.elapsed ? ' ' + m.elapsed + "'" : ''}</span>`
      : `<div class="time-tag">${m.time}</div>`;

    const showCountdown = !m.isLive && m.kickoff && m.kickoff > Date.now();
    const countdownBlock = showCountdown
      ? `<div class="countdown" data-kickoff="${m.kickoff}" style="display:flex">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:10px;height:10px"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           <span class="countdown-time">${Helpers.formatCountdown(m.kickoff)}</span>
         </div>`
      : '';

    return `
      <div class="pick-card ${isGolden ? 'golden' : ''}" onclick="Detail.open('${m.id}')">
        <div class="pick-header">
          <div class="league-tag">
            <span class="league-badge">${m.leagueBadge}</span>
            <span>${m.league}</span>
          </div>
          ${headerRight}
        </div>
        <div class="pick-teams">
          <div class="team-row">
            ${homeBadge}
            <div class="team-name">${homeName}</div>
          </div>
          <div class="team-row">
            ${awayBadge}
            <div class="team-name">${awayName}</div>
          </div>
        </div>
        ${countdownBlock}
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
