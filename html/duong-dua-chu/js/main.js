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
$("heroSay").addEventListener("click",()=>speakVi($("heroMsg").textContent+" Bé chạm vào một trò để chơi nhé."));
$("pickSay").addEventListener("click",()=>speakVi(MODE(curMode).say+" Bé chọn một bài nhé."));
document.querySelectorAll("[data-back]").forEach(b=>b.addEventListener("click",back));
$("modes").addEventListener("click",e=>{const b=e.target.closest("[data-m]");if(b)openPick(b.getAttribute("data-m"))});
$("lessonGrid").addEventListener("click",e=>{
  const ed=e.target.closest("[data-e]");if(ed){openEditor(ed.getAttribute("data-e"));return}
  if(e.target.closest("#addLesson")){openEditor();return}
  const b=e.target.closest("[data-l]");if(b)startGame(b.getAttribute("data-l"),curMode);
});
$("stageBody").addEventListener("click",e=>{
  if(e.target.closest("#qgo")){IMPL.quick.begin();return}
  const bl=e.target.closest("[data-b]");if(bl&&G.mode==="balloon"){IMPL.balloon.tap(+bl.getAttribute("data-b"),bl);return}
  const ch=e.target.closest("[data-c]");if(ch&&G.mode==="fill")IMPL.fill.pick(+ch.getAttribute("data-c"),ch);
});
$("mic").addEventListener("click",()=>{if(listening)stopListen();else startListen()});
$("ok").addEventListener("click",()=>{if(!G.over)IMPL_().ok()});
$("listen").addEventListener("click",()=>{if(!G.over){const t=IMPL_().sample();if(t)speakVi(t)}});
$("again").addEventListener("click",()=>startGame(G.lesson.id,G.mode));
$("next").addEventListener("click",()=>{const L=lessons(),i=L.findIndex(l=>l.id===G.lesson.id);startGame(L[(i+1)%L.length].id,G.mode)});
$("toHome").addEventListener("click",()=>show("home"));
$("edText").addEventListener("input",edPreview);
$("edIcons").addEventListener("click",e=>{const b=e.target.closest("[data-ic]");if(b){edIcon=b.getAttribute("data-ic");renderIcons();$("edIcons").querySelector('[aria-pressed="true"]').focus()}});
$("edSave").addEventListener("click",edSave);
$("edDel").addEventListener("click",edDelete);
$("edHear").addEventListener("click",()=>{const x=$("edText").value.trim();if(x)speakVi(x)});
$("garageGrid").addEventListener("click",e=>{const b=e.target.closest("[data-car]");if(b&&!b.disabled){store.set("car",+b.getAttribute("data-car"));renderGarage();toast("Đã đổi xe 🚗")}});
$("settings").addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(!b)return;S[b.getAttribute("data-k")]=JSON.parse(b.getAttribute("data-v"));saveS();renderSettings();const f=$("settings").querySelector(`[data-k="${b.getAttribute("data-k")}"][aria-pressed="true"]`);if(f)f.focus()});
$("voices").addEventListener("click",e=>{const b=e.target.closest("[data-voice]");if(!b)return;
  let vs=[];try{vs=speechSynthesis.getVoices().filter(v=>/^vi([-_]|$)/i.test(v.lang))}catch(er){}
  const v=vs[+b.getAttribute("data-voice")];if(!v)return;
  S.voiceName=v.name;saveS();viVoice=v;voiceNote();renderVoices();webSpeak(VOICE_TEST);
  const f=$("voices").querySelector('[aria-pressed="true"]');if(f)f.focus()});
$("gSave").addEventListener("click",()=>{const v=$("gKeyIn").value.trim();if(!v)return;gKey=v;store.set("gkey",v);$("gKeyIn").value="";gErr="";gFail.shown=0;renderG();
  gLoadVoices().then(()=>{if(!gErr)speakVi(VOICE_TEST)})});
$("gDel").addEventListener("click",()=>{if(!window.confirm("Xoá key Google? Game sẽ dùng giọng của máy."))return;gKey="";gVoices=null;gErr="";store.set("gkey","");stopAudio();renderG();voiceNote();toast("Đã xoá key")});
$("gClear").addEventListener("click",()=>{Object.keys(gMem).forEach(k=>delete gMem[k]);idbClear().then(()=>toast("Đã xoá âm thanh đã lưu"))});
$("gVoices").addEventListener("click",e=>{const b=e.target.closest("[data-gv]");if(!b||!gVoices)return;const v=gVoices[+b.getAttribute("data-gv")];if(!v)return;
  S.gVoice=v.name;saveS();gErr="";renderG();voiceNote();speakVi(VOICE_TEST);const f=$("gVoices").querySelector('[aria-pressed="true"]');if(f)f.focus()});
$("voiceTest").addEventListener("click",()=>speakVi(VOICE_TEST));
$("pReset").addEventListener("click",()=>{if(window.confirm("Xoá hết sao của bé? Bài tự tạo vẫn được giữ.")){prog={};store.set("prog",prog);updateTotals();applyCar();toast("Đã xoá sao")}});
$("gateOpts").addEventListener("click",e=>{const b=e.target.closest("[data-g]");if(!b)return;$("gate").classList.remove("show");
  if(+b.getAttribute("data-g")===gateAns){renderSettings();voiceNote();show("parent");renderVoices();renderG();if(gKey&&!gVoices)gLoadVoices()}else toast("Chưa đúng — góc này dành cho bố mẹ nhé!")});
$("gateClose").addEventListener("click",()=>$("gate").classList.remove("show"));

/* ---------- điều khiển TV (remote) / bàn phím ----------
   Mũi tên: di chuyển giữa các nút theo vị trí · OK/Enter: bấm · Back/Esc: quay lại
   Số 1–9: chọn bài (màn chọn bài) hoặc chọn trò (trang chủ)
   Nút đỏ: micro · xanh lá: bố mẹ chấm đúng · vàng: nghe mẫu */
const DIRS={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1],Left:[-1,0],Right:[1,0],Up:[0,-1],Down:[0,1]};
const KEYCODE_DIR={37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown"};
function focusables(){
  const root=$("gate").classList.contains("show")?$("gate"):$("over").classList.contains("show")?$("over"):document;
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
    if(screen==="pick"&&lessons()[n]){startGame(lessons()[n].id,curMode);return}
    if(screen==="home"&&MODES[n]){openPick(MODES[n].id);return}
  }
  if(screen==="play")switch(e.keyCode){
    case 403:if(!$("mic").hidden)$("mic").click();break;
    case 404:if(!$("ok").hidden)$("ok").click();break;
    case 405:if(!$("listen").hidden)$("listen").click();break;
  }
});

/* ---------- khởi động ---------- */
$("car").innerHTML=CAR_SVG;
$("buddyHome").innerHTML=FACE_SVG;$("buddyPlay").innerHTML=FACE_SVG;
applyCar();renderHome();
