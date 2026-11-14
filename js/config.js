const CONFIG = {
  VERSION: '4.2.0-global',
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
    MATCHES_CACHE: 'degirob_matches_cache_v8',
    H2H_CACHE: 'degirob_h2h_cache_v2',
    STANDINGS_CACHE: 'degirob_standings_cache_v2'
  },
  DEFAULT_LANG: 'ar',

  API: {
    ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    TSDB_BASE: 'https://www.thesportsdb.com/api/v1/json/123',
    ESPN_LEAGUES: [
      // الدوريات الأوروبية الكبرى
      { slug: 'eng.1', name: 'Premier League', badge: 'PL' },
      { slug: 'esp.1', name: 'La Liga', badge: 'LL' },
      { slug: 'ita.1', name: 'Serie A', badge: 'SA' },
      { slug: 'ger.1', name: 'Bundesliga', badge: 'BL' },
      { slug: 'fra.1', name: 'Ligue 1', badge: 'L1' },
      // البطولات الأوروبية
      { slug: 'uefa.champions', name: 'Champions League', badge: 'UCL' },
      { slug: 'uefa.europa', name: 'Europa League', badge: 'UEL' },
      { slug: 'uefa.europa_conf', name: 'Conference League', badge: 'UECL' },
      // الدوريات الأوروبية الأخرى
      { slug: 'ned.1', name: 'Eredivisie', badge: 'ED' },
      { slug: 'por.1', name: 'Primeira Liga', badge: 'PLP' },
      { slug: 'tur.1', name: 'Süper Lig', badge: 'SL' },
      { slug: 'bel.1', name: 'Belgian Pro League', badge: 'BPL' },
      { slug: 'sco.1', name: 'Scottish Premiership', badge: 'SP' },
      { slug: 'rus.1', name: 'Russian Premier League', badge: 'RPL' },
      { slug: 'ukr.1', name: 'Ukrainian Premier League', badge: 'UPL' },
      { slug: 'gre.1', name: 'Greek Super League', badge: 'GSL' },
      { slug: 'aut.1', name: 'Austrian Bundesliga', badge: 'AUT' },
      { slug: 'sui.1', name: 'Swiss Super League', badge: 'SUI' },
      // الدوريات العربية والآسيوية
      { slug: 'ksa.1', name: 'Saudi Pro League', badge: 'SPL' },
      { slug: 'sau.1', name: 'Saudi Pro League', badge: 'SPL' },
      { slug: 'uae.1', name: 'UAE Pro League', badge: 'UAE' },
      { slug: 'qat.1', name: 'Qatar Stars League', badge: 'QSL' },
      { slug: 'egy.1', name: 'Egyptian Premier League', badge: 'EGY' },
      { slug: 'afc.champions', name: 'AFC Champions League', badge: 'AFC' },
      // الأمريكتان
      { slug: 'usa.1', name: 'MLS', badge: 'MLS' },
      { slug: 'mex.1', name: 'Liga MX', badge: 'MX' },
      { slug: 'bra.1', name: 'Brasileirão', badge: 'BRA' },
      { slug: 'arg.1', name: 'Argentine Primera', badge: 'ARG' },
      { slug: 'chi.1', name: 'Chilean Primera', badge: 'CHI' },
      { slug: 'col.1', name: 'Colombian Primera A', badge: 'COL' },
      // أفريقيا
      { slug: 'caf.champions', name: 'CAF Champions League', badge: 'CAF' }
    ],
    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'uefa.europa': 4481, 'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360,
      'sau.1': 5360, 'bra.1': 4351, 'arg.1': 4406
    },
    TSDB_SEASON: '2024-2025',
    CACHE_MINUTES: 5,
    CACHE_H2H_MINUTES: 1440,
    CACHE_STANDINGS_MINUTES: 360,
    TIMEOUT_MS: 12000,
    BATCH_SIZE: 6,
    BATCH_DELAY_MS: 250
  }
};
