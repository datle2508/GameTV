/* data.js — Dữ liệu tĩnh: BUILTIN (bài mẫu), MODES (8 trò, chia nhóm MODE_GROUPS), PICS (từ → emoji), ONSETS/ONSETS_EASY (âm đầu), TONES (6 dấu), CARS (xe + mốc sao), ICONS, BALLOON, COMMON (từ nhiễu), PRAISE, STAR/CAR_SVG/FACE_SVG. */
/* =====================================================================
   DỮ LIỆU
   ===================================================================== */
const BUILTIN=[
 {id:"b1",icon:"🛒",t:"Bé đi chợ",x:"Mẹ đưa bé đi chợ. Chợ có cá, có cà, có rau. Bé vui lắm."},
 {id:"b2",icon:"🐥",t:"Gà con",x:"Gà con lon ton ra sân. Gà mẹ gọi cục cục. Gà con chạy về bên mẹ."},
 {id:"b3",icon:"🥬",t:"Vườn của bà",x:"Nhà bà có vườn rau. Bà trồng cải, trồng cà. Bé tưới rau cùng bà."},
 {id:"b4",icon:"🎒",t:"Bé đi học",x:"Sáng nay bé đi học. Cô giáo mỉm cười. Bé chào cô thật to."},
 {id:"b5",icon:"🌧️",t:"Trời mưa",x:"Trời đổ mưa to. Ếch kêu ộp ộp. Cây cối xanh tươi."},
 {id:"b6",icon:"🐱",t:"Con mèo",x:"Nhà em có con mèo. Mèo có bộ lông mềm. Mèo thích nằm sưởi nắng."},
 {id:"b7",icon:"🌊",t:"Đi biển",x:"Hè này bé đi biển. Sóng vỗ rì rào. Bé xây lâu đài cát."},
 {id:"b8",icon:"🎂",t:"Sinh nhật",x:"Hôm nay là sinh nhật bé. Mẹ mua bánh kem. Cả nhà hát mừng bé."}
];
/* thứ tự trong MODES = thứ tự trên trang chủ = phím số 1–8 trên remote. grp: "chu" (Học chữ) | "doc" (Đọc to).
   selfSay: trò tự đọc hướng dẫn kèm từ đầu tiên. noWeak: không hiện thẻ "Từ khó" (trò cần câu dài). */
const MODES=[
 {id:"picture",icon:"🖼️",name:"Nối chữ với hình",desc:"Đọc chữ rồi chọn đúng hình",say:"Bé đọc chữ rồi chọn hình đúng, hoặc nhìn hình rồi chọn chữ đúng nhé.",col:"#12a36f",grp:"chu"},
 {id:"spell",icon:"🧱",name:"Ghép vần",desc:"Ghép âm đầu, vần và dấu thành chữ",say:"Bé nghe máy đọc một tiếng, rồi chọn âm đầu, vần và dấu để ghép thành chữ nhé.",col:"#1595c4",grp:"chu",selfSay:1},
 {id:"tone",icon:"🎵",name:"Dấu nào đây?",desc:"Nghe rồi chọn chữ có dấu đúng",say:"Bé nghe máy đọc, rồi chọn chữ có dấu thanh đúng nhé.",col:"#c24bd6",grp:"chu",selfSay:1},
 {id:"balloon",icon:"🎈",name:"Bắt bóng chữ",desc:"Nghe từ rồi chạm đúng quả bóng",say:"Bé nghe máy đọc, rồi chạm vào quả bóng có từ đúng nhé.",col:"#e8457f",grp:"chu",selfSay:1},
 {id:"race",icon:"🏎️",name:"Đua từng từ",desc:"Đọc từng từ để xe chạy về đích",say:"Bé đọc to từng từ. Đọc đúng là xe chạy!",col:"#ff4d4d",grp:"doc"},
 {id:"sentence",icon:"🚂",name:"Đọc cả câu",desc:"Đọc trọn từng câu thật trơn tru",say:"Bé đọc to cả câu nhé. Đọc hết câu là xe chạy!",col:"#2d8cff",grp:"doc",noWeak:1},
 {id:"quick",icon:"⚡",name:"Đọc nhanh",desc:"Đọc từ trước khi hết giờ",say:"Từ hiện ra, bé đọc thật nhanh trước khi hết giờ nhé!",col:"#f08a00",grp:"doc"},
 {id:"fill",icon:"🧩",name:"Tìm từ còn thiếu",desc:"Chọn từ đúng rồi đọc cả câu",say:"Câu bị thiếu một từ. Bé chọn từ đúng, rồi đọc to cả câu nhé.",col:"#8a4de8",grp:"doc",noWeak:1}
];
const MODE_GROUPS=[["chu","🔤 Học chữ"],["doc","🎤 Đọc to"]];
/* Kho từ có hình (trò Nối chữ với hình) — vốn từ lớp 1, một tiếng; chỉ dùng emoji phổ biến (Unicode ≤ 11) để TV cũ hiện được.
   Mỗi emoji chỉ dùng cho một từ, để không có hai đáp án đúng. */
const PICS={
 "cá":"🐟","gà":"🐔","mèo":"🐱","chó":"🐶","bò":"🐄","lợn":"🐷","vịt":"🦆","chim":"🐦","ếch":"🐸","rùa":"🐢","thỏ":"🐰","voi":"🐘","khỉ":"🐒","hổ":"🐯","ong":"🐝","bướm":"🦋","kiến":"🐜","cua":"🦀","tôm":"🦐","ngựa":"🐴","dê":"🐐","cừu":"🐑","rắn":"🐍","gấu":"🐻","cú":"🦉",
 "hoa":"🌸","cây":"🌳","lá":"🍃","nấm":"🍄","rau":"🥬",
 "táo":"🍎","cam":"🍊","chuối":"🍌","nho":"🍇","dưa":"🍉","bánh":"🍰","kẹo":"🍬","sữa":"🥛","trứng":"🥚","cơm":"🍚","ngô":"🌽","dừa":"🥥","lê":"🍐","kem":"🍦","bún":"🍜",
 "mưa":"🌧️","nắng":"☀️","trăng":"🌙","sao":"⭐","mây":"☁️","biển":"🌊","núi":"⛰️","lửa":"🔥","cát":"🏖️",
 "nhà":"🏠","xe":"🚗","tàu":"🚂","thuyền":"⛵","ô":"☂️","mũ":"🧢","áo":"👕","giày":"👟","sách":"📖","bút":"✏️","cặp":"🎒","bóng":"⚽","đèn":"💡","kéo":"✂️","quà":"🎁","đàn":"🎸","trống":"🥁","đồng":"⏰",
 "mẹ":"👩","bố":"👨","bé":"👶","bà":"👵","ông":"👴","tay":"✋","mắt":"👀","tai":"👂","mũi":"👃","tim":"❤️"
};
/* âm đầu: dài trước ngắn sau để "ngh" không bị nhận nhầm thành "ng" */
const ONSETS=["ngh","ng","gh","gi","kh","nh","ph","th","tr","ch","qu","b","c","d","đ","g","h","k","l","m","n","p","r","s","t","v","x"];
const ONSETS_EASY=["b","c","d","đ","g","h","l","m","n","s","t","v","x","nh","ch","th","tr","ng","kh","ph"];
/* 6 dấu thanh: k = dấu kết hợp Unicode (NFD) */
const TONES=[{k:"",n:"ngang"},{k:"\u0301",n:"sắc"},{k:"\u0300",n:"huyền"},{k:"\u0309",n:"hỏi"},{k:"\u0303",n:"ngã"},{k:"\u0323",n:"nặng"}];
const CARS=[{c:"#ff4d4d",need:0},{c:"#2d8cff",need:0},{c:"#2fb35a",need:0},{c:"#ff9f1c",need:5},{c:"#b05cff",need:12},{c:"#ff5fa2",need:20},{c:"#14b8a6",need:30},{c:"#3a3f55",need:45}];
const ICONS=["📖","🐶","🐱","🐟","🐥","🦋","🌸","🌳","🌧️","☀️","🏠","🎒","🚗","🍎","🎂","⚽","🌊","🚀"];
const BALLOON=["#e8457f","#2d7be0","#8a4de8","#e07b00","#1f9e55","#d63a3a"];
const COMMON=["bé","mẹ","bố","bà","cá","gà","nhà","cây","hoa","xe","mèo","chó","sân","rau","mưa","nắng","cô","bàn"];
const PRAISE=["Giỏi quá!","Đúng rồi!","Tuyệt vời!","Xe chạy nè!","Hay lắm!","Siêu ghê!"];
const STAR="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z";
const CAR_SVG='<svg viewBox="0 0 140 80" aria-hidden="true"><path d="M8 56 Q6 40 22 36 L44 33 Q54 14 78 14 Q98 14 108 32 L126 36 Q136 40 134 56 Z" fill="currentColor"/><path d="M8 56 L134 56 Q134 62 128 62 L14 62 Q8 62 8 56Z" fill="rgba(0,0,0,.2)"/><path d="M52 34 Q60 20 76 20 Q92 20 100 34 Z" fill="#cdeeff"/><circle cx="74" cy="27" r="10" fill="#ffd9b0"/><path d="M63 26 Q64 14 74 14 Q85 14 85 26 Z" fill="#ffc928"/><circle cx="70" cy="28" r="1.8" fill="#222"/><circle cx="78" cy="28" r="1.8" fill="#222"/><path d="M70 32 Q74 35 78 32" stroke="#222" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="30" cy="46" r="8" fill="#fff"/><text x="30" y="50.5" font-size="12" font-weight="800" text-anchor="middle" fill="#222" font-family="Baloo 2">1</text><rect x="120" y="40" width="10" height="6" rx="3" fill="#fff7b0"/><g class="wheel"><circle cx="36" cy="62" r="13" fill="#222"/><circle cx="36" cy="62" r="6" fill="#ddd"/><rect x="34.5" y="51" width="3" height="22" fill="#999"/></g><g class="wheel"><circle cx="108" cy="62" r="13" fill="#222"/><circle cx="108" cy="62" r="6" fill="#ddd"/><rect x="106.5" y="51" width="3" height="22" fill="#999"/></g></svg>';
const FACE_SVG='<circle cx="30" cy="34" r="21" fill="#ffd9b0"/><path d="M8 33 Q9 8 30 8 Q51 8 52 33 Q41 22 30 22 Q19 22 8 33Z" fill="#ffc928"/><rect x="6" y="30" width="48" height="5" rx="2.5" fill="#ff4d4d"/><circle cx="23" cy="38" r="2.6" fill="#222"/><circle cx="37" cy="38" r="2.6" fill="#222"/><circle cx="18" cy="45" r="3.4" fill="#ff9fb0" opacity=".7"/><circle cx="42" cy="45" r="3.4" fill="#ff9fb0" opacity=".7"/><path d="M24 46 Q30 52 36 46" stroke="#222" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
