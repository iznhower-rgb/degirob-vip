const API = {
  async fetchMatches() {
    const cache = this.getCache();
    if (cache) {
      console.info('[API] Using cached data:', cache.length, 'matches');
      return cache;
    }

    if (!CONFIG.API.FOOTBALL_KEY || CONFIG.API.FOOTBALL_KEY.trim() === '') {
      console.info('[API] No key — using demo');
      return DEMO_MATCHES;
    }

    try {
      console.info('[API] Fetching from API-Football...');
      const raw = await this.callFootballAPI();

      if (!raw.length) {
        console.warn('[API] No qualifying matches — using demo');
        return DEMO_MATCHES;
      }

      const matches = raw.map(i => this.normalizeMatch(i)).filter(Boolean);
      if (!matches.length) {
        console.warn('[API] Normalization yielded 0 — using demo');
        return DEMO_MATCHES;
      }

      console.info('[API] SUCCESS:', matches.length, 'real matches');
      this.setCache(matches);
      return matches;
    } catch (err) {
      console.error('[API] Failed:', err.message);
      return DEMO_MATCHES;
    }
  },

  async callFootballAPI() {
    const headers = { 'x-apisports-key': CONFIG.API.FOOTBALL_KEY };
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const urls = [
      `${CONFIG.API.FOOTBALL_BASE}/fixtures?live=all`,
      `${CONFIG.API.FOOTBALL_BASE}/fixtures?date=${today}`,
      `${CONFIG.API.FOOTBALL_BASE}/fixtures?date=${tomorrow}`
    ];

    const leagueIds = new Set(CONFIG.API.LEAGUES);
    const seen = new Set();
    const result = [];

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
        const res = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
          console.warn('[API] HTTP', res.status, 'for', url.split('?')[1]);
          continue;
        }
        const json = await res.json();

        if (json.errors && Object.keys(json.errors).length) {
          console.warn('[API] API errors:', json.errors);
          continue;
        }

        const fixtures = json.response || [];
        console.info('[API]', fixtures.length, 'fixtures from', url.split('?')[1]);

        for (const item of fixtures) {
          if (!item.fixture || !item.league) continue;
          if (seen.has(item.fixture.id)) continue;
          seen.add(item.fixture.id);
          if (!leagueIds.has(item.league.id)) continue;
          const status = item.fixture.status && item.fixture.status.short;
          if (['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) continue;
          result.push(item);
        }
      } catch (e) {
        console.warn('[API] Fetch error:', e.message);
      }
    }

    console.info('[API] Total unique qualifying fixtures:', result.length);

    const byLeague = {};
    for (const item of result) {
      const lid = item.league.id;
      if (!byLeague[lid]) byLeague[lid] = [];
      byLeague[lid].push(item);
    }

    const final = [];
    for (const lid in byLeague) {
      final.push(...byLeague[lid].slice(0, 2));
    }
    return final.slice(0, 10);
  },

  normalizeMatch(item) {
    const f = item.fixture;
    const t = item.teams;
    const l = item.league;
    if (!f || !t || !l) return null;

    const date = new Date(f.date);
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const seed = f.id % 100;
    const homeProb = 40 + (seed % 20);
    const awayProb = 20 + (seed % 15);
    const drawProb = Math.max(5, 100 - homeProb - awayProb);

    const bestBet = homeProb > awayProb ? 'home' : 'away';
    const confidence = homeProb >= 55 ? 'high' : homeProb >= 45 ? 'medium' : 'low';
    const stars = confidence === 'high' ? 5 : confidence === 'medium' ? 4 : 3;
    const probDiff = Math.abs(homeProb - awayProb);
    const ev = parseFloat((probDiff / 3 + 1).toFixed(1));
    const kelly = parseFloat(Math.max(0.5, probDiff / 5).toFixed(1));

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
        ev, kelly, confidence, stars, bestBet,
        market: 'clean',
        weather: { desc: 'N/A', temp: '--' },
        referee: 'Balanced',
        fatigue: { home: 'Fresh', away: 'Fresh' },
        coach: 'Balanced',
        xg: {
          home: parseFloat((1.0 + (seed % 15) / 10).toFixed(2)),
          away: parseFloat((0.8 + ((seed * 2) % 12) / 10).toFixed(2))
        }
      }
    };
  },

  abbr(name) {
    const map = {
      'Premier League': 'PL', 'La Liga': 'LL', 'Serie A': 'SA',
      'Bundesliga': 'BL', 'Ligue 1': 'L1', 'Eredivisie': 'ED',
      'Primeira Liga': 'PLP', 'Champions League': 'UCL', 'Europa League': 'UEL'
    };
    if (map[name]) return map[name];
    return name.split(' ').map(w => w[0] || '').join('').substring(0, 3).toUpperCase();
  },

  getCache() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!Array.isArray(data.matches) || !data.matches.length) return null;
      const ageMin = (Date.now() - data.timestamp) / 60000;
      if (ageMin > CONFIG.API.CACHE_MINUTES) return null;
      return data.matches;
    } catch (e) {
      return null;
    }
  },

  setCache(matches) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE, JSON.stringify({
        matches, timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('[API] Cache write failed:', e);
    }
  },

  clearCache() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE);
    console.info('[API] Cache cleared');
  }
};
