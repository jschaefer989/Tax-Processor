import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './UI/App.tsx'
import ErrorBoundary from './UI/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
