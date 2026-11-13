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
    // أزرار اللغة في كل الشاشات
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.addEventListener('click', () => this.toggleLang());
    });

    // التبويبات السفلية
    document.querySelectorAll('.nav-item').forEach(n => {
      n.addEventListener('click', () => Navigation.switchTab(n.dataset.tab));
    });

    // زر الرجوع الذكي
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

    // إعادة رسم المفضلة إذا كانت مفتوحة
    const favScreen = document.getElementById('favorites');
    if (favScreen && favScreen.classList.contains('active')) {
      Favorites.render();
    }

    // إعادة رسم التفاصيل إذا كانت مفتوحة
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
