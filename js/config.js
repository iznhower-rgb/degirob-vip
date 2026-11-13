const CONFIG = {
  VERSION: '2.1.0-phase2-fix',
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
    MATCHES_CACHE: 'degirob_matches_cache_v2'
  },
  DEFAULT_LANG: 'ar',

  API: {
    FOOTBALL_BASE: 'https://v3.football.api-sports.io',
    FOOTBALL_KEY: '30382d0168e91297cbd2d35849103ec0',
    LEAGUES: [39, 140, 135, 78, 61],
    CACHE_MINUTES: 15,
    TIMEOUT_MS: 8000
  }
};
