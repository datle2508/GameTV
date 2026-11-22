/* voice.js — Giọng đọc mẫu: speakVi → Google Cloud TTS (gKey, gSpeak, gAudio, cache IndexedDB, gLoadVoices, renderG) → giọng Claude → webSpeak (speechSynthesis, pickVoice, voiceNote). Chạy ngay khi nạp: loadVoices(). */
/* thứ tự: giọng AI Google (nếu bố mẹ đã nhập key) → giọng Claude → giọng của máy */
function speakVi(w){
  if(!w)return;
  const go=()=>{
    if(gKey){try{speechSynthesis.cancel()}catch(e){}gSpeak(w).catch(e=>{gFail(e);fallbackSpeak(w)});return}
    fallbackSpeak(w);
  };
  stopListen(go);
}
function fallbackSpeak(w){if(tts)tts.speak(w,{language:"vi",rate:.8}).catch(()=>webSpeak(w));else webSpeak(w)}

/* ---------- Giọng AI Google Cloud Text-to-Speech ----------
   Key chỉ lưu trong localStorage của máy này. Mỗi đoạn chữ chỉ gọi Google MỘT lần rồi lưu âm thanh vào
   IndexedDB (lần sau phát ngay, không cần mạng). Phát qua AudioContext vì Safari chặn <audio>.play()
   khi âm thanh tải về xong sau cú bấm. */
const GTTS="https://texttospeech.googleapis.com/v1/";
let gKey=store.get("gkey",""),gVoices=null,gErr="",gCur=null,gSeq=0;
const gMem={};
let idbP=null;
function idbOpen(){
  /* IndexedDB có thể không có hoặc treo (Safari riêng tư, mở file://): quá 0,6 giây thì bỏ qua, chỉ lưu trong bộ nhớ */
  if(!idbP)idbP=new Promise(res=>{setTimeout(()=>res(null),600);try{const r=indexedDB.open("ddc_audio",1);r.onupgradeneeded=()=>r.result.createObjectStore("a");r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null)}catch(e){res(null)}});
  return idbP;
}
const idbGet=k=>idbOpen().then(db=>db?new Promise(res=>{try{const q=db.transaction("a").objectStore("a").get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)}catch(e){res(null)}}):null);
const idbSet=(k,v)=>idbOpen().then(db=>{if(db)try{db.transaction("a","readwrite").objectStore("a").put(v,k)}catch(e){}});
const idbClear=()=>idbOpen().then(db=>db?new Promise(res=>{try{const t=db.transaction("a","readwrite");t.objectStore("a").clear();t.oncomplete=res;t.onerror=res}catch(e){res()}}):null);
const gVoiceName=()=>S.gVoice||"vi-VN-Neural2-A";
function gFetch(text,noRate){
  const body={input:{text},voice:{languageCode:"vi-VN",name:gVoiceName()},audioConfig:{audioEncoding:"MP3"}};
  if(!noRate)body.audioConfig.speakingRate=.85;   // đọc chậm vừa cho bé
  return fetch(GTTS+"text:synthesize?key="+encodeURIComponent(gKey),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
    .then(r=>r.json().catch(()=>({})).then(j=>{
      if(r.ok&&j.audioContent)return j.audioContent;
      if(r.status===400&&!noRate&&/rate/i.test(JSON.stringify(j)))return gFetch(text,true);   // vài giọng (Chirp) không nhận speakingRate
      const e=new Error((j.error&&j.error.message)||("HTTP "+r.status));e.status=r.status;throw e;
    }));
}
const gPend={};   // yêu cầu đang chờ: cùng một chữ thì dùng chung, không gọi Google hai lần
function gAudio(text){
  const k=gVoiceName()+"|"+text;
  if(gMem[k])return Promise.resolve(gMem[k]);
  if(gPend[k])return gPend[k];
  const p=idbGet(k).then(v=>v||gFetch(text).then(b=>{idbSet(k,b);return b})).then(b=>{gMem[k]=b;delete gPend[k];return b},e=>{delete gPend[k];throw e});
  gPend[k]=p;return p;
}
function b64buf(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer}
function stopAudio(){gSeq++;if(gCur){try{gCur.stop()}catch(e){}gCur=null}}
function gSpeak(text){
  stopAudio();const my=gSeq;
  return gAudio(text).then(b=>new Promise((res,rej)=>{
    if(my!==gSeq)return res();                     // đã có câu mới hơn, bỏ câu này
    unlockAudio();if(!actx)return rej(new Error("Máy không phát được âm thanh"));
    actx.decodeAudioData(b64buf(b),buf=>{
      if(my!==gSeq)return res();
      const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);
      src.onended=()=>{if(gCur===src)gCur=null;res()};gCur=src;src.start(0);
    },()=>rej(new Error("Không giải mã được âm thanh")));
  }));
}
function gPrefetch(list){if(gKey&&!gErr)list.forEach((t,i)=>setTimeout(()=>gAudio(t).catch(()=>{}),i*150))}
function gFail(e){
  gErr=(e.status===400||e.status===401||e.status===403)?"Key Google chưa dùng được: "+e.message:"Chưa gọi được giọng Google ("+e.message+"). Tạm dùng giọng của máy.";
  if(!gFail.shown){gFail.shown=1;toast("Giọng Google lỗi — tạm dùng giọng của máy")}
  voiceNote();if(screen==="parent")renderG();
}
const gRank=n=>/Chirp/i.test(n)?0:/Neural2/i.test(n)?1:/Wavenet/i.test(n)?2:3;
function gLoadVoices(){
  if(!gKey)return Promise.resolve();
  return fetch(GTTS+"voices?languageCode=vi-VN&key="+encodeURIComponent(gKey)).then(r=>r.json().then(j=>{
    if(!r.ok){const e=new Error((j.error&&j.error.message)||("HTTP "+r.status));e.status=r.status;throw e}
    gVoices=(j.voices||[]).filter(v=>(v.languageCodes||[]).indexOf("vi-VN")>=0).sort((a,b)=>gRank(a.name)-gRank(b.name)||a.name.localeCompare(b.name));
    gErr="";gFail.shown=0;
    if(gVoices.length&&!gVoices.some(v=>v.name===S.gVoice)){const n2=gVoices.find(v=>/Neural2/.test(v.name)&&v.ssmlGender==="FEMALE")||gVoices[0];S.gVoice=n2.name;saveS()}
  })).catch(e=>{gVoices=null;gFail(e)}).then(()=>{voiceNote();if(screen==="parent")renderG()});
}
function renderG(){
  const st=$("gStatus");if(!st)return;
  st.className=gErr?"warn":"note";
  st.textContent=!gKey?"Chưa có key — đang dùng giọng của máy.":gErr?gErr:`✅ Đang dùng giọng Google: ${gVoiceName().replace("vi-VN-","")}`;
  $("gKeyIn").placeholder=gKey?"Đã lưu key (…"+gKey.slice(-4)+") — dán key mới để thay":"Dán API key Google Cloud vào đây";
  $("gDel").hidden=!gKey;$("gClear").hidden=!gKey;
  $("gVoices").innerHTML=gKey&&gVoices&&gVoices.length?`<div class="seg">${gVoices.map((v,i)=>`<button data-gv="${i}" aria-pressed="${v.name===gVoiceName()}">${esc(v.name.replace("vi-VN-",""))} · ${v.ssmlGender==="FEMALE"?"nữ":v.ssmlGender==="MALE"?"nam":"—"}${gRank(v.name)<=1?" ⭐":""}</button>`).join("")}</div>`:"";
}
/* Giọng đọc của trình duyệt. Safari/Chrome nạp danh sách giọng SAU khi trang chạy (getVoices() lúc đầu rỗng),
   nên phải nghe "voiceschanged" và chọn lại; nếu không sẽ đọc bằng giọng mặc định tiếng Anh → sai dấu. */
let viVoice=null,lastUtter=null;
function pickVoice(){
  try{
    const vs=speechSynthesis.getVoices().filter(v=>/^vi([-_]|$)/i.test(v.lang));
    if(!vs.length)return null;
    const chosen=S.voiceName&&vs.find(v=>v.name===S.voiceName);if(chosen)return chosen;   // bố mẹ đã chọn giọng
    const sc=v=>(/natural|neural|online|premium|enhanced/i.test(v.name)?4:0)+(/^vi[-_]vn$/i.test(v.lang)?2:0)+(v.localService?1:0);
    vs.sort((a,b)=>sc(b)-sc(a));return vs[0];
  }catch(e){return null}
}
function loadVoices(){const v=pickVoice();if(v)viVoice=v;voiceNote();if(screen==="parent")renderVoices()}
function voiceNote(){
  const el=$("pVoice");if(!el)return;
  if(gKey&&!gErr){el.textContent="🗣 Giọng đọc: Google "+gVoiceName().replace("vi-VN-","");return}
  el.textContent=tts?"🗣 Giọng đọc: giọng Claude (tiếng Việt)":viVoice?`🗣 Giọng đọc: ${viVoice.name} (${viVoice.lang})`:"⚠️ Máy chưa có giọng đọc tiếng Việt — xem hướng dẫn bên dưới.";
}
try{loadVoices();if(speechSynthesis.addEventListener)speechSynthesis.addEventListener("voiceschanged",loadVoices);else speechSynthesis.onvoiceschanged=loadVoices}catch(e){}
function webSpeak(w,tries){
  tries=tries||0;if(!tries)stopAudio();
  try{
    if(!viVoice)loadVoices();
    if(!viVoice&&tries<6){setTimeout(()=>webSpeak(w,tries+1),200);return}   // danh sách giọng chưa nạp xong: đợi tối đa ~1,2 giây
    if(!viVoice&&screen==="play")say("Máy chưa có giọng tiếng Việt, bố mẹ đọc giúp bé nhé.");
    const u=new SpeechSynthesisUtterance(w);u.lang="vi-VN";u.rate=.8;if(viVoice)u.voice=viVoice;
    lastUtter=u;   // giữ tham chiếu, kẻo Safari/Chrome thu hồi giữa chừng
    if(speechSynthesis.speaking||speechSynthesis.pending){speechSynthesis.cancel();setTimeout(()=>speechSynthesis.speak(u),80)}   // Safari hay nuốt câu nói ngay sau cancel()
    else speechSynthesis.speak(u);
  }catch(e){if(screen==="play")say("Máy này chưa đọc được, bố mẹ đọc giúp bé nhé.")}
}
