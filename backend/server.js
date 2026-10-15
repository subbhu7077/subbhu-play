import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// In-Memory Demo Store
const demoUsers = {
  'demo-user-1': { id: 'demo-user-1', name: 'Player One', coins: 5000, role: 'player' }
};

const sportsFixtures = [
  { id: 'crick-1', sport: 'Cricket', teams: 'IND vs AUS', status: 'LIVE', score: 'IND 184/3 (18.2 ov)' },
  { id: 'foot-1', sport: 'Football', teams: 'Real Madrid vs Barcelona', status: 'UPCOMING', time: 'Tonight 11:30 PM' },
  { id: 'kab-1', sport: 'Kabaddi', teams: 'Patna Pirates vs Puneri Paltan', status: 'COMPLETED', score: '38 - 36' }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Subbhu Play Engine', timestamp: new Date().toISOString() });
});

// Sports Endpoint
app.get('/api/sports', (req, res) => {
  res.json({ isDemo: true, sports: ['Cricket', 'Football', 'Tennis', 'Kabaddi'], fixtures: sportsFixtures });
});

// User Balance
app.get('/api/wallet', (req, res) => {
  res.json({ coins: demoUsers['demo-user-1'].coins, disclaimer: 'Virtual coins hold no monetary value.' });
});

// Simulated Game Engine Endpoint
app.post('/api/games/play', (req, res) => {
  const { game, betAmount, choice } = req.body;
  const user = demoUsers['demo-user-1'];

  if (!betAmount || betAmount <= 0 || betAmount > user.coins) {
    return res.status(400).json({ error: 'Invalid or insufficient virtual coins' });
  }

  user.coins -= betAmount;
  let won = false;
  let multiplier = 0;
  let detail = '';

  if (game === 'roulette') {
    const rolled = Math.floor(Math.random() * 37);
    const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(rolled);
    const color = rolled === 0 ? 'green' : (isRed ? 'red' : 'black');
    won = choice === color;
    multiplier = color === 'green' ? 14 : 2;
    detail = `Rolled: ${rolled} (${color.toUpperCase()})`;
  } else if (game === 'andar-bahar') {
    const outcome = Math.random() > 0.5 ? 'andar' : 'bahar';
    won = choice === outcome;
    multiplier = 1.9;
    detail = `Match Card dropped on: ${outcome.toUpperCase()}`;
  } else if (game === 'crash') {
    const crashPoint = +(1.01 + Math.random() * 3).toFixed(2);
    won = Number(choice) < crashPoint;
    multiplier = won ? Number(choice) : 0;
    detail = `Rocket Crashed at ${crashPoint}x`;
  } else {
    // Default 50/50 toss-style logic for demo
    won = Math.random() > 0.5;
    multiplier = 2;
    detail = won ? 'Good hand' : 'Dealer won';
  }

  const winAmount = won ? Math.floor(betAmount * multiplier) : 0;
  user.coins += winAmount;

  res.json({
    won,
    winAmount,
    newBalance: user.coins,
    detail,
    disclaimer: 'Pure virtual simulation demo'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Subbhu Play Node Backend running on port ${PORT}`);
});
