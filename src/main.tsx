import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import React from 'react'
import { Provider } from './components/ui/provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
  </StrictMode>,
)
