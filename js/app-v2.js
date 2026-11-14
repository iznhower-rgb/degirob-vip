const App = {
  init() {
    console.info('[App] Init (v5.2.0-clean)...');
    try {
      STATE.lang = Storage.getLang();
      I18n.setLang(STATE.lang);
      STATE.favorites = Storage.getFavorites();
      STATE.apiStatus = 'loading';
      STATE.apiError = null;
      this.bindEvents();

      const license = Storage.getLicense();
      if (license && CONFIG.VALID_KEYS.includes(license)) {
        this.enterApp();
      } else {
        I18n.apply();
        document.getElementById('paywall').classList.remove('hidden');
        Navigation.showScreen('paywall');
        Paywall.init();
      }
    } catch (err) {
      console.error('[App] Init failed:', err);
    }
  },

  bindEvents() {
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggleLang());
    });

    document.querySelectorAll('.nav-item').forEach(n => {
      n.addEventListener('click', () => Navigation.switchTab(n.dataset.tab));
    });

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        Navigation.switchTab(Navigation.previousScreen || 'dashboard');
      });
    }

    const logo = document.querySelector('#dashboard .logo');
    if (logo) {
      let timer;
      logo.addEventListener('touchstart', () => {
        timer = setTimeout(() => { if (window.eruda) eruda.show(); }, 1500);
      });
      logo.addEventListener('touchend', () => clearTimeout(timer));
      logo.addEventListener('touchcancel', () => clearTimeout(timer));
    }

    const searchInput = document.getElementById('matchSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.allMatchesSearch = e.target.value;
        Dashboard.renderAll();
      });
    }

    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        STATE.allMatchesFilter = e.target.dataset.filter;
        Dashboard.renderAll();
      });
    });
  },

  toggleLang() {
    I18n.toggle();
    I18n.apply();
    if (STATE.matches.length) Dashboard.render();
    const fav = document.getElementById('favorites');
    if (fav && fav.classList.contains('active')) Favorites.render();
    const det = document.getElementById('detail');
    if (det && det.classList.contains('active') && STATE.currentMatchId) Detail.open(STATE.currentMatchId);
    const allScreen = document.getElementById('allMatches');
    if (allScreen && allScreen.classList.contains('active')) Dashboard.renderAll();
  },

  enterApp() {
    document.getElementById('paywall').classList.add('hidden');
    const nav = document.getElementById('bottomNav');
    if (nav) nav.style.display = 'flex';
    Navigation.showScreen('dashboard');
    I18n.apply();
    this.loadMatches();
  },

  async loadMatches() {
    STATE.apiStatus = 'loading';
    STATE.matches = [];
    Dashboard.showLoading();

    try {
      // استدعاء مباشر ونظيف بدون أي كاش
      const matches = await API.fetchMatches();
      STATE.matches = matches;
      STATE.apiError = null;
      STATE.apiStatus = matches.length ? 'live' : 'empty';
      Dashboard.render();
    } catch (err) {
      STATE.matches = [];
      STATE.apiStatus = 'error';
      STATE.apiError = { code: err.code || 'UNKNOWN', message: err.message, detail: err.detail || '' };
      Dashboard.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
