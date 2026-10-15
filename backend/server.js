import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { 
  evaluateRoulette, 
  evaluateAndarBahar, 
  evaluateCrash, 
  evaluateSlots, 
  evaluateBlackjack, 
  evaluateTeenPatti 
} from './services/gameEngine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// In-Memory Data Store (Syncs with Supabase)
const state = {
  wallet: { balance: 5000 },
  ledger: [
    { id: 'tx-1', type: 'BONUS', amount: 5000, reason: 'Welcome Demo Allowance', timestamp: new Date().toISOString() }
  ],
  auditLogs: [],
  sports: [
    { id: 's1', sport: 'Cricket', teams: 'IND vs PAK', status: 'LIVE', score: 'IND 210/4 (19.1)' },
    { id: 's2', sport: 'Football', teams: 'Real Madrid vs Man City', status: 'UPCOMING', score: 'Starts 01:30 AM' },
    { id: 's3', sport: 'Kabaddi', teams: 'Bengaluru Bulls vs Dabang Delhi', status: 'LIVE', score: '28 - 24' },
    { id: 's4', sport: 'Tennis', teams: 'Alcaraz vs Sinner', status: 'COMPLETED', score: '3-2 (Sets)' }
  ]
};

// Health Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Subbhu Play Master v1.0', virtualOnly: true, timestamp: new Date().toISOString() });
});

// Sports Fixtures
app.get('/api/sports', (req, res) => {
  res.json({ isDemo: true, data: state.sports });
});

// Wallet Balance & History
app.get('/api/wallet', (req, res) => {
  res.json({ 
    balance: state.wallet.balance, 
    currency: 'VIRTUAL_COIN', 
    disclaimer: 'Virtual coins hold zero real monetary value.', 
    history: state.ledger.slice(-10) 
  });
});

// Daily Allowance Claim
app.post('/api/wallet/claim-daily', (req, res) => {
  const claimAmount = 1000;
  state.wallet.balance += claimAmount;
  state.ledger.push({
    id: `tx-${Date.now()}`,
    type: 'DAILY_REWARD',
    amount: claimAmount,
    reason: 'Daily Virtual Coin Refill',
    timestamp: new Date().toISOString()
  });
  res.json({ success: true, newBalance: state.wallet.balance, added: claimAmount });
});

// Game Outcome Execution
app.post('/api/games/play', (req, res) => {
  const { game, betAmount, choice } = req.body;
  const coins = Number(betAmount);

  if (!coins || coins <= 0 || isNaN(coins)) {
    return res.status(400).json({ error: 'Invalid coin amount entered' });
  }
  if (coins > state.wallet.balance) {
    return res.status(400).json({ error: 'Insufficient virtual coin balance' });
  }

  // Deduct stake
  state.wallet.balance -= coins;

  let outcome = { won: false, multiplier: 0, detail: '' };

  switch (game) {
    case 'roulette': {
      const rolled = Math.floor(Math.random() * 37);
      outcome = evaluateRoulette(choice || 'red', rolled);
      break;
    }
    case 'andar-bahar': {
      const drop = Math.random() > 0.5 ? 'andar' : 'bahar';
      outcome = evaluateAndarBahar(choice || 'andar', drop);
      break;
    }
    case 'crash': {
      const crashPoint = +(1.05 + Math.random() * 2.5).toFixed(2);
      outcome = evaluateCrash(Number(choice) || 1.5, crashPoint);
      break;
    }
    case 'slots': {
      outcome = evaluateSlots();
      break;
    }
    case 'blackjack': {
      outcome = evaluateBlackjack(choice);
      break;
    }
    case 'teen-patti': {
      outcome = evaluateTeenPatti();
      break;
    }
    default:
      return res.status(400).json({ error: 'Unknown game mode' });
  }

  const winCoins = outcome.won ? Math.floor(coins * outcome.multiplier) : 0;
  state.wallet.balance += winCoins;

  // Add to Immutable Ledger
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
    multiplier: outcome.multiplier,
    disclaimer: 'Pure virtual demonstration simulation'
  });
});

// Admin Adjust Coins Endpoint (Server Side Check)
app.post('/api/admin/adjust-coins', (req, res) => {
  const { adminKey, amount, reason } = req.body;
  if (adminKey !== 'subbhu-admin-2026') {
    return res.status(403).json({ error: 'Unauthorized admin credentials' });
  }
  
  state.wallet.balance += Number(amount);
  const audit = {
    action: 'COIN_ADJUSTMENT',
    amount: Number(amount),
    reason: reason || 'Admin manual balance adjustment',
    timestamp: new Date().toISOString()
  };
  state.auditLogs.push(audit);
  
  res.json({ success: true, newBalance: state.wallet.balance, audit });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Subbhu Play Master API running on port ${PORT}`);
});
