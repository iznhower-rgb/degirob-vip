const Dashboard = {
  render() {
    const goldenEl = document.getElementById('goldenPicks');
    const moreEl = document.getElementById('morePicks');

    // 💀 عرض Skeleton Loading أولاً
    const skeletonHTML = `
      <div class="skeleton-card">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line team"></div>
        <div class="skeleton-line team"></div>
        <div class="skeleton-line footer"></div>
      </div>
    `.repeat(3);

    goldenEl.innerHTML = skeletonHTML;
    moreEl.innerHTML = skeletonHTML;

    // ⏳ محاكاة التحميل (نصف ثانية) ثم عرض البيانات
    setTimeout(() => {
      const sorted = [...STATE.matches].sort((a, b) => b.analysis.ev - a.analysis.ev);
      const golden = sorted.filter(m => m.analysis.confidence !== 'low').slice(0, 3);
      const more = sorted.filter(m => !golden.includes(m)).slice(0, 5);

      goldenEl.innerHTML = golden.length
        ? golden.map(m => this.renderCard(m, true)).join('')
        : `<div class="empty-state"><div class="empty-state-title">${I18n.t('noMatches')}</div></div>`;

      moreEl.innerHTML = more.map(m => this.renderCard(m, false)).join('');

      // الأرقام المتحركة
      const avgEV = STATE.matches.length ? (STATE.matches.reduce((s, m) => s + m.analysis.ev, 0) / STATE.matches.length) : 0;
      Helpers.animateValue(document.getElementById('statPicks'), 0, STATE.matches.length, 1000);
      Helpers.animateValue(document.getElementById('statAccuracy'), 0, 68, 1200, '%');
      Helpers.animateValue(document.getElementById('statEV'), 0, Math.round(avgEV), 1500, '%');
      setTimeout(() => { document.getElementById('statEV').textContent = '+' + Math.round(avgEV) + '%'; }, 1600);
    }, 500);
  },

  renderCard(m, isGolden) {
    const a = m.analysis;
    const marketClass = a.market === 'clean' ? 'trap-clean' : a.market === 'trap' ? 'trap-trap' : 'trap-caution';
    const marketText = a.market === 'clean' ? 'CLEAN' : a.market === 'trap' ? 'TRAP' : 'CAUTION';
    const trendColor = a.market === 'clean' ? 'var(--pos)' : 'var(--vip)';
    const sparkline = Helpers.renderSparkline(m.marketTrend || [1,1,1,1,1], trendColor);

    let homeBadge = m.homeLogo ? `<img src="${m.homeLogo}" class="team-badge" style="object-fit:contain; padding:4px; background:#fff" onerror="this.outerHTML='<div class=\\'team-badge\\'>${m.home.charAt(0)}</div>'">` : `<div class="team-badge">${m.home.charAt(0)}</div>`;
    let awayBadge = m.awayLogo ? `<img src="${m.awayLogo}" class="team-badge" style="object-fit:contain; padding:4px; background:#fff" onerror="this.outerHTML='<div class=\\'team-badge\\'>${m.away.charAt(0)}</div>'">` : `<div class="team-badge">${m.away.charAt(0)}</div>`;

    let timeHtml = m.status === 'live' 
      ? `<div class="time-tag" style="color:var(--neg); border:1px solid var(--neg)"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--neg);margin-right:4px;animation:pulse 1s infinite"></span> LIVE</div>`
      : `<div class="time-tag">${m.time}</div><div class="countdown-timer" data-time="${m.startTime}"></div>`;

    return `
      <div class="pick-card ${isGolden ? 'golden' : ''}" onclick="Detail.open('${m.id}')">
        <div class="pick-header">
          <div class="league-tag"><span class="league-badge">${m.leagueBadge}</span><span>${m.league}</span></div>
          <div class="time-tag-wrap">${timeHtml}</div>
        </div>
        <div class="pick-teams">
          <div class="team-row">${homeBadge}<div class="team-name">${m.home}</div></div>
          <div class="team-row">${awayBadge}<div class="team-name">${m.away}</div></div>
        </div>
        <div class="pick-footer">
          <div class="ev-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            +${a.ev}% EV
          </div>
          ${sparkline}
          <div class="stars">${Helpers.renderStars(a.stars)}</div>
          <div class="trap-indicator ${marketClass}">● ${marketText}</div>
        </div>
      </div>
    `;
  }
};
