import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; 

// Đoạn code này sẽ tìm cái thẻ <div id="root"> trong file HTML của ông 
// và đổ toàn bộ giao diện học tiếng Việt vào đó.
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
