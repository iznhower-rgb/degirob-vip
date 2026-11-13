const Navigation = {
  previousScreen: 'dashboard',

  showScreen(id) {
    const current = document.querySelector('.screen.active');
    if (current && current.id !== id && current.id !== 'paywall' && current.id !== 'detail') {
      this.previousScreen = current.id;
    }
    
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
    
    // إخفاء شارة الحالة (LIVE) عند الانتقال لشاشة التفاصيل
    const badge = document.getElementById('statusBadge');
    if (badge) {
      badge.style.display = (id === 'detail') ? 'none' : 'block';
    }

    window.scrollTo(0, 0);
  },

  switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.tab === tab);
    });
    
    if (tab === 'favorites') Favorites.render();
    if (tab === 'all') Dashboard.renderAll();
    
    // العودة للرئيسية أو المباريات يظهر الشارة مرة أخرى
    const targetScreen = tab === 'all' ? 'allMatches' : tab;
    this.showScreen(targetScreen);
  }
};
