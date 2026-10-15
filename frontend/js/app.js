let currentGame = 'roulette';
const API_URL = 'http://localhost:5000/api';

window.selectGame = function(game) {
  currentGame = game;
  const label = document.getElementById('active-game-label');
  const choiceSelect = document.getElementById('game-choice');
  
  if (game === 'roulette') {
    label.innerText = 'Selected: Roulette';
    choiceSelect.innerHTML = `
      <option value="red">Red (2x)</option>
      <option value="black">Black (2x)</option>
      <option value="green">Green (14x)</option>`;
  } else if (game === 'andar-bahar') {
    label.innerText = 'Selected: Andar Bahar';
    choiceSelect.innerHTML = `
      <option value="andar">Andar (1.9x)</option>
      <option value="bahar">Bahar (1.9x)</option>`;
  } else if (game === 'crash') {
    label.innerText = 'Selected: Crash Game';
    choiceSelect.innerHTML = `
      <option value="1.5">Cash out at 1.5x</option>
      <option value="2.0">Cash out at 2.0x</option>
      <option value="3.0">Cash out at 3.0x</option>`;
  } else {
    label.innerText = 'Selected: Teen Patti';
    choiceSelect.innerHTML = `<option value="play">Normal Hand (2x)</option>`;
  }
};

async function loadSports() {
  try {
    const res = await fetch(`${API_URL}/sports`);
    const data = await res.json();
    const container = document.getElementById('sports-list');
    container.innerHTML = data.fixtures.map(f => `
      <div class="match-item">
        <div>
          <div style="font-weight:600; font-size:0.95rem;">${f.teams}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${f.sport} • ${f.score || f.time}</div>
        </div>
        <span class="status-pill">${f.status}</span>
      </div>
    `).join('');
  } catch (e) {
    document.getElementById('sports-list').innerHTML = `<p style="font-size:0.8rem; color:#f87171;">Backend connect nahi hua (Start Node backend below)</p>`;
  }
}

window.executePlay = async function() {
  const betAmount = Number(document.getElementById('bet-coins').value);
  const choice = document.getElementById('game-choice').value;
  const statusEl = document.getElementById('game-status');
  statusEl.innerText = 'Simulating round...';

  try {
    const res = await fetch(`${API_URL}/games/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: currentGame, betAmount, choice })
    });
    const result = await res.json();
    if (res.ok) {
      document.getElementById('wallet-balance').innerText = `🪙 ${result.newBalance.toLocaleString()} Coins`;
      statusEl.innerHTML = `${result.won ? '🎉 WON' : '❌ LOST'}: ${result.detail} (${result.winAmount > 0 ? '+' + result.winAmount : '-' + betAmount} coins)`;
      statusEl.style.color = result.won ? '#4ade80' : '#f87171';
    } else {
      statusEl.innerText = result.error || 'Play error';
      statusEl.style.color = '#f87171';
    }
  } catch (err) {
    statusEl.innerText = 'Network error: Backend chalu kijiye.';
    statusEl.style.color = '#f87171';
  }
};

loadSports();
