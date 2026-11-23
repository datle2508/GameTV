/* weak.js — Từ khó của bé: noteWord(w,ok) — mọi trò gọi khi bé đúng/sai một từ; weakWords() (điểm = sai − 0,5×đúng > 0); weakLesson() tạo bài động "📒 Từ khó của bé" (id "weak"); renderWeak (Góc bố mẹ); clearWeak. Lưu ddc_weak. */
let weak=store.get("weak",{});
const weakScore=e=>e.m-e.s*.5;   // sai 1 lần cần đúng 2 lần mới hết "khó"
function noteWord(w,ok){
  if(G.noWeak||(DUO&&DUO.turn===1))return;   // trò Chữ cái, hoặc lượt của bé thứ hai khi chơi đôi
  w=norm(w||"");if(!w||w.indexOf(" ")>=0)return;
  if(ok&&(!weak[w]||!weak[w].m))return;    // chưa từng sai thì không cần ghi lần đúng
  if(ok&&G.missed===w)return;              // đúng ngay sau khi vừa sai (có thể do loại trừ) thì không tính
  if(!ok)G.missed=w;
  const e=weak[w]||(weak[w]={m:0,s:0,t:0});
  if(ok)e.s++;else e.m++;
  e.t=Date.now();
  const keys=Object.keys(weak);
  if(keys.length>300){keys.sort((a,b)=>weak[a].t-weak[b].t).slice(0,keys.length-300).forEach(k=>delete weak[k])}
  store.set("weak",weak);
}
function weakWords(){
  return Object.keys(weak).filter(w=>weakScore(weak[w])>0)
    .sort((a,b)=>weakScore(weak[b])-weakScore(weak[a])||weak[b].t-weak[a].t).slice(0,12);
}
function weakLesson(){
  const ws=weakWords();
  return ws.length>=3?{id:"weak",icon:"📒",t:"Từ khó của bé",x:ws.join(". ")+"."}:null;
}
function clearWeak(){weak={};store.set("weak",weak);renderWeak()}
function renderWeak(){
  const el=$("weakList");if(!el)return;
  const ws=weakWords();
  el.innerHTML=ws.length?`<div class="words">${ws.map(w=>`<span class="w">${esc(w)} <small>sai ${weak[w].m}</small></span>`).join("")}</div>`
    :'<p class="note">Chưa có từ nào. Khi bé đọc sai hoặc chọn sai, từ đó sẽ hiện ở đây và trong thẻ “📒 Từ khó của bé”.</p>';
}
