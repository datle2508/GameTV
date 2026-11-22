/* letters.js — 3 trò "Học chữ" (thêm vào IMPL của modes.js): IMPL.picture (Nối chữ với hình), IMPL.spell (Ghép vần: âm đầu + vần + dấu), IMPL.tone (Dấu nào đây?). Không cần micro; bấm lựa chọn [data-c] → IMPL.<trò>.pick(i,btn). Ghi từ khó qua noteWord. */

/* phần chung: chọn đúng / chọn sai */
function choiceRight(w,next,delay){
  G.lock=true;ding();carMove();say(rnd(PRAISE),1);noteWord(w,true);G.hits++;
  setProgress(G.hits/G.list.length,`${G.hits}/${G.list.length}`);
  later(()=>{G.lock=false;G.missed=null;G.step++;if(G.step>=G.list.length)finish();else{next();focusMain()}},delay||1000);
}
function choiceWrong(w,btn,msg){
  G.errors++;oops();noteWord(w,false);
  btn.classList.add("wrong");btn.disabled=true;say(msg);
  const f=$("stageBody").querySelector("[data-c]:not([disabled])");if(f)f.focus();
}
const chipsHtml=(items,cls)=>`<div class="choices">${items.map((h,i)=>`<button class="chip${cls?" "+cls:""}" data-c="${i}" ${i===0?"data-primary":""}>${h}</button>`).join("")}</div>`;

/* 🖼️ Nối chữ với hình: xen kẽ "nhìn hình → chọn chữ" và "đọc chữ → chọn hình". Bài ít từ có hình thì lấy thêm từ kho PICS */
IMPL.picture={
  init(){
    const own=uniqWords(G.P).filter(w=>PICS[w]);
    const extra=shuffle(Object.keys(PICS).filter(w=>own.indexOf(w)<0));
    G.list=shuffle(own).slice(0,8);while(G.list.length<6&&extra.length)G.list.push(extra.pop());
    G.list=shuffle(G.list);G.step=0;G.hits=0;G.lock=false;
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show();
  },
  show(){
    const w=G.list[G.step];G.wrong=0;G.dir=G.step%2;   // 0: hình → chữ · 1: chữ → hình
    ctrl({});
    if(G.dir===0){
      G.choices=choicesFor(w,Object.keys(PICS),3);
      $("stageBody").innerHTML=`<span class="cue">Từ ${G.step+1}/${G.list.length} · Hình này là chữ nào?</span><div class="pic">${PICS[w]}</div>`+chipsHtml(G.choices.map(esc));
      say("Nhìn hình rồi chọn chữ đúng nhé!");
    }else{
      const others=shuffle(Object.keys(PICS).filter(x=>x!==w)).slice(0,2);
      G.choices=shuffle([w].concat(others));
      $("stageBody").innerHTML=`<span class="cue">Từ ${G.step+1}/${G.list.length} · Chữ này là hình nào?</span><div class="big">${esc(w)}</div>`+chipsHtml(G.choices.map(c=>PICS[c]),"emo");
      say("Đọc chữ rồi chọn hình đúng nhé!");
    }
  },
  pick(i,btn){
    if(G.lock||G.over)return;const w=G.list[G.step];startClock();
    if(G.choices[i]===w){btn.classList.add("ok");speakVi(w);choiceRight(w,()=>this.show(),1100)}
    else{G.wrong++;choiceWrong(w,btn,G.dir===0?"Chưa đúng, bé đọc lại các chữ nhé!":"Chưa đúng, bé đọc lại chữ nhé!");
      if(G.wrong>=1)ctrl({listen:"Nghe gợi ý"})}   // sai rồi mới cho nghe, để bé tự đọc trước
  },
  onRead(){},ok(){},
  sample(){return G.list[G.step]||""}
};

/* 🧱 Ghép vần: nghe một tiếng → chọn âm đầu → vần → dấu (tiếng không có âm đầu thì bỏ bước đầu) */
IMPL.spell={
  init(){
    const seen={};G.list=[];
    shuffle(uniqWords(G.P)).forEach(w=>{const s=syl(w);if(s&&!seen[s.w]){seen[s.w]=1;G.list.push(w)}});
    G.list=G.list.slice(0,6);G.step=0;G.hits=0;G.lock=false;
    if(!G.list.length){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này chưa có chữ để ghép. Bé chọn bài khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({listen:"Nghe lại"});this.show(true);
  },
  show(first){
    const w=G.list[G.step];G.sp=syl(w);G.ph=G.sp.on?0:1;this.render();
    if(first)speakVi((S.voice?MODE("spell").say+" ":"")+w);else later(()=>speakVi(w),350);
  },
  render(){
    const s=G.sp,ph=G.ph,slot=(txt,on,cur)=>`<span class="slot${on?" on":""}${cur?" cur":""}">${esc(txt)}</span>`;
    const res=ph>=3?s.w:ph>=2?s.base:ph>=1?s.on:"";
    const pic=picOf(s.w);
    let h=`<span class="cue">Tiếng ${G.step+1}/${G.list.length} · Nghe rồi ghép thành chữ</span>`+(pic?`<div class="pic sm">${pic}</div>`:"");
    h+=`<div class="slots">${slot(s.on?(ph>=1?s.on:"?"):"–",ph>=1&&!!s.on,ph===0)}<b class="plus">+</b>${slot(ph>=2?s.rh:"?",ph>=2,ph===1)}<b class="plus">+</b>${slot(ph>=3?TONES[s.t].n:"dấu",ph>=3,ph===2)}<b class="plus">=</b><span class="slot res">${esc(res||"…")}</span></div>`;
    if(ph===0){G.choices=onsetChoices(s.on);h+=`<span class="cue">Âm đầu là gì?</span>`+chipsHtml(G.choices.map(esc));say("Âm đầu là gì nhỉ?")}
    else if(ph===1){G.choices=rhymeChoices(s.rh,uniqWords(G.P));h+=`<span class="cue">Vần là gì?</span>`+chipsHtml(G.choices.map(esc));say(s.on?"Giờ chọn vần nhé!":"Tiếng này không có âm đầu. Chọn vần nhé!")}
    else if(ph===2){
      const ts=shuffle([0,1,2,3,4,5].filter(t=>t!==s.t)).slice(0,2).concat(s.t);
      G.choices=shuffle(ts);
      h+=`<span class="cue">Dấu nào đây?</span>`+chipsHtml(G.choices.map(t=>`${esc(t===s.t?s.w:withTone(s.on,s.rh,t))}<small>${TONES[t].n}</small>`),"tone");
      say("Cuối cùng, chọn dấu nhé!");
    }
    $("stageBody").innerHTML=h;
  },
  pick(i,btn){
    if(G.lock||G.over)return;const s=G.sp,c=G.choices[i];startClock();
    const right=G.ph===0?c===s.on:G.ph===1?c===s.rh:c===s.t;
    if(!right){choiceWrong(s.w,btn,"Chưa đúng, nghe lại nhé!");later(()=>speakVi(s.w),400);return}
    G.ph++;
    if(G.ph<3){tick();this.render();focusMain();return}
    this.render();speakVi(s.w);choiceRight(s.w,()=>this.show(),1400);
  },
  onRead(){},ok(){},
  sample(){return G.sp?G.sp.w:""}
};

/* 🎵 Dấu nào đây?: hiện tiếng bỏ dấu ("ca ?"), máy đọc, bé chọn 1 trong 4 chữ khác dấu */
IMPL.tone={
  init(){
    const seen={};G.list=[];
    shuffle(uniqWords(G.P)).forEach(w=>{const s=syl(w);if(s&&!seen[s.base]){seen[s.base]=1;G.list.push(w)}});
    G.list=G.list.slice(0,8);G.step=0;G.hits=0;G.lock=false;
    if(!G.list.length){ctrl({});$("stageBody").innerHTML='<div class="big">😅</div>';say("Bài này chưa có chữ để luyện dấu. Bé chọn bài khác nhé!");return}
    drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);ctrl({listen:"Nghe lại"});this.show(true);
  },
  show(first){
    const w=G.list[G.step],s=G.sp=syl(w),pic=picOf(w);
    const ts=shuffle([0,1,2,3,4,5].filter(t=>t!==s.t)).slice(0,3).concat(s.t);
    G.choices=shuffle(ts);
    $("stageBody").innerHTML=`<span class="cue">Tiếng ${G.step+1}/${G.list.length} · Nghe rồi chọn chữ có dấu đúng</span>`+(pic?`<div class="pic sm">${pic}</div>`:"")+
      `<div class="big">${esc(s.base)}<span class="qm"> ?</span></div>`+chipsHtml(G.choices.map(t=>`${esc(t===s.t?w:withTone(s.on,s.rh,t))}<small>${TONES[t].n}</small>`),"tone");
    say(first?"Nghe kỹ nhé!":"Tiếng tiếp theo nè!");
    if(first)speakVi((S.voice?MODE("tone").say+" ":"")+w);else later(()=>speakVi(w),350);
  },
  pick(i,btn){
    if(G.lock||G.over)return;const s=G.sp;startClock();
    if(G.choices[i]===s.t){
      btn.classList.add("ok");const b=$("stageBody").querySelector(".big");if(b){b.textContent=s.w;b.classList.add("ok")}
      choiceRight(s.w,()=>this.show(),1100);
    }else{choiceWrong(s.w,btn,"Chưa đúng, nghe lại nhé!");later(()=>speakVi(s.w),400)}
  },
  onRead(){},ok(){},
  sample(){return G.sp?G.sp.w:""}
};
