// Existing dice runs must remain loadable after retiring the card prototype.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
globalThis.fetch = async url => ({
  ok: true,
  json: async () => JSON.parse(readFileSync(new URL('../' + url.replace(/^\.\//, ''), import.meta.url), 'utf8')),
});
const { loadAll, DB } = await import('../js/data.js');
const { newRun, chooseWeapon, saveRun, loadRun } = await import('../js/run.js');
await loadAll();
const run = newRun();
chooseWeapon(run, DB.events.weapons[0].id);
assert.equal('cards' in run, false);
saveRun({ ...run, cards: ['retired-card-id'] });
const restored = loadRun();
assert.deepEqual(restored, { ...run, _v: 10 });
saveRun(restored);
assert.equal('cards' in JSON.parse(values.get('redhood_run_v9')), false);
assert.deepEqual(loadRun(), restored);
console.log('PASS: current data loads; new runs and legacy saves retain dice-game progress without prototype cards.');
