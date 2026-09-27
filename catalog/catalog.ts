// The Catalog: every Topic and Expression shipped with the app. See CONTEXT.md.
//
// Romanization conventions (ADR 0001):
// - Letter values follow Revised Romanization (ㄱ g, ㅋ k, ㄷ d, ㅌ t, ㅂ b, ㅍ p, ㅈ j, ㅊ ch, ㅓ eo, ㅡ eu),
//   so spellings stay close to road signs.
// - Spelling follows pronunciation, not the written form: linking (이름이 → i-reu-mi), nasalisation,
//   aspiration (어떻게 → eo-tteo-ke), tensing written as doubled letters (맥주 → maek-jju),
//   n-insertion (잠시만요 → jam-si-man-nyo), 예요 → e-yo, ㅚ → we, 계 → ge.
// - Syllables within a word are joined with hyphens; words are separated by spaces.
// - Across a word space, obligatory changes (aspiration, tensing, nasalisation) join the words into one
//   (못 해요 → mo-tae-yo, 몇 분 → myeot-ppun), while optional linking keeps them apart so the learned word
//   stays visible (색 있어요 → saek i-sseo-yo).
//
// Politeness: polite -yo speech; formal -mnida only for fixed set phrases. Never casual.
//
// Tier sets how early an Expression is introduced (1 = first days, 3 = nice to have).
// The Catalog order is derived from tier + position within the Topic (see src/catalog/order.ts).

export type TopicId =
  | 'greetings'
  | 'basics'
  | 'numbers'
  | 'shopping'
  | 'food'
  | 'cafe'
  | 'directions'
  | 'transport'
  | 'hotel'
  | 'time'
  | 'health'
  | 'smalltalk'

export type Tier = 1 | 2 | 3

export interface Topic {
  id: TopicId
  name: string
}

export interface Expression {
  id: string
  topic: TopicId
  tier: Tier
  romanization: string
  hangul: string
  english: string
  usageNote?: string
}

export const topics: Topic[] = [
  { id: 'greetings', name: 'Greetings & courtesy' },
  { id: 'basics', name: 'Basics & survival' },
  { id: 'numbers', name: 'Numbers' },
  { id: 'shopping', name: 'Money & shopping' },
  { id: 'food', name: 'Food & ordering' },
  { id: 'cafe', name: 'Café & drinks' },
  { id: 'directions', name: 'Directions & places' },
  { id: 'transport', name: 'Transport' },
  { id: 'hotel', name: 'Hotel' },
  { id: 'time', name: 'Time & days' },
  { id: 'health', name: 'Health & emergencies' },
  { id: 'smalltalk', name: 'Small talk' },
]

type Row = [id: string, tier: Tier, romanization: string, hangul: string, english: string, usageNote?: string]

const rows: Record<TopicId, Row[]> = {
  greetings: [
    ['hello', 1, 'an-nyeong-ha-se-yo', '안녕하세요', 'Hello', 'Works any time of day, with anyone.'],
    ['thank-you', 1, 'gam-sa-ham-ni-da', '감사합니다', 'Thank you'],
    ['sorry', 1, 'jwe-song-ham-ni-da', '죄송합니다', "I'm sorry", 'Formal apology, e.g. bumping into someone.'],
    ['excuse-me-attention', 1, 'jeo-gi-yo', '저기요', 'Excuse me! (to get attention)', 'Call a waiter or stop someone to ask something.'],
    ['goodbye-leaving', 1, 'an-nyeong-hi ga-se-yo', '안녕히 가세요', 'Goodbye (to someone who is leaving)'],
    ['goodbye-staying', 1, 'an-nyeong-hi ge-se-yo', '안녕히 계세요', 'Goodbye (when you leave, e.g. a shop)', 'Said by you when you walk out and they stay.'],
    ['thank-you-2', 2, 'go-map-sseum-ni-da', '고맙습니다', 'Thank you (also common)'],
    ['excuse-me-passing', 2, 'jam-si-man-nyo', '잠시만요', 'Excuse me (let me through) / One moment', 'Squeezing past people on a crowded subway.'],
    ['welcome-heard', 2, 'eo-seo o-se-yo', '어서 오세요', 'Welcome!', 'Heard when you enter a shop or restaurant.'],
    ['sorry-light', 2, 'mi-an-hae-yo', '미안해요', 'Sorry (lighter)'],
    ['not-at-all', 2, 'a-ni-e-yo', '아니에요', "Not at all / It's nothing", 'Reply to thanks or to an apology.'],
    ['youre-welcome', 3, 'cheon-ma-ne-yo', '천만에요', "You're welcome"],
    ['thanks-for-help', 2, 'do-wa-ju-syeo-seo gam-sa-ham-ni-da', '도와주셔서 감사합니다', 'Thank you for your help'],
    ['hello-formal-heard', 3, 'an-nyeong-ha-sim-ni-kka', '안녕하십니까', 'Hello (very formal)', 'Heard from staff in hotels, banks and department stores.'],
    ['see-you-again', 3, 'tto bwa-yo', '또 봐요', 'See you again'],
    ['have-a-nice-day', 3, 'jo-eun ha-ru bo-nae-se-yo', '좋은 하루 보내세요', 'Have a nice day'],
    ['good-night', 3, 'an-nyeong-hi ju-mu-se-yo', '안녕히 주무세요', 'Good night'],
    ['thanks-soft', 3, 'go-ma-wo-yo', '고마워요', 'Thanks (softer)'],
  ],
  basics: [
    ['yes', 1, 'ne', '네', 'Yes', 'Also means "okay", "I see" or "here you go".'],
    ['no', 1, 'a-ni-yo', '아니요', 'No'],
    ['its-okay', 1, 'gwaen-cha-na-yo', '괜찮아요', "It's okay / No, thanks", 'Say it with a rising tone to ask "Is it okay?"'],
    ['give-me-please', 1, 'ju-se-yo', '주세요', '… please (give me)', 'Put it after the thing you want: mul ju-se-yo = water, please.'],
    ['dont-speak-korean', 1, 'han-gu-geo mo-tae-yo', '한국어 못 해요', "I can't speak Korean"],
    ['speak-english', 1, 'yeong-eo ha-se-yo?', '영어 하세요?', 'Do you speak English?'],
    ['this-one', 1, 'i-geo', '이거', 'This (one)'],
    ['pardon', 1, 'ne?', '네?', 'Sorry? / Pardon?', 'Rising tone, when you did not catch something.'],
    ['i-dont-understand', 2, 'i-hae mo-tae-yo', '이해 못 해요', "I don't understand"],
    ['i-dont-know', 2, 'jal mo-reu-ge-sseo-yo', '잘 모르겠어요', "I don't know / I'm not sure"],
    ['slowly-please', 2, 'cheon-cheon-hi mal-hae ju-se-yo', '천천히 말해 주세요', 'Please speak slowly'],
    ['once-more', 2, 'da-si han beon mal-hae ju-se-yo', '다시 한 번 말해 주세요', 'Could you say that again?'],
    ['got-it', 2, 'al-ge-sseo-yo', '알겠어요', 'I understand / Got it'],
    ['good', 2, 'jo-a-yo', '좋아요', 'Good / Sounds good'],
    ['that-one', 2, 'jeo-geo', '저거', 'That (one over there)'],
    ['there-is', 2, 'i-sseo-yo', '있어요', 'There is / I have', 'As a question: i-sseo-yo? = Do you have it?'],
    ['there-isnt', 2, 'eop-sseo-yo', '없어요', "There isn't / I don't have"],
    ['is-it-possible', 2, 'dwae-yo?', '돼요?', 'Is it possible? / Can I?'],
    ['not-possible', 2, 'an dwae-yo', '안 돼요', "It's not possible / Not allowed"],
    ['dont-need', 2, 'pi-ryo eop-sseo-yo', '필요 없어요', "I don't need it"],
    ['a-little-korean', 3, 'han-gu-geo jo-geum hae-yo', '한국어 조금 해요', 'I speak a little Korean'],
    ['write-it-please', 3, 'yeo-gi sseo ju-se-yo', '여기 써 주세요', 'Please write it here'],
    ['just-a-moment', 3, 'jam-kkan-man-nyo', '잠깐만요', 'Just a moment'],
    ['what-is-this', 2, 'i-ge mwo-e-yo?', '이게 뭐예요?', 'What is this?'],
    ['help-me-please', 3, 'jom do-wa-ju-se-yo', '좀 도와주세요', 'Could you help me, please?', 'Everyday request, not an emergency.'],
    ['really', 3, 'jin-jja-yo?', '진짜요?', 'Really?'],
  ],
  numbers: [
    ['sino-1', 1, 'il', '일', 'one (Sino-Korean)', 'Sino-Korean numbers: prices, phone numbers, floors, minutes.'],
    ['sino-2', 1, 'i', '이', 'two (Sino-Korean)'],
    ['sino-3', 1, 'sam', '삼', 'three (Sino-Korean)'],
    ['native-1', 1, 'ha-na', '하나', 'one (native Korean)', 'Native Korean numbers: counting things, hours, age.'],
    ['native-2', 1, 'dul', '둘', 'two (native Korean)'],
    ['won', 1, 'won', '원', 'won (currency)'],
    ['sino-1000', 1, 'cheon', '천', 'thousand'],
    ['sino-10000', 1, 'man', '만', 'ten thousand', 'Koreans count big numbers in units of 10,000: 50,000 = o-man.'],
    ['sino-4', 1, 'sa', '사', 'four (Sino-Korean)'],
    ['sino-5', 1, 'o', '오', 'five (Sino-Korean)'],
    ['native-3', 1, 'set', '셋', 'three (native Korean)'],
    ['sino-6', 2, 'yuk', '육', 'six (Sino-Korean)'],
    ['sino-7', 2, 'chil', '칠', 'seven (Sino-Korean)'],
    ['sino-8', 2, 'pal', '팔', 'eight (Sino-Korean)'],
    ['sino-9', 2, 'gu', '구', 'nine (Sino-Korean)'],
    ['sino-10', 2, 'sip', '십', 'ten (Sino-Korean)'],
    ['sino-100', 2, 'baek', '백', 'hundred'],
    ['native-4', 2, 'net', '넷', 'four (native Korean)'],
    ['native-5', 2, 'da-seot', '다섯', 'five (native Korean)'],
    ['native-6', 2, 'yeo-seot', '여섯', 'six (native Korean)'],
    ['native-7', 2, 'il-gop', '일곱', 'seven (native Korean)'],
    ['native-8', 2, 'yeo-deol', '여덟', 'eight (native Korean)'],
    ['native-9', 2, 'a-hop', '아홉', 'nine (native Korean)'],
    ['native-10', 2, 'yeol', '열', 'ten (native Korean)'],
    ['counter-one', 2, 'han', '한', 'one (before a counter word)', 'ha-na shortens to han before counters: han gae = one item, han myeong = one person.'],
    ['counter-two', 2, 'du', '두', 'two (before a counter word)', 'dul shortens to du: du gae = two items.'],
    ['counter-three', 3, 'se', '세', 'three (before a counter word)'],
    ['counter-four', 3, 'ne', '네', 'four (before a counter word)', 'Sounds like "yes" (ne); context tells them apart.'],
    ['price-1000', 2, 'cheon won', '천 원', '1,000 won'],
    ['price-10000', 2, 'man won', '만 원', '10,000 won'],
    ['price-50000', 3, 'o-man won', '오만 원', '50,000 won'],
    ['zero', 3, 'gong', '공', 'zero', 'Used when reading out phone numbers.'],
  ],
  shopping: [
    ['how-much', 1, 'eol-ma-e-yo?', '얼마예요?', 'How much is it?'],
    ['this-one-please', 1, 'i-geo ju-se-yo', '이거 주세요', 'This one, please'],
    ['card-ok', 1, 'ka-deu dwae-yo?', '카드 돼요?', 'Can I pay by card?'],
    ['too-expensive', 2, 'neo-mu bi-ssa-yo', '너무 비싸요', "It's too expensive"],
    ['receipt', 2, 'yeong-su-jeung ju-se-yo', '영수증 주세요', 'Receipt, please'],
    ['bag-please', 2, 'bong-tu ju-se-yo', '봉투 주세요', 'A bag, please', 'Plastic bags usually cost extra.'],
    ['no-bag', 2, 'bong-tu pi-ryo eop-sseo-yo', '봉투 필요 없어요', "I don't need a bag"],
    ['just-looking', 2, 'geu-nyang gu-gyeong-ha-neun geo-e-yo', '그냥 구경하는 거예요', "I'm just looking"],
    ['ill-take-this', 2, 'i-geol-lo hal-kke-yo', '이걸로 할게요', "I'll take this one"],
    ['where-pay', 2, 'eo-di-seo ge-san-hae-yo?', '어디서 계산해요?', 'Where do I pay?'],
    ['pay-cash', 3, 'hyeon-geu-meu-ro hal-kke-yo', '현금으로 할게요', "I'll pay in cash"],
    ['cash', 3, 'hyeon-geum', '현금', 'cash'],
    ['discount', 3, 'jom kka-kka ju-se-yo', '좀 깎아 주세요', 'Could you give me a discount?', 'Only at traditional markets, never in shops with fixed prices.'],
    ['another-colour', 3, 'da-reun saek i-sseo-yo?', '다른 색 있어요?', 'Do you have another colour?'],
    ['bigger-one', 3, 'deo keun geo i-sseo-yo?', '더 큰 거 있어요?', 'Do you have a bigger one?'],
    ['try-on', 3, 'i-beo bwa-do dwae-yo?', '입어 봐도 돼요?', 'Can I try it on?'],
    ['tax-refund', 3, 'taek-seu ri-peon-deu dwae-yo?', '택스 리펀드 돼요?', 'Can I get a tax refund?'],
    ['cheap', 3, 'ssa-yo', '싸요', "It's cheap"],
    ['two-of-them', 2, 'du gae ju-se-yo', '두 개 주세요', 'Two of them, please'],
  ],
  food: [
    ['water-please', 1, 'mul ju-se-yo', '물 주세요', 'Water, please', 'Water is free; often self-service from a dispenser.'],
    ['bill-please', 1, 'ge-san-hae ju-se-yo', '계산해 주세요', 'The bill, please', 'Often you pay at the counter by the door.'],
    ['delicious', 1, 'ma-si-sseo-yo', '맛있어요', "It's delicious"],
    ['one-person', 1, 'han myeong-i-e-yo', '한 명이에요', 'Just one person', 'Some BBQ places need at least two diners.'],
    ['two-people', 1, 'du myeong-i-e-yo', '두 명이에요', 'Two people'],
    ['menu-please', 1, 'me-nyu-pan ju-se-yo', '메뉴판 주세요', 'The menu, please'],
    ['how-many-heard', 2, 'myeot-ppu-ni-se-yo?', '몇 분이세요?', 'How many people?', 'Heard when you walk into a restaurant.'],
    ['one-of-this', 2, 'i-geo ha-na ju-se-yo', '이거 하나 주세요', 'One of this, please'],
    ['not-spicy', 2, 'an maep-kke hae ju-se-yo', '안 맵게 해 주세요', 'Not spicy, please'],
    ['is-it-spicy', 2, 'mae-wo-yo?', '매워요?', 'Is it spicy?'],
    ['one-more', 2, 'ha-na deo ju-se-yo', '하나 더 주세요', 'One more, please'],
    ['english-menu', 2, 'yeong-eo me-nyu i-sseo-yo?', '영어 메뉴 있어요?', 'Do you have an English menu?'],
    ['what-is-good', 2, 'mwo-ga ma-si-sseo-yo?', '뭐가 맛있어요?', "What's good here?"],
    ['ordering', 2, 'ju-mun-hal-kke-yo', '주문할게요', "I'd like to order"],
    ['more-side-dishes', 2, 'ban-chan deo ju-se-yo', '반찬 더 주세요', 'More side dishes, please', 'Side dish refills are free.'],
    ['to-go', 2, 'po-jang-hae ju-se-yo', '포장해 주세요', 'To go, please'],
    ['before-meal', 2, 'jal meok-kke-sseum-ni-da', '잘 먹겠습니다', 'Thank you for the food (before eating)'],
    ['after-meal', 2, 'jal meo-geo-sseum-ni-da', '잘 먹었습니다', 'Thank you for the meal (after eating)', 'Nice to say to staff on your way out.'],
    ['beer', 2, 'maek-jju', '맥주', 'beer'],
    ['no-meat', 3, 'go-gi ppae ju-se-yo', '고기 빼 주세요', 'Without meat, please'],
    ['vegetarian-menu', 3, 'chae-sik me-nyu i-sseo-yo?', '채식 메뉴 있어요?', 'Do you have vegetarian dishes?'],
    ['eat-here', 3, 'yeo-gi-seo meo-geul-kke-yo', '여기서 먹을게요', "I'll eat here"],
    ['chopsticks', 3, 'jeot-kka-rak', '젓가락', 'chopsticks'],
    ['spoon', 3, 'sut-kka-rak', '숟가락', 'spoon'],
    ['tissue', 3, 'hyu-ji', '휴지', 'tissue / napkin'],
    ['soju', 3, 'so-ju', '소주', 'soju'],
    ['rice', 3, 'bap', '밥', 'rice / meal'],
    ['pork-belly', 3, 'sam-gyeop-sal', '삼겹살', 'pork belly (Korean BBQ)'],
    ['good-restaurant-nearby', 3, 'i geun-cheo-e mat-jjip i-sseo-yo?', '이 근처에 맛집 있어요?', 'Is there a good restaurant nearby?'],
    ['hungry', 3, 'bae-go-pa-yo', '배고파요', "I'm hungry"],
  ],
  cafe: [
    ['iced-americano', 1, 'a-i-seu a-me-ri-ka-no han jan ju-se-yo', '아이스 아메리카노 한 잔 주세요', 'One iced americano, please'],
    ['for-here-heard', 2, 'deu-si-go ga-se-yo?', '드시고 가세요?', 'For here?', 'Heard when you order at a café.'],
    ['for-here', 2, 'meok-kko gal-kke-yo', '먹고 갈게요', 'For here'],
    ['take-away', 2, 'ga-jeo-gal-kke-yo', '가져갈게요', 'To go (I will take it)'],
    ['wifi-password', 2, 'wa-i-pa-i bi-mil-beon-ho mwo-e-yo?', '와이파이 비밀번호 뭐예요?', "What's the Wi-Fi password?"],
    ['one-cup', 2, 'han jan', '한 잔', 'one cup / one glass'],
    ['hot-one', 2, 'tta-tteu-tan geo', '따뜻한 거', 'a hot one'],
    ['iced', 3, 'a-i-seu', '아이스', 'iced'],
    ['latte', 3, 'ka-pe ra-te', '카페 라테', 'café latte'],
    ['large-size', 3, 'keun sa-i-jeu-ro ju-se-yo', '큰 사이즈로 주세요', 'Large size, please'],
    ['less-sweet', 3, 'deol dal-ge hae ju-se-yo', '덜 달게 해 주세요', 'Less sweet, please'],
    ['green-tea', 3, 'nok-cha', '녹차', 'green tea'],
    ['milk', 3, 'u-yu', '우유', 'milk'],
    ['power-outlet', 3, 'kon-sen-teu i-sseo-yo?', '콘센트 있어요?', 'Is there a power outlet?'],
    ['bottle-of-water', 3, 'mul han byeong', '물 한 병', 'a bottle of water'],
  ],
  directions: [
    ['bathroom-where', 1, 'hwa-jang-sil eo-di-e-yo?', '화장실 어디예요?', 'Where is the bathroom?'],
    ['where-is-it', 1, 'eo-di-e-yo?', '어디예요?', 'Where is it?', 'Put a place before it: yeok eo-di-e-yo? = Where is the station?'],
    ['here', 1, 'yeo-gi', '여기', 'here'],
    ['left', 2, 'wen-jjok', '왼쪽', 'left'],
    ['right', 2, 'o-reun-jjok', '오른쪽', 'right'],
    ['go-straight', 2, 'jjuk ga-se-yo', '쭉 가세요', 'Go straight on'],
    ['over-there', 2, 'jeo-gi', '저기', 'over there'],
    ['subway-station', 2, 'ji-ha-cheol-lyeok', '지하철역', 'subway station'],
    ['is-it-close', 2, 'ga-kka-wo-yo?', '가까워요?', 'Is it close?'],
    ['how-do-i-get-here', 2, 'yeo-gi eo-tteo-ke ga-yo?', '여기 어떻게 가요?', 'How do I get here?', 'Point at the map on your phone.'],
    ['which-exit', 2, 'myeot-ppeon chul-gu-e-yo?', '몇 번 출구예요?', 'Which exit number?', 'Seoul subway stations have many numbered exits.'],
    ['convenience-store', 2, 'pyeo-ni-jeom', '편의점', 'convenience store'],
    ['im-lost', 2, 'gi-reul i-reo-sseo-yo', '길을 잃었어요', "I'm lost"],
    ['there-near-you', 3, 'geo-gi', '거기', 'there (near you)'],
    ['is-it-far', 3, 'meo-reo-yo?', '멀어요?', 'Is it far?'],
    ['can-i-walk', 3, 'geo-reo-seo gal ssu i-sseo-yo?', '걸어서 갈 수 있어요?', 'Can I walk there?'],
    ['exit', 3, 'chul-gu', '출구', 'exit'],
    ['entrance', 3, 'ip-kku', '입구', 'entrance'],
    ['which-floor', 3, 'myeot cheung-i-e-yo?', '몇 층이에요?', 'Which floor is it?'],
    ['atm-where', 3, 'e-i-ti-em eo-di i-sseo-yo?', 'ATM 어디 있어요?', 'Where is an ATM?'],
    ['map', 3, 'ji-do', '지도', 'map'],
  ],
  transport: [
    ['to-this-address', 1, 'i ju-so-ro ga ju-se-yo', '이 주소로 가 주세요', 'Please take me to this address', 'Show the address on your phone to the taxi driver.'],
    ['stop-here', 1, 'yeo-gi-seo se-wo ju-se-yo', '여기서 세워 주세요', 'Stop here, please'],
    ['subway', 2, 'ji-ha-cheol', '지하철', 'subway'],
    ['taxi', 2, 'taek-ssi', '택시', 'taxi'],
    ['bus', 2, 'beo-seu', '버스', 'bus'],
    ['t-money', 2, 'ti-meo-ni ka-deu', '티머니 카드', 'T-money card', 'Rechargeable transit card, sold and topped up at convenience stores.'],
    ['top-up', 2, 'chung-jeon-hae ju-se-yo', '충전해 주세요', 'Top it up, please'],
    ['to-seoul-station', 2, 'seo-ul-lyeok-kka-ji ga ju-se-yo', '서울역까지 가 주세요', 'To Seoul Station, please', 'Swap in any place name before kka-ji.'],
    ['does-bus-go', 2, 'i beo-seu myeong-dong ga-yo?', '이 버스 명동 가요?', 'Does this bus go to Myeongdong?'],
    ['how-long', 2, 'eol-ma-na geol-lyeo-yo?', '얼마나 걸려요?', 'How long does it take?'],
    ['which-line', 2, 'myeo-to-seo-ni-e-yo?', '몇 호선이에요?', 'Which subway line is it?'],
    ['where-transfer', 2, 'eo-di-seo ga-ra-ta-yo?', '어디서 갈아타요?', 'Where do I transfer?'],
    ['airport', 2, 'gong-hang', '공항', 'airport'],
    ['this-station-heard', 3, 'i-beon nyeo-geun', '이번 역은', 'This station is …', 'Heard in subway announcements.'],
    ['ticket', 3, 'pyo', '표', 'ticket'],
    ['ticket-to-busan', 3, 'bu-san ga-neun pyo han jang ju-se-yo', '부산 가는 표 한 장 주세요', 'One ticket to Busan, please'],
    ['train-station', 3, 'gi-cha-yeok', '기차역', 'train station'],
    ['getting-off', 3, 'nae-ryeo-yo', '내려요', "I'm getting off"],
  ],
  hotel: [
    ['have-reservation', 1, 'ye-ya-kae-sseo-yo', '예약했어요', 'I have a reservation'],
    ['check-in', 2, 'che-keu-in-hal-kke-yo', '체크인할게요', "I'd like to check in"],
    ['check-out', 2, 'che-keu-a-u-tal-kke-yo', '체크아웃할게요', "I'd like to check out"],
    ['checkout-time', 2, 'che-keu-a-ut myeot ssi-e-yo?', '체크아웃 몇 시예요?', 'What time is check-out?'],
    ['keep-luggage', 2, 'jim jom ma-ta ju-se-yo', '짐 좀 맡아 주세요', 'Could you keep my luggage?'],
    ['more-towels', 3, 'su-geon deo ju-se-yo', '수건 더 주세요', 'More towels, please'],
    ['no-hot-water', 3, 'tteu-geo-un mu-ri an na-wa-yo', '뜨거운 물이 안 나와요', "There's no hot water"],
    ['aircon-broken', 3, 'e-eo-keo-ni an dwae-yo', '에어컨이 안 돼요', "The air conditioning doesn't work"],
    ['breakfast-time', 3, 'jo-sik myeot ssi-e-yo?', '조식 몇 시예요?', 'What time is breakfast?'],
    ['key-card', 3, 'ka-deu-ki', '카드키', 'key card'],
    ['elevator', 3, 'el-li-be-i-teo', '엘리베이터', 'elevator'],
  ],
  time: [
    ['what-time-open', 2, 'myeot ssi-e yeo-reo-yo?', '몇 시에 열어요?', 'What time do you open?'],
    ['what-time-close', 2, 'myeot ssi-e da-da-yo?', '몇 시에 닫아요?', 'What time do you close?'],
    ['open-now', 2, 'ji-geum yeong-eo-pae-yo?', '지금 영업해요?', 'Are you open now?'],
    ['today', 2, 'o-neul', '오늘', 'today'],
    ['tomorrow', 2, 'nae-il', '내일', 'tomorrow'],
    ['now', 2, 'ji-geum', '지금', 'now'],
    ['what-time-now', 2, 'ji-geum myeot ssi-e-yo?', '지금 몇 시예요?', 'What time is it now?'],
    ['three-oclock', 3, 'se si', '세 시', "three o'clock", 'Hours use native Korean numbers.'],
    ['thirty-minutes', 3, 'sam-sip-ppun', '삼십 분', 'thirty minutes', 'Minutes use Sino-Korean numbers.'],
    ['yesterday', 3, 'eo-je', '어제', 'yesterday'],
    ['morning', 3, 'a-chim', '아침', 'morning'],
    ['afternoon', 3, 'o-hu', '오후', 'afternoon / p.m.'],
    ['evening', 3, 'jeo-nyeok', '저녁', 'evening'],
    ['weekend', 3, 'ju-mal', '주말', 'weekend'],
    ['when', 3, 'eon-je-yo?', '언제요?', 'When?'],
    ['open-sign', 3, 'yeong-eop-jjung', '영업 중', 'Open (sign)'],
    ['closed-sign', 3, 'hyu-mu', '휴무', 'Closed (sign)'],
  ],
  health: [
    ['help', 1, 'do-wa-ju-se-yo!', '도와주세요!', 'Help!'],
    ['it-hurts', 1, 'a-pa-yo', '아파요', "It hurts / I'm sick"],
    ['pharmacy-where', 2, 'yak-kkuk eo-di-e-yo?', '약국 어디예요?', 'Where is a pharmacy?'],
    ['hospital', 2, 'byeong-won', '병원', 'hospital'],
    ['allergy', 2, 'al-le-reu-gi i-sseo-yo', '알레르기 있어요', 'I have an allergy'],
    ['call-ambulance', 2, 'gu-geup-cha bul-leo ju-se-yo', '구급차 불러 주세요', 'Call an ambulance!'],
    ['call-police', 2, 'gyeong-chal bul-leo ju-se-yo', '경찰 불러 주세요', 'Call the police!'],
    ['emergency-119', 2, 'il-il-gu', '일일구', '119 (ambulance & fire)', 'Emergency number for ambulance and fire.'],
    ['lost-phone', 2, 'haen-deu-po-neul i-reo-beo-ryeo-sseo-yo', '핸드폰을 잃어버렸어요', 'I lost my phone'],
    ['headache', 3, 'meo-ri-ga a-pa-yo', '머리가 아파요', 'I have a headache'],
    ['stomach-ache', 3, 'bae-ga a-pa-yo', '배가 아파요', 'I have a stomach ache'],
    ['fever', 3, 'yeo-ri na-yo', '열이 나요', 'I have a fever'],
    ['peanut-allergy', 3, 'ttang-kong al-le-reu-gi i-sseo-yo', '땅콩 알레르기 있어요', "I'm allergic to peanuts"],
    ['medicine', 3, 'yak', '약', 'medicine'],
    ['cold-medicine', 3, 'gam-gi-yak ju-se-yo', '감기약 주세요', 'Cold medicine, please'],
    ['lost-wallet', 3, 'ji-ga-beul i-reo-beo-ryeo-sseo-yo', '지갑을 잃어버렸어요', 'I lost my wallet'],
    ['urgent', 3, 'geu-pae-yo', '급해요', "It's urgent"],
    ['police-112', 3, 'il-il-i', '일일이', '112 (police)', 'Emergency number for the police.'],
  ],
  smalltalk: [
    ['nice-to-meet-you', 1, 'man-na-seo ban-ga-wo-yo', '만나서 반가워요', 'Nice to meet you'],
    ['cheers', 1, 'geon-bae!', '건배!', 'Cheers!'],
    ['where-from-heard', 2, 'eo-di-seo wa-sseo-yo?', '어디서 왔어요?', 'Where are you from?'],
    ['from-europe', 2, 'yu-reo-be-seo wa-sseo-yo', '유럽에서 왔어요', "I'm from Europe", 'Swap in your country before -e-seo.'],
    ['im-a-tourist', 2, 'jeo-neun gwan-gwang-gae-gi-e-yo', '저는 관광객이에요', "I'm a tourist"],
    ['first-time-korea', 2, 'han-gu-geun cheo-eu-mi-e-yo', '한국은 처음이에요', "It's my first time in Korea"],
    ['can-i-take-photo', 2, 'sa-jin jji-geo-do dwae-yo?', '사진 찍어도 돼요?', 'Can I take a photo?'],
    ['take-our-photo', 2, 'sa-jin jji-geo ju-sil ssu i-sseo-yo?', '사진 찍어 주실 수 있어요?', 'Could you take a photo of us?'],
    ['like-korea', 3, 'han-guk neo-mu jo-a-yo', '한국 너무 좋아요', 'I really like Korea'],
    ['whats-your-name', 3, 'i-reu-mi mwo-e-yo?', '이름이 뭐예요?', "What's your name?"],
    ['its-fun', 3, 'jae-mi-i-sseo-yo', '재미있어요', "It's fun"],
    ['its-pretty', 3, 'ye-ppeo-yo', '예뻐요', "It's pretty"],
    ['the-best', 3, 'chwe-go-e-yo', '최고예요', "It's the best!"],
    ['tired', 3, 'pi-gon-hae-yo', '피곤해요', "I'm tired"],
    ['its-hot', 3, 'deo-wo-yo', '더워요', "It's hot (weather)"],
    ['its-cold', 3, 'chu-wo-yo', '추워요', "It's cold (weather)"],
  ],
}

export const expressions: Expression[] = topics.flatMap((t) =>
  rows[t.id].map(([id, tier, romanization, hangul, english, usageNote]) => ({
    id,
    topic: t.id,
    tier,
    romanization,
    hangul,
    english,
    ...(usageNote ? { usageNote } : {}),
  })),
)
