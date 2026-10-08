export interface RehabStep {
  zh: string;
  id: string;
}

export interface RehabItem {
  key: string;
  zh: string;
  id: string;
  icon: string;
  images: string[];
  steps: RehabStep[];
}

export interface RehabLevel {
  key: 'L1' | 'L2' | 'L3' | 'L4';
  zh: string;
  id: string;
  hint: { zh: string; id: string };
  badgeColor: string;
  items: RehabItem[];
}

export const REHAB_WARN_ITEMS = [
  {
    img: 'rehab-img/error-posture-1.jpg',
    bad: true,
    zh: '錯誤姿勢：應抬頭挺胸，勿駝背翹屁股',
    id: 'Postur salah: Kepala harus tegak, dada membusung, jangan bungkuk & pinggul menonjol'
  },
  {
    img: 'rehab-img/error-posture-2.jpg',
    bad: true,
    zh: '錯誤姿勢：雙腳應與肩同寬，膝蓋彎曲小於90度並稍內收',
    id: 'Postur salah: Kaki selebar bahu, lutut tertekuk kurang dari 90° dan sedikit ke dalam'
  },
  {
    img: 'rehab-img/error-behavior-1.jpg',
    bad: true,
    zh: '錯誤行為：床圍欄放下時，禁止離開病患1公尺遠',
    id: 'Perilaku salah: Dilarang menjauh lebih dari 1 meter dari pasien saat pagar tempat tidur diturunkan'
  },
  {
    img: 'rehab-img/massage-1.jpg',
    bad: false,
    zh: '運動間隔按摩',
    id: 'Pijat di sela latihan'
  },
  {
    img: 'rehab-img/massage-2.jpg',
    bad: false,
    zh: '運動間隔按摩',
    id: 'Pijat di sela latihan'
  }
];

export const DEFAULT_REHAB_LEVELS: RehabLevel[] = [
  {
    key: 'L1',
    zh: 'LEVEL 1',
    id: 'LEVEL 1',
    hint: { zh: '床上被動／暖身 (3項)', id: 'Pemanasan di Tempat Tidur (3 item)' },
    badgeColor: 'sky',
    items: [
      {
        key: 'l1-bottle',
        zh: '雙手舉水瓶',
        id: 'Angkat Botol Dua Tangan',
        icon: '🍼',
        images: ['rehab-img/adduction-1.jpg'],
        steps: [
          { zh: '平躺準備：病患平躺床上，雙手握持水瓶置於腹前。', id: 'Persiapan: Pasien berbaring telentang, pegang botol air dengan kedua tangan di atas perut.' },
          { zh: '緩慢上舉：手肘微屈，平穩向上舉過胸前至微高處。', id: 'Angkat perlahan: Siku sedikit ditekuk, angkat botol stabil di atas dada.' },
          { zh: '維持計時：在最高點穩定維持 5 秒。', id: 'Tahan: Pertahankan di posisi tertinggi selama 5 detik.' },
          { zh: '緩慢復原：緩慢放下放鬆，每次練習 10～15 回。', id: 'Turunkan: Turunkan perlahan dan rileks, ulangi 10-15 kali.' }
        ]
      },
      {
        key: 'l1-sole',
        zh: '腳底板抬壓',
        id: 'Tekan Telapak Kaki',
        icon: '🦶',
        images: ['rehab-img/legraise-1.jpg'],
        steps: [
          { zh: '平躺準備：平躺於床面，雙腿自然放鬆伸直。', id: 'Persiapan: Berbaring telentang di tempat tidur, kedua kaki lurus dan rileks.' },
          { zh: '腳踝勾起：腳踝用力向上勾起（背屈）維持 5 秒。', id: 'Tekuk ke atas: Tekuk pergelangan kaki ke atas selama 5 detik.' },
          { zh: '腳踝下踩：腳踝向下踩壓（蹠屈）維持 5 秒。', id: 'Tekan ke bawah: Tekan pergelangan kaki ke bawah selama 5 detik.' },
          { zh: '建議次數：左右交替或同時進行 15～20 回，促進下肢血液循環防血栓。', id: 'Repetisi: Lakukan bergantian atau bersamaan 15-20 kali untuk melancarkan sirkulasi darah.' }
        ]
      },
      {
        key: 'l1-knee',
        zh: '膝蓋彎伸',
        id: 'Tekuk & Luruskan Lutut',
        icon: '🦵',
        images: ['rehab-img/bridge-1.jpg'],
        steps: [
          { zh: '平躺準備：平躺於床面，雙腿伸直放鬆。', id: 'Persiapan: Berbaring telentang dengan kedua kaki lurus dan rileks.' },
          { zh: '腳跟滑動：單腳腳跟貼著床面緩慢向臀部滑動彎曲膝蓋。', id: 'Geser tumit: Geser tumit perlahan di atas kasur ke arah pinggul untuk menekuk lutut.' },
          { zh: '頂端維持：彎曲至舒適極限，維持 3 秒。', id: 'Tahan: Tahan di posisi tekuk selama 3 detik.' },
          { zh: '緩慢伸直：沿床面慢慢伸直放平，左右交替各 10 回。', id: 'Luruskan: Luruskan kembali perlahan, lakukan bergantian tiap sisi 10 kali.' }
        ]
      }
    ]
  },
  {
    key: 'L2',
    zh: 'LEVEL 2',
    id: 'LEVEL 2',
    hint: { zh: '仰臥主動肌力 (3項)', id: 'Kekuatan Otot Telentang (3 item)' },
    badgeColor: 'emerald',
    items: [
      {
        key: 'l2-legraise',
        zh: '仰臥抬腿',
        id: 'Angkat Kaki Telentang',
        icon: '🦵',
        images: ['rehab-img/legraise-1.jpg', 'rehab-img/legraise-2.jpg'],
        steps: [
          { zh: '平躺準備：病患平躺床上，雙腿伸直。', id: 'Persiapan: Pasien berbaring telentang di tempat tidur dengan kedua kaki lurus.' },
          { zh: '單腳抬起：彎曲單一膝蓋向上抬，使小腿與床面平行。', id: 'Angkat satu kaki: Tekuk satu lutut dan angkat hingga betis sejajar permukaan tempat tidur.' },
          { zh: '注意防護：若病肢無力，照顧者輕托腳踝與膝窩輔助，避免拉傷。', id: 'Perlindungan: Jika lemah, pengasuh menopang pergelangan kaki dan belakang lutut.' },
          { zh: '計時十秒：維持姿勢，倒數 10 秒後緩慢放下換邊，左右各 10～15 回。', id: 'Tahan 10 detik: Hitung mundur 10 detik lalu ganti sisi, lakukan 10-15 kali.' }
        ]
      },
      {
        key: 'l2-adduction',
        zh: '仰躺大腿內收訓練',
        id: 'Adduksi Paha Telentang',
        icon: '🩲',
        images: ['rehab-img/adduction-1.jpg', 'rehab-img/adduction-2.jpg'],
        steps: [
          { zh: '平躺準備：平躺床上雙腿伸直，單腳屈膝立起腳掌平貼床面。', id: 'Persiapan: Berbaring telentang, tekuk satu lutut dengan telapak kaki rata di ranjang.' },
          { zh: '膝蓋內夾：令病患使用大腿肌群主動將屈起膝蓋往內側夾緊。', id: 'Remas ke dalam: Gunakan otot paha aktif meremas lutut ke dalam.' },
          { zh: '注意防護：若乏力可輕托外側協助，以無痛為原則，維持 10 秒。', id: 'Tahan 10 detik: Bantu jika lemah tanpa rasa sakit, tahan selama 10 detik.' },
          { zh: '換腳交替：左右交替進行 10～15 回。', id: 'Ganti sisi: Lakukan bergantian 10-15 kali.' }
        ]
      },
      {
        key: 'l2-bridge',
        zh: '橋式／仰躺雙腳屈膝抬臀',
        id: 'Jembatan / Angkat Pinggul Telentang',
        icon: '🍑',
        images: ['rehab-img/bridge-1.jpg', 'rehab-img/bridge-2.jpg'],
        steps: [
          { zh: '平躺準備：病患平躺床上雙膝彎曲，雙腳掌平貼床面。', id: 'Persiapan: Berbaring telentang dengan kedua lutut ditekuk rata di ranjang.' },
          { zh: '臀部抬起：利用臀部與大腿後側力量將臀部抬離床面。', id: 'Angkat pinggul: Gunakan kekuatan otot pinggul dan paha belakang mengangkat pantat.' },
          { zh: '計時十秒：維持抬臀姿勢穩定，倒數 10 秒。', id: 'Tahan 10 detik: Pertahankan posisi terangkat selama 10 detik.' },
          { zh: '緩慢放下：放回床面放鬆，每次練習 10～15 回。', id: 'Turunkan: Turunkan perlahan dan ulangi 10-15 kali.' }
        ]
      }
    ]
  },
  {
    key: 'L3',
    zh: 'LEVEL 3',
    id: 'LEVEL 3',
    hint: { zh: '坐姿轉位 (4項)', id: 'Transisi Posisi Duduk (4 item)' },
    badgeColor: 'amber',
    items: [
      {
        key: 'l3-lift',
        zh: '舉物練習',
        id: 'Latihan Angkat Benda',
        icon: '📦',
        images: ['rehab-img/adduction-1.jpg'],
        steps: [
          { zh: '坐姿準備：病患坐穩於床沿或有靠背椅子上。', id: 'Persiapan: Duduk stabil di tepi ranjang atau kursi bersandaran.' },
          { zh: '雙手持物：雙手穩握輕量物品（如水瓶或小盒）。', id: 'Pegang benda: Pegang benda ringan dengan kedua tangan.' },
          { zh: '緩慢抬高：自胸前提至胸前高度或視線平齊，維持 5 秒。', id: 'Angkat: Angkat setinggi dada/mata, tahan 5 detik.' },
          { zh: '平穩放回：重複練習 10～15 回。', id: 'Ulangi: Ulangi latihan 10-15 kali.' }
        ]
      },
      {
        key: 'l3-sitleg',
        zh: '坐式抬腿',
        id: 'Angkat Kaki Duduk',
        icon: '🪑',
        images: ['rehab-img/legraise-2.jpg'],
        steps: [
          { zh: '坐姿準備：端坐於床沿或椅上，背部挺直雙腳著地。', id: 'Persiapan: Duduk tegak di tepi tempat tidur atau kursi.' },
          { zh: '單腿伸直：緩慢將一小腿向前踢平伸直，腳尖朝上勾起。', id: 'Luruskan kaki: Luruskan satu kaki ke depan perlahan dengan ujung kaki ditekuk ke atas.' },
          { zh: '維持頂端：維持 5 秒感受大腿前側用力。', id: 'Tahan: Tahan 5 detik rasakan kontraksi paha depan.' },
          { zh: '換邊交替：緩慢收回換腳，左右各做 10～15 回。', id: 'Ganti sisi: Tarik kembali perlahan lalu ganti kaki, ulangi 10-15 kali.' }
        ]
      },
      {
        key: 'l3-sitadduct',
        zh: '坐式大腿內收',
        id: 'Adduksi Paha Duduk',
        icon: '🩲',
        images: ['rehab-img/adduction-2.jpg'],
        steps: [
          { zh: '坐姿準備：端坐床沿雙腳與肩同寬平踏地面。', id: 'Persiapan: Duduk di tepi ranjang, kedua kaki selebar bahu menapak lantai.' },
          { zh: '膝間夾物：在雙膝之間夾入毛巾卷或軟球。', id: 'Jepit benda: Letakkan gulungan handuk atau bantal di antara kedua lutut.' },
          { zh: '用力內夾：大腿內側主動用力向內夾緊，維持 10 秒。', id: 'Jepit kuat: Remas kedua lutut ke dalam selama 10 detik.' },
          { zh: '放鬆重複：緩慢放鬆 3 秒，重複 10～15 次。', id: 'Rileks: Kendurkan perlahan 3 detik, ulangi 10-15 kali.' }
        ]
      },
      {
        key: 'l3-stand',
        zh: '站立',
        id: 'Berdiri',
        icon: '🧍',
        images: ['rehab-img/stand-1.jpg', 'rehab-img/stand-2.jpg', 'rehab-img/stand-3.jpg', 'rehab-img/stand-4.jpg', 'rehab-img/stand-5.jpg'],
        steps: [
          { zh: '降床準備：電動床降至最低，放下一側床欄，確保雙腳穩踏地面。', id: 'Persiapan: Turunkan ranjang elektrik ke posisi terendah, turunkan pagar, pastikan kaki menapak lantai.' },
          { zh: '尿管安全：務必留意導尿管位置，嚴禁牽拉或高於膀胱水平！', id: 'Keamanan kateter: Perhatikan letak kateter urine, jangan tertarik atau lebih tinggi dari kandung kemih!' },
          { zh: '膝蓋頂防：照顧者於正前方以雙膝抵住病患膝蓋，預防無力滑跪。', id: 'Penopang lutut: Pengasuh menopang lutut pasien dengan kedua lutut sendiri agar tidak lemas.' },
          { zh: '引導站起：讓病患環抱照顧者頸部或扶穩助行器，引導發力站起。', id: 'Bantu berdiri: Pasien merangkul leher pengasuh atau pegang walker, bantu berdiri perlahan.' },
          { zh: '姿勢維持：抬頭挺胸站立，若感到疲勞酸軟立刻坐下休息。', id: 'Pertahankan postur: Tegakkan badan; jika merasa lelah segera duduk kembali.' }
        ]
      }
    ]
  },
  {
    key: 'L4',
    zh: 'LEVEL 4',
    id: 'LEVEL 4',
    hint: { zh: '站姿平衡（注意安全防跌） (3項)', id: 'Keseimbangan Berdiri - Waspada Jatuh (3 item)' },
    badgeColor: 'rose',
    items: [
      {
        key: 'l4-stand',
        zh: '站立',
        id: 'Berdiri',
        icon: '🧍',
        images: ['rehab-img/stand-1.jpg', 'rehab-img/stand-2.jpg', 'rehab-img/stand-3.jpg', 'rehab-img/stand-4.jpg', 'rehab-img/stand-5.jpg'],
        steps: [
          { zh: '降床準備：床降至最低並放下單側床欄，病患移至床沿雙腳平踩地面。', id: 'Persiapan: Turunkan ranjang serendah mungkin, kedua kaki pasien menapak rata di lantai.' },
          { zh: '尿管戒護：檢查導尿管位置，不可扯拉或高於膀胱水平。', id: 'Perhatian kateter: Pastikan selang kateter tidak tertarik dan tidak lebih tinggi dari perut.' },
          { zh: '戒護站起：雙膝前頂戒護，協助病患借力平穩站直。', id: 'Kawal berdiri: Topang lutut pasien dan bantu berdiri dengan aman.' },
          { zh: '站立耐力：維持站姿至體力適度，切勿勉強。', id: 'Daya tahan: Berdiri selama nyaman, jangan memaksakan diri.' }
        ]
      },
      {
        key: 'l4-standsway',
        zh: '站立搖擺',
        id: 'Goyang Berdiri (Keseimbangan)',
        icon: '🧘',
        images: ['rehab-img/stand-1.jpg', 'rehab-img/stand-3.jpg'],
        steps: [
          { zh: '準備：雙人戒護或扶穩牢固支撐物下平穩站立，雙腳與肩同寬。', id: 'Persiapan: Berdiri stabil di bawah pengawasan atau berpegangan kuat.' },
          { zh: '重心微移：身體重心微幅緩慢左右輕搖，感受腳底平衡受力。', id: 'Goyang perlahan: Goyangkan beban tubuh sedikit ke kiri dan kanan.' },
          { zh: '注意安全：幅度以平衡不晃倒為限，若不適立即坐下。', id: 'Waspada: Jaga agar tidak goyah berlebih, segera duduk jika pusing.' }
        ]
      },
      {
        key: 'l4-standleg',
        zh: '站立抬腳',
        id: 'Berdiri Angkat Kaki',
        icon: '🚶',
        images: ['rehab-img/stand-2.jpg', 'rehab-img/stand-4.jpg'],
        steps: [
          { zh: '準備：戒護站立，雙手扶穩牢固欄杆或助行器。', id: 'Persiapan: Berdiri sambil berpegangan kuat pada pegangan atau walker.' },
          { zh: '單腳微抬：重心移至單腳，另一腳緩慢微離地面 2～5 公分，維持 3 秒。', id: 'Angkat satu kaki: Angkat satu kaki 2-5 cm dari lantai selama 3 detik.' },
          { zh: '左右交替：放平後換邊，若感到疲勞或腳軟立刻坐下休息。', id: 'Ganti sisi: Lakukan bergantian; segera duduk bila lemas.' }
        ]
      }
    ]
  }
];
