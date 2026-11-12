const DEMO_MATCHES = [
  {
    id: '1', league: 'Premier League', leagueBadge: 'PL',
    home: 'Arsenal', away: 'Chelsea', time: '19:30',
    analysis: {
      home: 52, draw: 26, away: 22,
      ev: 12.4, kelly: 3.2,
      confidence: 'high', stars: 5, bestBet: 'home',
      market: 'clean',
      weather: { desc: 'Clear', temp: '18°C' },
      referee: 'Strict',
      fatigue: { home: 'Fresh', away: 'Tired' },
      coach: 'Offensive',
      xg: { home: 1.85, away: 1.20 }
    }
  },
  {
    id: '2', league: 'La Liga', leagueBadge: 'LL',
    home: 'Real Madrid', away: 'Barcelona', time: '21:00',
    analysis: {
      home: 45, draw: 28, away: 27,
      ev: 8.7, kelly: 2.1,
      confidence: 'medium', stars: 4, bestBet: 'home',
      market: 'clean',
      weather: { desc: 'Clear', temp: '22°C' },
      referee: 'Balanced',
      fatigue: { home: 'Fresh', away: 'Fresh' },
      coach: 'Balanced',
      xg: { home: 1.65, away: 1.45 }
    }
  },
  {
    id: '3', league: 'Serie A', leagueBadge: 'SA',
    home: 'Inter', away: 'Juventus', time: '20:45',
    analysis: {
      home: 48, draw: 30, away: 22,
      ev: 6.2, kelly: 1.8,
      confidence: 'medium', stars: 4, bestBet: 'home',
      market: 'caution',
      weather: { desc: 'Rain', temp: '12°C' },
      referee: 'Strict',
      fatigue: { home: 'Tired', away: 'Fresh' },
      coach: 'Balanced',
      xg: { home: 1.50, away: 1.15 }
    }
  },
  {
    id: '4', league: 'Bundesliga', leagueBadge: 'BL',
    home: 'Bayern Munich', away: 'Dortmund', time: '18:30',
    analysis: {
      home: 58, draw: 24, away: 18,
      ev: 5.1, kelly: 1.5,
      confidence: 'medium', stars: 3, bestBet: 'home',
      market: 'clean',
      weather: { desc: 'Windy', temp: '10°C' },
      referee: 'Lenient',
      fatigue: { home: 'Fresh', away: 'Fresh' },
      coach: 'Offensive',
      xg: { home: 2.10, away: 1.35 }
    }
  },
  {
    id: '5', league: 'Ligue 1', leagueBadge: 'L1',
    home: 'PSG', away: 'Marseille', time: '21:00',
    analysis: {
      home: 60, draw: 22, away: 18,
      ev: 4.8, kelly: 1.2,
      confidence: 'medium', stars: 3, bestBet: 'home',
      market: 'clean',
      weather: { desc: 'Clear', temp: '15°C' },
      referee: 'Balanced',
      fatigue: { home: 'Fresh', away: 'Tired' },
      coach: 'Offensive',
      xg: { home: 2.05, away: 1.10 }
    }
  },
  {
    id: '6', league: 'Premier League', leagueBadge: 'PL',
    home: 'Liverpool', away: 'Manchester City', time: '17:30',
    analysis: {
      home: 38, draw: 28, away: 34,
      ev: 3.2, kelly: 0.9,
      confidence: 'low', stars: 3, bestBet: 'draw',
      market: 'caution',
      weather: { desc: 'Clear', temp: '14°C' },
      referee: 'Strict',
      fatigue: { home: 'Fresh', away: 'Fresh' },
      coach: 'Offensive',
      xg: { home: 1.55, away: 1.65 }
    }
  },
  {
    id: '7', league: 'Eredivisie', leagueBadge: 'ED',
    home: 'Ajax', away: 'PSV', time: '16:30',
    analysis: {
      home: 42, draw: 26, away: 32,
      ev: 2.9, kelly: 0.8,
      confidence: 'low', stars: 2, bestBet: 'home',
      market: 'clean',
      weather: { desc: 'Rain', temp: '11°C' },
      referee: 'Lenient',
      fatigue: { home: 'Fresh', away: 'Fresh' },
      coach: 'Offensive',
      xg: { home: 1.70, away: 1.60 }
    }
  },
  {
    id: '8', league: 'Saudi Pro League', leagueBadge: 'SPL',
    home: 'Al Hilal', away: 'Al Nassr', time: '20:00',
    analysis: {
      home: 55, draw: 25, away: 20,
      ev: 11.2, kelly: 2.8,
      confidence: 'high', stars: 5, bestBet: 'home',
      market: 'clean',
      weather: { desc: 'Clear', temp: '28°C' },
      referee: 'Balanced',
      fatigue: { home: 'Fresh', away: 'Fresh' },
      coach: 'Balanced',
      xg: { home: 1.90, away: 1.30 }
    }
  }
];
