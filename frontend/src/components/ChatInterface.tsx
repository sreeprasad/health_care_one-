import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'ai';
}

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, sender: 'user' | 'ai') => void;
  onConvertToSuggestions: (response: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onConvertToSuggestions,
  isLoading,
  setIsLoading
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    const message = inputMessage.trim();
    if (!message || isLoading) return;

    // Add user message
    onSendMessage(message, 'user');
    setInputMessage('');

    setIsLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:6549'}/api/chat`, {
        message: message,
        healthContext: {
          demo: true,
          note: "This is a demo with sample health data: 30-year-old male, 175cm, 70kg, 8500 steps/day, moderately active"
        }
      });

      if (response.data.success) {
        // Convert AI response to suggestions instead of showing in chat
        onConvertToSuggestions(response.data.response);
        // No chat message needed - suggestions are updated directly
      } else {
        onSendMessage('Sorry, I encountered an error: ' + response.data.error, 'ai');
      }
    } catch (error) {
      console.error('Error:', error);
      onSendMessage('Sorry, I cannot connect to the server right now.', 'ai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-section">
      <h3>Bono</h3>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender}-message`}>
            <div className="message-content">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask me anything about your health..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={isLoading || !inputMessage.trim()}
        >
          P
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
