const History = {
  render: () => {
    if (!window.DEMO_HISTORY) return;
    let html = '';
    DEMO_HISTORY.forEach(h => {
      html += `
      <div class="history-card">
        <div class="history-info"><div class="history-title">${h.match}</div><div class="history-meta">${h.date}</div></div>
        <div class="history-result ${h.result === 'won' ? 'result-won' : 'result-lost'}">${h.result.toUpperCase()}</div>
      </div>`;
    });
    document.getElementById('historyList').innerHTML = html;
  }
};
