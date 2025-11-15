import { ChatSession, SmeConfig, SubscriptionPlan, UserProfile } from '../types';

const SESSIONS_KEY = 'smeProSessions';

// Mock collaboration service that uses localStorage
export const collaborationService = {
  getSession: async (sessionId: string, initialSmeConfig?: SmeConfig, accountType?: SubscriptionPlan, userProfile?: UserProfile): Promise<ChatSession | null> => {
    const sessionsJson = localStorage.getItem(SESSIONS_KEY);
    const sessions: { [key: string]: ChatSession } = sessionsJson ? JSON.parse(sessionsJson) : {};
    
    if (sessions[sessionId]) {
      return sessions[sessionId];
    }
    
    if (initialSmeConfig && accountType && userProfile) {
      const newSession: ChatSession = {
        sessionId,
        smeConfigs: [initialSmeConfig],
        accountType,
        participants: [
          { name: userProfile.name, isSme: false },
          { name: initialSmeConfig.segment, isSme: true }
        ],
        messages: [{
          role: 'system',
          content: 'Session started.',
          timestamp: new Date().toISOString(),
        }],
        enabledFunctions: {
          generateCode: true,
          selfCheck: false,
          runTerminal: false,
          automateBrowser: false,
          latestModels: true,
          apiKeyOptional: true
        },
        focus: undefined,
        dynamicCapabilities: [],
      };
      sessions[sessionId] = newSession;
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return newSession;
    }
    
    return null;
  },
  
  saveSession: async (session: ChatSession): Promise<ChatSession> => {
    const sessionsJson = localStorage.getItem(SESSIONS_KEY);
    const sessions: { [key: string]: ChatSession } = sessionsJson ? JSON.parse(sessionsJson) : {};
    sessions[session.sessionId] = session;
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return session;
  },

  getAllSessions: async (): Promise<ChatSession[]> => {
    const sessionsJson = localStorage.getItem(SESSIONS_KEY);
    const sessions: { [key: string]: ChatSession } = sessionsJson ? JSON.parse(sessionsJson) : {};
    return Object.values(sessions).sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1]?.timestamp || 'a';
        const lastMsgB = b.messages[b.messages.length - 1]?.timestamp || 'b';
        return lastMsgB.localeCompare(lastMsgA);
    });
  }
};