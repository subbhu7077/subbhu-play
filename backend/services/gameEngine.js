export function evaluateRoulette(choice, rolledNumber) {
  const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  const color = rolledNumber === 0 ? 'green' : (redNumbers.includes(rolledNumber) ? 'red' : 'black');
  const won = choice === color;
  const multiplier = won ? (color === 'green' ? 14 : 2) : 0;
  return { won, multiplier, detail: `Rolled ${rolledNumber} (${color.toUpperCase()})` };
}

export function evaluateAndarBahar(choice, targetSpot) {
  const won = choice.toLowerCase() === targetSpot.toLowerCase();
  return { won, multiplier: won ? 1.9 : 0, detail: `Card fell on ${targetSpot.toUpperCase()}` };
}

export function evaluateCrash(cashoutTarget, crashPoint) {
  const won = cashoutTarget <= crashPoint;
  return { won, multiplier: won ? cashoutTarget : 0, detail: `Crashed at ${crashPoint.toFixed(2)}x` };
}

export function evaluateSlots() {
  const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
  const s1 = symbols[Math.floor(Math.random() * symbols.length)];
  const s2 = symbols[Math.floor(Math.random() * symbols.length)];
  const s3 = symbols[Math.floor(Math.random() * symbols.length)];
  
  let multiplier = 0;
  let won = false;
  if (s1 === s2 && s2 === s3) {
    won = true;
    multiplier = s1 === '7️⃣' ? 10 : 5;
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    won = true;
    multiplier = 1.5;
  }
  return { won, multiplier, detail: `${s1} | ${s2} | ${s3}` };
}

export function evaluateBlackjack(playerAction) {
  const pCard1 = Math.floor(Math.random() * 10) + 2;
  const pCard2 = Math.floor(Math.random() * 10) + 2;
  const dCard1 = Math.floor(Math.random() * 10) + 2;
  const dCard2 = Math.floor(Math.random() * 10) + 2;
  const pTotal = pCard1 + pCard2;
  const dTotal = dCard1 + dCard2;
  const won = pTotal > dTotal && pTotal <= 21;
  return { won, multiplier: won ? 2 : 0, detail: `You: ${pTotal} vs Dealer: ${dTotal}` };
}

export function evaluateTeenPatti() {
  const rank = Math.random();
  if (rank > 0.85) return { won: true, multiplier: 3, detail: 'Pure Sequence (Winner)' };
  if (rank > 0.50) return { won: true, multiplier: 2, detail: 'Pair / High Hand (Winner)' };
  return { won: false, multiplier: 0, detail: 'Dealer has higher hand' };
}
