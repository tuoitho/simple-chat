import React, { useState } from "react";

function App() {
  const [message, setMessage] = useState(""); // state để lưu tin nhắn
  const [chatHistory, setChatHistory] = useState([]); // state để lưu lịch sử chat

  // Hàm xử lý gửi tin nhắn, gui api https://chatbot-production-6af2.up.railway.app/

  const handleSubmit = (e) => {
    e.preventDefault(); // Ngừng reload trang khi submit
    // if (message) {
    //   setChatHistory([...chatHistory, message]); // Thêm tin nhắn mới vào lịch sử
    //   setMessage(""); // Xóa nội dung ô chat sau khi gửi
    // }
    if (message) {
      setChatHistory([...chatHistory, message]); // Thêm tin nhắn mới vào lịch sử
      setMessage(""); // Xóa nội dung ô chat sau khi gửi
      fetch("https://chatbot-production-6af2.up.railway.app/generate?prompt="+message, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setChatHistory([...chatHistory, data.message]);
        });
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Chat Simple</h1>
      <div
        style={{
          width: "100%",
          height: "300px",
          border: "1px solid #ccc",
          padding: "10px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ padding: "5px 0" }}>
            <strong>Message (chưa có ngữ cảnh){index + 1}:</strong> {msg}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex" }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message "
          style={{
            width: "80%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            width: "20%",
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#4CAF50",
            color: "white",
            cursor: "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
