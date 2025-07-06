import { useRef, useState, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const UI = ({ hidden, isMobile, ...props }) => {
  const input = useRef();
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && !message && text.trim()) {
      // 添加用户消息到历史记录
      setChatHistory(prev => [...prev, { type: 'user', text: text.trim() }]);
      chat(text);
      input.current.value = "";
    }
  };

  // 监听AI回复消息
  useEffect(() => {
    if (message && message.text) {
      setChatHistory(prev => {
        // 检查是否已经添加过这条消息
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.type === 'ai' && lastMessage.text === message.text) {
          return prev;
        }
        return [...prev, { type: 'ai', text: message.text }];
      });
    }
  }, [message]);
  if (hidden) {
    return null;
  }

  return (
    <>
      <div className={`fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between ${isMobile ? 'p-1' : 'p-2 sm:p-4'} flex-col pointer-events-none`}>
        <div className={`w-full flex flex-col items-end justify-center ${isMobile ? 'gap-1' : 'gap-2 sm:gap-4'}`}>
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className={`pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white ${isMobile ? 'p-2' : 'p-3 sm:p-4'} rounded-md touch-manipulation`}
          >
            {cameraZoomed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => {
              const body = document.querySelector("body");
              if (body.classList.contains("greenScreen")) {
                body.classList.remove("greenScreen");
              } else {
                body.classList.add("greenScreen");
              }
            }}
            className={`pointer-events-auto bg-pink-500 hover:bg-pink-600 text-white ${isMobile ? 'p-2' : 'p-3 sm:p-4'} rounded-md touch-manipulation`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </button>
        </div>
        <div className={`w-full max-w-screen-sm mx-auto ${isMobile ? 'px-1' : 'px-2 sm:px-0'}`}>
          {/* 对话历史记录 - 紧贴输入框上方 */}
          {chatHistory.length > 0 && (
            <div className={`${isMobile ? 'mb-2' : 'mb-3'} pointer-events-auto`}>
              <div className={`backdrop-blur-md bg-white bg-opacity-20 rounded-lg ${isMobile ? 'p-2' : 'p-3 sm:p-4'} space-y-2 sm:space-y-3 ${isMobile ? 'max-h-40' : 'max-h-60 sm:max-h-80'} overflow-y-auto`}>
                {chatHistory.slice(-6).map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${isMobile ? 'max-w-xs' : 'max-w-xs sm:max-w-sm lg:max-w-md'} px-3 py-2 rounded-lg ${isMobile ? 'text-xs' : 'text-sm sm:text-base'} ${
                      msg.type === 'user' 
                        ? 'bg-pink-500 bg-opacity-80 text-white ml-4' 
                        : 'bg-white bg-opacity-60 text-gray-800 mr-4'
                    }`}>
                      <div className="break-words">{msg.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* 输入框区域 */}
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} pointer-events-auto`}>
            <input
              className={`w-full placeholder:text-gray-800 placeholder:italic ${isMobile ? 'p-2' : 'p-3 sm:p-4'} rounded-md bg-opacity-50 bg-white backdrop-blur-md ${isMobile ? 'text-sm' : 'text-sm sm:text-base'} touch-manipulation`}
              placeholder={isMobile ? "输入消息..." : "Type a message..."}
              ref={input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              // 移动端优化
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
            <button
              disabled={loading || message}
              onClick={sendMessage}
              className={`bg-pink-500 hover:bg-pink-600 text-white ${isMobile ? 'p-2 px-3' : 'p-3 sm:p-4 px-6 sm:px-10'} font-semibold uppercase rounded-md ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} touch-manipulation ${
                loading || message ? "cursor-not-allowed opacity-30" : ""
              }`}
            >
              {isMobile ? "发送" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
