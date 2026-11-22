/* voice.js — Giọng đọc mẫu: speakVi → nguồn bố mẹ chọn prov(): Gemini TTS (mKey, mFetch, mLoadModels) | Google Cloud TTS (gKey, gFetch, gLoadVoices) — chung aiAudio (cache bộ nhớ + IndexedDB), aiSpeak, aiPrefetch, aiFail, renderAI → dự phòng: giọng Claude → webSpeak (speechSynthesis, pickVoice, voiceNote). Chạy ngay khi nạp: loadVoices(). */
/* Nguồn giọng: S.ttsProv = "gemini" | "google" | "device". Chưa chọn thì tự dùng nguồn đã có key.
   Nguồn AI lỗi key, hoặc đang tạm hết lượt miễn phí → dùng giọng của máy cho tới khi sửa xong. */
const VOICE_TEST="cá, cà, cả, cã, cạ. Mẹ đưa bé đi chợ.";
const aiBad={};   // nguồn bị lỗi key/model → bỏ qua cho tới khi bố mẹ lưu key/chọn lại
function prov(){
  const want=S.ttsProv||(mKey?"gemini":gKey?"google":"device");
  if(want==="gemini"&&mKey&&!aiBad.gemini&&mModelEff())return "gemini";
  if(want==="google"&&gKey&&!aiBad.google)return "google";
  return "device";
}
function speakVi(w){
  if(!w)return;
  const go=()=>{
    const p=prov();
    if(p!=="device"){try{speechSynthesis.cancel()}catch(e){}aiSpeak(p,w).catch(e=>{aiFail(p,e);fallbackSpeak(w)});return}
    fallbackSpeak(w);
  };
  stopListen(go);
}
function fallbackSpeak(w){if(tts)tts.speak(w,{language:"vi",rate:.8}).catch(()=>webSpeak(w));else webSpeak(w)}

/* ---------- phần chung cho giọng AI: cache + phát qua AudioContext ----------
   Key chỉ lưu trong localStorage của máy này. Mỗi đoạn chữ chỉ gọi dịch vụ MỘT lần rồi lưu lại (bộ nhớ + IndexedDB).
   Phát qua AudioContext vì Safari chặn <audio>.play() khi âm thanh tải về xong sau cú bấm. */
let idbP=null,gCur=null,gSeq=0;
const gMem={},aiPend={};
function idbOpen(){
  /* IndexedDB có thể không có hoặc treo (Safari riêng tư, mở file://): quá 0,6 giây thì bỏ qua, chỉ lưu trong bộ nhớ */
  if(!idbP)idbP=new Promise(res=>{setTimeout(()=>res(null),600);try{const r=indexedDB.open("ddc_audio",1);r.onupgradeneeded=()=>r.result.createObjectStore("a");r.onsuccess=()=>res(r.result);r.onerror=()=>res(null);r.onblocked=()=>res(null)}catch(e){res(null)}});
  return idbP;
}
const idbGet=k=>idbOpen().then(db=>db?new Promise(res=>{try{const q=db.transaction("a").objectStore("a").get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null)}catch(e){res(null)}}):null);
const idbSet=(k,v)=>idbOpen().then(db=>{if(db)try{db.transaction("a","readwrite").objectStore("a").put(v,k)}catch(e){}});
const idbDel=k=>idbOpen().then(db=>{if(db)try{db.transaction("a","readwrite").objectStore("a").delete(k)}catch(e){}});
const idbClear=()=>idbOpen().then(db=>db?new Promise(res=>{try{const t=db.transaction("a","readwrite");t.objectStore("a").clear();t.oncomplete=res;t.onerror=res}catch(e){res()}}):null);
const aiVoiceId=p=>p==="gemini"?(mModelEff()||mModel())+"/"+mVoice()+"/p2":gVoiceName();   // "/p2": đổi khi sửa M_STYLE để bỏ âm thanh cũ đã lưu
/* trả về chuỗi âm thanh: MP3 base64 (Google Cloud) hoặc "pcm:<tần số>:<base64>" (Gemini) */
function aiAudio(p,text){
  const k=p+"|"+aiVoiceId(p)+"|"+text;
  if(gMem[k])return Promise.resolve(gMem[k]);
  if(aiPend[k])return aiPend[k];   // cùng một chữ đang chờ: dùng chung, không gọi hai lần
  /* Gemini hết lượt ở model này → đánh dấu và thử ngay model kế tiếp (mỗi model có hạn mức riêng) */
  const fetchIt=()=>p==="gemini"?mFetch(text).catch(e=>{if(e.status===429&&mMarkOut(e))return mFetch(text).catch(e2=>{if(e2.status===429&&mMarkOut(e2))return mFetch(text);throw e2});throw e}):gFetch(text);
  const pr=idbGet(k).then(v=>v||fetchIt().then(b=>{idbSet(k,b);aiOk(p);return b}))
    .then(b=>{gMem[k]=b;delete aiPend[k];return b},e=>{delete aiPend[k];throw e});
  aiPend[k]=pr;return pr;
}
function b64buf(b){const s=atob(b),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer}
/* PCM 16-bit → AudioBuffer; cắt khoảng lặng hai đầu. Cả đoạn im lặng → lỗi (Gemini đôi khi trả về như vậy) */
function pcmBuf(rate,b64){
  const raw=b64buf(b64),n=raw.byteLength>>1,dv=new DataView(raw),TH=.01;
  let a=0,z=n-1,peak=0;
  while(a<n&&Math.abs(dv.getInt16(a*2,true))/32768<TH)a++;
  while(z>a&&Math.abs(dv.getInt16(z*2,true))/32768<TH)z--;
  if(a>=n){const e=new Error("Gemini trả về âm thanh im lặng");e.silent=1;throw e}
  const pad=Math.floor(rate*.08);a=Math.max(0,a-pad);z=Math.min(n-1,z+pad);
  const buf=actx.createBuffer(1,z-a+1,rate),ch=buf.getChannelData(0);
  for(let i=a;i<=z;i++){const v=dv.getInt16(i*2,true)/32768;ch[i-a]=v;if(v>peak)peak=v;else if(-v>peak)peak=-v}
  buf._peak=peak;buf._full=n/rate;
  return buf;
}
function stopAudio(){gSeq++;if(gCur){try{gCur.stop()}catch(e){}gCur=null}}
/* Không bao giờ để bé chờ trong im lặng: giọng AI chưa có sau AI_WAIT ms → đọc ngay bằng giọng của máy,
   giọng AI vẫn tải tiếp và được lưu cho lần sau. */
const AI_WAIT=3500;
let aiDiag="";
function diag(t){aiDiag=t;const el=$("mDiag");if(el)el.textContent=t?"🔎 "+t:""}
function aiSpeak(p,text){
  stopAudio();const my=gSeq,t0=Date.now();let late=false;
  const cached=gMem[p+"|"+aiVoiceId(p)+"|"+text];
  const timer=cached?0:setTimeout(()=>{if(my!==gSeq)return;late=true;diag("Giọng AI chưa xong sau "+AI_WAIT/1000+" giây — tạm đọc bằng giọng máy, đang tải tiếp…");fallbackSpeak(text)},AI_WAIT);
  return aiAudio(p,text).then(b=>new Promise((res,rej)=>{
    clearTimeout(timer);
    const sec=((Date.now()-t0)/1000).toFixed(1);
    if(late){diag("Giọng AI đã tải xong sau "+sec+" giây và được lưu — lần sau đọc ngay.");return res()}
    if(my!==gSeq)return res();                     // đã có câu mới hơn, bỏ câu này
    unlockAudio();if(!actx)return rej(new Error("Máy không phát được âm thanh"));
    const play=buf=>{
      if(my!==gSeq)return res();
      const go=()=>{
        if(my!==gSeq)return res();
        if(actx.state!=="running"){   // Safari vẫn chặn bộ phát → đọc bằng giọng máy, không im lặng
          diag("Trình duyệt đang chặn âm thanh (bộ phát: "+actx.state+") — tạm đọc bằng giọng máy. Bấm vào trang một lần rồi thử lại.");
          fallbackSpeak(text);return res();
        }
        const src=actx.createBufferSource();src.buffer=buf;src.connect(actx.destination);
        src.onended=()=>{if(gCur===src)gCur=null;res()};gCur=src;src.start(0);
        diag((cached?"Đọc từ bộ nhớ":"Đã nhận giọng AI sau "+sec+" giây")+` · ${buf.duration.toFixed(1)} giây âm thanh`+(buf._full?` (gốc ${buf._full.toFixed(1)} giây)`:"")+(buf._peak!=null?` · độ lớn ${Math.round(buf._peak*100)}%`:"")+` · bộ phát: ${actx.state}`);
      };
      /* Safari có thể để bộ phát ở trạng thái "suspended"/"interrupted": phải resume() xong mới phát */
      if(actx.state!=="running"&&actx.resume){let done=0;const once=()=>{if(!done){done=1;go()}};actx.resume().then(once,once);setTimeout(once,400)}   // resume() đôi khi không bao giờ xong
      else go();
    };
    try{
      if(b.slice(0,4)==="pcm:"){const i=b.indexOf(":",4);
        try{play(pcmBuf(+b.slice(4,i)||24000,b.slice(i+1)))}
        catch(e){if(e.silent){const k=p+"|"+aiVoiceId(p)+"|"+text;delete gMem[k];idbDel(k)}throw e}
      }
      else actx.decodeAudioData(b64buf(b),play,()=>rej(new Error("Không giải mã được âm thanh")));
    }catch(e){rej(e)}
  }),e=>{clearTimeout(timer);diag("Lỗi: "+e.message);if(late){aiFail(p,e);return}throw e});
}
/* tải trước: Google Cloud thoải mái; Gemini miễn phí giới hạn số lần/phút nên chỉ tải trước 1–2 từ */
function aiPrefetch(list){
  const p=prov();if(p==="device")return;
  list=list.filter(Boolean);if(p==="gemini")list=list.slice(0,2);
  list.forEach((t,i)=>setTimeout(()=>aiAudio(p,t).catch(()=>{}),i*150));
}
function aiErrMsg(e){
  if(e.status===429){
    const why=e.limit0?`Model ${e.model} không có lượt miễn phí`:e.daily?`Model ${e.model} đã hết lượt miễn phí hôm nay`:`Model ${e.model||""} tạm hết lượt (thử lại sau ${e.retry||60} giây)`;
    const nx=mModelEff();
    return why+(nx?` — chuyển sang ${nx}.`:" — mọi model đều đang hết lượt, tạm dùng giọng của máy.");
  }
  if(e.status===400||e.status===401||e.status===403||e.status===404)return "Key hoặc model chưa dùng được: "+e.message;
  return "Chưa gọi được giọng AI ("+e.message+"). Tạm dùng giọng của máy.";
}
function aiFail(p,e){
  diag("Lỗi: "+e.message);
  const msg=aiErrMsg(e),auth=e.status===400||e.status===401||e.status===403||e.status===404;
  if(p==="gemini"){if(e.status===429)mMarkOut(e);mErr=aiErrMsg(e)}else gErr=msg;
  if(auth)aiBad[p]=1;
  if(!aiFail["shown_"+p]){aiFail["shown_"+p]=1;toast(e.status===429?"Hết lượt giọng AI miễn phí — tạm dùng giọng máy":"Giọng AI lỗi — tạm dùng giọng của máy")}
  voiceNote();if(screen==="parent")renderAI();
}
function aiOk(p){if(p==="gemini"){mErr="";voiceNote();if(screen==="parent")renderAI()}if(p==="google"&&gErr){gErr="";voiceNote()}}   // luôn vẽ lại: model có thể vừa được chuyển
function aiReset(p){delete aiBad[p];aiFail["shown_"+p]=0;if(p==="gemini")mErr="";else gErr=""}

/* ---------- Gemini TTS (Google AI Studio — có gói miễn phí, không cần thẻ) ----------
   Tên model đổi theo thời gian nên lấy danh sách model "tts" thật từ API (mLoadModels) thay vì ghi cứng. */
const GM="https://generativelanguage.googleapis.com/v1beta/";
let mKey=store.get("gmkey",""),mModels=null,mErr="",mQ=Promise.resolve();
let mOut=store.get("gmout",{});   // model → thời điểm hết "hết lượt" (lưu lại để lần sau không gọi phí)
const M_VOICES=[["Leda","nữ · trẻ trung"],["Aoede","nữ · nhẹ nhàng"],["Kore","nữ · rõ ràng"],["Sulafat","nữ · ấm áp"],["Puck","nam · vui tươi"],["Achird","nam · thân thiện"]];
const M_STYLE="Say slowly and clearly in Vietnamese, in a warm voice for a young child: ";   // mẫu "Say …: <chữ>" theo tài liệu Gemini TTS
const mModel=()=>S.gmModel||"gemini-2.5-flash-preview-tts";
/* model thực sự dùng: model bố mẹ chọn, nếu đang hết lượt thì model kế tiếp trong danh sách */
function mModelEff(){
  const now=Date.now(),list=[mModel()].concat(mModels||[]);
  for(const m of list)if(!(mOut[m]>now))return m;
  return null;
}
/* ghi nhận model hết lượt; trả về true nếu còn model khác để thử */
function mMarkOut(e){
  const m=e.model||mModel(),ms=e.limit0?864e5:e.daily?216e5:(e.retry||60)*1000;
  mOut[m]=Date.now()+ms;store.set("gmout",mOut);
  return !!mModelEff();
}
const mVoice=()=>S.gmVoice||"Leda";
/* fetch có giới hạn thời gian: một yêu cầu treo không được chặn cả hàng đợi */
function fetchT(url,opt,ms){
  const ac=window.AbortController?new AbortController():null;if(ac)opt.signal=ac.signal;
  return new Promise((res,rej)=>{
    const t=setTimeout(()=>{if(ac)ac.abort();const e=new Error("quá "+ms/1000+" giây không có phản hồi");e.status=408;rej(e)},ms);
    fetch(url,opt).then(r=>{clearTimeout(t);res(r)},e=>{clearTimeout(t);rej(e.status?e:new Error("không kết nối được ("+(e.message||e)+")"))});
  });
}
function mFetch(text){
  let model;
  const run=()=>(model=mModelEff()||mModel(),fetchT(GM+"models/"+model+":generateContent?key="+encodeURIComponent(mKey),{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({contents:[{parts:[{text:M_STYLE+text}]}],generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:mVoice()}}}}})},30000))
    .then(r=>r.json().catch(()=>({})).then(j=>{
      const parts=(((j.candidates||[])[0]||{}).content||{}).parts||[],part=parts.find(x=>x.inlineData&&x.inlineData.data);
      if(r.ok&&part){
        const mt=part.inlineData.mimeType||"";
        if(/wav|mpeg|mp3|ogg|aac|flac/i.test(mt))return part.inlineData.data;   // định dạng trình duyệt tự giải mã được
        const m=/rate=(\d+)/.exec(mt);return "pcm:"+(m?m[1]:24000)+":"+part.inlineData.data;   // mặc định: PCM 16-bit
      }
      const e=new Error((j.error&&j.error.message)||(r.ok?"không nhận được âm thanh":"HTTP "+r.status));e.status=r.status;e.model=model;
      if(r.status===429){   // đọc chi tiết hạn mức từ lỗi của Google
        const all=JSON.stringify(j.error||{});
        e.limit0=/limit:\s*0\b/.test(all);
        e.daily=/per.?day|PerDay|_per_day|RPD/i.test(all);
        const rd=/"retryDelay"\s*:\s*"(\d+)/.exec(all);if(rd)e.retry=+rd[1];
      }
      throw e;
    }));
  const pr=mQ.then(run,run);mQ=pr.catch(()=>{});return pr;   // gọi lần lượt, tránh vượt giới hạn số lần/phút
}
const mRank=n=>(/lite/i.test(n)?1:/pro/i.test(n)?2:0);
const mVer=n=>{const m=/(\d+(?:\.\d+)?)/.exec(n);return m?parseFloat(m[1]):0};
function mLoadModels(){
  if(!mKey)return Promise.resolve();
  return fetch(GM+"models?pageSize=200&key="+encodeURIComponent(mKey)).then(r=>r.json().then(j=>{
    if(!r.ok){const e=new Error((j.error&&j.error.message)||("HTTP "+r.status));e.status=r.status;throw e}
    mModels=(j.models||[]).filter(m=>/tts/i.test(m.name)&&(!m.supportedGenerationMethods||m.supportedGenerationMethods.indexOf("generateContent")>=0))
      .map(m=>m.name.replace(/^models\//,"")).sort((a,b)=>mRank(a)-mRank(b)||mVer(b)-mVer(a)||a.localeCompare(b));
    aiReset("gemini");
    if(mModels.length&&mModels.indexOf(S.gmModel)<0){S.gmModel=mModels[0];saveS()}
    if(!mModels.length){mErr="Key này chưa có model đọc (TTS) nào. Thử tạo key mới trên aistudio.google.com.";aiBad.gemini=1}
  })).catch(e=>{mModels=null;aiFail("gemini",e)}).then(()=>{voiceNote();if(screen==="parent")renderAI()});
}

/* ---------- Google Cloud Text-to-Speech (cần bật thanh toán, có hạn mức miễn phí) ---------- */
const GTTS="https://texttospeech.googleapis.com/v1/";
let gKey=store.get("gkey",""),gVoices=null,gErr="";
const gVoiceName=()=>S.gVoice||"vi-VN-Neural2-A";
function gFetch(text,noRate){
  const body={input:{text},voice:{languageCode:"vi-VN",name:gVoiceName()},audioConfig:{audioEncoding:"MP3"}};
  if(!noRate)body.audioConfig.speakingRate=.85;   // đọc chậm vừa cho bé
  return fetchT(GTTS+"text:synthesize?key="+encodeURIComponent(gKey),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)},20000)
    .then(r=>r.json().catch(()=>({})).then(j=>{
      if(r.ok&&j.audioContent)return j.audioContent;
      if(r.status===400&&!noRate&&/rate/i.test(JSON.stringify(j)))return gFetch(text,true);   // vài giọng (Chirp) không nhận speakingRate
      const e=new Error((j.error&&j.error.message)||("HTTP "+r.status));e.status=r.status;throw e;
    }));
}
const gRank=n=>/Chirp/i.test(n)?0:/Neural2/i.test(n)?1:/Wavenet/i.test(n)?2:3;
function gLoadVoices(){
  if(!gKey)return Promise.resolve();
  return fetch(GTTS+"voices?languageCode=vi-VN&key="+encodeURIComponent(gKey)).then(r=>r.json().then(j=>{
    if(!r.ok){const e=new Error((j.error&&j.error.message)||("HTTP "+r.status));e.status=r.status;throw e}
    gVoices=(j.voices||[]).filter(v=>(v.languageCodes||[]).indexOf("vi-VN")>=0).sort((a,b)=>gRank(a.name)-gRank(b.name)||a.name.localeCompare(b.name));
    aiReset("google");
    if(gVoices.length&&!gVoices.some(v=>v.name===S.gVoice)){const n2=gVoices.find(v=>/Neural2/.test(v.name)&&v.ssmlGender==="FEMALE")||gVoices[0];S.gVoice=n2.name;saveS()}
  })).catch(e=>{gVoices=null;aiFail("google",e)}).then(()=>{voiceNote();if(screen==="parent")renderAI()});
}

/* ---------- Góc bố mẹ: chọn nguồn giọng + cài đặt từng nguồn ---------- */
const PROVS=[["gemini","✨ Gemini (miễn phí)"],["google","Google Cloud"],["device","Giọng của máy"]];
function renderAI(){
  if(!$("tProv"))return;
  const sel=S.ttsProv||(mKey?"gemini":gKey?"google":"device"),seg=(attr,items,cur)=>`<div class="seg">${items.map(it=>`<button ${attr}="${esc(it[0])}" aria-pressed="${it[0]===cur}">${esc(it[1])}</button>`).join("")}</div>`;
  $("tProv").innerHTML=seg("data-prov",PROVS,sel);
  $("pGemini").hidden=sel!=="gemini";$("pGoogle").hidden=sel!=="google";$("pDevice").hidden=sel!=="device";
  // Gemini
  const ms=$("mStatus");ms.className=mErr?"warn":"note";
  const eff=mModelEff();
  ms.textContent=!mKey?"Chưa có key — đang dùng giọng của máy.":mErr||(eff?`✅ Đang dùng Gemini: giọng ${mVoice()} (${eff})`:"⚠️ Mọi model Gemini đang hết lượt — tạm dùng giọng của máy.");
  $("mKeyIn").placeholder=mKey?"Đã lưu key (…"+mKey.slice(-4)+") — dán key mới để thay":"Dán API key Gemini (AI Studio) vào đây";
  $("mDel").hidden=!mKey;diag(aiDiag);
  $("mModels").innerHTML=mKey&&mModels&&mModels.length>1?`<p class="note">Model:</p>`+seg("data-mm",mModels.map(m=>[m,m+(m===mModels[0]?" ⭐":"")+(mOut[m]>Date.now()?" · hết lượt đến "+new Date(mOut[m]).toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}):"")]),mModel()):"";
  $("mVoices").innerHTML=mKey?seg("data-mv",M_VOICES.map(v=>[v[0],v[0]+" · "+v[1]]),mVoice()):"";
  // Google Cloud
  const st=$("gStatus");st.className=gErr?"warn":"note";
  st.textContent=!gKey?"Chưa có key — đang dùng giọng của máy.":gErr||`✅ Đang dùng giọng Google: ${gVoiceName().replace("vi-VN-","")}`;
  $("gKeyIn").placeholder=gKey?"Đã lưu key (…"+gKey.slice(-4)+") — dán key mới để thay":"Dán API key Google Cloud vào đây";
  $("gDel").hidden=!gKey;
  $("gVoices").innerHTML=gKey&&gVoices&&gVoices.length?`<div class="seg">${gVoices.map((v,i)=>`<button data-gv="${i}" aria-pressed="${v.name===gVoiceName()}">${esc(v.name.replace("vi-VN-",""))} · ${v.ssmlGender==="FEMALE"?"nữ":v.ssmlGender==="MALE"?"nam":"—"}${gRank(v.name)<=1?" ⭐":""}</button>`).join("")}</div>`:"";
  $("gClear").hidden=!mKey&&!gKey;
}

/* ---------- Giọng của máy (speechSynthesis) ----------
   Safari/Chrome nạp danh sách giọng SAU khi trang chạy (getVoices() lúc đầu rỗng), nên phải nghe "voiceschanged"
   và chọn lại; nếu không sẽ đọc bằng giọng mặc định tiếng Anh → sai dấu. */
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
  const p=prov();
  if(p==="gemini"){el.textContent="🗣 Giọng đọc: Gemini "+mVoice()+" ("+mModelEff()+")";return}
  if(p==="google"){el.textContent="🗣 Giọng đọc: Google "+gVoiceName().replace("vi-VN-","");return}
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
