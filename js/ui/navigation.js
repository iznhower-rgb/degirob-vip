const Navigation = {
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
    window.scrollTo(0, 0);
  },

  switchTab(tab) {
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.tab === tab);
    });
    this.showScreen(tab);
  }
};
