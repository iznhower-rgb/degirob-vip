const I18n = {
  t: (k) => k,
  setLang: (l) => { STATE.lang = l; Storage.setLang(l); document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; }
};
