import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

const game = readFileSync(new URL('../../dist/game.js', import.meta.url), 'utf8');
const updateSource = game.slice(game.indexOf('  function updateFighter('), game.indexOf('  function updateProjectiles('));
function fixture(action='idle', facing=1) {
  const context = vm.createContext({ AI_ATTACK_ACTIONS:['light','heavy','special1','special2','roll','jumpattack','uppercut'],
    isFacingLocked(f){return (['light','heavy','special1','special2','roll','jumpattack','uppercut'].includes(f.action)&&f.timer>0)||f.stun>0},
    canAct(f){return (f.stun<=0&&f.cool<=0)||(f.action==='down'&&f.timer>0&&f.timer<=.12)},
    match:{state:'fight'}, FLOOR:628, W:1280, sfx(){},
    melee(f,kind){f.action=kind;f.timer=.27;f.cool=.27;}, special(){}, hit(){}, resolveMeleeHit(){}, throwAttempt(){} });
  vm.runInContext(updateSource, context);
  const f={d:{speed:4.8,jump:12},x:400,y:628,vx:0,vy:0,grounded:true,facing,
    action,timer:action==='idle'?0:.3,cool:action==='idle'?0:.3,stun:0,flash:0,trail:[]};
  return {f,update:(o,c={pressed:{}},dt=1/60)=>context.updateFighter(f,o,c,dt)};
}
test('walking persists for multiple ticks and stops on release',()=>{
  const {f,update}=fixture();
  for(let i=0;i<10;i++){update({x:800},{right:true,pressed:{}});assert.equal(f.action,'walk');}
  assert.ok(f.x>400);update({x:800});assert.equal(f.action,'idle');
});
test('left walking, crouching and blocking remain distinct',()=>{
  const {f,update}=fixture();
  update({x:800},{left:true,pressed:{}});assert.equal(f.action,'walk');
  update({x:800},{down:true,pressed:{}});assert.equal(f.action,'crouch');
  update({x:800},{block:true,pressed:{}});assert.equal(f.action,'block');
});
test('attacks lock facing on both sides and unlock after recovery',()=>{
  for(const dir of [-1,1]){
    const {f,update}=fixture('heavy',dir);const o={x:400-dir*100};
    update(o);assert.equal(f.facing,dir);
    for(let i=0;i<30;i++)update(o);
    assert.equal(f.facing,-dir);
  }
});
test('stun locks facing until it expires',()=>{
  const {f,update}=fixture('hurt');f.stun=.2;
  update({x:200});assert.equal(f.facing,1);
  for(let i=0;i<30;i++)update({x:200});
  assert.equal(f.facing,-1);
});
test('new attack faces opponent before locking',()=>{
  const {f,update}=fixture();update({x:200},{pressed:{light:true}});
  assert.equal(f.action,'light');assert.equal(f.facing,-1);
});
const simulation = stripTypeScriptTypes(readFileSync(new URL('../../src/core/simulation.ts',import.meta.url),'utf8'));
const pendingSource = simulation.slice(simulation.indexOf('function pendingHit('),simulation.indexOf('function applyHit('));
test('active hit rejects targets behind either facing, preserves front and vertical range',()=>{
  const move={startupFrames:2,activeFrames:3,reach:100};
  const context=vm.createContext({FIXED_SCALE:1000,activeMove:()=>move});
  vm.runInContext(pendingSource,context);
  for(const facing of [-1,1]){
    const a={x:400000,y:0,facing,actionFrame:2,hitResolved:false};
    assert.equal(context.pendingHit(a,{x:a.x-facing*50000,y:0},0),undefined);
    assert.ok(context.pendingHit(a,{x:a.x+facing*50000,y:0},0));
    assert.equal(context.pendingHit(a,{x:a.x+facing*101000,y:0},0),undefined);
    assert.equal(context.pendingHit(a,{x:a.x+facing*50000,y:141000},0),undefined);
  }
});

