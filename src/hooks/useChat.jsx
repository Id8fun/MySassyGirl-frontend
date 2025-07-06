import { createContext, useContext, useState, useEffect } from "react";

const backendUrl = import.meta.env.VITE_API_URL || "https://mysassygirl-backend-production.up.railway.app";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      const data = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!data.ok) {
        let errorMessage = `服务器错误 (${data.status})`;
        if (data.status === 500) {
          errorMessage = "服务器内部错误，请稍后再试";
        } else if (data.status === 401) {
          errorMessage = "服务认证失败，请检查配置";
        } else if (data.status === 429) {
          errorMessage = "请求过于频繁，请稍后再试";
        }
        throw new Error(errorMessage);
      }
      
      const response = await data.json();
      
      // 验证响应格式
      if (!response || typeof response !== 'object') {
        throw new Error('服务器返回格式错误');
      }
      
      const resp = Array.isArray(response.messages) ? response.messages : [];
      
      // 验证消息格式
      const validMessages = resp.filter(msg => {
        return msg && typeof msg === 'object' && typeof msg.text === 'string';
      }).map(msg => ({
        text: msg.text || "消息内容为空",
        audio: msg.audio || null,
        lipsync: msg.lipsync || null,
        facialExpression: msg.facialExpression || "default",
        animation: msg.animation || "Idle"
      }));
      
      if (validMessages.length === 0) {
        throw new Error('服务器未返回有效消息');
      }
      
      setMessages((messages) => [...messages, ...validMessages]);
    } catch (error) {
      console.error('Chat API error:', error);
      
      let errorText = "抱歉，服务器暂时无法响应，请稍后再试。";
      
      if (error.name === 'AbortError') {
        errorText = "请求超时，请检查网络连接后重试。";
      } else if (error.message.includes('Failed to fetch')) {
        errorText = "网络连接失败，请检查网络后重试。";
      } else if (error.message) {
        errorText = error.message;
      }
      
      // 添加错误消息到聊天中
      setMessages((messages) => [...messages, {
        text: errorText,
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
