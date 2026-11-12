const Storage = {
  getLicense: () => localStorage.getItem(CONFIG.STORAGE_KEYS.LICENSE),
  setLicense: (k) => localStorage.setItem(CONFIG.STORAGE_KEYS.LICENSE, k),
  getLang: () => localStorage.getItem(CONFIG.STORAGE_KEYS.LANG) || 'ar',
  setLang: (l) => localStorage.setItem(CONFIG.STORAGE_KEYS.LANG, l)
};
