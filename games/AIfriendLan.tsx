import React, { useState, useEffect, useRef } from 'react';
import { generateContentWithRetry } from '../config/apiKeys';

export const AIfriendLan: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Lấy dữ liệu người dùng để truyền vào AI
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Guest', gender: 'male' };
  const lang = localStorage.getItem('lang') || 'EN';
  const p = user.gender === 'female' ? 'Chị' : 'Anh';

  // Logic kết nối React (Gemini) với Iframe (Giao diện & Audio)
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
          console.error("Gemini Error:", error);
          iframeRef.current?.contentWindow?.postMessage({ type: 'GEMINI_RESPONSE', text: "Lỗi kết nối rồi ạ. | Connection error." }, '*');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, lang, p]);

  const gameHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Quicksand', sans-serif; background: #f1f5f9; height: 100vh; margin: 0; overflow: hidden; }
        .glass-panel { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-right: 1px solid rgba(0,0,0,0.05); }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .bubble { animation: pop 0.3s ease-out forwards; position: relative; max-width: 85%; }
        @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .typing-dot { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: blink 1.4s infinite; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
    </style>
</head>
<body>
    <div id="start-screen" class="fixed inset-0 bg-sky-600 z-50 flex flex-col items-center justify-center text-center">
        <div class="bg-white/10 p-8 rounded-[3rem] backdrop-blur-md border border-white/20">
            <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400" class="w-40 h-40 rounded-full border-8 border-white shadow-2xl mx-auto mb-6 object-cover">
            <h1 class="text-white text-4xl font-black mb-2 italic">LAN HA LONG</h1>
            <p class="text-sky-100 mb-8 font-bold tracking-widest uppercase text-sm">Your Local AI Friend</p>
            <button onclick="startChat()" class="bg-white text-sky-600 px-16 py-5 rounded-2xl font-black text-2xl shadow-xl hover:scale-105 transition-all">START NOW</button>
        </div>
    </div>

    <div class="flex h-screen overflow-hidden">
        <div class="hidden md:flex w-80 glass-panel flex-col items-center p-8">
            <img src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400" class="w-48 h-48 rounded-[2.5rem] shadow-2xl object-cover border-4 border-white mb-6">
            <h2 class="text-2xl font-black text-slate-800">Lan ✨</h2>
            <p class="text-sky-500 font-bold text-xs uppercase tracking-tighter mb-8 text-center">25 years old • Ha Long City</p>
            
            <div class="w-full space-y-4">
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">About</p>
                    <p class="text-sm font-bold text-slate-600">Friendly, loves sea food and teaching Vietnamese.</p>
                </div>
                <div class="bg-sky-50 p-4 rounded-2xl border border-sky-100">
                    <p class="text-[10px] font-black text-sky-400 uppercase tracking-widest">Voice Speed</p>
                    <div class="flex gap-2 mt-2">
                        <button onclick="setSpeed(1)" id="s-fast" class="flex-1 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-black">FAST</button>
                        <button onclick="setSpeed(0.7)" id="s-slow" class="flex-1 py-1 rounded-lg bg-white text-sky-600 border border-sky-200 text-[10px] font-black">SLOW</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1 flex flex-col bg-white relative">
            <div class="p-4 border-b flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600">L</div>
                    <div>
                        <p class="font-black text-sm text-slate-800 uppercase">Lan Ha Long</p>
                        <p id="status-text" class="text-[10px] font-bold text-green-500 uppercase tracking-widest">Online</p>
                    </div>
                </div>
            </div>

            <div id="messages" class="messages-area flex-1 overflow-y-auto p-6 space-y-6"></div>

            <div id="typing" class="px-6 py-2 hidden">
                <div class="flex gap-1">
                    <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                </div>
            </div>

            <div class="p-6 border-t bg-slate-50 flex gap-3">
                <input id="input" type="text" class="flex-1 bg-white px-6 py-4 rounded-2xl shadow-sm outline-none font-bold text-slate-700 border-2 border-transparent focus:border-sky-500 transition-all" placeholder="Nhập tiếng Việt...">
                <button onclick="send()" class="bg-sky-600 text-white px-8 rounded-2xl font-black hover:bg-sky-700 transition-all shadow-lg active:scale-95">SEND</button>
            </div>
        </div>
    </div>

    <script>
        let history = [];
        let isThinking = false;
        let speed = 1.0;

        function setSpeed(s) {
            speed = s;
            document.getElementById('s-fast').className = s === 1 ? 'flex-1 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-black' : 'flex-1 py-1 rounded-lg bg-white text-sky-600 border border-sky-200 text-[10px] font-black';
            document.getElementById('s-slow').className = s === 0.7 ? 'flex-1 py-1 rounded-lg bg-sky-600 text-white text-[10px] font-black' : 'flex-1 py-1 rounded-lg bg-white text-sky-600 border border-sky-200 text-[10px] font-black';
        }

        function speak(text) {
            const clean = text.split('|')[0].trim();
            const url = "https://translate.google.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(clean) + "&tl=vi&client=tw-ob";
            const audio = new Audio(url);
            audio.playbackRate = speed;
            audio.play().catch(e => console.log("Audio block", e));
        }

        function addMessage(role, text) {
            const container = document.getElementById('messages');
            const div = document.createElement('div');
            div.className = 'flex ' + (role === 'user' ? 'justify-end' : 'justify-start');
            
            const content = text.split('|')[0].trim();
            const trans = text.split('|')[1] ? text.split('|')[1].trim() : '';
            const correction = text.split('USER_TRANSLATION:')[1] || '';

            div.innerHTML = \`
                <div class="bubble \${role === 'user' ? 'bg-sky-600 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-slate-100 rounded-2xl rounded-tl-none shadow-sm'} p-4">
                    <div class="flex justify-between items-start gap-4">
                        <span class="font-bold">\${content}</span>
                        \${role === 'ai' ? '<button onclick="speak(\\''+content.replace(/'/g, "\\\\'")+'\\')" class="text-sky-400 hover:text-sky-600"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 5L6 9H2v6h4l5 4V5z"></path></svg></button>' : ''}
                    </div>
                    \${trans ? '<div class="text-[11px] mt-2 pt-2 border-t border-black/10 opacity-70 italic font-medium">' + trans + '</div>' : ''}
                    \${correction ? '<div class="text-[9px] mt-2 text-sky-200 font-black uppercase">Correct: ' + correction.replace(/[\\[\\]]/g,'') + '</div>' : ''}
                </div>
            \`;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }

        function startChat() {
            document.getElementById('start-screen').style.display = 'none';
            const welcome = "Dạ em chào Anh/Chị! Em là Lan. Rất vui được làm quen với mình ạ! | Hello! I'm Lan. Nice to meet you!";
            addMessage('ai', welcome);
            speak(welcome);
        }

        function send() {
            const input = document.getElementById('input');
            const val = input.value.trim();
            if(!val || isThinking) return;

            addMessage('user', val);
            history.push({role: 'user', text: val});
            input.value = '';
            isThinking = true;
            document.getElementById('typing').classList.remove('hidden');
            document.getElementById('status-text').innerText = 'LAN IS TYPING...';

            window.parent.postMessage({ type: 'SEND_TO_GEMINI', history: history }, '*');
        }

        window.addEventListener('message', (event) => {
            if (event.data.type === 'GEMINI_RESPONSE') {
                isThinking = false;
                document.getElementById('typing').classList.add('hidden');
                document.getElementById('status-text').innerText = 'ONLINE';
                const text = event.data.text;
                addMessage('ai', text);
                history.push({role: 'ai', text: text});
                speak(text);
            }
        });

        document.getElementById('input').addEventListener('keypress', (e) => { if(e.key === 'Enter') send(); });
    </script>
</body>
</html>
  `;

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col">
       <div className="flex justify-between items-center p-2 px-4 bg-slate-800">
          <button onClick={() => window.location.reload()} className="text-[10px] font-black text-slate-400 hover:text-white transition-all tracking-widest">← EXIT TO MENU</button>
          <div className="flex gap-2 text-[10px] font-black text-sky-500 italic">
             <span>GEMINI 1.5 FLASH</span>
             <span className="text-slate-600">|</span>
             <span>GOOGLE TTS ACTIVE</span>
          </div>
       </div>
       <iframe
        ref={iframeRef}
        className="w-full flex-1 border-none bg-white"
        srcDoc={gameHTML}
        title="AI Friend Lan"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default AIfriendLan;
