class APIError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
    this.detail = detail || '';
  }
}

const API = {
  _plan: null,
  _isFree: false,

  async fetchMatches() {
    if (!CONFIG.API.FOOTBALL_KEY || CONFIG.API.FOOTBALL_KEY.trim() === '') {
      throw new APIError('NO_API_KEY', 'config.js: FOOTBALL_KEY فارغ');
    }

    const cache = this.getCache();
    if (cache) {
      console.info('[API] ✅ From cache:', cache.length);
      return cache;
    }

    const status = await this.verifyKey();
    if (!status.ok) throw new APIError('KEY_INVALID', status.message);
    console.info('[API] ✅ Key:', status.message);

    const raw = await this.callFootballAPI();
    if (!raw.length) throw new APIError('NO_MATCHES', '0 مباريات في دورياتك اليوم');

    const matches = raw.map(i => this.normalizeMatch(i)).filter(Boolean);
    if (!matches.length) throw new APIError('NORMALIZE_FAILED', 'فشل التحويل');

    console.info('[API] ✅ LIVE:', matches.length);
    this.setCache(matches);
    return matches;
  },

  async verifyKey() {
    try {
      const res = await fetch(`${CONFIG.API.FOOTBALL_BASE}/status`, {
        headers: { 'x-apisports-key': CONFIG.API.FOOTBALL_KEY }
      });
      if (!res.ok) return { ok: false, message: `HTTP ${res.status}` };
      const json = await res.json();
      if (json.errors && Object.keys(json.errors).length) {
        return { ok: false, message: JSON.stringify(json.errors) };
      }
      const r = json.response || {};
      const sub = r.subscription || {};
      const req = r.requests || {};
      this._plan = sub.plan || 'Free';
      this._isFree = (this._plan === 'Free');
      console.info('[API] Plan:', this._plan, '| Free:', this._isFree);
      return { ok: true, message: `Plan: ${this._plan} | ${req.current || 0}/${req.limit_day || 100}` };
    } catch (e) {
      return { ok: false, message: 'Network: ' + e.message };
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

    const seen = new Set();
    const result = [];
    let lastError = null;

    for (const url of urls) {
      try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
        const res = await fetch(url, { headers, signal: controller.signal });
        clearTimeout(t);
        if (!res.ok) { console.warn(`[API] HTTP ${res.status}`); continue; }
        const json = await res.json();
        if (json.errors && Object.keys(json.errors).length) {
          console.warn('[API] errors:', json.errors);
          lastError = JSON.stringify(json.errors);
          continue;
        }
        const fixtures = json.response || [];
        console.info(`[API] ${fixtures.length} from ${url.split('?')[1]}`);
        for (const item of fixtures) {
          if (!item.fixture || !item.league) continue;
          if (seen.has(item.fixture.id)) continue;
          seen.add(item.fixture.id);
          const status = item.fixture.status && item.fixture.status.short;
          if (['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'].includes(status)) continue;
          result.push(item);
        }
      } catch (e) {
        console.warn(`[API] ${url.split('?')[1]} → ${e.message}`);
      }
    }

    const filtered = result.filter(i => this.isTopLeague(i.league));
    console.info(`[API] ${result.length} total → ${filtered.length} top`);
    if (filtered.length === 0 && result.length > 0) return result.slice(0, 15);
    if (filtered.length === 0 && lastError) throw new APIError('API_ERROR', lastError);
    return filtered.slice(0, 15);
  },

  async fetchH2H(homeId, awayId) {
    if (!homeId || !awayId) return [];
    const cacheKey = `${homeId}-${awayId}`;
    const cached = this._getCached(CONFIG.STORAGE_KEYS.H2H_CACHE, cacheKey, CONFIG.API.CACHE_H2H_MINUTES);
    if (cached !== null) {
      console.info('[API] H2H from cache');
      return cached;
    }

    try {
      const url = `${CONFIG.API.FOOTBALL_BASE}/fixtures/headtohead?h2h=${homeId}-${awayId}`;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
      const res = await fetch(url, {
        headers: { 'x-apisports-key': CONFIG.API.FOOTBALL_KEY },
        signal: controller.signal
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.errors && Object.keys(json.errors).length) {
        throw new Error(JSON.stringify(json.errors));
      }

      const fixtures = (json.response || []).filter(f => {
        const s = f.fixture && f.fixture.status && f.fixture.status.short;
        return s === 'FT' || s === 'AET' || s === 'PEN';
      });

      const result = fixtures
        .sort((a, b) => new Date(b.fixture.date) - new Date(a.fixture.date))
        .slice(0, 5)
        .map(f => ({
          date: f.fixture.date,
          homeId: f.teams.home.id,
          awayId: f.teams.away.id,
          homeName: f.teams.home.name,
          awayName: f.teams.away.name,
          homeGoals: f.goals.home,
          awayGoals: f.goals.away
        }));

      console.info('[API] H2H loaded:', result.length);
      this._setCached(CONFIG.STORAGE_KEYS.H2H_CACHE, cacheKey, result, 30);
      return result;
    } catch (e) {
      console.warn('[API] H2H failed:', e.message);
      throw e;
    }
  },

  async fetchStandings(leagueId, season) {
    if (!leagueId) return null;
    // ✅ FIX: إن كانت الخطة غير معروفة (cache hit) أو Free → نستخدم 2024
    const effectiveSeason = (!this._plan || this._isFree) ? 2024 : season;
    const cacheKey = `${leagueId}-${effectiveSeason}`;

    const cached = this._getCached(CONFIG.STORAGE_KEYS.STANDINGS_CACHE, cacheKey, CONFIG.API.CACHE_STANDINGS_MINUTES);
    if (cached !== null) {
      console.info('[API] Standings from cache (season:', effectiveSeason, ')');
      return cached;
    }

    try {
      const url = `${CONFIG.API.FOOTBALL_BASE}/standings?league=${leagueId}&season=${effectiveSeason}`;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
      const res = await fetch(url, {
        headers: { 'x-apisports-key': CONFIG.API.FOOTBALL_KEY },
        signal: controller.signal
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json.errors && Object.keys(json.errors).length) {
        throw new Error(JSON.stringify(json.errors));
      }

      const table = json.response?.[0]?.league?.standings?.[0] || [];
      const standings = table.map(s => ({
        rank: s.rank,
        teamId: s.team.id,
        teamName: s.team.name,
        points: s.points,
        played: (s.all && s.all.played) || 0,
        win: (s.all && s.all.win) || 0,
        draw: (s.all && s.all.draw) || 0,
        lose: (s.all && s.all.lose) || 0
      }));

      const result = {
        standings,
        season: effectiveSeason,
        isHistorical: effectiveSeason !== season
      };

      console.info('[API] Standings loaded:', standings.length, '| season:', effectiveSeason);
      this._setCached(CONFIG.STORAGE_KEYS.STANDINGS_CACHE, cacheKey, result, 10);
      return result;
    } catch (e) {
      console.warn('[API] Standings failed:', e.message);
      throw e;
    }
  },

  _getCached(storageKey, cacheKey, ttlMinutes) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const entry = data[cacheKey];
      if (!entry) return null;
      if (Date.now() - entry.ts > ttlMinutes * 60000) return null;
      return entry.value;
    } catch (e) { return null; }
  },

  _setCached(storageKey, cacheKey, value, maxEntries) {
    try {
      const raw = localStorage.getItem(storageKey);
      const data = raw ? JSON.parse(raw) : {};
      data[cacheKey] = { value, ts: Date.now() };
      const keys = Object.keys(data);
      if (keys.length > maxEntries) {
        keys.sort((a, b) => data[b].ts - data[a].ts);
        for (let i = maxEntries; i < keys.length; i++) delete data[keys[i]];
      }
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) { console.warn('[API] cache write:', e); }
  },

  isTopLeague(league) {
    if (!league) return false;
    if (CONFIG.API.LEAGUES.includes(league.id)) return true;
    const topNames = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1',
      'Eredivisie', 'Primeira Liga', 'Champions League', 'Europa League',
      'Saudi Pro League', 'Super Lig', 'MLS', 'Copa', 'FA Cup', 'League Cup'];
    const name = league.name || '';
    if (topNames.some(t => name.indexOf(t) !== -1)) return true;
    const topCountries = ['England', 'Spain', 'Italy', 'Germany', 'France',
      'Netherlands', 'Portugal', 'Saudi-Arabia', 'Turkey', 'USA'];
    return topCountries.indexOf(league.country) !== -1;
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

    return {
      id: String(f.id),
      homeId: t.home.id,
      awayId: t.away.id,
      leagueId: l.id,
      season: l.season,
      league: l.name,
      leagueBadge: this.abbr(l.name),
      home: t.home.name,
      away: t.away.name,
      time,
      analysis: {
        home: homeProb, draw: drawProb, away: awayProb,
        ev: parseFloat((probDiff / 3 + 1).toFixed(1)),
        kelly: parseFloat(Math.max(0.5, probDiff / 5).toFixed(1)),
        confidence, stars, bestBet,
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
      if ((Date.now() - data.timestamp) / 60000 > CONFIG.API.CACHE_MINUTES) return null;
      return data.matches;
    } catch (e) { return null; }
  },

  setCache(matches) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE, JSON.stringify({
        matches, timestamp: Date.now()
      }));
    } catch (e) { console.warn('[API] Cache write:', e); }
  },

  clearCache() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.H2H_CACHE);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.STANDINGS_CACHE);
    console.info('[API] All caches cleared');
  }
};
