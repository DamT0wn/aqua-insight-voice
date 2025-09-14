import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Send, Globe, BarChart3, Droplets, TrendingUp } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DataVisualization } from './DataVisualization';
import { LocationComparison } from './LocationComparison';

// Simple type declaration for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  data?: any;
  showChart?: boolean;
  showComparison?: boolean;
  suggestions?: string[];
}

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

interface GroundwaterChatProps {
  language: 'en' | 'hi';
  onLanguageChange: (lang: 'en' | 'hi') => void;
}

const translations = {
  en: {
    title: "Groundwater Insights",
    subtitle: "AI-powered groundwater quality analysis",
    placeholder: "Ask about groundwater quality in your area...",
    voiceTooltip: "Click to speak",
    send: "Send",
    listening: "Listening...",
    processing: "Processing...",
    micNotSupported: "Voice input not supported on this browser",
    micPermissionNeeded: "Please allow microphone access",
    sampleQueries: [
      "Show groundwater quality in Delhi",
      "Compare water levels between Mumbai and Pune",
      "Predict water levels for next 5 years in Bangalore"
    ]
  },
  hi: {
    title: "भूजल अंतर्दृष्टि",
    subtitle: "AI-संचालित भूजल गुणवत्ता विश्लेषण",
    placeholder: "अपने क्षेत्र में भूजल गुणवत्ता के बारे में पूछें...",
    voiceTooltip: "बोलने के लिए क्लिक करें",
    send: "भेजें",
    listening: "सुन रहा है...",
    processing: "प्रसंस्करण...",
    micNotSupported: "इस ब्राउज़र पर वॉइस इनपुट समर्थित नहीं है",
    micPermissionNeeded: "कृपया माइक्रोफोन की अनुमति दें",
    sampleQueries: [
      "दिल्ली में भूजल गुणवत्ता दिखाएं",
      "मुंबई और पुणे के बीच पानी के स्तर की तुलना करें",
      "बैंगलोर में अगले 5 साल के लिए पानी के स्तर की भविष्यवाणी करें"
    ]
  }
};

export const GroundwaterChat: React.FC<GroundwaterChatProps> = ({ language, onLanguageChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  // Initialize speech recognition
  useEffect(() => {
    console.log('Initializing speech recognition...');
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        console.log('Speech recognition result:', event.results);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error message
        let errorMessage = '';
        switch (event.error) {
          case 'not-allowed':
            errorMessage = language === 'hi' 
              ? 'माइक्रोफोन की अनुमति दें' 
              : 'Please allow microphone access';
            break;
          case 'no-speech':
            errorMessage = language === 'hi' 
              ? 'कोई आवाज नहीं सुनी गई' 
              : 'No speech detected';
            break;
          default:
            errorMessage = language === 'hi' 
              ? 'वॉइस रिकॉग्निशन में समस्या' 
              : 'Voice recognition error';
        }
        
        // Add error message to chat
        const errorMsg: Message = {
          id: Date.now().toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMsg]);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      console.log('Speech recognition initialized successfully');
    } else {
      console.error('Speech recognition not supported');
    }
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Request location permission on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(location);
        setLocationPermission('granted');
        
        // Add welcome message with location
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          text: language === 'hi' 
            ? `आपका स्थान मिल गया! अब मैं आपके क्षेत्र के लिए भूजल की जानकारी प्रदान कर सकता हूं।`
            : `Location found! I can now provide groundwater information for your area.`,
          isUser: false,
          timestamp: new Date(),
          suggestions: [
            language === 'hi' ? 'मेरे क्षेत्र में पानी की गुणवत्ता कैसी है?' : 'How is water quality in my area?',
            language === 'hi' ? 'पानी का स्तर दिखाएं' : 'Show water levels',
            language === 'hi' ? '5 साल की भविष्यवाणी' : '5-year prediction'
          ]
        };
        setMessages([welcomeMessage]);
      },
      (error) => {
        setLocationPermission('denied');
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: language === 'hi'
            ? 'स्थान की अनुमति नहीं मिली। आप अभी भी किसी भी स्थान के बारे में पूछ सकते हैं।'
            : 'Location permission denied. You can still ask about any location.',
          isUser: false,
          timestamp: new Date(),
          suggestions: [
            language === 'hi' ? 'दिल्ली में पानी की गुणवत्ता' : 'Water quality in Delhi',
            language === 'hi' ? 'मुंबई और पुणे की तुलना' : 'Compare Mumbai and Pune',
            language === 'hi' ? 'बैंगलोर का डेटा' : 'Bangalore data'
          ]
        };
        setMessages([errorMessage]);
      }
    );
  };

  const startListening = () => {
    console.log('Start listening clicked');
    
    if (!recognitionRef.current) {
      console.error('Speech recognition not initialized');
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: language === 'hi' 
          ? 'वॉइस रिकॉग्निशन उपलब्ध नहीं है' 
          : 'Voice recognition not available',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Check if we're on HTTPS (required for speech recognition)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.error('HTTPS required for speech recognition');
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: language === 'hi' 
          ? 'HTTPS कनेक्शन की आवश्यकता' 
          : 'HTTPS connection required for voice',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    try {
      console.log('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      const errorMsg: Message = {
        id: Date.now().toString(),
        text: language === 'hi' 
          ? 'वॉइस रिकॉग्निशन शुरू नहीं हो सका' 
          : 'Could not start voice recognition',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const generateResponse = async (userMessage: string): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('quality') || lowerMessage.includes('गुणवत्ता')) {
      return {
        id: Date.now().toString(),
        text: language === 'hi' 
          ? `${userLocation ? 'आपके क्षेत्र' : 'इस क्षेत्र'} के लिए भूजल गुणवत्ता डेटा। डेटा से पता चलता है कि पानी की गुणवत्ता अच्छी है।`
          : `Groundwater quality data for ${userLocation ? 'your area' : 'this area'}. The data shows good water quality with acceptable TDS levels.`,
        isUser: false,
        timestamp: new Date(),
        showChart: true,
        suggestions: [
          language === 'hi' ? 'पानी का स्तर ट्रेंड दिखाएं' : 'Show water level trends',
          language === 'hi' ? 'अन्य शहरों से तुलना करें' : 'Compare with other cities',
          language === 'hi' ? 'भविष्य की भविष्यवाणी' : 'Future predictions'
        ]
      };
    }
    
    if (lowerMessage.includes('compare') || lowerMessage.includes('तुलना')) {
      return {
        id: Date.now().toString(),
        text: language === 'hi'
          ? 'यहाँ दो स्थानों के बीच भूजल की तुलना है।'
          : 'Here\'s a comparison of groundwater data between the two locations.',
        isUser: false,
        timestamp: new Date(),
        showComparison: true,
        suggestions: [
          language === 'hi' ? 'और शहर जोड़ें' : 'Add more cities',
          language === 'hi' ? 'विस्तृत रिपोर्ट' : 'Detailed report',
          language === 'hi' ? 'डाउनलोड डेटा' : 'Download data'
        ]
      };
    }
    
    if (lowerMessage.includes('predict') || lowerMessage.includes('भविष्यवाणी')) {
      return {
        id: Date.now().toString(),
        text: language === 'hi'
          ? 'अगले 5 साल के लिए भूजल स्तर की भविष्यवाणी दिखाई गई है।'
          : 'Here\'s the 5-year prediction for groundwater levels in your area.',
        isUser: false,
        timestamp: new Date(),
        showChart: true,
        data: { isPrediction: true },
        suggestions: [
          language === 'hi' ? 'जोखिम विश्लेषण' : 'Risk analysis',
          language === 'hi' ? 'सुझाव दें' : 'Get recommendations',
          language === 'hi' ? 'अलार्ट सेट करें' : 'Set alerts'
        ]
      };
    }
    
    if (lowerMessage.includes('level') || lowerMessage.includes('स्तर')) {
      return {
        id: Date.now().toString(),
        text: language === 'hi'
          ? `${userLocation ? 'आपके क्षेत्र' : 'इस क्षेत्र'} में वर्तमान भूजल स्तर सामान्य है।`
          : `Current groundwater level in ${userLocation ? 'your area' : 'this area'} is normal.`,
        isUser: false,
        timestamp: new Date(),
        showChart: true,
        suggestions: [
          language === 'hi' ? 'ऐतिहासिक डेटा' : 'Historical data',
          language === 'hi' ? 'मासिक ट्रेंड' : 'Monthly trends',
          language === 'hi' ? 'अन्य स्थान देखें' : 'Check other locations'
        ]
      };
    }
    
    return {
      id: Date.now().toString(),
      text: language === 'hi'
        ? 'मैं आपकी मदद करने के लिए यहाँ हूँ। कृपया भूजल गुणवत्ता, तुलना या भविष्यवाणी के बारे में पूछें।'
        : 'I\'m here to help you with groundwater information. Please ask about water quality, comparisons, or predictions.',
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        language === 'hi' ? 'पानी की गुणवत्ता जांचें' : 'Check water quality',
        language === 'hi' ? 'शहरों की तुलना' : 'Compare cities',
        language === 'hi' ? 'भविष्य की रिपोर्ट' : 'Future reports'
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    const response = await generateResponse(inputValue);
    setMessages(prev => [...prev, response]);
    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSampleQuery = (query: string) => {
    setInputValue(query);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full gradient-water">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
              <p className="text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
            className="gap-2"
          >
            <Globe className="h-4 w-4" />
            {language === 'en' ? 'हिंदी' : 'English'}
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4 pb-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <Card className="p-6 bg-card border border-border">
                <div className="text-center space-y-4">
                  <div className="animate-float">
                    <div className="p-4 rounded-full gradient-water mx-auto w-fit">
                      <TrendingUp className="h-8 w-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {language === 'hi' ? 'स्वागत है!' : 'Welcome!'}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'hi' 
                      ? 'भूजल की जानकारी के लिए पूछें या नीचे दिए गए उदाहरणों को आज़माएं।'
                      : 'Ask about groundwater information or try the sample queries below.'
                    }
                  </p>
                  
                  {/* Sample Queries */}
                  <div className="grid gap-2 mt-4">
                    {t.sampleQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="text-left justify-start h-auto p-3 transition-smooth hover:gradient-water hover:text-primary-foreground"
                        onClick={() => handleSampleQuery(query)}
                      >
                        <BarChart3 className="h-4 w-4 mr-2 flex-shrink-0" />
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4 transition-smooth",
                    message.isUser
                      ? "gradient-water text-primary-foreground"
                      : "bg-card border border-border"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  
                  {message.showChart && (
                    <div className="mt-4">
                      <DataVisualization isPrediction={message.data?.isPrediction} />
                    </div>
                  )}
                  
                  {message.showComparison && (
                    <div className="mt-4">
                      <LocationComparison />
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {message.suggestions && !message.isUser && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        {language === 'hi' ? 'सुझाव:' : 'Suggestions:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-8 px-3 hover:gradient-water hover:text-primary-foreground transition-smooth"
                            onClick={() => handleSampleQuery(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    <span className="text-sm text-muted-foreground">{t.processing}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="pr-12 transition-smooth focus:ring-2 focus:ring-primary"
                disabled={isListening || isProcessing}
              />
              
              {isListening && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-ripple rounded-full bg-primary w-6 h-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              onClick={startListening}
              disabled={!recognitionRef.current || isListening || isProcessing}
              variant="outline"
              size="icon"
              className={cn(
                "transition-bounce relative",
                isListening && "animate-ripple gradient-water text-primary-foreground"
              )}
              title={t.voiceTooltip}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
              {!recognitionRef.current && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></div>
              )}
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="gradient-water hover:opacity-90 transition-smooth"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isListening && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {t.listening}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};