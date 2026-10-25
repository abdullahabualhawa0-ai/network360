import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

import { getTheme, applyTheme } from '@/lib/theme';

// تطبيق السمة المحفوظة (الافتراضي هو الوضع الداكن Charcoal & Amber)
applyTheme(getTheme());
if (window.matchMedia) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSysChange = () => {
    if (getTheme() === 'system') {
      applyTheme('system');
    }
  };
  if (mq.addEventListener) mq.addEventListener('change', handleSysChange);
  else if (mq.addListener) mq.addListener(handleSysChange);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)