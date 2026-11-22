/* screens.js — Màn hình: screen/curMode, show, back, renderHome, openPick, renderPick; Soạn bài: openEditor, renderIcons, edPreview, edSave, edDelete; Gara: applyCar, renderGarage; Bố mẹ: SETS, renderSettings, renderVoices, VOICE_TEST, openGate. */
/* =====================================================================
   ĐIỀU HƯỚNG MÀN HÌNH
   ===================================================================== */
let screen="home",curMode="race";
function show(id){
  if(screen==="play"&&id!=="play")endGame();
  stopListen();
  screen=id;
  document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("on",s.id===id));
  $("homeBtn").style.visibility=id==="home"?"hidden":"visible";
  window.scrollTo(0,0);
  if(id==="home")renderHome();
}
function back(){
  if($("gate").classList.contains("show")){$("gate").classList.remove("show");return}
  if($("over").classList.contains("show")){openPick(G.mode,true);return}
  if(screen==="play")openPick(G.mode,true);
  else if(screen==="editor")openPick(curMode,true);
  else if(screen!=="home")show("home");
}
function updateTotals(){$("totalStars").textContent=totalStars()}

function renderHome(){
  updateTotals();
  const n=lessons().length*3;
  $("modes").innerHTML=MODES.map((m,i)=>`<button class="modeCard" data-m="${m.id}" style="--mc:${m.col}" ${i===0?"data-primary":""}><span class="mi">${m.icon}</span><b>${m.name}</b><small>${m.desc}</small><span class="mstars">⭐ ${modeStars(m.id)}/${n}</span></button>`).join("");
}
function openPick(m,silent){
  curMode=m;const M=MODE(m);
  $("pickIcon").textContent=M.icon;$("pickTitle").textContent=M.name;$("pickTitle").style.color=M.col;$("pickDesc").textContent=M.desc;
  renderPick();show("pick");
  if(!silent&&S.voice)speakVi(M.say+" Bé chọn một bài nhé.");
}
function renderPick(){
  $("lessonGrid").innerHTML=lessons().map((l,i)=>{
    const st=prog[l.id+"|"+curMode]||0,mine=l.id.charAt(0)==="u";
    return `<div class="lcWrap"><button class="lessonCard" data-l="${esc(l.id)}" ${i===0?"data-primary":""}><span class="num">${i+1}</span><span class="li">${esc(l.icon)}</span><b>${esc(l.t)}</b>${starRow(st)}${mine?'<span class="mine">Bài tự tạo</span>':""}</button>${mine?`<button class="editBtn" data-e="${esc(l.id)}" aria-label="Sửa bài ${esc(l.t)}">✏️</button>`:""}</div>`;
  }).join("")+`<button class="lessonCard add" id="addLesson"><span class="li">➕</span><b>Tạo bài mới</b></button>`;
}

/* =====================================================================
   SOẠN BÀI
   ===================================================================== */
let edId=null,edIcon="📖";
function openEditor(id){
  edId=id||null;const L=id?findLesson(id):null;
  $("edHead").textContent=L?"Sửa bài":"Tạo bài mới";
  $("edName").value=L?L.t:"";$("edText").value=L?L.x:"";edIcon=L?L.icon:"📖";
  $("edDel").hidden=!L;renderIcons();edPreview();show("editor");
  setTimeout(()=>$("edName").focus(),50);
}
function renderIcons(){$("edIcons").innerHTML=ICONS.map(ic=>`<button class="icb" data-ic="${ic}" aria-pressed="${ic===edIcon}" aria-label="Chọn hình ${ic}">${ic}</button>`).join("")}
function edPreview(){
  const P=parse($("edText").value),n=P.words.length,warn=[];
  if(!n)warn.push("Hãy viết vài câu ngắn cho bé đọc nhé.");
  else if(n<3)warn.push("Bài cần ít nhất 3 từ.");
  if(n>60)warn.push("Bài hơi dài (hơn 60 từ). Bé 5–8 tuổi đọc vừa sức khoảng 15–40 từ.");
  const longS=P.sents.filter(s=>s.end-s.start>12).length;
  if(longS)warn.push(`Có ${longS} câu dài hơn 12 từ — nên tách ngắn lại.`);
  if(n>=3&&!P.sents.some(s=>s.end-s.start>=3))warn.push("Trò “Tìm từ còn thiếu” cần câu có từ 3 từ trở lên.");
  $("edPreview").innerHTML=n?`<div class="edStat">📝 <b>${P.sents.length}</b> câu · <b>${n}</b> từ</div>${warn.length?`<div class="warn">${warn.join("<br>")}</div>`:""}<div class="words">${P.sents.map((s,k)=>P.words.slice(s.start,s.end).map(w=>`<span class="w s${k%3}">${esc(w.c)}</span>`).join("")).join('<span class="sep">·</span>')}</div>`:(warn.length?`<div class="warn">${warn.join("<br>")}</div>`:"");
  $("edSave").disabled=n<3;
}
function edSave(){
  const x=$("edText").value.replace(/\s+/g," ").trim();if(parse(x).words.length<3)return;
  const t=$("edName").value.trim()||("Bài của bé "+(users.length+1));
  if(edId){const L=users.find(u=>u.id===edId);if(L){if(L.x!==x)dropProgress(edId);L.t=t;L.x=x;L.icon=edIcon}}
  else{edId="u"+Date.now().toString(36);users.push({id:edId,icon:edIcon,t,x})}
  store.set("lessons",users);toast("Đã lưu bài “"+t+"” ✅");
  const id=edId;openPick(curMode,true);
  const card=document.querySelector(`.lessonCard[data-l="${id}"]`);if(card){card.scrollIntoView({block:"center"});card.focus()}
}
function edDelete(){
  const L=users.find(u=>u.id===edId);if(!L)return;
  if(!window.confirm(`Xoá bài “${L.t}”? Sao của bài này cũng bị xoá.`))return;
  users=users.filter(u=>u.id!==edId);store.set("lessons",users);dropProgress(edId);updateTotals();
  toast("Đã xoá bài");openPick(curMode,true);
}

/* =====================================================================
   GARA & BỐ MẸ
   ===================================================================== */
function applyCar(){let i=+store.get("car",0)||0;if(!CARS[i]||totalStars()<CARS[i].need)i=0;$("car").style.setProperty("--carc",CARS[i].c);return i}
function renderGarage(){
  const tot=totalStars(),sel=applyCar();
  $("garageGrid").innerHTML=CARS.map((c,i)=>{const locked=tot<c.need;
    return `<button class="gslot${locked?" locked":""}" data-car="${i}" aria-pressed="${i===sel}" ${locked?"disabled":""} ${i===sel?"data-primary":""} aria-label="${locked?"Xe bị khoá, cần "+c.need+" sao":"Xe số "+(i+1)}"><span class="gcar" style="color:${c.c}">${CAR_SVG}</span><span class="tag">${locked?"🔒 cần ⭐"+c.need:i===sel?"✅ Đang lái":"Chọn xe này"}</span></button>`}).join("");
  const nx=CARS.find(c=>c.need>tot);
  $("garageNext").textContent=nx?`Bé có ${tot} ⭐. Còn ${nx.need-tot} ⭐ nữa là mở khoá xe mới!`:"Bé đã mở khoá tất cả xe! 🏆";
}
const SETS=[
 {k:"quickSec",t:"⏱ Thời gian mỗi từ (trò Đọc nhanh)",o:[[4,"4 giây"],[6,"6 giây"],[8,"8 giây"],[10,"10 giây"]]},
 {k:"strict",t:"🎯 Chấm dấu thanh khi đọc",o:[[false,"Dễ — bỏ qua lỗi dấu"],[true,"Chặt — phải đúng dấu"]]},
 {k:"sfx",t:"🔔 Âm thanh vui",o:[[true,"Bật"],[false,"Tắt"]]},
 {k:"voice",t:"🗣 Máy tự đọc hướng dẫn",o:[[true,"Bật"],[false,"Tắt"]]}
];
function renderSettings(){
  $("settings").innerHTML=SETS.map(g=>`<div class="setGroup"><h3>${g.t}</h3><div class="seg">${g.o.map(o=>`<button data-k="${g.k}" data-v='${JSON.stringify(o[0])}' aria-pressed="${S[g.k]===o[0]}">${o[1]}</button>`).join("")}</div></div>`).join("");
}
/* chọn giọng đọc: liệt kê mọi giọng tiếng Việt máy có, cho nghe thử */
function renderVoices(){
  let vs=[];try{vs=speechSynthesis.getVoices().filter(v=>/^vi([-_]|$)/i.test(v.lang))}catch(e){}
  const cur=viVoice?viVoice.name:"";
  $("voices").innerHTML=tts?'<p class="note">Đang dùng giọng Claude (tiếng Việt).</p>':
    vs.length?`<div class="seg">${vs.map((v,i)=>`<button data-voice="${i}" aria-pressed="${v.name===cur}">${esc(v.name)}${/natural|neural|online|premium|enhanced/i.test(v.name)?" ⭐":""}</button>`).join("")}</div>`:
    '<p class="warn">Máy này chưa có giọng đọc tiếng Việt.</p>';
}
let gateAns=0;
function openGate(){
  const a=3+Math.floor(Math.random()*7),b=12+Math.floor(Math.random()*8);gateAns=a*b;
  $("gateQ").textContent=`${a} × ${b} = ?`;
  $("gateOpts").innerHTML=shuffle([gateAns,gateAns+a,gateAns-a,gateAns+10]).map(v=>`<button class="btn ghost" data-g="${v}">${v}</button>`).join("");
  $("gate").classList.add("show");$("gateOpts").querySelector("button").focus();
}
