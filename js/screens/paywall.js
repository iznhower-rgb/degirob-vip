const Paywall = {
  init: () => {
    document.getElementById('unlockBtn').addEventListener('click', () => {
      const key = document.getElementById('keyInput').value.trim().toUpperCase();
      if (CONFIG.VALID_KEYS.includes(key)) {
        Storage.setLicense(key);
        App.enterApp();
      } else { alert('Invalid Key'); }
    });
  }
};
