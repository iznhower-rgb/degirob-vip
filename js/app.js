const App = {
  autoRefreshInterval: null,

  init() {
    console.info('[App] Init...');
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
      document.getElementById('paywall').classList.remove('hidden');
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
        const prev = Navigation.previousScreen || 'dashboard';
        Navigation.switchTab(prev);
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

    // ربط البحث
    const searchInput = document.getElementById('matchSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.allMatchesSearch = e.target.value;
        Dashboard.renderAll();
      });
    }

    // ربط الفلاتر
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
    if (det && det.classList.contains('active') && STATE.currentMatchId) {
      Detail.open(STATE.currentMatchId);
    }

    const allScreen = document.getElementById('allMatches');
    if (allScreen && allScreen.classList.contains('active')) Dashboard.renderAll();
  },

  enterApp() {
    try {
      document.getElementById('paywall').classList.add('hidden');
      const nav = document.getElementById('bottomNav');
      if (nav) nav.style.display = 'flex';
      Navigation.showScreen('dashboard');
      I18n.apply();
      this.loadMatches();
      this.startAutoRefresh();
    } catch (err) {
      console.error('[App] enterApp:', err);
    }
  },

  startAutoRefresh() {
    if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
    this.autoRefreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && STATE.matches.some(m => m.isLive)) {
        console.info('[App] Auto-refreshing live data...');
        this.silentRefresh();
      }
    }, 60000);
  },

  async silentRefresh() {
    try {
      const matches = await API.fetchMatches(true);
      STATE.matches = matches;
      Dashboard.render();
      const allScreen = document.getElementById('allMatches');
      if (allScreen && allScreen.classList.contains('active')) Dashboard.renderAll();
    } catch (err) {
      console.warn('[App] Silent refresh failed:', err.message);
    }
  },

  async loadMatches() {
    console.info('[App] loadMatches...');
    STATE.apiStatus = 'loading';
    STATE.matches = [];
    Dashboard.showLoading();

    try {
      const matches = await API.fetchMatches();
      STATE.matches = matches;
      STATE.apiStatus = 'live';
      STATE.apiError = null;
      console.info('[App] ✅ TOTAL:', matches.length);
      Dashboard.render();
    } catch (err) {
      console.error('[App] ❌', err.code, err.message);
      STATE.matches = [];
      STATE.apiStatus = 'error';
      STATE.apiError = {
        code: err.code || 'UNKNOWN',
        message: err.message || 'Unknown error',
        detail: err.detail || ''
      };
      Dashboard.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((reg) => console.info('[SW] ✅ Registered:', reg.scope))
      .catch((err) => console.warn('[SW] ❌ Register failed:', err));
  });
}
