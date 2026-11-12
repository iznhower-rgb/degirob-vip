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
      Navigation.showScreen('paywall');
      Paywall.init();
    }
  },

  bindEvents() {
    const langBtn = document.getElementById('langBtn');
    if (langBtn) langBtn.addEventListener('click', () => this.toggleLang());

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => Navigation.showScreen('dashboard'));
    }

    // 🔊 تفعيل الصوت والاهتزاز لكل زر أو بطاقة
    document.body.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.pick-card') || e.target.closest('.nav-item')) {
        Helpers.haptic();
        Helpers.playClick();
      }
    });
  },

  toggleLang() {
    I18n.toggle();
    I18n.apply();
    if (STATE.matches.length) Dashboard.render();
    if (STATE.currentMatchId) Detail.open(STATE.currentMatchId);
  },

  enterApp() {
    document.getElementById('paywall').classList.add('hidden');
    document.getElementById('bottomNav').style.display = 'flex';
    Navigation.showScreen('dashboard');
    I18n.apply();
    this.loadMatches();
    
    // ⏱️ تشغيل المؤقتات التنازلية
    Helpers.startCountdowns();
  },

  async loadMatches() {
    STATE.matches = DEMO_MATCHES;
    Dashboard.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
