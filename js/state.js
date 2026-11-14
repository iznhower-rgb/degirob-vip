const STATE = {
  matches: [],
  favorites: [],
  lang: CONFIG.DEFAULT_LANG,
  currentMatchId: null,
  apiStatus: 'loading',
  apiError: null,
  
  // إضافات البحث والفلترة
  allMatchesFilter: 'all', // 'all' | 'live' | 'upcoming'
  allMatchesSearch: ''
};
