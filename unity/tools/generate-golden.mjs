// Current web client is the oracle. Never overwrite Godot's historical fixtures.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { DB } from '../../js/data.js';
import { evalCategory, computeDamage } from '../../js/yahtzee.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourcePaths = ['js/yahtzee.js', 'data/scoring.json', 'data/dice.json', 'data/relics.json'];
for (const name of ['scoring', 'dice', 'relics'])
  DB[name] = JSON.parse(fs.readFileSync(path.join(root, 'data', name + '.json'), 'utf8'));
const sources = Object.fromEntries(sourcePaths.map(p =>
  [p, createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex')]));
const vectors = [];
let seed = 12345;
const random = n => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return Math.floor(seed / 4294967296 * n);
};
function evaluation(cat, faces, zeroed = [], definition) {
  return { type: 'eval', cat: cat.id, ...(definition ? {definition: cat} : {}),
    faces, zeroed, expected: evalCategory(cat, faces, new Set(zeroed)) };
}
function damage(cat, faces, dice, relics = [], zeroed = [], whet = 0, hpRatio = 1, definitions) {
  return { type: 'damage', cat: cat.id, faces, dice, relics, zeroed, whet, hpRatio,
    ...(definitions ? {definitions} : {}),
    expected: computeDamage(cat, faces, dice.map(id => DB.dice.find(d => d.id === id)),
      definitions || relics.map(id => DB.relics.find(r => r.id === id)), new Set(zeroed), {whet, hpRatio}) };
}
for (let i = 0; i < 300; i++) {
  const faces = Array.from({length:5}, () => random(7));
  vectors.push(evaluation(DB.scoring.categories[i % 8], faces, random(3) ? [] : [random(5)]));
}
for (let i = 0; i < 150; i++) {
  const cat = DB.scoring.categories[i % 8];
  const faces = Array.from({length:5}, () => random(6) + 1);
  const dice = Array.from({length:5}, () => ['normal', 'gold', 'twin'][random(3)]);
  const relics = [DB.relics[random(DB.relics.length)].id];
  vectors.push(damage(cat, faces, dice, relics, [random(5)], random(9), [0.3, 0.34, 1][random(3)]));
}
// Guaranteed valid hands, all-stunned hands and edge cases (random-only suites miss rare hands).
const hands = [[0,0,0,0,0], [1,2,3,4,5], [2,3,4,5,6], [5,5,5,3,3],
  [6,6,6,6,6], [2,2,6,6,1], [6,4,3,2,1], [0,1,2,3,4]];
for (const cat of DB.scoring.categories) {
  for (const faces of hands) for (const zeroed of [[], [0], [0,1,2,3,4]])
    vectors.push(evaluation(cat, faces, zeroed));
  for (const relic of DB.relics) {
    vectors.push(damage(cat, cat.example.length === 5 ? cat.example : [6,6,6,6,6],
      ['gold', 'twin', 'normal', 'gold', 'twin'], [relic.id], [0], 7, 0.3));
  }
}
const pair = DB.scoring.categories.find(c => c.id === 'onePair');
vectors.push(damage(pair, [5,5,2,3,4], ['gold','twin','normal','normal','normal'], [], [], 2, 0.34,
  [{hooks: [{type:'categoryMult',category:'onePair',mult:2},
    {type:'categoryBonus',category:'onePair',bonus:3}, {type:'flatDamage',amount:1},
    {type:'lowHpMult',ratio:0.34,mult:1.5}]}]));
for (const score of ['sumTop3', 'sumTop3Distinct', 'sumAll'])
  vectors.push(evaluation({id:'legacyChance',kind:'chance',score}, [6,6,5,4,1], [0], true));
vectors.push(evaluation({id:'upper',kind:'upper',face:6}, [6,6,1,0,6], [1], true));
vectors.push(evaluation({id:'fixedStraight',kind:'straight',length:4,score:30}, [1,2,3,4,4], [], true));
vectors.push(evaluation({id:'doublePair',kind:'ofKind',count:2,score:'matchedSumX2'},
  [4,4,2,2,1], [], true));
const fixture = JSON.stringify({schema:1, sources, vectors}) + '\n';
const destination = path.join(root, 'unity/Tests/Fixtures/current-golden.json');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8') !== fixture)
    throw new Error('Fixture drift: run node unity/tools/generate-golden.mjs');
} else {
  fs.mkdirSync(path.dirname(destination), {recursive:true});
  fs.writeFileSync(destination, fixture);
}
console.log('Current-source golden comparisons: ' + vectors.length);
if (process.argv.includes('--exhaustive')) {
  const out = path.join(root, 'unity/Tests/Generated/exhaustive.jsonl');
  fs.mkdirSync(path.dirname(out), {recursive:true});
  const fd = fs.openSync(out, 'w');
  let count = 0;
  try {
    for (let hand = 0; hand < 7 ** 5; hand++) {
      let n = hand;
      const faces = Array.from({length:5}, () => { const face=n%7; n=Math.floor(n/7); return face; });
      for (const cat of DB.scoring.categories) for (const zeroed of [[], [hand % 5]]) {
        fs.writeSync(fd, JSON.stringify(evaluation(cat, faces, zeroed)) + '\n');
        count++;
      }
    }
  } finally { fs.closeSync(fd); }
  console.log('Exhaustive comparisons: ' + count);
}
