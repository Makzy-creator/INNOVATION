import { useState, useEffect } from 'react';
import { TavusSession } from '../types/tavus';

interface TavusMetrics {
  totalSessions: number;
  averageEngagement: number;
  completedHooks: number;
  totalInteractions: number;
  averageSessionDuration: number;
  topHooks: { hookId: string; completions: number }[];
}

export const useTavusMetrics = () => {
  const [metrics, setMetrics] = useState<TavusMetrics>({
    totalSessions: 0,
    averageEngagement: 0,
    completedHooks: 0,
    totalInteractions: 0,
    averageSessionDuration: 0,
    topHooks: []
  });

  const [sessions, setSessions] = useState<TavusSession[]>([]);

  // Load metrics from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('tavus_sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      calculateMetrics(parsedSessions);
    }
  }, []);

  // Save session data
  const saveSession = (session: TavusSession) => {
    const updatedSessions = [...sessions, session];
    setSessions(updatedSessions);
    localStorage.setItem('tavus_sessions', JSON.stringify(updatedSessions));
    calculateMetrics(updatedSessions);
  };

  // Calculate aggregated metrics
  const calculateMetrics = (sessionData: TavusSession[]) => {
    if (sessionData.length === 0) return;

    const totalSessions = sessionData.length;
    const totalEngagement = sessionData.reduce((sum, s) => sum + s.metrics.engagementScore, 0);
    const averageEngagement = totalEngagement / totalSessions;
    
    const completedHooks = sessionData.reduce((sum, s) => sum + s.metrics.completedHooks.length, 0);
    const totalInteractions = sessionData.reduce((sum, s) => sum + s.metrics.interactionCount, 0);
    const totalDuration = sessionData.reduce((sum, s) => sum + s.metrics.sessionDuration, 0);
    const averageSessionDuration = totalDuration / totalSessions;

    // Calculate top hooks
    const hookCounts: Record<string, number> = {};
    sessionData.forEach(session => {
      session.metrics.completedHooks.forEach(hookId => {
        hookCounts[hookId] = (hookCounts[hookId] || 0) + 1;
      });
    });

    const topHooks = Object.entries(hookCounts)
      .map(([hookId, completions]) => ({ hookId, completions }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);

    setMetrics({
      totalSessions,
      averageEngagement,
      completedHooks,
      totalInteractions,
      averageSessionDuration,
      topHooks
    });
  };

  // Export metrics for analytics
  const exportMetrics = () => {
    const data = {
      metrics,
      sessions,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tavus-metrics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    metrics,
    sessions,
    saveSession,
    exportMetrics
  };
};