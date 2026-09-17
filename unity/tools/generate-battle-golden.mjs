// Replay real js/engine.js; do not duplicate its rules in the oracle.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {DB} from '../../js/data.js';
import {rng, createBattle, initialRoll, toggleHold, reroll, confirmCategory, enemyPhase, baseIdOf} from '../../js/engine.js';
import {computeDamage} from '../../js/yahtzee.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
for (const name of ['scoring','dice','relics','enemies','act1','acts','statuses'])
  DB[name] = JSON.parse(fs.readFileSync(path.join(root, 'data', name + '.json'), 'utf8'));
for (const [list, index] of [['dice','diceById'],['relics','relicById'],['enemies','enemyById']])
  DB[index] = Object.fromEntries(DB[list].map(item => [item.id, item]));
DB.statusById = Object.fromEntries(DB.statuses.list.map(item => [item.id, item]));
const files = ['js/engine.js','js/yahtzee.js', ...['scoring','dice','relics','enemies','act1','acts','statuses'].map(n => `data/${n}.json`)];
const sources = Object.fromEntries(files.map(p => [p, createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')]));
const scenarios = [];
const moves = new Set();
let count = 0;
function snapshot(b) {
  const e=b.enemies[0]; moves.add(e.nextMove.id);
  return {phase:b.over ? b.result === 'victory' ? 'Victory' : 'Defeat' : b.await === 'enemy' ? 'EnemyTurn' : b.rolled ? 'Choosing' : 'AwaitingRoll',
    turn:b.turn, playerHp:b.player.hp, enemyHp:Math.max(0,e.hp), enemyBlock:e.block, enemyStrength:e.strength,
    enemyPhaseIndex:e.phaseIndex, intentId:e.nextMove.id, faces:b.dice.map(d=>d.face), held:b.dice.map(d=>d.held),
    bleedLeft:b.dice.map(d=>d.st?.left || 0), rerollsLeft:b.rollsLeft,
    rollTax:b.mods.rollTax?.amount || 0, rollTaxTurns:b.mods.rollTax?.left || 0};
}
for (let seed=1; seed<=24; seed++) {
  let state=seed;
  rng.next=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
  const hp=seed%6===0 ? 8 : DB.act1.player.maxHp;
  const b=createBattle({hp,maxHp:hp,dice:DB.act1.player.startDice,relics:[],categories:Object.fromEntries(DB.scoring.categories.map(c=>[c.id,null])),floor:1,act:1,enlight:0},['wolf']);
  const steps=[];
  const record=command=>{steps.push({command,expected:snapshot(b)});count++;};
  record({op:'start'});
  for(let turn=0;turn<20 && !b.over;turn++) {
    initialRoll(b); record({op:'roll'});
    for(let attempt=0;attempt<seed%3 && !b.over;attempt++) {
      const index=(turn+attempt)%5;
      toggleHold(b,index); reroll(b); record({op:'reroll',index});
    }
    if(b.over) break;
    const choices=DB.scoring.categories.map(c=>({c,damage:computeDamage(c,b.dice.map(d=>d.face),b.diceDefs,[]).total})).filter(v=>v.damage>0);
    choices.sort((a,z)=>seed%2===0 ? z.damage-a.damage : a.damage-z.damage);
    const cat=choices[0].c.id;
    confirmCategory(b,cat,baseIdOf(cat)); record({op:'confirm',category:cat});
    if(!b.over) {enemyPhase(b);record({op:'enemy'});}
  }
  scenarios.push({seed,playerHp:hp,steps});
}
rng.next=Math.random;
const text=JSON.stringify({schema:1,sources,scenarios})+'\n';
const output=path.join(root,'unity/Tests/Fixtures/battle-golden.json');
if(process.argv.includes('--check')) {
  if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==text)throw Error('Battle fixture drift: regenerate battle-golden.json');
} else fs.writeFileSync(output,text);
console.log(`Battle replays: ${scenarios.length}; snapshots: ${count}; moves: ${[...moves].sort().join(', ')}`);
