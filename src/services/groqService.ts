import Groq from 'groq-sdk';

// Initialize Groq client with environment variable API key
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true // Enable browser usage
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  message: string;
  error?: string;
}

// Company information and services
const COMPANY_INFO = {
  name: 'Muahib Solutions',
  description: 'An AI and software company specializing in digital solutions',
  services: [
    'Website development (starting from ₦20,000)',
    'Mobile app development (iOS and Android)',
    'AI integration and automation',
    'Chatbot development',
    'Graphics design',
    'Website upgrades and maintenance'
  ],
  contacts: {
    phone1: '09025794407',
    phone2: '09125242686',
    whatsapp: '09125242686'
  },
  location: {
    address: 'Musa Yar\'Adua Expressway (Airport road)',
    district: 'Lugbe District',
    city: 'Abuja',
    country: 'Nigeria'
  },
  pricing: {
    baseWebsite: 20000,
    currency: 'NGN',
    note: 'Pricing depends on project complexity'
  }
};

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful customer service representative for Muahib Solutions, an AI and software company in Nigeria.

Company Information:
- Name: Muahib Solutions
- Services: Website development, mobile apps (iOS & Android), AI integration, chatbots, AI automation, graphics design
- Base pricing: Websites start from ₦20,000 (pricing varies based on complexity)
- Contact numbers: 09025794407 or 09125242686
- WhatsApp: 09125242686
- Location: Musa Yar'Adua Expressway (Airport road), Lugbe District, Abuja, Nigeria

Detailed Service Information:
1. Website Development (₦20,000+):
   - Business websites
   - E-commerce platforms
   - Portfolio websites
   - Corporate websites
   - Responsive design
   - SEO optimization

2. Mobile App Development:
   - iOS applications
   - Android applications
   - Cross-platform apps
   - App store deployment
   - UI/UX design

3. AI Integration & Automation:
   - Chatbot development
   - AI-powered features
   - Process automation
   - Machine learning solutions
   - API integrations

4. Graphics Design:
   - Logo design
   - Branding materials
   - UI/UX design
   - Marketing graphics
   - Social media assets

Pricing Structure:
- Basic website: ₦20,000 - ₦50,000
- Advanced website with features: ₦50,000 - ₦150,000
- E-commerce platform: ₦80,000 - ₦200,000
- Mobile app: ₦100,000 - ₦300,000
- AI integration: ₦50,000 - ₦200,000
- Graphics design: ₦5,000 - ₦50,000

Guidelines:
1. Be friendly, professional, and helpful
2. Always provide accurate information about services and pricing
3. For complex projects, explain that pricing depends on requirements
4. Encourage customers to call or WhatsApp for detailed discussions
5. If asked about services not offered, politely redirect to available services
6. Keep responses concise but informative
7. Use Nigerian Naira (₦) for pricing
8. Be enthusiastic about technology and digital solutions
9. Provide specific pricing ranges when asked
10. Mention portfolio examples when relevant
11. Format responses in clean HTML structure with proper tags
12. Use <br> for line breaks, <strong> for emphasis, <ul><li> for lists

IMPORTANT:
- Format responses in HTML structure
- Be helpful and informative
- Never include reasoning or thinking process in response

Remember: You represent a professional software company, so maintain a business-appropriate tone while being approachable.`;

export class GroqChatService {
  private conversationHistory: ChatMessage[] = [];
  private readonly STORAGE_KEY = 'muahib_chat_history';

  constructor() {
    // Load existing conversation or initialize with system prompt
    this.loadConversation();
  }

  private loadConversation(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate the data structure
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.conversationHistory = parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load conversation history:', error);
    }

    // Initialize with system prompt if no valid history found
    this.conversationHistory = [{
      role: 'system',
      content: SYSTEM_PROMPT,
      timestamp: new Date()
    }];
  }

  private saveConversation(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.warn('Failed to save conversation history:', error);
    }
  }

  async sendMessage(userMessage: string): Promise<ChatResponse> {
    try {
      // Check if API key is available
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        console.warn('Groq API key not found, using fallback response');
        const fallbackResponse = this.getFallbackResponse(userMessage);

        // Save fallback response to conversation
        const fallbackChatMessage: ChatMessage = {
          role: 'assistant',
          content: fallbackResponse,
          timestamp: new Date()
        };
        this.conversationHistory.push(fallbackChatMessage);
        this.saveConversation();

        return {
          message: fallbackResponse,
          error: 'AI service not configured, showing fallback response'
        };
      }

      // Add user message to history
      const userChatMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      };
      this.conversationHistory.push(userChatMessage);

      // Prepare messages for Groq API (exclude timestamps)
      const messages = this.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call Groq API
      const completion = await groq.chat.completions.create({
        model: 'deepseek-r1-distill-llama-70b',
        messages: messages,
        temperature: 0.6,
        max_tokens: 1024, // Restored for full responses
        top_p: 0.95,
        stream: false,
        reasoning_format: 'hidden' // Hide reasoning/thinking process
      });

      let assistantMessage = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t process your request. Please try again.';

      // Clean the response: remove thinking tags and limit words
      assistantMessage = this.cleanResponse(assistantMessage);

      // Add assistant response to history
      const assistantChatMessage: ChatMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      };
      this.conversationHistory.push(assistantChatMessage);

      // Keep conversation history manageable (last 20 messages + system prompt)
      if (this.conversationHistory.length > 21) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system prompt
          ...this.conversationHistory.slice(-20) // Keep last 20 messages
        ];
      }

      // Save conversation to localStorage
      this.saveConversation();

      return {
        message: assistantMessage
      };

    } catch (error) {
      console.error('Groq API error:', error);

      // Provide fallback responses for common queries
      const fallbackResponse = this.getFallbackResponse(userMessage);

      // Save fallback response to conversation
      const fallbackChatMessage: ChatMessage = {
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      this.conversationHistory.push(fallbackChatMessage);
      this.saveConversation();

      return {
        message: fallbackResponse,
        error: 'AI service temporarily unavailable, showing fallback response'
      };
    }
  }

  private cleanResponse(response: string): string {
    // Remove thinking tags and content
    let cleaned = response.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove any remaining thinking patterns
    cleaned = cleaned.replace(/\*\*thinking\*\*[\s\S]*?\*\*\/thinking\*\*/gi, '');
    cleaned = cleaned.replace(/thinking:[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi, '');

    // Trim whitespace
    cleaned = cleaned.trim();

    // Ensure it's not empty
    if (!cleaned) {
      cleaned = 'I\'m here to help! Contact us at <strong>09025794407</strong> or <strong>09125242686</strong> for assistance.';
    }

    return cleaned;
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
      return `<strong>Our Pricing:</strong><br>
      • Websites: <strong>₦20,000 - ₦200,000</strong><br>
      • Mobile Apps: <strong>₦100,000 - ₦300,000</strong><br>
      • AI Integration: <strong>₦50,000 - ₦200,000</strong><br>
      Call <strong>09025794407</strong> or <strong>09125242686</strong> for detailed quotes!`;
    }

    if (message.includes('service') || message.includes('what do you do')) {
      return `<strong>Muahib Solutions offers:</strong><br>
      • Website development (from ₦20,000)<br>
      • Mobile apps (iOS & Android)<br>
      • AI integration & automation<br>
      • Graphics design<br>
      Contact: <strong>09025794407</strong> or <strong>09125242686</strong>`;
    }

    if (message.includes('contact') || message.includes('phone') || message.includes('call') || message.includes('location') || message.includes('address')) {
      return `<strong>Contact Us:</strong><br>
      📞 <strong>09025794407</strong><br>
      📞 <strong>09125242686</strong><br>
      💬 WhatsApp: <strong>09125242686</strong><br>
      📍 Musa Yar'Adua Expressway, Lugbe District, Abuja<br>
      Available: 9 AM - 6 PM (Mon-Sat)`;
    }

    if (message.includes('mobile app') || message.includes('android') || message.includes('ios')) {
      return `<strong>Mobile App Development:</strong><br>
      • iOS & Android apps<br>
      • Cross-platform solutions<br>
      • Pricing: <strong>₦100,000 - ₦300,000</strong><br>
      Call <strong>09025794407</strong> to discuss your app idea!`;
    }

    if (message.includes('website') || message.includes('web')) {
      return `<strong>Website Development:</strong><br>
      • Business websites: <strong>₦20,000 - ₦50,000</strong><br>
      • E-commerce: <strong>₦80,000 - ₦200,000</strong><br>
      • Mobile-friendly & SEO optimized<br>
      Call <strong>09025794407</strong> for free consultation!`;
    }

    if (message.includes('ai') || message.includes('chatbot') || message.includes('automation')) {
      return `<strong>AI & Automation Services:</strong><br>
      • Custom chatbots<br>
      • Process automation<br>
      • Pricing: <strong>₦50,000 - ₦200,000</strong><br>
      Contact <strong>09025794407</strong> to explore AI solutions!`;
    }

    return `<strong>Welcome to Muahib Solutions!</strong><br>
    We create websites, mobile apps, AI solutions & graphics.<br>
    Starting from <strong>₦20,000</strong><br>
    📞 <strong>09025794407</strong> | <strong>09125242686</strong><br>
    📍 Lugbe District, Abuja<br>
    How can we help you today?`;
  }

  getConversationHistory(): ChatMessage[] {
    return this.conversationHistory.filter(msg => msg.role !== 'system');
  }

  clearConversation(): void {
    this.conversationHistory = [{
      role: 'system',
      content: SYSTEM_PROMPT,
      timestamp: new Date()
    }];
    // Clear from localStorage as well
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Get quick response suggestions
  getQuickResponses(): string[] {
    return [
      "What services do you offer?",
      "How much does a website cost?",
      "Do you develop mobile apps?",
      "Tell me about AI integration",
      "What is your contact information?",
      "Where are you located?",
      "Show me pricing for e-commerce website",
      "Can you build chatbots?"
    ];
  }
}

// Export singleton instance
export const groqChatService = new GroqChatService();
