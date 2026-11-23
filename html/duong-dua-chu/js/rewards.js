/* rewards.js — Động lực & theo dõi: STICKERS (30), rw (sticker đã có, số trò mỗi ngày, chuỗi ngày), plog (nhật ký mỗi lượt chơi); rewardFinish(stars,ms) gọi từ finish() → danh sách lời khen thêm; renderMission (trang chủ), renderAlbum (màn album), renderReport (Góc bố mẹ). Lưu ddc_rw, ddc_log. */
const STICKERS=["🦁","🐼","🦊","🐨","🐸","🦄","🐙","🦋","🐳","🦖","🐬","🦜","🌈","🚀","🎈","🍭","🍓","🍩","⚽","🎨","🎵","🏆","👑","💎","🌟","🍀","🌻","🐞","🦀","🐧"];
const MISSION=3;   // số trò mỗi ngày để xong nhiệm vụ
let rw=Object.assign({st:[],days:{},streak:0,last:""},store.get("rw",{}));
let plog=store.get("log",[]);
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const today=()=>ymd(new Date());
const dayShift=n=>{const d=new Date();d.setDate(d.getDate()+n);return ymd(d)};
function newSticker(){const left=STICKERS.filter(s=>rw.st.indexOf(s)<0);if(!left.length)return "";const s=rnd(left);rw.st.push(s);return s}
function streakNow(){return rw.last===today()||rw.last===dayShift(-1)?rw.streak:0}

/* gọi mỗi khi xong một lượt chơi; trả về các dòng thưởng để hiện trên màn kết quả */
function rewardFinish(stars,ms){
  const d=today(),out=[];
  if(rw.last!==d){rw.streak=rw.last===dayShift(-1)?rw.streak+1:1;rw.last=d;if(rw.streak>=2)out.push(`🔥 Bé chơi ${rw.streak} ngày liên tiếp!`)}
  rw.days[d]=(rw.days[d]||0)+1;
  if(stars===3){const s=newSticker();if(s)out.push(`Nhận sticker mới <span class="stk">${s}</span>`)}
  if(rw.days[d]===MISSION){const s=newSticker();out.push(`🎯 Xong nhiệm vụ hôm nay!`+(s?` Thưởng <span class="stk">${s}</span>`:""))}
  const old=dayShift(-60);Object.keys(rw.days).forEach(k=>{if(k<old)delete rw.days[k]});
  store.set("rw",rw);
  plog.push({d,m:G.mode,s:stars,t:Math.round(ms/1000)});if(plog.length>800)plog=plog.slice(-800);
  store.set("log",plog);
  return out;
}

function renderMission(){
  const el=$("mission");if(!el)return;
  const n=Math.min(rw.days[today()]||0,MISSION),st=streakNow();
  el.innerHTML=`<div class="mtxt">🎯 <b>Nhiệm vụ hôm nay:</b> chơi ${MISSION} trò ${n>=MISSION?"— xong rồi! 🎉":`(${n}/${MISSION})`}</div>`+
    `<div class="mbar"><i style="width:${Math.round(n/MISSION*100)}%"></i></div>`+(st>=2?`<div class="mfire">🔥 ${st} ngày liên tiếp</div>`:"");
  $("albumCount").textContent=`${rw.st.length}/${STICKERS.length} sticker`;
}
function renderAlbum(){
  $("albumSub").textContent=`${S.kidName||"Bé"} có ${rw.st.length}/${STICKERS.length} sticker`+(streakNow()>=2?` · 🔥 ${streakNow()} ngày liên tiếp`:"");
  $("stickers").innerHTML=STICKERS.map(s=>rw.st.indexOf(s)>=0?`<span class="sticker">${s}</span>`:'<span class="sticker no">❔</span>').join("");
}

/* Góc bố mẹ: 7 ngày gần nhất — số lượt chơi mỗi ngày, tổng thời gian, trò hay chơi, sao trung bình */
function renderReport(){
  const el=$("report");if(!el)return;
  const days=[];for(let i=6;i>=0;i--)days.push(dayShift(-i));
  const rows=plog.filter(r=>r.d>=days[0]),cnt={},modeCnt={};
  rows.forEach(r=>{cnt[r.d]=(cnt[r.d]||0)+1;modeCnt[r.m]=(modeCnt[r.m]||0)+1});
  const max=Math.max(1,Math.max.apply(null,days.map(d=>cnt[d]||0)));
  const wd=["CN","T2","T3","T4","T5","T6","T7"];
  const bars=days.map(d=>{const c=cnt[d]||0,dt=new Date(d+"T00:00:00");return `<div class="bar"><b>${c||""}</b><i style="height:${Math.round(c/max*100)}%"></i><small>${d===today()?"Hôm nay":wd[dt.getDay()]}</small></div>`}).join("");
  if(!rows.length){el.innerHTML='<p class="note">7 ngày qua bé chưa chơi lượt nào.</p>';return}
  const mins=Math.round(rows.reduce((a,r)=>a+(r.t||0),0)/60),avg=(rows.reduce((a,r)=>a+r.s,0)/rows.length).toFixed(1);
  const fav=Object.keys(modeCnt).sort((a,b)=>modeCnt[b]-modeCnt[a])[0],fm=MODE(fav);
  el.innerHTML=`<div class="bars">${bars}</div><p class="note">Tổng: <b>${rows.length}</b> lượt chơi · khoảng <b>${mins}</b> phút · trung bình <b>${avg}</b> ⭐ mỗi lượt`+
    (fm?` · hay chơi nhất: <b>${fm.icon} ${fm.name}</b>`:"")+`</p>`;
}
