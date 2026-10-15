import test from 'node:test';
import assert from 'node:assert';
import { evaluateRoulette, evaluateAndarBahar, evaluateCrash, evaluateSlots } from '../services/gameEngine.js';

test('Roulette: Red choice on red number wins 2x', () => {
  const res = evaluateRoulette('red', 7);
  assert.strictEqual(res.won, true);
  assert.strictEqual(res.multiplier, 2);
});

test('Roulette: Wrong color loses', () => {
  const res = evaluateRoulette('black', 7);
  assert.strictEqual(res.won, false);
  assert.strictEqual(res.multiplier, 0);
});

test('Crash Game: Cashout below crash point wins', () => {
  const res = evaluateCrash(2.0, 2.5);
  assert.strictEqual(res.won, true);
  assert.strictEqual(res.multiplier, 2.0);
});

test('Crash Game: Cashout above crash point loses', () => {
  const res = evaluateCrash(3.0, 1.8);
  assert.strictEqual(res.won, false);
  assert.strictEqual(res.multiplier, 0);
});
