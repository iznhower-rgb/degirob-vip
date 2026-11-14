const CONFIG = {
  VERSION: '9.0.0-triple-merge',
  VALID_KEYS: [
    'DEGIROB-2026', 'VIP-ALPHA-001', 'VIP-BETA-002', 'VIP-2026-ELITE'
  ],
  STORAGE_KEYS: {
    LICENSE: 'degirob_license',
    LANG: 'degirob_lang',
    FAVORITES: 'degirob_favs',
    RAPIDAPI_CACHE: 'degirob_rapidapi_matches',
    BZZOIRO_CACHE: 'degirob_bzzoiro_matches'
  },
  DEFAULT_LANG: 'ar',

  API: {
    ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    TSDB_BASE: 'https://www.thesportsdb.com/api/v1/json/123',
    
    RAPIDAPI_KEY: '77d4790d9dmsh13cff0e2b88d900p13360fjsn7ce3c62d44c8',
    RAPIDAPI_HOST: 'free-api-live-football-data.p.rapidapi.com',
    RAPIDAPI_BASE: 'https://free-api-live-football-data.p.rapidapi.com',

    BZZOIRO_KEY: '108218eab3e619463be3a7a7feae2965f1303ff0',
    BZZOIRO_BASE: 'https://sports.bzzoiro.com/api/v2',

    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'uefa.europa': 4481, 'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360,
      'bra.1': 4351, 'arg.1': 4406, 'mar.1': 5385, 'egy.1': 5370,
      'tun.1': 5386, 'alg.1': 5387
    },
    TSDB_SEASON: '2024-2025',
    TIMEOUT_MS: 15000
  }
};
