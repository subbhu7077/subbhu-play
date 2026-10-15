const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://subbhu-play-api.onrender.com/api';

let activeCasinoGame = 'andar-bahar';
let activeSlotGame = 'fruit-slots';

const casinoConfigs = {
  'andar-bahar': {
    title: 'Andar Bahar Live',
    rule: '1.9x Andar / 2.0x Bahar',
    options: `<option value="andar">Andar (1.9x)</option><option value="bahar">Bahar (2.0x)</option>`
  },
  'dragon-tiger': {
    title: 'Dragon Tiger Live',
    rule: 'Highest Card Wins 2x | Tie 8x',
    options: `<option value="dragon">Dragon (2x)</option><option value="tiger">Tiger (2x)</option><option value="tie">Tie (8x)</option>`
  },
  'roulette': {
    title: 'European Roulette Live',
    rule: '14x Green / 2x Red, Black, Odd, Even',
    options: `<option value="red">Red (2x)</option><option value="black">Black (2x)</option><option value="green">Green (14x)</option><option value="even">Even (2x)</option><option value="odd">Odd (2x)</option>`
  },
  'baccarat': {
    title: 'Baccarat Punto Banco',
    rule: 'Player 2x / Banker 1.95x / Tie 8x',
    options: `<option value="player">Player (2x)</option><option value="banker">Banker (1.95x)</option><option value="tie">Tie (8x)</option>`
  },
  'sic-bo': {
    title: 'Sic Bo Macau',
    rule: 'Small/Big 2x | Triple 30x',
    options: `<option value="small">Small (4-10) 2x</option><option value="big">Big (11-17) 2x</option><option value="triple">Any Triple (30x)</option>`
  },
  'teen-patti': {
    title: 'Teen Patti 3-Card',
    rule: 'Pure Sequence / Trail up to 4x',
    options: `<option value="play">Play Hand</option>`
  },
  'blackjack': {
    title: 'Blackjack (21)',
    rule: 'Beat Dealer Hand (2x)',
    options: `<option value="deal">Deal Hand</option>`
  },
  'hi-lo': {
    title: 'Hi-Lo Cards',
    rule: 'Higher / Lower 1.85x',
    options: `<option value="hi">Higher</option><option value="lo">Lower</option>`
  },
  'crash': {
    title: 'Crash Multiplier',
    rule: 'Cash out before explosion',
    options: `<option value="1.5">Cash out 1.5x</option><option value="2.0">Cash out 2.0x</option><option value="3.0">Cash out 3.0x</option>`
  }
};

const slotConfigs = {
  'fruit-slots': {
    title: 'Mega Fruit 777',
    rule: '3 Sevens = 15x Jackpot | 2 Match = 1.5x',
    defaultDisplay: '🍒 | 🍋 | 7️⃣'
  },
  'pharaoh-slots': {
    title: "Pharaoh's Gold 5-Reel",
    rule: '5 Crowns = 25x Jackpot | 2+ Coins = Win',
    defaultDisplay: '🏺 🦂 👁️ 👑 🪙'
  },
  'candy-slots': {
    title: 'Sweet Candy Rush',
    rule: 'Lollipops & Candies Scatter = 5x Win',
    defaultDisplay: '🍬 🍭 🍫 🍩'
  }
};

window.switchCategory = function(cat) {
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.section-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(`section-${cat}`).classList.add('active');
};

window.selectGame = function(game) {
  activeCasinoGame = game;
  const btns = document.querySelectorAll('#section-casino .tab-btn');
  btns.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const conf = casinoConfigs[game];
  document.getElementById('casino-title').innerText = conf.title;
  document.getElementById('casino-rule').innerText = conf.rule;
  document.getElementById('casino-choice').innerHTML = conf.options;
  document.getElementById('casino-result').innerText = 'Ready to deal round.';
};

window.selectSlots = function(game) {
  activeSlotGame = game;
  const btns = document.querySelectorAll('#section-slots .tab-btn');
  btns.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');

  const conf = slotConfigs[game];
  document.getElementById('slots-title').innerText = conf.title;
  document.getElementById('slots-rule').innerText = conf.rule;
  document.getElementById('slot-reel-display').innerText = conf.defaultDisplay;
  document.getElementById('slots-result').innerText = 'Ready to spin.';
};

async function executeGameRound(gameKey, betCoins, choiceVal, resultElementId) {
  const resultEl = document.getElementById(resultElementId);
  resultEl.innerText = 'Evaluating round...';

  try {
    const res = await fetch(`${API_BASE}/games/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: gameKey, betAmount: betCoins, choice: choiceVal })
    });
    const data = await res.json();

    if (res.ok) {
      resultEl.innerHTML = `${data.won ? '🎉 WIN' : '❌ LOSS'} | ${data.detail} (${data.won ? '+' + data.payout : '-' + betCoins} coins)`;
      resultEl.style.color = data.won ? '#34d399' : '#f87171';
      syncWallet();
      fetchTelemetry();
      return data;
    } else {
      resultEl.innerText = data.error || 'Execution failure';
      resultEl.style.color = '#f87171';
    }
  } catch (err) {
    resultEl.innerText = 'Network error: Backend unreachable.';
    resultEl.style.color = '#f87171';
  }
}

window.playCasino = function() {
  const bet = Number(document.getElementById('casino-bet').value);
  const choice = document.getElementById('casino-choice').value;
  executeGameRound(activeCasinoGame, bet, choice, 'casino-result');
};

window.spinSlots = async function() {
  const bet = Number(document.getElementById('slots-bet').value);
  const data = await executeGameRound(activeSlotGame, bet, 'spin', 'slots-result');
  if (data && data.detail) {
    document.getElementById('slot-reel-display').innerText = data.detail;
  }
};

async function fetchTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    const data = await res.json();
    const m = data.metrics;
    document.getElementById('stat-winrate').innerText = `${m.winRate}%`;
    document.getElementById('stat-roi').innerText = `${m.roi}%`;
    document.getElementById('stat-rounds').innerText = m.totalRounds;
    document.getElementById('stat-volatility').innerText = m.volatility;
  } catch(e) {}
}

async function syncWallet() {
  try {
    const res = await fetch(`${API_BASE}/wallet`);
    const data = await res.json();
    document.getElementById('wallet-balance').innerText = `🪙 ${data.balance.toLocaleString()} Coins`;
    
    const ledgerEl = document.getElementById('ledger-list');
    if (data.history && data.history.length > 0) {
      ledgerEl.innerHTML = data.history.reverse().map(tx => `
        <div class="tx-item">
          <span>${tx.type} ${tx.game ? '(' + tx.game + ')' : ''}</span>
          <span style="color: ${tx.amount > 0 || tx.payout > 0 ? '#34d399' : '#f87171'}">
            ${tx.amount ? (tx.amount > 0 ? '+' : '') + tx.amount : (tx.netChange >= 0 ? '+' : '') + tx.netChange}
          </span>
        </div>
      `).join('');
    }
  } catch (e) {}
}

async function loadSports() {
  try {
    const res = await fetch(`${API_BASE}/sports`);
    const json = await res.json();
    const list = document.getElementById('sports-list');
    list.innerHTML = json.data.map(m => `
      <div class="match-item">
        <div class="match-head">
          <div>
            <div style="font-weight:700; font-size:0.85rem;">${m.teams}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${m.sport} • ${m.score}</div>
          </div>
          <span class="status-pill">${m.status}</span>
        </div>
        <div class="prob-bar-wrapper">
          <span>Win Prob:</span>
          <div class="prob-bar">
            <div class="prob-fill" style="width: ${m.analytics.winProbA}%"></div>
          </div>
          <span>${m.analytics.winProbA}%</span>
        </div>
      </div>
    `).join('');
  } catch (err) {}
}

window.claimDaily = async function() {
  try {
    const res = await fetch(`${API_BASE}/wallet/claim-daily`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert(`+${data.added} Coins added!`);
      syncWallet();
      fetchTelemetry();
    }
  } catch (e) {}
};

window.executeAdminAdjust = async function() {
  const key = document.getElementById('admin-key').value;
  const coins = document.getElementById('admin-coins').value;
  const status = document.getElementById('admin-status');

  try {
    const res = await fetch(`${API_BASE}/admin/adjust-coins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminKey: key, amount: coins })
    });
    const data = await res.json();
    if (res.ok) {
      status.innerText = `Balance adjusted to ${data.newBalance}`;
      status.style.color = '#34d399';
      syncWallet();
    } else {
      status.innerText = data.error;
      status.style.color = '#f87171';
    }
  } catch (e) {}
};

loadSports();
syncWallet();
fetchTelemetry();
