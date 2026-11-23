/* main.js — Gắn sự kiện cho mọi nút, điều khiển remote/bàn phím (moveFocus, keydown), khởi động (vẽ xe, renderHome). PHẢI nạp cuối cùng. */
/* =====================================================================
   SỰ KIỆN
   ===================================================================== */
$("homeBtn").addEventListener("click",()=>show("home"));
$("starsBtn").addEventListener("click",()=>{renderGarage();show("garage")});
$("garageBtn").addEventListener("click",()=>{renderGarage();show("garage")});
$("parentBtn").addEventListener("click",openGate);
$("newBtn").addEventListener("click",()=>openEditor());
$("pNew").addEventListener("click",()=>openEditor());
$("heroSay").addEventListener("click",()=>speakVi($("heroMsg").textContent+" "+Kid()+" chạm vào một trò để chơi nhé."));
$("pickSay").addEventListener("click",()=>speakVi(MODE(curMode).say+" "+Kid()+" chọn một bài nhé."));
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",back));
$("modes").addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b)openPick(b.getAttribute("data-m"))});
$("groups").addEventListener("click",e=>{const b=e.target.closest("[data-g]");if(b)openGroup(b.getAttribute("data-g"))});
$("subTabs").addEventListener("click",e=>{const b=e.target.closest("[data-sub]");if(b)setSub(b.getAttribute("data-sub"))});
$("lessonGrid").addEventListener("click",e=>{
  const ed=e.target.closest("[data-e]");if(ed){openEditor(ed.getAttribute("data-e"));return}
  if(e.target.closest("#addLesson")){openEditor();return}
  const b=e.target.closest("[data-l]");if(b)startGame(b.getAttribute("data-l"),curMode);
});
$("stageBody").addEventListener("click",e=>{
  if(e.target.closest("#qgo")){IMPL.quick.begin();return}
  if(e.target.closest("[data-next]")&&IMPL_().next){IMPL_().next();return}   // "Trang sau", "Bắt đầu" (Mưa chữ)
  const bl=e.target.closest("[data-b]");if(bl&&G.mode==="balloon"){IMPL.balloon.tap(+bl.getAttribute("data-b"),bl);return}
  const ch=e.target.closest("[data-c]");if(ch&&!G.over&&IMPL_().pick)IMPL_().pick(+ch.getAttribute("data-c"),ch);
});
$("mic").addEventListener("click",()=>{if(listening)stopListen();else startListen()});
$("ok").addEventListener("click",()=>{if(!G.over)IMPL_().ok()});
$("listen").addEventListener("click",()=>{if(!G.over){const t=IMPL_().sample();if(t)speakVi(t)}});
$("again").addEventListener("click",()=>startGame(G.lesson.id,G.mode,G.from==="path"?"path":""));
$("next").addEventListener("click",()=>{
  if(flowNext())return;   // chơi đôi, giải đua, lộ trình (journey.js)
  const src=MODE(G.mode).src,L=src==="stories"?STORIES:lessons(),i=L.findIndex(l=>l.id===G.lesson.id);
  startGame(src==="none"?"bank":L[(i+1)%L.length].id,G.mode)});
$("albumBtn").addEventListener("click",()=>{renderAlbum();show("album")});
$("mission").addEventListener("click",()=>{renderAlbum();show("album")});
$("toHome").addEventListener("click",()=>openGroup(MODE(G.mode).grp));
$("edText").addEventListener("input",edPreview);
$("edIcons").addEventListener("click",e=>{const b=e.target.closest("[data-ic]");if(b){edIcon=b.getAttribute("data-ic");renderIcons();$("edIcons").querySelector('[aria-pressed="true"]').focus()}});
$("edSave").addEventListener("click",edSave);
$("edDel").addEventListener("click",edDelete);
$("edHear").addEventListener("click",()=>{const x=$("edText").value.trim();if(x)speakVi(x)});
$("garageGrid").addEventListener("click",e=>{const b=e.target.closest("[data-car]");if(b&&!b.disabled){store.set("car",+b.getAttribute("data-car"));renderGarage();toast("Đã đổi xe 🚗")}});
$("settings").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;S[b.getAttribute("data-k")]=JSON.parse(b.getAttribute("data-v"));saveS();renderSettings();musicSync();const f=$("settings").querySelector(`[data-k="${b.getAttribute("data-k")}"][aria-pressed="true"]`);if(f)f.focus()});
$("voices").addEventListener("click",e=>{const b=e.target.closest("[data-voice]");if(!b)return;
  let vs=[];try{vs=speechSynthesis.getVoices().filter(v=>/^vi([-_]|$)/i.test(v.lang))}catch(er){}
  const v=vs[+b.getAttribute("data-voice")];if(!v)return;
  S.voiceName=v.name;saveS();viVoice=v;voiceNote();renderVoices();webSpeak(VOICE_TEST);
  const f=$("voices").querySelector('[aria-pressed="true"]');if(f)f.focus()});
$("tProv").addEventListener("click",e=>{const b=e.target.closest("[data-prov]");if(!b)return;const p=b.getAttribute("data-prov");
  S.ttsProv=p;saveS();aiReset(p);renderAI();voiceNote();
  if(p==="gemini"&&mKey&&!mModels)mLoadModels();if(p==="google"&&gKey&&!gVoices)gLoadVoices();if(p==="device")renderVoices();
  const f=$("tProv").querySelector('[aria-pressed="true"]');if(f)f.focus()});
$("mSave").addEventListener("click",()=>{const v=$("mKeyIn").value.trim();if(!v)return;mKey=v;store.set("gmkey",v);mOut={};store.set("gmout",mOut);$("mKeyIn").value="";S.ttsProv="gemini";saveS();aiReset("gemini");renderAI();
  mLoadModels().then(()=>{if(!mErr)speakVi(VOICE_TEST)})});
$("mDel").addEventListener("click",()=>{if(!window.confirm("Xoá key Gemini? Game sẽ dùng giọng của máy."))return;mKey="";mModels=null;store.set("gmkey","");aiReset("gemini");stopAudio();renderAI();voiceNote();toast("Đã xoá key")});
$("mModels").addEventListener("click",e=>{const b=e.target.closest("[data-mm]");if(!b)return;S.gmModel=b.getAttribute("data-mm");saveS();delete mOut[S.gmModel];store.set("gmout",mOut);aiReset("gemini");renderAI();voiceNote();speakVi(VOICE_TEST)});
$("mVoices").addEventListener("click",e=>{const b=e.target.closest("[data-mv]");if(!b)return;S.gmVoice=b.getAttribute("data-mv");saveS();aiReset("gemini");renderAI();voiceNote();speakVi(VOICE_TEST);
  const f=$("mVoices").querySelector('[aria-pressed="true"]');if(f)f.focus()});
$("gSave").addEventListener("click",()=>{const v=$("gKeyIn").value.trim();if(!v)return;gKey=v;store.set("gkey",v);$("gKeyIn").value="";S.ttsProv="google";saveS();aiReset("google");renderAI();
  gLoadVoices().then(()=>{if(!gErr)speakVi(VOICE_TEST)})});
$("gDel").addEventListener("click",()=>{if(!window.confirm("Xoá key Google Cloud? Game sẽ dùng giọng của máy."))return;gKey="";gVoices=null;store.set("gkey","");aiReset("google");stopAudio();renderAI();voiceNote();toast("Đã xoá key")});
$("gClear").addEventListener("click",()=>{Object.keys(gMem).forEach(k=>delete gMem[k]);idbClear().then(()=>toast("Đã xoá âm thanh đã lưu"))});
$("gVoices").addEventListener("click",e=>{const b=e.target.closest("[data-gv]");if(!b||!gVoices)return;const v=gVoices[+b.getAttribute("data-gv")];if(!v)return;
  S.gVoice=v.name;saveS();aiReset("google");renderAI();voiceNote();speakVi(VOICE_TEST);const f=$("gVoices").querySelector('[aria-pressed="true"]');if(f)f.focus()});
$("voiceTest").addEventListener("click",()=>speakVi(VOICE_TEST));
$("pReset").addEventListener("click",()=>{if(window.confirm("Xoá hết sao của bé? Bài tự tạo vẫn được giữ.")){prog={};store.set("prog",prog);updateTotals();applyCar();toast("Đã xoá sao")}});
$("gateOpts").addEventListener("click",e=>{const b=e.target.closest("[data-g]");if(!b)return;$("gate").classList.remove("show");
  if(+b.getAttribute("data-g")===gateAns&&gateCb){const cb=gateCb;gateCb=null;cb();return}
  if(+b.getAttribute("data-g")===gateAns){renderSettings();voiceNote();show("parent");renderVoices();renderAI();renderWeak();renderReport();if(mKey&&!mModels)mLoadModels();if(gKey&&!gVoices)gLoadVoices()}else toast("Chưa đúng — góc này dành cho bố mẹ nhé!")});
$("weakClear").addEventListener("click",()=>{if(window.confirm("Xoá danh sách từ khó của bé?")){clearWeak();toast("Đã xoá")}});
$("gateClose").addEventListener("click",()=>$("gate").classList.remove("show"));

/* ---------- điều khiển TV (remote) / bàn phím ----------
   Mũi tên: di chuyển giữa các nút theo vị trí · OK/Enter: bấm · Back/Esc: quay lại
   Số 1–9: chọn bài (màn chọn bài) hoặc chọn trò (trang chủ)
   Nút đỏ: micro · xanh lá: bố mẹ chấm đúng · vàng: nghe mẫu */
const DIRS={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],Left:[-1,0],Right:[1,0],Up:[0,-1],Down:[0,1]};
const KEYCODE_DIR={37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown"};
function focusables(){
  const root=$("gate").classList.contains("show")?$("gate"):document.querySelector(".over.show")||document;
  return Array.prototype.slice.call(root.querySelectorAll("button,summary,textarea,input")).filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length&&getComputedStyle(el).visibility!=="hidden");
}
function moveFocus(dx,dy){
  const list=focusables();if(!list.length)return;
  const cur=document.activeElement;
  if(list.indexOf(cur)<0){const p=document.querySelector(".over.show [data-primary], .over.show button")||document.querySelector(".screen.on [data-primary]:not([hidden])");(p&&list.indexOf(p)>=0?p:list[0]).focus();return}
  const r=cur.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let best=null,bestScore=Infinity;
  for(const el of list){
    if(el===cur)continue;
    const q=el.getBoundingClientRect(),ex=q.left+q.width/2-cx,ey=q.top+q.height/2-cy;
    const main=ex*dx+ey*dy;if(main<=4)continue;
    const score=main+Math.abs(dx?ey:ex)*2.5;
    if(score<bestScore){bestScore=score;best=el}
  }
  if(best){best.focus();best.scrollIntoView({block:"nearest"})}
}
document.addEventListener("keydown",e=>{
  const typing=e.target.tagName==="TEXTAREA"||e.target.tagName==="INPUT";
  if(typing){if(e.key==="Escape"){e.target.blur();if(screen==="editor")$("edSave").focus()}return}
  const key=DIRS[e.key]?e.key:KEYCODE_DIR[e.keyCode];
  if(key&&DIRS[key]){e.preventDefault();moveFocus(DIRS[key][0],DIRS[key][1]);return}
  if(e.key==="Escape"||e.key==="Backspace"||e.keyCode===10009||e.keyCode===461){e.preventDefault();back();return}
  if((e.key==="Enter"||e.keyCode===13)&&(document.activeElement===document.body||!document.activeElement)){e.preventDefault();moveFocus(0,0);return}
  if(/^[1-9]$/.test(e.key)){
    const n=+e.key-1;
    const L=MODE(curMode).src==="stories"?STORIES:lessons();
    if(screen==="pick"&&L[n]){startGame(L[n].id,curMode);return}
    const gs=MODE_GROUPS.filter(g=>g[2]===curSub);
    if(screen==="home"&&gs[n]){openGroup(gs[n][0]);return}   // trang chủ: số 1–4 mở nhóm trò
    const ms=grpModes(curGroup);if(screen==="group"&&ms[n]){openPick(ms[n].id);return}
  }
  if(screen==="play")switch(e.keyCode){
    case 403:if(!$("mic").hidden)$("mic").click();break;
    case 404:if(!$("ok").hidden)$("ok").click();break;
    case 405:if(!$("listen").hidden)$("listen").click();break;
  }
});

/* ---------- khởi động ---------- */
$("car").innerHTML=CAR_SVG;$("ghost").innerHTML=CAR_SVG+'<span class="gtag">👻</span>';
applyKidLook();applyCar();renderHome();
try{if(sessionStorage.getItem("ddc_hi")){sessionStorage.removeItem("ddc_hi");toast(`Chào ${KID.name||"bé"}! ${KID.av||""}`)}}catch(e){}   // vừa đổi bé (trang tải lại)
