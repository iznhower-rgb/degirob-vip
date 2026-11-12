const Dashboard = {
  render: () => {
    Helpers.animateValue('statPicks', 0, 3, 1000);
    Helpers.animateValue('statAcc', 0, 68, 1200, '%');
    Helpers.animateValue('statEV', 0, 9, 1500, '%');

    let html = '';
    STATE.matches.forEach(m => {
      const a = m.analysis;
      const mc = a.market === 'clean' ? 'market-clean' : 'market-caution';
      const trendColor = a.market === 'clean' ? 'var(--pos)' : 'var(--vip)';
      html += `
      <div class="pick-card golden" onclick="Detail.open('${m.id}')">
        <div class="pick-header">
          <div class="league-tag">${m.league}</div>
          <div class="time-wrap"><div class="time-tag">${m.time}</div><div class="countdown" data-time="${m.startTime}"></div></div>
        </div>
        <div class="pick-teams">
          <div class="team-row"><img src="${m.hLogo}" class="team-badge"><div class="team-name">${m.h}</div></div>
          <div class="team-row"><img src="${m.aLogo}" class="team-badge"><div class="team-name">${m.a}</div></div>
        </div>
        <div class="pick-footer">
          <div class="ev-badge">+${a.ev}% EV</div>
          ${Helpers.renderSparkline(m.trend, trendColor)}
          <div class="stars">${'★'.repeat(a.stars)}</div>
          <div class="market-badge ${mc}">${a.market.toUpperCase()}</div>
        </div>
      </div>`;
    });
    document.getElementById('goldenPicks').innerHTML = html;
    Helpers.startCountdowns();
  }
};
