/* sound.js — Âm thanh hiệu ứng: actx, tone, vroom, ding, tick, oops, fanfare, confetti, unlockAudio (Safari). */
/* =====================================================================
   ÂM THANH
   ===================================================================== */
let actx=null;
function tone(f,d,type="sine",when=0,vol=.15,f2){if(!S.sfx)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+when;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(actx.destination);o.start(t);o.stop(t+d)}catch(e){}}
const vroom=()=>{tone(90,.5,"sawtooth",0,.08,240);tone(880,.15,"sine",0,.12);tone(1320,.2,"sine",.1,.1)};
const ding=()=>{tone(988,.12,"sine",0,.14);tone(1319,.25,"sine",.09,.12)};
const tick=()=>tone(1200,.06,"sine",0,.06);
const oops=()=>tone(300,.25,"triangle",0,.12,200);
/* Safari chỉ cho phát âm thanh nếu AudioContext được tạo/resume ngay trong cú bấm đầu tiên */
const unlockAudio=()=>{try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==="suspended")actx.resume()}catch(e){}};
["pointerdown","pointerup","mousedown","click","keydown","touchstart","touchend"].forEach(ev=>document.addEventListener(ev,unlockAudio,{capture:true,passive:true}));
const fanfare=()=>[523,659,784,1047].forEach((f,i)=>tone(f,.35,"square",i*.16,.07));
function confetti(){for(let i=0;i<70;i++){const d=document.createElement("div");d.className="conf";d.style.left=Math.random()*100+"vw";d.style.background=CARS[i%CARS.length].c;d.style.animationDuration=2+Math.random()*2+"s";d.style.animationDelay=Math.random()*.6+"s";document.body.appendChild(d);setTimeout(()=>d.remove(),5000)}}
