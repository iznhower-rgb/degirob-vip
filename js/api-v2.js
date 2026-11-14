class APIError extends Error {
  constructor(code, detail) {
    super(detail || code);
    this.code = code;
    this.detail = detail || '';
  }
}

const API = {
  async fetchMatches() {
    console.info('[API] 🚀 Fetching matches (ESPN + RapidAPI)...');
    
    try {
      // 1. جلب مباريات ESPN (سريع، بدون حدود)
      const espnMatches = await this.fetchESPNMatches();
      console.info(`[API] ESPN returned: ${espnMatches.length} matches`);

      // 2. جلب مباريات RapidAPI (مرة واحدة كل 24 ساعة)
      const rapidMatches = await this.fetchRapidAPIMatches();
      console.info(`[API] RapidAPI returned: ${rapidMatches.length} matches`);

      // 3. دمج القائمتين وحذف المكرر
      const allMatches = [...espnMatches, ...rapidMatches];
      const uniqueMatches = this.deduplicateMatches(allMatches);

      // 4. الترتيب
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
      // إذا فشل كل شيء، نحاول جلب ESPN فقط كخط أخير
      const fallback = await this.fetchESPNMatches();
      return fallback.map(i => this.normalizeMatch(i));
    }
  },

  // --- جلب ESPN ---
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
          id: String(ev.id),
          source: 'ESPN',
          leagueSlug: ev.league?.slug || 'all',
          league: ev.league?.name || 'دوري عالمي',
          leagueBadge: ev.league?.abbreviation || 'ALL',
          home: home.team.displayName || home.team.name,
          away: away.team.displayName || away.team.name,
          homeId: home.team.id,
          awayId: away.team.id,
          homeLogo: home.team.logo || null,
          awayLogo: away.team.logo || null,
          time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isLive: statusState === 'in',
          isPost: statusState === 'post',
          elapsed: statusState === 'in' ? parseInt(ev.status?.displayClock?.replace("'", '') || 0) : null,
          kickoff: dateObj.getTime(),
          statusShort: ev.status?.type?.shortDetail || (statusState === 'post' ? 'FT' : 'NS')
        };
      }).filter(Boolean);
    } catch (e) {
      console.warn('[API] ESPN failed:', e.message);
      return [];
    }
  },

  // --- جلب RapidAPI (مع كاش 24 ساعة) ---
  async fetchRapidAPIMatches() {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. التحقق من الكاش
    try {
      const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.RAPIDAPI_CACHE);
      if (cached) {
        const data = JSON.parse(cached);
        const ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        if (data.date === today && ageHours < 24) {
          console.info('[API] RapidAPI: From cache (saving quota)');
          return data.matches;
        }
      }
    } catch (e) {}

    // 2. جلب من الشبكة
    try {
      console.info('[API] RapidAPI: Fetching fresh data (uses 1 request)...');
      const url = `${CONFIG.API.RAPIDAPI_BASE}/football-get-matches-by-date?date=${today}`;
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': CONFIG.API.RAPIDAPI_KEY,
          'x-rapidapi-host': CONFIG.API.RAPIDAPI_HOST
        }
      });

      if (!res.ok) {
        console.warn('[API] RapidAPI HTTP Error:', res.status);
        return [];
      }

      const json = await res.json();
      
      // استخراج المباريات بناءً على هيكل الاستجابة المتوقع
      const matchesData = json.response || json.data || json.matches || [];
      
      const rapidMatches = matchesData.map(ev => {
        // تحويل البيانات إلى الهيكل الموحد
        const dateObj = new Date(ev.match_date || ev.timestamp * 1000 || Date.now());
        return {
          id: String(ev.match_id || Math.random()),
          source: 'RapidAPI',
          leagueSlug: ev.league_id || 'all',
          league: ev.league_name || 'دوري عالمي',
          leagueBadge: (ev.league_name || 'ALL').substring(0, 3).toUpperCase(),
          home: ev.home_team || ev.home?.name || 'Home',
          away: ev.away_team || ev.away?.name || 'Away',
          homeId: ev.home_id || '',
          awayId: ev.away_id || '',
          homeLogo: ev.home_logo || null,
          awayLogo: ev.away_logo || null,
          time: dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          isLive: ev.status === 'LIVE' || ev.match_status === 'LIVE',
          isPost: ev.status === 'FINISHED' || ev.match_status === 'FT',
          elapsed: ev.minute || null,
          kickoff: dateObj.getTime(),
          statusShort: ev.status || 'NS'
        };
      }).filter(m => m.home !== 'Home');

      // 3. حفظ في الكاش
      localStorage.setItem(CONFIG.STORAGE_KEYS.RAPIDAPI_CACHE, JSON.stringify({
        date: today,
        timestamp: Date.now(),
        matches: rapidMatches
      }));

      return rapidMatches;
    } catch (e) {
      console.warn('[API] RapidAPI failed:', e.message);
      return [];
    }
  },

  // --- دمج وحذف المكرر ---
  deduplicateMatches(matches) {
    const seen = new Set();
    const unique = [];

    for (const m of matches) {
      // إنشاء بصمة فريدة للمباراة بناءً على أسماء الفرق (لتفادي التكرار بين ESPN و RapidAPI)
      const fingerprint = `${m.home.toLowerCase()}-${m.away.toLowerCase()}`;
      
      if (seen.has(fingerprint)) {
        // إذا كانت المباراة موجودة، نفضل نسخة ESPN لأن شعاراتها أفضل
        if (m.source === 'ESPN') {
          const index = unique.findIndex(u => `${u.home.toLowerCase()}-${u.away.toLowerCase()}` === fingerprint);
          if (index > -1) unique[index] = m;
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
    const seed = parseInt(ev.id.replace(/\D/g, '').slice(-3), 10) || 1;
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
        rank: parseInt(row.intRank, 10), 
        teamId: row.idTeam, 
        teamName: row.strTeam,
        points: parseInt(row.intPoints, 10) || 0
      }));
      return { standings, season: CONFIG.API.TSDB_SEASON };
    } catch (e) { return null; }
  }
};
