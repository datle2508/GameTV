/* kids.js — Hồ sơ các bé (màn "kids": renderKids, form đặt tên/giới tính/cấp độ/hình, đổi bé = tải lại trang), chơi đôi (chọn bạn → DUO, creditKid), giới hạn giờ chơi (tm, overLimit, limitBlock), nhạc nền (musicSync), chia sẻ báo cáo tuần (reportText), tạo bài từ ảnh bằng Gemini (aiPhoto). Tự gắn sự kiện cho các nút của mình. */

/* ---------- giao diện theo bé: màu nền bé trai/bé gái, mặt bạn dẫn đường, nút tên trên thanh trên ---------- */
function applyKidLook(){
  document.documentElement.setAttribute("data-kid",KID.g||"");
  const f=KID.g==="girl"?FACE_GIRL:FACE_SVG;$("buddyHome").innerHTML=f;$("buddyPlay").innerHTML=f;
  $("kidAv").textContent=KID.av||"🙂";$("kidNm").textContent=KID.name||"Đặt tên";
}
const saveKids=()=>store.set("kids",KIDS);
function switchKid(id){DUO=null;CUP=null;store.set("kid",id);try{sessionStorage.setItem("ddc_hi","1")}catch(e){}location.reload()}
/* ghi sao cho bé khác (lượt 2 khi chơi đôi); bạn khách không lưu */
function creditKid(k,key,stars){if(!k||k.id==="guest")return;const p=store.get("prog",{},k.id);if(stars>(+p[key]||0)){p[key]=stars;store.set("prog",p,k.id)}}
const kidStars=id=>{const p=id===KID.id?prog:store.get("prog",{},id);return Object.keys(p).reduce((a,k)=>a+(+p[k]||0),0)};

/* ---------- màn các bé: kidsMode "" = chọn bé đang chơi · "duo" = chọn bạn chơi cùng ---------- */
let kidsMode="",kf=null;
const GUEST={id:"guest",name:"Bạn khách",av:"🙂",g:"",lv:"l1"};
function openKids(m){kidsMode=m||"";kf=null;renderKids();show("kids")}
function renderKids(){
  const duo=kidsMode==="duo",list=duo?KIDS.filter(k=>k.id!==KID.id).concat([GUEST]):KIDS;
  $("kidsTitle").textContent=duo?`Ai chơi cùng ${KID.name||"bé"}?`:"Các bé trong nhà";
  $("kidsSub").textContent=duo?"Hai bé thay phiên chơi cùng một trò, rồi so sao":"Chọn bé đang chơi";
  $("kidGrid").innerHTML=list.map((k,i)=>{const lv=LEVELS.find(l=>l.id===k.lv);
    return `<div class="lcWrap"><button class="kidCard${k.g?" "+k.g:""}" data-kid="${k.id}" aria-pressed="${!duo&&k.id===KID.id}" ${i===0?"data-primary":""}><span class="kav">${k.av||"🙂"}</span><b>${esc(k.name||"Bé chưa có tên")}</b><small>${k.id==="guest"?"Không lưu sao":(lv?lv.n:"")+" · ⭐ "+kidStars(k.id)}</small>${!duo&&k.id===KID.id?'<span class="mine">Đang chơi</span>':""}</button>`+
      (duo||k.id==="guest"?"":`<button class="editBtn" data-ke="${k.id}" aria-label="Sửa hồ sơ ${esc(k.name||"bé")}">✏️</button>`)+`</div>`}).join("")+
    (KIDS.length<6?`<button class="lessonCard add" id="kidAdd"><span class="li">➕</span><b>Thêm bé</b></button>`:"");
  $("duoBtn").hidden=duo;$("kidForm").hidden=!kf;
}
/* form hồ sơ */
function openKidForm(id){
  const k=id?KIDS.find(x=>x.id===id):null;
  kf={id:k?k.id:null,g:k?k.g:"",lv:k?k.lv:KID.lv,av:k?k.av:""};
  $("kfHead").textContent=k?"Sửa hồ sơ của bé":"Thêm bé mới";$("kfName").value=k?k.name:"";
  $("kfDel").hidden=!k||k.id==="k1";renderKidForm();$("kidForm").hidden=false;
  setTimeout(()=>{$("kidForm").scrollIntoView({block:"start"});const b=$("kfG").querySelector("button");if(b)b.focus()},50);
}
function renderKidForm(){
  const seg=(arr,cur,attr)=>arr.map(o=>`<button ${attr}="${o[0]}" aria-pressed="${o[0]===cur}">${o[1]}</button>`).join("");
  $("kfG").innerHTML=seg([["boy","👦 Bé trai"],["girl","👧 Bé gái"]],kf.g,"data-kg");
  const names=kf.g==="boy"?NAMES_B:kf.g==="girl"?NAMES_G:NAMES_G.slice(0,4).concat(NAMES_B.slice(0,4));
  $("kfNames").innerHTML=names.map(n=>`<button data-kn="${n}" aria-pressed="${$("kfName").value===n}">${n}</button>`).join("");
  $("kfLv").innerHTML=seg(LEVELS.map(l=>[l.id,l.n]),kf.lv,"data-kl");
  $("kfAv").innerHTML=AVATARS.map(a=>`<button class="icb" data-ka="${a}" aria-pressed="${a===kf.av}">${a}</button>`).join("");
}
function saveKidForm(){
  const name=$("kfName").value.replace(/\s+/g," ").trim().slice(0,20);
  const av=kf.av||(kf.g==="girl"?"🐰":kf.g==="boy"?"🦁":"🐥");
  let k=kf.id?KIDS.find(x=>x.id===kf.id):null;const isNew=!k;
  if(!k){k={id:"k"+Date.now().toString(36)};KIDS.push(k)}
  const lvChanged=k.lv!==kf.lv;
  k.name=name;k.g=kf.g;k.lv=kf.lv;k.av=av;saveKids();
  if(k.id===KID.id){
    KID=k;if(lvChanged){S.quickSec=LEVEL().q;S.strict=LEVEL().st;saveS()}   // cấp độ đặt sẵn tốc độ và độ chặt
    applyKidLook();applyCar();
  }
  kf=null;renderKids();toast(isNew?`Đã thêm ${name||"bé"} 🎉`:"Đã lưu hồ sơ");
  if(S.voice&&name)speakVi("Chào "+name+"!");
}
function deleteKid(){
  const k=KIDS.find(x=>x.id===kf.id);if(!k||k.id==="k1")return;
  if(!window.confirm(`Xoá hồ sơ của ${k.name||"bé"}? Sao, sticker và nhật ký của bé này sẽ mất.`))return;
  try{Object.keys(localStorage).forEach(key=>{if(key.indexOf("ddc_"+k.id+".")===0)localStorage.removeItem(key)})}catch(e){}
  KIDS=KIDS.filter(x=>x.id!==k.id);saveKids();
  if(k.id===KID.id){switchKid("k1");return}
  kf=null;renderKids();toast("Đã xoá hồ sơ");
}
$("kidBtn").addEventListener("click",()=>openKids());
$("pKids").addEventListener("click",()=>openKids());
$("duoBtn").addEventListener("click",()=>openKids("duo"));
$("kidsBtn2").addEventListener("click",()=>openKids("duo"));
$("kidGrid").addEventListener("click",e=>{
  if(e.target.closest("#kidAdd")){openKidForm();return}
  const ed=e.target.closest("[data-ke]");if(ed){openKidForm(ed.getAttribute("data-ke"));return}
  const b=e.target.closest("[data-kid]");if(!b)return;const id=b.getAttribute("data-kid");
  if(kidsMode==="duo"){
    const p=id==="guest"?GUEST:KIDS.find(k=>k.id===id);CUP=null;DUO={a:KID,b:p,turn:0,res:[]};show("home");
    const t=`${KID.name||"Bé"} và ${p.name||"bạn"} cùng chơi nhé! Chọn một trò nào.`;toast("👫 "+t);if(S.voice)speakVi(t);return;
  }
  if(id===KID.id)show("home");else switchKid(id);
});
$("kidForm").addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  if(t.hasAttribute("data-kg")){kf.g=t.getAttribute("data-kg");if(!kf.av||AVATARS.indexOf(kf.av)<0)kf.av=kf.g==="girl"?"🐰":"🦁";renderKidForm();$("kfG").querySelector('[aria-pressed="true"]').focus()}
  else if(t.hasAttribute("data-kn")){$("kfName").value=t.getAttribute("data-kn");renderKidForm();$("kfNames").querySelector('[aria-pressed="true"]').focus()}
  else if(t.hasAttribute("data-kl")){kf.lv=t.getAttribute("data-kl");renderKidForm();$("kfLv").querySelector('[aria-pressed="true"]').focus()}
  else if(t.hasAttribute("data-ka")){kf.av=t.getAttribute("data-ka");renderKidForm();$("kfAv").querySelector('[aria-pressed="true"]').focus()}
  else if(t.id==="kfSave")saveKidForm();
  else if(t.id==="kfCancel"){kf=null;renderKids()}
  else if(t.id==="kfDel")deleteKid();
});
$("kfName").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();saveKidForm()}});
$("kfName").addEventListener("input",()=>{const v=$("kfName").value;$("kfNames").querySelectorAll("[data-kn]").forEach(b=>b.setAttribute("aria-pressed",b.getAttribute("data-kn")===v))});
$("duoOff").addEventListener("click",()=>{DUO=null;renderHome();toast("Đã thôi chơi đôi")});
$("pathBtn").addEventListener("click",()=>{const i=pathNextIdx();if(i>=0)startPath(i);else{renderPath();show("path")}});   // Học tiếp: vào thẳng chặng kế
$("mapBtn").addEventListener("click",()=>{renderPath();show("path")});
$("cupBtn").addEventListener("click",startCup);

/* ---------- giới hạn giờ chơi mỗi ngày (S.limit phút, 0 = không giới hạn); chỉ đếm lúc đang chơi ---------- */
let tm=store.get("time",{});
const tmToday=()=>{if(tm.d!==today())tm={d:today(),s:0,x:0};return tm};
setInterval(()=>{if(screen==="play"&&!G.over&&!document.hidden){tmToday().s+=5;store.set("time",tm)}},5000);
const overLimit=()=>S.limit>0&&tmToday().s>=(S.limit+tm.x)*60;
function limitBlock(){
  if(!overLimit())return false;
  $("over").classList.remove("show");if(screen==="play")show("home");
  $("limitTxt").textContent=`Hôm nay ${kid()} đã chơi ${S.limit+tm.x} phút rồi. Mắt cần nghỉ ngơi, mai mình chơi tiếp nhé!`;
  $("limitOv").classList.add("show");$("limitHome").focus();
  if(S.voice)speakVi(`Hết giờ chơi rồi, ${kid()} ơi! Mai mình chơi tiếp nhé.`);
  return true;
}
$("limitHome").addEventListener("click",()=>{$("limitOv").classList.remove("show");show("home")});
$("limitMore").addEventListener("click",()=>{$("limitOv").classList.remove("show");openGate(()=>{tmToday().x+=10;store.set("time",tm);toast("Bố mẹ cho chơi thêm 10 phút ⏰")})});

/* ---------- nhạc nền nhẹ (Web Audio), chỉ phát ngoài màn chơi để không lẫn với micro và giọng đọc ---------- */
const MUS=[523,659,784,659,587,698,880,698,523,659,784,1047,988,784,659,587];
let musT=0,musI=0;
function musicTick(){
  if(!actx||actx.state!=="running")return;
  try{const f=MUS[musI++%MUS.length],o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;
    o.type="triangle";o.frequency.value=f/2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.03,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+.5);
    o.connect(g);g.connect(actx.destination);o.start(t);o.stop(t+.55)}catch(e){}
}
function musicSync(){const on=S.music&&screen!=="play"&&!document.hidden;if(on&&!musT)musT=setInterval(musicTick,420);else if(!on&&musT){clearInterval(musT);musT=0}}
document.addEventListener("visibilitychange",musicSync);

/* ---------- báo cáo tuần để gửi Zalo / email ---------- */
function reportText(){
  const days=[];for(let i=6;i>=0;i--)days.push(dayShift(-i));
  const rows=plog.filter(r=>r.d>=days[0]),cnt={},mc={};rows.forEach(r=>{cnt[r.d]=(cnt[r.d]||0)+1;mc[r.m]=(mc[r.m]||0)+1});
  const mins=Math.round(rows.reduce((a,r)=>a+(r.t||0),0)/60),avg=rows.length?(rows.reduce((a,r)=>a+r.s,0)/rows.length).toFixed(1):"0";
  const top=Object.keys(mc).sort((a,b)=>mc[b]-mc[a]).slice(0,3).map(m=>MODE(m)?MODE(m).name+" ("+mc[m]+")":m).join(", ");
  return [`📊 Báo cáo học đọc 7 ngày của ${KID.name||"bé"} (Đường đua chữ)`,`Cấp độ: ${LEVEL().n.replace(/^\S+ /,"")}`,
    `Số ngày có chơi: ${days.filter(d=>cnt[d]).length}/7 · ${rows.length} lượt · khoảng ${mins} phút`,`Trung bình ${avg} ⭐ mỗi lượt`+(top?` · hay chơi: ${top}`:""),
    `Lộ trình: qua ${pathDone()}/${pathList().length} chặng · ${rw.st.length} sticker · ${(rw.bd||[]).length} huy hiệu`,
    weakWords().length?`Từ cần luyện thêm: ${weakWords().slice(0,10).join(", ")}`:"Chưa có từ nào bé hay sai."].join("\n");
}
/* gửi chữ ra ngoài: bảng chia sẻ (iPhone, Android) → chép vào bộ nhớ tạm → hiện ô chữ để tự chép (TV, trình duyệt cũ) */
function shareOut(t,title,ta,okMsg){
  const showIt=()=>{$(ta).hidden=false;$(ta).value=t;$(ta).focus();$(ta).select();toast("Chép đoạn này rồi gửi nhé")};
  if(navigator.share)navigator.share({title,text:t}).catch(e=>{if(!e||e.name!=="AbortError")showIt()});
  else if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(()=>toast(okMsg),showIt);
  else showIt();
}
$("shareRep").addEventListener("click",()=>shareOut(reportText(),"Báo cáo học đọc","repText","Đã chép báo cáo, dán vào Zalo hoặc email nhé"));
/* bài tự tạo → chữ dễ đọc để gửi người làm game thêm thành bài mẫu (BUILTIN) có giọng thu sẵn */
$("pExport").addEventListener("click",()=>{
  if(!users.length){toast("Chưa có bài tự tạo nào");return}
  const t="=== BÀI TỰ TẠO (Đường đua chữ) ===\n\n"+users.map(u=>`## ${u.icon} ${u.t}\n${String(u.x).replace(/\s+/g," ").trim()}`).join("\n\n");
  shareOut(t,"Bài tự tạo","expText",`Đã chép ${users.length} bài — dán vào tin nhắn gửi đi nhé`);
});

/* ---------- tạo bài từ ảnh trang sách (Gemini đọc chữ trong ảnh; dùng chung key Gemini của giọng đọc) ---------- */
let aiTextModel="";
function pickTextModel(){
  if(aiTextModel)return Promise.resolve(aiTextModel);
  return fetchT(GM+"models?pageSize=200&key="+encodeURIComponent(mKey),{},15000).then(r=>r.json()).then(j=>{
    const ver=n=>{const m=/gemini-(\d+(?:\.\d+)?)/.exec(n);return m?+m[1]:0};
    const ms=(j.models||[]).filter(m=>(m.supportedGenerationMethods||[]).indexOf("generateContent")>=0).map(m=>m.name.replace("models/",""))
      .filter(n=>/flash/.test(n)&&!/tts|image|live|audio|embed|thinking|exp/.test(n))
      .sort((a,b)=>(ver(b)*10-(/lite/.test(b)?5:0)-(/preview/.test(b)?1:0))-(ver(a)*10-(/lite/.test(a)?5:0)-(/preview/.test(a)?1:0)));
    return aiTextModel=ms[0]||"gemini-2.5-flash";
  }).catch(()=>"gemini-2.5-flash");
}
/* thu nhỏ ảnh (tối đa 1600px) cho nhẹ trước khi gửi */
function shrinkImage(file){
  return new Promise((ok,no)=>{const fr=new FileReader();fr.onerror=no;fr.onload=()=>{const im=new Image();im.onerror=()=>no(new Error("không đọc được ảnh"));im.onload=()=>{
    const k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.85).split(",")[1])};im.src=fr.result};fr.readAsDataURL(file)});
}
const AI_PHOTO='Ảnh là một trang sách hoặc vở tiếng Việt cho trẻ em. Hãy chép lại CHÍNH XÁC đoạn văn bài đọc trong ảnh (đúng chính tả, đủ dấu thanh), bỏ số trang, tên bài tập, câu hỏi và chữ không thuộc bài đọc. Tối đa 8 câu. Trả về JSON {"title": tên bài ngắn tối đa 30 ký tự, "text": đoạn văn}. Nếu ảnh không có chữ tiếng Việt, trả về {"title":"","text":""}.';
function aiPhoto(file){
  const st=$("edAi");st.hidden=false;st.textContent="⏳ Đang đọc chữ trong ảnh…";$("edPhoto").disabled=true;
  Promise.all([shrinkImage(file),pickTextModel()]).then(r=>fetchT(GM+"models/"+r[1]+":generateContent?key="+encodeURIComponent(mKey),{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{parts:[{inlineData:{mimeType:"image/jpeg",data:r[0]}},{text:AI_PHOTO}]}],generationConfig:{responseMimeType:"application/json",temperature:0}})},60000))
  .then(r=>r.json().then(j=>{
    if(!r.ok)throw new Error(r.status===429?"Gemini đang hết lượt miễn phí, thử lại sau ít phút":(j.error&&j.error.message)||"HTTP "+r.status);
    const parts=(((j.candidates||[])[0]||{}).content||{}).parts||[],txt=parts.map(p=>p.text||"").join("");
    let o={};try{o=JSON.parse(txt.replace(/^```(json)?|```$/g,"").trim())}catch(e){o={text:txt}}
    const x=String(o.text||"").replace(/\s+/g," ").trim();if(!x)throw new Error("không thấy chữ tiếng Việt trong ảnh");
    $("edText").value=x.slice(0,800);if(!$("edName").value.trim()&&o.title)$("edName").value=String(o.title).slice(0,30);
    edPreview();st.textContent="✅ Đã chép chữ từ ảnh. Bố mẹ xem lại cho đúng rồi bấm Lưu bài nhé.";
  })).catch(e=>{st.textContent="⚠️ Chưa đọc được ảnh: "+(e.message||e)})
  .then(()=>{$("edPhoto").disabled=false;$("edFile").value=""});
}
$("edPhoto").addEventListener("click",()=>{
  if(!mKey){$("edAi").hidden=false;$("edAi").textContent="Cần key Gemini (miễn phí): vào Góc bố mẹ → Giọng đọc mẫu → Gemini để lưu key.";return}
  $("edFile").click();
});
$("edFile").addEventListener("change",()=>{const f=$("edFile").files&&$("edFile").files[0];if(f)aiPhoto(f)});
