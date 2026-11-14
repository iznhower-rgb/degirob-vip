const CONFIG = {
  VERSION: '7.1.0-detail-fix',
  VALID_KEYS: [
    'DEGIROB-2026',
    'VIP-ALPHA-001',
    'VIP-BETA-002',
    'VIP-2026-ELITE'
  ],
  STORAGE_KEYS: {
    LICENSE: 'degirob_license',
    LANG: 'degirob_lang',
    FAVORITES: 'degirob_favs'
  },
  DEFAULT_LANG: 'ar',

  API: {
    ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    TSDB_BASE: 'https://www.thesportsdb.com/api/v1/json/123',
    // خريطة لربط دوريات ESPN بدوريات TheSportsDB لجلب الترتيب
    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'uefa.europa': 4481, 'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360,
      'bra.1': 4351, 'arg.1': 4406, 'tur.1': 4339, 'bel.1': 4338,
      'sco.1': 4340, 'rus.1': 4355
    },
    TSDB_SEASON: '2024-2025',
    TIMEOUT_MS: 15000
  }
};
