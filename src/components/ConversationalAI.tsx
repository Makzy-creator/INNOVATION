import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChatBubbleLeftRightIcon, 
  XMarkIcon, 
  MicrophoneIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  audioUrl?: string
}

const ConversationalAI: React.FC = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isVideoMode, setIsVideoMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPlaying, setAvatarPlaying] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
    }

    synthRef.current = window.speechSynthesis

    // Add initial welcome message
    if (messages.length === 0) {
      addAIMessage("Hello! I'm your AI assistant for blood donation. I can help you learn about donating blood, using our platform, and answer any questions you have. How can I assist you today?")
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addAIMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'ai',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing with contextual responses about blood donation
    await new Promise(resolve => setTimeout(resolve, 1000))

    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('donate') || lowerMessage.includes('donation')) {
      return "Blood donation is a simple, safe process that typically takes 45-60 minutes. You'll need to be 18+ years old, weigh at least 50kg, and be in good health. Our platform connects you with nearby blood banks and tracks your donation history on the blockchain for transparency."
    }
    
    if (lowerMessage.includes('eligible') || lowerMessage.includes('requirements')) {
      return "To be eligible for blood donation, you must: 1) Be 18-65 years old, 2) Weigh at least 50kg, 3) Be in good health, 4) Not have donated blood in the last 56 days, 5) Pass a brief health screening. Our app has a built-in eligibility checker to help you determine if you can donate."
    }
    
    if (lowerMessage.includes('blockchain') || lowerMessage.includes('technology')) {
      return "We use Internet Computer blockchain technology to create immutable records of all blood donations. This ensures transparency, prevents fraud, and allows donors and recipients to track the entire donation process. Your donation data is secure and verifiable."
    }
    
    if (lowerMessage.includes('how to use') || lowerMessage.includes('app') || lowerMessage.includes('platform')) {
      return "Getting started is easy! 1) Register as a donor or recipient, 2) Complete your profile with blood type and location, 3) Connect your wallet for blockchain features, 4) Browse blood requests or create your own, 5) Schedule donations at nearby facilities. Would you like me to walk you through any specific feature?"
    }
    
    if (lowerMessage.includes('blood type') || lowerMessage.includes('compatibility')) {
      return "Blood type compatibility is crucial for safe transfusions. O- is the universal donor, AB+ is the universal recipient. Our platform automatically matches compatible donors with recipients based on blood type, location, and urgency. You can see compatibility charts in your profile section."
    }
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      return "For emergency blood requests, our platform has a priority alert system. Critical requests are highlighted in red and sent as push notifications to compatible donors nearby. If you're facing a medical emergency, please contact emergency services immediately while also creating an urgent request on our platform."
    }
    
    if (lowerMessage.includes('safety') || lowerMessage.includes('safe')) {
      return "Blood donation is very safe when done at certified facilities. All equipment is sterile and single-use. Our platform only partners with licensed blood banks and hospitals. Side effects are rare and usually mild (slight dizziness or fatigue). We provide safety guidelines and post-donation care instructions."
    }
    
    return "I'm here to help you with blood donation questions and platform guidance. You can ask me about donation requirements, how to use our app, blood type compatibility, blockchain features, or anything else related to blood donation. What would you like to know more about?"
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    addUserMessage(userMessage)
    setInputMessage('')
    setIsLoading(true)

    try {
      const aiResponse = await getAIResponse(userMessage)
      addAIMessage(aiResponse)
      
      // Text-to-speech for AI response
      if (synthRef.current && !synthRef.current.speaking) {
        const utterance = new SpeechSynthesisUtterance(aiResponse)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        
        synthRef.current.speak(utterance)
      }
    } catch (error) {
      addAIMessage("I apologize, but I'm having trouble processing your request right now. Please try again or contact our support team for assistance.")
    } finally {
      setIsLoading(false)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  const toggleVideoMode = () => {
    setIsVideoMode(!isVideoMode)
    if (!isVideoMode) {
      // Simulate avatar initialization
      setAvatarPlaying(true)
    }
  }

  const quickQuestions = [
    "How do I donate blood?",
    "Am I eligible to donate?",
    "How does the blockchain work?",
    "What's my blood type compatibility?",
    "How to use this app?",
    "Is blood donation safe?"
  ]

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        } bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-xl`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      </motion.button>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-t-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Blood Donation Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleVideoMode}
                  className={`p-2 rounded-full transition-colors ${
                    isVideoMode ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  title="Toggle Video Mode"
                >
                  <VideoCameraIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Video Avatar (when enabled) */}
            {isVideoMode && (
              <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <ChatBubbleLeftRightIcon className="h-10 w-10" />
                  </div>
                  <p className="text-sm">AI Avatar Ready</p>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                    <button
                      onClick={() => setAvatarPlaying(!avatarPlaying)}
                      className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      {avatarPlaying ? (
                        <PauseIcon className="h-4 w-4" />
                      ) : (
                        <PlayIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(question)
                        handleSendMessage()
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about blood donation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                
                <button
                  onClick={startListening}
                  disabled={isListening}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                  title="Voice Input"
                >
                  <MicrophoneIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={isSpeaking ? stopSpeaking : handleSendMessage}
                  disabled={isLoading}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking
                      ? 'bg-red-100 text-red-600'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                  title={isSpeaking ? "Stop Speaking" : "Send Message"}
                >
                  {isSpeaking ? (
                    <SpeakerWaveIcon className="h-4 w-4" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
              
              {isListening && (
                <p className="text-xs text-red-600 mt-1 animate-pulse">Listening...</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ConversationalAI