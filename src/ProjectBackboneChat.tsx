// ProjectBackboneChat.tsx
import React, { useState } from "react";
import axios from "axios";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const API_BASE_URL = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const DEPLOYMENT_NAME = import.meta.env.VITE_DEPLOYMENT_NAME;
const API_KEY = import.meta.env.VITE_AZURE_OPENAI_KEY;
// const API_VERSION = "2024-05-01";
const API_VERSION = "2023-12-01-preview";

const ProjectBackboneChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a supportive and emotionally intelligent fitness and wellness companion named Project Backbone Coach.",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`,
        {
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "api-key": API_KEY,
          },
        }
      );

      const assistantMessage: Message = response.data.choices[0].message;
      setMessages([...newMessages, assistantMessage]);
    } catch (err) {
      console.error("Error fetching response:", err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: 600, margin: "0 auto" }}>
      <h2>Project Backbone</h2>
      <div
        style={{
          maxHeight: 400,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "1rem" }}>
            <strong>
              {msg.role === "user"
                ? "You"
                : msg.role === "assistant"
                ? "Coach"
                : "System"}
              :
            </strong>
            <p>{msg.content}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Say something..."
        style={{ width: "80%", padding: "0.5rem" }}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        style={{ padding: "0.5rem", marginLeft: "0.5rem" }}
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
};

export default ProjectBackboneChat;
