/* pack.js — Giọng thu sẵn: file mp3 tạo một lần bằng Google Cloud TTS (tools/make_audio.py), lưu ở audio/, danh sách trong packdata.js (PACK: chữ → tên file).
   packParts(text): cả câu có sẵn, hoặc mọi câu nhỏ (tách theo . ! ?) đều có sẵn → danh sách file; không thì null.
   packSpeak(text): tải + phát nối tiếp qua actx (Safari chặn <audio> sau thao tác bất đồng bộ); lỗi → speakVi dùng nguồn giọng cũ.
   packPhrases(): mọi câu cố định game có thể đọc — tools/phrases.html gọi để biết cần tạo file nào. */
/* khoá trong PACK = băm cyrb53 của chữ đã chuẩn hoá (để tên các bé không nằm dạng chữ trong repo công khai) — tools/make_audio.py tính giống hệt */
function cyrb53(str){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<str.length;i++){const ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507);h1^=Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507);h2^=Math.imul(h1^(h1>>>13),3266489909);
  return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
const packKey=t=>cyrb53(String(t).normalize("NFC").toLowerCase().replace(/\s+/g," ").trim());
const packChunks=t=>(String(t).match(/[^.!?]+[.!?]*/g)||[]).map(s=>s.replace(/\s+/g," ").trim()).filter(Boolean);
let packDead=false;   // mất mạng, không tải được file → thôi dùng cho tới khi tải lại trang
const packBuf={};     // tên file → AudioBuffer đã giải mã
/* đường dẫn tới audio/: bản nhiều file (trang có thẻ script nạp js/pack.js) nằm cạnh index.html; file gộp nằm ở thư mục cha html/ */
const PACK_BASE=document.querySelector('script[src$="js/pack.js"]')?"audio/":"duong-dua-chu/audio/";
/* t: chữ, hoặc mảng các đoạn (Toán: ["ba","cộng","hai","bằng mấy?"]) — có sẵn cả câu ghép thì dùng, không thì ghép từng đoạn */
function packParts(t){
  if(packDead||S.pack===false||typeof PACK==="undefined")return null;
  if(Array.isArray(t)){const w=PACK[packKey(t.join(" "))];if(w)return [w];const out=[];for(let i=0;i<t.length;i++){const r=packParts(t[i]);if(!r)return null;out.push.apply(out,r)}return out}
  const k=PACK[packKey(t)];if(k)return [k];
  const ch=packChunks(t);if(!ch.length)return null;
  const ids=ch.map(c=>PACK[packKey(c)]);
  return ids.every(Boolean)?ids:null;
}
function packLoad(id){
  if(packBuf[id])return Promise.resolve(packBuf[id]);
  return fetchT(PACK_BASE+id+".mp3",{},8000).then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.arrayBuffer()})
    .then(ab=>new Promise((ok,no)=>actx.decodeAudioData(ab,ok,()=>no(new Error("không giải mã được")))))
    .then(b=>packBuf[id]=packTrim(b));
}
/* cắt khoảng lặng hai đầu (chừa 40 ms) để các đoạn ghép nối nghe liền mạch */
function packTrim(b){
  try{
    const d=b.getChannelData(0),n=d.length,TH=.012;let a=0,z=n-1;
    while(a<n&&Math.abs(d[a])<TH)a++;while(z>a&&Math.abs(d[z])<TH)z--;
    const pad=Math.floor(b.sampleRate*.04);a=Math.max(0,a-pad);z=Math.min(n-1,z+pad);
    if(a>=z||z-a>=n-10)return b;
    const out=actx.createBuffer(b.numberOfChannels,z-a+1,b.sampleRate);
    for(let c=0;c<b.numberOfChannels;c++){const src=b.getChannelData(c),dst=out.getChannelData(c);for(let i=a;i<=z;i++)dst[i-a]=src[i]}
    return out;
  }catch(e){return b}
}
/* lỗi trả về e.stale = true nếu đã có câu mới hơn (khi đó KHÔNG đọc dự phòng, tránh chồng tiếng) */
function packSpeak(t){
  const ids=packParts(t);if(!ids)return Promise.reject(new Error("không có"));
  stopAudio();const my=gSeq;
  const fail=e=>{e.stale=my!==gSeq;if(!e.stale&&!navigator.onLine)packDead=true;throw e};
  if(location.protocol==="file:")return packPlayEl(ids,my).catch(fail);   // mở từ ổ đĩa: fetch bị chặn, dùng <audio>
  unlockAudio();if(!actx)return Promise.reject(new Error("không có actx"));
  return Promise.all(ids.map(packLoad)).then(bufs=>new Promise((res,rej)=>{
    if(my!==gSeq)return res();
    const go=()=>{
      if(my!==gSeq)return res();
      if(actx.state!=="running")return rej(new Error("bộ phát bị chặn"));
      let i=0;const next=()=>{
        if(my!==gSeq||i>=bufs.length){if(i>=bufs.length)gCur=null;return res()}
        const src=actx.createBufferSource();src.buffer=bufs[i++];src.connect(actx.destination);src.onended=next;gCur=src;src.start(0);
      };next();
    };
    if(actx.state!=="running"&&actx.resume){let d=0;const once=()=>{if(!d){d=1;go()}};actx.resume().then(once,once);setTimeout(once,400)}else go();
  })).catch(fail);
}
/* phát nối tiếp bằng <audio> (file://); trình duyệt chặn tự phát hoặc không tải được → lỗi để đọc dự phòng */
let packEl=null;
function packPlayEl(ids,my){
  return new Promise((res,rej)=>{
    let i=0;const next=()=>{
      if(my!==gSeq)return res();
      if(i>=ids.length){packEl=null;return res()}
      const a=new Audio(PACK_BASE+ids[i++]+".mp3");packEl=a;
      a.onended=next;a.onerror=()=>rej(new Error("không tải được âm thanh"));
      const p=a.play();if(p&&p.catch)p.catch(rej);
    };next();
  });
}

/* ---------- danh sách câu cần thu sẵn (chỉ dùng khi tạo file) ---------- */
function packPhrases(){
  const out=[],seen={};
  const add=t=>packChunks(t).forEach(c=>{const k=packKey(c);if(!seen[k]){seen[k]=1;out.push(c)}});
  const one=t=>{const k=packKey(t);if(t&&!seen[k]){seen[k]=1;out.push(t)}};   // giữ nguyên cả chuỗi (đánh vần có dấu phẩy)
  add("cá, cà, cả, cã, cạ. Mẹ đưa bé đi chợ.");
  MODES.forEach(m=>add(m.say));
  ["Chào bé! Hôm nay mình chơi trò gì nào?","Bé chạm vào một trò để chơi nhé.","Bé chọn một bài nhé.","Hoàn thành!","Giỏi lắm!","Xuất sắc!",
   "Hoà rồi! Cả hai đều giỏi!","Về đích giải đua!","Hết giờ chơi rồi, bé ơi!","Mai mình chơi tiếp nhé.","Bạn khách thắng rồi!"].forEach(add);
  /* tên gợi ý + tên riêng của các bé (tools/phrases.html?names=… do make_audio.py truyền vào, đọc từ ~/.config/gametv/names): chào, nhắc, kết quả, chơi đôi, hết giờ */
  const extra=(/[?&]names=([^&]*)/.exec(location.search)||[])[1];
  NAMES_B.concat(NAMES_G,extra?decodeURIComponent(extra).split(",").filter(Boolean):[]).forEach(n=>[`Chào ${n}!`,`${n} chạm vào một trò để chơi nhé.`,`${n} chọn một bài nhé.`,`Hoàn thành, ${n}!`,`Giỏi lắm, ${n}!`,`Xuất sắc, ${n}!`,`${n} thắng rồi!`,`Hết giờ chơi rồi, ${n} ơi!`].forEach(add));
  /* bài mẫu: từng từ, từng câu, đánh vần, vần cho trò Săn vần */
  const words={};
  BUILTIN.forEach(L=>{const P=parse(L.x);P.sents.forEach(s=>add(s.text));P.words.forEach(w=>{words[w.c]=1;words[w.n]=1})});
  Object.keys(PICS).forEach(w=>words[w]=1);
  STORIES.forEach(st=>{st.pages.forEach(p=>{add(p[1]);parse(p[1]).words.forEach(w=>{words[w.c]=1;words[w.n]=1})});add(st.q[0]);st.q[1].forEach(one)});
  Object.keys(words).forEach(w=>{one(w);const s=syl(w);if(s){one(spellOut(s));if(s.rh){one("Tìm các tiếng có vần "+s.rh);one("vần "+s.rh)}}});
  STATEMENTS.forEach(x=>add(x.s));
  RIDDLES.forEach(r=>add(r[0]));TOPICS.forEach(t=>add("Đâu là "+t.n+"?"));
  /* chữ cái: âm, "Chữ nào là …?", âm + từ ví dụ */
  LETTERS.forEach(L=>{one(L[1]);add("Chữ nào là "+L[1]+"?");
    Object.keys(PICS).forEach(w=>{const s=syl(w);if(s&&(VOWELS.indexOf(L[0])>=0?!s.on&&noTone(s.rh).charAt(0)===L[0]:s.on===L[0]))one(L[1]+", "+w)})});
  /* Toán: số 0–100, câu hỏi; phép tính ≤ 10 đọc cả câu, số lớn hơn thì ghép từng đoạn (số + "cộng" + số + "bằng mấy?") */
  ["cộng","trừ","bằng mấy?","bằng","và","lớn hơn","bé hơn","mấy","Số nào còn thiếu?","Hình này là hình gì?"].forEach(one);
  for(let n=0;n<=100;n++){one(numVi(n));one("Tìm số "+numVi(n))}
  COUNTABLES.forEach(o=>{one("Có bao nhiêu "+o[1]+"?");for(let n=1;n<=20;n++)one(`Có ${numVi(n)} ${o[1]}.`)});
  for(let n=0;n<=100;n++)one(`Số ${numVi(n)}.`);
  SHAPES.forEach(x=>{one(x[1]);one("Đâu là "+x[1]+"?");one(`Đây là ${x[1]}.`)});
  WORDPROBS.forEach(p=>one(`Đáp số là ${numVi(p[3])}.`));
  for(let a=0;a<=10;a++)for(let b=0;b<=10;b++){
    if(a+b<=10){one(opSay({a,b,op:"+"}).join(" "));one(opDone({a,b,op:"+",r:a+b}).join(" "))}
    if(b<=a){one(opSay({a,b,op:"-"}).join(" "));one(opDone({a,b,op:"-",r:a-b}).join(" "))}
    one(numVi(a)+" và "+numVi(b));one(numVi(a)+" "+(a>b?"lớn hơn":a<b?"bé hơn":"bằng")+" "+numVi(b));
  }
  WORDPROBS.forEach(p=>add(p[2]));
  return out;
}
