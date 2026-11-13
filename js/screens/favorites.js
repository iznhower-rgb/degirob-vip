const Favorites = {
  render() {
    const container = document.getElementById('favoritesList');
    if (!container) return;

    const favMatches = STATE.matches.filter(m => STATE.favorites.includes(m.id));

    // تحديث العنوان الفرعي بعدد المفضلة
    const subEl = document.querySelector('#favorites .greeting-sub');
    if (subEl) {
      subEl.textContent = favMatches.length
        ? `${favMatches.length} ${I18n.t('matchesSaved')}`
        : I18n.t('myFavoritesSub');
    }

    // حالة فارغة
    if (!favMatches.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">${I18n.t('noFavorites')}</div>
          <div class="empty-state-sub">${I18n.t('noFavoritesSub')}</div>
        </div>
      `;
      return;
    }

    // عرض البطاقات بإعادة استخدام Dashboard.renderCard
    container.innerHTML = favMatches.map(m => {
      const isGolden = m.analysis.confidence !== 'low';
      return Dashboard.renderCard(m, isGolden);
    }).join('');
  }
};
