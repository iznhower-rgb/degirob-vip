class APIError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
    this.detail = detail || '';
  }
}

const API = {
  // دالة مساعدة للجلب مع مهلة زمنية
  async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT_MS);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      clearTimeout(timeoutId);
      throw e;
    }
  },

  // 1. جلب الفرق والشعارات من ESPN
  async fetchESPNTeams(leagueSlug) {
    try {
      const url = `${CONFIG.API.ESPN_TEAMS}/${leagueSlug}/teams`;
      const res = await this._fetchWithTimeout(url);
      if (!res.ok) return [];
      
      const json = await res.json();
      const teams = json.sports?.[0]?.leagues?.[0]?.teams || [];
      
      return teams.map(t => ({
        id: t.team.id,
        name: t.team.displayName || t.team.name,
        logo: t.team.logos?.[0]?.href || null,
        source: 'ESPN'
      }));
    } catch (e) {
      console.warn(`[API] ESPN teams failed for ${leagueSlug}:`, e.message);
      return [];
    }
  },

  // 2. جلب الفرق والشعارات من TheSportsDB (كاحتياطي)
  async fetchTSDBTeams(leagueName) {
    try {
      const url = `${CONFIG.API.TSDB_TEAMS}/search_all_teams.php?l=${encodeURIComponent(leagueName)}`;
      const res = await this._fetchWithTimeout(url);
      if (!res.ok) return [];
      
      const json = await res.json();
      const teams = json.teams || [];
      
      return teams.map(t => ({
        id: t.idTeam,
        name: t.strTeam,
        logo: t.strTeamBadge || null,
        source: 'TSDB'
      }));
    } catch (e) {
      console.warn(`[API] TSDB teams failed for ${leagueName}:`, e.message);
      return [];
    }
  },

  // 3. الدمج الذكي: جلب الفرق من ESPN أولاً، ثم إكمال الناقص من TSDB
  async fetchUnifiedTeams(leagueSlug) {
    console.info(`[API] Fetching teams for ${leagueSlug}...`);
    
    // جلب من ESPN
    const espnTeams = await this.fetchESPNTeams(leagueSlug);
    console.info(`[API] ESPN: ${espnTeams.length} teams for ${leagueSlug}`);
    
    // جلب من TheSportsDB (إذا كان هناك خريطة اسم)
    const tsdbLeagueName = CONFIG.API.TSDB_LEAGUE_MAP[leagueSlug];
    let tsdbTeams = [];
    if (tsdbLeagueName) {
      tsdbTeams = await this.fetchTSDBTeams(tsdbLeagueName);
      console.info(`[API] TSDB: ${tsdbTeams.length} teams for ${tsdbLeagueName}`);
    }
    
    // دمج القائمتين (ESPN له الأولوية، ثم TSDB للفرق الناقصة)
    const merged = [...espnTeams];
    for (const tsdbTeam of tsdbTeams) {
      const exists = merged.some(t => 
        t.name.toLowerCase() === tsdbTeam.name.toLowerCase() ||
        t.id === tsdbTeam.id
      );
      if (!exists) {
        merged.push(tsdbTeam);
      }
    }
    
    console.info(`[API] ✅ Unified: ${merged.length} teams for ${leagueSlug}`);
    return merged;
  },

  // 4. جلب مباريات اليوم من ESPN (مع دمج الشعارات)
  async fetchMatches() {
    console.info('[API] 🚀 Fetching today\'s matches from ESPN...');
    try {
      const today = this._formatDate(new Date());
      const allMatches = [];
      const seen = new Set();

      // جلب المباريات من كل دوري
      for (const league of CONFIG.API.ESPN_LEAGUES) {
        try {
          const url = `${CONFIG.API.ESPN_BASE}/${league.slug}/scoreboard?dates=${today}&limit=200`;
          const res = await this._fetchWithTimeout(url);
          if (!res.ok) continue;

          const json = await res.json();
          const events = json.events || [];

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

            allMatches.push({
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
        } catch (e) {
          console.warn(`[API] Failed to fetch ${league.slug}:`, e.message);
        }
      }

      // ترتيب المباريات (مباشر أولاً، ثم قادم، ثم منتهي)
      allMatches.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        if (!a.isPost && b.isPost) return -1;
        if (a.isPost && !b.isPost) return 1;
        return a.kickoff - b.kickoff;
      });

      console.info(`[API] ✅ Total matches: ${allMatches.length}`);
      return allMatches;
    } catch (err) {
      console.error('[API] Failed:', err.message);
      throw new APIError('NETWORK_ERROR', err.message);
    }
  },

  // 5. دوال مساعدة
  _formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  },

  // 6. تحويل البيانات إلى الشكل المطلوب في الواجهة
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
  }
};
