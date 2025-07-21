import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { groqChatService, ChatMessage } from '@/services/groqService';

interface ChatBotProps {
  className?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `<strong>👋 Welcome to Muahib Solutions!</strong><br><br>
        We offer websites, mobile apps, AI solutions & graphics.<br>
        Starting from <strong>₦20,000</strong><br>
        📍 Located in Lugbe District, Abuja<br><br>
        How can I help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const startCountdown = () => {
    setIsDisabled(true);
    setCountdown(15);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsDisabled(false);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isDisabled) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await groqChatService.sendMessage(userMessage.content);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Start countdown after response is received
      startCountdown();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble responding right now. Please call us at 09025794407 or 09125242686 for immediate assistance.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      // Start countdown even on error
      startCountdown();
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isDisabled) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleQuickResponse = (response: string) => {
    setInputMessage(response);
    inputRef.current?.focus();
  };

  const formatMessage = (content: string) => {
    // Check if content contains HTML tags
    if (content.includes('<') && content.includes('>')) {
      // Render HTML content safely
      return (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
          className="prose prose-sm max-w-none"
        />
      );
    }

    // Fallback to simple text formatting for non-HTML content
    return content
      .split('\n')
      .map((line, index) => (
        <div key={index} className={index > 0 ? 'mt-2' : ''}>
          {line.startsWith('•') ? (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 mt-1">•</span>
              <span>{line.substring(1).trim()}</span>
            </div>
          ) : line.startsWith('📞') || line.startsWith('💬') ? (
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              {line}
            </div>
          ) : (
            line
          )}
        </div>
      ));
  };

  const quickResponses = groqChatService.getQuickResponses();

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 group"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 md:w-96 h-[500px] shadow-2xl border-0 bg-white">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-black to-gray-800 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Muahib Solutions</h3>
                  <p className="text-xs text-gray-300">AI Assistant</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="p-0 flex flex-col h-[400px]">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-black text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <div className="text-sm">
                        {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                      </div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg rounded-bl-sm max-w-[80%]">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">Typing...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Quick Responses */}
            {messages.length === 1 && (
              <div className="p-3 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickResponses.slice(0, 3).map((response, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-50 hover:border-gray-300 text-xs py-1 px-2"
                      onClick={() => handleQuickResponse(response)}
                    >
                      {response}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isDisabled ? `Wait ${countdown}s...` : "Type your message..."}
                  disabled={isLoading || isDisabled}
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || isDisabled}
                  size="icon"
                  className="bg-black hover:bg-gray-800 disabled:bg-gray-400"
                  title={isDisabled ? `Wait ${countdown} seconds` : ''}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isDisabled ? (
                    <span className="text-xs font-bold">{countdown}</span>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Contact Info */}
              <div className="mt-2 text-xs text-gray-500 text-center space-y-1">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>09025794407</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>09125242686</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Musa Yar'Adua Expressway, Lugbe District, Abuja
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatBot;
