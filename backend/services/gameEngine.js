// 1. European Roulette
export function evaluateRoulette(choice, rolledNumber) {
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const color = rolledNumber === 0 ? 'green' : (redNumbers.includes(rolledNumber) ? 'red' : 'black');
  const isEven = rolledNumber !== 0 && rolledNumber % 2 === 0;
  const isOdd = rolledNumber !== 0 && rolledNumber % 2 !== 0;

  let won = false;
  let multiplier = 0;

  if (choice === 'red' || choice === 'black' || choice === 'green') {
    won = choice === color;
    multiplier = color === 'green' ? 14 : 2;
  } else if (choice === 'even') {
    won = isEven;
    multiplier = 2;
  } else if (choice === 'odd') {
    won = isOdd;
    multiplier = 2;
  }

  return { won, multiplier: won ? multiplier : 0, detail: `Ball landed on ${rolledNumber} (${color.toUpperCase()})` };
}

// 2. Andar Bahar
export function evaluateAndarBahar(choice) {
  const outcome = Math.random() < 0.515 ? 'andar' : 'bahar';
  const won = choice.toLowerCase() === outcome;
  const mult = outcome === 'andar' ? 1.9 : 2.0;
  return { won, multiplier: won ? mult : 0, detail: `Joker matched on ${outcome.toUpperCase()}` };
}

// 3. Dragon Tiger
export function evaluateDragonTiger(choice) {
  const dragonCard = Math.floor(Math.random() * 13) + 1;
  const tigerCard = Math.floor(Math.random() * 13) + 1;
  const cards = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  
  let result = 'tie';
  if (dragonCard > tigerCard) result = 'dragon';
  else if (tigerCard > dragonCard) result = 'tiger';

  const won = choice === result;
  const multiplier = result === 'tie' ? 8 : 2;
  return {
    won,
    multiplier: won ? multiplier : 0,
    detail: `Dragon [${cards[dragonCard - 1]}] vs Tiger [${cards[tigerCard - 1]}] -> ${result.toUpperCase()}`
  };
}

// 4. Baccarat (Punto Banco)
export function evaluateBaccarat(choice) {
  const pTotal = (Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)) % 10;
  const bTotal = (Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)) % 10;
  
  let winner = 'tie';
  if (pTotal > bTotal) winner = 'player';
  else if (bTotal > pTotal) winner = 'banker';

  const won = choice === winner;
  let multiplier = 2;
  if (winner === 'banker') multiplier = 1.95;
  if (winner === 'tie') multiplier = 8;

  return {
    won,
    multiplier: won ? multiplier : 0,
    detail: `Player: ${pTotal} pts | Banker: ${bTotal} pts -> ${winner.toUpperCase()} WINS`
  };
}

// 5. Sic Bo (Dice Game)
export function evaluateSicBo(choice) {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const d3 = Math.floor(Math.random() * 6) + 1;
  const total = d1 + d2 + d3;
  const isTriple = d1 === d2 && d2 === d3;

  let won = false;
  let multiplier = 0;

  if (choice === 'triple' && isTriple) {
    won = true;
    multiplier = 30;
  } else if (!isTriple) {
    if (choice === 'small' && total >= 4 && total <= 10) {
      won = true;
      multiplier = 2;
    } else if (choice === 'big' && total >= 11 && total <= 17) {
      won = true;
      multiplier = 2;
    }
  }

  return {
    won,
    multiplier: won ? multiplier : 0,
    detail: `Dice: [${d1}, ${d2}, ${d3}] = Sum ${total} (${total <= 10 ? 'SMALL' : 'BIG'})`
  };
}

// 6. Hi-Lo Cards
export function evaluateHiLo(choice) {
  const baseCard = Math.floor(Math.random() * 13) + 1;
  const nextCard = Math.floor(Math.random() * 13) + 1;
  const cards = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

  let won = false;
  if (choice === 'hi' && nextCard > baseCard) won = true;
  if (choice === 'lo' && nextCard < baseCard) won = true;

  return {
    won,
    multiplier: won ? 1.85 : 0,
    detail: `Current [${cards[baseCard-1]}] -> Dealt [${cards[nextCard-1]}]`
  };
}

// 7. Teen Patti
export function evaluateTeenPatti() {
  const prob = Math.random();
  if (prob > 0.88) return { won: true, multiplier: 4, detail: 'Trail / Trio Hand! (Winner)' };
  if (prob > 0.65) return { won: true, multiplier: 2.5, detail: 'Pure Sequence! (Winner)' };
  if (prob > 0.45) return { won: true, multiplier: 1.8, detail: 'Color / Pair (Winner)' };
  return { won: false, multiplier: 0, detail: 'Dealer holds higher card' };
}

// 8. Blackjack (21)
export function evaluateBlackjack() {
  const pCard1 = Math.floor(Math.random() * 10) + 2;
  const pCard2 = Math.floor(Math.random() * 10) + 2;
  const dCard1 = Math.floor(Math.random() * 10) + 2;
  const dCard2 = Math.floor(Math.random() * 10) + 2;
  const pTotal = pCard1 + pCard2;
  const dTotal = dCard1 + dCard2;
  const won = pTotal > dTotal && pTotal <= 21;
  return { won, multiplier: won ? 2 : 0, detail: `Your Score: ${pTotal} vs Dealer: ${dTotal}` };
}

// 9. Crash Rocket Simulation
export function evaluateCrash(cashoutTarget, crashPoint) {
  const won = cashoutTarget <= crashPoint;
  return { won, multiplier: won ? cashoutTarget : 0, detail: `Rocket exploded at ${crashPoint.toFixed(2)}x` };
}

// 10. Slots: Mega Fruit 777 (3-Reels)
export function evaluateFruitSlots() {
  const pool = ['🍒', '🍋', '🍉', '🔔', '⭐', '7️⃣'];
  const r1 = pool[Math.floor(Math.random() * pool.length)];
  const r2 = pool[Math.floor(Math.random() * pool.length)];
  const r3 = pool[Math.floor(Math.random() * pool.length)];

  let won = false;
  let multiplier = 0;
  if (r1 === r2 && r2 === r3) {
    won = true;
    multiplier = r1 === '7️⃣' ? 15 : 6;
  } else if (r1 === r2 || r2 === r3 || r1 === r3) {
    won = true;
    multiplier = 1.5;
  }
  return { won, multiplier, detail: `${r1} | ${r2} | ${r3}` };
}

// 11. Slots: Pharaoh's Gold (5-Reels Egyptian)
export function evaluatePharaohSlots() {
  const pool = ['🏺', '🦂', '👁️', '👑', '🪙'];
  const reels = Array.from({length: 5}, () => pool[Math.floor(Math.random() * pool.length)]);
  const eyeCount = reels.filter(s => s === '👑' || s === '🪙').length;

  let won = eyeCount >= 2;
  let multiplier = eyeCount === 5 ? 25 : (eyeCount === 4 ? 8 : (eyeCount === 3 ? 3 : (eyeCount === 2 ? 1.5 : 0)));
  return { won, multiplier, detail: reels.join(' ') };
}

// 12. Slots: Sweet Rush Candy (Tumble / Scatter Drop)
export function evaluateCandySlots() {
  const candies = ['🍬', '🍭', '🍫', '🍩', '🧁'];
  const grid = Array.from({length: 4}, () => candies[Math.floor(Math.random() * candies.length)]);
  const matches = grid.filter(c => c === '🍭' || c === '🍬').length;
  const won = matches >= 2;
  const multiplier = matches >= 3 ? 5 : (matches === 2 ? 2 : 0);
  return { won, multiplier, detail: grid.join(' ') };
}
