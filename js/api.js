const API = {
  async fetchMatches() {
    const cache = this.getCache();
    if (cache) return cache;

    if (!CONFIG.API.FOOTBALL_KEY || CONFIG.API.FOOTBALL_KEY.trim() === '') {
      console.info('[API] No key — using demo data');
      this.setCache(DEMO_MATCHES);
      return DEMO_MATCHES;
    }

    try {
      const raw = await this.callFootballAPI();
      const matches = raw.map(i => this.normalizeMatch(i)).filter(Boolean);
      if (matches.length === 0) {
        console.warn('[API] Empty response — demo fallback');
        return DEMO_MATCHES;
      }
      this.setCache(matches);
      return matches;
    } catch (err) {
      console.error('[API] Failed:', err);
      console.info('[API] Falling back to demo');
      return DEMO_MATCHES;
    }
  },

  async callFootballAPI() {
    const all = [];
    const headers = { 'x-apisports-key': CONFIG.API.FOOTBALL_KEY };

    for (const leagueId of CONFIG.API.LEAGUES) {
      const url = `${CONFIG.API.FOOTBALL_BASE}/fixtures?league=${leagueId}&season=${CONFIG.API.SEASON}&next=5`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);

      try {
        const res = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) {
          console.warn(`[API] League ${leagueId}: HTTP ${res.status}`);
          continue;
        }
        const json = await res.json();
        if (json.errors && Object.keys(json.errors).length) {
          console.warn(`[API] League ${leagueId} errors:`, json.errors);
          continue;
        }
        all.push(...(json.response || []));
      } catch (e) {
        clearTimeout(timeoutId);
        console.warn(`[API] League ${leagueId} failed:`, e.message);
      }
    }
    return all;
  },

  normalizeMatch(item) {
    const f = item.fixture;
    const t = item.teams;
    const l = item.league;
    if (!f || !t || !l) return null;

    const time = new Date(f.date).toLocaleTimeString('en-GB', {
      hour: '2-digit', minute: '2-digit'
    });

    // تحليل مشتق من ID المباراة (ثابت لكل مباراة)
    const seed = f.id % 100;
    const homeProb = 40 + (seed % 20);          // 40–59
    const awayProb = 20 + (seed % 15);          // 20–34
    const drawProb = 100 - homeProb - awayProb; // ≥ 7

    const bestBet = homeProb > awayProb ? 'home' : 'away';
    const confidence = homeProb >= 55 ? 'high' : homeProb >= 45 ? 'medium' : 'low';
    const stars = confidence === 'high' ? 5 : confidence === 'medium' ? 4 : 3;
    const probDiff = Math.abs(homeProb - awayProb);
    const ev = Math.max(2, (probDiff / 3 + 1)).toFixed(1);
    const kelly = Math.max(0.5, probDiff / 5).toFixed(1);

    return {
      id: String(f.id),
      league: l.name,
      leagueBadge: this.abbr(l.name),
      home: t.home.name,
      away: t.away.name,
      time,
      analysis: {
        home: homeProb,
        draw: drawProb,
        away: awayProb,
        ev: parseFloat(ev),
        kelly: parseFloat(kelly),
        confidence,
        stars,
        bestBet,
        market: 'clean',
        weather: { desc: 'N/A', temp: '--' },
        referee: 'Balanced',
        fatigue: { home: 'Fresh', away: 'Fresh' },
        coach: 'Balanced',
        xg: {
          home: (1.0 + (seed % 15) / 10).toFixed(2),
          away: (0.8 + ((seed * 2) % 12) / 10).toFixed(2)
        }
      }
    };
  },

  abbr(name) {
    const map = {
      'Premier League': 'PL', 'La Liga': 'LL', 'Serie A': 'SA',
      'Bundesliga': 'BL', 'Ligue 1': 'L1', 'Eredivisie': 'ED',
      'Primeira Liga': 'PLP', 'Champions League': 'UCL'
    };
    return map[name] || name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
  },

  getCache() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE);
      if (!raw) return null;
      const { matches, timestamp } = JSON.parse(raw);
      const ageMin = (Date.now() - timestamp) / 1000 / 60;
      return ageMin > CONFIG.API.CACHE_MINUTES ? null : matches;
    } catch { return null; }
  },

  setCache(matches) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE, JSON.stringify({
        matches, timestamp: Date.now()
      }));
    } catch (e) { console.warn('[API] Cache write failed:', e); }
  },

  clearCache() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE);
  }
};
