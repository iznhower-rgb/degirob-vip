const Navigation = {
  showScreen: (id) => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  },
  switchTab: (tab) => {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
    Navigation.showScreen(tab);
    if (tab === 'history') History.render(); // استدعاء دالة عرض السجل
  }
};
