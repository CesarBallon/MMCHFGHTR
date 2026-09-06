(() => {
  'use strict';

  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d', { alpha: false });
  const W = canvas.width, H = canvas.height, FLOOR = 628;
  const idleCanvas=document.createElement('canvas'),idleCtx=idleCanvas.getContext('2d');idleCanvas.width=W;idleCanvas.height=H;
  ctx.imageSmoothingEnabled = false;

  const FIGHTERS = [
    {id:'saja',name:'SAJA',sheet:'assets/fighters/saja.webp',idle:'assets/fighters/select-v16/saja.webp?v=17',portrait:'assets/fighters/portraits-v16/saja.webp?v=17',grid:[4,3],speed:4.8,jump:12.4,power:.94,defense:1.0,size:306,color:'#ef3ca8',accent:'#ffdc52',s1:'BRAID LASH',s2:'SAYA WAVE',kind:'whip'},
    {id:'benita',name:'BENITA',sheet:'assets/fighters/benita.webp',idle:'assets/fighters/select-v16/benita.webp?v=18',portrait:'assets/fighters/portraits-v16/benita.webp?v=18',grid:[4,3],speed:3.45,jump:10.4,power:1.2,defense:1.13,size:312,color:'#d63b2f',accent:'#f6ad3c',s1:'BEER BATH',s2:'HIDDEN SHOT',kind:'heavy'},
    {id:'mariachay',name:'MARIACHAY',sheet:'assets/fighters/mariachay.webp',idle:'assets/fighters/select-v16/mariachay.webp?v=17',portrait:'assets/fighters/portraits-v16/mariachay.webp?v=17',grid:[4,3],speed:5.35,jump:13.2,power:.9,defense:.91,size:288,color:'#3069bf',accent:'#f2b43e',s1:'ROLLING RUSH',s2:'SKY SLAP',kind:'rush'},
    {id:'asunta',name:'ASUNTA',sheet:'assets/fighters/asunta.webp',idle:'assets/fighters/select-v16/asunta.webp?v=17',portrait:'assets/fighters/portraits-v16/asunta.webp?v=17',grid:[4,3],speed:3.75,jump:10.7,power:1.02,defense:1.08,size:315,color:'#526371',accent:'#ea3d88',s1:'BABY SHRIEK',s2:'DIAPER TOSS',kind:'stretch'},
    {id:'shabuka',name:'SHABUKA',sheet:'assets/fighters/shabuka.webp',idle:'assets/fighters/select-v16/shabuka.webp?v=17',portrait:'assets/fighters/portraits-v16/shabuka.webp?v=17',grid:[4,3],speed:3.8,jump:11.6,power:1.25,defense:1.16,size:337,color:'#16141f',accent:'#b030ff',s1:'POM POWER',s2:'RISING CHEER',kind:'power'},
    {id:'bella',name:'BELLA',sheet:'assets/fighters/bella.webp',idle:'assets/fighters/select-v16/bella.webp?v=17',portrait:'assets/fighters/portraits-v16/bella.webp?v=17',grid:[8,2],speed:4.45,jump:11.8,power:1.0,defense:.96,size:321,color:'#e6bc54',accent:'#f9f4dc',s1:'HIGH NOTE',s2:'MIC RETURN',kind:'staff'},
    {id:'jarjacha',name:'JARJACHA',sheet:'assets/fighters/jarjacha.webp?v=19',idle:'assets/fighters/select-v16/jarjacha.webp?v=19',portrait:'assets/fighters/portraits-v16/jarjacha.webp?v=19',grid:[8,2],speed:4.15,jump:11.3,power:.96,defense:.9,size:321,color:'#657d34',accent:'#ff884a',s1:'DIZZY HANDS',s2:'SANDAL RETURN',kind:'odd'},
    {id:'coraima',name:'CORAIMA',sheet:'assets/fighters/coraima.webp',idle:'assets/fighters/select-v16/coraima.webp?v=17',portrait:'assets/fighters/portraits-v16/coraima.webp?v=17',grid:[4,3],speed:4.75,jump:12.3,power:1.04,defense:1.0,size:318,color:'#18a6c7',accent:'#ff713d',s1:'FLYING KISS',s2:'TORNADO HEEL',kind:'balanced'}
  ];

  const SOUNDTRACK_ROOT='assets/audio/soundtrack/';
  const MENU_MUSIC=`${SOUNDTRACK_ROOT}Intro_SelectionScreen.mp3?v=15`;
  const CREDITS_MUSIC=`${SOUNDTRACK_ROOT}EndCredits.mp3?v=15`;
  const STAGES = [
    {name:'MACHU PICCHU — DAWN',img:'assets/stages/machu.webp',tone:'#78b6b3',fighter:'mariachay',music:`${SOUNDTRACK_ROOT}MariachayTheme.mp3?v=20`},
    {name:'PRISON YARD',img:'assets/stages/prison.webp',tone:'#e79345',fighter:'benita',music:`${SOUNDTRACK_ROOT}BenitaTheme.mp3?v=20`},
    {name:'CUMBIA MEGACONCERT',img:'assets/stages/cumbia.webp',tone:'#f046b7',fighter:'bella',music:`${SOUNDTRACK_ROOT}BellaTheme.mp3?v=20`},
    {name:'MERCADO CENTRAL',img:'assets/stages/mercado.webp',tone:'#e94e36',fighter:'jarjacha',music:`${SOUNDTRACK_ROOT}JarjachaTheme.mp3?v=20`},
    {name:'LAKE TITICACA — WINTER',img:'assets/stages/titicaca.webp',tone:'#5fbbe8',fighter:'saja',music:`${SOUNDTRACK_ROOT}SajaTheme.mp3?v=20`},
    {name:'AREQUIPA — MISTI WARNING',img:'assets/stages/arequipa.webp',tone:'#e77a45',fighter:'coraima',music:`${SOUNDTRACK_ROOT}CoraimaTheme.mp3?v=20`},
    {name:'THE FORGOTTEN BIG TOP',img:'assets/stages/circus.webp',tone:'#8a3ba2',fighter:'shabuka',music:`${SOUNDTRACK_ROOT}ShabukaTheme.mp3?v=20`},
    {name:'LIMA — RED LIGHT',img:'assets/stages/lima.webp',tone:'#d74646',fighter:'asunta',music:`${SOUNDTRACK_ROOT}AsuntaTheme.mp3?v=20`}
  ];

  const ACTION_SETS={
    saja:{
      locomotion:'assets/fighters/actions/saja/locomotion.webp?v=21',
      combat:'assets/fighters/actions/saja/combat.webp?v=21',
      special1:'assets/fighters/actions/saja/braid-lash.webp?v=21',
      special2:'assets/fighters/actions/saja/saya-wave.webp?v=21'
    },
    benita:{
      locomotion:'assets/fighters/actions/benita/locomotion.webp?v=22',
      combat:'assets/fighters/actions/benita/combat.webp?v=22',
      special1:'assets/fighters/actions/benita/beer-bath.webp?v=22',
      special2:'assets/fighters/actions/benita/revolver.webp?v=22'
    },
    mariachay:{
      locomotion:'assets/fighters/actions/mariachay/locomotion.webp?v=23',
      combat:'assets/fighters/actions/mariachay/combat.webp?v=23',
      special1:'assets/fighters/actions/mariachay/rolling-rush.webp?v=23',
      special2:'assets/fighters/actions/mariachay/sky-slap.webp?v=23'
    },
    asunta:{
      locomotion:'assets/fighters/actions/asunta/locomotion.webp?v=24',
      combat:'assets/fighters/actions/asunta/combat.webp?v=24',
      special1:'assets/fighters/actions/asunta/baby-shriek.webp?v=24',
      special2:'assets/fighters/actions/asunta/diaper-toss.webp?v=24'
    },
    shabuka:{
      locomotion:'assets/fighters/actions/shabuka/locomotion.webp?v=25',
      combat:'assets/fighters/actions/shabuka/combat.webp?v=25',
      special1:'assets/fighters/actions/shabuka/pom-power.webp?v=25',
      special2:'assets/fighters/actions/shabuka/rising-cheer.webp?v=25'
    },
    bella:{
      locomotion:'assets/fighters/actions/bella/locomotion.webp?v=26',
      combat:'assets/fighters/actions/bella/combat.webp?v=26',
      special1:'assets/fighters/actions/bella/high-note.webp?v=26',
      special2:'assets/fighters/actions/bella/mic-return.webp?v=26'
    },
    jarjacha:{
      locomotion:'assets/fighters/actions/jarjacha/locomotion.webp?v=27',
      combat:'assets/fighters/actions/jarjacha/combat.webp?v=27',
      special1:'assets/fighters/actions/jarjacha/dizzy-hands.webp?v=27',
      special2:'assets/fighters/actions/jarjacha/sandal-return.webp?v=27'
    },
    coraima:{
      locomotion:'assets/fighters/actions/coraima/locomotion.webp?v=28',
      combat:'assets/fighters/actions/coraima/combat.webp?v=28',
      special1:'assets/fighters/actions/coraima/flying-kiss.webp?v=28',
      special2:'assets/fighters/actions/coraima/tornado-heel.webp?v=28'
    }
  };
  const ACTION_CLIPS={
    idle:{atlas:'locomotion',start:0,count:4,loop:true,fps:16},
    walk:{atlas:'locomotion',start:4,count:4,loop:true,fps:16},
    crouch:{atlas:'locomotion',start:8,count:4,loop:true,fps:16},
    jump:{atlas:'locomotion',start:12,count:4,airborne:true},
    light:{atlas:'combat',start:0,count:4,duration:.27,fps:16},
    heavy:{atlas:'combat',start:4,count:4,duration:.46,fps:16},
    block:{atlas:'combat',start:8,count:4,loop:true,fps:16},
    hurt:{atlas:'combat',start:12,count:4,duration:.38,fps:16},
    special1:{atlas:'special1',start:0,count:16,duration:.65,fps:16},
    special2:{atlas:'special2',start:0,count:16,duration:.65,fps:16}
  };
  const ACTION_ALIASES={mariachay:{roll:'special1',jumpattack:'special2'},shabuka:{uppercut:'special2'},coraima:{uppercut:'special2'}};

  const SFX_FILES={
    menu:'ui_move',confirm:'ui_confirm',jump:'jump',whoosh:'whoosh',hit:'hit_light',heavy:'hit_heavy',
    block:'block',projectile:'projectile',special:'special',round:'round',ko:'ko'
  };

  const SELECT_HEIGHTS=FIGHTERS.map(f=>Math.round(455*f.size/306));

  const images = {};
  const sheetMeta = new WeakMap();
  const audio = { current:null, muted:false, ctx:null, buffers:{}, effects:{} };
  const input = { keys:new Set(), pressed:new Set(), touch:new Set(), pads:[], prevPads:[] };
  let screen = 'loading', mode = 0, selectIndex = 0, selectPhase = 0, p1Choice = 0, p2Choice = 1;
  let stageIndex = 0, match = null, last = performance.now(), accumulator = 0, globalTime = 0;
  let menuPulse = 0, gamepadStatus = '';

  const imageFiles = {
    title:'assets/ui/title.webp', lineup:'assets/ui/lineup.webp', select:'assets/ui/select.webp',
    ...Object.fromEntries(FIGHTERS.map(f=>['fighter_'+f.id,f.sheet])),
    ...Object.fromEntries(FIGHTERS.map(f=>['idle_'+f.id,f.idle])),
    ...Object.fromEntries(FIGHTERS.map(f=>['portrait_'+f.id,f.portrait])),
    ...Object.fromEntries(Object.entries(ACTION_SETS).flatMap(([fighter,set])=>Object.entries(set).map(([action,src])=>['action_'+fighter+'_'+action,src]))),
    ...Object.fromEntries(STAGES.map((s,i)=>['stage_'+i,s.img]))
  };

  function loadImage(src){ return new Promise((resolve,reject)=>{ const i=new Image(); i.onload=()=>resolve(i); i.onerror=reject; i.src=src; }); }

  function preprocessSheet(img,grid,normalize=false,fighterId=''){
    const c=document.createElement('canvas'); c.width=img.width;c.height=img.height;
    const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0);
    const d=x.getImageData(0,0,c.width,c.height), p=d.data;
    const [cols,rows]=grid,frames=[];
    let hasAlpha=false;for(let o=3;o<p.length;o+=388)if(p[o]<20){hasAlpha=true;break}
    const neutral=(i,min=142,spread=68)=>{const o=i*4,r=p[o],g=p[o+1],b=p[o+2];return p[o+3]<20||(Math.min(r,g,b)>min&&Math.max(r,g,b)-Math.min(r,g,b)<spread)};
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const sx=Math.round(col*c.width/cols),ex=Math.round((col+1)*c.width/cols),sy=Math.round(row*c.height/rows),ey=Math.round((row+1)*c.height/rows);
      let interiorMask=null;
      // Seed transparency inside enclosed checkerboard pockets. The following
      // fringe passes then consume their grey antialiasing without touching
      // warm costume whites or skin highlights.
      if(normalize&&!hasAlpha){
        const fw=ex-sx,fh=ey-sy,seen=new Uint8Array(fw*fh),queue=new Int32Array(fw*fh);interiorMask=new Uint8Array(fw*fh);
        const isCheckerSeed=i=>{const o=i*4,r=p[o],g=p[o+1],b=p[o+2];return p[o+3]>20&&Math.min(r,g,b)>178&&Math.max(r,g,b)-Math.min(r,g,b)<18};
        let rawMinX=ex,rawMaxX=sx;for(let yy=sy;yy<ey;yy++)for(let xx=sx;xx<ex;xx++)if(p[(yy*c.width+xx)*4+3]>20){rawMinX=Math.min(rawMinX,xx);rawMaxX=Math.max(rawMaxX,xx)}
        const rawCenter=(rawMinX+rawMaxX)/2,rawWidth=Math.max(1,rawMaxX-rawMinX);
        for(let yy=sy;yy<ey;yy++)for(let xx=sx;xx<ex;xx++){
          const local=(yy-sy)*fw+xx-sx,start=yy*c.width+xx;if(seen[local]||!isCheckerSeed(start))continue;
          let head=0,tail=0,minCX=xx,maxCX=xx,minCY=yy,maxCY=yy;queue[tail++]=start;seen[local]=1;
          while(head<tail){
            const i=queue[head++],qx=i%c.width,qy=(i/c.width)|0;minCX=Math.min(minCX,qx);maxCX=Math.max(maxCX,qx);minCY=Math.min(minCY,qy);maxCY=Math.max(maxCY,qy);
            for(const [nx,ny] of [[qx-1,qy],[qx+1,qy],[qx,qy-1],[qx,qy+1]]){
              if(nx<sx||nx>=ex||ny<sy||ny>=ey)continue;const li=(ny-sy)*fw+nx-sx,ni=ny*c.width+nx;
              if(!seen[li]&&isCheckerSeed(ni)){seen[li]=1;queue[tail++]=ni}
            }
          }
          let checkerEdge=0,coloredEdge=0;
          for(let i=0;i<tail;i++){
            const pi=queue[i],qx=pi%c.width,qy=(pi/c.width)|0;
            for(const [nx,ny] of [[qx-1,qy],[qx+1,qy],[qx,qy-1],[qx,qy+1]]){
              if(nx<sx||nx>=ex||ny<sy||ny>=ey)continue;const ni=ny*c.width+nx;if(isCheckerSeed(ni)||p[ni*4+3]<20)continue;
              const o=ni*4,r=p[o],g=p[o+1],b=p[o+2];if(Math.min(r,g,b)>60&&Math.max(r,g,b)-Math.min(r,g,b)<24)checkerEdge++;else coloredEdge++;
            }
          }
          const bw=maxCX-minCX+1,bh=maxCY-minCY+1,cx=(minCX+maxCX)/2;
          const broad=tail>=160&&bw>5&&bh>5;
          const outsideCore=Math.abs(cx-rawCenter)>rawWidth*.22;
          const shabukaArm=fighterId==='shabuka'&&cx<rawCenter-rawWidth*.08&&maxCY<sy+fh*.55;
          const patterned=tail>=6&&bw>3&&bh>3&&(outsideCore||shabukaArm)&&checkerEdge>=4&&checkerEdge/(checkerEdge+coloredEdge)>.42;
          if(broad||patterned)for(let i=0;i<tail;i++){const pi=queue[i];p[pi*4+3]=0;interiorMask[(((pi/c.width)|0)-sy)*fw+pi%c.width-sx]=1}
        }
      }
      if(!hasAlpha){
        const seen=new Uint8Array((ex-sx)*(ey-sy)),q=new Int32Array((ex-sx)*(ey-sy));let head=0,tail=0;
        const push=(xx,yy)=>{if(xx<sx||xx>=ex||yy<sy||yy>=ey)return;const li=(yy-sy)*(ex-sx)+(xx-sx),i=yy*c.width+xx;if(!seen[li]&&neutral(i)){seen[li]=1;q[tail++]=i;}};
        for(let xx=sx;xx<ex;xx++){push(xx,sy);push(xx,ey-1)}for(let yy=sy;yy<ey;yy++){push(sx,yy);push(ex-1,yy)}
        while(head<tail){const i=q[head++],xx=i%c.width,yy=(i/c.width)|0;p[i*4+3]=0;push(xx-1,yy);push(xx+1,yy);push(xx,yy-1);push(xx,yy+1)}
      }
      // Expand only the detected interior holes. Exterior cutout edges have
      // already been cleaned offline, and must not consume pale costume props.
      for(let pass=0;pass<(!hasAlpha?(normalize?10:3):0);pass++){
          const clear=[],fw=ex-sx;
          for(let yy=sy+1;yy<ey-1;yy++)for(let xx=sx+1;xx<ex-1;xx++){
            const i=yy*c.width+xx,o=i*4;if(p[o+3]<20||!neutral(i,normalize?72:116,normalize?42:82))continue;
            let edge=false;for(let ny=-1;ny<=1&&!edge;ny++)for(let nx=-1;nx<=1;nx++)if((nx||ny)&&(normalize?interiorMask[(yy+ny-sy)*fw+xx+nx-sx]:p[((yy+ny)*c.width+xx+nx)*4+3]<20)){edge=true;break}
            if(edge)clear.push([o+3,(yy-sy)*fw+xx-sx]);
          }
          for(const [a,li] of clear){p[a]=0;if(normalize)interiorMask[li]=1}
      }
      let minX=ex,maxX=sx,minY=ey,maxY=sy,count=0;const hist=new Uint32Array(ex-sx);
      for(let yy=sy;yy<ey;yy++)for(let xx=sx;xx<ex;xx++){const i=yy*c.width+xx;if(p[i*4+3]>48){minX=Math.min(minX,xx);maxX=Math.max(maxX,xx);minY=Math.min(minY,yy);maxY=Math.max(maxY,yy);hist[xx-sx]++;count++}}
      let medianX=(sx+ex)/2;
      if(count){let n=0;for(let xx=0;xx<hist.length;xx++){n+=hist[xx];if(n>=count/2){medianX=sx+xx+.5;break}}}
      frames.push({sx,sy,sw:ex-sx,sh:ey-sy,anchorX:medianX-sx,bboxCenterX:count?(minX+maxX)/2-sx:(ex-sx)/2,bottom:count?maxY-sy+1:ey-sy,bboxW:count?maxX-minX+1:ex-sx,bboxH:count?maxY-minY+1:ey-sy});
    }
    const maxW=Math.max(...frames.map(f=>f.bboxW)),maxH=Math.max(...frames.map(f=>f.bboxH));
    if(normalize){
      const stableAnchor=[...frames].sort((a,b)=>a.anchorX-b.anchorX)[frames.length>>1].anchorX;
      for(const f of frames)f.anchorX=stableAnchor;
    }
    x.putImageData(d,0,0);sheetMeta.set(c,{grid:[cols,rows],frames,normalize,maxW,maxH});
    return c;
  }

  async function loadAll(){
    ensureAudio(false);
    for(const [key,file] of Object.entries(SFX_FILES)){
      const url=`assets/audio/sfx/${file}.wav?v=20`;
      const sample=new Audio(url);sample.preload='auto';audio.effects[key]=sample;
      try{
        const response=await fetch(url);
        if(response.ok)audio.buffers[key]=await audio.ctx.decodeAudioData(await response.arrayBuffer());
      }catch{}
    }
    const entries=Object.entries(imageFiles); let done=0;
    await Promise.all(entries.map(async([k,src])=>{ const im=await loadImage(src);if(k.startsWith('idle_'))images[k]=preprocessSheet(im,[4,3],true,k.slice(5));else if(k.startsWith('action_'))images[k]=preprocessSheet(im,[4,4],true,k.split('_')[1]);else if(k.startsWith('fighter_')){const def=FIGHTERS.find(f=>'fighter_'+f.id===k);images[k]=preprocessSheet(im,def.grid,false)}else images[k]=im;done++; document.querySelector('#status').textContent=`Loading assets ${done}/${entries.length}`; }));
    screen='title'; document.querySelector('#loading').classList.add('hide'); document.querySelector('#status').textContent='Press Enter or a gamepad button';
  }

  function ensureAudio(resume=true){
    if(!audio.ctx) audio.ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(resume&&audio.ctx.state==='suspended')audio.ctx.resume().catch(()=>{});
  }
  function playMusic(src,loop=true){
    if(audio.current&&audio.current.dataset.src===src){if(audio.current.ended)audio.current.currentTime=0;if(audio.current.paused)audio.current.play().catch(()=>{});return;}
    if(audio.current){audio.current.pause();audio.current=null}
    const a=new Audio(src);a.loop=loop;a.volume=audio.muted?0:.52;a.dataset.src=src;audio.current=a;a.play().catch(()=>{});
  }
  function sfx(type,pitch=1,volume=1){
    if(audio.muted)return;ensureAudio();const rate=Math.max(.72,Math.min(1.35,pitch)),level=Math.min(1,.62*volume),buffer=audio.buffers[type]||audio.buffers.menu;
    if(buffer){const source=audio.ctx.createBufferSource(),gain=audio.ctx.createGain();source.buffer=buffer;source.playbackRate.value=rate;gain.gain.value=level;source.connect(gain).connect(audio.ctx.destination);source.start(audio.ctx.currentTime);return}
    const template=audio.effects[type]||audio.effects.menu;if(!template)return;const sample=template.cloneNode();sample.playbackRate=rate;sample.volume=level;sample.play().catch(()=>{});
  }

  function pollGamepads(){
    const gps=navigator.getGamepads?navigator.getGamepads():[];input.pads=[];
    for(let n=0;n<2;n++){
      const g=gps[n], prev=input.prevPads[n]||{};
      if(!g){input.pads[n]={};continue}
      const b=i=>!!g.buttons[i]?.pressed, axis=i=>g.axes[i]||0;
      const now={left:b(14)||axis(0)<-.4,right:b(15)||axis(0)>.4,up:b(12)||axis(1)<-.55,down:b(13)||axis(1)>.55,light:b(0),heavy:b(2),sp1:b(1),sp2:b(3),block:b(4)||b(5),start:b(9)};
      now.pressed={};for(const k in now)if(k!=='pressed')now.pressed[k]=now[k]&&!prev[k];input.pads[n]=now;input.prevPads[n]=now;
    }
    const connected=[...gps].filter(Boolean).length;gamepadStatus=connected?`${connected} controller${connected>1?'s':''} connected`:'';
  }

  const keyMap1={left:'KeyA',right:'KeyD',up:'KeyW',down:'KeyS',light:'KeyJ',heavy:'KeyK',sp1:'KeyL',sp2:'KeyI',block:'KeyU'};
  const keyMap2={left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown',light:'Numpad1',heavy:'Numpad2',sp1:'Numpad3',sp2:'Numpad5',block:'Numpad0'};
  function controls(player){
    const map=player===0?keyMap1:keyMap2,pad=input.pads[player]||{},touch=player===0?input.touch:new Set();const out={pressed:{}};
    for(const k of ['left','right','up','down','light','heavy','sp1','sp2','block']){out[k]=input.keys.has(map[k])||!!pad[k]||touch.has(k);out.pressed[k]=input.pressed.has(map[k])||!!pad.pressed?.[k]}
    return out;
  }
  function menuPress(k){return input.pressed.has(k)||!!input.pads[0]?.pressed?.[{ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Enter:'light'}[k]||'']}

  addEventListener('keydown',e=>{if(!input.keys.has(e.code))input.pressed.add(e.code);input.keys.add(e.code);if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();ensureAudio()});
  addEventListener('keyup',e=>input.keys.delete(e.code));
  document.querySelectorAll('[data-touch]').forEach(b=>{const k=b.dataset.touch;const on=e=>{e.preventDefault();input.touch.add(k);input.pressed.add(keyMap1[k]||k);ensureAudio()};const off=e=>{e.preventDefault();input.touch.delete(k)};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off)});
  document.querySelector('#muteBtn').onclick=()=>{audio.muted=!audio.muted;if(audio.current)audio.current.volume=audio.muted?0:.52;document.querySelector('#muteBtn').textContent=`Sound: ${audio.muted?'Off':'On'}`};
  document.querySelector('#fullBtn').onclick=()=>{(document.fullscreenElement?document.exitFullscreen():document.querySelector('#cabinet').requestFullscreen()).catch?.(()=>{})};

  function drawCover(img,parallax=0){
    const s=Math.max(W/img.width,H/img.height)*1.045,iw=img.width*s,ih=img.height*s;
    const x=(W-iw)/2+Math.sin(globalTime*.12)*parallax,y=(H-ih)/2+Math.cos(globalTime*.09)*parallax*.25;ctx.drawImage(img,x,y,iw,ih);
  }
  function shade(alpha=.35){ctx.fillStyle=`rgba(4,2,10,${alpha})`;ctx.fillRect(0,0,W,H)}
  function text(str,x,y,size,align='center',color='#fff4d2',stroke='#240512'){
    ctx.save();ctx.font=`900 ${size}px Impact, sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.lineJoin='round';ctx.strokeStyle=stroke;ctx.lineWidth=Math.max(3,size*.08);ctx.strokeText(str,x,y);ctx.fillStyle=color;ctx.fillText(str,x,y);ctx.restore();
  }
  function panel(x,y,w,h,active=false){ctx.fillStyle=active?'rgba(91,18,77,.88)':'rgba(9,8,18,.82)';ctx.fillRect(x,y,w,h);ctx.strokeStyle=active?'#ffc857':'#725026';ctx.lineWidth=active?5:2;ctx.strokeRect(x,y,w,h);if(active){ctx.strokeStyle='#28e1d1';ctx.lineWidth=1;ctx.strokeRect(x+7,y+7,w-14,h-14)}}

  function drawTitle(){
    drawCover(images.title,2);shade(.12);const pulse=.55+.45*Math.sin(globalTime*4);
    panel(W/2-225,540,450,112,true);text('PRESS START',W/2,574,38,'center',`rgba(255,230,130,${.75+.25*pulse})`);text(mode===0?'ARCADE · 1 PLAYER':'VERSUS · 2 PLAYERS',W/2,625,20,'center','#3ce7d5');
    text('▲ / ▼ CHOOSE MODE',W/2,678,15,'center','#ead9e9');
    playMusic(MENU_MUSIC,true);
    if(menuPress('ArrowUp')||menuPress('ArrowDown')||input.pressed.has('KeyW')||input.pressed.has('KeyS')){mode=1-mode;sfx('menu',1.1)}
    if(menuPress('Enter')||input.pressed.has('Space')||input.pressed.has('KeyJ')||input.pads[0]?.pressed?.start){screen='select';selectPhase=0;selectIndex=0;sfx('confirm');document.querySelector('#status').textContent='Choose your fighter'}
  }

  function drawSheet(im,grid,index,x,y,height,face=1,alpha=1,maxWidth=Infinity){
    const [cols,rows]=grid,idx=((index%(cols*rows))+(cols*rows))%(cols*rows),meta=sheetMeta.get(im),fm=meta?.frames[idx];
    const sx=fm?.sx??Math.round((idx%cols)*im.width/cols),sy=fm?.sy??Math.round(((idx/cols)|0)*im.height/rows),cellW=fm?.sw??Math.round(im.width/cols),cellH=fm?.sh??Math.round(im.height/rows),scale=meta?.normalize?Math.min(height/meta.maxH,maxWidth/meta.maxW):height/cellH;
    const anchorX=meta?.normalize?fm.anchorX:cellW/2,bottom=meta?.normalize?fm.bottom:cellH;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.scale(face,1);if(meta?.normalize){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high'}ctx.drawImage(im,sx,sy,cellW,cellH,-anchorX*scale,-bottom*scale,cellW*scale,cellH*scale);ctx.restore();
  }
  function drawSprite(def,index,x,y,height,face=1,alpha=1){drawSheet(images['fighter_'+def.id],def.grid,index,x,y,height,face,alpha)}
  function drawActionClip(f,alpha=1){
    const action=ACTION_ALIASES[f.d.id]?.[f.action]||f.action,clip=ACTION_CLIPS[action]||ACTION_CLIPS.idle,im=images['action_'+f.d.id+'_'+clip.atlas];if(!im)return false;
    let position;
    if(clip.airborne){const normalized=Math.max(0,Math.min(1,(f.vy+f.d.jump)/(f.d.jump+13)));position=normalized*(clip.count-1)}
    else if(clip.loop)position=globalTime*clip.fps;
    else{const duration=f.actionDuration||clip.duration||.4;position=Math.max(0,Math.min(clip.count-1,(duration-f.timer)/duration*(clip.count-1)))}
    const local=Math.floor(position),frame=((local%clip.count)+clip.count)%clip.count,next=clip.loop?(frame+1)%clip.count:Math.min(clip.count-1,frame+1),rawMix=position-Math.floor(position),mix=rawMix*rawMix*(3-2*rawMix);
    drawSheet(im,[4,4],clip.start+frame,f.x,f.y,f.d.size,f.facing,alpha*(1-mix));
    if(next!==frame&&mix>0)drawSheet(im,[4,4],clip.start+next,f.x,f.y,f.d.size,f.facing,alpha*mix);
    return true;
  }
  function drawIdle(def,index,x,y,height,face=1,alpha=1,maxWidth=Infinity,phase=0,fitVisible=false){
    const im=images['idle_'+def.id],meta=sheetMeta.get(im),duration=2.8,total=12;
    const position=((globalTime+phase)%duration)/duration*total,frame=Math.floor(position)%total,next=(frame+1)%total;
    const rawMix=position-Math.floor(position),mix=rawMix*rawMix*(3-2*rawMix);
    idleCtx.setTransform(1,0,0,1,0,0);idleCtx.globalCompositeOperation='source-over';idleCtx.clearRect(0,0,W,H);
    const draw=(frameIndex,opacity,blend=false)=>{
      const fm=meta.frames[frameIndex],scale=fitVisible?Math.min(height/meta.maxH,maxWidth/meta.maxW):Math.min(height/meta.maxH,maxWidth/meta.maxW);
      const anchorX=fm.anchorX;
      idleCtx.save();idleCtx.globalCompositeOperation=blend?'lighter':'source-over';idleCtx.globalAlpha=alpha*opacity;idleCtx.translate(x,y);idleCtx.scale(face,1);idleCtx.imageSmoothingEnabled=true;idleCtx.imageSmoothingQuality='high';
      idleCtx.drawImage(im,fm.sx,fm.sy,fm.sw,fm.sh,-anchorX*scale,-fm.bottom*scale,fm.sw*scale,fm.sh*scale);idleCtx.restore();
    };
    draw(frame,1-mix);draw(next,mix,true);ctx.drawImage(idleCanvas,0,0);
  }
  function drawIdleShadow(def,x,y,height,maxWidth=Infinity,alpha=.34,phase=0,fitVisible=false){
    const meta=sheetMeta.get(images['idle_'+def.id]),scale=Math.min(height/meta.maxH,maxWidth/meta.maxW),visibleW=meta.maxW;
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#050207';ctx.beginPath();ctx.ellipse(x,y+1,Math.min(visibleW*scale*.34,150),Math.max(8,height*.022),0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawPortrait(i,x,y,w,h,active){
    const d=FIGHTERS[i],im=images['portrait_'+d.id],iw=w-10,ih=h-10,scale=Math.max(iw/im.width,ih/im.height),dw=im.width*scale,dh=im.height*scale;
    panel(x,y,w,h,active);ctx.save();ctx.beginPath();ctx.rect(x+5,y+5,iw,ih);ctx.clip();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x+5+(iw-dw)/2,y+5+(ih-dh)/2,dw,dh);
    const wash=ctx.createLinearGradient(x,y,x,y+h);wash.addColorStop(0,'rgba(10,8,24,.03)');wash.addColorStop(1,d.color+'66');ctx.fillStyle=wash;ctx.fillRect(x,y,w,h);ctx.restore();
    ctx.fillStyle='rgba(8,3,14,.84)';ctx.fillRect(x+4,y+h-31,w-8,27);text(d.name,x+w/2,y+h-17,15,'center',active?'#fff1a6':'#e7d8cd','#10050d');
    if(active){ctx.fillStyle='#fff';ctx.fillRect(x+7,y+7,12,12)}
  }
  function statBar(label,value,x,y,color){text(label,x,y,14,'left','#dcc9df');ctx.fillStyle='#1c1020';ctx.fillRect(x,y+14,222,11);ctx.fillStyle=color;ctx.fillRect(x+2,y+16,218*value,7)}
  function drawSelect(){
    playMusic(MENU_MUSIC,true);
    drawCover(images.title,3);shade(.72);ctx.fillStyle='rgba(20,4,24,.78)';ctx.fillRect(0,0,W,82);text('SELECT YOUR FIGHTER',W/2,43,43,'center','#ffd66a');
    const chosen=FIGHTERS[selectIndex],frame=0;
    const selectHeight=SELECT_HEIGHTS[selectIndex];
    panel(20,96,352,590,true);ctx.save();ctx.beginPath();ctx.rect(25,101,342,580);ctx.clip();const aura=ctx.createRadialGradient(194,370,20,194,370,250);aura.addColorStop(0,chosen.color+'77');aura.addColorStop(1,'transparent');ctx.fillStyle=aura;ctx.fillRect(25,101,342,580);drawIdleShadow(chosen,194,607,selectHeight,340,.32,0,true);drawIdle(chosen,frame,194,607,selectHeight,1,1,340,0,true);ctx.restore();
    ctx.fillStyle='rgba(9,3,14,.9)';ctx.fillRect(28,614,336,64);text(chosen.name,196,641,36,'center',chosen.accent);text(selectPhase===0?'PLAYER 1':'PLAYER 2',196,671,15,'center',selectPhase===0?'#32e5d4':'#ff5b87');
    const ox=394,oy=106,pw=130,ph=184,gap=10;
    for(let i=0;i<8;i++)drawPortrait(i,ox+(i%4)*(pw+gap),oy+((i/4)|0)*(ph+gap),pw,ph,i===selectIndex);
    panel(394,494,550,192,false);text('SIGNATURE TECHNIQUES',413,520,17,'left','#ffd66a');text(chosen.s1,413,554,24,'left',chosen.accent);text(chosen.s2,413,588,24,'left',chosen.accent);text('MOVE TO CHOOSE  ·  ATTACK TO CONFIRM',669,656,15,'center','#d9c7dc');
    panel(958,106,302,580,false);text('FIGHTER PROFILE',1109,136,21,'center','#ffd66a');statBar('SPEED',chosen.speed/5.5,986,180,chosen.color);statBar('POWER',chosen.power/1.3,986,235,chosen.accent);statBar('DEFENSE',chosen.defense/1.2,986,290,'#34d8c9');statBar('JUMP',chosen.jump/13.5,986,345,'#ff765c');
    text(chosen.kind==='heavy'?'POWERHOUSE':chosen.kind==='rush'?'RUSH-DOWN':chosen.kind==='staff'?'WEAPON MASTER':chosen.kind==='odd'?'UNORTHODOX':chosen.kind==='stretch'?'LONG RANGE':chosen.kind==='power'?'BRUISER':chosen.kind==='whip'?'MOBILITY':'BALANCED',1109,425,25,'center',chosen.accent);text('HI-RES BREATHING IDLE',1109,474,16,'center','#e2d2e6');text('FEET LOCKED IN PLACE',1109,504,16,'center','#e2d2e6');text('ESC  BACK',1109,654,14,'center','#a995ac');
    const left=menuPress('ArrowLeft')||input.pressed.has(selectPhase?keyMap2.left:keyMap1.left),right=menuPress('ArrowRight')||input.pressed.has(selectPhase?keyMap2.right:keyMap1.right),up=menuPress('ArrowUp')||input.pressed.has(selectPhase?keyMap2.up:keyMap1.up),down=menuPress('ArrowDown')||input.pressed.has(selectPhase?keyMap2.down:keyMap1.down);
    if(left){selectIndex=(selectIndex+7)%8;sfx('menu',.9)}if(right){selectIndex=(selectIndex+1)%8;sfx('menu',1.05)}if(up){selectIndex=(selectIndex+4)%8;sfx('menu',1.1)}if(down){selectIndex=(selectIndex+4)%8;sfx('menu',.95)}
    const confirm=menuPress('Enter')||input.pressed.has(selectPhase?'Numpad1':'KeyJ')||input.pads[selectPhase]?.pressed?.light;
    if(confirm){
      if(selectPhase===0){p1Choice=selectIndex;if(mode===0){p2Choice=(p1Choice+1+((Math.random()*7)|0))%8;stageIndex=homeStageIndex(p1Choice);startMatch()}else{selectPhase=1;selectIndex=p2Choice;sfx('confirm')}}
      else{p2Choice=selectIndex;if(p2Choice===p1Choice)p2Choice=(p2Choice+1)%8;stageIndex=homeStageIndex(p1Choice);startMatch()}
    }
    if(input.pressed.has('Escape'))screen='title';
  }

  function makeFighter(index,player){
    const d=FIGHTERS[index];return {d,index,player,x:player?970:310,y:FLOOR,vx:0,vy:0,hp:100,meter:0,facing:player?-1:1,grounded:true,crouching:false,action:'idle',actionDuration:0,timer:0,cool:0,stun:0,block:false,flash:0,combo:0,rounds:0,trail:[],attackId:0,aiClock:0};
  }
  function homeStageIndex(fighterIndex){const id=FIGHTERS[fighterIndex].id,index=STAGES.findIndex(stage=>stage.fighter===id);return index<0?0:index}
  function roundMusic(){return STAGES[stageIndex].music}
  function startMatch(){
    match={p:[makeFighter(p1Choice,0),makeFighter(p2Choice,1)],projectiles:[],particles:[],timer:75,round:1,state:'intro',stateTime:2.2,shake:0,hitstop:0,winner:null,stage:STAGES[stageIndex]};
    screen='fight';playMusic(roundMusic(1),true);sfx('round');document.querySelector('#status').textContent=match.stage.name;
  }

  function rects(a,b){return a.x<a.w+b.x&&a.x+a.w>b.x&&a.y<a.h+b.y&&a.y+a.h>b.y}
  function hurtbox(f){const wide=(f.d.id==='benita'||f.d.id==='shabuka')?104:82,height=f.crouching?142:232;return{x:f.x-wide/2,y:f.y-height-6,w:wide,h:height}}
  function addParticles(x,y,color,n=12,power=5){for(let i=0;i<n;i++)match.particles.push({x,y,vx:(Math.random()*2-1)*power,vy:(Math.random()*-1)*power-1,life:.25+Math.random()*.35,color,size:3+Math.random()*7})}
  function hit(attacker,defender,damage,kx=5,ky=-2,stun=.22,color='#ffd45a',forceStun=false){
    if(defender.stun>0&&attacker.attackId===defender.lastHit)return false;defender.lastHit=attacker.attackId;
    const blocked=defender.block&&defender.grounded&&Math.sign(attacker.x-defender.x)===defender.facing;
    damage*=attacker.d.power/defender.d.defense;defender.hp=Math.max(0,defender.hp-damage*(blocked?.24:1));defender.vx=kx*Math.sign(defender.x-attacker.x)*(blocked?.35:1);defender.vy=blocked?0:ky;defender.stun=forceStun?1.3:(blocked?.11:stun);defender.action=blocked?'block':'hurt';defender.actionDuration=defender.stun;defender.flash=.12;attacker.meter=Math.min(100,attacker.meter+damage*2);attacker.combo++;
    addParticles(defender.x,defender.y-95,blocked?'#76e5ff':color,blocked?7:15,blocked?3:6);match.shake=Math.max(match.shake,blocked?4:9);match.hitstop=blocked?.035:.07;sfx(blocked?'block':damage>=12?'heavy':'hit',.94+Math.random()*.1);
    if(defender.hp<=0){match.state='ko';match.stateTime=2.5;match.winner=attacker;attacker.rounds++;sfx('ko')}
    return true;
  }

  function melee(f,o,kind){
    const heavy=kind==='heavy',stretch=heavy&&f.d.kind==='stretch',reach=stretch?250:heavy?112:78,damage=heavy?11:6;f.action=kind;f.timer=heavy?.46:.27;f.actionDuration=f.timer;f.cool=f.timer;f.attackId++;sfx('whoosh',heavy?.82:1.14,heavy?.8:.58);
    const hb={x:f.facing>0?f.x+20:f.x-reach-20,y:f.y-(heavy?132:118),w:reach,h:heavy?86:65};
    if(rects(hb,hurtbox(o)))hit(f,o,damage,heavy?8:4,heavy?-5:-2,heavy?.38:.2,f.d.accent);
  }
  function projectile(f,opts={}){match.projectiles.push({owner:f,x:f.x+f.facing*60,y:f.y-(opts.y||105),vx:f.facing*(opts.speed||8),vy:opts.vy||0,w:opts.w||50,h:opts.h||28,life:opts.life||1.7,damage:opts.damage||10,kind:opts.kind||'wave',color:opts.color||f.d.accent,returning:opts.returning||false,stun:opts.stun||false,age:0});sfx('projectile',opts.kind==='bullet'?1.28:1);}
  function special(f,o,n){
    if(f.cool>0||f.stun>0)return;f.attackId++;f.combo=0;f.action=n===1?'special1':'special2';f.timer=.65;f.actionDuration=.65;f.cool=.55;
    const k=f.d.kind;
    if(n===1){
      if(k==='whip'){const hb={x:f.facing>0?f.x+20:f.x-250,y:f.y-135,w:250,h:70};if(rects(hb,hurtbox(o)))hit(f,o,13,7,-3,.3,'#ff5ed0');match.projectiles.push({owner:f,x:f.x,y:f.y-115,vx:0,vy:0,w:250,h:10,life:.22,damage:0,kind:'whip',color:'#ff5ed0',age:0})}
      else if(k==='heavy'){for(let i=0;i<18;i++)match.particles.push({x:f.x+f.facing*45,y:f.y-110,vx:f.facing*(4+Math.random()*8),vy:(Math.random()-.5)*4,life:.5,color:'#f7be52',size:4+Math.random()*5});projectile(f,{kind:'beer',speed:6,w:130,h:70,damage:9,life:.65,color:'#f7be52'})}
      else if(k==='rush'){f.action='roll';f.timer=.75;f.vx=f.facing*13;const hb={x:Math.min(f.x,o.x),y:f.y-100,w:Math.abs(o.x-f.x)+80,h:100};if(Math.abs(o.x-f.x)<260)hit(f,o,14,10,-5,.35,'#4ba6ff')}
      else if(k==='stretch'){projectile(f,{kind:'sound',speed:5,w:105,h:85,damage:5,stun:true,color:'#ff79c8'})}
      else if(k==='power'){projectile(f,{kind:'pom',speed:7,w:62,h:62,damage:13,color:'#bd49ff'})}
      else if(k==='staff'){projectile(f,{kind:'note',speed:5.5,w:70,h:70,damage:5,stun:true,color:'#f7ef7b'})}
      else if(k==='odd'){projectile(f,{kind:'dizzy',speed:4.5,w:90,h:80,damage:4,stun:true,color:'#e675ff'})}
      else projectile(f,{kind:'kiss',speed:7,w:58,h:44,damage:10,color:'#ff557d'});
    }else{
      if(k==='whip')projectile(f,{kind:'wave',speed:7.5,w:90,h:65,damage:12,color:'#e84ef1'});
      else if(k==='heavy')projectile(f,{kind:'bullet',speed:17,w:34,h:10,damage:16,color:'#ffe39a'});
      else if(k==='rush'){f.action='jumpattack';f.timer=.8;f.vy=-14;f.vx=f.facing*9;if(Math.abs(o.x-f.x)<210)setTimeout(()=>{},0)}
      else if(k==='stretch')projectile(f,{kind:'diaper',speed:6.5,vy:-4,w:52,h:45,damage:12,color:'#d8d0a8'});
      else if(k==='power'){f.action='uppercut';f.timer=.72;f.actionDuration=.72;f.vy=-12;f.vx=f.facing*4;if(Math.abs(o.x-f.x)<125)hit(f,o,17,7,-10,.45,'#b54bff')}
      else if(k==='staff')projectile(f,{kind:'mic',speed:8,w:65,h:28,damage:12,returning:true,color:'#e6e4dc'});
      else if(k==='odd')projectile(f,{kind:'sandal',speed:8,w:58,h:30,damage:11,returning:true,color:'#ad6c34'});
      else{f.action='uppercut';f.timer=.7;f.actionDuration=.7;f.vy=-12;f.vx=f.facing*5;if(Math.abs(o.x-f.x)<135)hit(f,o,16,8,-9,.4,'#ff8b42')}
    }
    sfx('special',n===1?1.06:.91,.85);
  }

  function aiControls(f,o,dt){
    f.aiClock-=dt;if(f.aiClock<=0){f.aiClock=.12+Math.random()*.2;const dist=o.x-f.x;f.ai={left:dist<-95,right:dist>95,up:Math.random()<.035,block:o.action.includes('attack')&&Math.random()<.55,light:false,heavy:false,sp1:false,sp2:false,pressed:{}};if(Math.abs(dist)<125){const r=Math.random();f.ai.pressed[r<.45?'light':r<.72?'heavy':r<.87?'sp1':'sp2']=true}else if(Math.random()<.1)f.ai.pressed[Math.random()<.5?'sp1':'sp2']=true}
    return f.ai||{pressed:{}};
  }

  function updateFighter(f,o,c,dt){
    f.cool=Math.max(0,f.cool-dt);f.timer=Math.max(0,f.timer-dt);f.stun=Math.max(0,f.stun-dt);f.flash=Math.max(0,f.flash-dt);f.block=!!c.block&&f.stun<=0;f.crouching=false;
    if(f.stun<=0&&f.cool<=0&&match.state==='fight'){
      if(c.pressed?.light)melee(f,o,'light');else if(c.pressed?.heavy)melee(f,o,'heavy');else if(c.pressed?.sp1)special(f,o,1);else if(c.pressed?.sp2)special(f,o,2);
      else if(c.down&&f.grounded){f.crouching=true;f.vx*=.5;f.action='crouch'}
      else{const dir=(c.right?1:0)-(c.left?1:0);f.vx+=dir*f.d.speed*.34;f.vx=Math.max(-f.d.speed,Math.min(f.d.speed,f.vx));if(dir)f.action='walk';else if(f.grounded)f.action=f.block?'block':'idle';if(c.pressed?.up&&f.grounded){f.vy=-f.d.jump;f.grounded=false;f.action='jump';f.actionDuration=.7;sfx('jump')}}
    }
    if(f.action==='jumpattack'&&Math.abs(o.x-f.x)<105&&Math.abs(o.y-f.y)<145){f.multiTick=(f.multiTick||0)-dt;if(f.multiTick<=0){f.multiTick=.16;f.attackId++;hit(f,o,3.2,2,-2,.13,'#62b7ff')}}
    f.vy+=.62;f.x+=f.vx;f.y+=f.vy;f.vx*=f.grounded?.75:.97;
    if(f.y>=FLOOR){f.y=FLOOR;f.vy=0;f.grounded=true;if(f.action==='jump'||f.action==='jumpattack'||f.action==='uppercut')f.action='idle'}else f.grounded=false;
    f.x=Math.max(62,Math.min(W-62,f.x));if(f.timer<=0&&f.cool<=0&&f.stun<=0&&f.grounded)f.action=f.block?'block':'idle';
    if(f.grounded&&c.down&&f.stun<=0&&f.cool<=0){f.crouching=true;f.action='crouch'}
    f.facing=o.x>=f.x?1:-1;f.trail.unshift({x:f.x,y:f.y,frame:f.animFrame||0});if(f.trail.length>6)f.trail.pop();
  }

  function updateProjectiles(dt){
    for(const p of match.projectiles){p.age+=dt;p.life-=dt;p.x+=p.vx;p.y+=p.vy;p.vy+=(p.kind==='diaper'?.32:0);if(p.returning&&p.age>.48)p.vx+=Math.sign(p.owner.x-p.x)*.65;
      if(p.damage>0){const o=match.p[1-p.owner.player];if(rects({x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h},hurtbox(o))){hit(p.owner,o,p.damage,p.kind==='bullet'?11:6,p.kind==='diaper'?-5:-2,p.stun?1.1:.28,p.color,p.stun);p.life=-1}}
    }
    match.projectiles=match.projectiles.filter(p=>p.life>0&&p.x>-180&&p.x<W+180);
    for(const p of match.particles){p.x+=p.vx;p.y+=p.vy;p.vy+=.24;p.vx*=.97;p.life-=dt}
    match.particles=match.particles.filter(p=>p.life>0);
  }

  function updateMatch(dt){
    if(!match)return;if(match.hitstop>0){match.hitstop-=dt;return}match.stateTime-=dt;
    if(match.state==='intro'&&match.stateTime<=0){match.state='fight';match.stateTime=0;sfx('confirm',.86,.72)}
    if(match.state==='fight'){
      match.timer=Math.max(0,match.timer-dt);const c1=controls(0),c2=mode===0?aiControls(match.p[1],match.p[0],dt):controls(1);updateFighter(match.p[0],match.p[1],c1,dt);updateFighter(match.p[1],match.p[0],c2,dt);updateProjectiles(dt);
      const sep=92-Math.abs(match.p[0].x-match.p[1].x);if(sep>0){const s=Math.sign(match.p[1].x-match.p[0].x)||1;match.p[0].x-=s*sep/2;match.p[1].x+=s*sep/2}
      if(match.timer<=0){const w=match.p[0].hp===match.p[1].hp?match.p[(Math.random()*2)|0]:(match.p[0].hp>match.p[1].hp?match.p[0]:match.p[1]);w.rounds++;match.winner=w;match.state='ko';match.stateTime=2.5;sfx('ko')}
    }else if(match.state==='ko'&&match.stateTime<=0){if(match.winner.rounds>=2){match.state='result';match.stateTime=99;playMusic(CREDITS_MUSIC,false)}else{match.round++;const rounds=match.p.map(p=>p.rounds);match.p=[makeFighter(p1Choice,0),makeFighter(p2Choice,1)];match.p[0].rounds=rounds[0];match.p[1].rounds=rounds[1];match.timer=75;match.state='intro';match.stateTime=1.8;match.projectiles=[];match.particles=[];playMusic(roundMusic(match.round),true);sfx('round')}}
    match.shake*=.84;
    if(match.state==='result'&&(input.pressed.has('Enter')||input.pressed.has('KeyJ')||input.pads[0]?.pressed?.light)){stageIndex=homeStageIndex(p1Choice);startMatch()}
    if(input.pressed.has('Escape')){screen='select';playMusic(MENU_MUSIC,true)}
  }

  function drawHealth(f,x,y,w,flip=false){
    ctx.save();if(flip){ctx.translate(x+w,0);ctx.scale(-1,1);x=0}ctx.fillStyle='#170815';ctx.fillRect(x,y,w,30);ctx.fillStyle=f.hp>30?'#f4c83d':'#f04458';ctx.fillRect(x+4,y+4,(w-8)*f.hp/100,22);ctx.strokeStyle='#fff1bd';ctx.lineWidth=2;ctx.strokeRect(x,y,w,30);ctx.restore();
  }
  function spriteFrame(f){const total=f.d.grid[0]*f.d.grid[1],t=(globalTime*(f.action==='walk'?12:8))|0;if(f.action==='idle')return t%Math.min(4,total);if(f.action==='walk')return (t%4);if(f.action==='jump'||f.action==='uppercut'||f.action==='jumpattack')return Math.min(total-1,4+t%4);if(f.action==='hurt')return Math.min(total-1,9);if(f.action==='block')return Math.min(total-1,1);if(f.action==='roll')return Math.min(total-1,6+t%4);return Math.min(total-1,8+t%4)}
  function drawFighterShadow(f){
    const altitude=Math.max(0,FLOOR-f.y),air=Math.min(1,altitude/330),crouch=f.crouching?1.12:1,radius=f.d.size*.18*crouch*(1-air*.38),depth=Math.max(5,f.d.size*.026*(1-air*.45));
    ctx.save();ctx.globalAlpha=(f.grounded?.34:.25)*(1-air*.35);ctx.fillStyle='#050207';ctx.filter='blur(3px)';ctx.beginPath();ctx.ellipse(f.x,FLOOR+2,radius,depth,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawFighter(f){
    const h=f.d.size;drawFighterShadow(f);
    if(['roll','uppercut','jumpattack'].includes(f.action))for(let i=1;i<f.trail.length;i+=2)drawSprite(f.d,spriteFrame(f),f.trail[i].x,f.trail[i].y,h*.94,f.facing,.11);
    const a=f.flash>0?.48:1;if(ACTION_SETS[f.d.id]&&drawActionClip(f,a))return;
    if(f.action==='idle'||f.action==='block')drawIdle(f.d,0,f.x,f.y,h,f.facing,a,Infinity,f.player*.23);
    else if(f.action==='crouch')drawIdle(f.d,0,f.x,f.y,h*.82,f.facing,a,Infinity,f.player*.23);
    else drawSprite(f.d,spriteFrame(f),f.x,f.y,h*.96,f.facing,a);
  }
  function drawProjectile(p){
    ctx.save();ctx.translate(p.x,p.y);const pulse=1+Math.sin(p.age*24)*.12;ctx.scale(pulse,pulse);
    if(p.kind==='bullet'){ctx.fillStyle='#fff5b5';ctx.fillRect(-18,-3,36,6);ctx.fillStyle='#ff9b35';ctx.fillRect(-30,-1,14,2)}
    else if(p.kind==='whip'){ctx.strokeStyle=p.color;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-125,0);for(let x=-100;x<125;x+=20)ctx.lineTo(x,Math.sin(x*.08+p.age*30)*16);ctx.stroke()}
    else if(p.kind==='diaper'){ctx.fillStyle='#ddd5bd';ctx.rotate(p.age*9);ctx.fillRect(-23,-18,46,36);ctx.fillStyle='#7e684a';ctx.fillRect(-8,-4,16,10)}
    else if(p.kind==='mic'||p.kind==='sandal'){ctx.strokeStyle=p.color;ctx.lineWidth=9;ctx.rotate(p.age*13);ctx.beginPath();ctx.moveTo(-25,0);ctx.lineTo(25,0);ctx.stroke();ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(24,0,10,0,Math.PI*2);ctx.fill()}
    else if(p.kind==='beer'){ctx.fillStyle=p.color;for(let i=0;i<8;i++){ctx.globalAlpha=.45;ctx.beginPath();ctx.arc((Math.random()-.5)*p.w,(Math.random()-.5)*p.h,4+Math.random()*6,0,Math.PI*2);ctx.fill()}}
    else{ctx.shadowColor=p.color;ctx.shadowBlur=22;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(0,0,p.w*.34,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,p.w*(.18+i*.14)+Math.sin(p.age*20+i)*5,0,Math.PI*2);ctx.stroke()}}
    ctx.restore();
  }
  function drawHUD(){
    const [a,b]=match.p;ctx.fillStyle='rgba(13,4,17,.8)';ctx.fillRect(0,0,W,94);drawHealth(a,42,28,455);drawHealth(b,W-497,28,455,true);text(a.d.name,44,76,25,'left',a.d.accent);text(b.d.name,W-44,76,25,'right',b.d.accent);text(String(Math.ceil(match.timer)).padStart(2,'0'),W/2,48,48,'center','#ffe46a');
    for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(520+i*24,72,10,0,Math.PI*2);ctx.fillStyle=(i<a.rounds)?a.d.accent:'#3a2938';ctx.fill();ctx.beginPath();ctx.arc(W-520-i*24,72,10,0,Math.PI*2);ctx.fillStyle=(i<b.rounds)?b.d.accent:'#3a2938';ctx.fill()}
    ctx.fillStyle='#151020';ctx.fillRect(42,90,330,9);ctx.fillStyle=a.d.color;ctx.fillRect(42,90,330*a.meter/100,9);ctx.fillStyle='#151020';ctx.fillRect(W-372,90,330,9);ctx.fillStyle=b.d.color;ctx.fillRect(W-372+330*(1-b.meter/100),90,330*b.meter/100,9);
  }
  function drawFight(){
    ctx.save();ctx.translate((Math.random()-.5)*match.shake,(Math.random()-.5)*match.shake);drawCover(images['stage_'+stageIndex],5);shade(.08);ctx.fillStyle='rgba(0,0,0,.12)';ctx.fillRect(0,FLOOR+5,W,H-FLOOR);
    for(const f of match.p)drawFighter(f);for(const p of match.projectiles)drawProjectile(p);for(const p of match.particles){ctx.globalAlpha=Math.max(0,p.life*2);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}ctx.globalAlpha=1;ctx.restore();drawHUD();
    text(match.stage.name,W/2,118,18,'center',match.stage.tone);
    if(match.state==='intro'){text(`ROUND ${match.round}`,W/2,310,66,'center','#ffe369');if(match.stateTime<.8)text('FIGHT!',W/2,395,90,'center','#ff3e72')}
    if(match.state==='ko'){text('K.O.!',W/2,330,120,'center','#ffcf4b')}
    if(match.state==='result'){shade(.48);text(`${match.winner.d.name} WINS`,W/2,295,76,'center',match.winner.d.accent);text('PRESS START FOR REMATCH',W/2,390,28,'center','#fff3cb');text('ESC — CHARACTER SELECT',W/2,440,17,'center','#35e1d0')}
  }

  function update(dt){globalTime+=dt;menuPulse+=dt;pollGamepads();if(screen==='fight')updateMatch(dt)}
  function draw(){ctx.clearRect(0,0,W,H);if(screen==='loading'){ctx.fillStyle='#09050d';ctx.fillRect(0,0,W,H)}else if(screen==='title')drawTitle();else if(screen==='select')drawSelect();else if(screen==='fight')drawFight();document.querySelector('#status').textContent=gamepadStatus||(screen==='fight'?`${match.stage.name} · ${mode?'Local versus':'Arcade'}`:screen==='select'?'Choose your fighter':'Press Enter or Start')}
  function loop(now){const frame=Math.min(.05,(now-last)/1000);last=now;accumulator+=frame;while(accumulator>=1/60){update(1/60);accumulator-=1/60}draw();input.pressed.clear();requestAnimationFrame(loop)}

  loadAll().catch(err=>{console.error(err);document.querySelector('#loading').innerHTML='<b>ASSET LOAD FAILED</b><small>Refresh to try again.</small>'});
  requestAnimationFrame(loop);
})();
