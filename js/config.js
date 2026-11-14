const CONFIG = {
  VERSION: '6.3.0-stable-global',
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
    ESPN_LEAGUES: [
      // أوروبا - الكبرى
      { slug: 'eng.1', name: 'Premier League', badge: 'PL' },
      { slug: 'esp.1', name: 'La Liga', badge: 'LL' },
      { slug: 'ita.1', name: 'Serie A', badge: 'SA' },
      { slug: 'ger.1', name: 'Bundesliga', badge: 'BL' },
      { slug: 'fra.1', name: 'Ligue 1', badge: 'L1' },
      // أوروبا - البطولات القارية
      { slug: 'uefa.champions', name: 'Champions League', badge: 'UCL' },
      { slug: 'uefa.europa', name: 'Europa League', badge: 'UEL' },
      { slug: 'uefa.europa.conf', name: 'Conference League', badge: 'UECL' },
      // أوروبا - دوريات أخرى
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
      { slug: 'den.1', name: 'Danish Superliga', badge: 'DEN' },
      { slug: 'swe.1', name: 'Swedish Allsvenskan', badge: 'SWE' },
      { slug: 'nor.1', name: 'Norwegian Eliteserien', badge: 'NOR' },
      // الشرق الأوسط وأفريقيا
      { slug: 'ksa.1', name: 'Saudi Pro League', badge: 'SPL' },
      { slug: 'uae.1', name: 'UAE Pro League', badge: 'UAE' },
      { slug: 'qat.1', name: 'Qatar Stars League', badge: 'QSL' },
      { slug: 'egy.1', name: 'Egyptian Premier League', badge: 'EGY' },
      { slug: 'caf.champions', name: 'CAF Champions League', badge: 'CAF' },
      { slug: 'caf.confederation', name: 'CAF Confederation Cup', badge: 'CAF2' },
      // الأمريكتان
      { slug: 'usa.1', name: 'MLS', badge: 'MLS' },
      { slug: 'mex.1', name: 'Liga MX', badge: 'MX' },
      { slug: 'bra.1', name: 'Brasileirão', badge: 'BRA' },
      { slug: 'arg.1', name: 'Argentine Primera', badge: 'ARG' },
      { slug: 'chi.1', name: 'Chilean Primera', badge: 'CHI' },
      { slug: 'col.1', name: 'Colombian Primera A', badge: 'COL' },
      // آسيا وأوقيانوسيا
      { slug: 'jpn.1', name: 'J1 League', badge: 'J1' },
      { slug: 'kor.1', name: 'K League 1', badge: 'K1' },
      { slug: 'chn.1', name: 'Chinese Super League', badge: 'CSL' },
      { slug: 'aus.1', name: 'A-League', badge: 'AUS' },
      { slug: 'afc.champions', name: 'AFC Champions League', badge: 'AFC' },
      // دولي
      { slug: 'fifa.friendly', name: 'International Friendly', badge: 'INT' },
      { slug: 'fifa.world', name: 'World Cup', badge: 'WC' }
    ],
    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'uefa.europa': 4481, 'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360,
      'bra.1': 4351, 'arg.1': 4406
    },
    TSDB_SEASON: '2024-2025',
    TIMEOUT_MS: 15000,
    BATCH_SIZE: 8,
    BATCH_DELAY_MS: 100
  }
};
