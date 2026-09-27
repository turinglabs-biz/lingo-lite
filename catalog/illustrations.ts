// Illustrations: one single-color line drawing per Expression (see CONTEXT.md). 48×48 grid, 2-unit round strokes in
// currentColor. Shared visual language: a speech bubble means "saying"; a corner marker adds ? (question),
// ✕ (not/no), + (more), → (go/take me to), ✓ (yes/done), − (less); Sino-Korean numbers are a digit on a price tag,
// native Korean numbers are counted dots (bare) or boxes (before a counter).
//
// Expressions that show the same thing share a drawing key; they are "also correct" for each other on See cards.
// Markup classes: .f = filled shape, .t = text, .bg = paper-colored fill (for markers over a drawing).

const P = (d: string) => `<path d="${d}"/>`
const C = (cx: number, cy: number, r: number) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`
const DOT = (cx: number, cy: number, r = 1.8) => `<circle class="f" cx="${cx}" cy="${cy}" r="${r}"/>`
const T = (x: number, y: number, s: string, size = 12) => `<text class="t" x="${x}" y="${y}" font-size="${size}" text-anchor="middle">${s}</text>`
/** Places a full 48×48 drawing at (x, y), scaled, keeping the stroke width visually constant. */
const G = (x: number, y: number, s: number, ...parts: string[]) =>
  `<g transform="translate(${x} ${y}) scale(${s})" stroke-width="${+(2 / s).toFixed(3)}">${parts.join('')}</g>`
/** Two drawings side by side. */
const pair = (a: string, b: string) => G(-1, 10, 0.55, a) + G(22, 10, 0.55, b)

type Marker = '?' | 'x' | '+' | '>' | 'v' | '-'
const MARKS: Record<Marker, string> = {
  '?': P('M35.2 35.4a2.9 2.9 0 1 1 4.1 2.7c-.8.4-1.3 1-1.3 1.9') + DOT(38, 42.6, 1.1),
  x: P('M35 35l6 6M41 35l-6 6'),
  '+': P('M38 34v8M34 38h8'),
  '>': P('M34 38h8M39 35l3 3-3 3'),
  v: P('M34.5 38.3l2.4 2.4 4.9-5'),
  '-': P('M34 38h8'),
}
/** Adds a corner marker on a paper-colored disc. */
const mark = (drawing: string, m: Marker) => drawing + `<circle class="bg" cx="38" cy="38" r="8.5"/>` + MARKS[m]

// ---------- People and gestures ----------
const person = C(24, 13, 6) + P('M12 42v-5a12 12 0 0 1 24 0v5')
const twoPeople = G(-2, 4, 0.6, person) + G(19, 4, 0.6, person)
const walker = C(27, 8, 4) + P('M26 14l-3 12 5 6 1 10 M23 26l-6 16 M25 16l-6 5-3 7 M26 17l5 5 6 1')
const bow = C(35, 18, 4) + P('M16 42V28l13-7 M21 42l-1-10 M29 22l1 10')
const armsUp = C(24, 10, 5) + P('M24 16v14 M24 30l-6 12 M24 30l6 12 M24 20l-9-9 M24 20l9-9')
const handUp = C(20, 22, 5) + P('M10 42v-4a10 10 0 0 1 20 0v4 M28 29l6-19 M31 8l3 2 3-1')
const shrug = C(24, 13, 5) + P('M14 42v-6a10 10 0 0 1 20 0v6 M14 30l-7-6-2 3 M34 30l7-6 2 3')
const wave =
  P('M18 30V17a2.5 2.5 0 0 1 5 0v9 M23 26V13a2.5 2.5 0 0 1 5 0v13 M28 26V15a2.5 2.5 0 0 1 5 0v13 M33 28v-6a2.5 2.5 0 0 1 5 0v7c0 8-5 13-12 13-5 0-8-3-10-7l-4-7a2.4 2.4 0 0 1 4-2.6l2 3') +
  P('M9 13c-2 2-2 5 0 7 M40 7c2 2 2 5 0 7')
/** An open palm-up hand, receiving (things go above it, y < 24). */
const hand = P('M4 26h6v14H4z M10 28l7-3h10a3 3 0 0 1 0 6h-7 M10 38h18l13-9a3 3 0 0 0-3.5-4.8L27 31')
const heart = P('M24 39s-15-8.5-15-18a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 9.5-15 18-15 18z')
const smile = C(24, 24, 16) + DOT(18, 20) + DOT(30, 20) + P('M17 28c4 5 10 5 14 0')
const tongue = C(24, 24, 16) + DOT(18, 20) + DOT(30, 20) + P('M16 27c5 5 11 5 16 0 M21 30.5c0 4 6 4 6 0')
const laugh = C(24, 24, 16) + P('M15 20l3-2 3 2 M27 20l3-2 3 2 M15 26h18c0 6-4 9-9 9s-9-3-9-9z')
const sleepy = C(22, 26, 14) + P('M15 25h5 M24 25h5 M18 32h8') + T(38, 14, 'z', 9) + T(43, 7, 'z', 7)
const thumbsUp = P('M8 21h7v19H8z M15 38h17a4 4 0 0 0 4-3l3-11a3 3 0 0 0-3-4h-9l1-8a3 3 0 0 0-5-2l-8 10')
const ear = P('M31 37c-2 4-6 5-9 3 M15 19a10 10 0 0 1 20 0c0 7-6 8-6 14 M21 19a4 4 0 0 1 8 0c0 3-3 4-3 6')
const thought = person + P('M30 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-8l-3 3v-3a3 3 0 0 1-3-3V7a3 3 0 0 1 2-3z') + T(36.5, 14, '?', 9)
const bulb = P('M18 32c-4-3-6-7-6-11a12 12 0 0 1 24 0c0 4-2 8-6 11v4H18z M19 41h10 M21 25l3 3 3-3')

// ---------- Speech ----------
const bubbleShape = P('M10 6h28a4 4 0 0 1 4 4v17a4 4 0 0 1-4 4H22l-8 7v-7h-4a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z')
const bubble = (inner: string) => bubbleShape + G(12, 6.5, 0.5, inner)
const bubbleText = (s: string, size = 13) => bubbleShape + T(24, 23, s, size)

// ---------- Things ----------
const glass = P('M14 8h20l-3 32H17z M15.5 19h17')
const mug = P('M11 14h19v24a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2z M30 18h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4 M11 14c0-3 3-5 6-4 1-3 7-3 8 0 2-2 6-1 5 4 M17 22v11 M24 22v11')
const sojuBottle = P('M21 5h6v7l3 5v22a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V17l3-5z M18 25h12 M18 33h12')
const waterBottle = P('M20 5h8v5h-8z M19 10h10l3 5v24a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V15z M16 22h16 M16 30h16')
const icedCup = P('M13 14h22l-3 27H16z M11 10h26v4H11z M26 10l4-7') + P('M18 20h5v5h-5z M25 25h5v5h-5z')
const hotMug = P('M11 18h21v13a9 9 0 0 1-9 9h-3a9 9 0 0 1-9-9z M32 21h3a4 4 0 0 1 0 8h-3 M17 6c-2 2 2 4 0 7 M24 6c-2 2 2 4 0 7')
const takeawayCup = P('M14 12h20l-3 29H17z M12 8h24v4H12z M15 20h18 M16 31h16')
const latte = P('M11 18h21v13a9 9 0 0 1-9 9h-3a9 9 0 0 1-9-9z M32 21h3a4 4 0 0 1 0 8h-3') + P('M21.5 30s-5-3-5-6a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 3-5 6-5 6z')
const teaCup = P('M9 22h26v6a10 10 0 0 1-10 10h-6A10 10 0 0 1 9 28z M35 24h2a3 3 0 0 1 0 6h-3 M6 41h32') + P('M22 17c-4-4-2-11 6-12 1 7-2 11-6 12z M22 17l3-6')
const milk = P('M16 16l4-9h8l4 9v25H16z M16 16h16 M20 7v-2h8v2') + P('M20 26c2-2 6-2 8 0')
const iceCubes = P('M8 16l10-4 8 4v10l-10 4-8-4z M8 16l10 4 8-4 M18 20v10') + P('M26 26l8-3 7 3v9l-8 3-7-3z M26 26l8 3 7-3 M34 29v9')
const sugar = P('M8 20l8-4 8 4v9l-8 4-8-4z M8 20l8 4 8-4 M16 24v9') + P('M24 28l8-4 8 4v9l-8 4-8-4z M24 28l8 4 8-4 M32 32v9')
const sizes = P('M8 24h10l-1.5 16h-7z M24 10h16l-2.5 30h-11z')
const bowl = P('M6 24h36a18 18 0 0 1-36 0z M12 24c0-6 5-10 12-10s12 4 12 10') + P('M31 3l-5 14 M37 5l-8 12')
const emptyBowl = P('M6 22h36a18 18 0 0 1-36 0z M16 42h16')
const steamingBowl = P('M6 24h36a18 18 0 0 1-36 0z M16 6c-2 2 2 4 0 7 M24 5c-2 2 2 4 0 7 M32 6c-2 2 2 4 0 7')
const sideDishes = P('M4 30h12a6 6 0 0 1-12 0z M18 30h12a6 6 0 0 1-12 0z M32 30h12a6 6 0 0 1-12 0z')
const chopsticks = P('M12 6l14 36 M20 5l12 37')
const spoon = P('M24 26v16 M24 26c-5 0-7-5-7-10s3-9 7-9 7 4 7 9-2 10-7 10z')
const tissues = P('M8 24h32v16H8z M16 24c0-7 4-12 8-14 1 5 5 9 8 14')
const meat = P('M6 16c6-4 30-4 36 0v14c-6 4-30 4-36 0z M6 22c6 3 30 3 36 0 M6 27c6 3 30 3 36 0')
const grill = meat + P('M4 38h40 M10 38v4 M38 38v4')
const leaf = P('M10 38C8 18 22 8 40 8c0 18-10 32-30 30z M10 38l18-18')
const pepper = P('M31 9c-2 0-3 2-3 4 M28 13c4 0 7 3 6 8-2 9-10 16-22 18 5-5 8-12 9-18 1-5 3-8 7-8z')
const menu = P('M11 6h26v35H11z M16 14h16 M16 20h16 M16 26h12 M16 32h8')
const receipt = P('M13 5h22v37l-3-2-3 2-3-2-3 2-3-2-3 2-4-2z M18 13h12 M18 19h12 M18 25h8') + T(25, 36, '₩', 8)
const takeoutBox = P('M9 18l4 22h22l4-22z M9 18l6-8h18l6 8 M20 10l-2 8 M28 10l2 8')
const card = P('M6 12h36v24H6z M6 18h36 M11 29h9')
const tCard = card + T(34, 32, 'T', 10)
const keyCard = card + C(31, 28, 3) + P('M28 28h-7 M24 28v3')
const cash = P('M5 14h38v20H5z M10 19v10 M38 19v10') + C(24, 24, 5)
const coin = C(24, 24, 16) + T(24, 29.5, '₩', 15)
const note = (s: string) => P('M4 14h40v20H4z') + T(24, 27.5, s, s.length > 6 ? 7.5 : 9)
const tag = (s: string, size = 13) => P('M5 14h27l11 10-11 10H5z') + C(34, 24, 2) + T(18, 24 + size * 0.36, s, size)
const bag = P('M11 16h26l-2 25H13z M18 16v-3a6 6 0 0 1 12 0v3')
const shirt = P('M16 8l-9 5 4 8 4-2v21h18V19l4 2 4-8-9-5c-1 3-4 5-8 5s-7-2-8-5z')
const swatches = C(17, 19, 9) + C(31, 19, 9) + C(24, 31, 9)
const boxes = (small: boolean) => (small ? P('M8 28h12v12H8z') : '') + P('M22 12h20v28H22z')
const box = P('M8 16l16-8 16 8v18l-16 8-16-8z M8 16l16 8 16-8 M24 24v18')
const boxDown = G(8, 14, 0.66, box) + P('M24 3v9 M20 8l4 4 4-4')
const boxFar = G(26, 4, 0.4, box) + P('M6 38l22-20 M22 18h6v6')
const emptyBox = P('M8 16l16-8 16 8v18l-16 8-16-8z M8 16l16 8 16-8')
const eye = P('M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z') + C(24, 24, 5)
const discountTag = tag('%', 14)
const passportBack = P('M12 6h22v34H12z') + C(23, 20, 5) + P('M17 32h12') + P('M44 26H30 M34 22l-4 4 4 4')

// Places and transport
const door = P('M14 42V7h20v35 M9 42h30') + DOT(29, 26)
const doorOut = door + P('M24 25h19 M38 20l5 5-5 5')
const doorIn = door + P('M44 25H22 M27 20l-5 5 5 5')
const toilets =
  C(14, 10, 3.5) + P('M10 17h8l-1 12h-1v11h-4V29h-1z') + P('M24 6v36') + C(34, 10, 3.5) + P('M34 17l-5 14h3v9h4v-9h3z')
const pin = P('M24 42s-12-12-12-22a12 12 0 0 1 24 0c0 10-12 22-12 22z') + C(24, 20, 4)
const pinHere = G(10, 0, 0.58, pin) + C(24, 36, 6) + DOT(24, 36, 2)
const pinFar = G(24, 0, 0.45, pin) + G(-2, 12, 0.7, person) + P('M22 30l10-12')
const twoPinsClose = G(2, 8, 0.6, pin) + G(18, 8, 0.6, pin) + P('M6 40h36')
const twoPinsFar = G(-4, 8, 0.5, pin) + G(28, 8, 0.5, pin) + P('M8 38c8-6 24-6 32 0')
const arrowL = P('M40 24H10 M18 16l-8 8 8 8')
const arrowR = P('M8 24h30 M30 16l8 8-8 8')
const arrowUp = P('M24 40V10 M16 18l8-8 8 8')
const phone = P('M15 5h18a3 3 0 0 1 3 3v32a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z M21 38h6')
const phoneText = (s: string) => phone + T(24, 26, s, s.length > 1 ? 8.5 : 14)
const phonePin = phone + G(14, 9, 0.42, pin)
const train = P('M14 6h20a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4z M10 20h28 M16 42l4-6 M32 42l-4-6') + DOT(17, 28) + DOT(31, 28)
const bus = P('M10 6h28a2 2 0 0 1 2 2v28H8V8a2 2 0 0 1 2-2z M8 22h32') + C(15, 38, 3) + C(33, 38, 3) + DOT(13, 29) + DOT(35, 29)
const carBody = P('M5 34V25l5-11h28l5 11v9z M5 25h38') + C(13, 36, 3.5) + C(35, 36, 3.5)
const taxi = carBody + P('M19 14V9h10v5')
const ambulance = P('M4 34V14h24v20 M28 20h8l8 8v6H4') + C(12, 36, 3.5) + C(36, 36, 3.5) + P('M16 18v10 M11 23h10')
const plane = P('M21 8a3 3 0 0 1 6 0v10l14 8v4l-14-4v9l4 3v3l-7-2-7 2v-3l4-3v-9L7 30v-4l14-8z')
const ticket = P('M5 14h38v6a4 4 0 0 0 0 8v6H5v-6a4 4 0 0 0 0-8z M31 14v20') + P('M11 21h14 M11 27h9')
const octagon = P('M17 6h14l10 10v14L31 40H17L7 30V16z M14 23h20')
const swap = P('M8 16h28 M30 10l6 6-6 6 M40 32H12 M18 26l-6 6 6 6')
const speaker = P('M8 19h8l10-8v26l-10-8H8z M32 18a8 8 0 0 1 0 12 M36 13a15 15 0 0 1 0 22')
const exitSign = P('M6 10h36v22H6z') + G(10, 12, 0.4, walker) + P('M28 21h9 M34 18l3 3-3 3')
const shop = P('M8 42V22 M40 22v20 M4 42h40 M6 12h36l2 8a4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-8 0 4 4 0 0 1-8 0z M20 42V30h8v12')
const hospital = P('M8 42V14h32v28 M4 42h40 M20 42v-9h8v9 M24 18v10 M19 23h10')
const pharmacy = P('M8 42V16h32v26 M4 42h40 M6 16l18-10 18 10') + G(14, 17, 0.42, P('M12 30l16-16a7 7 0 0 1 10 10L22 40a7 7 0 0 1-10-10z M20 22l10 10'))
const floors = P('M12 6h24v36H12z M12 15h24 M12 24h24 M12 33h24')
const atm = P('M8 6h32v22H8z M13 11h22v10H13z M12 34h24 M15 28v14h18V28')
const mapFold = P('M6 12l12-5 12 5 12-5v29l-12 5-12-5-12 5z M18 7v29 M30 12v29')
const globe = C(24, 24, 16) + P('M8 24h32 M24 8c-6 5-6 27 0 32 M24 8c6 5 6 27 0 32')
const camera = P('M6 16h8l3-5h14l3 5h8v22H6z') + C(24, 26, 7)
const backpack = P('M14 16a10 10 0 0 1 20 0v24H14z M18 28h12v8H18z M20 10a4 4 0 0 1 8 0')
const taegeuk = C(24, 24, 15) + P('M9 24a7.5 7.5 0 0 1 15 0 7.5 7.5 0 0 0 15 0')

// Hotel
const bed = P('M4 36V14 M4 28h40v8 M44 28V24a4 4 0 0 0-4-4H20v8') + C(12, 23, 3.5)
const suitcase = P('M8 16h32v24H8z M18 16v-5h12v5 M16 16v24 M32 16v24')
const towel = P('M10 12h24a4 4 0 0 1 4 4v24H14a4 4 0 0 1-4-4z M10 16a4 4 0 0 1 8 0v24 M18 31h20')
const shower = P('M10 42V12a6 6 0 0 1 12 0v2 M15 14h14') + P('M18 20v2 M22 20v3 M26 20v2 M20 27v2 M24 27v2')
const aircon = P('M5 10h38v14H5z M10 19h28 M14 29c2 2-2 4 0 7 M24 29c2 2-2 4 0 7 M34 29c2 2-2 4 0 7')
const egg = P('M10 27c-4-8 4-16 12-14 6-6 18 0 16 8 6 6 0 14-8 12-4 6-16 6-20-6z') + C(24, 24, 5)
const elevator = P('M9 6h30v36H9z M24 6v36 M14 18l2.5-4 2.5 4z M29 30l2.5 4 2.5-4z')

// Time
const clock = (h: number, m: number) => {
  const a = ((h % 12) + m / 60) * 30 * (Math.PI / 180)
  const b = m * 6 * (Math.PI / 180)
  const hx = (24 + 7 * Math.sin(a)).toFixed(1)
  const hy = (24 - 7 * Math.cos(a)).toFixed(1)
  const mx = (24 + 11 * Math.sin(b)).toFixed(1)
  const my = (24 - 11 * Math.cos(b)).toFixed(1)
  return C(24, 24, 16) + P(`M24 24L${hx} ${hy} M24 24L${mx} ${my}`)
}
const halfHour = C(24, 24, 16) + `<path class="f" d="M24 24V8a16 16 0 0 1 0 32z" opacity="0.25"/>` + P('M24 8v32')
const alarm = clock(10, 10) + P('M8 12l6-6 M40 12l-6-6 M14 38l-3 4 M34 38l3 4')
const calendar = (inner = '') => P('M8 11h32v29H8z M8 19h32 M16 7v8 M32 7v8') + inner
const calToday = calendar(DOT(18, 26, 2.2) + P('M26 26h6 M18 33h14'))
const calTomorrow = calendar(P('M14 30h18 M27 25l5 5-5 5'))
const calYesterday = calendar(P('M34 30H16 M21 25l-5 5 5 5'))
const calWeekend = calendar(P('M28 23h8v14h-8z M32 23v14'))
const calCheck = calendar(P('M17 29l5 5 9-10'))
const sun = C(24, 24, 7) + P('M24 6v5 M24 37v5 M6 24h5 M37 24h5 M11 11l3.5 3.5 M33.5 33.5L37 37 M11 37l3.5-3.5 M33.5 14.5L37 11')
const sunrise = P('M4 34h40 M12 34a12 12 0 0 1 24 0 M24 12v6 M10 20l4 4 M38 20l-4 4')
const moon = P('M30 7a16 16 0 1 0 11 25A13 13 0 0 1 30 7z')
const moonZ = moon + T(15, 18, 'z', 9) + T(9, 11, 'z', 7)
const signBoard = (inner: string) => P('M16 9l8-4 8 4 M8 14h32v18H8z') + inner
const thermometer = P('M20 30V10a4 4 0 0 1 8 0v20a7 7 0 1 1-8 0z M24 16v19')
const snowflake = P('M24 6v36 M8.4 15l31.2 18 M8.4 33l31.2-18 M20 9l4 4 4-4 M20 39l4-4 4 4')
const hotDay = G(0, 0, 0.7, sun) + G(20, 6, 0.8, thermometer)

// Health
const bolt = P('M27 4L15 25h10l-4 19 14-24H25z')
const headache = C(22, 24, 12) + P('M10 42c2-4 6-6 12-6s10 2 12 6') + G(26, -2, 0.45, bolt)
const stomach = person + G(14, 20, 0.42, bolt)
const pill = P('M12 30l16-16a7 7 0 0 1 10 10L22 40a7 7 0 0 1-10-10z M20 22l10 10')
const peanut = P('M24 6c5 0 8 4 8 8 0 3-2 5-2 8s3 5 3 9c0 5-4 9-9 9s-9-4-9-9c0-4 3-6 3-9s-2-5-2-8c0-4 3-8 8-8z') + DOT(21, 14, 1) + DOT(27, 30, 1)
const shield = P('M24 5l15 5v12c0 9-6 16-15 21-9-5-15-12-15-21V10z') + P('M24 14l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z')
const wallet = P('M6 14h32a2 2 0 0 1 2 2v22a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z M6 14l24-7 3 7 M30 23h12v9H30z') + DOT(35, 27.5, 1.5)
const bang = P('M24 8v20') + DOT(24, 37, 2.5)

// Everyday objects
const pencilPaper = P('M8 8h20v32H8z M12 16h12 M12 22h8') + P('M40 14l4 4-16 16h-4v-4z')
const hourglass = P('M14 6h20 M14 42h20 M16 6c0 10 16 10 16 18S16 32 16 42 M32 6c0 10-16 10-16 18s16 8 16 18')
const snail = P('M4 38h32c4 0 7-3 7-7 M18 38a11 11 0 1 1 11-11c0 4-3 7-7 7a5 5 0 0 1-5-5c0-3 2-4 4-4 M36 31l2-8 M41 31l4-7')
const again = P('M37 25a13 13 0 1 1-4-10 M34 6v9h-9')
const checkCircle = C(24, 24, 16) + P('M16 24l6 6 11-12')
const xCircle = C(24, 24, 16) + P('M17 17l14 14M31 17l-14 14')
const noEntry = C(24, 24, 16) + P('M13 13l22 22')
const wifi = P('M6 20a25 25 0 0 1 36 0 M12 26a16 16 0 0 1 24 0 M18 32a8 8 0 0 1 12 0') + DOT(24, 38, 2.2)
const plug = P('M18 5v8 M30 5v8 M14 13h20v8a10 10 0 0 1-20 0z M24 31v11')
const nameTag = P('M6 12h36v24H6z M6 19h36 M14 29h20')
const star = P('M24 6l5.3 10.8 11.9 1.7-8.6 8.4 2 11.8L24 33.1l-10.6 5.6 2-11.8-8.6-8.4 11.9-1.7z')
const sparkle = P('M22 6c1 10 4 13 14 14-10 1-13 4-14 14-1-10-4-13-14-14 10-1 13-4 14-14z M38 30c.5 4 2 5.5 6 6-4 .5-5.5 2-6 6-.5-4-2-5.5-6-6 4-.5 5.5-2 6-6z')
const clink = G(-2, 4, 0.62, mug) + `<g transform="translate(50 4) scale(-0.62 0.62)" stroke-width="3.226">${mug}</g>` + P('M22 6l2-4 M26 7l3-3')

// Numbers
const dots = (n: number) => {
  const rows = n <= 5 ? [n] : [5, n - 5]
  return rows
    .map((count, r) => {
      const y = rows.length === 1 ? 24 : 17 + r * 14
      const start = 24 - (count - 1) * 4.5
      return Array.from({ length: count }, (_, i) => DOT(start + i * 9, y, 3)).join('')
    })
    .join('')
}
const items = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const w = 8
    const gap = 3
    const x = 24 - (n * w + (n - 1) * gap) / 2 + i * (w + gap)
    return P(`M${x} 20h${w}v${w}h-${w}z`)
  }).join('') + P('M6 34h36')

/** Drawings, keyed by concept. Several Expressions may share one. */
const drawings = {
  // Greetings
  hello: bubble(wave),
  thanks: bubble(heart),
  sorry: bow,
  attention: handUp,
  byeLeaving: G(-2, 8, 0.6, wave) + G(20, 6, 0.6, walker),
  byeStaying: G(-4, 0, 1, door) + G(20, 8, 0.55, walker),
  passing: G(-6, 8, 0.55, person) + G(26, 8, 0.55, person) + P('M24 6v30 M19 31l5 5 5-5'),
  welcome: G(-2, 6, 0.6, door) + G(18, 2, 0.6, bubble(wave)),
  notAtAll: bubble(smile),
  thanksForHelp: pair(hand, heart),
  helloFormal: bubble(bow),
  seeYouAgain: G(0, 8, 1, twoPeople) + G(17, -2, 0.3, again),
  niceDay: G(0, 0, 0.62, sun) + G(18, 18, 0.62, smile),
  goodNight: moonZ,
  // Basics
  yes: checkCircle,
  no: xCircle,
  okay: smile,
  giveMe: hand + G(15, 2, 0.4, box),
  noKorean: mark(bubbleText('한'), 'x'),
  english: mark(bubbleText('A'), '?'),
  this: boxDown,
  pardon: mark(ear, '?'),
  dontUnderstand: thought,
  dontKnow: mark(shrug, '?'),
  slowly: snail,
  again: bubble(again),
  gotIt: bulb,
  good: thumbsUp,
  that: boxFar,
  thereIs: mark(box, 'v'),
  thereIsnt: mark(emptyBox, 'x'),
  possible: mark(checkCircle, '?'),
  notPossible: noEntry,
  dontNeed: mark(hand + G(15, 2, 0.4, box), 'x'),
  littleKorean: mark(bubbleText('한'), '-'),
  writeIt: pencilPaper,
  moment: hourglass,
  whatIsThis: mark(box, '?'),
  helpMe: mark(G(0, 4, 0.9, handUp), '?'),
  really: bubbleText('!?', 12),
  // Numbers
  sino1: tag('1'),
  sino2: tag('2'),
  sino3: tag('3'),
  sino4: tag('4'),
  sino5: tag('5'),
  sino6: tag('6'),
  sino7: tag('7'),
  sino8: tag('8'),
  sino9: tag('9'),
  sino10: tag('10', 11),
  sino100: tag('100', 9),
  sino1000: tag('1,000', 7),
  sino10000: tag('10,000', 6),
  native1: dots(1),
  native2: dots(2),
  native3: dots(3),
  native4: dots(4),
  native5: dots(5),
  native6: dots(6),
  native7: dots(7),
  native8: dots(8),
  native9: dots(9),
  native10: dots(10),
  counter1: items(1),
  counter2: items(2),
  counter3: items(3),
  counter4: items(4),
  won: coin,
  price1000: note('₩1,000'),
  price10000: note('₩10,000'),
  price50000: note('₩50,000'),
  zero: phoneText('0'),
  // Shopping
  howMuch: mark(tag('₩', 14), '?'),
  thisPlease: G(11, 0, 0.5, boxDown) + hand,
  cardOk: mark(card, '?'),
  expensive: tag('₩₩₩', 7.5),
  receipt,
  bag,
  noBag: mark(bag, 'x'),
  looking: eye,
  takeThis: mark(box, 'v'),
  wherePay: mark(G(4, 4, 0.8, cash), '?'),
  cash,
  discount: discountTag,
  colour: mark(swatches, '?'),
  bigger: mark(boxes(true), '?'),
  tryOn: mark(shirt, '?'),
  taxRefund: passportBack,
  cheap: G(0, -4, 0.8, tag('₩', 14)) + P('M34 30v12 M29 37l5 5 5-5'),
  twoItems: P('M14 8h9v9h-9z M26 8h9v9h-9z') + hand,
  // Food
  water: glass,
  bill: G(14, -1, 0.52, receipt) + hand,
  delicious: tongue,
  onePerson: person,
  twoPeople,
  howMany: mark(twoPeople, '?'),
  menu,
  oneOfThis: menu + DOT(14, 20, 2.2) + P('M40 20h-6'),
  notSpicy: mark(pepper, 'x'),
  spicy: mark(pepper, '?'),
  oneMore: mark(bowl, '+'),
  englishMenu: menu + `<circle class="bg" cx="36" cy="34" r="8"/>` + T(36, 38.5, 'A', 11),
  whatIsGood: mark(menu, '?'),
  order: pencilPaper,
  sideDishes: mark(sideDishes, '+'),
  takeout: takeoutBox,
  beforeMeal: bubble(steamingBowl),
  afterMeal: pair(emptyBowl, heart),
  beer: mug,
  noMeat: mark(meat, 'x'),
  vegetarian: leaf,
  eatHere: G(4, 0, 0.8, steamingBowl) + G(26, 20, 0.45, pin),
  chopsticks,
  spoon,
  tissue: tissues,
  soju: sojuBottle,
  rice: bowl,
  porkBelly: grill,
  goodPlace: mark(G(0, 0, 0.9, steamingBowl) + G(24, 0, 0.4, pin), '?'),
  hungry: emptyBowl,
  // Café
  icedAmericano: icedCup,
  forHereHeard: mark(G(0, 0, 0.9, takeawayCup), '?'),
  forHere: G(-2, 6, 0.7, hotMug) + G(24, 14, 0.5, pin),
  takeAway: mark(takeawayCup, '>'),
  wifiPassword: mark(wifi, '?'),
  oneCup: hotMug + T(40, 14, '1', 10),
  hotOne: hotMug,
  iced: iceCubes,
  latte,
  large: sizes,
  lessSweet: mark(sugar, '-'),
  greenTea: teaCup,
  milk,
  outlet: mark(plug, '?'),
  waterBottle,
  // Directions
  toilet: mark(toilets, '?'),
  whereIsIt: mark(pin, '?'),
  here: pinHere,
  left: arrowL,
  right: arrowR,
  straight: arrowUp,
  overThere: pinFar,
  station: G(-2, 0, 0.7, train) + G(22, 14, 0.55, pin),
  close: mark(twoPinsClose, '?'),
  howToGet: mark(phonePin, '?'),
  whichExit: mark(exitSign, '?'),
  store: shop,
  lost: mark(person, '?'),
  thereNear: G(2, 12, 0.6, person) + G(22, 6, 0.55, pin),
  far: mark(twoPinsFar, '?'),
  canWalk: mark(walker, '?'),
  exit: doorOut,
  entrance: doorIn,
  whichFloor: mark(floors, '?'),
  atm: mark(atm, '?'),
  map: mapFold,
  // Transport
  toAddress: mark(G(0, 0, 0.8, taxi) + G(26, 0, 0.45, phonePin), '>'),
  stopHere: pair(carBody, octagon),
  subway: train,
  taxi,
  bus,
  tMoney: tCard,
  topUp: mark(tCard, '+'),
  toStation: mark(G(0, 0, 0.8, taxi) + G(27, 0, 0.42, train), '>'),
  busGo: mark(bus, '?'),
  howLong: mark(clock(2, 0), '?'),
  whichLine: mark(train, '?'),
  transfer: swap,
  airport: plane,
  announcement: speaker,
  ticket,
  ticketTo: mark(ticket, '>'),
  trainStation: G(0, 0, 0.8, train) + P('M4 42h40'),
  gettingOff: G(0, 0, 0.7, bus) + P('M30 26h14 M40 22l4 4-4 4'),
  // Hotel
  reservation: calCheck,
  checkIn: mark(bed, '>'),
  checkOut: mark(suitcase, '>'),
  checkoutTime: mark(G(0, 4, 0.6, suitcase) + G(20, 4, 0.6, clock(11, 0)), '?'),
  luggage: mark(suitcase, 'v'),
  towels: mark(towel, '+'),
  noHotWater: mark(shower, 'x'),
  aircon: mark(aircon, 'x'),
  breakfast: mark(G(0, 0, 0.8, egg) + G(22, 16, 0.55, clock(8, 0)), '?'),
  keyCard,
  elevator,
  // Time
  openWhen: mark(G(-4, 0, 0.8, doorIn) + G(22, 0, 0.55, clock(9, 0)), '?'),
  closeWhen: mark(G(-4, 0, 0.8, door) + G(22, 0, 0.55, clock(9, 0)), '?'),
  openNow: mark(G(0, 0, 0.9, signBoard(P('M17 23l4 4 9-8'))), '?'),
  today: calToday,
  tomorrow: calTomorrow,
  now: clock(12, 0) + DOT(24, 24, 2),
  timeNow: mark(clock(10, 10), '?'),
  threeOclock: clock(3, 0),
  thirtyMin: halfHour,
  yesterday: calYesterday,
  morning: sunrise,
  afternoon: sun,
  evening: moon,
  weekend: calWeekend,
  when: mark(calendar(), '?'),
  openSign: signBoard(P('M17 23l4 4 9-8')),
  closedSign: signBoard(P('M19 18l10 10 M29 18l-10 10')),
  // Health
  help: armsUp + G(34, 2, 0.35, bang),
  hurts: G(0, 4, 0.8, person) + G(26, 0, 0.45, bolt),
  pharmacy: mark(pharmacy, '?'),
  hospital,
  allergy: G(0, 0, 0.9, peanut) + G(26, 4, 0.5, bang),
  ambulance,
  police: shield,
  emergency: phoneText('119'),
  lostPhone: mark(phone, '?'),
  headache,
  stomach,
  fever: thermometer,
  peanutAllergy: mark(peanut, 'x'),
  medicine: pill,
  coldMedicine: pair(pill, tissues),
  lostWallet: mark(wallet, '?'),
  urgent: alarm,
  police112: phoneText('112'),
  // Small talk
  niceToMeet: twoPeople + G(18, -2, 0.25, heart),
  cheers: clink,
  whereFrom: mark(globe, '?'),
  fromEurope: globe + G(18, 2, 0.5, pin),
  tourist: backpack,
  firstTime: mark(taegeuk, '+'),
  canPhoto: mark(camera, '?'),
  takePhoto: G(-2, 8, 0.55, camera) + G(19, 12, 0.45, person) + G(29, 12, 0.45, person),
  likeKorea: G(0, 0, 0.9, taegeuk) + G(24, 22, 0.45, heart),
  name: mark(nameTag, '?'),
  fun: laugh,
  pretty: sparkle,
  best: star,
  tired: sleepy,
  hot: hotDay,
  cold: snowflake,
} satisfies Record<string, string>

export type DrawingKey = keyof typeof drawings

/** Which drawing each Expression uses. */
export const illustrationOf: Record<string, DrawingKey> = {
  // Greetings
  hello: 'hello',
  'thank-you': 'thanks',
  sorry: 'sorry',
  'excuse-me-attention': 'attention',
  'goodbye-leaving': 'byeLeaving',
  'goodbye-staying': 'byeStaying',
  'thank-you-2': 'thanks',
  'excuse-me-passing': 'passing',
  'welcome-heard': 'welcome',
  'sorry-light': 'sorry',
  'not-at-all': 'notAtAll',
  'youre-welcome': 'notAtAll',
  'thanks-for-help': 'thanksForHelp',
  'hello-formal-heard': 'helloFormal',
  'see-you-again': 'seeYouAgain',
  'have-a-nice-day': 'niceDay',
  'good-night': 'goodNight',
  'thanks-soft': 'thanks',
  // Basics
  yes: 'yes',
  no: 'no',
  'its-okay': 'okay',
  'give-me-please': 'giveMe',
  'dont-speak-korean': 'noKorean',
  'speak-english': 'english',
  'this-one': 'this',
  pardon: 'pardon',
  'i-dont-understand': 'dontUnderstand',
  'i-dont-know': 'dontKnow',
  'slowly-please': 'slowly',
  'once-more': 'again',
  'got-it': 'gotIt',
  good: 'good',
  'that-one': 'that',
  'there-is': 'thereIs',
  'there-isnt': 'thereIsnt',
  'is-it-possible': 'possible',
  'not-possible': 'notPossible',
  'dont-need': 'dontNeed',
  'a-little-korean': 'littleKorean',
  'write-it-please': 'writeIt',
  'just-a-moment': 'moment',
  'what-is-this': 'whatIsThis',
  'help-me-please': 'helpMe',
  really: 'really',
  // Numbers
  'sino-1': 'sino1',
  'sino-2': 'sino2',
  'sino-3': 'sino3',
  'sino-4': 'sino4',
  'sino-5': 'sino5',
  'sino-6': 'sino6',
  'sino-7': 'sino7',
  'sino-8': 'sino8',
  'sino-9': 'sino9',
  'sino-10': 'sino10',
  'sino-100': 'sino100',
  'sino-1000': 'sino1000',
  'sino-10000': 'sino10000',
  'native-1': 'native1',
  'native-2': 'native2',
  'native-3': 'native3',
  'native-4': 'native4',
  'native-5': 'native5',
  'native-6': 'native6',
  'native-7': 'native7',
  'native-8': 'native8',
  'native-9': 'native9',
  'native-10': 'native10',
  'counter-one': 'counter1',
  'counter-two': 'counter2',
  'counter-three': 'counter3',
  'counter-four': 'counter4',
  won: 'won',
  'price-1000': 'price1000',
  'price-10000': 'price10000',
  'price-50000': 'price50000',
  zero: 'zero',
  // Shopping
  'how-much': 'howMuch',
  'this-one-please': 'thisPlease',
  'card-ok': 'cardOk',
  'too-expensive': 'expensive',
  receipt: 'receipt',
  'bag-please': 'bag',
  'no-bag': 'noBag',
  'just-looking': 'looking',
  'ill-take-this': 'takeThis',
  'where-pay': 'wherePay',
  'pay-cash': 'cash',
  cash: 'cash',
  discount: 'discount',
  'another-colour': 'colour',
  'bigger-one': 'bigger',
  'try-on': 'tryOn',
  'tax-refund': 'taxRefund',
  cheap: 'cheap',
  'two-of-them': 'twoItems',
  // Food
  'water-please': 'water',
  'bill-please': 'bill',
  delicious: 'delicious',
  'one-person': 'onePerson',
  'two-people': 'twoPeople',
  'menu-please': 'menu',
  'how-many-heard': 'howMany',
  'one-of-this': 'oneOfThis',
  'not-spicy': 'notSpicy',
  'is-it-spicy': 'spicy',
  'one-more': 'oneMore',
  'english-menu': 'englishMenu',
  'what-is-good': 'whatIsGood',
  ordering: 'order',
  'more-side-dishes': 'sideDishes',
  'to-go': 'takeout',
  'before-meal': 'beforeMeal',
  'after-meal': 'afterMeal',
  beer: 'beer',
  'no-meat': 'noMeat',
  'vegetarian-menu': 'vegetarian',
  'eat-here': 'eatHere',
  chopsticks: 'chopsticks',
  spoon: 'spoon',
  tissue: 'tissue',
  soju: 'soju',
  rice: 'rice',
  'pork-belly': 'porkBelly',
  'good-restaurant-nearby': 'goodPlace',
  hungry: 'hungry',
  // Café
  'iced-americano': 'icedAmericano',
  'for-here-heard': 'forHereHeard',
  'for-here': 'forHere',
  'take-away': 'takeAway',
  'wifi-password': 'wifiPassword',
  'one-cup': 'oneCup',
  'hot-one': 'hotOne',
  iced: 'iced',
  latte: 'latte',
  'large-size': 'large',
  'less-sweet': 'lessSweet',
  'green-tea': 'greenTea',
  milk: 'milk',
  'power-outlet': 'outlet',
  'bottle-of-water': 'waterBottle',
  // Directions
  'bathroom-where': 'toilet',
  'where-is-it': 'whereIsIt',
  here: 'here',
  left: 'left',
  right: 'right',
  'go-straight': 'straight',
  'over-there': 'overThere',
  'subway-station': 'station',
  'is-it-close': 'close',
  'how-do-i-get-here': 'howToGet',
  'which-exit': 'whichExit',
  'convenience-store': 'store',
  'im-lost': 'lost',
  'there-near-you': 'thereNear',
  'is-it-far': 'far',
  'can-i-walk': 'canWalk',
  exit: 'exit',
  entrance: 'entrance',
  'which-floor': 'whichFloor',
  'atm-where': 'atm',
  map: 'map',
  // Transport
  'to-this-address': 'toAddress',
  'stop-here': 'stopHere',
  subway: 'subway',
  taxi: 'taxi',
  bus: 'bus',
  't-money': 'tMoney',
  'top-up': 'topUp',
  'to-seoul-station': 'toStation',
  'does-bus-go': 'busGo',
  'how-long': 'howLong',
  'which-line': 'whichLine',
  'where-transfer': 'transfer',
  airport: 'airport',
  'this-station-heard': 'announcement',
  ticket: 'ticket',
  'ticket-to-busan': 'ticketTo',
  'train-station': 'trainStation',
  'getting-off': 'gettingOff',
  // Hotel
  'have-reservation': 'reservation',
  'check-in': 'checkIn',
  'check-out': 'checkOut',
  'checkout-time': 'checkoutTime',
  'keep-luggage': 'luggage',
  'more-towels': 'towels',
  'no-hot-water': 'noHotWater',
  'aircon-broken': 'aircon',
  'breakfast-time': 'breakfast',
  'key-card': 'keyCard',
  elevator: 'elevator',
  // Time
  'what-time-open': 'openWhen',
  'what-time-close': 'closeWhen',
  'open-now': 'openNow',
  today: 'today',
  tomorrow: 'tomorrow',
  now: 'now',
  'what-time-now': 'timeNow',
  'three-oclock': 'threeOclock',
  'thirty-minutes': 'thirtyMin',
  yesterday: 'yesterday',
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  weekend: 'weekend',
  when: 'when',
  'open-sign': 'openSign',
  'closed-sign': 'closedSign',
  // Health
  help: 'help',
  'it-hurts': 'hurts',
  'pharmacy-where': 'pharmacy',
  hospital: 'hospital',
  allergy: 'allergy',
  'call-ambulance': 'ambulance',
  'call-police': 'police',
  'emergency-119': 'emergency',
  'lost-phone': 'lostPhone',
  headache: 'headache',
  'stomach-ache': 'stomach',
  fever: 'fever',
  'peanut-allergy': 'peanutAllergy',
  medicine: 'medicine',
  'cold-medicine': 'coldMedicine',
  'lost-wallet': 'lostWallet',
  urgent: 'urgent',
  'police-112': 'police112',
  // Small talk
  'nice-to-meet-you': 'niceToMeet',
  cheers: 'cheers',
  'where-from-heard': 'whereFrom',
  'from-europe': 'fromEurope',
  'im-a-tourist': 'tourist',
  'first-time-korea': 'firstTime',
  'can-i-take-photo': 'canPhoto',
  'take-our-photo': 'takePhoto',
  'like-korea': 'likeKorea',
  'whats-your-name': 'name',
  'its-fun': 'fun',
  'its-pretty': 'pretty',
  'the-best': 'best',
  tired: 'tired',
  'its-hot': 'hot',
  'its-cold': 'cold',
}

export function hasDrawing(key: string): key is DrawingKey {
  return key in drawings
}

/** Complete SVG markup for an Expression's Illustration, or undefined if it has none. */
export function illustrationSvg(expressionId: string): string | undefined {
  const key = illustrationOf[expressionId]
  if (!key) return undefined
  return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawings[key]}</svg>`
}

/** Other Expressions sharing the same drawing ("also correct" on a See card). */
export function illustrationSiblings(expressionId: string): string[] {
  const key = illustrationOf[expressionId]
  return Object.keys(illustrationOf).filter((id) => id !== expressionId && illustrationOf[id] === key)
}
