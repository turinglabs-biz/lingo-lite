import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { EchoProvider } from './echo/EchoProvider.tsx'
import { FocusProvider } from './progress/focus.tsx'
import './styles.css'

// Ask the browser not to evict Progress under storage pressure (installed PWAs are usually granted this).
navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FocusProvider>
      <EchoProvider>
        <App />
      </EchoProvider>
    </FocusProvider>
  </StrictMode>,
)
