import React, { useState, useEffect, useRef } from 'react';
import { generateContentWithRetry } from '../config/apiKeys';

export const AIfriendLan: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Guest', gender: 'male' };
  const lang = localStorage.getItem('lang') || 'EN';
  const p = user.gender === 'female' ? 'Chị' : 'Anh';

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data.type === 'SEND_TO_GEMINI') {
        try {
          const response = await generateContentWithRetry({
            model: 'gemini-1.5-flash',
            contents: event.data.history.map((m: any) => ({
              role: m.role === 'ai' ? 'model' : 'user',
              parts: [{ text: m.text }]
            })),
            config: { 
              systemInstruction: `You are Lan, a 25-year-old girl from Ha Long, Vietnam. 
              You are friendly, speak natural Vietnamese. Refer to yourself as "Em" and user as "${p}".
              Always provide a translation in ${lang === 'EN' ? 'English' : 'Russian'}.
              Format: Vietnamese | Translation. | USER_TRANSLATION: [Correct translation of user's last msg]` 
            }
          });

          const aiText = response.text || "Em xin lỗi, em chưa nghe rõ.";
          iframeRef.current?.contentWindow?.postMessage({ type: 'GEMINI_RESPONSE', text: aiText }, '*');
        } catch (error) {
          iframeRef.current?.contentWindow?.postMessage({ type: 'GEMINI_RESPONSE', text: "Lỗi kết nối rồi ạ. | Connection error." }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, lang, p]);

  const gameHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script src="https://cdn.tailwindcss.com"></script>
<style>
body { font-family: sans-serif; background: #f1f5f9; margin:0; overflow:hidden; }
</style>
</head>
<body>

<div id="start-screen" style="position:fixed;inset:0;background:#0284c7;display:flex;align-items:center;justify-content:center;">
<button onclick="startChat()" style="padding:20px 40px;font-size:22px;">START NOW</button>
</div>

<div style="display:flex;height:100vh;">
<div style="flex:1;display:flex;flex-direction:column;">
<div id="messages" style="flex:1;overflow:auto;padding:20px;"></div>
<div id="typing" style="display:none;padding:10px;">Typing...</div>
<div style="display:flex;padding:10px;background:#eee;">
<input id="input" style="flex:1;padding:10px;">
<button onclick="send()">SEND</button>
</div>
</div>
</div>

<script>

let history = [];
let isThinking = false;
let speed = 1.0;

/* =========================
   🔥 AUDIO FIX - TẠO AUDIO OBJECT SỚM
========================= */

let currentAudio = null;

function speak(text) {
  const clean = text.split('|')[0].trim();
  const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" 
    + encodeURIComponent(clean) + 
    "&tl=vi&client=tw-ob";

  // ✅ Nếu chưa có Audio object, tạo mới
  if (!currentAudio) {
    currentAudio = new Audio();
  }

  // ✅ Chỉ thay đổi src, không tạo Audio mới
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio.src = url;
  currentAudio.playbackRate = speed;

  currentAudio.play().catch(e => {
    console.log("Audio blocked:", e);
  });
}

/* =========================
   🔥 AUDIO FIX END
========================= */

function addMessage(role, text) {
  const container = document.getElementById('messages');
  const div = document.createElement('div');
  div.style.marginBottom = "15px";
  div.innerHTML = "<b>" + (role === 'user' ? "You: " : "Lan: ") + "</b>" + text.split('|')[0];
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function startChat() {
  // 🔥 TẠO AUDIO OBJECT NGAY KHI USER CLICK START
  currentAudio = new Audio();
  
  document.getElementById('start-screen').style.display = 'none';
  const welcome = "Dạ em chào Anh/Chị! Em là Lan. Rất vui được làm quen với mình ạ! | Hello!";
  addMessage('ai', welcome);
  speak(welcome);
}

function send() {
  const input = document.getElementById('input');
  const val = input.value.trim();
  if(!val || isThinking) return;

  addMessage('user', val);
  history.push({role:'user', text:val});
  input.value='';
  isThinking=true;
  document.getElementById('typing').style.display='block';

  window.parent.postMessage({ type:'SEND_TO_GEMINI', history:history }, '*');
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'GEMINI_RESPONSE') {
    isThinking=false;
    document.getElementById('typing').style.display='none';
    const text = event.data.text;
    addMessage('ai', text);
    history.push({role:'ai', text:text});
    speak(text);
  }
});

document.getElementById('input').addEventListener('keypress', (e)=>{
  if(e.key==='Enter') send();
});

</script>
</body>
</html>
`;

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col">
      <iframe
        ref={iframeRef}
        className="w-full flex-1 border-none bg-white"
        srcDoc={gameHTML}
        title="AI Friend Lan"
        sandbox="allow-scripts allow-same-origin allow-autoplay"
        allow="autoplay"
      />
    </div>
  );
};

export default AIfriendLan;
