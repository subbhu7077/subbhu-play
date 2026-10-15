const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://subbhu-play-api.onrender.com/api';

let activeGame = 'roulette';

const gameConfigs = {
  'roulette': {
    title: 'European Roulette',
    rule: '14x Green / 2x Red & Black',
    options: `<option value="red">Red (2x)</option><option value="black">Black (2x)</option><option value="green">Green (14x)</option>`
  },
  'andar-bahar': {
    title: 'Andar Bahar',
    rule: '1.9x Direct Payout',
    options: `<option value="andar">Andar (1.9x)</option><option value="bahar">Bahar (1.9x)</option>`
  },
  'crash': {
    title: 'Crash Multiplier',
    rule: 'Cash out before crash',
    options: `<option value="1.5">Cash out 1.5x</option><option value="2.0">Cash out 2.0x</option><option value="3.0">Cash out 3.0x</option>`
  },
  'slots': {
    title: 'Lucky 777 Slots',
    rule: '3 Match: up to 10x | 2 Match: 1.5x',
    options: `<option value="spin">Spin 3-Reels</option>`
  },
  'blackjack': {
    title: 'Blackjack (21)',
    rule: 'Beat dealer without busting',
    options: `<option value="deal">Deal Cards (2x)</option>`
  },
  'teen-patti': {
    title: 'Teen Patti 3-Card',
    rule: 'Trail / Pure Sequence wins up to 3x',
    options: `<option value="play">Play Hand</option>`
  }
};

window.switchGame = function(game) {
  activeGame = game;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  const config = gameConfigs[game];
  document.getElementById('active-title').innerText = config.title;
  document.getElementById('rule-badge').innerText = config.rule;
  document.getElementById('game-choice').innerHTML = config.options;
  document.getElementById('game-result').innerText = 'Ready to play simulation.';
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
  } catch(e) {
    console.error('Analytics telemetry error', e);
  }
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
  } catch (e) {
    console.error('Wallet sync error', e);
  }
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
  } catch (err) {
    document.getElementById('sports-list').innerHTML = `<p style="font-size:0.75rem; color:#f87171;">Node server required for sports analytics.</p>`;
  }
}

window.playCurrentGame = async function() {
  const betCoins = Number(document.getElementById('bet-coins').value);
  const choice = document.getElementById('game-choice').value;
  const resultEl = document.getElementById('game-result');
  resultEl.innerText = 'Processing simulation...';

  try {
    const res = await fetch(`${API_BASE}/games/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: activeGame, betAmount: betCoins, choice })
    });
    const data = await res.json();

    if (res.ok) {
      resultEl.innerHTML = `${data.won ? '🎉 WIN' : '❌ LOSS'} | ${data.detail} (${data.won ? '+' + data.payout : '-' + betCoins} coins)`;
      resultEl.style.color = data.won ? '#34d399' : '#f87171';
      syncWallet();
      fetchTelemetry();
    } else {
      resultEl.innerText = data.error || 'Execution failure';
      resultEl.style.color = '#f87171';
    }
  } catch (err) {
    resultEl.innerText = 'Network error: Backend unreachable.';
    resultEl.style.color = '#f87171';
  }
};

window.claimDaily = async function() {
  try {
    const res = await fetch(`${API_BASE}/wallet/claim-daily`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      alert(`+${data.added} Coins added!`);
      syncWallet();
      fetchTelemetry();
    }
  } catch (e) {
    alert('Daily claim failed');
  }
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
  } catch (e) {
    status.innerText = 'Error connecting admin API';
    status.style.color = '#f87171';
  }
};

loadSports();
syncWallet();
fetchTelemetry();
