import { createContext, useContext, useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "https://mysassygirl-backend-production.up.railway.app";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    try {
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      
      if (!data.ok) {
        throw new Error(`HTTP error! status: ${data.status}`);
      }
      
      const response = await data.json();
      const resp = response.messages || [];
      setMessages((messages) => [...messages, ...resp]);
    } catch (error) {
      console.error('Chat API error:', error);
      // 添加错误消息到聊天中
      setMessages((messages) => [...messages, {
        text: "抱歉，服务器暂时无法响应，请稍后再试。",
        audio: null,
        lipsync: null,
        facialExpression: "sad",
        animation: "Idle"
      }]);
    } finally {
      setLoading(false);
    }
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
