const I18n = {
  t(key) {
    const dict = STATE.lang === 'ar' ? TRANSLATIONS_AR : TRANSLATIONS_EN;
    return dict[key] || key;
  },
  setLang(lang) {
    STATE.lang = lang;
    Storage.setLang(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  },
  toggle() {
    this.setLang(STATE.lang === 'ar' ? 'en' : 'ar');
  },
  apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    // NEW: يدعم كل أزرار اللغة (dashboard + favorites)
    document.querySelectorAll('.lang-toggle').forEach(btn => {
      btn.innerHTML = `<span>${STATE.lang === 'ar' ? 'EN' : 'AR'}</span>`;
    });
  }
};
