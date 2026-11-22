/* meaning.js — 3 trò Hiểu nghĩa: IMPL.truefalse (Đúng hay sai, kho STATEMENTS, không cần chọn bài), IMPL.order (Xếp câu từ câu trong bài đọc), IMPL.story (Truyện tranh STORIES: đọc từng trang bằng micro / nút ✔️ / nút "Trang sau", cuối truyện có câu hỏi). */

/* ✅ Đúng hay sai: 8 câu ngẫu nhiên; chọn sai thì hiện đáp án rồi sang câu sau */
IMPL.truefalse={
  init(){
    G.list=shuffle(STATEMENTS).slice(0,8);G.step=0;G.lock=false;
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show();
  },
  show(){
    const it=G.list[G.step];G.lock=false;G.choices=[1,0];ctrl({listen:"Nghe câu"});
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Câu này đúng hay sai?</span><div class="pic sm">${it.e}</div><div class="sent">${esc(it.s)}</div>`+chipsHtml(["✅ Đúng","❌ Sai"],"tf");
    say("Đọc kỹ rồi chọn nhé!");
  },
  pick(i,btn){
    if(G.lock||G.over)return;const it=G.list[G.step];startClock();G.lock=true;
    if(G.choices[i]===it.ok){btn.classList.add("ok");ding();carMove();say(rnd(PRAISE),1)}
    else{G.errors++;oops();btn.classList.add("wrong");say(it.ok?"Câu này đúng đấy! Bé đọc lại nhé.":"Câu này sai đấy! Bé đọc lại nhé.");speakVi(it.s)}
    setProgress((G.step+1)/G.list.length,`${G.step+1}/${G.list.length}`);
    later(()=>{G.step++;if(G.step>=G.list.length)finish();else{this.show();focusMain()}},G.choices[i]===it.ok?1000:2600);
  },
  onRead(){},ok(){},
  sample(){const it=G.list[G.step];return it?it.s:""}
};

/* 🔀 Xếp câu: các từ của một câu bị xáo trộn, bé chạm lần lượt theo đúng thứ tự */
IMPL.order={
  init(){
    let ss=G.P.sents.filter(s=>s.end-s.start>=3&&s.end-s.start<=7);
    if(!ss.length)ss=G.P.sents.filter(s=>s.end-s.start>=2);
    G.list=ss.slice(0,5);G.step=0;G.lock=false;
    if(!G.list.length){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này chưa có câu để xếp. Bé chọn bài khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({listen:"Nghe câu"});this.show();
  },
  show(){
    const s=G.list[G.step],W=G.P.words.slice(s.start,s.end);G.lock=false;
    G.target=W.map(w=>w.n);G.placed=0;
    let ord=W.map((w,i)=>i),tries=0;
    do{ord=shuffle(ord);tries++}while(tries<6&&ord.every((v,i)=>v===i));   // tránh trùng thứ tự gốc
    G.tiles=ord.map(i=>({n:W[i].n,used:false}));this.render();
    say("Chạm từng từ để xếp thành câu nhé!");
  },
  render(){
    const s=G.list[G.step],W=G.P.words.slice(s.start,s.end);
    let line="";for(let k=0;k<W.length;k++)line+=k<G.placed?`<span class="done">${esc(k===0?W[k].c:W[k].n)}</span>`:`<span class="gap">＿</span>`;
    const first=G.tiles.findIndex(t=>!t.used);
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Xếp thành câu đúng</span><div class="sent">${line}</div>`+
      `<div class="choices">${G.tiles.map((t,i)=>`<button class="chip" data-c="${i}" ${t.used?"disabled":""} ${i===first?"data-primary":""}>${esc(t.n)}</button>`).join("")}</div>`;
  },
  pick(i,btn){
    if(G.lock||G.over)return;const t=G.tiles[i];if(t.used)return;startClock();
    if(t.n===G.target[G.placed]){
      t.used=true;G.placed++;
      if(G.placed<G.target.length){tick();this.render();focusMain();return}
      const s=G.list[G.step];G.lock=true;
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length}</span><div class="sent"><span class="done">${esc(s.text)}</span></div>`;
      ding();carMove();say(rnd(PRAISE),1);speakVi(s.text);
      setProgress((G.step+1)/G.list.length,`${G.step+1}/${G.list.length}`);
      later(()=>{G.step++;if(G.step>=G.list.length)finish();else{this.show();focusMain()}},1800);
    }else{G.errors++;oops();btn.classList.remove("wrong");void btn.offsetWidth;btn.classList.add("wrong");say("Chưa đúng, từ nào đứng tiếp theo nhỉ?");later(()=>btn.classList.remove("wrong"),500)}
  },
  onRead(){},ok(){},
  sample(){const s=G.list&&G.list[G.step];return s?s.text:""}
};

/* 📖 Truyện tranh: mỗi trang đọc bằng micro (tự sang trang), bố mẹ bấm ✔️, hoặc bấm "Trang sau"; cuối truyện trả lời câu hỏi */
IMPL.story={
  init(){
    G.st=G.lesson.story;G.step=0;G.lock=false;
    if(!G.st){ctrl({});say("Không tìm thấy truyện.");return}
    drawRoadStars(G.st.pages.length+1);setProgress(0,`0/${G.st.pages.length}`);this.page();
  },
  page(){
    const W=parse(G.st.pages[G.step][1]).words;G.pw=W;G.phase="read";
    setRead(W.map(w=>w.n),true);ctrl({mic:1,ok:1,listen:"Nghe đọc"});this.render();
    say(mode==="manual"?"Bé đọc to trang này nhé!":"Bấm 🎤 rồi đọc to trang này nhé!");
  },
  render(){
    let h="";G.pw.forEach((w,k)=>{h+=`<span class="${k<G.ri?"done":k===G.ri?"cur":""}">${esc(w.d)}</span>`});
    const last=G.step+1>=G.st.pages.length;
    $("stageBody").innerHTML=`<span class="cue">${esc(G.st.t)} · Trang ${G.step+1}/${G.st.pages.length}</span><div class="pic">${G.st.pages[G.step][0]}</div><div class="sent">${h}</div>`+
      `<button class="go sm" data-next>${last?"Câu hỏi ➡️":"Trang sau ➡️"}</button>`;
  },
  onRead(){
    goodRead();this.render();
    if(G.ri>=G.R.length){ding();carMove();say(rnd(PRAISE),1);G.R=[];later(()=>this.next(),1000)}else tick();
  },
  next(){
    if(G.phase!=="read"||G.over)return;G.R=[];G.step++;carMove();
    setProgress(G.step/(G.st.pages.length+1),`${Math.min(G.step,G.st.pages.length)}/${G.st.pages.length}`);
    if(G.step<G.st.pages.length)this.page();else this.question();focusMain();
  },
  question(){
    G.phase="q";G.lock=false;const q=G.st.q;stopListen();ctrl({listen:"Nghe câu hỏi"});
    $("stageBody").innerHTML=`<span class="cue">Câu hỏi về truyện “${esc(G.st.t)}”</span><div class="pic sm">${G.st.icon}</div><div class="sent">${esc(q[0])}</div>`+chipsHtml(q[1].map(esc));
    say("Bé trả lời câu hỏi nhé!");
  },
  pick(i,btn){
    if(G.phase!=="q"||G.lock||G.over)return;startClock();
    if(i===G.st.q[2]){G.lock=true;btn.classList.add("ok");ding();vroom();say(rnd(PRAISE),1);finish()}
    else{G.errors++;oops();btn.classList.add("wrong");btn.disabled=true;say("Chưa đúng, bé nhớ lại truyện nhé!")}
  },
  ok(){if(G.phase==="read")bump(G.R.length-G.ri)},
  sample(){return !G.st?"":G.phase==="q"?G.st.q[0]:(G.st.pages[G.step]||[])[1]||""}
};
