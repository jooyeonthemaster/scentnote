import { Fragrance, FragranceBrand, FragranceNote } from '@/types';

// 향수 브랜드 데이터 (크게 확장)
export const brands: FragranceBrand[] = [
  {
    id: 'maison-margiela',
    name: 'Maison Margiela',
    description: '프랑스의 실험적이고 컨셉츄얼한 패션 하우스',
    country: 'France'
  },
  {
    id: 'tom-ford',
    name: 'Tom Ford',
    description: '럭셔리하고 감각적인 미국 브랜드',
    country: 'USA'
  },
  {
    id: 'le-labo',
    name: 'Le Labo',
    description: '아티자널 향수 전문 브랜드',
    country: 'France'
  },
  {
    id: 'diptyque',
    name: 'Diptyque',
    description: '파리의 클래식 니치 향수 브랜드',
    country: 'France'
  },
  {
    id: 'byredo',
    name: 'Byredo',
    description: '스웨덴의 모던 니치 브랜드',
    country: 'Sweden'
  },
  {
    id: 'creed',
    name: 'Creed',
    description: '영국 왕실 향수 메이커의 전통',
    country: 'UK'
  },
  {
    id: 'jo-malone',
    name: 'Jo Malone London',
    description: '영국의 우아한 향수 브랜드',
    country: 'UK'
  },
  {
    id: 'chanel',
    name: 'Chanel',
    description: '프랑스 럭셔리의 아이콘',
    country: 'France'
  },
  {
    id: 'hermès',
    name: 'Hermès',
    description: '프랑스 명품 하우스의 향수 라인',
    country: 'France'
  },
  {
    id: 'kilian',
    name: 'Kilian',
    description: '로맨틱하고 럭셔리한 프랑스 향수',
    country: 'France'
  },
  {
    id: 'narciso-rodriguez',
    name: 'Narciso Rodriguez',
    description: '모던하고 센슈얼한 머스크의 대가',
    country: 'USA'
  },
  {
    id: 'prada',
    name: 'Prada',
    description: '이탈리아 럭셔리 패션의 향수',
    country: 'Italy'
  }
];

// 향수 노트 데이터 (대폭 확장)
export const notes: FragranceNote[] = [
  // Top Notes
  { id: 'bergamot', name: '베르가못', category: 'top', description: '상쾌한 시트러스' },
  { id: 'lemon', name: '레몬', category: 'top', description: '밝고 청량한 시트러스' },
  { id: 'pink-pepper', name: '핑크 페퍼', category: 'top', description: '스파이시하고 신선한' },
  { id: 'lavender', name: '라벤더', category: 'top', description: '진정하고 허브향이 나는' },
  { id: 'grapefruit', name: '자몽', category: 'top', description: '상쾌하고 쌉쌀한 시트러스' },
  { id: 'black-pepper', name: '블랙 페퍼', category: 'top', description: '강렬하고 스파이시한' },
  { id: 'cardamom', name: '카다몬', category: 'top', description: '따뜻하고 향신료의' },
  { id: 'mandarin', name: '만다린', category: 'top', description: '달콤하고 상큼한 시트러스' },
  
  // Middle Notes
  { id: 'rose', name: '로즈', category: 'middle', description: '클래식한 플로럴' },
  { id: 'jasmine', name: '자스민', category: 'middle', description: '관능적인 화이트 플로럴' },
  { id: 'iris', name: '아이리스', category: 'middle', description: '파우더리하고 우아한' },
  { id: 'geranium', name: '제라늄', category: 'middle', description: '그린하고 로지한' },
  { id: 'ylang-ylang', name: '일랑일랑', category: 'middle', description: '열대적이고 관능적인' },
  { id: 'peony', name: '피오니', category: 'middle', description: '부드럽고 로맨틱한' },
  { id: 'lily-of-valley', name: '은방울꽃', category: 'middle', description: '순수하고 깨끗한' },
  { id: 'orange-blossom', name: '오렌지 블로섬', category: 'middle', description: '달콤하고 플로럴한' },
  { id: 'fig', name: '무화과', category: 'middle', description: '그린하고 크리미한' },
  { id: 'tea', name: '차', category: 'middle', description: '그린하고 차분한' },
  
  // Base Notes
  { id: 'sandalwood', name: '샌달우드', category: 'base', description: '크리미하고 따뜻한 우드' },
  { id: 'cedar', name: '시더', category: 'base', description: '드라이하고 우디한' },
  { id: 'vanilla', name: '바닐라', category: 'base', description: '달콤하고 따뜻한' },
  { id: 'musk', name: '머스크', category: 'base', description: '센슈얼하고 클린한' },
  { id: 'ambergris', name: '앰버', category: 'base', description: '따뜻하고 레진한' },
  { id: 'patchouli', name: '패츌리', category: 'base', description: '어스시하고 깊은' },
  { id: 'vetiver', name: '베티버', category: 'base', description: '그린하고 어스시한' },
  { id: 'oud', name: '우드', category: 'base', description: '동양적이고 신비로운' },
  { id: 'white-musk', name: '화이트 머스크', category: 'base', description: '클린하고 순수한' },
  { id: 'tobacco', name: '담배', category: 'base', description: '따뜻하고 스모키한' },
  { id: 'benzoin', name: '벤조인', category: 'base', description: '발삼 향의 따뜻한' },
  { id: 'tonka-bean', name: '통카빈', category: 'base', description: '달콤하고 바닐라 같은' }
];

// 대폭 확장된 향수 데이터 (30+ 개)
export const fragrances: Fragrance[] = [
  // Maison Margiela
  {
    id: 'replica-by-the-fireplace',
    name: 'REPLICA By the Fireplace',
    brand: brands[0],
    description: '벽난로 앞의 따뜻한 겨울 저녁을 표현한 향수',
    notes: {
      top: [notes.find(n => n.id === 'pink-pepper')!],
      middle: [notes.find(n => n.id === 'geranium')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'vanilla')!]
    },
    concentration: 'edt',
    releaseYear: 2015,
    price: { amount: 165000, currency: 'KRW' }
  },
  {
    id: 'replica-jazz-club',
    name: 'REPLICA Jazz Club',
    brand: brands[0],
    description: '재즈 클럽의 따뜻하고 스모키한 분위기',
    notes: {
      top: [notes.find(n => n.id === 'pink-pepper')!, notes.find(n => n.id === 'lemon')!],
      middle: [notes.find(n => n.id === 'jasmine')!],
      base: [notes.find(n => n.id === 'vanilla')!, notes.find(n => n.id === 'cedar')!]
    },
    concentration: 'edt',
    releaseYear: 2013,
    price: { amount: 165000, currency: 'KRW' }
  },
  {
    id: 'replica-beach-walk',
    name: 'REPLICA Beach Walk',
    brand: brands[0],
    description: '여름 해변의 기억을 담은 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'lemon')!],
      middle: [notes.find(n => n.id === 'ylang-ylang')!, notes.find(n => n.id === 'fig')!],
      base: [notes.find(n => n.id === 'musk')!, notes.find(n => n.id === 'cedar')!]
    },
    concentration: 'edt',
    releaseYear: 2012,
    price: { amount: 165000, currency: 'KRW' }
  },

  // Tom Ford
  {
    id: 'tom-ford-oud-wood',
    name: 'Oud Wood',
    brand: brands[1],
    description: '동양적이고 럭셔리한 우드 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'oud')!]
    },
    concentration: 'edp',
    releaseYear: 2007,
    price: { amount: 280000, currency: 'KRW' }
  },
  {
    id: 'tom-ford-tobacco-vanille',
    name: 'Tobacco Vanille',
    brand: brands[1],
    description: '따뜻한 담배와 바닐라의 조화',
    notes: {
      top: [notes.find(n => n.id === 'pink-pepper')!],
      middle: [notes.find(n => n.id === 'jasmine')!],
      base: [notes.find(n => n.id === 'vanilla')!, notes.find(n => n.id === 'tobacco')!]
    },
    concentration: 'edp',
    releaseYear: 2007,
    price: { amount: 350000, currency: 'KRW' }
  },
  {
    id: 'tom-ford-lost-cherry',
    name: 'Lost Cherry',
    brand: brands[1],
    description: '달콤하고 관능적인 체리 향',
    notes: {
      top: [notes.find(n => n.id === 'black-pepper')!],
      middle: [notes.find(n => n.id === 'jasmine')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'tonka-bean')!, notes.find(n => n.id === 'sandalwood')!]
    },
    concentration: 'edp',
    releaseYear: 2018,
    price: { amount: 390000, currency: 'KRW' }
  },

  // Le Labo
  {
    id: 'le-labo-santal-33',
    name: 'Santal 33',
    brand: brands[2],
    description: '미국 서부의 거친 샌달우드 향',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'iris')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'cedar')!]
    },
    concentration: 'edp',
    releaseYear: 2011,
    price: { amount: 320000, currency: 'KRW' }
  },
  {
    id: 'le-labo-another-13',
    name: 'Another 13',
    brand: brands[2],
    description: '미스터리하고 매혹적인 머스크',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'jasmine')!],
      base: [notes.find(n => n.id === 'musk')!, notes.find(n => n.id === 'ambergris')!]
    },
    concentration: 'edp',
    releaseYear: 2010,
    price: { amount: 320000, currency: 'KRW' }
  },
  {
    id: 'le-labo-the-noir-29',
    name: 'Thé Noir 29',
    brand: brands[2],
    description: '차와 담배의 만남',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'cardamom')!],
      middle: [notes.find(n => n.id === 'tea')!, notes.find(n => n.id === 'fig')!],
      base: [notes.find(n => n.id === 'tobacco')!, notes.find(n => n.id === 'cedar')!]
    },
    concentration: 'edp',
    releaseYear: 2012,
    price: { amount: 320000, currency: 'KRW' }
  },

  // Diptyque
  {
    id: 'diptyque-philosykos',
    name: 'Philosykos',
    brand: brands[3],
    description: '그리스 무화과나무의 모든 부분을 표현',
    notes: {
      top: [notes.find(n => n.id === 'lemon')!],
      middle: [notes.find(n => n.id === 'fig')!],
      base: [notes.find(n => n.id === 'cedar')!, notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edt',
    releaseYear: 1996,
    price: { amount: 180000, currency: 'KRW' }
  },
  {
    id: 'diptyque-do-son',
    name: 'Do Son',
    brand: brands[3],
    description: '베트남 해변의 튜베로즈',
    notes: {
      top: [notes.find(n => n.id === 'mandarin')!],
      middle: [notes.find(n => n.id === 'orange-blossom')!, notes.find(n => n.id === 'jasmine')!],
      base: [notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edt',
    releaseYear: 2005,
    price: { amount: 180000, currency: 'KRW' }
  },

  // Byredo
  {
    id: 'byredo-gypsy-water',
    name: 'Gypsy Water',
    brand: brands[4],
    description: '집시의 자유로운 영혼을 담은 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'lemon')!],
      middle: [notes.find(n => n.id === 'iris')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'vanilla')!]
    },
    concentration: 'edp',
    releaseYear: 2008,
    price: { amount: 240000, currency: 'KRW' }
  },
  {
    id: 'byredo-bal-dafrique',
    name: 'Bal d\'Afrique',
    brand: brands[4],
    description: '아프리카의 파리, 벨 에포크 시대의 이국적 파티',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'lemon')!],
      middle: [notes.find(n => n.id === 'iris')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'cedar')!, notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edp',
    releaseYear: 2009,
    price: { amount: 240000, currency: 'KRW' }
  },

  // Creed
  {
    id: 'creed-aventus',
    name: 'Aventus',
    brand: brands[5],
    description: '성공과 힘을 상징하는 남성 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'black-pepper')!],
      middle: [notes.find(n => n.id === 'rose')!, notes.find(n => n.id === 'jasmine')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edp',
    releaseYear: 2010,
    price: { amount: 450000, currency: 'KRW' }
  },
  {
    id: 'creed-green-irish-tweed',
    name: 'Green Irish Tweed',
    brand: brands[5],
    description: '아일랜드의 푸른 자연을 담은 클래식',
    notes: {
      top: [notes.find(n => n.id === 'lemon')!, notes.find(n => n.id === 'lavender')!],
      middle: [notes.find(n => n.id === 'geranium')!, notes.find(n => n.id === 'iris')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'ambergris')!]
    },
    concentration: 'edp',
    releaseYear: 1985,
    price: { amount: 420000, currency: 'KRW' }
  },

  // Jo Malone London
  {
    id: 'jo-malone-english-oak-hazelnut',
    name: 'English Oak & Hazelnut',
    brand: brands[6],
    description: '영국 숲의 견과류와 오크의 조화',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'cedar')!, notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edc',
    releaseYear: 2017,
    price: { amount: 220000, currency: 'KRW' }
  },
  {
    id: 'jo-malone-wood-sage-sea-salt',
    name: 'Wood Sage & Sea Salt',
    brand: brands[6],
    description: '바닷가 절벽의 야생 세이지',
    notes: {
      top: [notes.find(n => n.id === 'grapefruit')!],
      middle: [notes.find(n => n.id === 'geranium')!],
      base: [notes.find(n => n.id === 'cedar')!, notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edc',
    releaseYear: 2014,
    price: { amount: 220000, currency: 'KRW' }
  },

  // Chanel
  {
    id: 'chanel-chance-eau-tendre',
    name: 'Chance Eau Tendre',
    brand: brands[7],
    description: '부드럽고 로맨틱한 플로럴 프루티',
    notes: {
      top: [notes.find(n => n.id === 'grapefruit')!],
      middle: [notes.find(n => n.id === 'jasmine')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'white-musk')!, notes.find(n => n.id === 'cedar')!]
    },
    concentration: 'edt',
    releaseYear: 2010,
    price: { amount: 180000, currency: 'KRW' }
  },
  {
    id: 'chanel-coco-mademoiselle',
    name: 'Coco Mademoiselle',
    brand: brands[7],
    description: '현대적이고 대담한 여성을 위한 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'mandarin')!],
      middle: [notes.find(n => n.id === 'jasmine')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'patchouli')!, notes.find(n => n.id === 'vanilla')!]
    },
    concentration: 'edp',
    releaseYear: 2001,
    price: { amount: 200000, currency: 'KRW' }
  },

  // Hermès
  {
    id: 'hermes-terre-d-hermes',
    name: 'Terre d\'Hermès',
    brand: brands[8],
    description: '대지와 하늘을 잇는 남성적인 향',
    notes: {
      top: [notes.find(n => n.id === 'grapefruit')!, notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'geranium')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'cedar')!, notes.find(n => n.id === 'vetiver')!]
    },
    concentration: 'edt',
    releaseYear: 2006,
    price: { amount: 170000, currency: 'KRW' }
  },
  {
    id: 'hermes-jour-d-hermes',
    name: 'Jour d\'Hermès',
    brand: brands[8],
    description: '여성스러움을 재정의한 플로럴',
    notes: {
      top: [notes.find(n => n.id === 'lemon')!, notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'jasmine')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'white-musk')!, notes.find(n => n.id === 'cedar')!]
    },
    concentration: 'edp',
    releaseYear: 2013,
    price: { amount: 190000, currency: 'KRW' }
  },

  // Kilian
  {
    id: 'kilian-love-dont-be-shy',
    name: 'Love, Don\'t Be Shy',
    brand: brands[9],
    description: '달콤하고 관능적인 마시멜로우 향',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'orange-blossom')!, notes.find(n => n.id === 'jasmine')!],
      base: [notes.find(n => n.id === 'vanilla')!, notes.find(n => n.id === 'musk')!]
    },
    concentration: 'edp',
    releaseYear: 2007,
    price: { amount: 380000, currency: 'KRW' }
  },
  {
    id: 'kilian-good-girl-gone-bad',
    name: 'Good Girl Gone Bad',
    brand: brands[9],
    description: '악동 같은 매력의 오스만투스 향',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'pink-pepper')!],
      middle: [notes.find(n => n.id === 'rose')!, notes.find(n => n.id === 'iris')!],
      base: [notes.find(n => n.id === 'sandalwood')!, notes.find(n => n.id === 'vanilla')!]
    },
    concentration: 'edp',
    releaseYear: 2012,
    price: { amount: 380000, currency: 'KRW' }
  },

  // Narciso Rodriguez
  {
    id: 'narciso-rodriguez-for-her',
    name: 'For Her',
    brand: brands[10],
    description: '순수하고 관능적인 머스크의 정수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'pink-pepper')!],
      middle: [notes.find(n => n.id === 'rose')!, notes.find(n => n.id === 'peony')!],
      base: [notes.find(n => n.id === 'musk')!, notes.find(n => n.id === 'patchouli')!]
    },
    concentration: 'edt',
    releaseYear: 2003,
    price: { amount: 150000, currency: 'KRW' }
  },
  {
    id: 'narciso-rodriguez-musc-noir',
    name: 'Musc Noir',
    brand: brands[10],
    description: '어둡고 매혹적인 머스크',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'iris')!, notes.find(n => n.id === 'rose')!],
      base: [notes.find(n => n.id === 'musk')!, notes.find(n => n.id === 'patchouli')!]
    },
    concentration: 'edp',
    releaseYear: 2014,
    price: { amount: 180000, currency: 'KRW' }
  },

  // Prada
  {
    id: 'prada-luna-rossa',
    name: 'Luna Rossa',
    brand: brands[11],
    description: '바다와 도전 정신을 담은 스포츠 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!, notes.find(n => n.id === 'lavender')!],
      middle: [notes.find(n => n.id === 'orange-blossom')!, notes.find(n => n.id === 'iris')!],
      base: [notes.find(n => n.id === 'musk')!, notes.find(n => n.id === 'ambergris')!]
    },
    concentration: 'edt',
    releaseYear: 2012,
    price: { amount: 130000, currency: 'KRW' }
  },
  {
    id: 'prada-candy',
    name: 'Candy',
    brand: brands[11],
    description: '달콤하고 현대적인 카라멜 향수',
    notes: {
      top: [notes.find(n => n.id === 'bergamot')!],
      middle: [notes.find(n => n.id === 'peony')!],
      base: [notes.find(n => n.id === 'vanilla')!, notes.find(n => n.id === 'benzoin')!]
    },
    concentration: 'edp',
    releaseYear: 2011,
    price: { amount: 160000, currency: 'KRW' }
  }
];

// 카테고리별 향수 검색 함수
export function getFragrancesByBrand(brandId: string): Fragrance[] {
  return fragrances.filter(f => f.brand.id === brandId);
}

export function getFragrancesByNote(noteId: string): Fragrance[] {
  return fragrances.filter(f => 
    Object.values(f.notes).flat().some(note => note.id === noteId)
  );
}

export function getFragrancesByConcentration(concentration: string): Fragrance[] {
  return fragrances.filter(f => f.concentration === concentration);
}

// 랜덤 향수 선택 함수
export function getRandomFragrances(count: number = 3): Fragrance[] {
  const shuffled = [...fragrances].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
} 