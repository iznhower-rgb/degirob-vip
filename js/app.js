const App = {
  init: () => {
    STATE.matches = DEMO_MATCHES;
    STATE.history = DEMO_HISTORY; // ربط السجل
    STATE.lang = Storage.getLang();
    I18n.setLang(STATE.lang);
    
    // ربط الأزرار
    document.getElementById('backBtn').addEventListener('click', () => Navigation.showScreen('dashboard'));
    document.getElementById('legalBackBtn').addEventListener('click', () => Navigation.showScreen('profile'));
    document.getElementById('langBtn').addEventListener('click', () => {
      I18n.setLang(STATE.lang === 'ar' ? 'en' : 'ar');
      document.getElementById('langBtn').innerText = STATE.lang === 'ar' ? 'EN' : 'AR';
    });

    // التحقق من الترخيص
    if (Storage.getLicense() && CONFIG.VALID_KEYS.includes(Storage.getLicense())) {
      App.enterApp();
    } else {
      Navigation.showScreen('paywall');
      Paywall.init();
    }
  },
  
  enterApp: () => {
    document.getElementById('paywall').classList.add('hidden');
    document.getElementById('bottomNav').style.display = 'flex';
    Navigation.showScreen('dashboard');
    Dashboard.render();
  }
};

document.addEventListener('DOMContentLoaded', App.init);
