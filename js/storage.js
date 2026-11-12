const Storage = {
  getLicense() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.LICENSE);
  },
  setLicense(key) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LICENSE, key);
  },
  removeLicense() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.LICENSE);
  },
  getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.FAVORITES) || '[]');
    } catch (e) {
      return [];
    }
  },
  setFavorites(arr) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.FAVORITES, JSON.stringify(arr));
  },
  getLang() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.LANG) || CONFIG.DEFAULT_LANG;
  },
  setLang(lang) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.LANG, lang);
  }
};
