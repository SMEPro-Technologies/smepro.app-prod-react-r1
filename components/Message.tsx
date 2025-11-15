import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChatSession, ChatMessage } from '../types';
import { ModelIcon, UserIcon, VaultIcon, StepByStepIcon, CopyIcon, CheckIcon, SMEBuilderIcon } from './icons';
import htmlReactParser, { DOMNode, Element, domToReact } from 'html-react-parser';
import StepActionToolbar from './StepActionToolbar';
import EditablePlaceholder from './EditablePlaceholder';
import HighlightToolbar from './HighlightToolbar';
import TextActionToolbar from './TextActionToolbar';


declare global {
    interface Window {
        marked: any;
        hljs: any;
    }
}

interface MessageProps {
  message: ChatMessage;
  session: ChatSession;
  onSave: (message: ChatMessage) => void;
  onGetInsight: (selectedText: string, contextMessage: ChatMessage) => void;
  isActionMode: boolean;
  onExecuteStepAction: (action: string, context: string, options?: any) => void;
  onAnalyzeText: (text: string, contextMessage: ChatMessage, type: 'red' | 'blue' | 'green') => void;
}

const InteractiveBoldText: React.FC<{ children: React.ReactNode, onGetInsight: () => void, onSave: () => void }> = ({ children, onGetInsight, onSave }) => {
    const [showPopover, setShowPopover] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowPopover(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePopoverClick = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        setShowPopover(!showPopover);
    };

    return (
        <strong ref={wrapperRef} className="text-cyan-300 font-bold relative cursor-pointer" onClick={handlePopoverClick}>
            {children}
            {showPopover && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-lg z-10 text-white text-sm font-normal">
                    <button onClick={onGetInsight} className="w-full text-left p-2 rounded hover:bg-slate-700">Get Deeper Insight</button>
                    <button onClick={onSave} className="w-full text-left p-2 rounded hover:bg-slate-700">Save to Vault</button>
                </div>
            )}
        </strong>
    );
};

const InteractiveCodeBlock: React.FC<{ language: string, initialContent: string }> = ({ language, initialContent }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [placeholders, setPlaceholders] = useState<Record<string, string>>(() => {
        const placeholderRegex = /{{(.*?)}}/g;
        const matches = [...initialContent.matchAll(placeholderRegex)];
        return matches.reduce((acc, match) => {
            acc[match[1]] = match[1];
            return acc;
        }, {} as Record<string, string>);
    });

    const handlePlaceholderChange = (key: string, value: string) => {
        setPlaceholders(prev => ({ ...prev, [key]: value }));
    };
    
    const handleCopy = () => {
        let finalCode = initialContent;
        for (const [key, value] of Object.entries(placeholders)) {
            const finalValue = value === key ? `{{${key}}}` : value; // Use original placeholder if not changed
            finalCode = finalCode.split(`{{${key}}}`).join(finalValue);
        }
        navigator.clipboard.writeText(finalCode).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const placeholderRegex = /({{(?:.*?)}})/g;
    const parts = initialContent.split(placeholderRegex);
    const interactiveCode = parts.filter(part => part).map((part, i) => {
        if (placeholderRegex.test(part)) {
            const key = part.substring(2, part.length - 2);
            return <EditablePlaceholder key={`${key}-${i}`} placeholderKey={key} initialValue={placeholders[key] || key} onValueChange={handlePlaceholderChange} />;
        }
        return <span key={i} dangerouslySetInnerHTML={{ __html: window.hljs.highlight(part, { language, ignoreIllegals: true }).value }}></span>;
    });

    return (
        <div className="bg-slate-900 rounded-md my-2 relative group">
            <div className="flex justify-between items-center px-4 py-2 text-xs text-slate-400 border-b border-slate-700">
                <span>{language || 'code'}</span>
                <button onClick={handleCopy} className="flex items-center space-x-1 text-xs">
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    <span>{isCopied ? 'Copied!' : 'Copy Final Code'}</span>
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm"><code className={`language-${language}`}>{interactiveCode}</code></pre>
        </div>
    );
};

const Message: React.FC<MessageProps> = ({ message, session, onSave, onGetInsight, isActionMode, onExecuteStepAction, onAnalyzeText }) => {
    const isModel = message.role === 'model';
    const isCurrentUser = message.senderName === session.participants.find(p => !p.isSme)?.name;
    const contentRef = useRef<HTMLDivElement>(null);
    
    const [isStepView, setIsStepView] = useState(false);
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
    const [highlightToolbarSelection, setHighlightToolbarSelection] = useState<{ top: number; left: number; } | null>(null);
    const [textActionToolbarSelection, setTextActionToolbarSelection] = useState<{ top: number; left: number; text: string } | null>(null);
    const selectedTextRef = useRef<string>('');

    const isBuilderOutput = message.content.startsWith('<!-- BUILDER_OUTPUT -->');
    const displayContent = isBuilderOutput ? message.content.replace('<!-- BUILDER_OUTPUT -->\n\n', '') : message.content;
    
    const [contentHtml, setContentHtml] = useState(() => {
        if (message.role === 'system') return `<div class="p-4 bg-slate-800/50 border-l-4 border-cyan-500 text-slate-400 text-sm">${window.marked.parse(message.content)}</div>`;
        return window.marked.parse(displayContent, { gfm: true, breaks: true });
    });

    useEffect(() => {
        if (!isActionMode) {
            setIsStepView(false);
            setActiveStepIndex(null);
        }
    }, [isActionMode]);
    
    useEffect(() => {
        const handleClickOutside = () => {
            if (window.getSelection()?.isCollapsed) {
                setHighlightToolbarSelection(null);
                setTextActionToolbarSelection(null);
            }
        };
        document.addEventListener('mouseup', handleClickOutside);
        return () => document.removeEventListener('mouseup', handleClickOutside);
    }, []);

    const parsedContent = useMemo(() => {
        const options = {
            replace: (domNode: DOMNode) => {
                if (domNode instanceof Element && domNode.tagName === 'pre') {
                    const codeNode = domNode.children[0] as Element;
                    if (codeNode && codeNode.tagName === 'code') {
                        const langMatch = codeNode.attribs.class?.match(/language-(.*)/);
                        const language = langMatch ? langMatch[1] : '';
                        const codeContent = (codeNode.children[0] as any)?.data || '';
                        
                        if (/{{(.*?)}}/.test(codeContent)) {
                            return <InteractiveCodeBlock language={language} initialContent={codeContent} />;
                        } else {
                            return (
                                <div className="bg-slate-900 rounded-md my-2 relative group">
                                    <div className="flex justify-between items-center px-4 py-2 text-xs text-slate-400 border-b border-slate-700">
                                        <span>{language || 'code'}</span>
                                        <button onClick={() => navigator.clipboard.writeText(codeContent)} className="flex items-center space-x-1 text-xs"><CopyIcon className="w-4 h-4" /><span>Copy</span></button>
                                    </div>
                                    <pre className="p-4 overflow-x-auto text-sm"><code className={`language-${language}`} dangerouslySetInnerHTML={{ __html: window.hljs.highlight(codeContent, { language, ignoreIllegals: true }).value }}></code></pre>
                                </div>
                            );
                        }
                    }
                }
                if (isActionMode && domNode instanceof Element && domNode.tagName === 'strong') {
                    const text = (domNode.children[0] as any)?.data;
                    if (text) {
                        return (
                            <InteractiveBoldText 
                                onGetInsight={() => onGetInsight(text, message)}
                                onSave={() => onSave({ role: 'user', content: `Vault Action Item: ${text}`, timestamp: new Date().toISOString() })}
                            >
                                {domToReact(domNode.children, options)}
                            </InteractiveBoldText>
                        );
                    }
                }
            }
        };
        return htmlReactParser(contentHtml, options);
    }, [isActionMode, contentHtml, onGetInsight, onSave, message]);
    
    const stepByStepItems = useMemo(() => {
        if (!isModel) return [];
        const doc = new DOMParser().parseFromString(contentHtml, 'text/html');
        const listItems = Array.from(doc.querySelectorAll('li'));
        return listItems.map(li => ({ html: li.innerHTML, text: li.textContent || '' }));
    }, [contentHtml, isModel]);

    const handleMouseUp = () => {
        if (!isActionMode) return;
        const currentSelection = window.getSelection();
        if (currentSelection && !currentSelection.isCollapsed && currentSelection.toString().trim().length > 5) {
          const range = currentSelection.getRangeAt(0);
          if (contentRef.current?.contains(range.commonAncestorContainer)) {
            const rect = range.getBoundingClientRect();
            const text = currentSelection.toString();
            
            if (isStepView) {
                setTextActionToolbarSelection({
                    top: rect.top,
                    left: rect.left + rect.width / 2,
                    text: text,
                });
                setHighlightToolbarSelection(null);
            } else {
                selectedTextRef.current = text;
                setHighlightToolbarSelection({
                  top: rect.top,
                  left: rect.left + rect.width / 2,
                });
                setTextActionToolbarSelection(null);
            }
            return;
          }
        }
    };

    const handleAnalyze = (type: 'red' | 'blue' | 'green') => {
        if (selectedTextRef.current) {
          onAnalyzeText(selectedTextRef.current, message, type);
        }
        setHighlightToolbarSelection(null);
    };

    if (message.role === 'system') {
        return <div className="py-4 max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: contentHtml }}></div>;
    }

    return (
        <div className={`flex items-start space-x-4 py-4 ${isModel ? 'animate-fade-in' : ''}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                {isModel ? <ModelIcon className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-grow text-white min-w-0" onMouseUp={handleMouseUp}>
                {highlightToolbarSelection && !isStepView && (
                    <HighlightToolbar 
                        top={highlightToolbarSelection.top} 
                        left={highlightToolbarSelection.left} 
                        onAnalyze={handleAnalyze}
                    />
                )}
                 {textActionToolbarSelection && isStepView && (
                    <TextActionToolbar
                        smeConfig={session.smeConfigs[0]}
                        selectedText={textActionToolbarSelection.text}
                        session={session}
                        onExecuteAction={(action, context, options) => {
                            onExecuteStepAction(action, context, options);
                            setTextActionToolbarSelection(null); // Close toolbar on action
                        }}
                        top={textActionToolbarSelection.top}
                        left={textActionToolbarSelection.left}
                    />
                )}
                {isModel && message.senderName && <div className="text-xs font-bold text-cyan-300 mb-1">{message.senderName}</div>}
                {!isModel && !isCurrentUser && <div className="text-xs font-bold text-slate-400 mb-1">{message.senderName}</div>}
                
                <div ref={contentRef}>
                    {isModel && isStepView && stepByStepItems.length > 0 ? (
                        <div className="space-y-2 mt-2">
                            {stepByStepItems.map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    <div 
                                        onClick={() => isActionMode && setActiveStepIndex(activeStepIndex === index ? null : index)}
                                        className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${isActionMode ? 'cursor-pointer' : ''} ${activeStepIndex === index ? 'bg-slate-700' : 'bg-slate-800/50'}`}
                                    >
                                        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-slate-700 text-cyan-400 font-bold rounded-full mt-0.5">{index + 1}</div>
                                        <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.html }} />
                                    </div>
                                    {isActionMode && activeStepIndex === index && (
                                        <StepActionToolbar
                                            smeConfig={session.smeConfigs[0]}
                                            stepContent={item.text}
                                            session={session}
                                            onExecuteAction={onExecuteStepAction}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            {parsedContent}
                        </div>
                    )}
                </div>
                 {isBuilderOutput && (
                    <div className="flex items-center space-x-1.5 text-xs text-cyan-400 mt-2 font-semibold">
                        <SMEBuilderIcon className="w-4 h-4" />
                        <span>Builder Output</span>
                    </div>
                )}
            </div>
            {isModel && (
              <div className="flex flex-col space-y-2 items-center pl-2">
                  <button 
                    onClick={() => onSave(message)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition-colors"
                    title="Save to Vault"
                  >
                      <VaultIcon className="w-5 h-5"/>
                  </button>
                  {isActionMode && stepByStepItems.length > 0 && (
                     <button 
                        onClick={() => setIsStepView(!isStepView)}
                        className={`p-1.5 rounded-full transition-colors ${isStepView ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700'}`}
                        title="Toggle Step-by-Step View"
                      >
                          <StepByStepIcon className="w-5 h-5"/>
                      </button>
                  )}
              </div>
            )}
        </div>
    );
};

export default Message;