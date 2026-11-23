/* data.js — Dữ liệu tĩnh: BUILTIN (bài mẫu), MODES (14 trò, chia nhóm MODE_GROUPS), STATEMENTS (câu đúng/sai), STORIES (truyện tranh), PICS (từ → emoji), ONSETS/ONSETS_EASY (âm đầu), TONES (6 dấu), CARS (xe + mốc sao), ICONS, BALLOON, COMMON (từ nhiễu), PRAISE, STAR/CAR_SVG/FACE_SVG. */
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
/* thứ tự trong MODES = thứ tự trên trang chủ = phím số 1–9 trên remote. grp: nhóm trong MODE_GROUPS.
   selfSay: trò tự đọc hướng dẫn kèm từ đầu tiên. noWeak: không hiện thẻ "Từ khó" (trò cần câu dài).
   src: "none" = không chọn bài (tự lấy câu hỏi trong kho) · "stories" = chọn truyện trong STORIES · bỏ trống = chọn bài đọc */
const MODES=[
 {id:"letter",icon:"🔠",name:"Chữ cái",desc:"Nghe âm rồi chọn chữ cái",say:"Bé nghe máy đọc âm, rồi chọn chữ cái đúng nhé.",col:"#0ca678",grp:"chu",src:"none",selfSay:1},
 {id:"picture",icon:"🖼️",name:"Nối chữ với hình",desc:"Đọc chữ rồi chọn đúng hình",say:"Bé đọc chữ rồi chọn hình đúng, hoặc nhìn hình rồi chọn chữ đúng nhé.",col:"#12a36f",grp:"chu"},
 {id:"spell",icon:"🧱",name:"Ghép vần",desc:"Ghép âm đầu, vần và dấu thành chữ",say:"Bé nghe máy đọc một tiếng, rồi chọn âm đầu, vần và dấu để ghép thành chữ nhé.",col:"#1595c4",grp:"chu",selfSay:1},
 {id:"blend",icon:"🔡",name:"Đánh vần",desc:"Nghe đánh vần rồi đọc to tiếng",say:"Mình cùng đánh vần nhé. Bé nghe rồi đọc to tiếng đó.",col:"#0b7285",grp:"chu",selfSay:1},
 {id:"tone",icon:"🎵",name:"Dấu nào đây?",desc:"Nghe rồi chọn chữ có dấu đúng",say:"Bé nghe máy đọc, rồi chọn chữ có dấu thanh đúng nhé.",col:"#c24bd6",grp:"chu",selfSay:1},
 {id:"hunt",icon:"🔍",name:"Săn vần",desc:"Tìm mọi tiếng có cùng vần",say:"Bé tìm và chạm vào tất cả các tiếng có cùng vần nhé.",col:"#a61e4d",grp:"chu"},
 {id:"balloon",icon:"🎈",name:"Bắt bóng chữ",desc:"Nghe từ rồi chạm đúng quả bóng",say:"Bé nghe máy đọc, rồi chạm vào quả bóng có từ đúng nhé.",col:"#e8457f",grp:"chu",selfSay:1},
 {id:"truefalse",icon:"✅",name:"Đúng hay sai",desc:"Đọc câu rồi chọn đúng hay sai",say:"Bé đọc câu, rồi chọn câu đó đúng hay sai nhé.",col:"#2f9e44",grp:"hieu",src:"none",noWeak:1},
 {id:"topic",icon:"🧠",name:"Đố vui",desc:"Đọc câu đố, chọn đáp án đúng",say:"Bé đọc câu đố rồi chọn đáp án đúng nhé.",col:"#d9480f",grp:"hieu",src:"none"},
 {id:"order",icon:"🔀",name:"Xếp câu",desc:"Xếp các từ thành câu đúng",say:"Các từ bị xáo trộn. Bé chạm lần lượt từng từ để xếp thành câu đúng nhé.",col:"#e67700",grp:"hieu",noWeak:1},
 {id:"story",icon:"📖",name:"Truyện tranh",desc:"Đọc truyện ngắn từng trang",say:"Mình cùng đọc truyện nhé. Bé đọc từng trang, đọc xong thì sang trang.",col:"#5c7cfa",grp:"hieu",src:"stories",noWeak:1},
 {id:"fill",icon:"🧩",name:"Tìm từ còn thiếu",desc:"Chọn từ đúng rồi đọc cả câu",say:"Câu bị thiếu một từ. Bé chọn từ đúng, rồi đọc to cả câu nhé.",col:"#8a4de8",grp:"hieu",noWeak:1},
 {id:"race",icon:"🏎️",name:"Đua từng từ",desc:"Đọc từng từ, đua với xe bóng ma",say:"Bé đọc to từng từ. Đọc đúng là xe chạy!",col:"#ff4d4d",grp:"doc"},
 {id:"sentence",icon:"🚂",name:"Đọc cả câu",desc:"Đọc trọn từng câu thật trơn tru",say:"Bé đọc to cả câu nhé. Đọc hết câu là xe chạy!",col:"#2d8cff",grp:"doc",noWeak:1},
 {id:"echo",icon:"🎙️",name:"Nghe giọng mình",desc:"Ghi âm bé đọc rồi nghe lại",say:"Bé bấm ghi âm, đọc to câu, rồi nghe lại giọng mình nhé.",col:"#c2255c",grp:"doc",noWeak:1},
 {id:"quick",icon:"⚡",name:"Đọc nhanh",desc:"Đọc từ trước khi hết giờ",say:"Từ hiện ra, bé đọc thật nhanh trước khi hết giờ nhé!",col:"#f08a00",grp:"doc"},
 {id:"rain",icon:"🌧️",name:"Mưa chữ",desc:"Nghe rồi hứng đúng chữ đang rơi",say:"Chữ đang rơi xuống. Bé nghe rồi bấm vào cái giỏ dưới chữ đúng nhé.",col:"#1c7ed6",grp:"vui"},
 {id:"memory",icon:"🃏",name:"Lật thẻ",desc:"Tìm cặp chữ và hình đi với nhau",say:"Bé lật hai thẻ một lần, tìm chữ đi với hình đúng nhé.",col:"#862e9c",grp:"vui"},
 /* ---- Toán (math.js): không chọn bài, độ khó theo cấp độ của bé ---- */
 {id:"count",icon:"🍎",name:"Đếm hình",desc:"Đếm rồi chọn số đúng",say:"Bé đếm hình rồi chọn số đúng nhé.",col:"#0ca678",grp:"so",sub:"math",src:"none",selfSay:1},
 {id:"numrec",icon:"🔢",name:"Tìm số",desc:"Nghe số rồi chọn chữ số",say:"Bé nghe máy đọc số, rồi tìm số đúng nhé.",col:"#2b8a3e",grp:"so",sub:"math",src:"none",selfSay:1},
 {id:"add",icon:"➕",name:"Phép cộng",desc:"Cộng hai số",say:"Bé làm phép cộng nhé.",col:"#e8457f",grp:"tinh",sub:"math",src:"none",selfSay:1},
 {id:"sub",icon:"➖",name:"Phép trừ",desc:"Trừ hai số",say:"Bé làm phép trừ nhé. Hình bị gạch là đã bớt đi.",col:"#c2255c",grp:"tinh",sub:"math",src:"none",selfSay:1},
 {id:"mathrace",icon:"⏱️",name:"Tính nhẩm nhanh",desc:"Tính trước khi hết giờ",say:"Tính thật nhanh trước khi hết giờ nhé!",col:"#f03e3e",grp:"tinh",sub:"math",src:"none"},
 {id:"compare",icon:"⚖️",name:"So sánh",desc:"Chọn dấu lớn, bé, bằng",say:"Bé so sánh hai số, rồi chọn dấu lớn hơn, bé hơn hoặc bằng nhé.",col:"#1c7ed6",grp:"sosanh",sub:"math",src:"none",selfSay:1},
 {id:"seq",icon:"➡️",name:"Số còn thiếu",desc:"Điền số vào dãy số",say:"Bé tìm số còn thiếu trong dãy số nhé.",col:"#1098ad",grp:"sosanh",sub:"math",src:"none",selfSay:1},
 {id:"shape",icon:"🔷",name:"Hình học",desc:"Nhận biết các hình",say:"Bé nhìn hình rồi chọn cho đúng nhé.",col:"#f08a00",grp:"hinh",sub:"math",src:"none",selfSay:1},
 {id:"word",icon:"📝",name:"Toán đố",desc:"Đọc bài toán, chọn đáp số",say:"Bé đọc bài toán rồi chọn đáp số đúng nhé.",col:"#d9480f",grp:"hinh",sub:"math",src:"none",selfSay:1},
];
/* nhóm trò: [id, tên, môn ("vi" Tiếng Việt | "math" Toán), màu ô trên trang chủ] */
const MODE_GROUPS=[["chu","🔤 Học chữ","vi","#12a36f"],["hieu","💡 Hiểu nghĩa","vi","#e67700"],["doc","🎤 Đọc to","vi","#2d8cff"],["vui","🎮 Vui nhộn","vi","#862e9c"],
 ["so","🔢 Số và đếm","math","#0ca678"],["tinh","🧮 Cộng trừ","math","#e8457f"],["sosanh","⚖️ So sánh, dãy số","math","#1c7ed6"],["hinh","🔷 Hình, toán đố","math","#f08a00"]];
const SUBJECTS=[["vi","📖 Tiếng Việt"],["math","🔢 Toán"]];
/* Đúng hay sai: câu ngắn vốn từ lớp 1, kèm hình gợi ý. ok: 1 = đúng, 0 = sai */
const STATEMENTS=[
 {e:"🐱",s:"Con mèo kêu meo meo.",ok:1},{e:"🐶",s:"Con chó kêu meo meo.",ok:0},{e:"🐟",s:"Con cá bơi dưới nước.",ok:1},{e:"🐟",s:"Con cá bay trên trời.",ok:0},
 {e:"🐦",s:"Con chim bay trên trời.",ok:1},{e:"🐘",s:"Con voi rất nhỏ bé.",ok:0},{e:"🐘",s:"Con voi có cái vòi dài.",ok:1},{e:"🐢",s:"Con rùa chạy rất nhanh.",ok:0},
 {e:"🐰",s:"Con thỏ thích ăn cà rốt.",ok:1},{e:"🐄",s:"Con bò cho ta sữa.",ok:1},{e:"🐔",s:"Con gà có bốn chân.",ok:0},{e:"🐝",s:"Con ong làm ra mật.",ok:1},
 {e:"☀️",s:"Mặt trời mọc vào ban đêm.",ok:0},{e:"🌙",s:"Ban đêm có trăng sáng.",ok:1},{e:"🌧️",s:"Trời mưa thì sân khô ráo.",ok:0},{e:"❄️",s:"Tuyết rất lạnh.",ok:1},
 {e:"🔥",s:"Lửa thì lạnh buốt.",ok:0},{e:"🌊",s:"Nước biển có vị mặn.",ok:1},{e:"🌳",s:"Cây xanh cần nước để lớn.",ok:1},{e:"🌸",s:"Bông hoa có mùi thơm.",ok:1},
 {e:"🍌",s:"Quả chuối có màu tím.",ok:0},{e:"🍎",s:"Quả táo ăn được.",ok:1},{e:"🍉",s:"Dưa hấu có ruột đỏ.",ok:1},{e:"🥛",s:"Sữa có màu đen.",ok:0},
 {e:"🍬",s:"Kẹo có vị đắng.",ok:0},{e:"🥚",s:"Gà mẹ đẻ trứng.",ok:1},{e:"🚗",s:"Ô tô chạy trên đường.",ok:1},{e:"⛵",s:"Thuyền chạy trên đường.",ok:0},
 {e:"✈️",s:"Máy bay bay trên trời.",ok:1},{e:"📖",s:"Bé đọc sách.",ok:1},{e:"✏️",s:"Bé dùng bút để ăn cơm.",ok:0},{e:"👟",s:"Bé đi giày ở tay.",ok:0},
 {e:"🧢",s:"Mũ đội trên đầu.",ok:1},{e:"☂️",s:"Ô che mưa cho bé.",ok:1},{e:"👀",s:"Bé nhìn bằng mắt.",ok:1},{e:"👂",s:"Bé nghe bằng mũi.",ok:0},
 {e:"✋",s:"Bàn tay có năm ngón.",ok:1},{e:"🎂",s:"Sinh nhật có bánh kem.",ok:1},{e:"🐸",s:"Con ếch kêu ộp ộp.",ok:1},{e:"🐷",s:"Con lợn biết bay.",ok:0}
];
/* Truyện tranh: mỗi trang một hình (emoji) + một câu; cuối truyện có một câu hỏi hiểu bài (a: chỉ số đáp án đúng) */
const STORIES=[
 {id:"st1",icon:"🐢",t:"Thỏ và rùa",pages:[["🐰🐢","Thỏ và rùa thi chạy."],["🐰💨","Thỏ chạy rất nhanh."],["🐰😴","Thỏ nằm ngủ dưới gốc cây."],["🐢","Rùa cứ chậm rãi bò đi."],["🐢🏁","Rùa về đích trước thỏ."]],lv:1,q:["Ai về đích trước?",["rùa","thỏ"],0]},
 {id:"st2",lv:1,icon:"🐥",t:"Gà con đi lạc",pages:[["🐥🌳","Gà con đi chơi xa."],["🐥❓","Gà con không thấy mẹ đâu."],["🐥🔊","Gà con kêu chíp chíp."],["🐔🏃","Gà mẹ nghe thấy và chạy tới."],["🐔🐥❤️","Gà con vui quá, nép vào mẹ."]],q:["Gà con kêu thế nào?",["gâu gâu","chíp chíp"],1]},
 {id:"st3",lv:1,icon:"🌱",t:"Bé trồng cây",pages:[["👧🌰","Bé gieo một hạt nhỏ."],["💧","Ngày nào bé cũng tưới nước."],["🌱","Hạt nảy mầm xanh."],["🌻","Cây lớn lên và ra hoa."],["👧😊","Bé vui lắm."]],q:["Bé tưới gì cho cây?",["nước","sữa"],0]},
 {id:"st5",icon:"🐻",t:"Gấu con dậy sớm",lv:2,pages:[["🐻🌅","Sáng nay gấu con dậy thật sớm."],["🐻💧","Gấu con rửa mặt bằng nước mát."],["🐻😁","Gấu con đánh răng trắng tinh."],["🐻🍯","Gấu con ăn sáng với mật ong."],["🐻🎒","Rồi gấu con vui vẻ đến lớp."]],q:["Gấu con ăn sáng với gì?",["mật ong","cá rán"],0]},
 {id:"st6",icon:"🐟",t:"Cá con bơi xa",lv:2,pages:[["🐟🌊","Cá con sống ở dưới biển xanh."],["🐟🐙","Một hôm cá con gặp bạn bạch tuộc."],["🐙👋","Bạch tuộc vẫy cả tám cái chân."],["🐟🐢","Cá con gặp thêm bác rùa già."],["🐟🏠","Chiều tối, cá con bơi về nhà."]],q:["Bạch tuộc có mấy cái chân?",["tám","hai"],0]},
 {id:"st7",icon:"🌈",t:"Cầu vồng",lv:2,pages:[["🌧️","Trời vừa tạnh mưa."],["☀️","Ông mặt trời ló ra sau đám mây."],["🌈","Trên trời hiện ra cầu vồng bảy màu."],["👦👧","Hai bạn nhỏ reo lên thích thú."],["👦👧😊","Các bạn cùng đếm từng màu một."]],q:["Cầu vồng có mấy màu?",["bảy","ba"],0]},
 {id:"st8",icon:"🐜",t:"Đàn kiến tha mồi",lv:2,pages:[["🐜","Đàn kiến đi tìm thức ăn."],["🐜🍞","Một chú kiến thấy mẩu bánh to."],["🐜😓","Chú kéo mãi mà không được."],["🐜🐜🐜","Các bạn kiến chạy tới giúp sức."],["🐜🏠","Cả đàn kéo mẩu bánh về tổ."]],q:["Ai giúp chú kiến?",["các bạn kiến","chú mèo"],0]},
 {id:"st4",lv:1,icon:"🧶",t:"Mèo con và cuộn len",pages:[["🐱🧶","Mèo con thấy cuộn len đỏ."],["🐱💨","Mèo con lăn cuộn len."],["🧶😵","Cuộn len rối hết cả."],["👵😄","Bà cười và gỡ len."],["🐱💤","Mèo con nằm ngủ bên bà."]],q:["Cuộn len màu gì?",["xanh","đỏ"],1]}
];
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
const CARS=[{c:"#ff4d4d",need:0},{c:"#2d8cff",need:0},{c:"#2fb35a",need:0},{c:"#ff9f1c",need:5},{c:"#b05cff",need:12},{c:"#ff5fa2",need:0},{c:"#14b8a6",need:30},{c:"#3a3f55",need:45}];
const ICONS=["📖","🐶","🐱","🐟","🐥","🦋","🌸","🌳","🌧️","☀️","🏠","🎒","🚗","🍎","🎂","⚽","🌊","🚀"];
const BALLOON=["#e8457f","#2d7be0","#8a4de8","#e07b00","#1f9e55","#d63a3a"];
const COMMON=["bé","mẹ","bố","bà","cá","gà","nhà","cây","hoa","xe","mèo","chó","sân","rau","mưa","nắng","cô","bàn"];
const PRAISE=["Giỏi quá!","Đúng rồi!","Tuyệt vời!","Xe chạy nè!","Hay lắm!","Siêu ghê!"];
const STAR="M12 2l3 6.5 7 .8-5.2 4.8 1.4 7L12 17.6 5.8 21l1.4-7L2 9.3l7-.8z";
const CAR_SVG='<svg viewBox="0 0 140 80" aria-hidden="true"><path d="M8 56 Q6 40 22 36 L44 33 Q54 14 78 14 Q98 14 108 32 L126 36 Q136 40 134 56 Z" fill="currentColor"/><path d="M8 56 L134 56 Q134 62 128 62 L14 62 Q8 62 8 56Z" fill="rgba(0,0,0,.2)"/><path d="M52 34 Q60 20 76 20 Q92 20 100 34 Z" fill="#cdeeff"/><circle cx="74" cy="27" r="10" fill="#ffd9b0"/><path d="M63 26 Q64 14 74 14 Q85 14 85 26 Z" fill="#ffc928"/><circle cx="70" cy="28" r="1.8" fill="#222"/><circle cx="78" cy="28" r="1.8" fill="#222"/><path d="M70 32 Q74 35 78 32" stroke="#222" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="30" cy="46" r="8" fill="#fff"/><text x="30" y="50.5" font-size="12" font-weight="800" text-anchor="middle" fill="#222" font-family="Baloo 2">1</text><rect x="120" y="40" width="10" height="6" rx="3" fill="#fff7b0"/><g class="wheel"><circle cx="36" cy="62" r="13" fill="#222"/><circle cx="36" cy="62" r="6" fill="#ddd"/><rect x="34.5" y="51" width="3" height="22" fill="#999"/></g><g class="wheel"><circle cx="108" cy="62" r="13" fill="#222"/><circle cx="108" cy="62" r="6" fill="#ddd"/><rect x="106.5" y="51" width="3" height="22" fill="#999"/></g></svg>';
const FACE_SVG='<circle cx="30" cy="34" r="21" fill="#ffd9b0"/><path d="M8 33 Q9 8 30 8 Q51 8 52 33 Q41 22 30 22 Q19 22 8 33Z" fill="#ffc928"/><rect x="6" y="30" width="48" height="5" rx="2.5" fill="#ff4d4d"/><circle cx="23" cy="38" r="2.6" fill="#222"/><circle cx="37" cy="38" r="2.6" fill="#222"/><circle cx="18" cy="45" r="3.4" fill="#ff9fb0" opacity=".7"/><circle cx="42" cy="45" r="3.4" fill="#ff9fb0" opacity=".7"/><path d="M24 46 Q30 52 36 46" stroke="#222" stroke-width="2.4" fill="none" stroke-linecap="round"/>';

/* ===== hồ sơ bé (kids.js), cấp độ và lộ trình (journey.js) ===== */
/* cấp độ: q = giây mỗi từ (Đọc nhanh, Mưa chữ), st = chấm chặt dấu thanh */
const LEVELS=[{id:"mam",n:"🌱 Mầm (5 tuổi)",q:10,st:false},{id:"l1",n:"📗 Lớp 1",q:6,st:false},{id:"l2",n:"📘 Lớp 2+",q:5,st:true}];
/* lộ trình theo cấp độ: [trò, id bài]; mỗi cặp chỉ xuất hiện một lần vì sao lưu theo "idBài|trò" */
const PATHS={
 mam:[["letter","bank"],["picture","b1"],["memory","b2"],["balloon","b1"],["blend","b1"],["tone","b2"],["picture","b6"],["rain","b2"],["story","st1"],["spell","b1"],["topic","bank"],["blend","b6"],["memory","b5"],["race","b1"],["story","st2"],["hunt","b2"]],
 l1:[["picture","b1"],["blend","b2"],["spell","b1"],["race","b1"],["tone","b2"],["balloon","b3"],["story","st1"],["truefalse","bank"],["hunt","b2"],["sentence","b1"],["fill","b4"],["echo","b2"],["order","b3"],["rain","b5"],["topic","bank"],["story","st3"],["quick","b6"],["race","b7"]],
 l2:[["race","b4"],["sentence","b2"],["order","b1"],["fill","b3"],["truefalse","bank"],["story","st5"],["quick","b5"],["hunt","b7"],["echo","b6"],["topic","bank"],["sentence","b8"],["story","st7"],["order","b6"],["spell","b8"],["race","b8"],["story","st8"]]
};
const NAMES_B=["Bin","Bơ","Tôm","Ken","Bi","Tít","Cốm","Gấu"],NAMES_G=["Na","Mít","Bống","Mây","Nấm","Thỏ","Bông","Su"];
const AVATARS=["🦁","🐯","🐻","🐼","🐶","🐱","🐰","🦊","🐸","🐵","🦄","🐥","🐨","🐙","🦖","🐳"];
/* chữ cái: [chữ, cách đọc âm như lớp 1] */
const LETTERS=[["a","a"],["ă","á"],["â","ớ"],["b","bờ"],["c","cờ"],["d","dờ"],["đ","đờ"],["e","e"],["ê","ê"],["g","gờ"],["h","hờ"],["i","i"],["k","ca"],["l","lờ"],["m","mờ"],["n","nờ"],["o","o"],["ô","ô"],["ơ","ơ"],["p","pờ"],["q","quy"],["r","rờ"],["s","sờ"],["t","tờ"],["u","u"],["ư","ư"],["v","vờ"],["x","xờ"],["y","i dài"]];
const CONFUSE=[["b","d","đ","p","q"],["m","n"],["a","ă","â"],["o","ô","ơ"],["e","ê"],["u","ư"],["i","y"],["s","x"],["c","k"],["g","h"],["l","t"]];
/* cách đọc âm đầu khi đánh vần */
const ONSET_SAY={b:"bờ",c:"cờ",k:"ca",ch:"chờ",d:"dờ","đ":"đờ",g:"gờ",gh:"gờ",gi:"di",h:"hờ",kh:"khờ",l:"lờ",m:"mờ",n:"nờ",ng:"ngờ",ngh:"ngờ",nh:"nhờ",p:"pờ",ph:"phờ",qu:"quờ",r:"rờ",s:"sờ",t:"tờ",th:"thờ",tr:"trờ",v:"vờ",x:"xờ"};
/* Đố vui: nhóm từ (đều có trong PICS) và câu đố [câu, đáp án] */
const TOPICS=[
 {n:"con vật",w:["cá","gà","mèo","chó","bò","lợn","vịt","chim","ếch","rùa","thỏ","voi","khỉ","hổ","ong","bướm","kiến","cua","tôm","ngựa","dê","cừu","rắn","gấu","cú"]},
 {n:"đồ ăn",w:["táo","cam","chuối","nho","dưa","bánh","kẹo","sữa","trứng","cơm","ngô","dừa","lê","kem","bún"]},
 {n:"đồ dùng",w:["xe","tàu","thuyền","ô","mũ","áo","giày","sách","bút","cặp","bóng","đèn","kéo","quà","đàn","trống"]},
 {n:"thiên nhiên",w:["mưa","nắng","trăng","sao","mây","biển","núi","lửa","cát","hoa","cây","lá"]},
 {n:"người trong nhà",w:["mẹ","bố","bé","bà","ông"]}
];
const RIDDLES=[["Con gì kêu meo meo?","mèo"],["Con gì kêu gâu gâu?","chó"],["Con gì kêu ò ó o?","gà"],["Con gì kêu ộp ộp?","ếch"],["Con gì có vòi dài?","voi"],["Con gì tai dài, nhảy rất giỏi?","thỏ"],["Con gì làm ra mật ngọt?","ong"],["Con gì mang mai trên lưng, bò chậm?","rùa"],["Con gì kêu ụt ịt?","lợn"],["Con gì kêu cạp cạp?","vịt"],["Quả gì vỏ vàng, cong cong?","chuối"],["Quả gì tròn tròn, màu cam?","cam"],["Cái gì dùng để che mưa?","ô"],["Cái gì dùng để viết?","bút"],["Cái gì bé đội lên đầu?","mũ"],["Ban đêm, cái gì sáng trên trời?","trăng"],["Mình nhìn bằng gì?","mắt"],["Mình nghe bằng gì?","tai"],["Cái gì tròn, để đá?","bóng"],["Con gì sống dưới nước, có vây?","cá"],["Cái gì chạy trên đường ray?","tàu"],["Cái gì để bé đọc truyện?","sách"]];
/* trang trí xe: [hình, số sao cần] · thú cưng lớn theo số ngày xong nhiệm vụ: [hình, số ngày, tên] */
const DECOS=[["",0],["⭐",5],["🎀",10],["🔥",15],["🌈",25],["👑",35],["🦄",50]];
const PET=[["🥚",0,"Quả trứng bí ẩn"],["🐣",1,"Gà con mới nở"],["🐥",3,"Gà con"],["🐤",6,"Gà nhỏ"],["🐓",10,"Gà trống"],["🐓👑",15,"Gà vua"]];
/* mặt bạn dẫn đường cho bé gái: thêm nơ hồng */
const FACE_GIRL=FACE_SVG.replace("#ff4d4d","#ff5fa2")+'<g fill="#ff5fa2"><path d="M44 9 L55 3 L55 17Z"/><path d="M44 9 L33 3 L33 17Z"/><circle cx="44" cy="10" r="3.6"/></g>';

/* ===== Toán (math.js) ===== */
/* lộ trình Toán theo cấp độ */
const PATHS_MATH={
 mam:[["count","bank"],["numrec","bank"],["add","bank"],["compare","bank"],["shape","bank"],["seq","bank"],["sub","bank"],["word","bank"],["mathrace","bank"]],
 l1:[["numrec","bank"],["count","bank"],["add","bank"],["sub","bank"],["compare","bank"],["seq","bank"],["shape","bank"],["mathrace","bank"],["word","bank"]],
 l2:[["numrec","bank"],["compare","bank"],["seq","bank"],["add","bank"],["sub","bank"],["mathrace","bank"],["shape","bank"],["word","bank"],["count","bank"]]
};
/* đồ vật để đếm: [hình, tên kèm loại từ] */
const COUNTABLES=[["🍎","quả táo"],["🐟","con cá"],["⭐","ngôi sao"],["🎈","quả bóng bay"],["🐥","con gà con"],["🚗","chiếc xe"],["🌸","bông hoa"],["🍌","quả chuối"]];
/* hình học: [id, tên] — vẽ bằng SVG trong math.js */
const SHAPES=[["tron","hình tròn"],["vuong","hình vuông"],["tamgiac","hình tam giác"],["chunhat","hình chữ nhật"]];
/* toán đố theo cấp: [cấp, hình, đề bài, đáp số] */
const WORDPROBS=[
 ["mam","🐱","Có 2 con mèo. Thêm 1 con mèo nữa. Có tất cả mấy con mèo?",3],
 ["mam","🍬","Bé có 4 cái kẹo. Bé ăn 1 cái kẹo. Bé còn mấy cái kẹo?",3],
 ["mam","🐦","Trên cây có 3 con chim. 2 con chim bay đi. Còn lại mấy con chim?",1],
 ["mam","🍎","Mẹ mua 2 quả táo. Bố mua 2 quả táo. Nhà có mấy quả táo?",4],
 ["mam","🦆","Ao có 1 con vịt. Thêm 3 con vịt nữa. Ao có mấy con vịt?",4],
 ["mam","🎈","Bé có 5 quả bóng. 2 quả bóng bay mất. Bé còn mấy quả bóng?",3],
 ["mam","🌸","Có 3 bông hoa đỏ và 2 bông hoa vàng. Có tất cả mấy bông hoa?",5],
 ["mam","🚗","Bé có 2 chiếc xe. Anh cho bé 1 chiếc xe. Bé có mấy chiếc xe?",3],
 ["l1","🍊","Lan có 5 quả cam. Mẹ cho Lan thêm 3 quả cam. Hỏi Lan có tất cả mấy quả cam?",8],
 ["l1","🧒","Trong lớp có 9 bạn. 4 bạn đi ra sân. Hỏi trong lớp còn mấy bạn?",5],
 ["l1","🔵","Nam có 6 viên bi. Nam cho em 2 viên bi. Hỏi Nam còn mấy viên bi?",4],
 ["l1","🐔","Đàn gà có 7 con gà mái và 3 con gà trống. Hỏi đàn gà có tất cả mấy con?",10],
 ["l1","✏️","Trên bàn có 10 cái bút. Bé lấy đi 6 cái bút. Hỏi trên bàn còn mấy cái bút?",4],
 ["l1","🍌","Bà có 4 quả chuối. Bà mua thêm 4 quả chuối. Hỏi bà có mấy quả chuối?",8],
 ["l1","🐟","Hồ có 8 con cá. 3 con cá bơi đi chỗ khác. Hỏi hồ còn mấy con cá?",5],
 ["l1","🕊️","Mai gấp được 2 con hạc. Hoa gấp được 7 con hạc. Hỏi hai bạn gấp được mấy con hạc?",9],
 ["l2","🧒","Lớp 2A có 15 bạn nam và 14 bạn nữ. Hỏi lớp 2A có tất cả bao nhiêu bạn?",29],
 ["l2","🥚","Cửa hàng có 50 quả trứng, đã bán 20 quả. Hỏi cửa hàng còn bao nhiêu quả trứng?",30],
 ["l2","🍊","Mẹ hái được 24 quả cam, bố hái được 35 quả cam. Hỏi cả hai người hái được bao nhiêu quả cam?",59],
 ["l2","🧵","Sợi dây dài 45 xăng-ti-mét. Bé cắt đi 15 xăng-ti-mét. Hỏi sợi dây còn dài bao nhiêu xăng-ti-mét?",30],
 ["l2","📚","Thư viện có 68 quyển sách. Các bạn mượn 25 quyển. Hỏi thư viện còn bao nhiêu quyển sách?",43],
 ["l2","🦆","Đàn vịt có 36 con dưới ao và 12 con trên bờ. Hỏi đàn vịt có bao nhiêu con?",48],
 ["l2","💵","Bé có 90 nghìn đồng. Bé mua sách hết 40 nghìn đồng. Hỏi bé còn bao nhiêu nghìn đồng?",50],
 ["l2","🌳","Trường có 27 cây phượng và 30 cây bàng. Hỏi trường có tất cả bao nhiêu cây?",57]
];
