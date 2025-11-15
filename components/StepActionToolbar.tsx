import React, { useState, useEffect } from 'react';
import { SmeConfig, ChatSession } from '../types';
import { geminiService } from '../services/geminiService';
import { DocumentIcon, CodeIcon, ResourceIcon, CostIcon, LoadingIcon } from './icons';

interface StepActionToolbarProps {
  smeConfig: SmeConfig;
  stepContent: string;
  session: ChatSession;
  onExecuteAction: (action: string, context: string, options?: any) => void;
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


const StepActionToolbar: React.FC<StepActionToolbarProps> = ({ smeConfig, stepContent, session, onExecuteAction }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
        setIsLoading(true);
        const actionNames = await geminiService.getDynamicStepActions(smeConfig, stepContent, session.messages);
        const mappedTools = actionNames.map(name => ({
            name,
            icon: getIconForAction(name)
        }));
        setTools(mappedTools);
        setIsLoading(false);
    };

    fetchActions();
  }, [smeConfig, stepContent, session.messages]);

  const handleToolClick = (tool: Tool) => {
    if (tool.name.toLowerCase().includes('code')) {
        const lang = prompt("Enter language (e.g., Python, JavaScript):", "Python");
        if (!lang) return;
        const platform = prompt("Enter cloud platform or framework (e.g., GCP, AWS, React):", "GCP");
        if (!platform) return;
        onExecuteAction(tool.name, stepContent, { lang, platform });
    } else {
        onExecuteAction(tool.name, stepContent);
    }
  };

  if (isLoading) {
    return (
        <div className="bg-slate-800 rounded-lg p-2 my-2 flex items-center space-x-2 animate-fade-in">
            <span className="text-xs font-bold text-cyan-400 pr-2 border-r border-slate-700">Actions:</span>
            <LoadingIcon className="w-4 h-4" />
            <span className="text-xs text-slate-400">Finding relevant actions...</span>
        </div>
    );
  }
  
  if (tools.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-2 my-2 flex items-center space-x-2 animate-fade-in">
      <span className="text-xs font-bold text-cyan-400 pr-2 border-r border-slate-700">Actions:</span>
      <div className="flex flex-wrap gap-2">
        {tools.map(tool => (
            <button
            key={tool.name}
            onClick={() => handleToolClick(tool)}
            className="flex items-center space-x-1.5 px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded-md text-xs text-slate-300"
            title={tool.name}
            >
            {tool.icon}
            <span>{tool.name}</span>
            </button>
        ))}
      </div>
    </div>
  );
};

export default StepActionToolbar;