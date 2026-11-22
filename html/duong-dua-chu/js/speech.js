/* speech.js — Micro (nghe bé đọc): listening, mode (dict|native|manual), setMode, setListening, startListen, stopListen; claude dictation → SpeechRecognition vi-VN → bố mẹ chấm. Chạy ngay khi nạp: setMode(), claude.use(). */
/* =====================================================================
   GIỌNG NÓI: claude dictation → nhận giọng vi-VN của trình duyệt → bố mẹ chấm
   ===================================================================== */
let listening=false,mode="manual",dict=null,rec=null,tts=null;
function setMode(m){
  mode=m;
  const t=m==="dict"?"Micro: sẵn sàng":m==="native"?"Micro: tiếng Việt (vi-VN)":"Chế độ bố mẹ chấm (máy này chưa dùng được micro)";
  $("micmode").textContent=t;$("pMic").textContent=t;
  if(G.ctrl)ctrl(G.ctrl);
}
function setListening(on){
  listening=on;$("mic").classList.toggle("on",on);$("mic").setAttribute("aria-label",on?"Tắt micro":"Bật micro để đọc");
  if(on&&screen==="play"&&!G.over)say("Micro đang nghe… Bé đọc đi!");
}
function micFail(){setListening(false);if(mode==="dict"&&SR){setMode("native")}else setMode("manual")}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
/* dictation: "not_granted"/"unavailable" là hỏng hẳn → hạ xuống cách sau; còn lại chỉ tắt micro, cho bấm lại */
const DICT_FATAL=["not_granted","unavailable","invalid_argument","no_gesture"];
const DICT_MSG={rate_limited:"Micro đang bận, bé thử lại sau giây lát nhé!",upstream_error:"Micro gặp trục trặc, bé bấm lại nhé!",time_limit:"Micro nghỉ rồi, bấm để đọc tiếp nhé!",hidden:"Bấm 🎤 để đọc tiếp nhé!",viewer_stopped:"Bấm 🎤 để đọc tiếp nhé!"};
function dictEnd(code){
  if(mode!=="dict")return;
  if(DICT_FATAL.indexOf(code)>=0){micFail();return}
  setListening(false);
  if(code&&code!=="stopped"&&code!=="dismissed"&&screen==="play"&&!G.over)say(DICT_MSG[code]||DICT_MSG.upstream_error);
}
let restarts=0,netDown=false;
function startListen(){
  startClock();G.base=G.ri;stale=false;restarts=0;netDown=false;
  /* tắt giọng hướng dẫn đang đọc, kẻo micro nghe nhầm giọng máy (vd. chữ "bé") thành bé đọc */
  try{speechSynthesis.cancel()}catch(e){}
  if(tts&&tts.stop)try{tts.stop()}catch(e){}
  stopAudio();
  if(mode==="dict"){
    setListening(true);
    /* phải gọi đồng bộ ngay trong cú bấm; luôn chỉ định tiếng Việt */
    dict.start({language:"vi"}).catch(e=>dictEnd(e&&e.code));
  }else if(mode==="native"){
    if(!rec){
      rec=new SR();rec.lang="vi-VN";rec.continuous=true;rec.interimResults=true;
      rec.onresult=e=>{restarts=0;let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)heard(r[0].transcript,true);else interim+=r[0].transcript+" "}if(interim)heard(interim,false)};
      rec.onerror=e=>{
        if(["not-allowed","service-not-allowed","audio-capture","language-not-supported"].indexOf(e.error)>=0){listening=false;micFail()}
        else if(e.error==="network")netDown=true;
      };
      /* Chrome tự ngắt sau một lúc im lặng → bật lại; mất mạng hoặc ngắt liên tục thì dừng */
      rec.onend=()=>{
        if(!listening)return;
        if(netDown){setListening(false);if(screen==="play")say("Mất mạng nên micro chưa nghe được. Bố mẹ bấm ✔️ giúp bé nhé!");return}
        if(++restarts>5){setListening(false);if(screen==="play")say("Micro tạm nghỉ, bấm 🎤 để đọc tiếp nhé!");return}
        try{rec.start()}catch(e){setListening(false)}
      };
    }
    try{rec.start();setListening(true)}catch(e){micFail()}
  }
}
function stopListen(after){
  const done=()=>{if(after)after()};
  const was=listening;setListening(false);if(!was){done();return}
  if(mode==="dict")dict.stop().catch(()=>{}).then(done);   // stop() xong mới hết "bận", lúc đó mới đọc mẫu được
  else{if(rec)try{rec.stop()}catch(e){}done()}
  if(screen==="play"&&!G.over&&G.R.length)say("Bấm 🎤 để đọc tiếp nhé!");
}
setMode(SR?"native":"manual");
if(window.claude&&claude.use){
  claude.use("dictation").then(d=>{if(d){dict=d;
    d.onPartial(({text})=>heard(text,false));     // mỗi lần THAY kết quả tạm trước; "" khi cụm đã chốt
    d.onFinal(({text})=>heard(text,true));        // một cụm đã chốt, riêng rẽ
    d.onState(({state,reason})=>{if(state==="listening")setListening(true);else if(state==="idle"&&listening)dictEnd(reason)});
    setMode("dict")}}).catch(()=>{});
  claude.use("tts").then(t=>{if(t){tts=t;voiceNote()}}).catch(()=>{});
}
