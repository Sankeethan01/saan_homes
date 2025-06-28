'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiCloseLine, RiSendPlaneFill, RiCustomerService2Fill } from 'react-icons/ri';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatBotRentalsPortfolio() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPopUp, setShowPopUp] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your equipment rental assistant. How can I help you today?"  ,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Periodic pop-up animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setShowPopUp(true);
        setTimeout(() => setShowPopUp(false), 3000); // Show for 3 seconds
      }
    }, 3000); // Pop up every 3 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: "Thank you for your message. Our team will assist you shortly with your equipment rental inquiry.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  return (
    <>
      {/* Chat Bot Button with Pop-up Animation */}
      <div className="fixed bottom-5 right-8 z-70">
        {/* Pop-up Message */}
        <AnimatePresence>
          {showPopUp && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="absolute bottom-16 right-0 bg-white border-[#1b4965] rounded-lg shadow-lg p-3 mb-2 w-31"
            >
              <div className="text-sm text-gray-800 font-medium">
                Can I help you?
              </div>
              {/* Arrow pointing down */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Bot Button */}
        <motion.button
          initial={{ scale: 0 }}
          animate={{ 
            scale: showPopUp ? 1.2 : 1,
            rotate: showPopUp ? [0, -10, 10, -10, 0] : 0
          }}
          transition={{ 
            scale: { duration: 0.3 },
            rotate: { duration: 0.5, repeat: showPopUp ? 2 : 0 }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            setIsOpen(true);
            setShowPopUp(false); // Hide pop-up when chat opens
          }}
          className="w-12 h-12 
                     bg-[#1b4965] 
                     rounded-full 
                     flex items-center justify-center 
                     shadow-lg hover:shadow-xl
                     transition-all duration-300"
        >
          <RiCustomerService2Fill className="text-white text-2xl" />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-25 right-8 !z-70 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1b4965] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RiCustomerService2Fill className="text-white text-2xl" />
                <h3 className="text-white font-semibold">Equipment Assistant</h3>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/10 p-2 rounded-full"
              >
                <RiCloseLine className="text-xl" />
              </motion.button>
            </div>

            {/* Messages Container */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isBot
                        ? 'bg-gray-100 text-[#1b4965]'
                        : 'bg-[#1b4965] text-white'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs mt-1 opacity-60">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b4965]"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="bg-[#1b4965] text-white p-2 rounded-lg hover:bg-[#1b4965]-200 transition-colors"
                >
                  <RiSendPlaneFill className="text-xl" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 