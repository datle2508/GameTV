/* viet.js — Âm tiết tiếng Việt cho trò Ghép vần / Dấu nào đây: syl(w) → {w, on (âm đầu), rh (vần, bỏ dấu thanh), t (chỉ số trong TONES), base (tiếng bỏ dấu thanh)}; withTone(on,rh,t) đặt dấu thanh đúng chỗ; picOf(w); rhymeChoices; onsetChoices. */
const VOWELS="aăâeêioôơuưy";
const TONE_RE=/[̣́̀̉̃]/g;

/* tách một tiếng: "trồng" → on "tr", rh "ông", t huyền, base "trông". Không phải một tiếng (có khoảng trắng) → null */
function syl(w){
  w=norm(w||"");if(!w||w.indexOf(" ")>=0)return null;
  const d=w.normalize("NFD");let t=0;
  for(let i=1;i<TONES.length;i++)if(d.indexOf(TONES[i].k)>=0){t=i;break}
  const base=d.replace(TONE_RE,"").normalize("NFC");
  let on="";
  for(const o of ONSETS)if(base.indexOf(o)===0&&base.length>o.length){on=o;break}
  /* "gin", "gìn": chữ i của "gi" cũng là âm chính → tách g + in */
  if(on==="gi"&&VOWELS.indexOf(base.charAt(2))<0)on="g";
  const rh=base.slice(on.length);
  if(!rh||!/[aăâeêioôơuưy]/.test(rh))return null;
  return {w,on,rh,t,base};
}

/* đặt dấu thanh (kiểu cũ, như sách lớp 1): nguyên âm có mũ/móc nhận dấu (ươ → ơ); vần có phụ âm cuối → nguyên âm cuối;
   vần 3 nguyên âm → nguyên âm giữa; vần 2 nguyên âm mở → nguyên âm đầu (hoà → hòa, túi, mía) */
function withTone(on,rh,t){
  if(!t)return on+rh;
  const ch=Array.from(rh),vi=[];
  ch.forEach((c,i)=>{if(VOWELS.indexOf(c)>=0)vi.push(i)});
  if(!vi.length)return on+rh;
  const hat=vi.filter(i=>"ăâêôơư".indexOf(ch[i])>=0);
  let p;
  if(hat.length)p=hat[hat.length-1];
  else if(vi.length===1)p=vi[0];
  else if(VOWELS.indexOf(ch[ch.length-1])<0)p=vi[vi.length-1];
  else if(vi.length===3)p=vi[1];
  else p=vi[0];
  ch[p]=(ch[p]+TONES[t].k).normalize("NFC");
  return on+ch.join("");
}

const picOf=w=>PICS[norm(w||"")]||"";

/* 3 lựa chọn âm đầu: đúng + 2 âm đầu khác (ưu tiên âm quen thuộc) */
function onsetChoices(on){
  return shuffle([on].concat(shuffle(ONSETS_EASY.filter(o=>o!==on)).slice(0,2)));
}
/* 3 lựa chọn vần: đúng + 2 vần gần giống (cùng chữ cái đầu, độ dài gần bằng) lấy từ bài + kho hình */
function rhymeChoices(rh,words){
  const pool={};
  words.concat(Object.keys(PICS)).forEach(w=>{const s=syl(w);if(s&&s.rh!==rh)pool[s.rh]=1});
  const cand=Object.keys(pool),sc={};
  cand.forEach(r=>{sc[r]=Math.abs(r.length-rh.length)+(fold(r)[0]===fold(rh)[0]?0:2)+Math.random()*2.5});
  cand.sort((a,b)=>sc[a]-sc[b]);
  return shuffle([rh].concat(cand.slice(0,2)));
}
