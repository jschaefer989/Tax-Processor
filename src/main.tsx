import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import TaxClarity from './UI/TaxClarity.tsx'
import ErrorBoundary from './UI/ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <TaxClarity />
    </ErrorBoundary>
  </StrictMode>,
)
