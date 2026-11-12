const now = Date.now();
const hour = 60 * 60 * 1000;

const DEMO_MATCHES = [
  {
    id: '1', league: 'Premier League', leagueBadge: 'PL',
    home: 'Arsenal', away: 'Chelsea', time: '19:30',
    status: 'upcoming',
    startTime: new Date(now + 2 * hour).toISOString(),
    marketTrend: [2.10, 2.05, 2.00, 1.95, 1.90, 1.85],
    homeLogo: 'https://media.api-sports.io/football/teams/42.png',
    awayLogo: 'https://media.api-sports.io/football/teams/49.png',
    analysis: {
      home: 52, draw: 26, away: 22, ev: 12.4, kelly: 3.2,
      confidence: 'high', stars: 5, bestBet: 'home', market: 'clean',
      weather: { desc: 'Clear', temp: '18°C' }, referee: 'Strict',
      fatigue: { home: 'Fresh', away: 'Tired' }, coach: 'Offensive',
      xg: { home: 1.85, away: 1.20 }
    }
  },
  {
    id: '2', league: 'La Liga', leagueBadge: 'LL',
    home: 'Real Madrid', away: 'Barcelona', time: '21:00',
    status: 'live', // 🔴 مباراة مباشرة
    startTime: new Date(now - 1 * hour).toISOString(), // بدأت قبل ساعة
    marketTrend: [1.80, 1.82, 1.85, 1.83, 1.88, 1.90],
    homeLogo: 'https://media.api-sports.io/football/teams/541.png',
    awayLogo: 'https://media.api-sports.io/football/teams/529.png',
    analysis: {
      home: 45, draw: 28, away: 27, ev: 8.7, kelly: 2.1,
      confidence: 'medium', stars: 4, bestBet: 'home', market: 'clean',
      weather: { desc: 'Clear', temp: '22°C' }, referee: 'Balanced',
      fatigue: { home: 'Fresh', away: 'Fresh' }, coach: 'Balanced',
      xg: { home: 1.65, away: 1.45 }
    }
  },
  {
    id: '3', league: 'Serie A', leagueBadge: 'SA',
    home: 'Inter', away: 'Juventus', time: '20:45',
    status: 'upcoming',
    startTime: new Date(now + 3 * hour).toISOString(),
    marketTrend: [2.30, 2.25, 2.25, 2.20, 2.15, 2.10],
    homeLogo: 'https://media.api-sports.io/football/teams/505.png',
    awayLogo: 'https://media.api-sports.io/football/teams/496.png',
    analysis: {
      home: 48, draw: 30, away: 22, ev: 6.2, kelly: 1.8,
      confidence: 'medium', stars: 4, bestBet: 'home', market: 'caution',
      weather: { desc: 'Rain', temp: '12°C' }, referee: 'Strict',
      fatigue: { home: 'Tired', away: 'Fresh' }, coach: 'Balanced',
      xg: { home: 1.50, away: 1.15 }
    }
  },
  {
    id: '4', league: 'Bundesliga', leagueBadge: 'BL',
    home: 'Bayern Munich', away: 'Dortmund', time: '18:30',
    status: 'upcoming',
    startTime: new Date(now + 1 * hour).toISOString(),
    marketTrend: [1.50, 1.52, 1.48, 1.45, 1.42, 1.40],
    homeLogo: 'https://media.api-sports.io/football/teams/157.png',
    awayLogo: 'https://media.api-sports.io/football/teams/165.png',
    analysis: {
      home: 58, draw: 24, away: 18, ev: 5.1, kelly: 1.5,
      confidence: 'medium', stars: 3, bestBet: 'home', market: 'clean',
      weather: { desc: 'Windy', temp: '10°C' }, referee: 'Lenient',
      fatigue: { home: 'Fresh', away: 'Fresh' }, coach: 'Offensive',
      xg: { home: 2.10, away: 1.35 }
    }
  },
  {
    id: '5', league: 'Ligue 1', leagueBadge: 'L1',
    home: 'PSG', away: 'Marseille', time: '21:00',
    status: 'upcoming',
    startTime: new Date(now + 5 * hour).toISOString(),
    marketTrend: [1.35, 1.38, 1.36, 1.40, 1.42, 1.45],
    homeLogo: 'https://media.api-sports.io/football/teams/85.png',
    awayLogo: 'https://media.api-sports.io/football/teams/81.png',
    analysis: {
      home: 60, draw: 22, away: 18, ev: 4.8, kelly: 1.2,
      confidence: 'medium', stars: 3, bestBet: 'home', market: 'clean',
      weather: { desc: 'Clear', temp: '15°C' }, referee: 'Balanced',
      fatigue: { home: 'Fresh', away: 'Tired' }, coach: 'Offensive',
      xg: { home: 2.05, away: 1.10 }
    }
  }
];
