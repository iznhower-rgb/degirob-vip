const CONFIG = {
  VERSION: '6.2.0-stable',
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
    // مسارات ESPN لجلب المباريات
    ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    
    // مسارات TheSportsDB (احتياطي للترتيب والمواجهات فقط)
    TSDB_BASE: 'https://www.thesportsdb.com/api/v1/json/123',
    
    // قائمة الدوريات (مختصرة لضمان السرعة والاستقرار)
    ESPN_LEAGUES: [
      { slug: 'eng.1', name: 'الدوري الإنجليزي', badge: 'PL' },
      { slug: 'esp.1', name: 'الدوري الإسباني', badge: 'LL' },
      { slug: 'ita.1', name: 'الدوري الإيطالي', badge: 'SA' },
      { slug: 'ger.1', name: 'الدوري الألماني', badge: 'BL' },
      { slug: 'fra.1', name: 'الدوري الفرنسي', badge: 'L1' },
      { slug: 'uefa.champions', name: 'دوري أبطال أوروبا', badge: 'UCL' },
      { slug: 'uefa.europa', name: 'الدوري الأوروبي', badge: 'UEL' },
      { slug: 'ned.1', name: 'الدوري الهولندي', badge: 'ED' },
      { slug: 'por.1', name: 'الدوري البرتغالي', badge: 'PLP' },
      { slug: 'tur.1', name: 'الدوري التركي', badge: 'SL' },
      { slug: 'ksa.1', name: 'دوري روشن السعودي', badge: 'SPL' },
      { slug: 'usa.1', name: 'الدوري الأمريكي', badge: 'MLS' },
      { slug: 'mex.1', name: 'الدوري المكسيكي', badge: 'MX' },
      { slug: 'bra.1', name: 'الدوري البرازيلي', badge: 'BRA' },
      { slug: 'arg.1', name: 'الدوري الأرجنتيني', badge: 'ARG' },
      { slug: 'fifa.friendly', name: 'مباريات دولية ودية', badge: 'INT' }
    ],
    
    // خريطة للترتيب في TheSportsDB
    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360, 'bra.1': 4351,
      'arg.1': 4406
    },
    TSDB_SEASON: '2024-2025',
    TIMEOUT_MS: 15000
  }
};
