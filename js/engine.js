const Engine = {
  predict(match) {
    const a = match.analysis;
    return {
      home: a.home / 100,
      draw: a.draw / 100,
      away: a.away / 100,
      bestBet: a.bestBet,
      ev: a.ev,
      kelly: a.kelly,
      confidence: a.confidence,
      stars: a.stars
    };
  },

  calcKelly(prob, odds) {
    const b = odds - 1;
    if (b <= 0) return 0;
    const kelly = ((b * prob) - (1 - prob)) / b;
    return Math.max(0, kelly * 0.25);
  },

  calcEV(prob, odds) {
    return (prob * odds) - 1;
  }
};
