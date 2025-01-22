import React, { useState, useEffect, useRef } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const decodeEscapeSequences = (str) => {
    return str.replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      setIsLoading(true);

      // Thêm tin nhắn người dùng vào lịch sử
      const newUserMessage = { role: "user", content: message };
      const updatedHistory = [...chatHistory, newUserMessage];
      
      // Thêm tin nhắn trống cho AI
      const initialAiMessage = { role: "assistant", content: "" };
      setChatHistory([...updatedHistory, initialAiMessage]);

      setMessage("");

      // Gửi toàn bộ lịch sử chat để giữ ngữ cảnh
      // fetch(`https://chatbot-production-6af2.up.railway.app/generate`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Accept": "text/event-stream"
      //   },
      //   body: JSON.stringify({
      //     messages: updatedHistory // Gửi toàn bộ lịch sử
      //   })
      // })
      fetch(`https://35.213.168.149/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream"
        },
        body: JSON.stringify({
          messages: updatedHistory // Gửi toàn bộ lịch sử
        })
      })
      .then(response => {
        const reader = response.body.getReader();
        let accumulatedResponse = '';

        const processStream = ({ done, value }) => {
          if (done) {
            setIsLoading(false);
            return;
          }

          const chunk = new TextDecoder().decode(value);
          const parsedChunk = chunk.split('\n')
            .filter(line => line.startsWith('data:'))
            .map(line => {
              let text = line.replace('data:', '');
              text = decodeEscapeSequences(text);
              text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong>$1</strong>');
              text = text.replace(/•/g, '<br />•');
              text = text.replace(/\n/g, '<br />');
              return text;
            }).join('');

          accumulatedResponse += parsedChunk;

          // Cập nhật tin nhắn AI với nội dung mới nhất
          setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1].content = accumulatedResponse;
            return newHistory;
          });

          return reader.read().then(processStream);
        };

        return reader.read().then(processStream);
      })
      .catch(error => {
        console.error('Error:', error);
        setIsLoading(false);
      });
    }
  };

  return (
    <div className="App" style={{ 
      display: "flex", 
      flexDirection: "column", 
      height: "100vh", 
      backgroundColor: "#343541", 
      color: "#fff", 
      padding: "20px", 
      boxSizing: "border-box" 
    }}>
      <h1 style={{ textAlign: "center", color: "#4CAF50", marginBottom: "20px" }}>AI Chat with Context</h1>
      
      <div style={{
        flex: 1,
        overflowY: "scroll",
        padding: "10px",
        backgroundColor: "#444654",
        borderRadius: "8px",
        marginBottom: "10px",
      }}>
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: msg.role === "user" ? "flex-end" : "flex-start", 
            margin: "8px 0"
          }}>
            <div style={{
              maxWidth: "80%",
              padding: "12px 16px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              backgroundColor: msg.role === "user" ? "#4CAF50" : "#444654",
              color: "#fff",
              lineHeight: 1.4,
              fontSize: "16px"
            }}>
              <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                {msg.role === "user" ? "You" : "Assistant"}
              </div>
              <span dangerouslySetInnerHTML={{ __html: msg.content }} />
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", padding: "0 8px" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: "25px",
            border: "1px solid #555",
            backgroundColor: "#444654",
            color: "#fff",
            fontSize: "16px",
            outline: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            borderRadius: "25px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "white",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.2s",
            ":disabled": {
              opacity: 0.7,
              cursor: "not-allowed"
            }
          }}
          disabled={isLoading}
        >
          {isLoading ? "✈️ Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default App;