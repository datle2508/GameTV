/* arcade.js — 2 trò Vui nhộn: IMPL.rain (Mưa chữ: 3 chữ rơi xuống, nghe rồi bấm giỏ dưới chữ đúng trước khi chữ chạm đất), IMPL.memory (Lật thẻ: tìm 6 cặp chữ – hình). Điều khiển bằng nút [data-c] nên dùng được remote. */

/* 🌧️ Mưa chữ: bấm "Bắt đầu" trước (để giọng hướng dẫn đọc xong), mỗi vòng máy đọc chữ cần hứng */
IMPL.rain={
  init(){
    G.list=shuffle(uniqWords(G.P)).slice(0,8);G.step=0;G.rid=0;G.lock=true;
    if(G.list.length<3){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này ít chữ quá. Bé chọn bài khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({});
    $("stageBody").innerHTML=`<div class="qready"><div class="qicon">🌧️</div><p>Chữ sẽ rơi xuống.<br>Nghe kỹ rồi bấm <b>giỏ 🧺</b> dưới chữ đúng!</p><button class="go" data-next data-primary>Bắt đầu!</button></div>`;
    say("Sẵn sàng chưa nào?");
  },
  next(){if(G.rid===0&&!G.over){startClock();ctrl({listen:"Nghe lại"});this.round();focusMain()}},
  round(){
    const w=G.list[G.step],rid=++G.rid,dur=(S.quickSec+2)*1000;G.lock=false;
    G.choices=choicesFor(w,uniqWords(G.P),3);
    $("stageBody").innerHTML=`<span class="cue">Chữ ${G.step+1}/${G.list.length} · Nghe rồi bấm giỏ dưới chữ đúng</span>`+
      `<div class="rain" style="--dur:${dur}ms">${G.choices.map((c,i)=>`<span class="drop" id="drop${i}" style="left:${(16.67+i*33.33).toFixed(2)}%">${esc(c)}</span>`).join("")}</div>`+
      `<div class="choices baskets">${G.choices.map((c,i)=>`<button class="chip basket" data-c="${i}" ${i===1?"data-primary":""} aria-label="Giỏ ${i+1}">🧺</button>`).join("")}</div>`;
    say("Nghe nè!");speakVi(w);
    later(()=>{if(G.rid===rid&&!G.lock)this.miss()},dur+600);
  },
  pick(i,btn){
    if(G.lock||G.over||!G.rid)return;const w=G.list[G.step];
    if(G.choices[i]===w){
      G.lock=true;btn.classList.add("ok");const d=$("drop"+i);if(d)d.classList.add("caught");
      ding();carMove();say(praise(),1);noteWord(w,true);this.done(900);
    }else{G.errors++;oops();noteWord(w,false);btn.classList.add("wrong");btn.disabled=true;say("Chưa đúng, nghe lại nhé!");speakVi(w);
      const f=$("stageBody").querySelector("[data-c]:not([disabled])");if(f)f.focus()}
  },
  miss(){
    const w=G.list[G.step],i=G.choices.indexOf(w),d=$("drop"+i);
    G.lock=true;G.errors++;oops();noteWord(w,false);if(d)d.classList.add("right");
    say("Ối, chữ rơi mất rồi! Chữ đúng là “"+w+"”.");this.done(1800);
  },
  done(ms){
    setProgress((G.step+1)/G.list.length,`${G.step+1}/${G.list.length}`);
    later(()=>{G.step++;if(G.step>=G.list.length)finish();else{this.round();focusMain()}},ms);
  },
  onRead(){},ok(){},
  sample(){return G.rid?G.list[G.step]||"":""}
};

/* 🃏 Lật thẻ: 6 cặp (thẻ chữ + thẻ hình) xáo trộn trên lưới 4×3. Lật nhầm quá 6 lần mới bắt đầu tính lỗi */
IMPL.memory={
  init(){
    const own=uniqWords(G.P).filter(w=>PICS[w]),extra=shuffle(Object.keys(PICS).filter(w=>own.indexOf(w)<0));
    const ws=shuffle(own).slice(0,6);while(ws.length<6&&extra.length)ws.push(extra.pop());
    G.cards=shuffle(ws.map(w=>({w,k:"t"})).concat(ws.map(w=>({w,k:"p"}))));
    G.n=ws.length;G.open=[];G.matched=0;G.miss=0;G.lock=false;
    drawRoadStars(G.n);setProgress(0,`0/${G.n}`);ctrl({});this.render(0);
    say("Lật hai thẻ để tìm cặp chữ và hình nhé!");
  },
  render(focusI){
    $("stageBody").innerHTML=`<span class="cue">Tìm cặp chữ – hình · ${G.matched}/${G.n}</span><div class="mem">${G.cards.map((c,i)=>{
      const show=c.up||c.done,face=c.k==="t"?esc(c.w):PICS[c.w];
      return `<button class="mcard${show?" up":""}${c.done?" done":""}${c.k==="p"&&show?" emo":""}" data-c="${i}" ${c.done?"disabled":""} aria-label="${show?(c.k==="t"?esc(c.w):"hình "+esc(c.w)):"Thẻ "+(i+1)}">${show?face:"?"}</button>`}).join("")}</div>`;
    let b=$("stageBody").querySelector(`[data-c="${focusI}"]:not([disabled])`)||$("stageBody").querySelector("[data-c]:not([disabled])");
    if(b)try{b.focus({preventScroll:true})}catch(e){b.focus()}
  },
  pick(i){
    if(G.lock||G.over)return;const c=G.cards[i];if(c.up||c.done)return;startClock();
    c.up=true;G.open.push(i);
    if(G.open.length<2){tick();this.render(i);return}
    const a=G.cards[G.open[0]],b=G.cards[G.open[1]];
    if(a.w===b.w&&a.k!==b.k){
      a.done=b.done=true;a.up=b.up=false;G.open=[];G.matched++;
      ding();carMove();say(praise(),1);speakVi(a.w);noteWord(a.w,true);
      setProgress(G.matched/G.n,`${G.matched}/${G.n}`);this.render(i);
      if(G.matched>=G.n)later(()=>finish(),600);
    }else{
      G.lock=true;G.miss++;if(G.miss>G.n)G.errors++;this.render(i);say("Chưa phải cặp rồi, nhớ vị trí nhé!");
      later(()=>{a.up=b.up=false;G.open=[];G.lock=false;this.render(i)},1100);
    }
  },
  onRead(){},ok(){},
  sample(){return ""}
};
