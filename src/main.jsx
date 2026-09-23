import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// مزامنة الوضع الداكن مع تفضيل النظام (system-preference dark mode sync)
function syncDarkMode() {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', prefersDark);
}
syncDarkMode();
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', syncDarkMode);
  else if (mq.addListener) mq.addListener(syncDarkMode);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)