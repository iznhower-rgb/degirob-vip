const CONFIG = {
  VERSION: '5.3.0-continental',
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
      // ═══════════════ البطولات القارية والدولية ═══════════════
      // أوروبا (UEFA)
      { slug: 'uefa.champions', name: 'دوري أبطال أوروبا', badge: 'UCL' },
      { slug: 'uefa.europa', name: 'الدوري الأوروبي', badge: 'UEL' },
      { slug: 'uefa.europa.conf', name: 'دوري المؤتمر الأوروبي', badge: 'UECL' },
      { slug: 'uefa.super_cup', name: 'كأس السوبر الأوروبي', badge: 'USC' },
      { slug: 'uefa.nations', name: 'دوري الأمم الأوروبية', badge: 'UNL' },
      // أمريكا الجنوبية (CONMEBOL)
      { slug: 'conmebol.libertadores', name: 'كوبا ليبرتادوريس', badge: 'LIB' },
      { slug: 'conmebol.sudamericana', name: 'كوبا سودأمريكانا', badge: 'SUD' },
      { slug: 'conmebol.recopa', name: 'ريكوبا سودأمريكانا', badge: 'REC' },
      // أمريكا الشمالية (CONCACAF)
      { slug: 'concacaf.champions', name: 'دوري أبطال الكونكاكاف', badge: 'CON' },
      { slug: 'concacaf.leagues.cup', name: 'كأس الدوريات', badge: 'LC' },
      // آسيا (AFC)
      { slug: 'afc.champions', name: 'دوري أبطال آسيا', badge: 'AFC' },
      { slug: 'afc.cup', name: 'كأس آسيا', badge: 'AFC2' },
      // أفريقيا (CAF)
      { slug: 'caf.champions', name: 'دوري أبطال أفريقيا', badge: 'CAF' },
      { slug: 'caf.confederation', name: 'كأس الكونفدرالية الأفريقية', badge: 'CAF2' },
      // دولي (FIFA)
      { slug: 'fifa.world', name: 'كأس العالم', badge: 'WC' },
      { slug: 'fifa.cwc', name: 'كأس العالم للأندية', badge: 'CWC' },
      { slug: 'fifa.worldq.uefa', name: 'تصفيات كأس العالم (أوروبا)', badge: 'WCQ' },
      { slug: 'fifa.worldq.caf', name: 'تصفيات كأس العالم (أفريقيا)', badge: 'WCQ' },
      { slug: 'fifa.worldq.afc', name: 'تصفيات كأس العالم (آسيا)', badge: 'WCQ' },

      // ═══════════════ الدوريات المحلية الكبرى ═══════════════
      // إنجلترا
      { slug: 'eng.1', name: 'الدوري الإنجليزي الممتاز', badge: 'PL' },
      { slug: 'eng.2', name: 'دوري البطولة الإنجليزي', badge: 'CHA' },
      { slug: 'eng.fa', name: 'كأس الاتحاد الإنجليزي', badge: 'FAC' },
      { slug: 'eng.league_cup', name: 'كأس الرابطة الإنجليزية', badge: 'EFL' },
      // إسبانيا
      { slug: 'esp.1', name: 'الدوري الإسباني', badge: 'LL' },
      { slug: 'esp.2', name: 'الدوري الإسباني الثاني', badge: 'SEG' },
      { slug: 'esp.copa_del_rey', name: 'كأس ملك إسبانيا', badge: 'CDR' },
      // إيطاليا
      { slug: 'ita.1', name: 'الدوري الإيطالي', badge: 'SA' },
      { slug: 'ita.2', name: 'الدوري الإيطالي الثاني', badge: 'SB' },
      { slug: 'ita.coppa_italia', name: 'كأس إيطاليا', badge: 'CI' },
      // ألمانيا
      { slug: 'ger.1', name: 'الدوري الألماني', badge: 'BL' },
      { slug: 'ger.2', name: 'الدوري الألماني الثاني', badge: '2BL' },
      { slug: 'ger.dfb_pokal', name: 'كأس ألمانيا', badge: 'DFB' },
      // فرنسا
      { slug: 'fra.1', name: 'الدوري الفرنسي', badge: 'L1' },
      { slug: 'fra.2', name: 'الدوري الفرنسي الثاني', badge: 'L2' },
      { slug: 'fra.coupe_de_france', name: 'كأس فرنسا', badge: 'CDF' },
      // البرتغال
      { slug: 'por.1', name: 'الدوري البرتغالي', badge: 'PLP' },
      { slug: 'por.taca_de_portugal', name: 'كأس البرتغال', badge: 'TP' },
      // هولندا
      { slug: 'ned.1', name: 'الدوري الهولندي', badge: 'ED' },
      { slug: 'ned.knvb_beker', name: 'كأس هولندا', badge: 'KNVB' },
      // تركيا
      { slug: 'tur.1', name: 'الدوري التركي', badge: 'SL' },
      { slug: 'tur.turkish_cup', name: 'كأس تركيا', badge: 'TC' },
      // السعودية
      { slug: 'ksa.1', name: 'دوري روشن السعودي', badge: 'SPL' },
      { slug: 'ksa.crown_prince_cup', name: 'كأس ولي العهد', badge: 'KCP' },
      // مصر
      { slug: 'egy.1', name: 'الدوري المصري الممتاز', badge: 'EGY' },
      // الإمارات
      { slug: 'uae.1', name: 'دوري أدنوك الإماراتي', badge: 'UAE' },
      // قطر
      { slug: 'qat.1', name: 'دوري نجوم قطر', badge: 'QSL' },
      // المغرب
      { slug: 'mar.1', name: 'البطولة المغربية', badge: 'MAR' },
      // تونس
      { slug: 'tun.1', name: 'الرابطة التونسية', badge: 'TUN' },
      // الجزائر
      { slug: 'alg.1', name: 'الدوري الجزائري', badge: 'ALG' },
      // أمريكا
      { slug: 'usa.1', name: 'الدوري الأمريكي', badge: 'MLS' },
      { slug: 'mex.1', name: 'الدوري المكسيكي', badge: 'MX' },
      { slug: 'mex.2', name: 'دوري التوسع المكسيكي', badge: 'MX2' },
      // البرازيل
      { slug: 'bra.1', name: 'الدوري البرازيلي', badge: 'BRA' },
      { slug: 'bra.2', name: 'الدوري البرازيلي الثاني', badge: 'BRA2' },
      // الأرجنتين
      { slug: 'arg.1', name: 'الدوري الأرجنتيني', badge: 'ARG' },
      // آسيا وأوقيانوسيا
      { slug: 'jpn.1', name: 'الدوري الياباني', badge: 'J1' },
      { slug: 'kor.1', name: 'الدوري الكوري', badge: 'K1' },
      { slug: 'chn.1', name: 'الدوري الصيني', badge: 'CSL' },
      { slug: 'aus.1', name: 'الدوري الأسترالي', badge: 'AUS' },
      { slug: 'ind.1', name: 'الدوري الهندي', badge: 'ISL' },
      // أوروبا الشرقية
      { slug: 'rus.1', name: 'الدوري الروسي', badge: 'RPL' },
      { slug: 'ukr.1', name: 'الدوري الأوكراني', badge: 'UPL' },
      { slug: 'pol.1', name: 'الدوري البولندي', badge: 'POL' },
      { slug: 'gre.1', name: 'الدوري اليوناني', badge: 'GSL' },
      { slug: 'sco.1', name: 'الدوري الاسكتلندي', badge: 'SP' }
    ],
    TSDB_LEAGUES: {
      'eng.1': 4328, 'esp.1': 4335, 'ita.1': 4332, 'ger.1': 4331,
      'fra.1': 4334, 'ned.1': 4337, 'por.1': 4344, 'uefa.champions': 4480,
      'uefa.europa': 4481, 'usa.1': 4346, 'mex.1': 4350, 'ksa.1': 5360,
      'bra.1': 4351, 'arg.1': 4406, 'mar.1': 5385, 'egy.1': 5370,
      'tun.1': 5386, 'alg.1': 5387
    },
    TSDB_SEASON: '2024-2025',
    TIMEOUT_MS: 12000,
    BATCH_SIZE: 10,
    BATCH_DELAY_MS: 100
  }
};
