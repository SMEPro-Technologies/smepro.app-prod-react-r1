import React, { useState, useEffect } from 'react';
import { SmeConfig, ChatSession } from '../types';
import { geminiService } from '../services/geminiService';
import { DocumentIcon, CodeIcon, ResourceIcon, CostIcon, LoadingIcon } from './icons';

interface TextActionToolbarProps {
  smeConfig: SmeConfig;
  selectedText: string;
  session: ChatSession;
  onExecuteAction: (action: string, context: string, options?: any) => void;
  top: number;
  left: number;
}

type Tool = {
  name: string;
  icon: React.ReactNode;
};

// This function maps dynamically generated action names to a static set of icons.
const getIconForAction = (actionName: string): React.ReactNode => {
    const name = actionName.toLowerCase();
    if (name.includes('code')) return <CodeIcon className="w-4 h-4" />;
    if (name.includes('cost') || name.includes('budget')) return <CostIcon className="w-4 h-4" />;
    if (name.includes('infra') || name.includes('resource') || name.includes('deploy')) return <ResourceIcon className="w-4 h-4" />;
    // Default to document icon for plans, drafts, requirements, etc.
    return <DocumentIcon className="w-4 h-4" />;
};


const TextActionToolbar: React.FC<TextActionToolbarProps> = ({ smeConfig, selectedText, session, onExecuteAction, top, left }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
        setIsLoading(true);
        const actionNames = await geminiService.getDynamicStepActions(smeConfig, selectedText, session.messages);
        const mappedTools = actionNames.map(name => ({
            name,
            icon: getIconForAction(name)
        }));
        setTools(mappedTools);
        setIsLoading(false);
    };

    if (selectedText) {
      fetchActions();
    }
  }, [smeConfig, selectedText, session.messages]);

  const handleToolClick = (tool: Tool) => {
    if (tool.name.toLowerCase().includes('code')) {
        const lang = prompt("Enter language (e.g., Python, JavaScript):", "Python");
        if (!lang) return;
        const platform = prompt("Enter cloud platform or framework (e.g., GCP, AWS, React):", "GCP");
        if (!platform) return;
        onExecuteAction(tool.name, selectedText, { lang, platform });
    } else {
        onExecuteAction(tool.name, selectedText);
    }
  };

  const content = isLoading ? (
    <div className="flex items-center space-x-2 px-2">
        <LoadingIcon className="w-4 h-4" />
        <span className="text-xs text-slate-400">Finding actions...</span>
    </div>
  ) : tools.length > 0 ? (
     tools.map(tool => (
        <button
        key={tool.name}
        onClick={() => handleToolClick(tool)}
        className="flex items-center space-x-1.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-xs text-slate-300"
        title={tool.name}
        >
        {tool.icon}
        <span>{tool.name}</span>
        </button>
    ))
  ) : null;

  if (!content) return null;

  return (
    <div 
      className="fixed z-20 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg p-1.5 shadow-lg animate-fade-in"
      style={{ top: top, left: left, transform: 'translate(-50%, -120%)' }}
      onMouseUp={(e) => e.stopPropagation()}
    >
        {content}
    </div>
  );
};

export default TextActionToolbar;