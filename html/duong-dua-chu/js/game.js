/* game.js — Lõi trò chơi: G (trạng thái), say, ctrl, setProgress, drawRoadStars, carMove, startGame, endGame, setRead/bump/heard/readFail/goodRead (khớp lời đọc), finish (chấm sao, mở khoá xe). */
/* =====================================================================
   TRÒ CHƠI — phần chung
   ===================================================================== */
let G={R:[],ri:0,base:0,skip:0,to:[],over:true};
let stale=true,finTimer=0,phraseToks=0;
const later=(fn,ms)=>{const id=setTimeout(fn,ms);G.to.push(id);return id};
const IMPL_=()=>IMPL[G.mode];

function say(t,happy){$("msg").textContent=t;if(happy){const f=$("buddyPlay");f.classList.remove("hop");void f.getBoundingClientRect();f.classList.add("hop")}}
/* nút nào hiện: {mic, ok, listen (true hoặc nhãn chữ)} */
function ctrl(o){
  G.ctrl=o;
  $("listen").hidden=!o.listen;$("listenTxt").textContent=typeof o.listen==="string"?o.listen:"Nghe mẫu";
  $("mic").hidden=!o.mic||mode==="manual";
  $("ok").hidden=!o.ok;
  $("micmode").hidden=!o.mic;
}
function setProgress(p,label){
  p=Math.max(0,Math.min(1,p));
  $("car").style.setProperty("--p",p);
  $("puff").style.left=`calc(3% + (88% - var(--cw)) * ${p} - 10px)`;
  $("score").textContent=label;
  document.querySelectorAll("#roadStars .star").forEach(s=>s.classList.toggle("got",p>=+s.getAttribute("data-at")-1e-6));
}
function drawRoadStars(n){
  const c=Math.max(1,Math.min(n,12));let h="";
  for(let k=0;k<c;k++){const at=(k+1)/c;h+=`<svg class="star" data-at="${at}" style="left:calc(3% + (88% - var(--cw)) * ${at} + var(--cw) * .92)" viewBox="0 0 24 24"><path d="${STAR}"/></svg>`}
  $("roadStars").innerHTML=h;
}
function carMove(){const car=$("car");car.classList.add("moving");clearTimeout(car._t);car._t=setTimeout(()=>car.classList.remove("moving"),950)}
function shakeStage(){const b=$("stageBody").querySelector(".big,.sent");if(b){b.classList.remove("no");void b.getBoundingClientRect();b.classList.add("no")}}
function startClock(){if(!G.t0){G.t0=Date.now();G.clockT=setInterval(()=>{$("clock").textContent=fmt(Date.now()-G.t0)},500)}}
function renderStrip(i){$("words").innerHTML=G.P.words.map((w,k)=>`<span class="w ${k<i?"done":k===i?"cur":""}">${esc(w.c)}</span>`).join("")}
function focusMain(){const p=document.querySelector(".screen.on [data-primary]:not([hidden])");if(p)try{p.focus({preventScroll:true})}catch(e){p.focus()}}

function startGame(lid,mid){
  endGame();
  const L=findLesson(lid);if(!L)return;
  curMode=mid;
  G={mode:mid,lesson:L,P:parse(L.x),R:[],ri:0,base:0,skip:0,to:[],errors:0,fails:0,t0:0,over:false,step:0};
  stale=true;phraseToks=0;
  const M=MODE(mid);
  $("pLesson").textContent=L.icon+" "+L.t;$("pMode").textContent=M.icon+" "+M.name;
  $("heard").textContent="";$("clock").textContent="0:00";$("listen").classList.remove("hint");
  $("strip").hidden=!(mid==="race"||mid==="sentence");
  $("stageBody").style.setProperty("--cc",M.col);   // màu nút lựa chọn theo trò
  $("over").classList.remove("show");
  show("play");
  IMPL[mid].init();
  if(S.voice&&!M.selfSay)speakVi(M.say);   // selfSay: trò tự đọc hướng dẫn kèm từ đầu tiên
  focusMain();
}
function endGame(){
  (G.to||[]).forEach(clearTimeout);G.to=[];
  clearInterval(G.tickT);clearInterval(G.clockT);clearInterval(G.ghostT);clearTimeout(finTimer);
  G.R=[];G.over=true;$("ghost").hidden=true;
  $("over").classList.remove("show");
}

/* --- đọc: dãy từ cần đọc G.R, vị trí G.ri; khớp lần lượt từ G.base (đầu cụm đang nói) --- */
function setRead(words,skipCurrent){G.missed=null;G.R=words.slice();G.ri=0;G.base=0;G.skip=skipCurrent?phraseToks:0}
function bump(by){if(!G.R.length||G.ri>=G.R.length||by<=0)return;startClock();const to=Math.min(G.R.length,G.ri+by);for(let k=G.ri;k<to;k++)noteWord(G.R[k],true);G.ri=to;IMPL_().onRead(by)}
function heard(text,final){
  if(stale||screen!=="play")return;
  const toks=norm(text).split(" ").filter(Boolean);
  const active=!G.over&&G.R.length&&G.ri<G.R.length;
  if(active){
    if(text.trim())$("heard").textContent=`Bé vừa đọc: “${text.trim()}”`;
    const use=toks.slice(G.skip||0);
    let j=G.base;
    for(const tok of use){if(j<G.R.length&&same(tok,G.R[j]))j++}
    if(j>G.ri){const by=j-G.ri;for(let k=G.ri;k<j;k++)noteWord(G.R[k],true);G.ri=j;startClock();IMPL_().onRead(by)}
    else if(final&&j===G.base&&use.length)readFail();
  }
  /* các từ đã nói TRƯỚC khi từ mới hiện ra (Đọc nhanh, Tìm từ) không được tính cho từ mới */
  if(final){phraseToks=0;G.skip=0;G.base=G.ri}else phraseToks=toks.length;
}
function readFail(){
  const I=IMPL_();G.fails++;if(I.countFails!==false)G.errors++;
  noteWord(G.R[G.ri],false);
  oops();shakeStage();
  say(G.fails>=2&&!$("listen").hidden?"Bấm “🔊 Nghe mẫu” rồi đọc theo nhé!":"Gần đúng rồi, đọc lại nào!");
  if(G.fails>=2)$("listen").classList.add("hint");
}
function goodRead(){G.fails=0;$("listen").classList.remove("hint")}

function finish(){
  if(G.over)return;G.over=true;
  G.to.forEach(clearTimeout);G.to=[];clearInterval(G.tickT);clearInterval(G.clockT);clearInterval(G.ghostT);stopListen();
  const ms=G.t0?Date.now()-G.t0:0,stars=G.errors<=1?3:G.errors<=4?2:1;
  const key=G.lesson.id+"|"+G.mode,before=totalStars(),old=+prog[key]||0;
  if(stars>old){prog[key]=stars;store.set("prog",prog)}
  const after=totalStars(),unl=CARS.filter(c=>c.need>before&&c.need<=after);
  setProgress(1,"🏁");carMove();
  $("rstars").innerHTML=[0,1,2].map(i=>`<svg class="${i<stars?"on":""}" style="animation-delay:${(.25+i*.25).toFixed(2)}s" viewBox="0 0 24 24"><path d="${STAR}"/></svg>`).join("");
  $("rtitle").textContent=["","Hoàn thành","Giỏi lắm","Xuất sắc"][stars]+(S.kidName?", "+S.kidName:"")+"!";
  $("rinfo").innerHTML=(ms>=1000?`⏱ ${fmt(ms)}`:"")+(after>before?`<br>⭐ +${after-before} sao`:"")+(stars<3?"<br>Chơi lại để được 3 sao nhé!":"");
  let extra=rewardFinish(stars,ms);if(IMPL_().ghostFinish)extra=extra.concat(IMPL_().ghostFinish(ms));   // sticker, nhiệm vụ, xe bóng ma
  $("runlock").innerHTML=(unl.length?`<div class="unlock">🎉 Mở khoá xe mới! ${unl.map(c=>`<span class="gcar sm" style="color:${c.c}">${CAR_SVG}</span>`).join("")}</div>`:"")+extra.map(x=>`<div class="unlock">${x}</div>`).join("");
  updateTotals();
  finTimer=setTimeout(()=>{$("over").classList.add("show");$("again").focus();fanfare();confetti();if(S.voice)speakVi($("rtitle").textContent)},900);
}
