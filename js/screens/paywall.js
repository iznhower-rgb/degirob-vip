const Paywall = {
  init() {
    const form = document.getElementById('keyForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.unlock();
    });
  },

  unlock() {
    const input = document.getElementById('keyInput');
    const key = input.value.trim().toUpperCase();
    if (CONFIG.VALID_KEYS.includes(key)) {
      Storage.setLicense(key);
      App.enterApp();
    } else {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 600);
      alert(I18n.t('invalidKey'));
    }
  }
};
