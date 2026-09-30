// The landing page (welcome/index.html): what Lingo Lite is, shown with real phrases and audio. No React and no
// Progress: it only reads the Catalog and plays Clips.
import '@fontsource-variable/onest'
import '@fontsource-variable/unbounded'
import { illustrationSvg } from '../../catalog/illustrations.ts'
import { clipUrl, pickVoice, type Speed, type Voice } from '../audio/voices.ts'
import { catalog, expressionById, topics } from '../catalog/index.ts'
import './welcome.css'

const BASE = import.meta.env.BASE_URL
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const $ = <T extends Element>(selector: string, root: ParentNode = document) => root.querySelector<T>(selector)!
const $$ = <T extends Element>(selector: string, root: ParentNode = document) => [...root.querySelectorAll<T>(selector)]
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const expression = (id: string) => expressionById.get(id)!

// ---------- Page facts ----------

for (const a of $$<HTMLAnchorElement>('[data-start]')) a.href = `${BASE}?start`
for (const el of $$('[data-count="phrases"]')) el.textContent = String(catalog.length)
for (const el of $$('[data-count="topics"]')) el.textContent = String(topics.length)

// ---------- Audio: one element, a random Voice for Normal, the same Voice again for Slow ----------

const audio = new Audio()
const lastVoice = new Map<string, Voice>()
let onTick: ((progress: number) => void) | null = null
let onStop: (() => void) | null = null

function play(id: string, speed: Speed, tick?: (progress: number) => void, stop?: () => void) {
  onStop?.()
  const voice = pickVoice(speed, lastVoice.get(id))
  lastVoice.set(id, voice)
  audio.src = clipUrl(id, voice, speed)
  onTick = tick ?? null
  onStop = stop ?? null
  audio.play().catch(() => onStop?.())
  requestAnimationFrame(frame)
}

function frame() {
  if (audio.paused) return
  if (audio.duration > 0) onTick?.(audio.currentTime / audio.duration)
  requestAnimationFrame(frame)
}

audio.addEventListener('ended', () => {
  onTick?.(1)
  const stop = onStop
  onStop = null
  stop?.()
})

// ---------- Phrases set as syllables ----------

interface Syllables {
  spans: HTMLElement[]
  /** Colors the syllables in reading order, 0–1, in proportion to their length. */
  fill: (progress: number) => void
}

/** Renders a Romanization as syllable spans (hyphens kept as quiet separators) that can be filled as it is spoken. */
function syllables(el: HTMLElement, romanization: string): Syllables {
  el.textContent = ''
  const spans: HTMLElement[] = []
  const parts: { el: HTMLElement; start: number; length: number }[] = []
  let total = 0
  romanization.split(' ').forEach((word, w) => {
    if (w > 0) el.append(' ')
    // A word stays on one line when it fits, and breaks after a hyphen (a zero-width space) only when it's too wide.
    const wordEl = document.createElement('span')
    wordEl.className = 'word'
    el.append(wordEl)
    word.split('-').forEach((syllable, s) => {
      if (s > 0) {
        const hy = document.createElement('span')
        hy.className = 'hy'
        hy.textContent = '-'
        wordEl.append(hy, '​')
        spans.push(hy)
      }
      const span = document.createElement('span')
      span.className = 'syl'
      span.textContent = syllable
      wordEl.append(span)
      spans.push(span)
      parts.push({ el: span, start: total, length: syllable.length })
      total += syllable.length
    })
  })
  spans.forEach((s, i) => s.style.setProperty('--i', String(i)))
  return {
    spans,
    fill(progress) {
      const at = progress * total
      for (const p of parts) p.el.style.setProperty('--fill', clamp01((at - p.start) / p.length).toFixed(3))
    },
  }
}

// ---------- Hero: the phrase player ----------

const HERO = ['bathroom-where', 'iced-americano', 'to-this-address', 'thank-you', 'card-ok', 'pharmacy-where']
const phraseEl = $<HTMLElement>('.phrase')
let heroIndex = 0
let hero: Syllables

function showHero(index: number, entrance: boolean) {
  heroIndex = (index + HERO.length) % HERO.length
  const e = expression(HERO[heroIndex])
  $('.player-english').textContent = e.english
  $('.player-count').textContent = `${heroIndex + 1} of ${HERO.length}`
  $('.phrase-hangul').textContent = e.hangul
  hero = syllables(phraseEl, e.romanization)
  phraseEl.classList.remove('enter')
  if (entrance && !reduced) {
    void phraseEl.offsetWidth
    phraseEl.classList.add('enter')
  }
}

for (const b of $$<HTMLButtonElement>('[data-play]')) {
  b.addEventListener('click', () => {
    const player = $('.player')
    player.classList.add('speaking')
    hero.fill(0)
    play(HERO[heroIndex], b.dataset.play as Speed, (p) => hero.fill(p), () => player.classList.remove('speaking'))
  })
}
for (const b of $$<HTMLButtonElement>('[data-step]')) {
  b.addEventListener('click', () => {
    audio.pause()
    showHero(heroIndex + Number(b.dataset.step), true)
  })
}
showHero(0, true)

// ---------- Hero: the sky of phrases, in three layers of depth ----------

const sky = $<HTMLElement>('.sky')
const skyPhrases = catalog.filter((e) => !HERO.includes(e.id) && e.romanization.length <= 24).map((e) => e.romanization)
let seed = 20260930
const random = () => ((seed = (seed * 48271) % 2147483647) - 1) / 2147483646
// A shuffled deck of phrases and a grid of slots (5 columns × 8 rows), dealt out across the three depths.
const deck = skyPhrases.map((p) => ({ p, k: random() })).sort((a, b) => a.k - b.k).map(({ p }) => p)
const slots = Array.from({ length: 40 }, (_, i) => ({ col: i % 5, row: Math.floor(i / 5), k: random() })).sort((a, b) => a.k - b.k)
const layers = [1, 2, 3].map((depth) => {
  const layer = document.createElement('div')
  layer.className = `sky-layer d${depth}`
  const drift = document.createElement('div')
  drift.className = 'sky-drift'
  for (let i = 0; i < 12 - depth * 2; i++) {
    const slot = slots.pop()!
    const s = document.createElement('span')
    s.textContent = deck.pop()!
    s.style.left = `${(slot.col * 20 + random() * 8).toFixed(1)}%`
    s.style.top = `${(slot.row * 12.5 + random() * 5).toFixed(1)}%`
    drift.append(s)
  }
  layer.append(drift)
  sky.append(layer)
  return { layer, depth }
})

let pointerX = 0
let pointerY = 0
addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return
  pointerX = e.clientX / innerWidth - 0.5
  pointerY = e.clientY / innerHeight - 0.5
  schedule()
})

// ---------- Situations: rows of real phrases that slide as the page scrolls ----------

const rowsEl = $<HTMLElement>('.rows')
const rows = topics.map((topic, i) => {
  const items = catalog.filter((e) => e.topic === topic.id)
  const row = document.createElement('div')
  row.className = 'row'
  const label = document.createElement('h3')
  label.className = 'row-label'
  label.innerHTML = `<span></span><span class="row-count">${items.length}</span>`
  label.firstElementChild!.textContent = topic.name
  const track = document.createElement('div')
  track.className = 'track'
  for (const e of items) {
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'chip'
    chip.innerHTML = `<span class="chip-rom" lang="ko-Latn"></span><span class="chip-en"></span>`
    chip.firstElementChild!.textContent = e.romanization
    chip.lastElementChild!.textContent = e.english
    chip.setAttribute('aria-label', `Play ${e.english}: ${e.romanization}`)
    chip.addEventListener('click', () => {
      chip.classList.add('playing')
      play(e.id, 'normal', undefined, () => chip.classList.remove('playing'))
    })
    track.append(chip)
  }
  // Once someone swipes, scrolls or tabs through a row, it's theirs: stop driving it from the page scroll.
  const takeOver = () => (track.dataset.manual = 'true')
  for (const type of ['pointerdown', 'wheel', 'focusin', 'touchstart'] as const) track.addEventListener(type, takeOver, { passive: true })
  row.append(label, track)
  rowsEl.append(row)
  return { track, direction: i % 2 === 0 ? 1 : -1 }
})

// ---------- Practice: a phone whose screen follows the step being read ----------

const phone = $<HTMLElement>('.phone')
const screens = practiceScreens()
$('.phone-screen', phone).innerHTML = screens.map((html, i) => `<div class="screen" data-screen="${i + 1}">${html}</div>`).join('')
for (const step of $$<HTMLElement>('.step')) {
  // On small screens each step carries its own phone instead of a sticky one.
  const n = Number(step.dataset.stepIndex)
  step.insertAdjacentHTML('beforeend', `<div class="step-phone" aria-hidden="true"><div class="phone-screen"><div class="screen">${screens[n - 1]}</div></div></div>`)
}
const stepObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      const n = (entry.target as HTMLElement).dataset.stepIndex!
      phone.dataset.active = n
      for (const s of $$('.step')) s.classList.toggle('active', (s as HTMLElement).dataset.stepIndex === n)
    }
  },
  { rootMargin: '-45% 0px -45% 0px' },
)
for (const s of $$('.step')) stepObserver.observe(s)

function practiceScreens(): string[] {
  const e = expression('bathroom-where')
  const picture = illustrationSvg(e.id) ?? ''
  const options = ['subway-station', 'bathroom-where', 'is-it-far', 'go-straight'].map(expression)
  const bar = (n: number) => `<div class="app-bar"><span>✕</span><i><b style="width:${n}%"></b></i></div>`
  return [
    `${bar(20)}
     <p class="app-eyebrow">New Expression</p>
     <div class="app-picture">${picture}</div>
     <p class="app-rom">${e.romanization}</p>
     <p class="app-hangul" lang="ko">${e.hangul}</p>
     <p class="app-en">${e.english}</p>
     <div class="app-play"><span class="app-btn">▶</span><span class="app-btn soft">0.75×</span></div>
     <span class="app-primary">Next</span>`,
    `${bar(55)}
     <p class="app-eyebrow">Say it in Korean</p>
     <p class="app-prompt">${e.english}</p>
     ${options.map((o) => `<span class="app-option${o.id === e.id ? ' right' : ''}">${o.romanization}</span>`).join('')}
     <span class="app-primary">Next</span>`,
    `<p class="app-brand">Lingo Lite</p>
     <p class="app-hello" lang="ko">안녕하세요!</p>
     <div class="app-stats"><p><b>12</b>reviews due</p><p><b>38</b>Learned</p><p><b>3/17</b>Batches</p></div>
     <span class="app-primary">Continue · review 12</span>
     <span class="app-secondary">New Batch · 15 Expressions</span>`,
    `<div class="app-show">
       <div class="app-picture big">${picture}</div>
       <p class="app-show-hangul" lang="ko">${e.hangul}</p>
       <p class="app-rom">${e.romanization}</p>
       <p class="app-en">${e.english}</p>
       <p class="app-hint">Tap anywhere to close</p>
     </div>`,
  ]
}

// ---------- Echo: the score ring counts up once, when it comes into view ----------

const echo = $<HTMLElement>('.echo-visual')
const SCORE = 92
new IntersectionObserver(
  (entries, observer) => {
    if (!entries.some((e) => e.isIntersecting)) return
    observer.disconnect()
    const set = (v: number) => {
      echo.style.setProperty('--score', String(v))
      $('[data-score]', echo).textContent = String(Math.round(v))
    }
    if (reduced) return set(SCORE)
    const start = performance.now()
    const step = (now: number) => {
      const t = clamp01((now - start) / 1400)
      set(SCORE * (1 - (1 - t) ** 3))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  },
  { threshold: 0.5 },
).observe(echo)

// ---------- Focus: pin a phrase and it moves up the queue ----------

const focusList = $<HTMLUListElement>('.focus-list')
const FOCUS = ['water-please', 'card-ok', 'bill-please', 'english-menu']
const pinned: string[] = []
for (const id of FOCUS) {
  const e = expression(id)
  const li = document.createElement('li')
  li.dataset.id = id
  li.innerHTML = `<span class="focus-text"><span class="focus-rom" lang="ko-Latn"></span><span class="focus-en"></span></span>
    <button type="button" class="pin" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 3.5h5v5.5l3 3v1.5h-11V12l3-3z"/><path d="M12 13.5v7"/></svg></button>`
  $('.focus-rom', li).textContent = e.romanization
  $('.focus-en', li).textContent = e.english
  const pin = $<HTMLButtonElement>('.pin', li)
  pin.setAttribute('aria-label', `Pin ${e.english}`)
  pin.addEventListener('click', () => {
    const on = !pinned.includes(id)
    if (on) pinned.push(id)
    else pinned.splice(pinned.indexOf(id), 1)
    pin.setAttribute('aria-pressed', String(on))
    li.classList.toggle('pinned', on)
    reorderFocus()
  })
  focusList.append(li)
}

/** Pinned phrases first, in the order they were pinned, sliding to their new places. */
function reorderFocus() {
  const items = $$<HTMLLIElement>('li', focusList)
  const before = new Map(items.map((li) => [li, li.getBoundingClientRect().top]))
  const order = [...pinned, ...FOCUS.filter((id) => !pinned.includes(id))]
  for (const id of order) focusList.append(items.find((li) => li.dataset.id === id)!)
  if (reduced) return
  for (const li of items) {
    const dy = before.get(li)! - li.getBoundingClientRect().top
    if (!dy) continue
    li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' })
  }
}

// ---------- Offline: the airplane-mode switch ----------

const toggle = $<HTMLButtonElement>('.switch')
toggle.addEventListener('click', () => {
  const on = toggle.getAttribute('aria-checked') !== 'true'
  toggle.setAttribute('aria-checked', String(on))
  $('.offline-demo').classList.toggle('offline', on)
})

// ---------- Closing phrase, filled as the last section scrolls into place ----------

const finalPhrase = syllables($<HTMLElement>('.final-phrase'), expression('see-you-again').romanization)

// ---------- Scroll and pointer: one animation frame drives every scroll-linked piece ----------

const topbar = $<HTMLElement>('.topbar')
const heroEl = $<HTMLElement>('.hero')
const situations = $<HTMLElement>('.situations')
const finalEl = $<HTMLElement>('.final')
let queued = false

function schedule() {
  if (queued) return
  queued = true
  requestAnimationFrame(update)
}

function update() {
  queued = false
  const vh = innerHeight
  topbar.classList.toggle('solid', scrollY > heroEl.offsetHeight - 80)

  if (!reduced) {
    const y = Math.min(scrollY, heroEl.offsetHeight)
    for (const { layer, depth } of layers) {
      const d = depth * 0.22
      layer.style.transform = `translate3d(${(pointerX * 40 * d).toFixed(1)}px, ${(-y * d + pointerY * 40 * d).toFixed(1)}px, 0)`
    }
    const r = situations.getBoundingClientRect()
    const progress = clamp01((vh - r.top) / (vh + r.height))
    for (const { track, direction } of rows) {
      if (track.dataset.manual) continue
      const room = track.scrollWidth - track.clientWidth
      const middle = room / 2
      track.scrollLeft = middle + (progress - 0.5) * Math.min(room, 900) * direction
    }
  }

  const f = finalEl.getBoundingClientRect()
  finalPhrase.fill(reduced ? 1 : clamp01((vh - f.top) / (vh * 0.8)))
}

addEventListener('scroll', schedule, { passive: true })
addEventListener('resize', schedule)
update()
