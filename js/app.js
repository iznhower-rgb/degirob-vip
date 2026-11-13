const App = {
  init() {
    STATE.lang = Storage.getLang();
    I18n.setLang(STATE.lang);
    STATE.favorites = Storage.getFavorites();
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
  },

  bindEvents() {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', () => this.toggleLang());

    const backBtn = document.getElementById('backBtn');
    if (backBtn) backBtn.addEventListener('click', () => Navigation.showScreen('dashboard'));
  },

  toggleLang() {
    I18n.toggle();
    I18n.apply();
    if (STATE.matches.length) Dashboard.render();
    const detailScreen = document.getElementById('detail');
    if (detailScreen.classList.contains('active') && STATE.currentMatchId) {
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
    STATE.matches = DEMO_MATCHES;
    Dashboard.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
