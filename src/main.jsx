import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// On page refresh, redirect to home
if (window.performance && window.performance.getEntriesByType) {
  const navEntries = window.performance.getEntriesByType("navigation");
  if (navEntries.length > 0 && navEntries[0].type === "reload") {
    if (window.location.pathname !== "/") {
      window.location.replace("/");
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)