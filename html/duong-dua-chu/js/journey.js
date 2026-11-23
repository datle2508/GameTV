/* journey.js — Lộ trình học theo cấp độ (PATHS: pathList, pathNextIdx, renderPath, startPath), Giải đua 3 chặng (startCup), huy hiệu (BADGES, newBadges, renderBadges), trang trí xe (applyDeco, renderDecos), và flowFinish/flowNext: màn kết quả khi chơi đôi / giải đua / lộ trình. */

/* ---------- lộ trình: chặng xong khi có ít nhất 1 sao; chặng sau mở khi chặng trước xong ---------- */
const pathList=()=>{const P=curSub==="math"?PATHS_MATH:PATHS;return P[KID.lv]||P.l1};   // lộ trình của môn đang chọn
const stageStars=p=>+prog[p[1]+"|"+p[0]]||0;
const pathDone=()=>pathList().filter(p=>stageStars(p)>0).length;
function pathNextIdx(){const L=pathList();for(let i=0;i<L.length;i++)if(!stageStars(L[i]))return i;return -1}
function renderPath(){
  const L=pathList(),cur=pathNextIdx(),focusI=cur<0?0:cur;
  $("pathSub").textContent=`${SUBJECTS.find(x=>x[0]===curSub)[1]} · ${LEVEL().n} · đã qua ${pathDone()}/${L.length} chặng`;
  $("pathMap").innerHTML=L.map((p,i)=>{
    const M=MODE(p[0]),Ls=findLesson(p[1]),st=stageStars(p),lock=cur>=0&&i>cur;
    return `<div class="pnode ${i%2?"r":"l"}"><button class="pstop${st?" done":""}${i===cur?" cur":""}" data-ps="${i}" ${lock?"disabled":""} ${i===focusI?"data-primary":""} style="--mc:${M.col}">`+
      `<span class="pn">${i+1}</span><span class="pi">${lock?"🔒":M.icon}</span><span class="pt"><b>${M.name}</b><small>${esc(Ls?Ls.icon+" "+Ls.t:"")}</small>${st?starRow(st):i===cur?'<small class="go2">▶ Chơi chặng này</small>':""}</span></button></div>`;
  }).join("")+`<div class="pend">${cur<0?"🏁 "+esc(kid())+" đã đi hết lộ trình! 🎉":"🏁 Đích"}</div>`;
}
function startPath(i){const p=pathList()[i];if(!p)return;DUO=null;startGame(p[1],p[0],"path")}
function pathBtnHtml(){
  const L=pathList(),cur=pathNextIdx();
  return `<span class="e">▶️</span><span>Học tiếp<small>${LEVEL().n} · ${cur<0?"đã đi hết lộ trình! 🏁":`chặng ${cur+1}/${L.length}: ${MODE(L[cur][0]).icon} ${MODE(L[cur][0]).name}`}</small></span>`;
}

/* ---------- giải đua 3 chặng: chọn ngẫu nhiên trong các chặng bé đã mở của lộ trình ---------- */
function startCup(){
  const L=pathList(),cur=pathNextIdx(),open=L.slice(0,cur<0?L.length:Math.max(cur+1,4));
  const list=shuffle(open.length>=3?open:L).slice(0,3);
  DUO=null;CUP={list,i:0,stars:[]};startGame(list[0][1],list[0][0],"cup");
}

/* ---------- huy hiệu: [id, hình, tên, điều kiện] ---------- */
const BADGES=[
 ["first","👣","Bước đầu tiên","Chơi lượt đầu tiên",r=>r.n>=1],
 ["n10","🎯","Chăm chỉ","Chơi 10 lượt",r=>r.n>=10],
 ["n50","🏅","Siêu chăm","Chơi 50 lượt",r=>r.n>=50],
 ["s3","🌟","Ba sao đầu tiên","Được 3 sao một lần",r=>r.n3>=1],
 ["s10","💫","Thợ săn sao","10 lần được 3 sao",r=>r.n3>=10],
 ["d3","🔥","Ba ngày liền","Chơi 3 ngày liên tiếp",r=>r.best>=3],
 ["d7","☄️","Cả tuần chăm","Chơi 7 ngày liên tiếp",r=>r.best>=7],
 ["m5","📅","Năm nhiệm vụ","Xong nhiệm vụ 5 ngày",r=>r.md>=5],
 ["book","📚","Mọt sách","Đọc hết truyện tranh",()=>STORIES.every(s=>prog[s.id+"|story"])],
 ["all","🧭","Thử hết các trò","Chơi đủ mọi trò",()=>MODES.every(m=>modeStars(m.id)>0)],
 ["p5","🗺️","Nhà thám hiểm","Qua 5 chặng lộ trình",()=>pathDone()>=5],
 ["pall","🏁","Về đích lộ trình","Đi hết lộ trình",()=>pathNextIdx()<0],
 ["cup","🏆","Nhà vô địch","Giành cúp vàng",r=>(r.cups||{}).g>=1],
 ["duo","👫","Bạn cùng chơi","Chơi đôi một ván",r=>r.duo>=1],
 ["voice","🎙️","Giọng đọc hay","Xong trò Nghe giọng mình",()=>modeStars("echo")>0],
 ["stk","🦄","Nhà sưu tầm","Có 15 sticker",r=>r.st.length>=15]
];
function newBadges(){
  rw.bd=rw.bd||[];const out=[];
  BADGES.forEach(b=>{if(rw.bd.indexOf(b[0])<0&&b[4](rw)){rw.bd.push(b[0]);out.push(`🏅 Huy hiệu mới: <span class="stk">${b[1]}</span> ${b[2]}`)}});
  if(out.length)store.set("rw",rw);
  return out;
}
function renderBadges(){
  const bd=rw.bd||[],c=rw.cups||{};
  $("badges").innerHTML=BADGES.map(b=>{const on=bd.indexOf(b[0])>=0;return `<div class="bdg${on?"":" no"}"><span>${on?b[1]:"🔒"}</span><b>${b[2]}</b><small>${b[3]}</small></div>`}).join("");
  $("cupLine").textContent=`Cúp giải đua: 🥇 ${c.g||0} · 🥈 ${c.s||0} · 🥉 ${c.b||0}`;
  const p=petNow();$("petCard").innerHTML=`<span class="petBig">${p.cur[0]}</span><div><b>${p.cur[2]}</b><small>${p.next?`Xong nhiệm vụ thêm ${p.next[1]-p.md} ngày nữa để thành ${p.next[0]} ${p.next[2]}`:"Thú cưng đã lớn hết cỡ!"}</small></div>`;
}

/* ---------- trang trí xe: hình gắn trên nóc xe, mở bằng sao ---------- */
function applyDeco(){
  let i=+store.get("deco",0)||0;if(!DECOS[i]||totalStars()<DECOS[i][1])i=0;
  const d=DECOS[i][0];$("car").innerHTML=CAR_SVG+(d?`<span class="deco">${d}</span>`:"");return i;
}
function renderDecos(){
  const tot=totalStars(),sel=applyDeco();
  $("decoGrid").innerHTML=DECOS.map((d,i)=>{const lock=tot<d[1];
    return `<button class="gslot deco${lock?" locked":""}" data-deco="${i}" aria-pressed="${i===sel}" ${lock?"disabled":""}><span class="de">${d[0]||"🚫"}</span><span class="tag">${lock?"🔒 cần ⭐"+d[1]:i===sel?"✅ Đang gắn":d[0]?"Gắn lên xe":"Không gắn"}</span></button>`}).join("");
}
$("decoGrid").addEventListener("click",e=>{const b=e.target.closest("[data-deco]");if(b&&!b.disabled){store.set("deco",+b.getAttribute("data-deco"));renderDecos();toast("Xe đẹp quá! ✨")}});

/* ---------- màn kết quả theo kiểu chơi; trả về các dòng thêm và đổi nhãn nút ---------- */
function flowFinish(stars,ms){
  const out=[],A=$("again"),N=$("next"),H=$("toHome");
  A.hidden=false;N.hidden=false;A.textContent="🔁 Chơi lại";N.textContent="Bài tiếp ➡️";H.textContent="🏠 Trò khác";
  /* Cờ đường số: người về đích trước; chơi đôi trên cùng bàn cờ thì ghi sao cho cả hai bé */
  if(G.mode==="board"&&G.winner){const w=G.winner;$("rtitle").textContent=`${w.n} về đích trước!`;
    if(w.robot)out.push("🤖 Rô-bốt nhanh chân hơn. Chơi lại để thắng nhé!");
    if(DUO){creditKid(DUO.b,G.lesson.id+"|"+G.mode,stars);rw.duo=(rw.duo||0)+1;store.set("rw",rw)}}
  if(DUO&&!MODE(G.mode).duoSelf){
    const P=[DUO.a,DUO.b],nm=k=>esc(P[k].name||"Bạn");
    if(DUO.turn===0){
      DUO.res=[{stars,ms}];A.hidden=true;N.textContent=`▶️ Lượt của ${P[1].name||"bạn"}`;
      out.push(`👫 Đến lượt ${P[1].av} ${nm(1)} chơi!`);
    }else{
      DUO.res[1]={stars,ms};const a=DUO.res[0],b=DUO.res[1];
      const win=a.stars!==b.stars?(a.stars>b.stars?0:1):(a.ms&&b.ms&&Math.abs(a.ms-b.ms)>=1000?(a.ms<b.ms?0:1):-1);
      $("rtitle").textContent=win<0?"Hoà rồi! Cả hai đều giỏi!":`${P[win].name||"Bạn"} thắng rồi!`;
      out.push(`<div class="duoRes">${[0,1].map(k=>`<div class="${k===win?"win1":""}"><span class="av">${P[k].av}</span><b>${nm(k)}</b>${starRow(DUO.res[k].stars)}<small>${DUO.res[k].ms>=1000?"⏱ "+fmt(DUO.res[k].ms):""}</small>${k===win?"<span>🏆</span>":""}</div>`).join("")}</div>`);
      rw.duo=(rw.duo||0)+1;store.set("rw",rw);A.hidden=true;N.textContent="🔁 Đấu lại";
    }
  }else if(CUP&&G.from==="cup"){
    CUP.stars.push(stars);A.hidden=true;
    if(CUP.i<CUP.list.length-1){out.push(`🏆 Xong chặng ${CUP.i+1}/${CUP.list.length}! Tổng ${CUP.stars.reduce((x,y)=>x+y,0)} ⭐`);N.textContent="Chặng tiếp ➡️"}
    else{
      const tot=CUP.stars.reduce((x,y)=>x+y,0),m=tot>=8?"g":tot>=6?"s":"b",md={g:"🥇 cúp vàng",s:"🥈 cúp bạc",b:"🥉 cúp đồng"}[m];
      rw.cups=rw.cups||{g:0,s:0,b:0};rw.cups[m]++;store.set("rw",rw);
      $("rtitle").textContent="Về đích giải đua!";out.push(`🏆 ${tot}/9 ⭐ — ${esc(kid())} nhận <b>${md}</b>!`);
      N.textContent="🏆 Đua giải mới";CUP=null;G.from="cupEnd";
    }
  }else if(G.from==="path"){
    const i=pathNextIdx();
    if(i<0){out.push("🏁 Bé đã đi hết lộ trình! Giỏi quá!");N.hidden=true}
    else{out.push(`🗺️ Chặng tiếp: ${MODE(pathList()[i][0]).icon} ${MODE(pathList()[i][0]).name}`);N.textContent="Chặng tiếp ➡️"}
  }
  if(overLimit())out.push("⏰ Hôm nay chơi đủ giờ rồi. Mai mình chơi tiếp nhé!");
  return out.concat(DUO&&DUO.turn===1?[]:newBadges());
}
/* nút "next" trên màn kết quả: true nếu đã xử lý */
function flowNext(){
  if(DUO){
    if(DUO.turn===0&&DUO.res.length===1){DUO.turn=1;startGame(G.lesson.id,G.mode,"duo");return true}
    if(DUO.res.length===2){DUO.turn=0;DUO.res=[];startGame(G.lesson.id,G.mode,"duo");return true}
  }
  if(CUP&&G.from==="cup"){CUP.i++;const p=CUP.list[CUP.i];startGame(p[1],p[0],"cup");return true}
  if(G.from==="cupEnd"){startCup();return true}
  if(G.from==="path"){const i=pathNextIdx();if(i>=0)startPath(i);else{renderPath();show("path")}return true}
  return false;
}
$("pathMap").addEventListener("click",e=>{const b=e.target.closest("[data-ps]");if(b&&!b.disabled)startPath(+b.getAttribute("data-ps"))});
