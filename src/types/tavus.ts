export interface TavusConfig {
  apiKey: string;
  replicaId: string;
  conversationId?: string;
}

export interface TavusPersona {
  id: string;
  name: string;
  description: string;
  personality: {
    traits: string[];
    communicationStyle: string;
    expertise: string[];
  };
  conversationHooks: ConversationHook[];
}

export interface ConversationHook {
  id: string;
  type: 'mystery' | 'assessment' | 'storytelling';
  title: string;
  description: string;
  triggerConditions: string[];
  flow: ConversationStep[];
}

export interface ConversationStep {
  id: string;
  type: 'question' | 'information' | 'decision' | 'result';
  content: string;
  options?: string[];
  nextStep?: string;
  metadata?: Record<string, any>;
}

export interface TavusSession {
  sessionId: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  participant?: {
    id: string;
    name: string;
  };
  metrics: {
    engagementScore: number;
    interactionCount: number;
    sessionDuration: number;
    completedHooks: string[];
  };
}

export interface TavusMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: {
    hookId?: string;
    stepId?: string;
    emotion?: string;
    confidence?: number;
  };
}

export interface TavusError {
  code: string;
  message: string;
  details?: Record<string, any>;
}