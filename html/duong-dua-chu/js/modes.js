/* modes.js — IMPL: 5 dạng thử thách race / sentence / quick / balloon / fill — mỗi dạng có init, onRead, ok, sample (+ hàm riêng). */
/* =====================================================================
   TRÒ CHƠI — từng dạng thử thách
   ===================================================================== */
const IMPL={
/* 🏎️ Đua từng từ: đọc liền một mạch cũng được, mỗi từ đúng xe chạy một đoạn */
race:{
  init(){
    setRead(G.P.words.map(w=>w.n));drawRoadStars(G.R.length);setProgress(0,`0/${G.R.length}`);
    ctrl({mic:1,ok:1,listen:1});
    say(mode==="manual"?"Bé đọc to, bố mẹ bấm ✔️ nhé!":"Bấm 🎤 rồi đọc to nhé!");this.render(false);
  },
  render(anim){const W=G.P.words,i=G.ri;$("stageBody").innerHTML=`<span class="cue">Bé đọc to từ này</span><div class="big${anim?" ok":""}">${i<W.length?esc(W[i].c):"Hoan hô!"}</div>`;renderStrip(i)},
  onRead(){goodRead();vroom();carMove();say(rnd(PRAISE),1);this.render(true);setProgress(G.ri/G.R.length,`${G.ri}/${G.R.length}`);if(G.ri>=G.R.length)finish()},
  ok(){bump(1)},
  sample(){const w=G.P.words[G.ri];return w?w.c:""}
},
/* 🚂 Đọc cả câu: hiện cả câu, từ đã đọc chuyển xanh; xe chạy khi xong câu */
sentence:{
  init(){
    setRead(G.P.words.map(w=>w.n));G.doneS=0;drawRoadStars(G.P.sents.length);setProgress(0,`0/${G.P.sents.length}`);
    ctrl({mic:1,ok:1,listen:1});say(mode==="manual"?"Bé đọc cả câu, bố mẹ bấm ✔️ nhé!":"Bấm 🎤 rồi đọc cả câu nhé!");this.render();
  },
  cur(){const s=G.P.sents;for(let k=0;k<s.length;k++)if(G.ri<s[k].end)return k;return s.length-1},
  render(force){
    const k=force==null?this.cur():force,s=G.P.sents[k],W=G.P.words;let h="";
    for(let i=s.start;i<s.end;i++)h+=`<span class="${i<G.ri?"done":i===G.ri?"cur":""}">${esc(W[i].d)}</span>`;
    $("stageBody").innerHTML=`<span class="cue">Câu ${k+1}/${G.P.sents.length} · Bé đọc to cả câu</span><div class="sent">${h}</div>`;renderStrip(G.ri);
  },
  onRead(){
    goodRead();const ss=G.P.sents,n=ss.length,doneS=ss.filter(s=>s.end<=G.ri).length,justDone=doneS>G.doneS;G.doneS=doneS;
    const s=ss[Math.min(doneS,n-1)],part=doneS<n?(G.ri-s.start)/(s.end-s.start):0;
    setProgress((doneS+part)/n,`${doneS}/${n}`);
    if(justDone){vroom();carMove();say(rnd(PRAISE),1);this.render(doneS-1);if(G.ri>=G.R.length){finish();return}later(()=>this.render(),700)}
    else{tick();this.render()}
  },
  ok(){const s=G.P.sents[this.cur()];bump(s.end-G.ri)},
  sample(){return G.P.sents[this.cur()].text}
},
/* ⚡ Đọc nhanh: từng từ hiện ra với dây cháy; hết giờ thì để dành đọc lại ở cuối */
quick:{
  countFails:false,
  init(){
    G.list=shuffle(uniqWords(G.P)).slice(0,10);G.steps=G.list.map(w=>({w,retry:false}));G.hits=0;G.step=0;G.phase="ready";G.saidRetry=0;
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({});
    $("stageBody").innerHTML=`<div class="qready"><div class="qicon">⚡</div><p>Có <b>${G.list.length} từ</b>, mỗi từ <b>${S.quickSec} giây</b>.<br>Đọc thật nhanh nhé!</p><button class="go" id="qgo" data-primary>Bắt đầu!</button></div>`;
    say("Sẵn sàng chưa nào?");
  },
  begin(){
    if(G.phase!=="ready")return;
    startClock();if(mode!=="manual")startListen();
    ctrl({mic:1,ok:1});this.show();G.tickT=setInterval(()=>this.tick(),100);focusMain();
  },
  show(){
    const st=G.steps[G.step];setRead([st.w],true);G.left=S.quickSec*1000;G.last=Date.now();G.phase="go";G.paused=0;
    $("stageBody").innerHTML=`<span class="cue">${st.retry?"Đọc lại từ khó":"Từ "+(G.step+1)+"/"+G.list.length}</span><div class="big">${esc(st.w)}</div><div class="fuse" id="fuse"><i id="fuseBar"></i></div>`;
    if(st.retry&&!G.saidRetry){G.saidRetry=1;say("Mình đọc lại các từ khó nhé!")}
    else say(listening||mode==="manual"?"Đọc nhanh nào!":"Bấm 🎤 để đọc nhé!");
  },
  tick(){
    const now=Date.now(),dt=now-G.last;G.last=now;if(G.phase!=="go")return;
    if(!(listening||mode==="manual")){if(!G.paused){G.paused=1;say("Đồng hồ đang dừng. Bấm 🎤 để đọc tiếp nhé!")}return}
    if(G.paused){G.paused=0;say("Đọc nhanh nào!")}
    G.left-=dt;const r=Math.max(0,G.left/(S.quickSec*1000)),bar=$("fuseBar");
    if(bar){bar.style.width=(r*100).toFixed(1)+"%";$("fuse").className="fuse"+(r<.25?" hot":r<.5?" warn":"")}
    if(G.left<=0)this.miss();
  },
  onRead(){
    if(G.phase!=="go")return;G.phase="hit";G.R=[];G.hits++;goodRead();ding();carMove();say(rnd(PRAISE),1);
    const b=$("stageBody").querySelector(".big");if(b)b.classList.add("ok");
    setProgress(G.hits/G.list.length,`${G.hits}/${G.list.length}`);later(()=>this.next(),700);
  },
  miss(){
    G.phase="miss";G.R=[];G.errors++;oops();
    const st=G.steps[G.step];if(!st.retry)G.steps.push({w:st.w,retry:true});
    const b=$("stageBody").querySelector(".big");if(b)b.classList.add("miss");
    say(st.retry?"Không sao, lần sau mình đọc được!":"Hết giờ rồi! Lát nữa đọc lại nhé.");later(()=>this.next(),1100);
  },
  next(){G.step++;if(G.step>=G.steps.length){finish();return}this.show()},
  ok(){if(G.phase==="go")bump(1)},
  sample(){return ""}
},
/* 🎈 Bắt bóng chữ: máy đọc một từ, bé chạm đúng quả bóng (không cần micro) */
balloon:{
  init(){
    G.list=shuffle(uniqWords(G.P)).slice(0,8);G.step=0;G.hits=0;gPrefetch(G.list);
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({listen:"Nghe lại"});this.show(true);
  },
  show(first){
    G.lock=false;const w=G.list[G.step];G.choices=choicesFor(w,uniqWords(G.P),3);const cols=shuffle(BALLOON);
    $("stageBody").innerHTML=`<span class="cue">Từ ${G.step+1}/${G.list.length} · Chạm vào quả bóng có từ bé nghe được</span><div class="balloons">${G.choices.map((c,i)=>`<button class="balloon" data-b="${i}" ${i===0?"data-primary":""} style="--bc:${cols[i%cols.length]};--d:${(-i*.7).toFixed(1)}s">${esc(c)}</button>`).join("")}</div>`;
    say(first?"Nghe kỹ rồi chạm vào quả bóng nhé!":"Từ tiếp theo nè!");
    if(first)speakVi((S.voice?MODE("balloon").say+" ":"")+w);   // lần đầu: nói ngay trong cú bấm (Safari cần vậy)
    else later(()=>speakVi(w),450);
  },
  tap(i,btn){
    if(G.lock||G.over)return;const w=G.list[G.step];startClock();
    if(G.choices[i]===w){
      G.lock=true;btn.classList.add("pop");ding();G.hits++;carMove();say(rnd(PRAISE),1);
      setProgress(G.hits/G.list.length,`${G.hits}/${G.list.length}`);
      later(()=>{G.step++;if(G.step>=G.list.length)finish();else{this.show();focusMain()}},850);
    }else{G.errors++;oops();btn.classList.add("wrong");btn.disabled=true;say("Chưa đúng rồi, nghe lại nhé!");later(()=>speakVi(w),450)}
  },
  onRead(){},ok(){},
  sample(){return G.list[G.step]||""}
},
/* 🧩 Tìm từ còn thiếu: chọn từ đúng điền vào chỗ trống, rồi đọc cả câu */
fill:{
  init(){
    const W=G.P.words;let ss=G.P.sents.filter(s=>s.end-s.start>=3);if(!ss.length)ss=G.P.sents.filter(s=>s.end-s.start>=2);
    G.list=ss.slice(0,6).map(s=>{let best=[],bl=0;for(let i=s.start+1;i<s.end;i++){const L=W[i].n.length;if(L>bl){bl=L;best=[i]}else if(L===bl)best.push(i)}return {s,b:rnd(best)}});
    G.step=0;
    if(!G.list.length){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này ngắn quá cho trò này. Bé chọn trò khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show();
  },
  show(){
    G.phase="pick";G.R=[];G.filledAnim=0;const it=G.list[G.step];
    G.choices=choicesFor(G.P.words[it.b].n,uniqWords(G.P),3);
    ctrl({mic:listening?1:0});
    this.renderSent();
    $("stageBody").insertAdjacentHTML("beforeend",`<div class="choices">${G.choices.map((c,i)=>`<button class="chip" data-c="${i}" ${i===0?"data-primary":""}>${esc(c)}</button>`).join("")}</div>`);
    say("Từ nào còn thiếu nhỉ?");
  },
  renderSent(){
    const it=G.list[G.step],W=G.P.words,s=it.s;let h="";
    for(let i=s.start;i<s.end;i++){
      if(i===it.b&&G.phase==="pick"){h+='<span class="blank">?</span>';continue}
      const k=i-s.start,cls=G.phase==="pick"?"":k<G.ri?"done":k===G.ri?"cur":"";
      h+=`<span class="${cls}${i===it.b?" filled"+(G.filledAnim?" pop":""):""}">${esc(W[i].d)}</span>`;
    }
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length}</span><div class="sent">${h}</div>`;
  },
  pick(i,btn){
    if(G.phase!=="pick"||G.over)return;const it=G.list[G.step],w=G.P.words[it.b].n;startClock();
    if(G.choices[i]===w){
      ding();G.phase="read";G.filledAnim=1;const s=it.s;
      setRead(G.P.words.slice(s.start,s.end).map(x=>x.n),true);
      this.renderSent();G.filledAnim=0;ctrl({mic:1,ok:1,listen:1});
      say(mode==="manual"?"Đúng rồi! Bé đọc cả câu, bố mẹ bấm ✔️ nhé":"Đúng rồi! Giờ bấm 🎤 đọc cả câu nhé",1);focusMain();
    }else{G.errors++;oops();btn.classList.add("wrong");btn.disabled=true;say("Chưa đúng, thử từ khác nhé!")}
  },
  onRead(){
    goodRead();
    if(G.ri>=G.R.length){
      G.phase="done";this.renderSent();G.R=[];vroom();carMove();say(rnd(PRAISE),1);
      const n=G.list.length;setProgress((G.step+1)/n,`${G.step+1}/${n}`);
      later(()=>{G.step++;if(G.step>=n)finish();else{this.show();focusMain()}},1000);
    }else{tick();this.renderSent()}
  },
  ok(){if(G.phase==="read")bump(G.R.length-G.ri)},
  sample(){const it=G.list&&G.list[G.step];return it&&G.phase!=="pick"?it.s.text:""}
}
};
