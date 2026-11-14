const CONFIG = {
  VERSION: '6.1.0-hybrid-logos',
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
    // مسارات ESPN الأساسية
    ESPN_BASE: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    ESPN_TEAMS: 'https://site.api.espn.com/apis/site/v2/sports/soccer',
    
    // مسارات TheSportsDB (لجلب الشعارات والأسماء)
    TSDB_BASE: 'https://www.thesportsdb.com/api/v1/json/3',
    TSDB_TEAMS: 'https://www.thesportsdb.com/api/v1/json/3',
    
    // قائمة الدوريات التي سيتم جلب فرقها
    ESPN_LEAGUES: [
      { slug: 'eng.1', name: 'Premier League', badge: 'PL' },
      { slug: 'esp.1', name: 'La Liga', badge: 'LL' },
      { slug: 'ita.1', name: 'Serie A', badge: 'SA' },
      { slug: 'ger.1', name: 'Bundesliga', badge: 'BL' },
      { slug: 'fra.1', name: 'Ligue 1', badge: 'L1' },
      { slug: 'uefa.champions', name: 'Champions League', badge: 'UCL' },
      { slug: 'uefa.europa', name: 'Europa League', badge: 'UEL' },
      { slug: 'ned.1', name: 'Eredivisie', badge: 'ED' },
      { slug: 'por.1', name: 'Primeira Liga', badge: 'PLP' },
      { slug: 'tur.1', name: 'Süper Lig', badge: 'SL' },
      { slug: 'ksa.1', name: 'Saudi Pro League', badge: 'SPL' },
      { slug: 'usa.1', name: 'MLS', badge: 'MLS' },
      { slug: 'mex.1', name: 'Liga MX', badge: 'MX' },
      { slug: 'bra.1', name: 'Brasileirão', badge: 'BRA' },
      { slug: 'arg.1', name: 'Argentine Primera', badge: 'ARG' }
    ],
    
    // خريطة لربط أسماء الدوريات في ESPN بأسماء دوريات TheSportsDB
    TSDB_LEAGUE_MAP: {
      'eng.1': 'English Premier League',
      'esp.1': 'Spanish La Liga',
      'ita.1': 'Italian Serie A',
      'ger.1': 'German Bundesliga',
      'fra.1': 'French Ligue 1',
      'uefa.champions': 'UEFA Champions League',
      'uefa.europa': 'UEFA Europa League',
      'ned.1': 'Dutch Eredivisie',
      'por.1': 'Portuguese Primeira Liga',
      'tur.1': 'Turkish Super Lig',
      'ksa.1': 'Saudi Pro League',
      'usa.1': 'American Major League Soccer',
      'mex.1': 'Mexican Primera League',
      'bra.1': 'Brazilian Serie A',
      'arg.1': 'Argentinian Primera Division'
    },
    
    TIMEOUT_MS: 15000
  }
};
