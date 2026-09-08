import { Category } from '../types';
import { objectParticle, subjectParticle, withParticleGwa } from '../utils/korean';

export const CATEGORIES: Category[] = [
  {
    key: 'weather',
    title: '날씨',
    question: '오늘 날씨는 어땠나요?',
    words: [
      {
        id: 'w1',
        label: '맑음',
        emoji: '☀️',
        fragment: '하늘이 맑고 화창했다',
        variants: [
          { label: '쨍쨍하게', fragment: '구름 한 점 없이 쨍쨍했다' },
          { label: '눈부시게', fragment: '햇살이 눈부시게 쏟아졌다' },
        ],
      },
      {
        id: 'w2',
        label: '흐림',
        emoji: '☁️',
        fragment: '하늘이 잔뜩 흐렸다',
        variants: [
          { label: '우중충하게', fragment: '하늘이 우중충하게 가라앉았다' },
          { label: '비 올 듯', fragment: '금방이라도 비가 쏟아질 듯했다' },
        ],
      },
      {
        id: 'w3',
        label: '비',
        emoji: '🌧️',
        fragment: '하루 종일 비가 내렸다',
        variants: [
          { label: '부슬부슬', fragment: '부슬비가 조용히 내렸다' },
          { label: '장대비', fragment: '장대비가 세차게 쏟아졌다' },
        ],
      },
      {
        id: 'w4',
        label: '눈',
        emoji: '❄️',
        fragment: '하얀 눈이 소복이 내렸다',
        variants: [
          { label: '흩날리다', fragment: '눈발이 흩날렸다' },
          { label: '함박눈', fragment: '함박눈이 펑펑 내렸다' },
        ],
      },
      {
        id: 'w5',
        label: '바람',
        emoji: '🍃',
        fragment: '선선한 바람이 불었다',
        variants: [
          { label: '세찬 바람', fragment: '세찬 바람이 휘몰아쳤다' },
          { label: '산들바람', fragment: '산들바람이 살랑였다' },
        ],
      },
      {
        id: 'w6',
        label: '무지개',
        emoji: '🌈',
        fragment: '비 갠 뒤 무지개가 떴다',
        variants: [
          { label: '쌍무지개', fragment: '쌍무지개가 하늘을 수놓았다' },
          { label: '희미하게', fragment: '무지개가 희미하게 걸렸다' },
        ],
      },
      {
        id: 'w7',
        label: '별밤',
        emoji: '🌌',
        fragment: '밤하늘에 별이 유난히 반짝였다',
        variants: [
          { label: '쏟아질 듯', fragment: '별들이 쏟아질 듯 빛났다' },
          { label: '은하수', fragment: '은하수가 길게 흘렀다' },
        ],
      },
      {
        id: 'w8',
        label: '안개',
        emoji: '🌫️',
        fragment: '뿌연 안개가 도시를 감쌌다',
        variants: [
          { label: '자욱하게', fragment: '안개가 자욱하게 깔렸다' },
          { label: '몽환적으로', fragment: '거리가 몽환적으로 흐려졌다' },
        ],
      },
      {
        id: 'w9',
        label: '폭염',
        emoji: '🔥',
        fragment: '푹푹 찌는 무더위였다',
        variants: [
          { label: '숨 막히는 더위', fragment: '숨 막히는 더위가 이어졌다' },
          { label: '에어컨 필수', fragment: '에어컨 없이는 버티기 힘들었다' },
        ],
      },
      {
        id: 'w10',
        label: '소나기',
        emoji: '🌦️',
        fragment: '지나가는 소나기가 한바탕 쏟아졌다',
        variants: [
          { label: '갑자기 흠뻑', fragment: '갑작스러운 비에 흠뻑 젖었다' },
          { label: '더위 식힘', fragment: '소나기 덕에 더위가 한풀 꺾였다' },
        ],
      },
      {
        id: 'w11',
        label: '이슬비',
        emoji: '💧',
        fragment: '가늘게 이슬비가 내렸다',
        variants: [
          { label: '촉촉하게', fragment: '촉촉하게 이슬비가 스며들었다' },
          { label: '우산 없이도', fragment: '우산 없이도 걸을 만했다' },
        ],
      },
      {
        id: 'w12',
        label: '첫서리',
        emoji: '🥶',
        fragment: '올가을 첫서리가 내렸다',
        variants: [
          { label: '차가운 아침', fragment: '아침 공기가 유난히 차가웠다' },
          { label: '겨울 예감', fragment: '겨울이 성큼 다가온 것 같았다' },
        ],
      },
      {
        id: 'w13',
        label: '노을',
        emoji: '🌇',
        fragment: '붉은 노을이 하늘을 물들였다',
        variants: [
          { label: '주황빛으로', fragment: '하늘이 온통 주황빛으로 물들었다' },
          { label: '한참을 바라봄', fragment: '노을을 한참 동안 바라봤다' },
        ],
      },
      {
        id: 'w14',
        label: '먹구름',
        emoji: '⛈️',
        fragment: '먹구름이 잔뜩 몰려왔다',
        variants: [
          { label: '금세 어두워짐', fragment: '하늘이 금세 어두워졌다' },
          { label: '멀리서 천둥', fragment: '천둥소리가 멀리서 들려왔다' },
        ],
      },
      {
        id: 'w15',
        label: '봄바람',
        emoji: '🌸',
        fragment: '포근한 봄바람이 불었다',
        variants: [
          { label: '꽃향기 실린', fragment: '꽃향기 실린 바람이 불었다' },
          { label: '외투 없이도', fragment: '겨울 외투를 벗어도 될 만큼 따뜻했다' },
        ],
      },
      {
        id: 'w16',
        label: '가을하늘',
        emoji: '🍂',
        fragment: '높고 맑은 가을 하늘이었다',
        variants: [
          { label: '구름 한 점 없이', fragment: '구름 한 점 없이 청명했다' },
          { label: '유난히 높은', fragment: '하늘이 유난히 높아 보였다' },
        ],
      },
    ],
  },
  {
    key: 'mood',
    title: '기분',
    question: '오늘의 기분은?',
    words: [
      {
        id: 'm1',
        label: '설렘',
        emoji: '💓',
        fragment: '마음 한켠이 자꾸만 설렜다',
        variants: [
          { label: '두방망이질', fragment: '심장이 두방망이질했다' },
          { label: '간질간질', fragment: '마음이 간질간질했다' },
        ],
      },
      {
        id: 'm2',
        label: '평온',
        emoji: '🍵',
        fragment: '잔잔하고 평온한 하루였다',
        variants: [
          { label: '고요하게', fragment: '마음이 고요하게 가라앉았다' },
          { label: '느긋하게', fragment: '느긋하고 평화로운 하루였다' },
        ],
      },
      {
        id: 'm3',
        label: '뿌듯',
        emoji: '✨',
        fragment: '왠지 모르게 뿌듯한 기분이 들었다',
        variants: [
          { label: '스스로 대견', fragment: '스스로가 대견하게 느껴졌다' },
          { label: '자신감', fragment: '자신감이 차올랐다' },
        ],
      },
      {
        id: 'm4',
        label: '피곤',
        emoji: '🥱',
        fragment: '몸도 마음도 조금 피곤했다',
        variants: [
          { label: '녹초', fragment: '몸이 녹초가 되었다' },
          { label: '무기력', fragment: '하루 종일 무기력했다' },
        ],
      },
      {
        id: 'm5',
        label: '그리움',
        emoji: '🌙',
        fragment: '누군가가 문득 그리워졌다',
        variants: [
          { label: '울컥', fragment: '그리움에 울컥했다' },
          { label: '사무치게', fragment: '누군가가 사무치게 보고 싶었다' },
        ],
      },
      {
        id: 'm6',
        label: '행복',
        emoji: '🌼',
        fragment: '별거 아닌 순간에도 행복했다',
        variants: [
          { label: '미소가 절로', fragment: '미소가 절로 지어졌다' },
          { label: '충만하게', fragment: '행복감이 마음에 충만했다' },
        ],
      },
      {
        id: 'm7',
        label: '살짝 우울',
        emoji: '🌧️',
        fragment: '이유 없이 마음이 살짝 가라앉았다',
        variants: [
          { label: '울적하게', fragment: '괜히 울적한 기분이 들었다' },
          { label: '눈물이 핑', fragment: '이유 없이 눈물이 핑 돌았다' },
        ],
      },
      {
        id: 'm8',
        label: '두근두근',
        emoji: '💫',
        fragment: '괜히 가슴이 두근거렸다',
        variants: [
          { label: '콩닥콩닥', fragment: '가슴이 콩닥콩닥 뛰었다' },
          { label: '긴장되게', fragment: '괜히 긴장이 되었다' },
        ],
      },
      {
        id: 'm9',
        label: '홀가분함',
        emoji: '🕊️',
        fragment: '묵은 짐을 던 듯 홀가분했다',
        variants: [
          { label: '마음의 짐을 내려놓음', fragment: '마음의 짐을 내려놓은 기분이었다' },
          { label: '가볍고 자유롭게', fragment: '가볍고 자유로운 하루였다' },
        ],
      },
      {
        id: 'm10',
        label: '답답함',
        emoji: '😤',
        fragment: '괜히 마음이 답답했다',
        variants: [
          { label: '속이 꽉 막힘', fragment: '속이 꽉 막힌 듯했다' },
          { label: '훌쩍 떠나고 싶음', fragment: '어디론가 훌쩍 떠나고 싶었다' },
        ],
      },
      {
        id: 'm11',
        label: '감사함',
        emoji: '🙏',
        fragment: '작은 것에도 감사한 마음이 들었다',
        variants: [
          { label: '고마운 사람들', fragment: '고마운 사람들이 떠올랐다' },
          { label: '당연한 게 없음', fragment: '당연한 게 당연하지 않다는 걸 느꼈다' },
        ],
      },
      {
        id: 'm12',
        label: '심심함',
        emoji: '😐',
        fragment: '딱히 할 일 없이 심심했다',
        variants: [
          { label: '무료한 시간', fragment: '무료한 시간이 계속됐다' },
          { label: '스마트폰만', fragment: '괜히 스마트폰만 만지작거렸다' },
        ],
      },
      {
        id: 'm13',
        label: '짜릿함',
        emoji: '⚡',
        fragment: '짜릿한 손맛에 기분이 좋아졌다',
        variants: [
          { label: '심장이 쫄깃', fragment: '심장이 쫄깃해지는 순간이었다' },
          { label: '전율이 느껴짐', fragment: '짜릿한 전율이 느껴졌다' },
        ],
      },
      {
        id: 'm14',
        label: '몽글몽글함',
        emoji: '🐑',
        fragment: '마음이 몽글몽글해졌다',
        variants: [
          { label: '따뜻하게', fragment: '마음이 몽글몽글 따뜻해졌다' },
          { label: '웃음이 새어나옴', fragment: '괜히 웃음이 새어 나왔다' },
        ],
      },
      {
        id: 'm15',
        label: '허전함',
        emoji: '🍂',
        fragment: '괜스레 마음 한구석이 허전했다',
        variants: [
          { label: '뭔가 빠진 듯', fragment: '뭔가 빠진 듯한 기분이었다' },
          { label: '쓸쓸하게', fragment: '괜히 마음이 쓸쓸했다' },
        ],
      },
      {
        id: 'm16',
        label: '벅참',
        emoji: '🌊',
        fragment: '벅찬 감정이 밀려왔다',
        variants: [
          { label: '가슴이 뭉클', fragment: '가슴이 뭉클해졌다' },
          { label: '말로 못 할 감정', fragment: '말로 표현 못 할 감정이 차올랐다' },
        ],
      },
    ],
  },
  {
    key: 'person',
    title: '함께한 사람',
    question: '오늘은 누구와 함께였나요?',
    words: [
      {
        id: 'p1',
        label: '나 혼자',
        emoji: '🧍',
        fragment: '온전히 혼자만의 시간을 보냈다',
        variants: [
          { label: '고요히 홀로', fragment: '고요히 홀로 시간을 보냈다' },
          { label: '자유롭게', fragment: '누구의 방해도 없이 자유로웠다' },
        ],
      },
      {
        id: 'p2',
        label: '가족',
        emoji: '👨‍👩‍👧',
        fragment: '가족과 함께 시간을 보냈다',
        variants: [
          { label: '부모님과', fragment: '부모님과 오랜만에 이야기를 나눴다' },
          { label: '온 가족이', fragment: '온 가족이 모여 웃었다' },
        ],
      },
      {
        id: 'p3',
        label: '친구',
        emoji: '🧑‍🤝‍🧑',
        fragment: '친구를 만나 이야기를 나눴다',
        nameable: true,
        fragmentTemplate: (name) => `${objectParticle(name)} 만나 이야기를 나눴다`,
        variants: [
          { label: '오랜만에 반가움', fragment: '오랜만에 친구를 만나 반가웠다' },
          { label: '깊은 대화', fragment: '친구와 깊은 대화를 나눴다' },
        ],
      },
      {
        id: 'p4',
        label: '연인',
        emoji: '💞',
        fragment: '사랑하는 사람과 함께였다',
        nameable: true,
        fragmentTemplate: (name) => `사랑하는 ${withParticleGwa(name)} 함께였다`,
        variants: [
          { label: '설레는 데이트', fragment: '연인과 설레는 데이트를 즐겼다' },
          { label: '다정하게', fragment: '다정한 순간을 함께 나눴다' },
        ],
      },
      {
        id: 'p5',
        label: '반려동물',
        emoji: '🐾',
        fragment: '반려동물과 하루 종일 붙어 있었다',
        nameable: true,
        fragmentTemplate: (name) => `${withParticleGwa(name)} 하루 종일 붙어 있었다`,
        variants: [
          { label: '산책까지', fragment: '반려동물과 신나게 산책했다' },
          { label: '애교부리며', fragment: '반려동물이 애교를 부렸다' },
        ],
      },
      {
        id: 'p6',
        label: '동료',
        emoji: '🧑‍💻',
        fragment: '동료들과 이런저런 이야기를 나눴다',
        variants: [
          { label: '협업하며', fragment: '동료들과 손발을 맞춰 일했다' },
          { label: '회의하며', fragment: '동료들과 회의를 하며 아이디어를 나눴다' },
        ],
      },
      {
        id: 'p7',
        label: '낯선 사람',
        emoji: '🙋',
        fragment: '낯선 사람과 짧은 인연이 스쳤다',
        variants: [
          { label: '친절을 베풀다', fragment: '낯선 사람에게 작은 친절을 베풀었다' },
          { label: '도움을 받다', fragment: '낯선 사람에게 뜻밖의 도움을 받았다' },
        ],
      },
      {
        id: 'p8',
        label: '오랜 친구',
        emoji: '📞',
        fragment: '오랜만에 옛 친구가 떠올랐다',
        nameable: true,
        fragmentTemplate: (name) => `오랜만에 ${subjectParticle(name)} 떠올랐다`,
        variants: [
          { label: '연락해보다', fragment: '오랜만에 옛 친구에게 연락해보았다' },
          { label: '추억에 잠기다', fragment: '옛 추억이 문득 떠올랐다' },
        ],
      },
      {
        id: 'p9',
        label: '이웃',
        emoji: '🏘️',
        fragment: '이웃과 가벼운 인사를 나눴다',
        nameable: true,
        fragmentTemplate: (name) => `${withParticleGwa(name)} 가벼운 인사를 나눴다`,
        variants: [
          { label: '짧은 대화', fragment: '이웃과 짧은 대화를 나눴다' },
          { label: '작은 도움', fragment: '이웃에게 작은 도움을 받았다' },
        ],
      },
      {
        id: 'p10',
        label: '선생님',
        emoji: '👩‍🏫',
        fragment: '선생님께 좋은 이야기를 들었다',
        variants: [
          { label: '응원이 힘이 됨', fragment: '선생님의 응원이 힘이 됐다' },
          { label: '문득 생각남', fragment: '오랜만에 선생님이 생각났다' },
        ],
      },
      {
        id: 'p11',
        label: '후배',
        emoji: '🙋‍♂️',
        fragment: '후배와 이런저런 이야기를 나눴다',
        nameable: true,
        fragmentTemplate: (name) => `${withParticleGwa(name)} 이런저런 이야기를 나눴다`,
        variants: [
          { label: '성장이 대견함', fragment: '후배의 성장이 대견했다' },
          { label: '밥을 사줌', fragment: '후배에게 밥을 사줬다' },
        ],
      },
      {
        id: 'p12',
        label: '선배',
        emoji: '🙋‍♀️',
        fragment: '선배에게 좋은 조언을 들었다',
        nameable: true,
        fragmentTemplate: (name) => `${name}에게 좋은 조언을 들었다`,
        variants: [
          { label: '커피 한 잔', fragment: '선배와 커피 한 잔을 했다' },
          { label: '큰 힘이 됨', fragment: '선배 이야기에 큰 힘을 얻었다' },
        ],
      },
      {
        id: 'p13',
        label: '아이',
        emoji: '👶',
        fragment: '아이의 웃음에 하루가 풀렸다',
        variants: [
          { label: '신나게 놀아줌', fragment: '아이와 신나게 놀아줬다' },
          { label: '재잘거림', fragment: '아이의 재잘거림이 사랑스러웠다' },
        ],
      },
      {
        id: 'p14',
        label: '손님',
        emoji: '🙇',
        fragment: '손님을 정성껏 맞이했다',
        variants: [
          { label: '즐거운 대화', fragment: '손님과 즐거운 대화를 나눴다' },
          { label: '활기찬 하루', fragment: '손님 덕분에 하루가 활기찼다' },
        ],
      },
      {
        id: 'p15',
        label: '온라인 친구',
        emoji: '💻',
        fragment: '온라인 친구와 오랜만에 대화했다',
        nameable: true,
        fragmentTemplate: (name) => `${withParticleGwa(name)} 오랜만에 대화했다`,
        variants: [
          { label: '같이 게임함', fragment: '온라인 친구와 게임을 했다' },
          { label: '마음이 통함', fragment: '화면 너머로도 마음이 통했다' },
        ],
      },
      {
        id: 'p16',
        label: '단골 사장님',
        emoji: '🧑‍🍳',
        fragment: '단골 가게 사장님과 안부를 나눴다',
        variants: [
          { label: '서비스를 챙겨줌', fragment: '사장님이 서비스를 챙겨주셨다' },
          { label: '정겨운 대화', fragment: '정겨운 대화가 오갔다' },
        ],
      },
    ],
  },
  {
    key: 'place',
    title: '장소',
    question: '어디에서 하루를 보냈나요?',
    words: [
      {
        id: 'pl1',
        label: '집',
        emoji: '🏠',
        fragment: '하루 종일 집에 머물렀다',
        variants: [
          { label: '이불 밖은 위험', fragment: '이불 속에서 뒹굴거렸다' },
          { label: '집안일', fragment: '밀린 집안일을 했다' },
        ],
      },
      {
        id: 'pl2',
        label: '카페',
        emoji: '☕',
        fragment: '좋아하는 카페에 다녀왔다',
        variants: [
          { label: '창가 자리', fragment: '카페 창가 자리에 오래 앉아 있었다' },
          { label: '새로운 카페', fragment: '처음 가보는 카페를 찾아갔다' },
        ],
      },
      {
        id: 'pl3',
        label: '일터',
        emoji: '🏢',
        fragment: '일터에서 분주한 시간을 보냈다',
        variants: [
          { label: '정신없이', fragment: '일터에서 정신없이 하루를 보냈다' },
          { label: '여유롭게', fragment: '일터에서 비교적 여유로운 하루를 보냈다' },
        ],
      },
      {
        id: 'pl4',
        label: '공원',
        emoji: '🌳',
        fragment: '동네 공원을 천천히 걸었다',
        variants: [
          { label: '벤치에 앉아', fragment: '공원 벤치에 앉아 바람을 쐬었다' },
          { label: '돗자리 피크닉', fragment: '공원에 돗자리를 펴고 쉬었다' },
        ],
      },
      {
        id: 'pl5',
        label: '바다',
        emoji: '🌊',
        fragment: '바다를 보러 다녀왔다',
        variants: [
          { label: '파도 소리', fragment: '파도 소리를 한참 들었다' },
          { label: '노을 지는', fragment: '바다에 지는 노을을 바라봤다' },
        ],
      },
      {
        id: 'pl6',
        label: '산',
        emoji: '⛰️',
        fragment: '산길을 따라 걸었다',
        variants: [
          { label: '정상에서', fragment: '산 정상에서 탁 트인 풍경을 봤다' },
          { label: '숲 내음', fragment: '숲 내음을 맡으며 걸었다' },
        ],
      },
      {
        id: 'pl7',
        label: '여행지',
        emoji: '🧳',
        fragment: '낯선 여행지에 머물렀다',
        variants: [
          { label: '골목을 헤매다', fragment: '낯선 골목을 정처 없이 헤맸다' },
          { label: '새로운 풍경', fragment: '낯선 풍경에 마음을 빼앗겼다' },
        ],
      },
      {
        id: 'pl8',
        label: '골목길',
        emoji: '🏮',
        fragment: '정겨운 골목길을 걸었다',
        variants: [
          { label: '가로등 아래', fragment: '가로등 켜진 골목길을 걸었다' },
          { label: '추억의 골목', fragment: '어릴 적 추억이 담긴 골목을 지났다' },
        ],
      },
      {
        id: 'pl9',
        label: '도서관',
        emoji: '📚',
        fragment: '도서관에서 조용한 시간을 보냈다',
        variants: [
          { label: '책 냄새 가득', fragment: '책 냄새 가득한 도서관에 머물렀다' },
          { label: '집중이 잘 됨', fragment: '도서관에서 집중이 잘 됐다' },
        ],
      },
      {
        id: 'pl10',
        label: '헬스장',
        emoji: '🏋️',
        fragment: '헬스장에서 땀을 흘렸다',
        variants: [
          { label: '운동 후 개운함', fragment: '운동 후 개운함을 느꼈다' },
          { label: '새로운 루틴', fragment: '헬스장에서 새로운 루틴에 도전했다' },
        ],
      },
      {
        id: 'pl11',
        label: '편의점',
        emoji: '🏪',
        fragment: '편의점에서 군것질을 했다',
        variants: [
          { label: '앞에서 잠깐 쉼', fragment: '편의점 앞에서 잠깐 쉬었다' },
          { label: '야식 구매', fragment: '야식을 사러 편의점에 들렀다' },
        ],
      },
      {
        id: 'pl12',
        label: '영화관',
        emoji: '🎦',
        fragment: '영화관에서 큰 화면을 즐겼다',
        variants: [
          { label: '팝콘 냄새', fragment: '팝콘 냄새 가득한 영화관에 있었다' },
          { label: '오랜만의 극장', fragment: '오랜만에 극장 나들이를 했다' },
        ],
      },
      {
        id: 'pl13',
        label: '서점',
        emoji: '📖',
        fragment: '서점에서 책을 구경했다',
        variants: [
          { label: '우연한 발견', fragment: '우연히 좋은 책을 발견했다' },
          { label: '여유롭게', fragment: '서점에서 여유롭게 시간을 보냈다' },
        ],
      },
      {
        id: 'pl14',
        label: '시장',
        emoji: '🧺',
        fragment: '시장 구경을 하며 걸었다',
        variants: [
          { label: '활기찬 분위기', fragment: '활기찬 시장 분위기를 느꼈다' },
          { label: '먹거리 구경', fragment: '맛있는 먹거리를 구경했다' },
        ],
      },
      {
        id: 'pl15',
        label: '놀이공원',
        emoji: '🎡',
        fragment: '놀이공원에서 신나게 놀았다',
        variants: [
          { label: '놀이기구', fragment: '놀이기구를 타며 소리를 질렀다' },
          { label: '동심으로', fragment: '오랜만에 동심으로 돌아갔다' },
        ],
      },
      {
        id: 'pl16',
        label: '기차역',
        emoji: '🚉',
        fragment: '기차역의 분주함 속에 있었다',
        variants: [
          { label: '사람들 구경', fragment: '기차를 기다리며 사람들을 구경했다' },
          { label: '설레는 기다림', fragment: '플랫폼에서 설레는 마음으로 기다렸다' },
        ],
      },
    ],
  },
  {
    key: 'activity',
    title: '활동',
    question: '오늘은 무엇을 했나요?',
    words: [
      {
        id: 'a1',
        label: '산책',
        emoji: '🚶',
        fragment: '가볍게 산책을 했다',
        variants: [
          { label: '밤산책', fragment: '선선한 밤공기를 맞으며 걸었다' },
          { label: '느린 걸음', fragment: '느린 걸음으로 동네를 걸었다' },
        ],
      },
      {
        id: 'a2',
        label: '독서',
        emoji: '📖',
        fragment: '책 한 권을 펼쳐 읽었다',
        variants: [
          { label: '몰입해서', fragment: '시간 가는 줄 모르고 책에 빠졌다' },
          { label: '필사하며', fragment: '좋은 문장을 옮겨 적었다' },
        ],
      },
      {
        id: 'a3',
        label: '영화 감상',
        emoji: '🎬',
        fragment: '영화 한 편을 봤다',
        variants: [
          { label: '펑펑 울며', fragment: '영화를 보다 펑펑 울었다' },
          { label: '몰아보기', fragment: '영화를 연달아 몰아봤다' },
        ],
      },
      {
        id: 'a4',
        label: '운동',
        emoji: '🏃',
        fragment: '땀 흘리며 운동을 했다',
        variants: [
          { label: '가볍게 스트레칭', fragment: '가볍게 스트레칭을 했다' },
          { label: '한계까지', fragment: '한계까지 몸을 밀어붙였다' },
        ],
      },
      {
        id: 'a5',
        label: '요리',
        emoji: '🍳',
        fragment: '정성껏 요리를 했다',
        variants: [
          { label: '새로운 레시피', fragment: '처음 해보는 레시피에 도전했다' },
          { label: '냉장고 파먹기', fragment: '냉장고 속 재료로 뚝딱 만들었다' },
        ],
      },
      {
        id: 'a6',
        label: '수다',
        emoji: '💬',
        fragment: '이런저런 수다를 떨었다',
        variants: [
          { label: '밤새도록', fragment: '밤이 늦도록 수다를 떨었다' },
          { label: '깔깔대며', fragment: '깔깔대며 실컷 웃었다' },
        ],
      },
      {
        id: 'a7',
        label: '낮잠',
        emoji: '😴',
        fragment: '달콤한 낮잠을 잤다',
        variants: [
          { label: '꿀잠', fragment: '꿀 같은 낮잠을 잤다' },
          { label: '잠깐의 휴식', fragment: '잠깐 눈을 붙였다' },
        ],
      },
      {
        id: 'a8',
        label: '정리정돈',
        emoji: '🧹',
        fragment: '묵은 짐들을 정리했다',
        variants: [
          { label: '미니멀하게', fragment: '안 쓰는 물건들을 비워냈다' },
          { label: '새단장', fragment: '방 분위기를 새롭게 바꿨다' },
        ],
      },
      {
        id: 'a9',
        label: '그림 그리기',
        emoji: '🎨',
        fragment: '그림을 그리며 시간을 보냈다',
        variants: [
          { label: '편하게 낙서', fragment: '낙서하듯 편하게 그림을 그렸다' },
          { label: '마음이 편안해짐', fragment: '색을 칠하며 마음이 편안해졌다' },
        ],
      },
      {
        id: 'a10',
        label: '사진 찍기',
        emoji: '📸',
        fragment: '이곳저곳 사진을 찍었다',
        variants: [
          { label: '일상을 담음', fragment: '일상의 순간을 사진에 담았다' },
          { label: '마음에 드는 한 장', fragment: '마음에 드는 사진 한 장을 건졌다' },
        ],
      },
      {
        id: 'a11',
        label: '게임',
        emoji: '🎮',
        fragment: '게임에 푹 빠져 시간을 보냈다',
        variants: [
          { label: '시간 가는 줄 모름', fragment: '시간 가는 줄 모르고 게임을 했다' },
          { label: '스트레스 해소', fragment: '오랜만에 스트레스가 풀렸다' },
        ],
      },
      {
        id: 'a12',
        label: '공부',
        emoji: '📚',
        fragment: '책상 앞에 앉아 공부를 했다',
        variants: [
          { label: '집중해서 몰두', fragment: '집중해서 공부에 몰두했다' },
          { label: '실력이 느는 걸 느낌', fragment: '조금씩 실력이 느는 게 느껴졌다' },
        ],
      },
      {
        id: 'a13',
        label: '글쓰기',
        emoji: '✍️',
        fragment: '생각을 글로 옮겨 적었다',
        variants: [
          { label: '마음을 담아', fragment: '마음을 담아 글을 써 내려갔다' },
          { label: '생각이 정리됨', fragment: '쓰다 보니 생각이 정리됐다' },
        ],
      },
      {
        id: 'a14',
        label: '노래 부르기',
        emoji: '🎤',
        fragment: '신나게 노래를 불렀다',
        variants: [
          { label: '목이 쉬도록', fragment: '목이 쉬도록 노래를 불렀다' },
          { label: '스트레스가 날아감', fragment: '노래 한 곡에 스트레스가 날아갔다' },
        ],
      },
      {
        id: 'a15',
        label: '반려식물 돌보기',
        emoji: '🪴',
        fragment: '화분에 물을 주며 식물을 돌봤다',
        variants: [
          { label: '새순을 발견', fragment: '새순이 돋은 걸 발견했다' },
          { label: '마음이 차분해짐', fragment: '식물을 돌보며 마음이 차분해졌다' },
        ],
      },
      {
        id: 'a16',
        label: '쇼핑',
        emoji: '🛍️',
        fragment: '필요한 물건들을 쇼핑했다',
        variants: [
          { label: '마음에 드는 물건', fragment: '마음에 드는 물건을 발견했다' },
          { label: '충동구매', fragment: '충동구매를 하고 살짝 후회했다' },
        ],
      },
    ],
  },
  {
    key: 'moment',
    title: '특별한 순간',
    question: '오늘 하루, 특별한 순간이 있었다면?',
    words: [
      {
        id: 'mo1',
        label: '작은 성취',
        emoji: '🏆',
        fragment: '작은 목표 하나를 해냈다',
        variants: [
          { label: '드디어 완료', fragment: '미뤄뒀던 일을 드디어 끝냈다' },
          { label: '한 걸음 성장', fragment: '어제보다 한 걸음 성장했다' },
        ],
      },
      {
        id: 'mo2',
        label: '뜻밖의 선물',
        emoji: '🎁',
        fragment: '뜻밖의 선물 같은 순간이 있었다',
        variants: [
          { label: '깜짝 선물', fragment: '생각지도 못한 선물을 받았다' },
          { label: '따뜻한 말 한마디', fragment: '따뜻한 말 한마디에 위로받았다' },
        ],
      },
      {
        id: 'mo3',
        label: '실수',
        emoji: '🙈',
        fragment: '작은 실수 하나에 웃음이 났다',
        variants: [
          { label: '민망했지만', fragment: '민망한 실수를 하고 말았다' },
          { label: '웃어넘기다', fragment: '실수했지만 웃으며 넘겼다' },
        ],
      },
      {
        id: 'mo4',
        label: '우연한 만남',
        emoji: '🍀',
        fragment: '우연한 만남이 반가웠다',
        variants: [
          { label: '길에서 마주치다', fragment: '길에서 반가운 얼굴을 마주쳤다' },
          { label: '인연이 닿다', fragment: '생각지도 못한 인연이 닿았다' },
        ],
      },
      {
        id: 'mo5',
        label: '좋아하는 노래',
        emoji: '🎧',
        fragment: '좋아하는 노래가 하루 종일 맴돌았다',
        variants: [
          { label: '무한반복', fragment: '노래 한 곡을 무한 반복해서 들었다' },
          { label: '플레이리스트', fragment: '새로운 플레이리스트를 찾았다' },
        ],
      },
      {
        id: 'mo6',
        label: '맛있는 음식',
        emoji: '🍜',
        fragment: '맛있는 음식에 기분이 좋아졌다',
        variants: [
          { label: '인생 맛집', fragment: '인생 맛집을 발견했다' },
          { label: '직접 만든 요리', fragment: '직접 만든 음식이 맛있게 됐다' },
        ],
      },
      {
        id: 'mo7',
        label: '새로운 시도',
        emoji: '🌱',
        fragment: '처음 해보는 일에 도전했다',
        variants: [
          { label: '용기를 내다', fragment: '용기를 내어 새로운 걸 시도했다' },
          { label: '낯선 도전', fragment: '낯선 도전 앞에서 설렜다' },
        ],
      },
      {
        id: 'mo8',
        label: '여유로운 시간',
        emoji: '🕊️',
        fragment: '온전히 여유로운 시간을 누렸다',
        variants: [
          { label: '멍때리기', fragment: '아무 생각 없이 멍하니 있었다' },
          { label: '나를 위한 시간', fragment: '온전히 나를 위한 시간을 보냈다' },
        ],
      },
      {
        id: 'mo9',
        label: '칭찬 한마디',
        emoji: '💐',
        fragment: '뜻밖의 칭찬 한마디에 기분이 좋아졌다',
        variants: [
          { label: '생각지도 못한 칭찬', fragment: '생각지도 못한 칭찬을 받았다' },
          { label: '오래 남은 한마디', fragment: '그 말 한마디가 오래 남았다' },
        ],
      },
      {
        id: 'mo10',
        label: '눈물 나는 순간',
        emoji: '😢',
        fragment: '울컥해서 눈물이 났다',
        variants: [
          { label: '감정이 북받침', fragment: '감정이 북받쳐 올랐다' },
          { label: '울고 나니 후련함', fragment: '울고 나니 마음이 후련해졌다' },
        ],
      },
      {
        id: 'mo11',
        label: '웃음 터진 순간',
        emoji: '🤣',
        fragment: '웃음이 빵 터지는 순간이 있었다',
        variants: [
          { label: '배꼽 잡고 웃음', fragment: '배꼽 잡고 웃었다' },
          { label: '오랜만에 실컷', fragment: '오랜만에 실컷 웃었다' },
        ],
      },
      {
        id: 'mo12',
        label: '좋은 소식',
        emoji: '📰',
        fragment: '반가운 소식을 들었다',
        variants: [
          { label: '기다리던 소식', fragment: '기다리던 소식이 도착했다' },
          { label: '하루 종일 기분 좋음', fragment: '덕분에 하루 종일 기분이 좋았다' },
        ],
      },
      {
        id: 'mo13',
        label: '아쉬운 이별',
        emoji: '👋',
        fragment: '아쉬운 작별의 순간이 있었다',
        variants: [
          { label: '못내 아쉬움', fragment: '헤어짐이 못내 아쉬웠다' },
          { label: '다음을 기약함', fragment: '다음을 기약하며 인사했다' },
        ],
      },
      {
        id: 'mo14',
        label: '뜻깊은 대화',
        emoji: '💭',
        fragment: '마음에 오래 남을 대화를 나눴다',
        variants: [
          { label: '생각이 많아짐', fragment: '생각이 많아지는 대화였다' },
          { label: '마음을 확인함', fragment: '서로의 마음을 확인한 시간이었다' },
        ],
      },
      {
        id: 'mo15',
        label: '날씨 덕 본 순간',
        emoji: '🌤️',
        fragment: '날씨 덕분에 기분 좋은 하루였다',
        variants: [
          { label: '날씨가 기분을 맑게 함', fragment: '날씨가 기분까지 맑게 해줬다' },
          { label: '절로 기분 좋아짐', fragment: '화창한 날씨에 절로 기분이 좋아졌다' },
        ],
      },
      {
        id: 'mo16',
        label: '작은 사치',
        emoji: '🍰',
        fragment: '나를 위한 작은 사치를 부렸다',
        variants: [
          { label: '나에게 주는 선물', fragment: '나에게 작은 선물을 했다' },
          { label: '가끔은 필요한 여유', fragment: '가끔은 이런 여유도 필요했다' },
        ],
      },
    ],
  },
];
