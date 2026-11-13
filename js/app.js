const App = {
  init() {
    console.info('[App] Initializing...');
    try {
      STATE.lang = Storage.getLang();
      I18n.setLang(STATE.lang);
      STATE.favorites = Storage.getFavorites();
      this.bindEvents();

      const license = Storage.getLicense();
      console.info('[App] License:', license || 'none');

      if (license && CONFIG.VALID_KEYS.includes(license)) {
        console.info('[App] Valid license — entering app');
        this.enterApp();
      } else {
        console.info('[App] Showing paywall');
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
        Navigation.switchTab(prev === 'favorites' ? 'favorites' : 'dashboard');
      });
    }
  },

  toggleLang() {
    I18n.toggle();
    I18n.apply();
    if (STATE.matches.length) Dashboard.render();

    const favScreen = document.getElementById('favorites');
    if (favScreen && favScreen.classList.contains('active')) Favorites.render();

    const detailScreen = document.getElementById('detail');
    if (detailScreen && detailScreen.classList.contains('active') && STATE.currentMatchId) {
      Detail.open(STATE.currentMatchId);
    }
  },

  enterApp() {
    console.info('[App] enterApp');
    try {
      document.getElementById('paywall').classList.add('hidden');
      const nav = document.getElementById('bottomNav');
      if (nav) nav.style.display = 'flex';
      Navigation.showScreen('dashboard');
      I18n.apply();
      this.loadMatches();
    } catch (err) {
      console.error('[App] enterApp error:', err);
      const dash = document.getElementById('dashboard');
      if (dash) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        dash.classList.add('active');
      }
    }
  },

  async loadMatches() {
    console.info('[App] Loading matches...');
    Dashboard.showLoading();
    try {
      const matches = await API.fetchMatches();
      STATE.matches = matches;
      STATE.usingDemo = (matches === DEMO_MATCHES);
      console.info('[App] Loaded:', matches.length, '| demo:', STATE.usingDemo);
      Dashboard.render();
    } catch (err) {
      console.error('[App] Load failed:', err);
      STATE.matches = DEMO_MATCHES;
      STATE.usingDemo = true;
      Dashboard.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
