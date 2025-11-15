import React, { useState, useEffect } from 'react';
import { ChatSession } from '../types';
import { collaborationService } from '../services/collaborationService';
import { CloseIcon, HistoryIcon, LoadingIcon } from './icons';

interface SessionExplorerProps {
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onClose: () => void;
}

const SessionExplorer: React.FC<SessionExplorerProps> = ({ currentSessionId, onSelectSession, onClose }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    collaborationService.getAllSessions().then(fetchedSessions => {
      setSessions(fetchedSessions);
      setIsLoading(false);
    });
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getSmeDisplayTitle = (session: ChatSession) => {
    if (!session.smeConfigs || session.smeConfigs.length === 0) return "Untitled Session";
    return session.smeConfigs.map(s => s.segment).join(' + ');
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-start z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-slate-800 w-full max-w-sm h-full flex flex-col border-r border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex-shrink-0 p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <HistoryIcon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">Session History</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <LoadingIcon className="w-6 h-6" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>No past sessions found.</p>
            </div>
          ) : (
            <div className="p-2">
              {sessions.map(session => (
                <div
                  key={session.sessionId}
                  onClick={() => onSelectSession(session.sessionId)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 border ${
                    session.sessionId === currentSessionId
                      ? 'bg-cyan-500/10 border-cyan-500'
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <h4 className="font-bold text-white truncate">{getSmeDisplayTitle(session)}</h4>
                  <p className="text-sm text-slate-400 truncate">{session.smeConfigs[0]?.industry} / {session.smeConfigs[0]?.subType}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Last activity: {formatDate(session.messages[session.messages.length - 1]?.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionExplorer;