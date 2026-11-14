const Dashboard = {
  render() {
    if (STATE.apiStatus === 'error' || !STATE.matches.length) {
      this.updateStatsEmpty();
      this.showError();
      return;
    }

    const sorted = [...STATE.matches].sort((a, b) => b.analysis.ev - a.analysis.ev);
    const live = sorted.filter(m => m.isLive);
    const upcoming = sorted.filter(m => !m.isLive && !m.isPost);
    const golden = [...live, ...upcoming].filter(m => m.analysis.confidence !== 'low').slice(0, 5);
    const more = [...live, ...upcoming, ...sorted.filter(m => m.isPost)]
      .filter(m => !golden.includes(m))
      .slice(0, 15);

    const goldenEl = document.getElementById('goldenPicks');
    const moreEl = document.getElementById('morePicks');

    goldenEl.innerHTML = golden.length
      ? golden.map(m => this.renderCard(m, true)).join('')
      : `<div class="empty-state"><div class="empty-state-title">${I18n.t('noMatches')}</div></div>`;

    moreEl.innerHTML = more.map(m => this.renderCard(m, false)).join('');

    this.updateStats();
  },

  renderAll() {
    const el = document.getElementById('allMatchesList');
    if (!el) return;

    if (!STATE.matches.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state-title">${I18n.t('noMatches')}</div></div>`;
      return;
    }

    let filtered = [...STATE.matches];

    // 1. تطبيق الفلتر
    if (STATE.allMatchesFilter === 'live') {
      filtered = filtered.filter(m => m.isLive);
    } else if (STATE.allMatchesFilter === 'upcoming') {
      filtered = filtered.filter(m => !m.isLive && !m.isPost);
    }

    // 2. تطبيق البحث
    if (STATE.allMatchesSearch) {
      const query = STATE.allMatchesSearch.toLowerCase();
      filtered = filtered.filter(m => 
        m.home.toLowerCase().includes(query) || 
        m.away.toLowerCase().includes(query) || 
        m.league.toLowerCase().includes(query)
      );
    }

    // 3. الترتيب
    filtered.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      if (!a.isPost && b.isPost) return -1;
      if (a.isPost && !b.isPost) return 1;
      return a.kickoff - b.kickoff;
    });

    if (!filtered.length) {
      el.innerHTML = `<div class="empty-state"><div class="empty-state-title">${I18n.t('noSearchResults')}</div></div>`;
      return;
    }

    el.innerHTML = filtered.slice(0, 150).map(m => this.renderCard(m, false)).join('');
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
    accEl.style.color = accuracy >= 65 ? 'var(--pos)' : accuracy >= 50 ? 'var(--vip)' : 'var(--neg)';
  },

  animateStat(id, target, prefix, suffix, decimals) {
    const el = document.getElementById(id);
    if (!el) return;
    const currentText = el.textContent || '';
    const currentNum = parseFloat(currentText.replace(/[^0-9.-]/g, ''));
    const current = isNaN(currentNum) ? 0 : currentNum;
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
      'NETWORK_ERROR': 'تعذر الاتصال بالإنترنت',
      'RATE_LIMIT': 'تجاوزت الحد اليومي',
      'NO_MATCHES': '0 مباريات اليوم — جرّب لاحقاً',
      'NORMALIZE_FAILED': 'تعذّر تحويل البيانات',
      'API_ERROR': 'خطأ من مزود البيانات',
      'UNKNOWN': 'خطأ غير معروف'
    };
    const html = `
      <div class="empty-state" style="padding:40px 20px">
        <div style="font-size:40px;margin-bottom:16px">⚠️</div>
        <div class="empty-state-title" style="margin-bottom:10px;font-size:15px">${friendly[e.code] || e.message}</div>
        <div style="font-size:11px;color:var(--text-3);margin-bottom:6px;font-family:ui-monospace,monospace">${e.code}</div>
        <div style="font-size:10px;color:var(--text-3);margin-bottom:24px;font-family:ui-monospace,monospace;word-break:break-all;max-width:340px;margin:0 auto">${(e.detail || e.message || '').substring(0, 200)}</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="retry-btn" onclick="App.loadMatches()">🔄 إعادة المحاولة</button>
          <button class="retry-btn" style="background:linear-gradient(135deg,#F43F5E,#DC2626)" onclick="API.clearCache();location.reload()">🗑️ مسح cache</button>
        </div>
      </div>`;
    const g = document.getElementById('goldenPicks');
    const m = document.getElementById('morePicks');
    if (g) g.innerHTML = html;
    if (m) m.innerHTML = '';
  },

  renderBadge(name, logoUrl) {
    const letter = Helpers.escapeHtml(name.charAt(0));
    if (!logoUrl) return `<div class="team-badge"><span class="team-letter">${letter}</span></div>`;
    const safeUrl = Helpers.escapeHtml(logoUrl);
    return `<div class="team-badge has-logo"><span class="team-letter">${letter}</span><img src="${safeUrl}" class="team-logo" alt="" onerror="this.parentNode.classList.remove('has-logo')"></div>`;
  },

  renderHeaderRight(m) {
    if (m.isLive) {
      const minute = m.elapsed ? ' ' + m.elapsed + "'" : '';
      return `<span class="live-pulse"><span class="live-dot"></span>LIVE${minute}</span>`;
    }
    if (m.isPost) return `<div class="time-tag" style="background:rgba(90,96,114,0.2);color:var(--text-2)">FT</div>`;
    return `<div class="time-tag">${m.time}</div>`;
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
          ${this.renderHeaderRight(m)}
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
