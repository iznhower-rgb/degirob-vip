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

    // Update stats
    const avgEV = STATE.matches.length
      ? (STATE.matches.reduce((s, m) => s + m.analysis.ev, 0) / STATE.matches.length).toFixed(1)
      : '0';
    document.getElementById('statPicks').textContent = STATE.matches.length;
    document.getElementById('statEV').textContent = '+' + avgEV + '%';
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
