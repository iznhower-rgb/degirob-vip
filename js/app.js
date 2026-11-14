const App = {
  autoRefreshInterval: null,

  init() {
    console.info('[App] Init (v5.1.0)...');
    try {
      // تنظيف: إزالة أي شارة عالقة من نسخ سابقة
      const oldBadge = document.getElementById('statusBadge');
      if (oldBadge) {
        oldBadge.remove();
        console.info('[App] Removed leftover statusBadge');
      }

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
    } catch (err) {
      console.error('[App] enterApp:', err);
    }
  },

  async loadMatches() {
    console.info('[App] loadMatches (fresh)...');
    STATE.apiStatus = 'loading';
    STATE.matches = [];
    Dashboard.showLoading();

    try {
      const matches = await API.fetchMatches();
      STATE.matches = matches;
      STATE.apiError = null;

      if (matches.length === 0) {
        STATE.apiStatus = 'empty';
        console.info('[App] ⚪ No matches today');
      } else {
        STATE.apiStatus = 'live';
        console.info('[App] ✅ TOTAL:', matches.length);
      }
      Dashboard.render();

      // Auto-refresh فقط إذا توجد مباريات مباشرة
      if (matches.some(m => m.isLive)) {
        this.startAutoRefresh();
      }
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
  },

  startAutoRefresh() {
    if (this.autoRefreshInterval) clearInterval(this.autoRefreshInterval);
    this.autoRefreshInterval = setInterval(() => {
      if (document.visibilityState !== 'visible') return;

      // إذا لم تبقَ مباريات مباشرة، أوقف التحديث تلقائياً
      if (!STATE.matches.some(m => m.isLive)) {
        console.info('[App] No more live matches — stopping auto-refresh');
        clearInterval(this.autoRefreshInterval);
        this.autoRefreshInterval = null;
        return;
      }

      console.info('[App] Auto-refresh (3 min, live matches active)...');
      this.silentRefresh();
    }, 180000); // 3 دقائق
  },

  async silentRefresh() {
    try {
      const matches = await API.fetchMatches();
      if (matches.length > 0) {
        STATE.matches = matches;
        STATE.apiStatus = 'live';
        Dashboard.render();
        const allScreen = document.getElementById('allMatches');
        if (allScreen && allScreen.classList.contains('active')) Dashboard.renderAll();
      }
      // إذا رجع 0، نبقي البيانات القديمة (لا نمسح الشاشة)
    } catch (e) {
      console.warn('[App] Silent refresh failed:', e.message);
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
