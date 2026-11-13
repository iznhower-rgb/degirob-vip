const CONFIG = {
  VERSION: '4.0.0-all',
  VALID_KEYS: [
    'DEGIROB-2026',
    'VIP-ALPHA-001',
    'VIP-BETA-002',
    'VIP-2026-ELITE'
  ],
  STORAGE_KEYS: {
    LICENSE: 'degirob_license',
    LANG: 'degirob_lang',
    FAVORITES: 'degirob_favs',
    MATCHES_CACHE: 'degirob_matches_cache_v6',
    H2H_CACHE: 'degirob_h2h_cache_v2',
    STANDINGS_CACHE: 'degirob_standings_cache_v2'
  },
  DEFAULT_LANG: 'ar',

  API: {
    ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    TSDB_BASE: 'https://www.thesportsdb.com/api/v1/json/123',
    TSDB_LEAGUES: {
      'eng.1': 4328,
      'esp.1': 4335,
      'ita.1': 4332,
      'ger.1': 4331,
      'fra.1': 4334,
      'ned.1': 4337,
      'por.1': 4344,
      'uefa.champions': 4480,
      'uefa.europa': 4481
    },
    TSDB_SEASON: '2024-2025',
    CACHE_MINUTES: 5,
    CACHE_H2H_MINUTES: 1440,
    CACHE_STANDINGS_MINUTES: 360,
    TIMEOUT_MS: 15000
  }
};
