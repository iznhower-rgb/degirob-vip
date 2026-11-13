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
    window.scrollTo(0, 0);
  },

  switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.tab === tab);
    });
    if (tab === 'favorites') Favorites.render();
    if (tab === 'all') Dashboard.renderAll();
    this.showScreen(tab === 'all' ? 'allMatches' : tab);
  }
};
