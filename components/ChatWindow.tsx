import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChatSession, UserProfile, ChatMessage, SuggestedSme, SmeConfig, WorkshopData, ResponseMode, SmeHelperContext, DynamicCapability } from '../types';
import { geminiService } from '../services/geminiService';
import { collaborationService } from '../services/collaborationService';
import { UserIcon, ModelIcon, VaultIcon, DashboardIcon, SwitchIcon, SendIcon, LoadingIcon, ShareIcon, HistoryIcon, WorkshopModeIcon, InteractionModeIcon, SMEBuilderIcon, ToolchainIcon, PuzzlePieceIcon, PaperclipIcon, CloseIcon } from './icons';
import SmePanel from './SmePanel';
import Message from './Message';
import WorkshopSetup from './modals/WorkshopSetup';
import ResponseModeSelector from './ResponseModeSelector';
import ShareSessionModal from './modals/ShareSessionModal';
import CapabilitiesPanel from '../src/components/CapabilitiesPanel';
import AnalysisResultModal from './modals/AnalysisResultModal';
import CapabilityExplanationModal from './modals/CapabilityExplanationModal';

// Add marked to the window type
declare global {
    interface Window {
        marked: any;
        hljs: any;
    }
}

interface ChatWindowProps {
  session: ChatSession;
  userProfile: UserProfile;
  onSwitchSme: () => void;
  onShowVault: () => void;
  onShowDashboard: () => void;
  onProfileEdit: () => void;
  onSaveToVault: (message: ChatMessage, isBuilderOutput?: boolean) => void;
  onShowExplorer: () => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const ChatHeader: React.FC<Omit<ChatWindowProps, 'session' | 'userProfile' | 'onSaveToVault'> & { session: ChatSession, onShare: () => void, onOpenWorkshop: () => void, userProfile: UserProfile, isActionMode: boolean, onToggleActionMode: () => void, isBuilderSession: boolean, onToggleCapabilities: () => void, isCapabilitiesPanelOpen: boolean }> = ({ onSwitchSme, onShowVault, onShowDashboard, onProfileEdit, session, onShare, onShowExplorer, onOpenWorkshop, isActionMode, onToggleActionMode, isBuilderSession, onToggleCapabilities, isCapabilitiesPanelOpen, onSetHelperContext }) => {
    const primarySme = session.smeConfigs[0];
    const headerTitle = session.smeConfigs.length > 1 
        ? `${session.smeConfigs[0].segment} & ${session.smeConfigs.length - 1} other${session.smeConfigs.length - 1 > 1 ? 's' : ''}`
        : session.smeConfigs[0].segment;
    
    const popoverTitle = session.smeConfigs.map(c => c.segment).join(' + ');

    return (
    <div className="flex-shrink-0 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 flex justify-between items-center" data-tour-id="chat-header" onMouseEnter={() => onSetHelperContext('CHAT_HEADER')}>
        <div className="group relative flex items-center gap-3">
            {isBuilderSession && <SMEBuilderIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />}
            <div>
                <h2 className="font-bold text-lg truncate cursor-pointer text-slate-900 dark:text-white" title={popoverTitle}>{headerTitle}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{primarySme.industry} / {primarySme.subType}</p>
            </div>
            <div className="absolute top-full mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-20">
              <h4 className="font-bold text-base border-b border-slate-200 dark:border-slate-700 pb-2 mb-2 text-slate-900 dark:text-white">Active SMEs</h4>
              <ul className="space-y-1">
                  {session.smeConfigs.map((sme, i) => <li key={i} className="font-semibold text-slate-600 dark:text-slate-300">{sme.segment}</li>)}
              </ul>
              {isBuilderSession && <p className="text-xs text-cyan-500 dark:text-cyan-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">SMEBuilder Mode is Active</p>}
              <div className="absolute left-4 -top-1.5 w-3 h-3 bg-white dark:bg-slate-900 border-t border-l border-slate-200 dark:border-slate-700 transform rotate-45"></div>
            </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 text-slate-500 dark:text-slate-400">
            <button 
              onClick={onToggleCapabilities} 
              title="SME Capabilities" 
              className={`p-2 rounded-full transition-colors ${isCapabilitiesPanelOpen ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <PuzzlePieceIcon className="w-5 h-5"/>
            </button>
            <button onClick={onOpenWorkshop} title="Workshop Mode" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"><WorkshopModeIcon className="w-5 h-5"/></button>
            <button onClick={onShare} title="Share Session" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"><ShareIcon className="w-5 h-5"/></button>
            <button onClick={onShowExplorer} title="Session History" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"><HistoryIcon className="w-5 h-5"/></button>
            <button onClick={onShowVault} title="Open Vault" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors" data-tour-id="chat-header-vault"><VaultIcon className="w-5 h-5"/></button>
            <button 
              onClick={onToggleActionMode} 
              title="Toggle Interactive Mode" 
              className={`p-2 rounded-full transition-colors ${isActionMode ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              <InteractionModeIcon className="w-5 h-5"/>
            </button>
            <button onClick={() => onShowDashboard()} title="Dashboard" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"><DashboardIcon className="w-5 h-5"/></button>
            <button onClick={onSwitchSme} title="Switch SME" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"><SwitchIcon className="w-5 h-5"/></button>
            <button onClick={onProfileEdit} title="Edit Profile" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"><UserIcon className="w-5 h-5"/></button>
        </div>
    </div>
)};

const BuilderToolchain: React.FC<{ onSelectTool: (command: string) => void }> = ({ onSelectTool }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const tools = [
        { label: 'Create API Documentation', command: '[TOOL:CREATE_API_DOCS]', description: 'Draft API docs in Markdown.' },
        { label: 'Create Social Media Post', command: '[TOOL:CREATE_SOCIAL_POST]', description: 'Generate a post for LinkedIn or X.' },
        { label: 'Create SWOT Analysis', command: '[TOOL:CREATE_SWOT]', description: 'Perform a SWOT analysis.' },
        { label: 'Draft Marketing Email', command: '[TOOL:DRAFT_EMAIL]', description: 'Write a professional marketing email.' },
        { label: 'Draft Pitch Deck Outline', command: '[TOOL:DRAFT_PITCH_DECK]', description: 'Outline a 10-slide pitch deck.' },
        { label: 'Draft Tech Requirements', command: '[TOOL:DRAFT_TECH_REQS]', description: 'Create a technical requirements doc.' },
        { label: 'Generate README.md', command: '[TOOL:GENERATE_README]', description: 'Create a project README file.' },
        { label: 'Generate Test Cases', command: '[TOOL:GENERATE_TEST_CASES]', description: 'Draft a set of software test cases.' },
        { label: 'Generate User Stories', command: '[TOOL:GENERATE_USER_STORIES]', description: 'Write Agile user stories.' },
        { label: 'Outline Blog Post', command: '[TOOL:OUTLINE_BLOG_POST]', description: 'Create a blog post outline.' },
        { label: 'Outline Project Plan', command: '[TOOL:OUTLINE_PROJECT_PLAN]', description: 'Generate a high-level project plan.' },
        { label: 'Write a Press Release', command: '[TOOL:WRITE_PRESS_RELEASE]', description: 'Draft a professional press release.' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (command: string) => {
        onSelectTool(command);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="absolute left-4 top-1/2 -translate-y-1/2">
            <button
                onClick={() => setIsOpen(!isOpen)}
                title="Open Builder Toolchain"
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
                <ToolchainIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                 <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-20 animate-fade-in">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-900 dark:text-white">Builder Toolchain</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Generate structured assets.</p>
                    </div>
                    <div className="p-1 max-h-60 overflow-y-auto">
                        {tools.map((tool) => (
                            <button
                                key={tool.command}
                                onClick={() => handleSelect(tool.command)}
                                className="w-full text-left p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                                <p className="font-semibold text-sm">{tool.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ChatWindow: React.FC<ChatWindowProps> = (props) => {
  const { session, userProfile, onSaveToVault, onSetHelperContext } = props;
  const [currentSession, setCurrentSession] = useState(session);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSmes, setSuggestedSmes] = useState<SuggestedSme[]>([]);
  const [isSuggestingSmes, setIsSuggestingSmes] = useState(false);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [isGlobalActionMode, setIsGlobalActionMode] = useState(false);
  const [responseMode, setResponseMode] = useState<ResponseMode>('default');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCapabilitiesPanelOpen, setIsCapabilitiesPanelOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [analysisModalData, setAnalysisModalData] = useState<{ sourceText: string; analysisType: 'red' | 'blue' | 'green'; analysisResult: string; } | null>(null);
  const [capabilityToExplain, setCapabilityToExplain] = useState<DynamicCapability | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const isBuilderSession = useMemo(() =>
    currentSession.messages.some(m => m.role === 'system' && m.content.includes('**SMEBuilder Session Initiated.**')),
    [currentSession.messages]
  );
  
  // Effect to sync incoming session prop to internal state
  useEffect(() => {
    setCurrentSession(session);
  }, [session]);

  // Stable callback for updating suggestions
  const updateSuggestions = useCallback(async (sess: ChatSession) => {
    if (!sess) return;
    const { accountType, smeConfigs, messages } = sess;
    if (accountType.startsWith('business') || accountType.endsWith('plus')) {
      setIsSuggestingSmes(true);
      const suggestions = await geminiService.suggestRelatedSmes(smeConfigs, messages, accountType);
      setSuggestedSmes(suggestions);
      setIsSuggestingSmes(false);
    }
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 200;
        textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        if (scrollHeight > maxHeight) {
            textarea.style.overflowY = 'auto';
        } else {
            textarea.style.overflowY = 'hidden';
        }
    }
  }, [input]);

  // Main effect to react to changes in the current session state
  useEffect(() => {
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'smeProSessions' && event.newValue) {
        const updatedSessions = JSON.parse(event.newValue);
        const updatedSessionData = updatedSessions[currentSession.sessionId];
        if (updatedSessionData && JSON.stringify(updatedSessionData.messages) !== JSON.stringify(currentSession.messages)) {
          setCurrentSession(updatedSessionData);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    updateSuggestions(currentSession);
    scrollToBottom();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentSession, updateSuggestions]);
  
  const handleSessionUpdate = (updatedSession: ChatSession) => {
    setCurrentSession(updatedSession);
    collaborationService.saveSession(updatedSession);
  };


  const handleAddSmes = async (newSmeConfigs: SmeConfig[]) => {
    const freshSmes = newSmeConfigs.filter(
      newSme => !currentSession.smeConfigs.some(existing => existing.segment === newSme.segment)
    );

    if (freshSmes.length === 0) return;

    setIsLoading(true);

    const systemMessageContent = `**New Experts Joined:**\n${freshSmes.map(sme => `- ${sme.segment}`).join('\n')}`;
    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemMessageContent,
      timestamp: new Date().toISOString(),
    };
    
    const introductionPromises = freshSmes.map(sme => 
      geminiService.generateSmeIntroduction(sme, currentSession.messages)
    );
    const introductions = await Promise.all(introductionPromises);

    const introMessages: ChatMessage[] = introductions.map((intro, index) => ({
      role: 'model',
      content: intro,
      timestamp: new Date().toISOString(),
      senderName: `${freshSmes[index].segment} SME`
    }));

    const updatedSession: ChatSession = {
      ...currentSession,
      smeConfigs: [...currentSession.smeConfigs, ...freshSmes],
      participants: [...currentSession.participants, ...freshSmes.map(sme => ({ name: sme.segment, isSme: true }))],
      messages: [...currentSession.messages, systemMessage, ...introMessages],
    };
    
    setCurrentSession(updatedSession);
    await collaborationService.saveSession(updatedSession);

    setIsLoading(false);
    updateSuggestions(updatedSession);
  };

  const handleGetDeeperInsight = async (selectedText: string, contextMessage: ChatMessage) => {
    setIsLoading(true);

    const insightResponse = await geminiService.getDeeperInsight(selectedText, contextMessage.content);
    
    const modelMessage: ChatMessage = {
      role: 'model',
      content: `**Insight on "${selectedText}":**\n\n${insightResponse}`,
      timestamp: new Date().toISOString(),
    };
    
    const finalSession = { ...currentSession, messages: [...currentSession.messages, modelMessage] };
    setCurrentSession(finalSession);
    setIsLoading(false);
    await collaborationService.saveSession(finalSession);
    updateSuggestions(finalSession);
  };
  
  const handleStartWorkshop = async (workshopData: WorkshopData) => {
    const systemMessageContent = `
**WORKSHOP MODE ACTIVATED**

A structured collaborative session has been initiated with the following parameters:

- **Objective:** ${workshopData.objective}
- **Agenda:**
${workshopData.agenda.split('\n').map(item => `  - ${item}`).join('\n')}
- **Backstory:** ${workshopData.backstory}
- **Use Cases:** ${workshopData.useCases || 'Not specified'}

All participating SMEs will now align their expertise to achieve the stated objective.
    `.trim();

    const systemMessage: ChatMessage = {
      role: 'system',
      content: systemMessageContent,
      timestamp: new Date().toISOString(),
    };
    
    let updatedSession = { ...currentSession, messages: [...currentSession.messages, systemMessage] };

    if (workshopData.attendees && workshopData.attendees.length > 0) {
      const newSmes = workshopData.attendees.filter(
        attendee => !currentSession.smeConfigs.some(existing => existing.segment === attendee.segment)
      );

      if (newSmes.length > 0) {
        setIsLoading(true);

        const introductions = await Promise.all(
          newSmes.map(sme => geminiService.generateSmeIntroduction(sme, updatedSession.messages))
        );

        const introMessages: ChatMessage[] = introductions.map((intro, index) => ({
          role: 'model',
          content: intro,
          timestamp: new Date().toISOString(),
          senderName: `${newSmes[index].segment} SME`
        }));
        
        updatedSession = {
          ...updatedSession,
          smeConfigs: [...updatedSession.smeConfigs, ...newSmes],
          participants: [...updatedSession.participants, ...newSmes.map(sme => ({ name: sme.segment, isSme: true }))],
          messages: [...updatedSession.messages, ...introMessages],
        };

        setIsLoading(false);
      }
    }

    const finalModelMessage: ChatMessage = {
        role: 'model',
        content: "Workshop Mode is now active. All systems are aligned to your objectives. Let's begin.",
        timestamp: new Date().toISOString()
    };
    updatedSession.messages.push(finalModelMessage);

    setCurrentSession(updatedSession);
    await collaborationService.saveSession(updatedSession);
    setIsWorkshopModalOpen(false);
    updateSuggestions(updatedSession);
  };

  const handleToggleActionMode = () => {
    setIsGlobalActionMode(prev => !prev);
  };
  
  const handleExecuteStepAction = useCallback(async (action: string, context: string, options?: any) => {
    setIsLoading(true);
    setInput(''); // Clear input when an action is taken

    const actionMessage: ChatMessage = {
      role: 'system',
      content: `Executing action: **${action}**...`,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...currentSession.messages, actionMessage];
    const sessionWithActionMessage = { ...currentSession, messages: updatedMessages };
    setCurrentSession(sessionWithActionMessage);
    
    await collaborationService.saveSession(sessionWithActionMessage);

    const responseContent = await geminiService.executeStepAction(action, context, currentSession.smeConfigs[0], currentSession.messages, options);

    const modelMessage: ChatMessage = {
      role: 'model',
      content: responseContent,
      timestamp: new Date().toISOString(),
    };
    
    const finalSession = { ...sessionWithActionMessage, messages: [...sessionWithActionMessage.messages, modelMessage] };
    setCurrentSession(finalSession);
    setIsLoading(false);

    await collaborationService.saveSession(finalSession);
    updateSuggestions(finalSession);
  }, [currentSession, updateSuggestions]);
  
  const handleRequestTextAnalysis = async (text: string, contextMessage: ChatMessage, type: 'red' | 'blue' | 'green') => {
    setIsLoading(true);
    const result = await geminiService.analyzeHighlightedText(text, contextMessage.content, type);
    setAnalysisModalData({
      sourceText: text,
      analysisType: type,
      analysisResult: result,
    });
    setIsLoading(false);
  };

  const handleSubmit = useCallback(async (e?: React.FormEvent, toolInput?: string) => {
    e?.preventDefault();
    const finalInput = toolInput || input.trim();
    if ((!finalInput && !attachedFile) || isLoading) return;

    if (responseMode === 'generate-code') {
        const lang = prompt("Enter language (e.g., Python, JavaScript):", "Python");
        if (!lang) return;
        const platform = prompt("Enter cloud platform or framework (e.g., GCP, AWS, React):", "GCP");
        if (!platform) return;

        await handleExecuteStepAction("Generate Code Snippet", finalInput, { lang, platform });
        setResponseMode('default'); // Reset mode after use
        return;
    }
    
    const isToolCommand = finalInput.startsWith('[TOOL:');
    
    let userMessage: ChatMessage;

    if (attachedFile) {
        const isImage = attachedFile.type.startsWith('image/');
        const readFileAsDataURL = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const readFileAsText = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });

        if (isImage) {
            const base64DataUrl = await readFileAsDataURL(attachedFile);
            const base64Data = base64DataUrl.split(',')[1];
            userMessage = {
                role: 'user',
                content: finalInput, // For display
                parts: [
                    { text: finalInput },
                    { inlineData: { mimeType: attachedFile.type, data: base64Data } }
                ],
                timestamp: new Date().toISOString(),
                senderName: userProfile.name,
            };
        } else { // Assume text file
            const fileContent = await readFileAsText(attachedFile);
            const combinedContent = `The user has attached a file named "${attachedFile.name}". Its content is:\n\n---\n${fileContent}\n---\n\nThe user's prompt is: ${finalInput}`;
            userMessage = {
                role: 'user',
                content: combinedContent,
                timestamp: new Date().toISOString(),
                senderName: userProfile.name,
            };
        }
    } else {
        const augmentedInput = responseMode === 'default' || isToolCommand
          ? finalInput 
          : `[RESPONSE STYLE: ${responseMode.replace('-', ' ')}] ${finalInput}`;

        userMessage = {
          role: 'user',
          content: augmentedInput,
          timestamp: new Date().toISOString(),
          senderName: userProfile.name
        };
    }
    
    const updatedMessages = [...currentSession.messages, userMessage];
    const sessionWithUserMessage = { ...currentSession, messages: updatedMessages };
    setCurrentSession(sessionWithUserMessage);
    setInput('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsLoading(true);
    setSuggestedSmes([]);
    
    await collaborationService.saveSession(sessionWithUserMessage);

    const responseContent = await geminiService.generateChatResponse(sessionWithUserMessage);

    const modelMessage: ChatMessage = {
      role: 'model',
      content: responseContent,
      timestamp: new Date().toISOString(),
    };
    
    const finalSession = { ...sessionWithUserMessage, messages: [...updatedMessages, modelMessage] };
    setCurrentSession(finalSession);
    setIsLoading(false);

    await collaborationService.saveSession(finalSession);
    
    updateSuggestions(finalSession);
  }, [input, isLoading, currentSession, userProfile.name, updateSuggestions, responseMode, handleExecuteStepAction, attachedFile]);
  
  const handleConfirmEnableCapability = () => {
    if (!capabilityToExplain || !currentSession.dynamicCapabilities) return;
  
    const updatedCaps = currentSession.dynamicCapabilities.map(c => 
      c.id === capabilityToExplain.id ? { ...c, enabled: true } : c
    );
    
    const updatedSession = { ...currentSession, dynamicCapabilities: updatedCaps };
    handleSessionUpdate(updatedSession);
    
    setCapabilityToExplain(null);
  };

  const handleToolSelect = (command: string) => {
    handleSubmit(undefined, command);
  };

  const handleSaveToVaultWrapper = (message: ChatMessage) => {
    const isBuilderOutput = message.content.startsWith('<!-- BUILDER_OUTPUT -->');
    onSaveToVault(message, isBuilderOutput);
  };
  
    const handleFileAttachClick = () => {
       fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
       if (event.target.files && event.target.files[0]) {
         const file = event.target.files[0];
         if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("File is too large. Maximum size is 5MB.");
            return;
         }
         setAttachedFile(file);
       }
    };

    const handleRemoveFile = () => {
       setAttachedFile(null);
       if(fileInputRef.current) {
           fileInputRef.current.value = ""; // Reset file input
       }
    };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300">
      <ChatHeader 
        {...props} 
        session={currentSession} 
        onShare={() => setIsShareModalOpen(true)} 
        onOpenWorkshop={() => setIsWorkshopModalOpen(true)}
        isActionMode={isGlobalActionMode}
        onToggleActionMode={handleToggleActionMode}
        isBuilderSession={isBuilderSession}
        onToggleCapabilities={() => setIsCapabilitiesPanelOpen(prev => !prev)}
        isCapabilitiesPanelOpen={isCapabilitiesPanelOpen}
      />
      <div className="flex flex-grow overflow-hidden relative">
        {isCapabilitiesPanelOpen && (
          <CapabilitiesPanel
            session={currentSession}
            onSessionUpdate={handleSessionUpdate}
            onExplainCapability={setCapabilityToExplain}
          />
        )}
        <div className="flex-grow flex flex-col">
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {currentSession.messages.map((msg, index) => (
                        <Message 
                          key={`${msg.timestamp}-${index}`} 
                          message={msg} 
                          session={currentSession}
                          onSave={handleSaveToVaultWrapper}
                          onGetInsight={handleGetDeeperInsight}
                          isActionMode={isGlobalActionMode}
                          onExecuteStepAction={handleExecuteStepAction}
                          onAnalyzeText={handleRequestTextAnalysis}
                        />
                    ))}
                    {isLoading && (
                        <div className="flex items-start space-x-4 py-4 animate-fade-in">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500">
                                <LoadingIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-grow text-slate-900 dark:text-white pt-1">Thinking...</div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700" data-tour-id="chat-input" onMouseEnter={() => onSetHelperContext('CHAT_INPUT')}>
                <div className="max-w-3xl mx-auto">
                    {attachedFile && (
                        <div className="bg-slate-200 dark:bg-slate-700 px-3 py-2 rounded-t-lg flex items-center justify-between text-sm animate-fade-in">
                            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 overflow-hidden">
                                <PaperclipIcon className="w-4 h-4 flex-shrink-0"/>
                                <span className="font-medium truncate">{attachedFile.name}</span>
                                <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">({(attachedFile.size / 1024).toFixed(2)} KB)</span>
                            </div>
                            <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 flex-shrink-0 text-slate-600 dark:text-slate-300">
                                <CloseIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            onFocus={() => onSetHelperContext('CHAT_INPUT')}
                            placeholder="Ask your SME a question, or attach a file..."
                            className={`w-full p-4 pl-14 pr-24 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none ${attachedFile ? 'rounded-b-lg' : 'rounded-lg'}`}
                            rows={1}
                            disabled={isLoading}
                        />
                        {isBuilderSession ? (
                            <BuilderToolchain onSelectTool={handleToolSelect} />
                        ) : (
                             <ResponseModeSelector
                                selectedMode={responseMode}
                                onModeChange={setResponseMode}
                            />
                        )}
                        <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center">
                            <button type="button" onClick={handleFileAttachClick} title="Attach File" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <PaperclipIcon className="w-5 h-5"/>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, text/plain, text/markdown, .md, .txt" />
                        </div>
                        <button type="submit" disabled={isLoading || (!input.trim() && !attachedFile)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
            </div>
        </div>
        <SmePanel
            activeSmes={currentSession.smeConfigs}
            suggestedSmes={suggestedSmes} 
            isLoading={isSuggestingSmes}
            onAddSmes={handleAddSmes}
            onSetHelperContext={onSetHelperContext}
        />
      </div>
      {isWorkshopModalOpen && currentSession.smeConfigs[0] && (
        <WorkshopSetup 
          onClose={() => setIsWorkshopModalOpen(false)}
          onStart={handleStartWorkshop}
          primarySmeConfig={currentSession.smeConfigs[0]}
        />
      )}
      {isShareModalOpen && (
        <ShareSessionModal
          sessionId={session.sessionId}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
      {analysisModalData && (
        <AnalysisResultModal
          {...analysisModalData}
          onClose={() => setAnalysisModalData(null)}
        />
      )}
      {capabilityToExplain && currentSession && (
        <CapabilityExplanationModal
            capability={capabilityToExplain}
            session={currentSession}
            onClose={() => setCapabilityToExplain(null)}
            onConfirm={handleConfirmEnableCapability}
        />
      )}
    </div>
  );
};

export default ChatWindow;