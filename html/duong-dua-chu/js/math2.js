/* math2.js — 5 trò Toán thêm: IMPL.bond (Tách gộp số), clock (Xem đồng hồ, clockSvg/timeText), pattern (Quy luật), shop (Đi chợ, tiền NOTES), board (Cờ đường số: gieo xúc xắc, ô ⭐ có câu hỏi, 🚀 tiến, 🐌 lùi; đua với Rô-bốt hoặc hai bé khi DUO — MODES.duoSelf).
   Dùng chung mathInit/mathPick/mathSay/numChoices/objs/numVi/opMake… của math.js. */

/* 🍬 Tách gộp số: "5 gồm 2 và mấy?" — hai đĩa, một đĩa đã biết */
IMPL.bond={
  init(){const mx={mam:5,l1:10,l2:20}[KID.lv]||10;mathInit(this,()=>{const n=ri(2,mx),a=ri(1,n-1);return {n,a,b:n-a}})},
  q:it=>`${numVi(it.n)} gồm ${numVi(it.a)} và mấy?`,
  show(first){
    const it=G.list[G.step];G.choices=numChoices(it.b,0,it.n,KID.lv==="mam"?3:4);ctrl({listen:"Nghe câu hỏi"});
    const pic=it.n<=10;
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · ${it.n} gồm ${it.a} và mấy?</span>`+
      `<div class="bond"><div class="bTop">${pic?objs(it.n,"🍬"):""}<b>${it.n}</b></div><div class="bPlates"><div class="plate">${pic?objs(it.a,"🍬"):""}<b>${it.a}</b></div><div class="plate q">${pic?'<span class="qq">?</span>':""}<b>?</b></div></div></div>`+mathChips(G.choices);
    say(`${it.n} gồm ${it.a} và mấy?`);mathSay(first,[this.q(it)]);
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.b,it=>`${numVi(it.n)} gồm ${numVi(it.a)} và ${numVi(it.b)}.`)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?this.q(it):""}
};

/* 🕒 Xem đồng hồ: Mầm giờ đúng · Lớp 1 thêm giờ rưỡi · Lớp 2 thêm 15 phút, kém 15 phút. Xen kẽ đọc đồng hồ ↔ chọn đồng hồ */
function timeText(h,m,spoken){
  const N=spoken?numVi:String;
  if(m===0)return `${N(h)} giờ`;if(m===30)return `${N(h)} giờ rưỡi`;if(m===15)return `${N(h)} giờ ${N(15)} phút`;
  return `${N(h===12?1:h+1)} giờ kém ${N(15)} phút`;
}
function clockSvg(h,m){
  let t="";for(let k=1;k<=12;k++){const a=k*Math.PI/6;t+=`<text x="${(50+38*Math.sin(a)).toFixed(1)}" y="${(50-38*Math.cos(a)+4).toFixed(1)}">${k}</text>`}
  const ha=((h%12)+m/60)*30,ma=m*6;
  return `<svg class="clk" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="47" class="cf"/>${t}`+
    `<line x1="50" y1="50" x2="50" y2="27" class="hh" transform="rotate(${ha} 50 50)"/><line x1="50" y1="50" x2="50" y2="14" class="mh" transform="rotate(${ma} 50 50)"/><circle cx="50" cy="50" r="3.5" class="cc"/></svg>`;
}
IMPL.clock={
  mins(){return KID.lv==="mam"?[0]:KID.lv==="l1"?[0,30]:[0,15,30,45]},
  init(){mathInit(this,i=>({h:ri(1,12),m:rnd(this.mins()),dir:i%2}))},
  opts(it){
    const ms=this.mins(),c=[[it.h,(it.m+(ms.length>1?30:0))%60],[it.h%12+1,it.m],[(it.h+10)%12+1,it.m],[it.h,ms[ri(0,ms.length-1)]],[(it.h+4)%12+1,it.m]];
    const out=[[it.h,it.m]];c.forEach(x=>{if(out.length<(KID.lv==="mam"?3:4)&&!out.some(y=>y[0]===x[0]&&y[1]===x[1]))out.push(x)});
    while(out.length<3){const x=[ri(1,12),rnd(ms)];if(!out.some(y=>y[0]===x[0]&&y[1]===x[1]))out.push(x)}
    return shuffle(out);
  },
  show(first){
    const it=G.list[G.step],o=this.opts(it);G.choices=o.map(x=>x[0]+":"+x[1]);ctrl({listen:"Nghe câu hỏi"});
    if(it.dir===0){
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Đồng hồ chỉ mấy giờ?</span><div class="clkBig">${clockSvg(it.h,it.m)}</div>`+chipsHtml(o.map(x=>esc(timeText(x[0],x[1]))),"clkt");
      say("Đồng hồ chỉ mấy giờ?");mathSay(first,["Đồng hồ chỉ mấy giờ?"]);
    }else{
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Chọn đồng hồ đúng</span><div class="sent">${esc(timeText(it.h,it.m))}</div>`+chipsHtml(o.map(x=>clockSvg(x[0],x[1])),"clkc");
      say(`Đồng hồ nào chỉ ${timeText(it.h,it.m)}?`);mathSay(first,[`Đâu là đồng hồ chỉ ${timeText(it.h,it.m,1)}?`]);
    }
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.h+":"+it.m,it=>timeText(it.h,it.m,1)+".")},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return !it?"":it.dir===0?"Đồng hồ chỉ mấy giờ?":`Đâu là đồng hồ chỉ ${timeText(it.h,it.m,1)}?`}
};

/* 🎨 Quy luật: hình (AB, AAB, ABB, ABC, AABB) và số (Lớp 1: +1, +2 · Lớp 2: +2, +3, +5, +10, −2) */
const PAT_E=["🍎","🍌","🍇","⭐","🌸","🐟","🚗","🎈","🐱","🌙"];
const PAT_T=["AB","AAB","ABB","ABC","AABB"];
IMPL.pattern={
  init(){
    mathInit(this,i=>{
      const num=KID.lv!=="mam"&&i%2===1;
      if(num){const step=KID.lv==="l2"?rnd([2,3,5,10,-2]):rnd([1,2]),len=5,mx=KID.lv==="l2"?100:20;
        let st=step>0?ri(0,Math.max(0,mx-step*len)):ri(-step*len,mx);const arr=[];for(let k=0;k<=len;k++)arr.push(st+k*step);return {num:1,show:arr.slice(0,len),ans:arr[len]}}
      const t=rnd(PAT_T),em=shuffle(PAT_E).slice(0,3),unit=t.split("").map(c=>em[c.charCodeAt(0)-65]);
      const seq=[];while(seq.length<7)seq.push(unit[seq.length%unit.length]);
      return {num:0,show:seq.slice(0,6),ans:seq[6],pool:em};
    });
  },
  show(first){
    const it=G.list[G.step];
    if(it.num){const c=[it.ans+1,it.ans-1,it.ans+(it.show[1]-it.show[0])*2,it.ans+10,it.ans-10].filter((v,k,a)=>v>=0&&v!==it.ans&&a.indexOf(v)===k);G.choices=shuffle([it.ans].concat(shuffle(c).slice(0,2)))}
    else{const extra=rnd(PAT_E.filter(e=>it.pool.indexOf(e)<0));G.choices=shuffle(it.pool.filter((e,k,a)=>a.indexOf(e)===k).concat(it.pool.length<3?[extra]:[]).slice(0,3));if(G.choices.indexOf(it.ans)<0)G.choices[0]=it.ans}
    ctrl({listen:"Nghe câu hỏi"});
    const q=it.num?"Số nào tiếp theo?":"Cái gì tiếp theo?";
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · ${q}</span><div class="seqRow${it.num?"":" emo"}">${it.show.map(v=>`<span>${v}</span>`).join("")}<span class="gap">?</span></div>`+
      (it.num?mathChips(G.choices):chipsHtml(G.choices,"emo"));
    say(q);mathSay(first,[q]);
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.ans,it=>it.num?numVi(it.ans):null)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?(it.num?"Số nào tiếp theo?":"Cái gì tiếp theo?"):""}
};

/* 🛒 Đi chợ: trả tiền vừa đủ (chọn nhóm tờ tiền có tổng đúng); Lớp 1+ có câu "được thối lại mấy nghìn?" */
const billHtml=v=>`<span class="bill b${v}">${v}<small>nghìn</small></span>`;
/* tách số tiền p thành tối đa 3 tờ trong mệnh giá ds (ngẫu nhiên); không được thì null */
function payWith(p,ds){
  for(let t=0;t<40;t++){let left=p;const out=[];while(left>0&&out.length<3){const ok=ds.filter(d=>d<=left);if(!ok.length)break;const d=rnd(ok);out.push(d);left-=d}if(!left)return out.sort((a,b)=>b-a)}
  return null;
}
IMPL.shop={
  init(){
    const ds=NOTES[KID.lv]||NOTES.l1,mx={mam:5,l1:10,l2:100}[KID.lv]||10,mn=KID.lv==="l2"?10:1;
    mathInit(this,i=>{
      const it=rnd(SHOP_ITEMS);
      if(KID.lv!=="mam"&&i%3===2){const give=KID.lv==="l2"?rnd([50,100]):10,p=KID.lv==="l2"?ri(1,give/5-1)*5:ri(1,9);return {k:"chg",it,give,p,ans:give-p}}
      let p,pay,t=0;do{p=KID.lv==="l2"?ri(mn/5,mx/5)*5:ri(mn,mx);pay=payWith(p,ds)}while(!pay&&t++<50);
      if(!pay){p=ds[0]*2;pay=[ds[0],ds[0]]}
      return {k:"pay",it,p,pay};
    },6);
  },
  show(first){
    const q=G.list[G.step],ds=NOTES[KID.lv]||NOTES.l1;ctrl({listen:"Nghe câu hỏi"});
    if(q.k==="pay"){
      const opts=[q.pay],sums=[q.p];
      for(let t=0;opts.length<3&&t<60;t++){const d=rnd([-2,-1,1,2,5,-5,10,-10].map(x=>x*(KID.lv==="l2"?5:1))),s2=q.p+d;if(s2<=0||sums.indexOf(s2)>=0)continue;const pw=payWith(s2,ds);if(pw){opts.push(pw);sums.push(s2)}}
      G.choices=shuffle(sums.map(String));G.payOpts={};opts.forEach((o,k)=>G.payOpts[sums[k]]=o);
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Trả tiền vừa đủ</span><div class="shopItem"><span class="pic sm">${q.it[0]}</span><span class="tag2">${q.p} nghìn</span></div>`+
        chipsHtml(G.choices.map(s2=>`<span class="money">${G.payOpts[s2].map(billHtml).join("")}</span>`),"payc");
      const nm=q.it[1].charAt(0).toUpperCase()+q.it[1].slice(1);say(`${nm} giá ${q.p} nghìn. Trả tiền nào cho vừa đủ?`);
      mathSay(first,[q.it[1]+" giá",numVi(q.p),"nghìn.","Bé trả tiền nào cho vừa đủ?"]);
    }else{
      G.choices=numChoices(q.ans,0,q.give,KID.lv==="mam"?3:4);
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Được thối lại mấy nghìn?</span><div class="shopItem"><span class="money">${billHtml(q.give)}</span><b class="arrow">→</b><span class="pic sm">${q.it[0]}</span><span class="tag2">${q.p} nghìn</span></div>`+mathChips(G.choices);
      say(`Bé đưa ${q.give} nghìn, mua ${q.it[1]} hết ${q.p} nghìn. Được thối lại mấy nghìn?`);
      mathSay(first,["Bé đưa",numVi(q.give),"nghìn.","Mua "+q.it[1]+" hết",numVi(q.p),"nghìn.","Được thối lại mấy nghìn?"]);
    }
  },
  pick(i,btn){mathPick(this,i,btn,q=>q.k==="pay"?String(q.p):q.ans,q=>q.k==="pay"?"Vừa đủ rồi!":["Thối lại",numVi(q.ans),"nghìn."])},
  onRead(){},ok(){},sample(){const q=G.list[G.step];return !q?"":q.k==="pay"?`${q.it[1]} giá ${q.p} nghìn.`:`Bé đưa ${q.give} nghìn, mua ${q.it[1]} hết ${q.p} nghìn. Được thối lại mấy nghìn?`}
};

/* 🎲 Cờ đường số: đường 15/20/30 ô; gieo xúc xắc (Mầm 1–3, còn lại 1–6), đi từng ô; ô ⭐ có câu hỏi (đúng thì tiến thêm 2 ô),
   🚀 tiến 3 ô, 🐌 lùi 2 ô. Một bé thì đua với Rô-bốt 🤖, khi chơi đôi (DUO) thì hai bé thay phiên trên cùng bàn cờ. */
const DIE=["⚀","⚁","⚂","⚃","⚄","⚅"];
IMPL.board={
  init(){
    G.noWeak=true;const n={mam:15,l1:20,l2:30}[KID.lv]||20;G.len=n;G.cells=[];
    for(let k=0;k<n;k++)G.cells.push(k>0&&k<n-1?(k%4===3?"star":""):"");
    const free=()=>{let k,t=0;do{k=ri(2,n-3)}while(G.cells[k]&&t++<30);return k};
    G.cells[free()]="rocket";G.cells[free()]="snail";if(n>=20){G.cells[free()]="rocket";G.cells[free()]="snail"}
    const me={n:KID.name||"Bé",av:KID.av||"🙂",pos:0},two=DUO?{n:DUO.b.name||"Bạn",av:DUO.b.av||"🙂",pos:0}:{n:"Rô-bốt",av:"🤖",pos:0,robot:1};
    G.pl=[me,two];G.t=0;G.phase="roll";G.die=0;G.q=null;
    drawRoadStars(5);setProgress(0,"🎲");ctrl({});this.render();focusMain();
    say(`Lượt của ${me.n}! Bấm gieo xúc xắc nhé.`);
  },
  cur(){return G.pl[G.t]},
  render(){
    const n=G.len,cols=n<=15?5:10,rows=Math.ceil(n/cols);let cells="";
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const k=r*cols+(r%2?cols-1-c:c);if(k>=n){cells+="<span></span>";continue}
      const ty=G.cells[k],tok=G.pl.map((p,pi)=>p.pos===k?`<i class="tok t${pi}">${p.av}</i>`:"").join("");
      cells+=`<span class="cell${ty?" c-"+ty:""}${k===n-1?" end":""}"><small>${k+1}</small>${k===n-1?"🏁":ty==="star"?"⭐":ty==="rocket"?"🚀":ty==="snail"?"🐌":""}${tok}</span>`}
    const p=this.cur(),canRoll=G.phase==="roll"&&!p.robot;
    let ctl=`<div class="bctl"><span class="die">${G.die?DIE[G.die-1]:"🎲"}</span><span class="who">${p.av} Lượt của ${esc(p.n)}</span>`+
      (canRoll?`<button class="go sm" data-next data-primary>🎲 Gieo xúc xắc</button>`:"")+`</div>`;
    if(G.phase==="q"&&G.q)ctl+=`<div class="bq"><div class="big eq">${G.q.html}</div>${G.q.chips}</div>`;
    $("stageBody").innerHTML=`<div class="board" style="grid-template-columns:repeat(${cols},1fr)">${cells}</div>`+ctl;
    setProgress(G.pl[0].pos/(n-1),`${G.pl[0].pos+1}/${n}`);
  },
  next(){if(G.phase==="roll"&&!this.cur().robot&&!G.over)this.roll()},
  roll(){
    startClock();G.phase="move";const mx=KID.lv==="mam"?3:6;G.die=ri(1,mx);tick();this.render();
    speakVi(`Được ${numVi(G.die)} bước.`);say(`${this.cur().n} được ${G.die} bước!`);
    this.walk(G.die,()=>this.land());
  },
  /* đi từng ô (âm "tích" mỗi bước); by < 0 là lùi */
  walk(by,done){
    const p=this.cur(),dir=by>0?1:-1;let left=Math.abs(by);
    const stepIt=()=>{if(G.over)return;if(!left||p.pos+dir<0||p.pos+dir>G.len-1){done();return}p.pos+=dir;left--;tick();this.render();if(p.pos===G.len-1){done();return}later(stepIt,380)};
    later(stepIt,450);
  },
  land(){
    const p=this.cur(),ty=G.cells[p.pos];
    if(p.pos>=G.len-1){this.win(p);return}
    if(ty==="rocket"){vroom();say("Tên lửa! Bay lên 3 ô.");speakVi("Tên lửa! Bay lên 3 ô.");G.cells[p.pos]="";later(()=>this.walk(3,()=>this.land()),900);return}
    if(ty==="snail"){oops();say("Ốc sên! Lùi 2 ô.");speakVi("Ốc sên! Lùi 2 ô.");later(()=>this.walk(-2,()=>this.endTurn()),900);return}
    if(ty==="star"){
      if(p.robot){const ok=Math.random()<.7;say(ok?"Rô-bốt trả lời đúng, tiến 2 ô!":"Rô-bốt trả lời sai rồi.");if(ok){later(()=>this.walk(2,()=>this.land2()),900)}else later(()=>this.endTurn(),1200);return}
      this.ask();return;
    }
    this.endTurn();
  },
  land2(){const p=this.cur();if(p.pos>=G.len-1)this.win(p);else this.endTurn()},
  /* câu hỏi ở ô ⭐: cộng, trừ, so sánh hoặc đếm (theo cấp) */
  ask(){
    G.phase="q";const kind=rnd(KID.lv==="mam"?["add","count","cmp"]:["add","sub","cmp"]),cap=Math.min(mathMax("op"),20);let q;
    if(kind==="count"){const n=ri(1,5),o=rnd(COUNTABLES);q={html:objs(n,o[0]),ans:n,ch:numChoices(n,1,7,3),say:["Có bao nhiêu "+o[1]+"?"],ok:numVi(n)}}
    else if(kind==="cmp"){const a=ri(0,cap),b=ri(0,cap),an=a>b?">":a<b?"<":"=";q={html:`${a} ? ${b}`,ans:an,ch:[">","<","="],say:[numVi(a),"và",numVi(b)],ok:[numVi(a),CMP.find(c=>c[0]===an)[1],numVi(b)]}}
    else{const it=opMake(kind==="add"?"+":"-");if(it.r>cap||it.a>cap){it.a=Math.min(it.a,cap);it.b=Math.min(it.b,kind==="add"?cap-it.a:it.a);it.r=kind==="add"?it.a+it.b:it.a-it.b}
      q={html:`${it.a} ${it.op==="+"?"+":"−"} ${it.b} = ?`,ans:it.r,ch:numChoices(it.r,0,cap,3),say:opSay(it),ok:opDone(it)}}
    G.choices=q.ch;q.chips=chipsHtml(q.ch.map(v=>esc(String(v))),"num");G.q=q;
    this.render();focusMain();say("Ô ngôi sao! Trả lời đúng được tiến thêm 2 ô.");speakVi(["Ô ngôi sao!"].concat(q.say));
  },
  pick(i,btn){
    if(G.phase!=="q"||G.lock||G.over)return;const q=G.q;G.lock=true;
    if(G.choices[i]===q.ans){btn.classList.add("ok");ding();carMove();say(praise()+" Tiến thêm 2 ô!",1);
      speakVi(q.ok).then(()=>{G.lock=false;G.q=null;G.phase="move";this.render();this.walk(2,()=>this.land2())})}
    else{G.errors++;oops();btn.classList.add("wrong");say(`Chưa đúng, đáp án là ${q.ans}.`);
      speakVi(q.ok).then(()=>{G.lock=false;G.q=null;this.endTurn()})}
  },
  endTurn(){
    if(G.over)return;G.t=1-G.t;G.phase="roll";G.die=0;const p=this.cur();this.render();focusMain();
    say(`Lượt của ${p.n}!`);speakVi(`Lượt của ${p.n}.`);
    if(p.robot)later(()=>{if(G.phase==="roll"&&!G.over)this.roll()},1600);
  },
  win(p){
    G.phase="end";G.winner=p;this.render();say(`${p.n} về đích trước!`,1);
    later(()=>finish(),1200);   // màn kết quả đọc "… về đích trước!" (flowFinish)
  },
  onRead(){},ok(){},sample(){return G.q?G.q.say.join(" "):""}
};
