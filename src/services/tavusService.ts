import { TavusConfig, TavusSession, TavusMessage, TavusError, TavusPersona } from '../types/tavus';

class TavusService {
  private config: TavusConfig;
  private session: TavusSession | null = null;
  private websocket: WebSocket | null = null;
  private messageHandlers: ((message: TavusMessage) => void)[] = [];
  private errorHandlers: ((error: TavusError) => void)[] = [];
  private statusHandlers: ((status: TavusSession['status']) => void)[] = [];

  constructor(config: TavusConfig) {
    this.config = config;
  }

  // Initialize Tavus session
  async initializeSession(userId: string, userProfile?: any): Promise<TavusSession> {
    try {
      const response = await fetch('https://api.tavus.io/v1/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replica_id: this.config.replicaId,
          participant_id: userId,
          participant_name: userProfile?.name || 'User',
          conversation_config: {
            persona_id: 'dr-vita-blood-donation-specialist',
            enable_recording: true,
            enable_transcription: true,
            max_duration: 1800, // 30 minutes
          },
          custom_context: {
            userProfile,
            platform: 'innovation-blood-donation',
            features: ['mystery-hook', 'assessment-hook', 'storytelling-hook']
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize Tavus session: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.session = {
        sessionId: data.conversation_id,
        status: 'connecting',
        participant: {
          id: userId,
          name: userProfile?.name || 'User'
        },
        metrics: {
          engagementScore: 0,
          interactionCount: 0,
          sessionDuration: 0,
          completedHooks: []
        }
      };

      // Connect to WebSocket for real-time communication
      await this.connectWebSocket(data.websocket_url);

      return this.session;
    } catch (error) {
      const tavusError: TavusError = {
        code: 'INITIALIZATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { userId, userProfile }
      };
      this.handleError(tavusError);
      throw error;
    }
  }

  // Connect to Tavus WebSocket
  private async connectWebSocket(websocketUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(websocketUrl);

      this.websocket.onopen = () => {
        if (this.session) {
          this.session.status = 'connected';
          this.notifyStatusChange('connected');
        }
        resolve();
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocket.onerror = (error) => {
        const tavusError: TavusError = {
          code: 'WEBSOCKET_ERROR',
          message: 'WebSocket connection error',
          details: { error }
        };
        this.handleError(tavusError);
        reject(error);
      };

      this.websocket.onclose = () => {
        if (this.session) {
          this.session.status = 'disconnected';
          this.notifyStatusChange('disconnected');
        }
      };
    });
  }

  // Handle incoming WebSocket messages
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'agent_message':
        const agentMessage: TavusMessage = {
          id: data.message_id,
          type: 'agent',
          content: data.content,
          timestamp: new Date(data.timestamp),
          metadata: {
            hookId: data.hook_id,
            stepId: data.step_id,
            emotion: data.emotion,
            confidence: data.confidence
          }
        };
        this.notifyMessageReceived(agentMessage);
        this.updateMetrics('message_received');
        break;

      case 'user_message':
        const userMessage: TavusMessage = {
          id: data.message_id,
          type: 'user',
          content: data.content,
          timestamp: new Date(data.timestamp),
          metadata: data.metadata
        };
        this.notifyMessageReceived(userMessage);
        this.updateMetrics('user_interaction');
        break;

      case 'hook_completed':
        this.updateMetrics('hook_completed', data.hook_id);
        break;

      case 'session_metrics':
        if (this.session) {
          this.session.metrics = { ...this.session.metrics, ...data.metrics };
        }
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  // Send message to Tavus agent
  async sendMessage(content: string, metadata?: Record<string, any>): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'user_message',
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    this.websocket.send(JSON.stringify(message));
    this.updateMetrics('message_sent');
  }

  // Trigger specific conversation hook
  async triggerHook(hookId: string, context?: Record<string, any>): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const message = {
      type: 'trigger_hook',
      hook_id: hookId,
      context,
      timestamp: new Date().toISOString()
    };

    this.websocket.send(JSON.stringify(message));
  }

  // Update session metrics
  private updateMetrics(action: string, data?: any): void {
    if (!this.session) return;

    switch (action) {
      case 'message_sent':
      case 'message_received':
      case 'user_interaction':
        this.session.metrics.interactionCount++;
        break;
      case 'hook_completed':
        if (data && !this.session.metrics.completedHooks.includes(data)) {
          this.session.metrics.completedHooks.push(data);
        }
        break;
    }

    // Calculate engagement score based on interactions
    const baseScore = Math.min(this.session.metrics.interactionCount * 10, 100);
    const hookBonus = this.session.metrics.completedHooks.length * 20;
    this.session.metrics.engagementScore = Math.min(baseScore + hookBonus, 100);
  }

  // Event handlers
  onMessage(handler: (message: TavusMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  onError(handler: (error: TavusError) => void): void {
    this.errorHandlers.push(handler);
  }

  onStatusChange(handler: (status: TavusSession['status']) => void): void {
    this.statusHandlers.push(handler);
  }

  private notifyMessageReceived(message: TavusMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  private handleError(error: TavusError): void {
    this.errorHandlers.forEach(handler => handler(error));
  }

  private notifyStatusChange(status: TavusSession['status']): void {
    this.statusHandlers.forEach(handler => handler(status));
  }

  // Get current session
  getSession(): TavusSession | null {
    return this.session;
  }

  // End session
  async endSession(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    if (this.session) {
      try {
        await fetch(`https://api.tavus.io/v1/conversations/${this.session.sessionId}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Failed to end Tavus session:', error);
      }

      this.session = null;
    }
  }
}

export default TavusService;