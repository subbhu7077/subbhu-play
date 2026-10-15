import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { 
  evaluateRoulette, 
  evaluateAndarBahar, 
  evaluateDragonTiger,
  evaluateBaccarat,
  evaluateSicBo,
  evaluateHiLo,
  evaluateCrash, 
  evaluateFruitSlots, 
  evaluatePharaohSlots,
  evaluateCandySlots,
  evaluateBlackjack, 
  evaluateTeenPatti 
} from './services/gameEngine.js';
import { computeSessionStats, computeLiveSportsPrediction } from './services/dataScience.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

const state = {
  wallet: { balance: 103700 },
  ledger: [
    { id: 'tx-1', type: 'BONUS', amount: 5000, reason: 'Initial Grant', timestamp: new Date().toISOString() }
  ],
  auditLogs: [],
  sports: [
    { id: 's1', sport: 'Cricket', teams: 'IND vs PAK', status: 'LIVE', score: 'IND 210/4 (19.1)' },
    { id: 's2', sport: 'Football', teams: 'Real Madrid vs Man City', status: 'UPCOMING', score: 'Starts 01:30 AM' },
    { id: 's3', sport: 'Kabaddi', teams: 'Bengaluru Bulls vs Dabang Delhi', status: 'LIVE', score: '28 - 24' }
  ]
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Subbhu Play All-in-One Live Casino & Slots', virtualOnly: true, timestamp: new Date().toISOString() });
});

app.get('/api/sports', (req, res) => {
  const sportsWithAnalytics = state.sports.map(s => ({
    ...s,
    analytics: computeLiveSportsPrediction(s)
  }));
  res.json({ isDemo: true, data: sportsWithAnalytics });
});

app.get('/api/wallet', (req, res) => {
  res.json({ 
    balance: state.wallet.balance, 
    currency: 'VIRTUAL_COIN', 
    history: state.ledger.slice(-20) 
  });
});

app.get('/api/analytics/summary', (req, res) => {
  const stats = computeSessionStats(state.ledger);
  res.json({ metrics: stats });
});

app.post('/api/wallet/claim-daily', (req, res) => {
  const claimAmount = 1000;
  state.wallet.balance += claimAmount;
  state.ledger.push({
    id: `tx-${Date.now()}`,
    type: 'DAILY_REWARD',
    amount: claimAmount,
    reason: 'Daily Coin Refill',
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, newBalance: state.wallet.balance, added: claimAmount });
});

app.post('/api/games/play', (req, res) => {
  const { game, betAmount, choice } = req.body;
  const coins = Number(betAmount);

  if (!coins || coins <= 0 || isNaN(coins)) {
    return res.status(400).json({ error: 'Valid virtual coin amount required' });
  }
  if (coins > state.wallet.balance) {
    return res.status(400).json({ error: 'Insufficient coins in virtual wallet' });
  }

  state.wallet.balance -= coins;
  let outcome = { won: false, multiplier: 0, detail: '' };

  switch (game) {
    case 'roulette': {
      const rolled = Math.floor(Math.random() * 37);
      outcome = evaluateRoulette(choice || 'red', rolled);
      break;
    }
    case 'andar-bahar': {
      outcome = evaluateAndarBahar(choice || 'andar');
      break;
    }
    case 'dragon-tiger': {
      outcome = evaluateDragonTiger(choice || 'dragon');
      break;
    }
    case 'baccarat': {
      outcome = evaluateBaccarat(choice || 'player');
      break;
    }
    case 'sic-bo': {
      outcome = evaluateSicBo(choice || 'small');
      break;
    }
    case 'hi-lo': {
      outcome = evaluateHiLo(choice || 'hi');
      break;
    }
    case 'blackjack': {
      outcome = evaluateBlackjack();
      break;
    }
    case 'teen-patti': {
      outcome = evaluateTeenPatti();
      break;
    }
    case 'crash': {
      const crashPoint = +(1.05 + Math.random() * 2.8).toFixed(2);
      outcome = evaluateCrash(Number(choice) || 1.5, crashPoint);
      break;
    }
    case 'fruit-slots': {
      outcome = evaluateFruitSlots();
      break;
    }
    case 'pharaoh-slots': {
      outcome = evaluatePharaohSlots();
      break;
    }
    case 'candy-slots': {
      outcome = evaluateCandySlots();
      break;
    }
    default:
      return res.status(400).json({ error: 'Unknown game selected' });
  }

  const winCoins = outcome.won ? Math.floor(coins * outcome.multiplier) : 0;
  state.wallet.balance += winCoins;

  state.ledger.push({
    id: `tx-${Date.now()}`,
    type: 'GAME_ROUND',
    game,
    bet: coins,
    payout: winCoins,
    netChange: winCoins - coins,
    timestamp: new Date().toISOString()
  });

  res.json({
    won: outcome.won,
    payout: winCoins,
    newBalance: state.wallet.balance,
    detail: outcome.detail,
    multiplier: outcome.multiplier
  });
});

app.post('/api/admin/adjust-coins', (req, res) => {
  const { adminKey, amount } = req.body;
  if (adminKey !== 'subbhu-admin-2026') {
    return res.status(403).json({ error: 'Unauthorized credentials' });
  }
  state.wallet.balance += Number(amount);
  res.json({ success: true, newBalance: state.wallet.balance });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Subbhu Play All Live Casino & Slots API running on port ${PORT}`);
});
