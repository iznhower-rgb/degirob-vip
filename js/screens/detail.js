const Detail = {
  open: (id) => {
    const m = STATE.matches.find(x => x.id === id);
    const a = m.analysis;
    const p1 = a.home; const p2 = a.home + a.draw;
    
    document.getElementById('detailContent').innerHTML = `
      <div class="hero-card">
        <div class="hero-teams">
          <div class="hero-team"><div class="hero-team-badge">${m.h[0]}</div><div>${m.h}</div></div>
          <div style="font-weight:900;color:var(--text-2)">VS</div>
          <div class="hero-team"><div class="hero-team-badge">${m.a[0]}</div><div>${m.a}</div></div>
        </div>
      </div>
      <div class="prob-section">
        <div class="donut-chart" style="background: conic-gradient(var(--pos) 0% ${p1}%, var(--vip) ${p1}% ${p2}%, var(--neg) ${p2}% 100%)">
          <div class="donut-inner"><div style="font-size:10px;color:var(--text-2)">CONF</div><div style="font-weight:900;color:var(--pos);font-size:14px">${a.conf.toUpperCase()}</div></div>
        </div>
        <div class="prob-labels"><span style="color:var(--pos)">Home ${a.home}%</span><span style="color:var(--vip)">Draw ${a.draw}%</span><span style="color:var(--neg)">Away ${a.away}%</span></div>
      </div>
      <div class="bet-section">
        <div style="font-size:11px;color:var(--pos);font-weight:bold">VIP RECOMMENDATION</div>
        <div class="bet-value">${m.h} Win</div>
        <div style="font-family:monospace;font-size:14px">EV: +${a.ev}% | Kelly: ${a.kelly}%</div>
      </div>
      <div class="radar-section">
        <div style="font-size:11px;color:var(--text-2);font-weight:bold;align-self:flex-start;margin-bottom:10px">TACTICAL RADAR</div>
        <div class="radar-container">${Helpers.renderRadar(m.radar.home, m.radar.away)}</div>
        <div class="radar-legend"><span class="home">● ${m.h}</span><span class="away">● ${m.a}</span></div>
      </div>
    `;
    Navigation.showScreen('detail');
  }
};
