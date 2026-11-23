/* more.js — 4 trò thêm: IMPL.letter (Chữ cái: nghe âm → chọn chữ), IMPL.blend (Đánh vần: nghe "bờ a ba sắc bá" rồi đọc to), IMPL.topic (Đố vui: câu đố RIDDLES + nhóm từ TOPICS), IMPL.echo (Nghe giọng mình: ghi âm bằng MediaRecorder rồi nghe lại, sau đó nghe giọng mẫu). Dùng choiceRight/choiceWrong/chipsHtml của letters.js. */

/* bỏ dấu thanh nhưng giữ mũ/móc: "ếch" → "êch" */
const noTone=w=>w.normalize("NFD").replace(TONE_RE,"").normalize("NFC");
/* từ có hình bắt đầu bằng chữ cái c (âm đầu đúng là c, không tính "ch", "nh"…) */
function letterWord(c){
  const ws=Object.keys(PICS).filter(w=>{const s=syl(w);if(!s)return false;return VOWELS.indexOf(c)>=0?!s.on&&noTone(s.rh).charAt(0)===c:s.on===c});
  return ws.length?rnd(ws):"";
}
/* đánh vần kiểu lớp 1: "bờ, a, ba, sắc, bá". Vần có âm cuối c/ch/p/t luôn mang dấu nên đánh vần theo vần có dấu sắc:
   "thờ, ích, thích" · "hờ, óc, hóc, nặng, học" */
function spellOut(s){
  const on=s.on?(ONSET_SAY[s.on]||s.on)+", ":"";
  if(/(c|ch|p|t)$/.test(s.rh)&&(s.t===1||s.t===5)){const r=withTone("",s.rh,1),b=withTone(s.on,s.rh,1);return s.t===1?on+r+(s.on?", "+b:""):on+r+(s.on?", "+b:"")+", nặng, "+s.w}
  return (s.on?on+s.rh+", "+s.base:s.rh)+(s.t?", "+TONES[s.t].n+", "+s.w:"");
}

/* 🔠 Chữ cái: 8 lượt; Mầm 3 lựa chọn, lớp lớn 4 lựa chọn, luôn có một chữ dễ nhầm (b/d/đ, m/n…) */
IMPL.letter={
  init(){
    G.noWeak=true;G.list=shuffle(LETTERS).slice(0,8);G.step=0;G.hits=0;G.lock=false;
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({listen:"Nghe lại"});this.show(true);
  },
  show(first){
    const L=G.list[G.step],n=KID.lv==="mam"?3:4;
    const conf=(CONFUSE.find(g=>g.indexOf(L[0])>=0)||[]).filter(c=>c!==L[0]);
    const ds=shuffle(conf).slice(0,1),rest=shuffle(LETTERS.map(x=>x[0]).filter(c=>c!==L[0]&&ds.indexOf(c)<0));
    while(ds.length<n-1)ds.push(rest.pop());
    G.choices=shuffle([L[0]].concat(ds));
    $("stageBody").innerHTML=`<span class="cue">Chữ ${G.step+1}/${G.list.length} · Nghe rồi chọn chữ cái</span>`+chipsHtml(G.choices.map(c=>esc(c.toUpperCase()+" "+c)),"letter");
    say(`Chữ nào là “${L[1]}”?`);
    speakVi((first&&S.voice?MODE("letter").say+" ":"")+"Chữ nào là "+L[1]+"?");
  },
  pick(i,btn){
    if(G.lock||G.over)return;const L=G.list[G.step];startClock();
    if(G.choices[i]===L[0]){
      btn.classList.add("ok");const w=letterWord(L[0]);
      if(w){$("stageBody").insertAdjacentHTML("beforeend",`<div class="lword">${PICS[w]} <b>${esc(w)}</b></div>`);speakVi(L[1]+", "+w)}else speakVi(L[1]);
      choiceRight(L[0],()=>this.show(),1700);
    }else{choiceWrong(L[0],btn,"Chưa đúng, nghe lại nhé!");speakVi(L[1])}
  },
  onRead(){},ok(){},
  sample(){const L=G.list[G.step];return L?"Chữ nào là "+L[1]+"?":""}
};

/* 🔡 Đánh vần: máy đánh vần từng tiếng (ô chữ hiện dần), bé đọc to tiếng đó bằng micro hoặc bố mẹ chấm */
IMPL.blend={
  init(){
    const seen={};G.list=[];
    shuffle(uniqWords(G.P)).forEach(w=>{const s=syl(w);if(s&&!seen[s.w]){seen[s.w]=1;G.list.push(w)}});
    G.list=G.list.slice(0,6);G.step=0;
    if(!G.list.length){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này chưa có tiếng để đánh vần. Bé chọn bài khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show(true);
  },
  show(first){
    const w=G.list[G.step];G.sp=syl(w);setRead([w]);G.fails=0;
    ctrl({mic:1,ok:1,listen:"Nghe đánh vần"});this.render(false);
    say(mode==="manual"?"Nghe đánh vần, rồi bé đọc to tiếng này nhé!":"Nghe đánh vần, rồi bấm 🎤 đọc to nhé!");
    const t=spellOut(G.sp);
    if(first)speakVi((S.voice?MODE("blend").say+" ":"")+t);else later(()=>speakVi(t),300);
  },
  render(done){
    const s=G.sp,pic=picOf(s.w),d=k=>` style="animation-delay:${(k*.7).toFixed(1)}s"`;
    let row=s.on?`<span class="slot on"${d(0)}>${esc(s.on)}</span><b class="plus">+</b><span class="slot on"${d(1)}>${esc(s.rh)}</span><b class="plus">=</b><span class="slot on"${d(2)}>${esc(s.base)}</span>`:`<span class="slot on"${d(0)}>${esc(s.rh)}</span>`;
    if(s.t)row+=`<b class="plus">+</b><span class="slot on"${d(3)}>${TONES[s.t].n}</span>`;
    $("stageBody").innerHTML=`<span class="cue">Tiếng ${G.step+1}/${G.list.length} · Nghe đánh vần rồi đọc to</span>`+(pic?`<div class="pic sm">${pic}</div>`:"")+
      `<div class="slots">${row}</div><div class="big${done?" ok":""}">${esc(s.w)}</div>`;
  },
  onRead(){
    goodRead();G.R=[];ding();vroom();carMove();say(praise(),1);this.render(true);
    setProgress((G.step+1)/G.list.length,`${G.step+1}/${G.list.length}`);
    later(()=>{G.step++;if(G.step>=G.list.length)finish();else{this.show();focusMain()}},1300);
  },
  ok(){bump(1)},
  sample(){return G.sp?spellOut(G.sp):""}
};

/* 🧠 Đố vui: 8 câu, nửa là câu đố (RIDDLES), nửa là "Đâu là con vật?"… (TOPICS); lựa chọn có hình và chữ */
IMPL.topic={
  init(){
    const rid=shuffle(RIDDLES).slice(0,4).map(r=>({q:r[0],w:r[1]}));
    const tq=shuffle(TOPICS).slice(0,4).map(t=>({q:"Đâu là "+t.n+"?",w:rnd(t.w),t}));
    G.list=shuffle(rid.concat(tq));G.step=0;G.hits=0;G.lock=false;
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show();
  },
  show(){
    const it=G.list[G.step];
    const pool=Object.keys(PICS).filter(w=>w!==it.w&&(!it.t||it.t.w.indexOf(w)<0)&&(it.t||!RIDDLES.some(r=>r[0]===it.q&&r[1]===w)));
    G.choices=shuffle([it.w].concat(shuffle(pool).slice(0,2)));
    ctrl({listen:"Nghe câu đố"});
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Đọc câu đố rồi chọn</span><div class="sent">${esc(it.q)}</div>`+
      chipsHtml(G.choices.map(c=>`<span class="pe">${PICS[c]}</span>${esc(c)}`),"pw");
    say("Bé đọc câu đố rồi chọn nhé!");
  },
  pick(i,btn){
    if(G.lock||G.over)return;const it=G.list[G.step];startClock();
    if(G.choices[i]===it.w){btn.classList.add("ok");speakVi(it.w);choiceRight(it.w,()=>this.show(),1200)}
    else choiceWrong(it.w,btn,"Chưa đúng, bé đọc lại câu đố nhé!");
  },
  onRead(){},ok(){},
  sample(){const it=G.list[G.step];return it?it.q:""}
};

/* 🎙️ Nghe giọng mình: mỗi câu bé bấm ghi âm (tối đa 12 giây), máy phát lại giọng bé rồi đọc mẫu để so sánh.
   Máy không ghi âm được (TV cũ, chưa cho phép micro) thì bé đọc to cho bố mẹ nghe và bấm "Câu sau". */
IMPL.echo={
  can(){return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)},
  init(){
    G.list=G.P.sents.filter(s=>s.end-s.start>=2).slice(0,4);G.step=0;
    if(!G.list.length){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này chưa có câu để đọc. Bé chọn bài khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show();
  },
  show(){
    G.clip=null;G.recOn=false;ctrl({listen:"Nghe mẫu"});this.render();
    say(this.can()&&!G.noMic?"Bấm 🎙️ rồi đọc to câu này nhé!":"Bé đọc to câu này cho bố mẹ nghe nhé!");
  },
  render(){
    const s=G.list[G.step],rec=this.can()&&!G.noMic;
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Đọc rồi nghe lại giọng mình</span><div class="sent">${esc(s.text)}</div><div class="choices">`+
      (rec?`<button class="chip rec${G.recOn?" on":""}" data-c="0" ${!G.clip?"data-primary":""}>${G.recOn?"⏹️ Dừng":"🎙️ Ghi âm"}</button>`+
        `<button class="chip" data-c="1" ${G.clip?"":"disabled"}>▶️ Nghe lại</button>`:"")+
      `<button class="chip" data-next ${G.clip||!rec?"data-primary":""}>➡️ Câu sau</button></div>`;
  },
  pick(i){if(G.over)return;if(i===0){if(G.recOn)this.stopRec();else this.startRec()}else if(i===1)this.play(false)},
  startRec(){
    stopAudio();try{speechSynthesis.cancel()}catch(e){}startClock();
    navigator.mediaDevices.getUserMedia({audio:true}).then(st=>{
      if(G.over||G.mode!=="echo"){st.getTracks().forEach(t=>t.stop());return}
      const ch=[],r=new MediaRecorder(st);G.stream=st;G.rec=r;
      r.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
      r.onstop=()=>{st.getTracks().forEach(t=>t.stop());G.stream=null;G.recOn=false;
        if(G.over)return;
        if(ch.length){G.clip=new Blob(ch,{type:r.mimeType||ch[0].type||"audio/webm"});this.render();focusMain();this.play(true)}else this.render()};
      r.start();G.recOn=true;this.render();focusMain();say("Đang ghi âm… bé đọc to nhé!");
      G.recT=later(()=>this.stopRec(),12000);
    },()=>{G.noMic=true;this.render();focusMain();say("Chưa mở được micro. Bé đọc to cho bố mẹ nghe nhé!")});
  },
  stopRec(){if(G.rec&&G.rec.state!=="inactive")G.rec.stop()},
  /* phát qua actx (Safari chặn <audio> sau thao tác bất đồng bộ); không giải mã được thì dùng <audio> */
  play(auto){
    if(!G.clip)return;say(`Đây là giọng của ${kid()} nè!`,1);
    const done=()=>{if(auto&&!G.over&&G.mode==="echo"){say("Giờ nghe giọng mẫu nhé!");later(()=>speakVi(this.sample()),400)}};
    const fb=()=>{try{const a=new Audio(URL.createObjectURL(G.clip));G.audio=a;a.onended=done;const p=a.play();if(p&&p.catch)p.catch(()=>say("Bấm ▶️ để nghe lại giọng bé nhé!"))}catch(e){}};
    try{unlockAudio();new Response(G.clip).arrayBuffer().then(b=>new Promise((ok,no)=>actx.decodeAudioData(b,ok,no))).then(buf=>{
      const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);src.onended=done;G.src=src;src.start(0)}).catch(fb)}catch(e){fb()}
  },
  next(){
    if(G.over)return;
    if(G.recOn){this.stopRec();return}
    if(!G.clip&&this.can()&&!G.noMic){say("Bé bấm 🎙️ ghi âm trước nhé!");return}
    ding();carMove();setProgress((G.step+1)/G.list.length,`${G.step+1}/${G.list.length}`);
    G.step++;if(G.step>=G.list.length)finish();else{this.show();focusMain()}
  },
  stop(){this.stopRec();if(G.stream)G.stream.getTracks().forEach(t=>t.stop());if(G.audio)try{G.audio.pause()}catch(e){}if(G.src)try{G.src.stop()}catch(e){}},
  onRead(){},ok(){},
  sample(){const s=G.list&&G.list[G.step];return s?s.text:""}
};
