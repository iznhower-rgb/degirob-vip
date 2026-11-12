function unlockApp() {
  const key = document.getElementById('keyInput').value.trim().toUpperCase();
  if (['DEGIROB-2026', 'VIP-ALPHA-001'].includes(key)) {
    localStorage.setItem('degirob_license', key);
    document.getElementById('paywall').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'flex';
    showScreen('dashboard');
    if (window.Dashboard) Dashboard.render();
  } else {
    alert('❌ Invalid Key. Use: DEGIROB-2026');
  }
}
