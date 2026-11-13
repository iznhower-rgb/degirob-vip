class APIError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
    this.detail = detail || '';
  }
}

const API = {
  async fetchMatches() {
    const cache = this.getCache();
    if (cache) {
      console.info('[API] ✅ From cache:', cache.length);
      return cache;
    }

    try {
      const raw = await this.callESPN();
      if (!raw.length) throw new APIError('NO_MATCHES', '0 مباريات اليوم في جميع الدوريات');

      const matches = raw.map(i => this.normalizeMatch(i)).filter(Boolean);
      if (!matches.length) throw new APIError('NORMALIZE_FAILED', 'فشل التحويل');

      console.info('[API] ✅ TOTAL:', matches.length);
      this.setCache(matches);
      return matches;
    } catch (err) {
      console.error('[API] Failed:', err.message);
      throw err;
    }
  },

  async callESPN() {
    const all = [];
    const seen = new Set();
    const dates = this._getDateRange();

    for (const date of dates) {
      if (all.length >= 200) break;

      console.info(`[API] Fetching ALL matches for ${date}...`);
      try {
        const url = `${CONFIG.API.ESPN_BASE}/all/scoreboard?dates=${date}&limit=1000`;
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(t);

        if (!res.ok) {
          console.warn(`[API] ${date}: HTTP ${res.status}`);
          continue;
        }

        const json = await res.json();
        const events = json.events || [];
        console.info(`[API] ${date}: ${events.length} raw events`);

        for (const ev of events) {
          if (seen.has(ev.id)) continue;
          seen.add(ev.id);

          const comp = ev.competitions && ev.competitions[0];
          if (!comp || !comp.competitors) continue;

          const home = comp.competitors.find(c => c.homeAway === 'home');
          const away = comp.competitors.find(c => c.homeAway === 'away');
          if (!home || !away) continue;

          const statusState = ev.status?.type?.state || 'pre';
          const isLive = statusState === 'in';
          const isPost = statusState === 'post';

          const elapsed = isLive && ev.status?.displayClock
            ? parseInt(ev.status.displayClock.replace("'", ''), 10)
            : null;

          const dateObj = new Date(ev.date);
          const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

          // استخراج الدوري
          let leagueName = 'Football';
          let leagueSlug = 'all';
          const teamLeague = comp.competitors[0].team?.league;
          if (teamLeague) {
            leagueName = teamLeague.name || 'Football';
            leagueSlug = teamLeague.slug || 'all';
          } else if (ev.season) {
            leagueName = ev.season.name || 'Football';
          }

          all.push({
            id: String(ev.id),
            leagueSlug,
            league: leagueName,
            leagueBadge: this._abbr(leagueName),
            home: home.team.displayName || home.team.name,
            away: away.team.displayName || away.team.name,
            homeId: home.team.id,
            awayId: away.team.id,
            homeLogo: home.team.logo || null,
            awayLogo: away.team.logo || null,
            time,
            isLive,
            isPost,
            elapsed,
            kickoff: dateObj.getTime(),
            statusShort: ev.status?.type?.shortDetail || (isPost ? 'FT' : 'NS')
          });
        }
      } catch (e) {
        console.warn(`[API] ${date} failed:`, e.message);
      }

      if (all.length >= 20) break;
    }

    // ترتيب: المباشرة أولاً، ثم القادمة، ثم المنتهية
    all.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      if (!a.isPost && b.isPost) return -1;
      if (a.isPost && !b.isPost) return 1;
      return a.kickoff - b.kickoff;
    });

    return all;
  },

  _getDateRange() {
    const fmt = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}${m}${day}`;
    };
    return [
      fmt(new Date()),
      fmt(new Date(Date.now() + 86400000)),
      fmt(new Date(Date.now() - 86400000))
    ];
  },

  _abbr(name) {
    if (!name) return 'FB';
    return name.split(' ').map(w => w[0] || '').join('').substring(0, 3).toUpperCase();
  },

  normalizeMatch(ev) {
    const seed = parseInt(ev.id.slice(-3), 10) || 1;
    const homeProb = 40 + (seed % 20);
    const awayProb = 20 + (seed % 15);
    const drawProb = Math.max(5, 100 - homeProb - awayProb);
    const bestBet = homeProb > awayProb ? 'home' : 'away';
    const confidence = homeProb >= 55 ? 'high' : homeProb >= 45 ? 'medium' : 'low';
    const stars = confidence === 'high' ? 5 : confidence === 'medium' ? 4 : 3;
    const probDiff = Math.abs(homeProb - awayProb);

    return {
      id: ev.id,
      homeId: ev.homeId,
      awayId: ev.awayId,
      leagueId: ev.leagueSlug,
      league: ev.league,
      leagueBadge: ev.leagueBadge,
      home: ev.home,
      away: ev.away,
      homeLogo: ev.homeLogo,
      awayLogo: ev.awayLogo,
      time: ev.time,
      isLive: ev.isLive,
      isPost: ev.isPost,
      elapsed: ev.elapsed,
      kickoff: ev.kickoff,
      statusShort: ev.statusShort,
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

  async fetchH2H(homeName, awayName) {
    const cacheKey = `${homeName}-${awayName}`;
    const cached = this._getCached(CONFIG.STORAGE_KEYS.H2H_CACHE, cacheKey, CONFIG.API.CACHE_H2H_MINUTES);
    if (cached !== null) return cached;

    try {
      const homeId = await this._searchTeamId(homeName);
      const awayId = await this._searchTeamId(awayName);

      const homeMatches = homeId ? await this._fetchTeamLast(homeId) : [];
      const awayMatches = awayId ? await this._fetchTeamLast(awayId) : [];

      const combined = [...homeMatches, ...awayMatches];
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      const result = combined.slice(0, 5);

      this._setCached(CONFIG.STORAGE_KEYS.H2H_CACHE, cacheKey, result, 30);
      return result;
    } catch (e) {
      return [];
    }
  },

  async _searchTeamId(teamName) {
    try {
      const url = `${CONFIG.API.TSDB_BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const teams = json.teams;
      if (!teams || !teams.length) return null;
      return teams[0].idTeam;
    } catch (e) { return null; }
  },

  async _fetchTeamLast(teamId) {
    try {
      const url = `${CONFIG.API.TSDB_BASE}/eventslast.php?id=${teamId}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      const results = json.results || [];
      return results.map(r => ({
        date: r.dateEvent,
        homeName: r.strHomeTeam,
        awayName: r.strAwayTeam,
        homeGoals: parseInt(r.intHomeScore, 10),
        awayGoals: parseInt(r.intAwayScore, 10)
      }));
    } catch (e) { return []; }
  },

  async fetchStandings(leagueSlug) {
    const leagueId = CONFIG.API.TSDB_LEAGUES[leagueSlug];
    if (!leagueId) return null;

    const cacheKey = `${leagueSlug}-${CONFIG.API.TSDB_SEASON}`;
    const cached = this._getCached(CONFIG.STORAGE_KEYS.STANDINGS_CACHE, cacheKey, CONFIG.API.CACHE_STANDINGS_MINUTES);
    if (cached !== null) return cached;

    try {
      const url = `${CONFIG.API.TSDB_BASE}/lookuptable.php?l=${leagueId}&s=${CONFIG.API.TSDB_SEASON}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const table = json.table || [];

      const standings = table.map(row => ({
        rank: parseInt(row.intRank, 10),
        teamId: row.idTeam,
        teamName: row.strTeam,
        points: parseInt(row.intPoints, 10) || 0,
        played: parseInt(row.intPlayed, 10) || 0,
        win: parseInt(row.intWin, 10) || 0,
        draw: parseInt(row.intDraw, 10) || 0,
        lose: parseInt(row.intLoss, 10) || 0
      }));

      const result = { standings, season: CONFIG.API.TSDB_SEASON };
      this._setCached(CONFIG.STORAGE_KEYS.STANDINGS_CACHE, cacheKey, result, 10);
      return result;
    } catch (e) {
      return null;
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
    } catch (e) { }
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
    } catch (e) { }
  },

  clearCache() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.MATCHES_CACHE);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.H2H_CACHE);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.STANDINGS_CACHE);
    console.info('[API] All caches cleared');
  }
};
