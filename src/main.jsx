import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AttendanceSyncStatus from './components/AttendanceSyncStatus.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="site-grid-background" aria-hidden="true">
      <i className="grid-vertical" />
      <i className="grid-horizontal" />
    </div>
    <App />
    <AttendanceSyncStatus />
  </StrictMode>,
)
