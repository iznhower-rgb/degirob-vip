const App = {
  init() {
    try {
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
    } catch (e) { console.error("Init Error:", e); }
  },

  bindEvents() {
    try {
      const langBtn = document.getElementById('langBtn');
      if (langBtn) langBtn.addEventListener('click', () => this.toggleLang());
      
      const backBtn = document.getElementById('backBtn');
      if (backBtn) backBtn.addEventListener('click', () => Navigation.showScreen('dashboard'));

      document.body.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('.pick-card') || e.target.closest('.nav-item')) {
          Helpers.haptic();
          Helpers.playClick();
        }
      });

      const dashboard = document.getElementById('dashboard');
      if (dashboard) {
        let startY = 0; let pulling = false;
        dashboard.addEventListener('touchstart', (e) => {
          if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
        }, { passive: true });

        dashboard.addEventListener('touchmove', (e) => {
          if (!pulling) return;
          const y = e.touches[0].clientY;
          const dist = y - startY;
          if (dist > 0 && window.scrollY === 0) {
            document.body.style.transform = `translateY(${Math.min(dist * 0.3, 50)}px)`;
          }
        }, { passive: true });

        dashboard.addEventListener('touchend', (e) => {
          if (!pulling) return;
          const dist = e.changedTouches[0].clientY - startY;
          document.body.style.transform = '';
          pulling = false;
          if (dist > 100) { Helpers.haptic(); this.loadMatches(); }
        });
      }
    } catch (e) { console.error("Bind Error:", e); }
  },

  toggleLang() {
    try {
      I18n.toggle(); I18n.apply();
      if (STATE.matches.length) Dashboard.render();
      if (STATE.currentMatchId) Detail.open(STATE.currentMatchId);
    } catch (e) {}
  },

  enterApp() {
    try {
      document.getElementById('paywall').classList.add('hidden');
      document.getElementById('bottomNav').style.display = 'flex';
      Navigation.showScreen('dashboard');
      I18n.apply();
      this.loadMatches();
      Helpers.startCountdowns();
    } catch (e) {}
  },

  async loadMatches() {
    STATE.matches = DEMO_MATCHES;
    Dashboard.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
