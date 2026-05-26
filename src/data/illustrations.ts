// キーワード → SVGイラスト マッピング
// viewBox="0 0 200 200"、白/金系の線画スタイル

export interface Illustration {
  key: string
  keywords: string[]
  svg: string  // <path> / <circle> など SVG 内部要素
}

const STROKE = 'stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"'

export const ILLUSTRATIONS: Illustration[] = [
  {
    key: 'dragon',
    keywords: ['龍', '竜', 'ドラゴン', 'dragon', '蛟', '飛龍'],
    svg: `
      <path ${STROKE} d="
        M 100 170 C 80 160 60 140 55 120
        C 50 100 60 80 75 70
        C 90 60 110 55 125 60
        C 145 65 160 80 155 100
        C 150 115 135 120 120 115
        C 105 110 100 95 108 85
        C 115 75 130 78 135 90
      "/>
      <path ${STROKE} d="M 75 70 L 60 50 L 78 62"/>
      <path ${STROKE} d="M 125 60 L 140 42 L 122 58"/>
      <path ${STROKE} d="M 55 120 L 35 130 L 50 115"/>
      <path ${STROKE} d="M 100 170 L 115 185 L 95 172"/>
      <circle cx="105" cy="85" r="4" fill="currentColor"/>
    `,
  },
  {
    key: 'fox',
    keywords: ['狐', 'キツネ', 'きつね', 'fox', '九尾'],
    svg: `
      <ellipse cx="100" cy="110" rx="30" ry="25" ${STROKE}/>
      <path ${STROKE} d="M 78 95 L 68 65 L 88 85"/>
      <path ${STROKE} d="M 122 95 L 132 65 L 112 85"/>
      <ellipse cx="100" cy="108" rx="12" ry="9" ${STROKE}/>
      <path ${STROKE} d="M 100 135 C 80 145 60 165 50 180 M 100 135 C 120 145 140 165 150 180"/>
      <circle cx="90" cy="100" r="3" fill="currentColor"/>
      <circle cx="110" cy="100" r="3" fill="currentColor"/>
      <path ${STROKE} d="M 94 115 Q 100 119 106 115"/>
    `,
  },
  {
    key: 'wolf',
    keywords: ['狼', 'オオカミ', 'おおかみ', 'wolf', '白狼', '黒狼'],
    svg: `
      <path ${STROKE} d="M 70 140 L 70 110 L 80 85 L 100 75 L 120 85 L 130 110 L 130 140"/>
      <path ${STROKE} d="M 80 85 L 72 60 L 88 80"/>
      <path ${STROKE} d="M 120 85 L 128 60 L 112 80"/>
      <ellipse cx="100" cy="85" rx="22" ry="18" ${STROKE}/>
      <path ${STROKE} d="M 88 90 Q 100 98 112 90"/>
      <circle cx="92" cy="80" r="3" fill="currentColor"/>
      <circle cx="108" cy="80" r="3" fill="currentColor"/>
      <path ${STROKE} d="M 70 140 L 55 155 M 130 140 L 145 155"/>
      <path ${STROKE} d="M 85 140 L 85 160 M 115 140 L 115 160"/>
    `,
  },
  {
    key: 'bird',
    keywords: ['鳥', '鷹', '鷲', '鶴', 'とり', 'たか', 'わし', 'つる', 'bird', 'eagle', '羽'],
    svg: `
      <path ${STROKE} d="M 100 100 C 70 85 40 75 20 80"/>
      <path ${STROKE} d="M 100 100 C 130 85 160 75 180 80"/>
      <path ${STROKE} d="M 100 100 C 90 115 85 130 88 145"/>
      <path ${STROKE} d="M 100 100 C 110 115 115 130 112 145"/>
      <ellipse cx="100" cy="90" rx="12" ry="10" ${STROKE}/>
      <path ${STROKE} d="M 108 88 L 118 85"/>
      <path ${STROKE} d="M 20 80 C 15 90 22 95 30 88"/>
      <path ${STROKE} d="M 180 80 C 185 90 178 95 170 88"/>
    `,
  },
  {
    key: 'fish',
    keywords: ['魚', '鯨', '鯉', 'さかな', 'くじら', 'fish', 'whale', '海魚'],
    svg: `
      <ellipse cx="95" cy="100" rx="50" ry="28" ${STROKE}/>
      <path ${STROKE} d="M 145 100 L 170 75 L 170 125 Z"/>
      <circle cx="68" cy="95" r="5" ${STROKE}/>
      <path ${STROKE} d="M 80 112 Q 95 118 110 112"/>
      <path ${STROKE} d="M 95 72 Q 110 65 120 72"/>
      <path ${STROKE} d="M 95 128 Q 110 135 120 128"/>
    `,
  },
  {
    key: 'snake',
    keywords: ['蛇', 'ヘビ', 'へび', 'snake', '大蛇', '白蛇'],
    svg: `
      <path ${STROKE} d="
        M 100 160
        C 130 150 150 130 140 110
        C 130 90 100 90 90 70
        C 80 50 100 35 120 40
        C 140 45 150 60 140 70
      "/>
      <ellipse cx="140" cy="70" rx="10" ry="8" ${STROKE}/>
      <path ${STROKE} d="M 148 68 L 158 62 M 148 72 L 158 78"/>
      <circle cx="136" cy="66" r="3" fill="currentColor"/>
    `,
  },
  {
    key: 'bear',
    keywords: ['熊', 'クマ', 'くま', 'bear', '白熊'],
    svg: `
      <ellipse cx="100" cy="115" rx="35" ry="30" ${STROKE}/>
      <ellipse cx="100" cy="88" rx="24" ry="22" ${STROKE}/>
      <circle cx="88" cy="75" r="9" ${STROKE}/>
      <circle cx="112" cy="75" r="9" ${STROKE}/>
      <circle cx="92" cy="87" r="3" fill="currentColor"/>
      <circle cx="108" cy="87" r="3" fill="currentColor"/>
      <path ${STROKE} d="M 95 95 Q 100 100 105 95"/>
      <path ${STROKE} d="M 68 130 L 60 155 M 132 130 L 140 155"/>
      <path ${STROKE} d="M 78 145 L 70 162 M 122 145 L 130 162"/>
    `,
  },
  {
    key: 'horse',
    keywords: ['馬', 'ウマ', 'うま', 'horse', '天馬', '騎馬', 'ペガサス'],
    svg: `
      <path ${STROKE} d="M 75 155 L 75 110 L 90 85 L 115 80 L 140 90 L 145 115 L 130 155"/>
      <ellipse cx="107" cy="78" rx="20" ry="18" ${STROKE}/>
      <path ${STROKE} d="M 95 62 C 93 45 100 35 107 40"/>
      <path ${STROKE} d="M 140 90 L 160 75 L 150 95"/>
      <path ${STROKE} d="M 75 155 L 65 170 M 130 155 L 140 170"/>
      <path ${STROKE} d="M 85 155 L 83 172 M 120 155 L 122 172"/>
      <circle cx="100" cy="73" r="3" fill="currentColor"/>
    `,
  },
  {
    key: 'moon',
    keywords: ['月', 'つき', 'moon', '三日月', '満月', '月光', '夜'],
    svg: `
      <path ${STROKE} d="M 130 60 C 110 62 90 78 88 100 C 86 122 102 142 122 148 C 100 155 75 140 67 115 C 59 90 74 63 98 55 C 109 51 121 53 130 60 Z"/>
      <circle cx="115" cy="75" r="3" fill="currentColor" opacity="0.5"/>
      <circle cx="105" cy="95" r="2" fill="currentColor" opacity="0.4"/>
      <circle cx="120" cy="105" r="4" fill="currentColor" opacity="0.3"/>
    `,
  },
  {
    key: 'sun',
    keywords: ['太陽', 'たいよう', 'sun', '日', '光', '炎', '火', '灼熱'],
    svg: `
      <circle cx="100" cy="100" r="30" ${STROKE}/>
      <line x1="100" y1="55" x2="100" y2="42" ${STROKE}/>
      <line x1="100" y1="145" x2="100" y2="158" ${STROKE}/>
      <line x1="55" y1="100" x2="42" y2="100" ${STROKE}/>
      <line x1="145" y1="100" x2="158" y2="100" ${STROKE}/>
      <line x1="68" y1="68" x2="59" y2="59" ${STROKE}/>
      <line x1="132" y1="68" x2="141" y2="59" ${STROKE}/>
      <line x1="68" y1="132" x2="59" y2="141" ${STROKE}/>
      <line x1="132" y1="132" x2="141" y2="141" ${STROKE}/>
    `,
  },
  {
    key: 'sword',
    keywords: ['剣', 'けん', 'sword', '刀', 'かたな', '武器', '戦士', '騎士', '勇者'],
    svg: `
      <line x1="100" y1="170" x2="100" y2="50" ${STROKE}/>
      <path ${STROKE} d="M 100 50 L 88 70 L 100 62 L 112 70 Z"/>
      <path ${STROKE} d="M 72 148 L 128 148"/>
      <rect x="90" y="148" width="20" height="25" rx="3" ${STROKE}/>
      <path ${STROKE} d="M 100 145 L 88 158 M 100 145 L 112 158" stroke-opacity="0.5"/>
    `,
  },
  {
    key: 'crown',
    keywords: ['王', '女王', '姫', '王子', 'king', 'queen', '王冠', '冠', '皇帝', '神'],
    svg: `
      <path ${STROKE} d="M 40 140 L 40 100 L 65 120 L 100 70 L 135 120 L 160 100 L 160 140 Z"/>
      <circle cx="100" cy="68" r="8" ${STROKE}/>
      <circle cx="40" cy="98" r="6" ${STROKE}/>
      <circle cx="160" cy="98" r="6" ${STROKE}/>
      <line x1="40" y1="140" x2="160" y2="140" ${STROKE}/>
    `,
  },
  {
    key: 'ship',
    keywords: ['船', 'ふね', 'ship', '航海', '帆', '海賊', '漁師'],
    svg: `
      <path ${STROKE} d="M 40 130 Q 100 150 160 130 L 150 115 Q 100 125 50 115 Z"/>
      <line x1="100" y1="115" x2="100" y2="55" ${STROKE}/>
      <path ${STROKE} d="M 100 55 L 100 95 L 145 75 Z"/>
      <path ${STROKE} d="M 100 65 L 100 95 L 58 80 Z"/>
      <path ${STROKE} d="M 40 130 L 28 140 Q 100 155 172 140 L 160 130"/>
    `,
  },
  {
    key: 'traveler',
    keywords: ['旅人', 'たびびと', '旅', 'たび', '旅行', '歩', 'traveler', '冒険', '探検'],
    svg: `
      <circle cx="100" cy="60" r="18" ${STROKE}/>
      <path ${STROKE} d="M 100 78 L 100 130"/>
      <path ${STROKE} d="M 100 95 L 75 115 M 100 95 L 125 115"/>
      <path ${STROKE} d="M 100 130 L 80 160 M 100 130 L 120 160"/>
      <path ${STROKE} d="M 125 115 L 145 100 L 148 115 L 135 118"/>
    `,
  },
  {
    key: 'wave',
    keywords: ['海', 'うみ', '水', 'みず', '川', 'かわ', '波', 'wave', '大洋', '洪水'],
    svg: `
      <path ${STROKE} d="M 20 90 Q 40 70 60 90 Q 80 110 100 90 Q 120 70 140 90 Q 160 110 180 90"/>
      <path ${STROKE} d="M 20 115 Q 40 95 60 115 Q 80 135 100 115 Q 120 95 140 115 Q 160 135 180 115"/>
      <path ${STROKE} d="M 20 140 Q 40 120 60 140 Q 80 160 100 140 Q 120 120 140 140 Q 160 160 180 140"/>
    `,
  },
  {
    key: 'flower',
    keywords: ['花', 'はな', 'flower', '桜', 'さくら', '薔薇', 'ばら', '春'],
    svg: `
      <circle cx="100" cy="100" r="15" ${STROKE}/>
      <ellipse cx="100" cy="68" rx="12" ry="20" ${STROKE}/>
      <ellipse cx="100" cy="132" rx="12" ry="20" ${STROKE}/>
      <ellipse cx="68" cy="100" rx="20" ry="12" ${STROKE}/>
      <ellipse cx="132" cy="100" rx="20" ry="12" ${STROKE}/>
      <ellipse cx="79" cy="79" rx="12" ry="18" transform="rotate(-45 79 79)" ${STROKE}/>
      <ellipse cx="121" cy="79" rx="12" ry="18" transform="rotate(45 121 79)" ${STROKE}/>
      <ellipse cx="79" cy="121" rx="12" ry="18" transform="rotate(45 79 121)" ${STROKE}/>
      <ellipse cx="121" cy="121" rx="12" ry="18" transform="rotate(-45 121 121)" ${STROKE}/>
      <circle cx="100" cy="100" r="7" fill="currentColor" opacity="0.6"/>
    `,
  },
  {
    key: 'mountain',
    keywords: ['山', 'やま', 'mountain', '峰', 'みね', '富士', '高原'],
    svg: `
      <path ${STROKE} d="M 30 165 L 100 40 L 170 165 Z"/>
      <path ${STROKE} d="M 55 165 L 100 90 L 145 165"/>
      <path ${STROKE} d="M 88 52 Q 100 40 112 52 Q 100 48 88 52"/>
      <line x1="30" y1="165" x2="170" y2="165" ${STROKE}/>
    `,
  },
  {
    key: 'tree',
    keywords: ['木', 'き', '森', 'もり', 'tree', 'forest', '樹', '大樹', '神木'],
    svg: `
      <line x1="100" y1="170" x2="100" y2="100" ${STROKE}/>
      <circle cx="100" cy="80" r="40" ${STROKE}/>
      <path ${STROKE} d="M 80 60 C 70 45 75 35 100 30 C 125 35 130 45 120 60"/>
      <path ${STROKE} d="M 100 170 L 80 150 M 100 170 L 120 150"/>
      <path ${STROKE} d="M 68 95 L 50 85 M 132 95 L 150 85"/>
    `,
  },
  {
    key: 'ghost',
    keywords: ['幽霊', '霊', 'ghost', '怪', '妖', '精霊', '魂', '魔', '死'],
    svg: `
      <path ${STROKE} d="
        M 100 40 C 70 40 55 60 55 85
        C 55 110 55 140 50 160
        C 65 155 75 145 100 155
        C 125 145 135 155 150 160
        C 145 140 145 110 145 85
        C 145 60 130 40 100 40 Z
      "/>
      <circle cx="85" cy="85" r="8" fill="currentColor"/>
      <circle cx="115" cy="85" r="8" fill="currentColor"/>
      <path ${STROKE} d="M 88 105 Q 100 115 112 105" stroke-width="4"/>
    `,
  },
  {
    key: 'star_default',
    keywords: [],  // default fallback
    svg: `
      <path ${STROKE} d="M 100 30 L 112 75 L 160 75 L 122 103 L 136 148 L 100 120 L 64 148 L 78 103 L 40 75 L 88 75 Z"/>
      <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.5"/>
    `,
  },
]

/**
 * 星座名と神話テキストからイラストを選ぶ
 */
export function findIllustration(name: string, myth: string): Illustration {
  const text = (name + ' ' + myth).toLowerCase()

  for (const illus of ILLUSTRATIONS) {
    if (illus.key === 'star_default') continue
    if (illus.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      return illus
    }
  }

  // どれにも引っかからなければデフォルト
  return ILLUSTRATIONS[ILLUSTRATIONS.length - 1]
}
