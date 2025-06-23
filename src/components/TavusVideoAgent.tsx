import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VideoCameraIcon,
  XMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import TavusService from '../services/tavusService';
import { TavusSession, TavusMessage, TavusError } from '../types/tavus';
import { drVitaPersona } from '../data/drVitaPersona';

interface TavusVideoAgentProps {
  isOpen: boolean;
  onClose: () => void;
  triggerHook?: string;
}

const TavusVideoAgent: React.FC<TavusVideoAgentProps> = ({ isOpen, onClose, triggerHook }) => {
  const { user } = useAuth();
  const [tavusService, setTavusService] = useState<TavusService | null>(null);
  const [session, setSession] = useState<TavusSession | null>(null);
  const [messages, setMessages] = useState<TavusMessage[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentHook, setCurrentHook] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Tavus service
  useEffect(() => {
    if (isOpen && !tavusService) {
      const service = new TavusService({
        apiKey: import.meta.env.VITE_TAVUS_API_KEY || 'demo-key',
        replicaId: import.meta.env.VITE_TAVUS_REPLICA_ID || 'dr-vita-replica'
      });

      // Set up event handlers
      service.onMessage((message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      service.onError((error) => {
        setError(error.message);
        console.error('Tavus error:', error);
      });

      service.onStatusChange((status) => {
        if (session) {
          setSession(prev => prev ? { ...prev, status } : null);
        }
      });

      setTavusService(service);
    }
  }, [isOpen, tavusService, session]);

  // Initialize session when component opens
  useEffect(() => {
    if (isOpen && tavusService && user && !session) {
      initializeSession();
    }
  }, [isOpen, tavusService, user, session]);

  // Trigger specific hook if provided
  useEffect(() => {
    if (triggerHook && tavusService && session?.status === 'connected') {
      handleTriggerHook(triggerHook);
    }
  }, [triggerHook, tavusService, session?.status]);

  const initializeSession = async () => {
    if (!tavusService || !user) return;

    setIsConnecting(true);
    setError(null);

    try {
      const newSession = await tavusService.initializeSession(user.id, {
        name: user.name,
        bloodType: user.bloodType,
        role: user.role,
        location: user.location
      });

      setSession(newSession);

      // Add welcome message
      const welcomeMessage: TavusMessage = {
        id: 'welcome',
        type: 'agent',
        content: `Hello ${user.name}! I'm Dr. Vita, your AI blood donation specialist. I'm here to help you learn about blood donation, navigate our platform, and discover how you can save lives. What would you like to explore today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);

    } catch (error) {
      setError('Failed to connect to Dr. Vita. Please try again.');
      console.error('Session initialization failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !tavusService) return;

    const userMessage: TavusMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    try {
      await tavusService.sendMessage(inputMessage);
      setInputMessage('');
    } catch (error) {
      setError('Failed to send message. Please try again.');
    }
  };

  const handleTriggerHook = async (hookId: string) => {
    if (!tavusService) return;

    try {
      await tavusService.triggerHook(hookId, {
        userProfile: user,
        timestamp: new Date().toISOString()
      });
      setCurrentHook(hookId);
    } catch (error) {
      setError('Failed to start interactive experience.');
    }
  };

  const handleEndSession = async () => {
    if (tavusService) {
      await tavusService.endSession();
    }
    setSession(null);
    setMessages([]);
    setCurrentHook(null);
    setError(null);
    onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getHookInfo = (hookId: string) => {
    return drVitaPersona.conversationHooks.find(hook => hook.id === hookId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg overflow-hidden max-w-6xl w-full max-h-[90vh] flex"
          >
            {/* Video Section */}
            <div className="flex-1 bg-gray-900 relative">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 z-10">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                      <HeartIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dr. Vita</h3>
                      <p className="text-xs opacity-90">
                        {session?.status === 'connected' ? 'Ready to help' : 'Connecting...'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleEndSession}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Video Display */}
              <div className="h-96 flex items-center justify-center">
                {isConnecting ? (
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Connecting to Dr. Vita...</p>
                  </div>
                ) : session?.status === 'connected' ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted={false}
                  />
                ) : (
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <HeartIcon className="h-10 w-10" />
                    </div>
                    <p className="text-lg font-semibold mb-2">Dr. Vita</p>
                    <p className="text-sm opacity-75">AI Blood Donation Specialist</p>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <MicrophoneIcon className="h-5 w-5" />
                  </button>
                  <button className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                    <SpeakerWaveIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Current Hook Indicator */}
              {currentHook && (
                <div className="absolute top-20 left-4 right-4">
                  <div className="bg-primary-600 text-white px-4 py-2 rounded-lg">
                    <p className="text-sm font-medium">
                      {getHookInfo(currentHook)?.title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className="w-96 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Interactive Learning</h3>
                {session && (
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                    <span>Engagement: {session.metrics.engagementScore}%</span>
                    <span>{session.metrics.interactionCount} interactions</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Quick Start:</p>
                <div className="space-y-2">
                  {drVitaPersona.conversationHooks.map((hook) => (
                    <button
                      key={hook.id}
                      onClick={() => handleTriggerHook(hook.id)}
                      className="w-full text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {hook.title}
                    </button>
                  ))}
                </div>
              </div>

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
                <div ref={messagesEndRef} />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask Dr. Vita anything..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    disabled={session?.status !== 'connected'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || session?.status !== 'connected'}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TavusVideoAgent;