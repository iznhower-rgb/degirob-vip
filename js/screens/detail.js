const Detail = {
  open(id) {
    const m = STATE.matches.find(x => x.id === id);
    if (!m) return;
    STATE.currentMatchId = id;
    const a = m.analysis;

    let betName = m.home;
    if (a.bestBet === 'draw') betName = I18n.t('draw');
    else if (a.bestBet === 'away') betName = m.away;
    const isFav = STATE.favorites.includes(id);
    const homeP = a.home;
    const drawP = a.home + a.draw;

    const hLogo = m.homeLogo ? `<img src="${m.homeLogo}" class="hero-team-logo" data-fallback="${m.home.charAt(0)}" onerror="this.outerHTML='<div class=&quot;hero-team-badge&quot;>'+this.getAttribute('data-fallback')+'</div>'">` : `<div class="hero-team-badge">${m.home.charAt(0)}</div>`;
    const aLogo = m.awayLogo ? `<img src="${m.awayLogo}" class="hero-team-logo" data-fallback="${m.away.charAt(0)}" onerror="this.outerHTML='<div class=&quot;hero-team-badge&quot;>'+this.getAttribute('data-fallback')+'</div>'">` : `<div class="hero-team-badge">${m.away.charAt(0)}</div>`;

    const homeRadar = { attack: 85, defense: 70, form: 90, xg: a.xg ? (a.xg.home * 40) : 70, market: 75 };
    const awayRadar = { attack: 75, defense: 80, form: 60, xg: a.xg ? (a.xg.away * 40) : 70, market: 65 };

    document.getElementById('detailContent').innerHTML = `
      <div class="hero-card">
        <div class="hero-teams">
          <div class="hero-team">${hLogo}<div class="hero-team-name">${m.home}</div></div>
          <div class="hero-vs">VS</div>
          <div class="hero-team">${aLogo}<div class="hero-team-name">${m.away}</div></div>
        </div>
        <div class="hero-meta">${m.league} • ${m.time}</div>
      </div>

      <div class="prob-section">
        <div class="donut-chart" style="--home-p: ${homeP}%; --draw-p: ${drawP}%;">
          <div class="donut-inner">
            <div class="donut-inner-title">${I18n.t('confidence')}</div>
            <div class="donut-inner-val" style="color:${a.confidence === 'high' ? 'var(--pos)' : a.confidence === 'medium' ? 'var(--vip)' : 'var(--neg)'}">${a.confidence.toUpperCase()}</div>
          </div>
        </div>
        <div class="prob-labels">
          <div class="prob-label-item"><div class="name">${I18n.t('homeWin')}</div><div class="val">${a.home}%</div></div>
          <div class="prob-label-item"><div class="name">${I18n.t('draw')}</div><div class="val">${a.draw}%</div></div>
          <div class="prob-label-item"><div class="name">${I18n.t('awayWin')}</div><div class="val">${a.away}%</div></div>
        </div>
      </div>

      <div class="bet-section">
        <div class="bet-label">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          ${I18n.t('vipRec')}
        </div>
        <div class="bet-value">${betName}</div>
        <div class="bet-stats">
          <div class="bet-stat"><div class="bet-stat-lbl">${I18n.t('ev')}</div><div class="bet-stat-val" style="color:var(--pos)">+${a.ev}%</div></div>
          <div class="bet-stat"><div class="bet-stat-lbl">${I18n.t('kelly')}</div><div class="bet-stat-val">${a.kelly}%</div></div>
        </div>
      </div>

      <div class="radar-section">
        <div class="section-label" style="align-self:flex-start;margin-bottom:10px">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${I18n.t('tactical')} (Radar)
        </div>
        <div class="radar-container">
          ${Helpers.renderRadar(homeRadar, awayRadar)}
        </div>
        <div class="radar-legend">
          <span class="home">● ${m.home}</span>
          <span class="away">● ${m.away}</span>
        </div>
      </div>

      <div class="factor-section">
        <div class="factor-row"><div class="factor-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>${I18n.t('weather')}</div><div class="factor-value">${Helpers.translateWeather(a.weather.desc)} ${a.weather.temp}</div></div>
        <div class="factor-row"><div class="factor-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="12" r="6"/><path d="M14 12h8"/><path d="M14 8h5"/><path d="M14 16h5"/></svg>${I18n.t('referee')}</div><div class="factor-value">${Helpers.translateReferee(a.referee)}</div></div>
        <div class="factor-row"><div class="factor-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="4" r="2"/><path d="M4 22s.5-2 1-3a5 5 0 0 1 5-3h1l3 4"/><path d="m6 12 3-2 4 1 1-3 4-1"/><path d="m13 14 5-3 2 3"/></svg>${I18n.t('fatigue')}</div><div class="factor-value">${Helpers.translateFatigue(a.fatigue.home)} / ${Helpers.translateFatigue(a.fatigue.away)}</div></div>
        <div class="factor-row"><div class="factor-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>${I18n.t('coach')}</div><div class="factor-value">${Helpers.translateCoach(a.coach)}</div></div>
      </div>

      <div class="action-row">
        <button class="action-btn ${isFav ? 'active' : ''}" onclick="Detail.toggleFav('${id}')">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${I18n.t('fav')}
        </button>
      </div>
    `;
    Navigation.showScreen('detail');
  },

  toggleFav(id) {
    if (STATE.favorites.includes(id)) STATE.favorites = STATE.favorites.filter(x => x !== id);
    else STATE.favorites.push(id);
    Storage.setFavorites(STATE.favorites);
    this.open(id);
  }
};
