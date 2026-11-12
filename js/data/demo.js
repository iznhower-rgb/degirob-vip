const now = Date.now();
const hr = 3600000;
const DEMO_MATCHES = [
  {id:'1', league:'Premier League', h:'Arsenal', a:'Chelsea', time:'19:30', startTime: now + 2*hr, trend:[2.1, 2.05, 2.0, 1.95, 1.90], hLogo:'https://media.api-sports.io/football/teams/42.png', aLogo:'https://media.api-sports.io/football/teams/49.png', analysis:{home:52, draw:26, away:22, ev:12.4, kelly:3.2, conf:'high', stars:5, market:'clean'}, radar:{ home:[85,70,90,75,80], away:[75,80,60,80,65] }},
  {id:'2', league:'La Liga', h:'Real Madrid', a:'Barcelona', time:'21:00', startTime: now + 4*hr, trend:[1.8, 1.82, 1.85, 1.83, 1.88], hLogo:'https://media.api-sports.io/football/teams/541.png', aLogo:'https://media.api-sports.io/football/teams/529.png', analysis:{home:45, draw:28, away:27, ev:8.7, kelly:2.1, conf:'medium', stars:4, market:'clean'}, radar:{ home:[80,75,85,80,70], away:[85,70,80,75,75] }},
  {id:'3', league:'Serie A', h:'Inter', a:'Juventus', time:'20:45', startTime: now + 3*hr, trend:[2.3, 2.25, 2.2, 2.15, 2.1], hLogo:'https://media.api-sports.io/football/teams/505.png', aLogo:'https://media.api-sports.io/football/teams/496.png', analysis:{home:48, draw:30, away:22, ev:6.2, kelly:1.8, conf:'medium', stars:4, market:'caution'}, radar:{ home:[70,85,75,65,80], away:[75,80,70,70,75] }}
];
