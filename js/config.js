const CONFIG = {
  VERSION: '5.1.0-global',
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
      // ═══════ أوروبا — الدوريات الكبرى ═══════
      { slug: 'eng.1', name: 'Premier League', badge: 'PL' },
      { slug: 'esp.1', name: 'La Liga', badge: 'LL' },
      { slug: 'ita.1', name: 'Serie A', badge: 'SA' },
      { slug: 'ger.1', name: 'Bundesliga', badge: 'BL' },
      { slug: 'fra.1', name: 'Ligue 1', badge: 'L1' },
      // ═══════ أوروبا — الدرجة الثانية والكؤوس ═══════
      { slug: 'eng.2', name: 'English Championship', badge: 'CHA' },
      { slug: 'eng.3', name: 'League One', badge: 'L1E' },
      { slug: 'eng.fa', name: 'FA Cup', badge: 'FAC' },
      { slug: 'eng.league_cup', name: 'Carabao Cup', badge: 'EFL' },
      { slug: 'esp.2', name: 'Segunda División', badge: 'SEG' },
      { slug: 'esp.copa_del_rey', name: 'Copa del Rey', badge: 'CDR' },
      { slug: 'ita.2', name: 'Serie B', badge: 'SB' },
      { slug: 'ita.coppa_italia', name: 'Coppa Italia', badge: 'CI' },
      { slug: 'ger.2', name: '2. Bundesliga', badge: '2BL' },
      { slug: 'ger.dfb_pokal', name: 'DFB Pokal', badge: 'DFB' },
      { slug: 'fra.2', name: 'Ligue 2', badge: 'L2' },
      { slug: 'fra.coupe_de_france', name: 'Coupe de France', badge: 'CDF' },
      // ═══════ أوروبا — دوريات أخرى ═══════
      { slug: 'ned.1', name: 'Eredivisie', badge: 'ED' },
      { slug: 'por.1', name: 'Primeira Liga', badge: 'PLP' },
      { slug: 'bel.1', name: 'Belgian Pro League', badge: 'BPL' },
      { slug: 'sco.1', name: 'Scottish Premiership', badge: 'SP' },
      { slug: 'tur.1', name: 'Süper Lig', badge: 'SL' },
      { slug: 'gre.1', name: 'Greek Super League', badge: 'GSL' },
      { slug: 'rus.1', name: 'Russian Premier League', badge: 'RPL' },
      { slug: 'ukr.1', name: 'Ukrainian Premier League', badge: 'UPL' },
      { slug: 'aut.1', name: 'Austrian Bundesliga', badge: 'AUT' },
      { slug: 'sui.1', name: 'Swiss Super League', badge: 'SUI' },
      { slug: 'den.1', name: 'Danish Superliga', badge: 'DEN' },
      { slug: 'swe.1', name: 'Swedish Allsvenskan', badge: 'SWE' },
      { slug: 'nor.1', name: 'Norwegian Eliteserien', badge: 'NOR' },
      { slug: 'pol.1', name: 'Ekstraklasa', badge: 'POL' },
      { slug: 'cze.1', name: 'Czech First League', badge: 'CZE' },
      { slug: 'cro.1', name: 'HNL', badge: 'CRO' },
      // ═══════ البطولات الأوروبية ═══════
      { slug: 'uefa.champions', name: 'Champions League', badge: 'UCL' },
      { slug: 'uefa.europa', name: 'Europa League', badge: 'UEL' },
      { slug: 'uefa.europa_conf', name: 'Conference League', badge: 'UECL' },
      // ═══════ آسيا والشرق الأوسط ═══════
      { slug: 'ksa.1', name: 'Saudi Pro League', badge: 'SPL' },
      { slug: 'uae.1', name: 'UAE Pro League', badge: 'UAE' },
      { slug: 'qat.1', name: 'Qatar Stars League', badge: 'QSL' },
      { slug: 'irn.1', name: 'Persian Gulf Pro League', badge: 'IRN' },
      { slug: 'jpn.1', name: 'J1 League', badge: 'J1' },
      { slug: 'kor.1', name: 'K League 1', badge: 'K1' },
      { slug: 'chn.1', name: 'Chinese Super League', badge: 'CSL' },
      { slug: 'aus.1', name: 'A-League', badge: 'AUS' },
      { slug: 'ind.1', name: 'Indian Super League', badge: 'ISL' },
      { slug: 'afc.champions', name: 'AFC Champions League', badge: 'AFC' },
      // ═══════ أفريقيا ═══════
      { slug: 'egy.1', name: 'Egyptian Premier League', badge: 'EGY' },
      { slug: 'rsa.1', name: 'South African PSL', badge: 'PSL' },
      { slug: 'caf.champions', name: 'CAF Champions League', badge: 'CAF' },
      // ═══════ أمريكا الشمالية ═══════
      { slug: 'usa.1', name: 'MLS', badge: 'MLS' },
      { slug: 'mex.1', name: 'Liga MX', badge: 'MX' },
      { slug: 'mex.2', name: 'Liga de Expansión', badge: 'MX2' },
      // ═══════ أمريكا الجنوبية ═══════
      { slug: 'bra.1', name: 'Brasileirão', badge: 'BRA' },
      { slug: 'bra.2', name: 'Série B', badge: 'BRA2' },
      { slug: 'arg.1', name: 'Argentine Primera', badge: 'ARG' },
      { slug: 'chi.1', name: 'Chilean Primera', badge: 'CHI' },
      { slug: 'col.1', name: 'Colombian Primera A', badge: 'COL' },
      { slug: 'uru.1', name: 'Uruguayan Primera', badge: 'URU' },
      { slug: 'per.1', name: 'Peruvian Primera', badge: 'PER' },
      // ═══════ دولي ═══════
      { slug: 'fifa.world', name: 'World Cup', badge: 'WC' },
      { slug: 'fifa.friendly', name: 'International Friendly', badge: 'INT' }
    ],
    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'uefa.europa': 4481, 'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360,
      'bra.1': 4351, 'arg.1': 4406
    },
    TSDB_SEASON: '2024-2025',
    TIMEOUT_MS: 12000,
    BATCH_SIZE: 8,
    BATCH_DELAY_MS: 80
  }
};
