const History = {
  render: () => {
    let html = '';
    STATE.history.forEach(h => {
      const resultClass = h.result === 'won' ? 'result-won' : 'result-lost';
      const resultText = h.result === 'won' ? 'WON' : 'LOST';
      html += `
      <div class="history-card">
        <div class="history-info">
          <div class="history-title">${h.match}</div>
          <div class="history-meta">${h.date} • Predicted: ${h.prediction}</div>
        </div>
        <div class="history-result ${resultClass}">${resultText}</div>
      </div>`;
    });
    document.getElementById('historyList').innerHTML = html;
  }
};
