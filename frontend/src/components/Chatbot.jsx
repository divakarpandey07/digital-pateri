import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useStore } from '../store/useStore';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Namaskar! Main Digital Pateri AI Sahayak hoon. Main aapki kya madad kar sakta hoon? (Ask me about history, emergency contacts, blood donors, or announcements)' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const { queryChatbot } = useStore();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText;
    setInputText('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const data = await queryChatbot(userText);
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply, source: data.systemSource }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Kripya thodi der baad prayas karein. API temporary offline hai.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button onClick={() => setIsOpen(!isOpen)} className="chatbot-toggle-btn">
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Floating Chat Drawer */}
      <div className={`chatbot-drawer ${isOpen ? 'open' : ''}`}>
        
        {/* Header */}
        <div className="chatbot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={20} />
            <div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'white' }}>Pateri Gramin AI</h4>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)' }}>Active Assistant</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="chatbot-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-msg ${msg.sender}`}>
              <p style={{ margin: 0 }}>{msg.text}</p>
              {msg.source && (
                <span style={{ fontSize: '0.65rem', display: 'block', textAlign: 'right', marginTop: '4px', opacity: 0.6 }}>
                  Source: {msg.source}
                </span>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="chat-msg bot" style={{ display: 'flex', gap: '4px', padding: '10px 15px' }}>
              <span style={{ animation: 'bounce 1s infinite alternate', animationDelay: '0.1s' }}>●</span>
              <span style={{ animation: 'bounce 1s infinite alternate', animationDelay: '0.3s' }}>●</span>
              <span style={{ animation: 'bounce 1s infinite alternate', animationDelay: '0.5s' }}>●</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls */}
        <form onSubmit={handleSend} className="chatbot-input-area">
          <input
            type="text"
            placeholder="Type your question..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '18px', fontSize: '0.85rem' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
            <Send size={16} />
          </button>
        </form>

      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}

export default Chatbot;
