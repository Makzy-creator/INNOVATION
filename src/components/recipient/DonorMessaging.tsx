import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  UserCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  sender: 'donor' | 'recipient' | 'system';
  content: string;
  timestamp: Date;
  read: boolean;
}

interface Conversation {
  id: string;
  donorName: string;
  donorId: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'completed' | 'pending';
  messages: Message[];
}

const DonorMessaging: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation, conversations]);

  const loadConversations = async () => {
    try {
      // In a real app, this would fetch from Supabase
      // For now, we'll simulate with mock data
      const mockConversations: Conversation[] = [
        {
          id: '1',
          donorName: 'John Smith',
          donorId: 'donor-1',
          lastMessage: 'I can donate tomorrow morning. Does that work?',
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000),
          unreadCount: 2,
          status: 'active',
          messages: [
            {
              id: '1-1',
              sender: 'system',
              content: 'John Smith has offered to donate for your blood request.',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
              read: true
            },
            {
              id: '1-2',
              sender: 'recipient',
              content: 'Thank you so much for offering to help! When would you be available?',
              timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
              read: true
            },
            {
              id: '1-3',
              sender: 'donor',
              content: 'I can donate tomorrow morning. Does that work?',
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              read: false
            }
          ]
        },
        {
          id: '2',
          donorName: 'Sarah Johnson',
          donorId: 'donor-2',
          lastMessage: 'I just completed my donation. Hope it helps!',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          unreadCount: 0,
          status: 'completed',
          messages: [
            {
              id: '2-1',
              sender: 'system',
              content: 'Sarah Johnson has offered to donate for your blood request.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              read: true
            },
            {
              id: '2-2',
              sender: 'donor',
              content: 'Hi there, I saw your request and I\'d like to help. I\'m O+ and available this week.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
              read: true
            },
            {
              id: '2-3',
              sender: 'recipient',
              content: 'Thank you so much Sarah! That would be incredibly helpful. Are you available on Thursday?',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
              read: true
            },
            {
              id: '2-4',
              sender: 'donor',
              content: 'Thursday works perfectly. I\'ll schedule my appointment at City Hospital.',
              timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
              read: true
            },
            {
              id: '2-5',
              sender: 'donor',
              content: 'I just completed my donation. Hope it helps!',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              read: true
            },
            {
              id: '2-6',
              sender: 'recipient',
              content: 'You\'re a lifesaver, literally! Thank you so much for your generosity.',
              timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
              read: true
            }
          ]
        }
      ];

      setConversations(mockConversations);
      
      // Set first conversation as active if none is selected
      if (!activeConversation && mockConversations.length > 0) {
        setActiveConversation(mockConversations[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation) {
        const newMsg: Message = {
          id: `${conv.id}-${conv.messages.length + 1}`,
          sender: 'recipient',
          content: newMessage.trim(),
          timestamp: new Date(),
          read: true
        };
        
        return {
          ...conv,
          lastMessage: newMessage.trim(),
          lastMessageTime: new Date(),
          messages: [...conv.messages, newMsg]
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setNewMessage('');
  };

  const markConversationAsRead = (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map(msg => ({ ...msg, read: true }))
          };
        }
        return conv;
      })
    );
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversation(conversationId);
    markConversationAsRead(conversationId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <ExclamationTriangleIcon className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    }
    
    return 'Just now';
  };

  const getActiveConversation = () => {
    return conversations.find(conv => conv.id === activeConversation);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] overflow-hidden rounded-lg border border-gray-200">
      {/* Conversation List */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Messages</h3>
          <p className="text-sm text-gray-600">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="overflow-y-auto h-[calc(600px-65px)]">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation.id)}
                className={`p-4 border-b border-gray-200 cursor-pointer transition-colors ${
                  activeConversation === conversation.id
                    ? 'bg-primary-50'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        conversation.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{conversation.donorName}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        {getStatusIcon(conversation.status)}
                        <span className="ml-1">{conversation.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessageTime)}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-1">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-1 text-sm text-gray-600 truncate">
                  {conversation.lastMessage}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="w-2/3 flex flex-col">
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {getActiveConversation()?.donorName}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      {getStatusIcon(getActiveConversation()?.status || '')}
                      <span className="ml-1 capitalize">{getActiveConversation()?.status}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  {getActiveConversation()?.status === 'completed' && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Donation Complete
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {getActiveConversation()?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'recipient' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'system' ? (
                      <div className="bg-blue-50 text-blue-800 text-sm py-2 px-4 rounded-lg max-w-[80%]">
                        {message.content}
                      </div>
                    ) : (
                      <div className={`max-w-[80%] ${
                        message.sender === 'recipient'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white border border-gray-200'
                      } rounded-lg px-4 py-2 shadow-sm`}>
                        <div className="text-sm">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-1 ${
                          message.sender === 'recipient' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 input-field"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="bg-gray-200 p-6 rounded-full mx-auto mb-4 w-20 h-20 flex items-center justify-center">
                <UserCircleIcon className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No conversation selected
              </h3>
              <p className="text-gray-600">
                Select a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorMessaging;