function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if(el) el.classList.add('active');
  window.scrollTo(0, 0);
}

function switchTab(tab) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
  showScreen(tab);
  if (tab === 'history' && window.History) History.render();
}

function requestNotif() {
  if (!("Notification" in window)) return alert("Notifications not supported");
  Notification.requestPermission().then(perm => {
    if (perm === "granted") {
      document.getElementById('notifToggle').classList.add('on');
      new Notification("DeGirob VIP", { body: "Notifications Enabled!" });
    }
  });
}

// التشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // 1. تحميل البيانات
  if (window.DEMO_MATCHES) window.STATE = { matches: DEMO_MATCHES, history: DEMO_HISTORY };
  
  // 2. التحقق من الترخيص
  const key = localStorage.getItem('degirob_license');
  if (key && ['DEGIROB-2026', 'VIP-ALPHA-001'].includes(key)) {
    document.getElementById('paywall').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'flex';
    showScreen('dashboard');
    if (window.Dashboard) Dashboard.render();
  }
});
