/* math.js — Môn Toán: 9 trò IMPL.count (Đếm hình), numrec (Tìm số), add/sub (Phép cộng/trừ), mathrace (Tính nhẩm nhanh), compare (So sánh), seq (Số còn thiếu), shape (Hình học), word (Toán đố WORDPROBS).
   Độ khó theo cấp độ KID.lv (mathMax). numVi(n) đọc số bằng chữ; câu nói truyền cho speakVi dạng mảng [số, "cộng", số…] để ghép từ các file thu sẵn. Dùng choiceRight/choiceWrong của letters.js. */

/* phạm vi số theo cấp: đếm/nhận số/so sánh/dãy số (n) và cộng trừ (op) */
const mathMax=k=>({mam:{n:10,op:5,cnt:5},l1:{n:20,op:10,cnt:10},l2:{n:100,op:100,cnt:20}}[KID.lv]||{n:20,op:10,cnt:10})[k];
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const DIGIT=["không","một","hai","ba","bốn","năm","sáu","bảy","tám","chín"];
/* 0–100 bằng chữ: 15 "mười lăm", 21 "hai mươi mốt", 24 "hai mươi tư", 25 "hai mươi lăm" */
function numVi(n){
  if(n<10)return DIGIT[n];if(n===10)return "mười";if(n===100)return "một trăm";
  const t=Math.floor(n/10),u=n%10;
  const head=t===1?"mười":DIGIT[t]+" mươi";
  if(!u)return head;
  const tail=u===5?"lăm":u===1&&t>1?"mốt":u===4&&t>1?"tư":DIGIT[u];
  return head+" "+tail;
}
/* lựa chọn số: đáp án + số gần (±1, ±2, ±10, đảo chữ số) trong khoảng [lo, hi] */
function numChoices(ans,lo,hi,k){
  const c=[ans+1,ans-1,ans+2,ans-2,ans+10,ans-10];if(ans>=10&&ans%11)c.push(+String(ans).split("").reverse().join(""));
  const out=[ans];shuffle(c).forEach(v=>{if(out.length<k&&v>=lo&&v<=hi&&out.indexOf(v)<0)out.push(v)});
  k=Math.min(k,hi-lo+1);   // khoảng số hẹp (vd "2 gồm 1 và mấy?" chỉ có 0–2) thì bớt lựa chọn, kẻo lặp mãi
  for(let t=0;out.length<k&&t<500;t++){const v=ri(lo,hi);if(out.indexOf(v)<0)out.push(v)}
  return shuffle(out);
}
/* hàng đồ vật để đếm (tối đa 20, xếp 5 cái một nhóm); x = số cái cuối bị gạch (phép trừ) */
const objs=(n,e,x)=>{let h="";for(let i=0;i<n;i++)h+=`<span class="${i>=n-(x||0)?"x":""}">${e}</span>${i%5===4&&i<n-1?"<i></i>":""}`;return `<div class="objs">${h}</div>`};
const mathChips=(arr,cls)=>chipsHtml(arr.map(v=>esc(String(v))),"num"+(cls?" "+cls:""));
/* chung: 8 lượt, câu hỏi trong G.list, chọn đáp án G.choices; đọc hướng dẫn kèm câu đầu */
function mathInit(I,make,n){
  G.noWeak=true;G.list=[];for(let i=0;i<(n||8);i++){let q,t=0;do{q=make(i)}while(t++<5&&G.list.length&&JSON.stringify(q)===JSON.stringify(G.list[G.list.length-1]));G.list.push(q)}
  G.step=0;G.hits=0;G.lock=false;drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);I.show(true);
}
function mathSay(first,parts){const M=MODE(G.mode);speakVi((first&&S.voice?[M.say]:[]).concat(parts))}
/* chọn đúng: đọc trọn câu đáp án, ĐỢI đọc xong (ít nhất 1 giây, tối đa 7 giây) rồi mới sang câu sau — không cắt ngang đáp án */
function mathPick(I,i,btn,right,okSay){
  if(G.lock||G.over)return;startClock();const it=G.list[G.step];
  if(G.choices[i]!==right(it)){choiceWrong("",btn,"Chưa đúng, bé thử lại nhé!");return}
  btn.classList.add("ok");G.lock=true;ding();carMove();say(praise(),1);G.hits++;
  setProgress(G.hits/G.list.length,`${G.hits}/${G.list.length}`);
  const myG=G,t0=Date.now();let gone=false;
  const next=()=>{if(gone||G!==myG||G.over)return;gone=true;G.lock=false;G.step++;if(G.step>=G.list.length)finish();else{I.show();focusMain()}};
  (okSay?speakVi(okSay(it)):Promise.resolve()).then(()=>{if(G===myG)later(next,Math.max(350,1000-(Date.now()-t0)))});
  later(next,7000);
}

/* 🍎 Đếm hình */
IMPL.count={
  init(){const mx=mathMax("cnt");mathInit(this,()=>({n:ri(1,mx),o:rnd(COUNTABLES)}))},
  show(first){
    const it=G.list[G.step];G.choices=numChoices(it.n,1,Math.max(it.n+2,mathMax("cnt")),KID.lv==="mam"?3:4);ctrl({listen:"Nghe câu hỏi"});
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Có bao nhiêu ${esc(it.o[1])}?</span>`+objs(it.n,it.o[0])+mathChips(G.choices);
    say(`Có bao nhiêu ${it.o[1]}?`);mathSay(first,["Có bao nhiêu "+it.o[1]+"?"]);
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.n,it=>`Có ${numVi(it.n)} ${it.o[1]}.`)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?"Có bao nhiêu "+it.o[1]+"?":""}
};

/* 🔢 Tìm số: nghe số → chọn chữ số */
IMPL.numrec={
  init(){const mx=mathMax("n");mathInit(this,()=>({n:ri(0,mx)}))},
  show(first){
    const it=G.list[G.step];G.choices=numChoices(it.n,0,mathMax("n"),4);ctrl({listen:"Nghe lại"});
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Nghe rồi chọn số</span><div class="pic sm">👂</div>`+mathChips(G.choices,"big2");
    say("Số nào đây nhỉ?");mathSay(first,["Tìm số "+numVi(it.n)]);
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.n,it=>`Số ${numVi(it.n)}.`)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?"Tìm số "+numVi(it.n):""}
};

/* ➕ ➖ Phép cộng / trừ: số nhỏ (≤ 10) có hình để đếm */
function opMake(op){
  const mx=mathMax("op");
  if(op==="+"){const a=ri(mx>10?2:1,mx-1),b=ri(mx>10?1:0,mx-a);return {a,b,op,r:a+b}}
  const a=ri(mx>10?10:1,mx),b=ri(0,a);return {a,b,op,r:a-b};
}
const opSay=it=>[numVi(it.a),it.op==="+"?"cộng":"trừ",numVi(it.b),"bằng mấy?"];
const opDone=it=>[numVi(it.a),it.op==="+"?"cộng":"trừ",numVi(it.b),"bằng",numVi(it.r)];
const opHtml=it=>(it.a<=10&&it.op==="+"&&it.r<=10?`<div class="opPics">${objs(it.a,"🍎")}<b>+</b>${objs(it.b,"🍎")}</div>`:it.a<=10&&it.op==="-"?objs(it.a,"🍎",it.b):"")+
  `<div class="big eq">${it.a} ${it.op==="+"?"+":"−"} ${it.b} = ?</div>`;
function opImpl(op){return {
  init(){mathInit(this,()=>opMake(op))},
  show(first){
    const it=G.list[G.step];G.choices=numChoices(it.r,0,mathMax("op"),KID.lv==="mam"?3:4);ctrl({listen:"Nghe phép tính"});
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length}</span>`+opHtml(it)+mathChips(G.choices);
    say(op==="+"?"Cộng lại được mấy nhỉ?":"Bớt đi còn mấy nhỉ?");mathSay(first,opSay(it));
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.r,opDone)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?opSay(it).join(" "):""}
}}
IMPL.add=opImpl("+");IMPL.sub=opImpl("-");

/* ⏱️ Tính nhẩm nhanh: 10 phép cộng/trừ, mỗi phép (quickSec + 4) giây; hết giờ tính là sai và hiện đáp án */
IMPL.mathrace={
  init(){
    G.noWeak=true;const mx=Math.min(mathMax("op"),20);
    G.list=[];for(let i=0;i<10;i++){const op=Math.random()<.5?"+":"-";const a=op==="+"?ri(1,mx-1):ri(2,mx),b=op==="+"?ri(0,mx-a):ri(0,a);G.list.push({a,b,op,r:op==="+"?a+b:a-b})}
    G.step=0;G.hits=0;G.lock=true;G.rid=0;drawRoadStars(10);setProgress(0,"0/10");ctrl({});
    $("stageBody").innerHTML=`<div class="qready"><div class="qicon">⏱️</div><p>Có <b>10 phép tính</b>, mỗi phép <b>${S.quickSec+4} giây</b>.<br>Tính thật nhanh nhé!</p><button class="go" data-next data-primary>Bắt đầu!</button></div>`;
    say("Sẵn sàng chưa nào?");
  },
  next(){if(G.rid===0&&!G.over){startClock();ctrl({listen:"Nghe phép tính"});this.show();focusMain()}},
  show(){
    const it=G.list[G.step],rid=++G.rid,dur=(S.quickSec+4)*1000;G.lock=false;G.choices=numChoices(it.r,0,Math.min(mathMax("op"),20),3);
    $("stageBody").innerHTML=`<span class="cue">Phép ${G.step+1}/10</span><div class="big eq">${it.a} ${it.op==="+"?"+":"−"} ${it.b} = ?</div><div class="fuse"><i id="mfuse" style="transition:width ${dur}ms linear"></i></div>`+mathChips(G.choices);
    say("Nhanh nào!");
    setTimeout(()=>{const f=$("mfuse");if(f)f.style.width="0%"},30);
    later(()=>{if(G.rid===rid&&!G.lock){G.lock=true;G.errors++;oops();say(`Hết giờ! ${it.a} ${it.op==="+"?"+":"−"} ${it.b} = ${it.r}`);this.doneAfter(speakVi(opDone(it)),1200)}},dur);
  },
  pick(i,btn){
    if(G.lock||G.over||!G.rid)return;const it=G.list[G.step];
    if(G.choices[i]===it.r){G.lock=true;btn.classList.add("ok");ding();carMove();say(praise(),1);G.hits++;this.doneAfter(speakVi(numVi(it.r)),700)}
    else{G.errors++;oops();btn.classList.add("wrong");btn.disabled=true;say("Chưa đúng, tính lại nào!")}
  },
  done(ms){setProgress((G.step+1)/10,`${G.step+1}/10`);later(()=>{G.step++;if(G.step>=10)finish();else{this.show();focusMain()}},ms)},
  /* đợi đọc xong (tối đa 6 giây, ít nhất ms) rồi sang phép sau */
  doneAfter(p,ms){const myG=G,t0=Date.now();let d=false;const go=()=>{if(d||G!==myG||G.over)return;d=true;this.done(0)};
    p.then(()=>{if(G===myG)later(go,Math.max(0,ms-(Date.now()-t0)))});later(go,6000)},
  onRead(){},ok(){},sample(){const it=G.rid&&G.list[G.step];return it?opSay(it).join(" "):""}
};

/* ⚖️ So sánh: chọn > < = (số ≤ 10 có hình để đếm) */
const CMP=[[">","lớn hơn"],["<","bé hơn"],["=","bằng"]];
IMPL.compare={
  init(){const mx=mathMax("n");mathInit(this,()=>{const a=ri(0,mx),b=Math.random()<.2?a:ri(0,mx);return {a,b}})},
  show(first){
    const it=G.list[G.step];G.choices=[">","<","="];ctrl({listen:"Nghe lại"});
    const pic=n=>it.a<=10&&it.b<=10?objs(n,"⭐"):"";   // chỉ vẽ hình khi cả hai số đều nhỏ
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Chọn dấu đúng</span><div class="cmp"><div>${pic(it.a)}<b>${it.a}</b></div><span class="q">?</span><div>${pic(it.b)}<b>${it.b}</b></div></div>`+
      chipsHtml(CMP.map(c=>`${c[0]}<small>${c[1]}</small>`),"num cmpc");
    say("Số nào lớn hơn nhỉ?");mathSay(first,[numVi(it.a),"và",numVi(it.b)]);
  },
  ans:it=>it.a>it.b?">":it.a<it.b?"<":"=",
  pick(i,btn){const self=this;mathPick(this,i,btn,it=>self.ans(it),it=>[numVi(it.a),CMP.find(c=>c[0]===self.ans(it))[1],numVi(it.b)])},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?[numVi(it.a),"và",numVi(it.b)].join(" "):""}
};

/* 🧮 Số còn thiếu: dãy 5 số, mất một số (Lớp 2+: bước 2, 5, 10; Lớp 1: có dãy đếm ngược) */
IMPL.seq={
  init(){
    const mx=mathMax("n");
    mathInit(this,()=>{
      const step=KID.lv==="l2"?rnd([1,2,5,10]):1,down=KID.lv!=="mam"&&Math.random()<.3,len=5;
      const st=ri(0,Math.max(0,mx-step*(len-1)));let arr=[];for(let k=0;k<len;k++)arr.push(st+k*step);if(down)arr.reverse();
      return {arr,miss:ri(1,len-1),step};
    });
  },
  show(first){
    const it=G.list[G.step],ans=it.arr[it.miss];
    /* 3 lựa chọn, số nhiễu không nằm trong dãy: ±1, ±10, ±bước×5… rồi số ngẫu nhiên */
    const mx=mathMax("n"),ds=[];
    shuffle([ans+1,ans-1,ans+10,ans-10,ans+it.step*5,ans-it.step*5,ans+2,ans-2]).forEach(v=>{if(ds.length<2&&v>=0&&v<=mx&&v!==ans&&it.arr.indexOf(v)<0&&ds.indexOf(v)<0)ds.push(v)});
    for(let t=0;ds.length<2&&t<200;t++){const v=ri(0,mx);if(v!==ans&&it.arr.indexOf(v)<0&&ds.indexOf(v)<0)ds.push(v)}
    G.choices=shuffle([ans].concat(ds));
    ctrl({listen:"Nghe dãy số"});
    $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Số nào còn thiếu?</span><div class="seqRow">${it.arr.map((v,k)=>k===it.miss?'<span class="gap">?</span>':`<span>${v}</span>`).join("")}</div>`+mathChips(G.choices);
    say("Số nào còn thiếu nhỉ?");mathSay(first,["Số nào còn thiếu?"]);
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.arr[it.miss],it=>it.arr.map(numVi))},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?it.arr.map((v,k)=>k===it.miss?"mấy":numVi(v)).join(", "):""}
};

/* 🔷 Hình học: xen kẽ "Đâu là hình …?" (chọn hình) và "Hình này là hình gì?" (đọc tên) */
const SHAPE_COL=["#ff4d4d","#2d8cff","#2fb35a","#ff9f1c","#b05cff","#ff5fa2"];
function shapeSvg(id,col){
  const p={tron:`<circle cx="50" cy="50" r="40"/>`,vuong:`<rect x="12" y="12" width="76" height="76" rx="4"/>`,tamgiac:`<path d="M50 8 L94 88 L6 88Z"/>`,chunhat:`<rect x="4" y="24" width="92" height="52" rx="4"/>`}[id];
  return `<svg class="shp" viewBox="0 0 100 100" aria-hidden="true"><g fill="${col}">${p}</g></svg>`;
}
IMPL.shape={
  init(){mathInit(this,i=>({s:rnd(SHAPES),dir:i%2,col:rnd(SHAPE_COL)}))},
  show(first){
    const it=G.list[G.step];ctrl({listen:"Nghe câu hỏi"});
    const others=shuffle(SHAPES.filter(x=>x!==it.s)).slice(0,KID.lv==="mam"?2:3);G.choices=shuffle([it.s].concat(others));
    if(it.dir===0){
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Đâu là ${it.s[1]}?</span><div class="sent">Đâu là ${esc(it.s[1])}?</div>`+
        chipsHtml(G.choices.map(x=>shapeSvg(x[0],rnd(SHAPE_COL))),"shapec");
      say(`Đâu là ${it.s[1]}?`);mathSay(first,[`Đâu là ${it.s[1]}?`]);
    }else{
      $("stageBody").innerHTML=`<span class="cue">Câu ${G.step+1}/${G.list.length} · Hình này là hình gì?</span><div class="shpBig">${shapeSvg(it.s[0],it.col)}</div>`+chipsHtml(G.choices.map(x=>esc(x[1])));
      say("Hình này là hình gì?");mathSay(first,["Hình này là hình gì?"]);
    }
  },
  pick(i,btn){mathPick(this,i,btn,it=>it.s,it=>`Đây là ${it.s[1]}.`)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return !it?"":it.dir===0?`Đâu là ${it.s[1]}?`:"Hình này là hình gì?"}
};

/* 📝 Toán đố: 5 bài theo cấp độ; Mầm tự đọc đề (bé chưa đọc được), cấp khác bấm "Nghe đề" */
IMPL.word={
  init(){
    const L=WORDPROBS.filter(p=>p[0]===KID.lv);G.noWeak=true;G.list=shuffle(L.length?L:WORDPROBS.filter(p=>p[0]==="l1")).slice(0,5);
    G.step=0;G.hits=0;G.lock=false;drawRoadStars(G.list.length);setProgress(0,`0/${G.list.length}`);this.show(true);
  },
  show(first){
    const it=G.list[G.step],hi=KID.lv==="l2"?100:10;G.choices=numChoices(it[3],0,Math.max(hi,it[3]+2),KID.lv==="mam"?3:4);ctrl({listen:"Nghe đề"});
    $("stageBody").innerHTML=`<span class="cue">Bài ${G.step+1}/${G.list.length} · Đọc rồi chọn đáp số</span><div class="pic sm">${it[1]}</div><div class="sent wp">${esc(it[2])}</div>`+mathChips(G.choices);
    say("Bé đọc kỹ bài toán nhé!");
    if(KID.lv==="mam")mathSay(first,[it[2]]);else if(first&&S.voice)speakVi(MODE("word").say);
  },
  pick(i,btn){mathPick(this,i,btn,it=>it[3],it=>`Đáp số là ${numVi(it[3])}.`)},
  onRead(){},ok(){},sample(){const it=G.list[G.step];return it?it[2]:""}
};
