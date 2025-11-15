import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SmeHelperContext, WorkbenchAsset, AspectRatio, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { 
    CloseIcon, CollaborationIcon, LoadingIcon, SendIcon, UserIcon, ModelIcon,
    NetworkIntelligenceIcon, DocumentScannerIcon, AspectRatioIcon, ImageIcon, GoogleIcon, MovieIcon, ImageEditAutoIcon 
} from './icons';

interface SMEWorkbenchProps {
  initialContext: string;
  onClose: () => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

type Tool = 'think' | 'search' | 'analyze-image' | 'generate-image' | 'edit-image' | 'animate-image';

const toolDetails: Record<Tool, { name: string; icon: React.ReactNode; description: string }> = {
    'think': { name: 'Think More', icon: <NetworkIntelligenceIcon className="w-5 h-5" />, description: 'Handle complex queries with advanced reasoning.' },
    'search': { name: 'Use Google Search', icon: <GoogleIcon className="w-5 h-5" />, description: 'Get up-to-date info from the web.' },
    'analyze-image': { name: 'Analyze Image', icon: <DocumentScannerIcon className="w-5 h-5" />, description: 'Upload a photo and ask questions about it.' },
    'generate-image': { name: 'Generate Image', icon: <ImageIcon className="w-5 h-5" />, description: 'Create an image from a text prompt.' },
    'edit-image': { name: 'Edit Image', icon: <ImageEditAutoIcon className="w-5 h-5" />, description: 'Use text to edit an uploaded image.' },
    'animate-image': { name: 'Animate Image', icon: <MovieIcon className="w-5 h-5" />, description: 'Generate a video from an image using Veo.' },
};

const aspectRatios: AspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];

const SMEWorkbench: React.FC<SMEWorkbenchProps> = ({ initialContext, onClose, onSetHelperContext }) => {
    const [assets, setAssets] = useState<WorkbenchAsset[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [toolOutput, setToolOutput] = useState<string | null>(null);
    const [isToolLoading, setIsToolLoading] = useState(false);
    const [isVeoKeySelected, setIsVeoKeySelected] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        onSetHelperContext('SME_WORKBENCH');
        const welcomeMessage: ChatMessage = {
            role: 'model',
            content: `Hello! Welcome to the SME Workbench. I'm your dedicated assistant, an expert on the advanced AI tools available here. I've reviewed your analysis context. How can I help you build on it? You can ask me questions, or select a tool from the left to get started.`,
            timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);

        // Check for Veo API key status on mount
        const checkVeoKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setIsVeoKeySelected(true);
            }
        };
        checkVeoKey();
    }, [initialContext, onSetHelperContext]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, toolOutput]);

    const handleAssistantSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        const userMessage: ChatMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const response = await geminiService.getWorkbenchAssistantResponse(initialContext, newMessages);
        
        const modelMessage: ChatMessage = { role: 'model', content: response, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, modelMessage]);
        setIsLoading(false);
    };

    const handleToolSubmit = async () => {
        if (!activeTool) return;
        
        const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });

        setIsToolLoading(true);
        setToolOutput(null);

        try {
            let result: WorkbenchAsset | string | null = null;
            let base64Image: string | undefined;
            if (imageFile) {
                base64Image = await toBase64(imageFile);
            }

            switch (activeTool) {
                case 'think':
                    result = await geminiService.generateComplexText(prompt);
                    break;
                case 'search':
                    result = await geminiService.generateTextWithSearch(prompt);
                    break;
                case 'generate-image':
                    result = await geminiService.generateImageWithPrompt(prompt, aspectRatio);
                    break;
                case 'analyze-image':
                    if (!base64Image || !imageFile) throw new Error("Please upload an image to analyze.");
                    result = await geminiService.analyzeUploadedImage(prompt, base64Image, imageFile.type);
                    break;
                case 'edit-image':
                     if (!base64Image || !imageFile) throw new Error("Please upload an image to edit.");
                    result = await geminiService.editUploadedImage(prompt, base64Image, imageFile.type);
                    break;
                case 'animate-image':
                    if (!base64Image || !imageFile) throw new Error("Please upload an image to animate.");
                    result = await geminiService.animateUploadedImage(prompt, base64Image, imageFile.type, aspectRatio.includes('16:9') ? '16:9' : '9:16');
                    break;
            }

            if (typeof result === 'string') {
                setToolOutput(result);
            } else if (result) {
                setAssets(prev => [result!, ...prev]);
                setToolOutput(`Asset generated and added to explorer: ${result.name}`);
            }

        } catch (error: any) {
            console.error(`Error executing tool ${activeTool}:`, error);
            setToolOutput(`An error occurred: ${error.message}`);
             if (error.message.includes("Requested entity was not found.")) {
                setIsVeoKeySelected(false);
                setToolOutput("Your API key is invalid. Please select a valid key to use Veo.");
            }
        }
        setIsToolLoading(false);
        setPrompt('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    
    const handleSelectTool = (tool: Tool) => {
        setActiveTool(tool);
        setToolOutput(null);
    };

    const handleOpenVeoKeySelector = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success and let the next API call verify.
            setIsVeoKeySelected(true);
        }
    };
    
    const renderToolUI = () => {
        if (!activeTool) return <div className="text-center text-slate-500">Select a tool to get started.</div>;

        const needsPrompt = ['think', 'search', 'generate-image', 'analyze-image', 'edit-image', 'animate-image'].includes(activeTool);
        const needsImageUpload = ['analyze-image', 'edit-image', 'animate-image'].includes(activeTool);
        const needsAspectRatio = ['generate-image', 'animate-image'].includes(activeTool);
        const isVeoTool = activeTool === 'animate-image';
        
        if (isVeoTool && !isVeoKeySelected) {
            return (
                <div className="text-center p-4">
                    <h3 className="font-bold text-white mb-2">API Key Required for Veo</h3>
                    <p className="text-sm text-slate-400 mb-4">Video generation with Veo requires you to select your own API key and is subject to billing.</p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm mb-4 block">Learn more about billing</a>
                    <button onClick={handleOpenVeoKeySelector} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">Select API Key</button>
                </div>
            )
        }

        return (
            <div className="space-y-4 p-1">
                {needsPrompt && (
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter your prompt here..." rows={4} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
                )}
                {needsImageUpload && (
                     <div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={e => setImageFile(e.target.files?.[0] || null)} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full text-sm p-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md">{imageFile ? `Selected: ${imageFile.name}` : 'Upload Image'}</button>
                     </div>
                )}
                {needsAspectRatio && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Aspect Ratio</label>
                        <div className="flex flex-wrap gap-2">
                            {aspectRatios.map(ratio => (
                                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-3 py-1 text-sm rounded-full ${aspectRatio === ratio ? 'bg-cyan-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>{ratio}</button>
                            ))}
                        </div>
                    </div>
                )}
                <button onClick={handleToolSubmit} disabled={isToolLoading} className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg disabled:bg-slate-600">
                    {isToolLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>
        );
    };

    return (
    <div className="fixed inset-0 bg-slate-900 z-40 flex flex-col animate-fade-in" onMouseEnter={() => onSetHelperContext('SME_WORKBENCH')}>
      <header className="flex-shrink-0 p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <CollaborationIcon className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">SME Workbench</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      <div className="flex-grow flex overflow-hidden">
        {/* Left Panel: Tools & Explorer */}
        <aside className="w-96 flex-shrink-0 bg-slate-800/50 border-r border-slate-700 flex flex-col">
            <div className="p-4">
                <h3 className="font-bold text-white mb-2">AI Toolkit</h3>
                <div className="space-y-1">
                    {Object.entries(toolDetails).map(([key, tool]) => (
                        <button key={key} onClick={() => handleSelectTool(key as Tool)} className={`w-full flex items-center space-x-3 p-2 rounded-md text-left ${activeTool === key ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-700'}`}>
                           {tool.icon}
                           <span className="text-sm font-semibold">{tool.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-slate-700 flex-grow flex flex-col min-h-0">
                <h3 className="font-bold text-white mb-2">Asset Explorer</h3>
                <div className="flex-grow bg-slate-900 rounded-md p-2 overflow-y-auto">
                    {assets.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">Generated assets will appear here.</p> :
                        assets.map(asset => (
                            <div key={asset.id} className="p-2 mb-1 rounded bg-slate-800 text-xs">
                                <p className="font-bold truncate text-white">{asset.name}</p>
                                <p className="text-slate-400 capitalize">{asset.type}</p>
                            </div>
                        ))
                    }
                </div>
            </div>
        </aside>
        
        {/* Right Panel: Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
             {/* Tool Interaction Area */}
            <div className="flex-shrink-0 p-4 border-b border-slate-700 max-h-96 overflow-y-auto">
                {activeTool && <h3 className="font-bold text-white mb-3 text-lg">{toolDetails[activeTool].name}</h3>}
                {renderToolUI()}
                {(toolOutput || isToolLoading) && (
                    <div className="mt-4 p-4 bg-slate-900 rounded-md">
                        {isToolLoading && <div className="flex justify-center items-center"><LoadingIcon className="w-6 h-6" /></div>}
                        {toolOutput && <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: window.marked.parse(toolOutput) }} />}
                    </div>
                )}
            </div>

            {/* Assistant Chat Area */}
            <div className="flex-grow flex flex-col p-4 overflow-y-auto">
                <div className="flex-grow">
                {messages.map((msg, index) => (
                    <div key={index} className="flex items-start space-x-3 py-2">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'model' ? 'bg-cyan-500' : 'bg-slate-600'}`}>
                            {msg.role === 'model' ? <ModelIcon className="w-5 h-5 text-white"/> : <UserIcon className="w-5 h-5 text-white"/>}
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none pt-1" dangerouslySetInnerHTML={{ __html: window.marked.parse(msg.content) }}></div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start space-x-3 py-2">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-500"><LoadingIcon className="w-5 h-5 text-white"/></div>
                         <div className="pt-1">Thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="flex-shrink-0 p-4 bg-slate-800 border-t border-slate-700">
                <form onSubmit={handleAssistantSubmit} className="relative">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Chat with your Workbench Assistant..." className="w-full p-3 pl-4 pr-12 bg-slate-700 border border-slate-600 rounded-full text-white" />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-slate-500"><SendIcon className="w-5 h-5"/></button>
                </form>
            </div>
        </main>
      </div>
    </div>
    );
};

export default SMEWorkbench;