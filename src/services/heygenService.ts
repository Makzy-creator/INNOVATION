interface HeyGenConfig {
  apiKey: string;
  avatarId?: string;
}

interface HeyGenSession {
  sessionId: string;
  status: 'connecting' | 'connected' | 'disconnected';
  avatarUrl?: string;
}

class HeyGenService {
  private config: HeyGenConfig;
  private session: HeyGenSession | null = null;
  private isDemo: boolean;

  constructor(config: HeyGenConfig) {
    this.config = config;
    this.isDemo = !config.apiKey || config.apiKey === 'demo-key';
  }

  // Initialize HeyGen streaming avatar session
  async initializeSession(): Promise<HeyGenSession> {
    if (this.isDemo) {
      // Demo mode - simulate HeyGen session
      this.session = {
        sessionId: `demo-session-${Date.now()}`,
        status: 'connected',
        avatarUrl: '/demo-avatar-placeholder'
      };
      return this.session;
    }

    try {
      // Real HeyGen API integration would go here
      const response = await fetch('https://api.heygen.com/v1/streaming/create_session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar_id: this.config.avatarId || 'default',
          quality: 'high',
          voice_id: 'default'
        }),
      });

      if (!response.ok) {
        throw new Error(`HeyGen API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      this.session = {
        sessionId: data.session_id,
        status: 'connected',
        avatarUrl: data.avatar_url
      };

      return this.session;
    } catch (error) {
      console.warn('HeyGen API not available, using demo mode:', error);
      // Fallback to demo mode
      this.session = {
        sessionId: `demo-session-${Date.now()}`,
        status: 'connected',
        avatarUrl: '/demo-avatar-placeholder'
      };
      return this.session;
    }
  }

  // Send text for avatar to speak
  async speak(text: string): Promise<void> {
    if (this.isDemo) {
      console.log('Demo HeyGen: Avatar would speak:', text);
      return;
    }

    if (!this.session) {
      throw new Error('No active HeyGen session');
    }

    try {
      await fetch(`https://api.heygen.com/v1/streaming/${this.session.sessionId}/speak`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            speed: 1.0,
            emotion: 'friendly'
          }
        }),
      });
    } catch (error) {
      console.error('Failed to send speech to HeyGen:', error);
    }
  }

  // Get current session
  getSession(): HeyGenSession | null {
    return this.session;
  }

  // End session
  async endSession(): Promise<void> {
    if (this.session && !this.isDemo) {
      try {
        await fetch(`https://api.heygen.com/v1/streaming/${this.session.sessionId}/end`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        });
      } catch (error) {
        console.error('Failed to end HeyGen session:', error);
      }
    }
    this.session = null;
  }
}

export default HeyGenService;