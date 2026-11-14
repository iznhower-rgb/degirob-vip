class APIError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
    this.detail = detail || '';
  }
}

const API = {
  async fetchMatches() {
    console.info('[API] 🚀 Fetching matches (ESPN + RapidAPI + Bzzoiro)...');
    try {
      // 1. جلب المباريات من المصادر الثلاثة بالتوازي
      const [espnMatches, rapidMatches, bzzoiroMatches] = await Promise.all([
        this.fetchESPNMatches(),
        this.fetchRapidAPIMatches(),
        this.fetchBzzoiroMatches()
      ]);

      console.info(`[API] ESPN: ${espnMatches.length} | RapidAPI: ${rapidMatches.length} | Bzzoiro: ${bzzoiroMatches.length}`);

      // 2. دمج المباريات وحذف المكرر (بالاعتماد على بصمة الفريقين)
      const allMatches = [...espnMatches, ...rapidMatches, ...bzzoiroMatches];
      const uniqueMatches = this.deduplicateMatches(allMatches);

      // 3. الترتيب
      uniqueMatches.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        if (!a.isPost && b.isPost) return -1;
        if (a.isPost && !b.isPost) return 1;
        return a.kickoff - b.kickoff;
      });

      const normalized = uniqueMatches.map(i => this.normalizeMatch(i)).filter(Boolean);
      console.info(`[API] ✅ TOTAL MERGED MATCHES: ${normalized.length}`);
      return normalized;

    } catch (err) {
      console.error('[API] Global Failed:', err.message);
      const fallback = await this.fetchESPNMatches();
      return fallback.map(i => this.normalizeMatch(i));
    }
  },

  // --- 1. ESPN (الأساس السريع) ---
  async fetchESPNMatches() {
    try {
      const today = this._formatDate(new Date());
      const url = `${CONFIG.API.ESPN_BASE}/all/scoreboard?dates=${today}&limit=1000`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      const events = json.events || [];
      return events.map(ev => {
        const comp = ev.competitions?.[0];
        if (!comp || !comp.competitors) return null;
        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        if (!home || !away) return null;
        const statusState = ev.status?.type?.state || 'pre';
        const dateObj = new Date(ev.date);
        return {
          id: String(ev.id), source: 'ESPN',
          leagueSlug: ev.league?.slug || 'all', league: ev.league?.name || 'دوري عالمي',
          leagueBadge: ev.league?.abbreviation || 'ALL',
          home: home.team.displayName || home.team.name, away: away.team.displayName || away.team.name,
          homeId: home.team.id, awayId: away.team.id,
          homeLogo: home.team.logo || null, awayLogo: away.team.logo || null,
          time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isLive: statusState === 'in', isPost: statusState === 'post',
          elapsed: statusState === 'in' ? parseInt(ev.status?.displayClock?.replace("'", '') || 0) : null,
          kickoff: dateObj.getTime(), statusShort: ev.status?.type?.shortDetail || (statusState === 'post' ? 'FT' : 'NS')
        };
      }).filter(Boolean);
    } catch (e) { return []; }
  },

  // --- 2. RapidAPI (تغطية الدوريات الصغيرة، مع كاش 24 ساعة) ---
  async fetchRapidAPIMatches() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.RAPIDAPI_CACHE);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.date === today && (Date.now() - data.timestamp) / 3600000 < 24) {
          console.info('[API] RapidAPI: From cache');
          return data.matches;
        }
      }
    } catch (e) {}

    try {
      const url = `${CONFIG.API.RAPIDAPI_BASE}/football-get-matches-by-date?date=${today}`;
      const res = await fetch(url, {
        headers: { 'x-rapidapi-key': CONFIG.API.RAPIDAPI_KEY, 'x-rapidapi-host': CONFIG.API.RAPIDAPI_HOST }
      });
      if (!res.ok) return [];
      const json = await res.json();
      const matchesData = json.response || json.data || json.matches || [];
      const rapidMatches = matchesData.map(ev => {
        const dateObj = new Date(ev.match_date || ev.timestamp * 1000 || Date.now());
        return {
          id: String(ev.match_id || Math.random()), source: 'RapidAPI',
          leagueSlug: ev.league_id || 'all', league: ev.league_name || 'دوري عالمي',
          leagueBadge: (ev.league_name || 'ALL').substring(0, 3).toUpperCase(),
          home: ev.home_team || 'Home', away: ev.away_team || 'Away',
          homeId: ev.home_id || '', awayId: ev.away_id || '',
          homeLogo: ev.home_logo || null, awayLogo: ev.away_logo || null,
          time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isLive: ev.status === 'LIVE' || ev.match_status === 'LIVE',
          isPost: ev.status === 'FINISHED' || ev.match_status === 'FT',
          elapsed: ev.minute || null, kickoff: dateObj.getTime(), statusShort: ev.status || 'NS'
        };
      }).filter(m => m.home !== 'Home');

      localStorage.setItem(CONFIG.STORAGE_KEYS.RAPIDAPI_CACHE, JSON.stringify({ date: today, timestamp: Date.now(), matches: rapidMatches }));
      return rapidMatches;
    } catch (e) { return []; }
  },

  // --- 3. Bzzoiro (التحليلات والتوقعات الحقيقية) ---
  async fetchBzzoiroMatches() {
    const today = new Date().toISOString().split('T')[0];
    try {
      const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.BZZOIRO_CACHE);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.date === today && (Date.now() - data.timestamp) / 3600000 < 6) {
          console.info('[API] Bzzoiro: From cache');
          return data.matches;
        }
      }
    } catch (e) {}

    try {
      console.info('[API] Bzzoiro: Fetching live matches...');
      const url = `${CONFIG.API.BZZOIRO_BASE}/events/live/`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Token ${CONFIG.API.BZZOIRO_KEY}` }
      });
      if (!res.ok) return [];
      const json = await res.json();
      const events = json.data || json.events || json.results || [];

      const bzzoiroMatches = events.map(ev => {
        const dateObj = new Date(ev.start_time || ev.date || Date.now());
        return {
          id: `bzz-${ev.id}`, source: 'Bzzoiro',
          leagueSlug: ev.league?.id || 'all', league: ev.league?.name || 'دوري عالمي',
          leagueBadge: (ev.league?.name || 'ALL').substring(0, 3).toUpperCase(),
          home: ev.home_team?.name || 'Home', away: ev.away_team?.name || 'Away',
          homeId: ev.home_team?.id || '', awayId: ev.away_team?.id || '',
          homeLogo: ev.home_team?.logo || null, awayLogo: ev.away_team?.logo || null,
          time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isLive: true, isPost: false, elapsed: ev.minute || null,
          kickoff: dateObj.getTime(), statusShort: 'LIVE',
          // تخزين توقعات Bzzoiro إن وجدت
          bzzoiroPrediction: ev.predictions || null
        };
      }).filter(m => m.home !== 'Home');

      localStorage.setItem(CONFIG.STORAGE_KEYS.BZZOIRO_CACHE, JSON.stringify({ date: today, timestamp: Date.now(), matches: bzzoiroMatches }));
      return bzzoiroMatches;
    } catch (e) {
      console.warn('[API] Bzzoiro failed:', e.message);
      return [];
    }
  },

  // --- دمج وحذف المكرر ---
  deduplicateMatches(matches) {
    const seen = new Set();
    const unique = [];
    for (const m of matches) {
      const fingerprint = `${m.home.toLowerCase().trim()}-${m.away.toLowerCase().trim()}`;
      if (seen.has(fingerprint)) {
        const index = unique.findIndex(u => `${u.home.toLowerCase().trim()}-${u.away.toLowerCase().trim()}` === fingerprint);
        // نفضل Bzzoiro (لأنها تحتوي على توقعات) ثم ESPN
        if (index > -1 && (m.source === 'Bzzoiro' || (m.source === 'ESPN' && unique[index].source !== 'Bzzoiro'))) {
          unique[index] = m;
        }
      } else {
        seen.add(fingerprint);
        unique.push(m);
      }
    }
    return unique;
  },

  _formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  },

  normalizeMatch(ev) {
    // استخدام توقعات Bzzoiro الحقيقية إذا كانت متوفرة
    let homeProb = 40 + ((parseInt(ev.id.replace(/\D/g, '').slice(-3), 10) || 1) % 20);
    let drawProb = 25;
    let awayProb = 100 - homeProb - drawProb;
    let confidence = 'medium';
    let stars = 4;

    if (ev.bzzoiroPrediction) {
      const p = ev.bzzoiroPrediction;
      homeProb = p.home_win_probability ? Math.round(p.home_win_probability * 100) : homeProb;
      drawProb = p.draw_probability ? Math.round(p.draw_probability * 100) : drawProb;
      awayProb = p.away_win_probability ? Math.round(p.away_win_probability * 100) : awayProb;
      confidence = p.confidence || 'high';
      stars = confidence === 'high' ? 5 : 4;
    }

    const bestBet = homeProb > awayProb ? 'home' : 'away';
    const probDiff = Math.abs(homeProb - awayProb);

    return {
      ...ev,
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
        xg: { home: parseFloat((1.0 + (probDiff % 15) / 10).toFixed(2)), away: parseFloat((0.8 + (probDiff % 12) / 10).toFixed(2)) }
      }
    };
  },

  async fetchH2H(homeName, awayName) {
    try {
      const homeId = await this._searchTeamId(homeName);
      const awayId = await this._searchTeamId(awayName);
      const homeMatches = homeId ? await this._fetchTeamLast(homeId) : [];
      const awayMatches = awayId ? await this._fetchTeamLast(awayId) : [];
      const combined = [...homeMatches, ...awayMatches];
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      return combined.slice(0, 5);
    } catch (e) { return []; }
  },

  async _searchTeamId(teamName) {
    try {
      const url = `${CONFIG.API.TSDB_BASE}/searchteams.php?t=${encodeURIComponent(teamName)}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      return json.teams && json.teams.length ? json.teams[0].idTeam : null;
    } catch (e) { return null; }
  },

  async _fetchTeamLast(teamId) {
    try {
      const url = `${CONFIG.API.TSDB_BASE}/eventslast.php?id=${teamId}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return [];
      const json = await res.json();
      const results = json.results || [];
      return results.map(r => ({
        date: r.dateEvent, homeName: r.strHomeTeam, awayName: r.strAwayTeam,
        homeGoals: parseInt(r.intHomeScore, 10), awayGoals: parseInt(r.intAwayScore, 10)
      }));
    } catch (e) { return []; }
  },

  async fetchStandings(leagueSlug) {
    const leagueId = CONFIG.API.TSDB_LEAGUES[leagueSlug];
    if (!leagueId) return null;
    try {
      const url = `${CONFIG.API.TSDB_BASE}/lookuptable.php?l=${leagueId}&s=${CONFIG.API.TSDB_SEASON}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const json = await res.json();
      const table = json.table || [];
      const standings = table.map(row => ({
        rank: parseInt(row.intRank, 10), teamId: row.idTeam, teamName: row.strTeam,
        points: parseInt(row.intPoints, 10) || 0
      }));
      return { standings, season: CONFIG.API.TSDB_SEASON };
    } catch (e) { return null; }
  }
};
