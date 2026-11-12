const App = {
  init() {
    // 1. Load language
    STATE.lang = Storage.getLang();
    I18n.setLang(STATE.lang);

    // 2. Load favorites
    STATE.favorites = Storage.getFavorites();

    // 3. Bind global events
    this.bindEvents();

    // 4. Check license
    const license = Storage.getLicense();
    if (license && CONFIG.VALID_KEYS.includes(license)) {
      this.enterApp();
    } else {
      Navigation.showScreen('paywall');
      Paywall.init();
    }
  },

  bindEvents() {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => this.toggleLang());
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        Navigation.showScreen('dashboard');
      });
    }
  },

  toggleLang() {
    I18n.toggle();
    I18n.apply();
    if (STATE.matches.length) {
      Dashboard.render();
    }
    if (STATE.currentMatchId) {
      Detail.open(STATE.currentMatchId);
    }
  },

  enterApp() {
    document.getElementById('paywall').classList.add('hidden');
    document.getElementById('bottomNav').style.display = 'flex';
    Navigation.showScreen('dashboard');
    I18n.apply();
    this.loadMatches();
  },

  async loadMatches() {
    // Phase 1: use demo data (will be replaced by real API in phase 2)
    STATE.matches = DEMO_MATCHES;
    Dashboard.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
