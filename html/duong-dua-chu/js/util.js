/* util.js — Tiện ích: $, esc, rnd, shuffle, fmt, store (localStorage ddc_*), toast; chuẩn hoá chữ norm/clean/fold/lev/same; S (cài đặt); parse, uniqWords, choicesFor; users/lessons/findLesson/MODE; prog/totalStars/modeStars/starRow/dropProgress. */
/* =====================================================================
   TIỆN ÍCH
   ===================================================================== */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
const fmt=ms=>{const s=Math.floor(ms/1000);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const store={get(k,d){try{const v=localStorage.getItem("ddc_"+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem("ddc_"+k,JSON.stringify(v))}catch(e){}}};
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1800)}

/* \p{L} làm cả script lỗi cú pháp trên trình duyệt cũ (Chrome < 64), nên tạo regex có dự phòng */
const VI="0-9a-zA-Z\\u00c0-\\u024f\\u1e00-\\u1eff";
const NONWORD=(()=>{try{return new RegExp("[^\\p{L}\\p{N}]+","gu")}catch(e){return new RegExp("[^"+VI+"]+","g")}})();
const EDGE=(()=>{try{return new RegExp("^[^\\p{L}\\p{N}]+|[^\\p{L}\\p{N}]+$","gu")}catch(e){return new RegExp("^[^"+VI+"]+|[^"+VI+"]+$","g")}})();
const norm=s=>s.normalize("NFC").toLowerCase().replace(NONWORD," ").trim();
const clean=w=>w.replace(EDGE,"");
/* bỏ dấu: "cà" → "ca", "đi" → "di" */
const fold=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d");
function lev(a,b){if(Math.abs(a.length-b.length)>1)return 2;let p=[];for(let j=0;j<=b.length;j++)p[j]=j;for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]}

/* cài đặt bố mẹ */
const S=Object.assign({quickSec:6,strict:false,sfx:true,voice:true},store.get("settings",{}));
const saveS=()=>store.set("settings",S);

/* khớp mềm: đúng hẳn, hoặc chỉ sai dấu thanh (máy hay nghe nhầm), hoặc lệch 1 chữ cái với từ dài.
   Chế độ "chặt" (bố mẹ bật): phải đúng hẳn cả dấu. */
function same(tok,target){
  if(tok===target)return true;
  if(S.strict)return false;
  const a=fold(tok),b=fold(target);
  return a===b||(b.length>=5&&lev(a,b)<=1);   // ≥5 để "xanh"≠"xinh", "rau"≠"sau"
}

/* tách bài: giữ chữ gốc (d), chữ sạch dấu câu (c), chữ chuẩn hoá để so (n); và ranh giới câu */
function parse(x){
  const words=[],sents=[];
  (String(x).replace(/\s+/g," ").trim().match(/[^.!?…]+[.!?…]*/g)||[]).forEach(chunk=>{
    const start=words.length;
    chunk.trim().split(" ").forEach(raw=>{
      const n=norm(raw);if(!n)return;
      const parts=n.split(" ");
      if(parts.length===1)words.push({d:raw,c:clean(raw),n});
      else parts.forEach(p=>words.push({d:p,c:p,n:p}));   // "ca-rô" → "ca" "rô"
    });
    if(words.length>start)sents.push({start,end:words.length,text:chunk.trim()});
  });
  return {words,sents};
}
const uniqWords=P=>{const seen={},out=[];P.words.forEach(w=>{if(!seen[w.n]){seen[w.n]=1;out.push(w.n)}});return out};
/* 3 lựa chọn: từ đúng + 2 từ "nhiễu" gần giống (cùng chữ đầu, độ dài gần bằng) */
function choicesFor(n,pool,k){
  const cand=[],seen={};pool.concat(COMMON).forEach(w=>{if(w!==n&&!seen[w]){seen[w]=1;cand.push(w)}});
  const sc={};cand.forEach(w=>{sc[w]=Math.abs(w.length-n.length)+(fold(w)[0]===fold(n)[0]?0:2)+Math.random()*2.5});
  cand.sort((a,b)=>sc[a]-sc[b]);
  return shuffle([n].concat(cand.slice(0,(k||3)-1)));
}

/* bài học: có sẵn + bài tự tạo (chuyển bài "custom" của bản cũ sang) */
let users=store.get("lessons",null);
if(!Array.isArray(users)){users=[];const old=store.get("custom","");if(old&&String(old).trim())users.push({id:"u1",icon:"📖",t:"Bài của bé",x:old});store.set("lessons",users)}
const lessons=()=>BUILTIN.concat(users);
/* bài đặc biệt: "weak" = Từ khó (weak.js) · "bank" = trò không cần chọn bài · "st…" = truyện trong STORIES */
function findLesson(id){
  if(id==="weak")return weakLesson();
  if(id==="bank")return {id:"bank",icon:"🎲",t:"Câu hỏi ngẫu nhiên",x:""};
  const st=STORIES.find(s=>s.id===id);
  if(st)return {id:st.id,icon:st.icon,t:st.t,x:st.pages.map(p=>p[1]).join(" "),story:st};
  return lessons().find(l=>l.id===id);
}
const MODE=id=>MODES.find(m=>m.id===id);
let prog=store.get("prog",{});          // "idBài|trò" → số sao tốt nhất (1–3)
const totalStars=()=>Object.keys(prog).reduce((a,k)=>a+(+prog[k]||0),0);
const modeStars=m=>Object.keys(prog).filter(k=>k.split("|")[1]===m).reduce((a,k)=>a+(+prog[k]||0),0);
const starRow=n=>`<span class="st" aria-label="${n} trên 3 sao">${[0,1,2].map(i=>`<span class="${i<n?"on":""}">★</span>`).join("")}</span>`;
function dropProgress(id){Object.keys(prog).forEach(k=>{if(k.split("|")[0]===id)delete prog[k]});store.set("prog",prog)}
