import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App.tsx'
import { db } from './db.ts'
import { EchoProvider } from './echo/EchoProvider.tsx'
import { FocusProvider } from './progress/focus.tsx'
import { IgnoredProvider } from './progress/ignored.tsx'
import './styles.css'

const STARTED = 'lingo-lite.started'

/**
 * Someone new to this phone sees the landing page first. The installed app, anyone who pressed "Start learning"
 * (which opens /?start) and anyone with Progress go straight in.
 */
async function showLandingPage(): Promise<boolean> {
  const installed = matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
  if (installed) return false
  const starting = new URLSearchParams(location.search).has('start')
  try {
    if (starting) {
      localStorage.setItem(STARTED, '1')
      history.replaceState(null, '', location.pathname)
    }
    if (localStorage.getItem(STARTED)) return false
  } catch {
    // Storage blocked: fall back to the Progress check.
  }
  return !starting && (await db.introductions.count()) === 0
}

showLandingPage().then((landing) => {
  if (landing) return location.replace(`${import.meta.env.BASE_URL}welcome/`)
  registerSW({ immediate: true })
  // Ask the browser not to evict Progress under storage pressure (installed PWAs are usually granted this).
  navigator.storage?.persist?.()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <FocusProvider>
        <IgnoredProvider>
          <EchoProvider>
            <App />
          </EchoProvider>
        </IgnoredProvider>
      </FocusProvider>
    </StrictMode>,
  )
})
