import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaw, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Chatbot.css';

const Chatbot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I help you with your pet boarding questions today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send query to backend RAG system
      const response = await fetch('http://localhost:5001/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
        // Adding a timeout to prevent long waiting times if server is unresponsive
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }
      
      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      
      // Add fallback response if there's an error
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'I\'m having trouble connecting to my knowledge base right now. Please try again later or contact our staff directly for assistance.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <FontAwesomeIcon icon={faPaw} className="me-2" />
        <h4>Baguio Pet Boarding Assistant</h4>
        <Button variant="link" className="close-btn" onClick={onClose}>
          &times;
        </Button>
      </div>
      
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-content">
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <div className="message-content">
              <FontAwesomeIcon icon={faSpinner} spin />
              <span className="ms-2">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <Form onSubmit={handleSendMessage} className="chatbot-input">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Ask about our pet services..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default Chatbot;