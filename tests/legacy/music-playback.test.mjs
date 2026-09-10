import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const game=readFileSync(new URL('../../dist/game.js',import.meta.url),'utf8');
const code=game.slice(game.indexOf('  const MUSIC_CUES='),game.indexOf('  function sfx('));
function buffer(channels,length,rate){
  const data=Array.from({length:channels},()=>new Float32Array(length));
  return {numberOfChannels:channels,length,sampleRate:rate,duration:length/rate,getChannelData:i=>data[i]};
}
function fixture(fetcher){
  const sources=[],gains=[];
  const ctx={currentTime:0,createBuffer:buffer,decodeAudioData:async()=>buffer(2,400,100),
    createGain(){const g={gain:{value:0,setTargetAtTime(v){this.value=v}},connect(){},disconnect(){this.disconnected=true}};gains.push(g);return g},
    createBufferSource(){const s={connect(){},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};sources.push(s);return s}};
  const audio={ctx,current:null,muted:false};
  const context=vm.createContext({audio,ensureAudio(){},AbortController,console,fetch:fetcher||(async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)}))});
  vm.runInContext(code,context);return {context,audio,sources,gains,ctx};
}
test('loop preserves stereo and joins without a full-scale boundary jump',()=>{
  const {context,ctx}=fixture();const b=buffer(2,500,100);
  for(let i=0;i<500;i++){b.getChannelData(0)[i]=i/500;b.getChannelData(1)[i]=-i/1000}
  const loop=context.makeMusicLoop(ctx,b,{start:.5,end:4.5});
  assert.equal(loop.length,325);assert.equal(loop.numberOfChannels,2);
  for(let c=0;c<2;c++){
    const x=loop.getChannelData(c);
    assert.ok(Math.abs(x[0]-x.at(-1))<.003);
    assert.ok(Math.abs(x[74]-x[75])<.003);
    assert.ok(Math.max(...x.map(Math.abs))<=1);
  }
  assert.ok(loop.getChannelData(0)[100]>0&&loop.getChannelData(1)[100]<0);
});
test('track switches cannot revive stale asynchronous music loads',async()=>{
  const requests=[];const {context,audio,sources}=fixture(()=>new Promise(resolve=>requests.push(resolve)));
  const first=context.playMusic('first.mp3');const second=context.playMusic('second.mp3');
  const response={ok:true,arrayBuffer:async()=>new ArrayBuffer(0)};
  requests[1](response);await second;requests[0](response);await first;
  assert.equal(sources.length,1);assert.equal(audio.current.src,'second.mp3');assert.equal(sources[0].started,true);
});
test('mute preserves headroom and repeated requests do not restart music',async()=>{
  const {context,audio,sources}=fixture();await context.playMusic('test.mp3');
  assert.ok(Math.abs(audio.current.gain.gain.value-.52*10**(-3/20))<1e-9);
  audio.muted=true;context.musicVolume();assert.equal(audio.current.gain.gain.value,0);
  await context.playMusic('test.mp3');assert.equal(sources.length,1);
  context.stopMusic();assert.equal(sources[0].stopped,true);assert.equal(audio.current,null);
});
test('credits play once and release their audio nodes on completion',async()=>{
  const {context,audio,sources}=fixture();await context.playMusic('EndCredits.mp3',false);
  assert.equal(sources[0].loop,false);assert.equal(sources[0].buffer.length,400);
  sources[0].onended();assert.equal(audio.current,null);
});
