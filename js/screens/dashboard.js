const Dashboard = {
  render() {
    const sorted = [...STATE.matches].sort((a, b) => b.analysis.ev - a.analysis.ev);
    const golden = sorted.filter(m => m.analysis.confidence !== 'low').slice(0, 3);
    const more = sorted.filter(m => !golden.includes(m)).slice(0, 5);

    const goldenEl = document.getElementById('goldenPicks');
    const moreEl = document.getElementById('morePicks');

    goldenEl.innerHTML = golden.length
      ? golden.map(m => this.renderCard(m, true)).join('')
      : `<div class="empty-state"><div class="empty-state-title">${I18n.t('noMatches')}</div></div>`;

    moreEl.innerHTML = more.map(m => this.renderCard(m, false)).join('');

    const avgEV = STATE.matches.length
      ? (STATE.matches.reduce((s, m) => s + m.analysis.ev, 0) / STATE.matches.length).toFixed(1)
      : '0';

    const avgStars = STATE.matches.length
      ? STATE.matches.reduce((s, m) => s + m.analysis.stars, 0) / STATE.matches.length
      : 0;
    const accuracy = Math.round((avgStars / 5) * 100);

    document.getElementById('statPicks').textContent = STATE.matches.length;
    document.getElementById('statEV').textContent = '+' + avgEV + '%';

    const accEl = document.getElementById('statAccuracy');
    accEl.textContent = accuracy + '%';
    accEl.style.color = accuracy >= 65 ? 'var(--pos)'
                      : accuracy >= 50 ? 'var(--vip)'
                      : 'var(--neg)';
  },

  showLoading() {
    const skeleton = `
      <div class="skeleton-card">
        <div class="skeleton skeleton-line" style="width:40%"></div>
        <div class="skeleton skeleton-line" style="width:80%;height:20px;margin-top:14px"></div>
        <div class="skeleton skeleton-line" style="width:60%;height:20px;margin-top:10px"></div>
        <div class="skeleton skeleton-line" style="width:100%;height:1px;margin-top:20px"></div>
      </div>
    `;
    const g = document.getElementById('goldenPicks');
    const m = document.getElementById('morePicks');
    if (g) g.innerHTML = skeleton + skeleton + skeleton;
    if (m) m.innerHTML = '';
  },

  showError() {
    const html = `
      <div class="empty-state">
        <div class="empty-state-title">⚠️ ${I18n.t('errorLoading')}</div>
        <div class="empty-state-sub">${I18n.t('errorRetry')}</div>
        <button class="retry-btn" onclick="App.loadMatches()">${I18n.t('retry')}</button>
      </div>
    `;
    const g = document.getElementById('goldenPicks');
    const m = document.getElementById('morePicks');
    if (g) g.innerHTML = html;
    if (m) m.innerHTML = '';
  },

  renderCard(m, isGolden) {
    const a = m.analysis;
    const marketClass = a.market === 'clean' ? 'trap-clean' : a.market === 'trap' ? 'trap-trap' : 'trap-caution';
    const marketText = a.market === 'clean' ? 'CLEAN' : a.market === 'trap' ? 'TRAP' : 'CAUTION';

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
            <div class="team-badge">${m.home.charAt(0)}</div>
            <div class="team-name">${m.home}</div>
          </div>
          <div class="team-row">
            <div class="team-badge">${m.away.charAt(0)}</div>
            <div class="team-name">${m.away}</div>
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
