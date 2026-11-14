class APIError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
    this.detail = detail || '';
  }
}

const API = {
  async fetchMatches() {
    console.info('[API] 🚀 Fetching matches (today, tomorrow, yesterday)...');
    try {
      const allMatches = [];
      const seen = new Set();
      const leagues = CONFIG.API.ESPN_LEAGUES;
      const dates = this._getDateRange();
      const batchSize = CONFIG.API.BATCH_SIZE;

      for (const date of dates) {
        // إذا جمعنا ما يكفي من المباريات (30+)، لا داعي للبحث في الأمس
        if (allMatches.length >= 30) break; 

        for (let i = 0; i < leagues.length; i += batchSize) {
          const batch = leagues.slice(i, i + batchSize);
          const promises = batch.map(l => this._fetchLeague(l, date, seen));
          const results = await Promise.allSettled(promises);

          for (const r of results) {
            if (r.status === 'fulfilled' && r.value) allMatches.push(...r.value);
          }
          await new Promise(res => setTimeout(res, CONFIG.API.BATCH_DELAY_MS));
        }
      }

      // الترتيب: المباشر أولاً، ثم القادم، ثم المنتهي
      allMatches.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        if (!a.isPost && b.isPost) return -1;
        if (a.isPost && !b.isPost) return 1;
        return a.kickoff - b.kickoff;
      });

      const normalized = allMatches.map(i => this.normalizeMatch(i)).filter(Boolean);
      console.info(`[API] ✅ Total matches: ${normalized.length}`);
      return normalized;
    } catch (err) {
      console.error('[API] Failed:', err.message);
      throw new APIError('NETWORK_ERROR', err.message);
    }
  },

  async _fetchLeague(league, date, seen) {
    try {
      const url = `${CONFIG.API.ESPN_BASE}/${league.slug}/scoreboard?dates=${date}&limit=200`;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(t);

      if (!res.ok) return [];

      const json = await res.json();
      const events = json.events || [];
      if (!events.length) return [];

      const result = [];
      for (const ev of events) {
        if (seen.has(ev.id)) continue;
        seen.add(ev.id);

        const comp = ev.competitions?.[0];
        if (!comp || !comp.competitors) continue;

        const home = comp.competitors.find(c => c.homeAway === 'home');
        const away = comp.competitors.find(c => c.homeAway === 'away');
        if (!home || !away) continue;

        const statusState = ev.status?.type?.state || 'pre';
        const isLive = statusState === 'in';
        const isPost = statusState === 'post';
        const dateObj = new Date(ev.date);
        const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        result.push({
          id: String(ev.id),
          leagueSlug: league.slug,
          league: league.name,
          leagueBadge: league.badge,
          home: home.team.displayName || home.team.name,
          away: away.team.displayName || away.team.name,
          homeId: home.team.id,
          awayId: away.team.id,
          homeLogo: home.team.logo || null,
          awayLogo: away.team.logo || null,
          time,
          isLive,
          isPost,
          elapsed: isLive ? parseInt(ev.status?.displayClock?.replace("'", '') || 0) : null,
          kickoff: dateObj.getTime(),
          statusShort: ev.status?.type?.shortDetail || (isPost ? 'FT' : 'NS')
        });
      }
      return result;
    } catch (e) {
      return [];
    }
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
      ...ev,
      analysis: {
        home: homeProb,
        draw: drawProb,
        away: awayProb,
        ev: parseFloat((probDiff / 3 + 1).toFixed(1)),
        kelly: parseFloat(Math.max(0.5, probDiff / 5).toFixed(1)),
        confidence,
        stars,
        bestBet,
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
