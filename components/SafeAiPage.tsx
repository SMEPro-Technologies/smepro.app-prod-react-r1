import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheckIcon, AlertTriangleIcon, CheckCircleIcon } from './icons';
import { SmeHelperContext } from '../types';

interface SafeAiPageProps {
  onGetStarted: () => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const harmfulKeywords = ['harmful', 'illegal', 'dangerous', 'manipulate', 'misinformation', 'create a virus', 'hack into'];
const sensitiveKeywords = ['password is', 'ssn is', 'credit card number', 'confidential documents'];

const SafeAiPage: React.FC<SafeAiPageProps> = ({ onGetStarted, onSetHelperContext }) => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState({ type: 'info', message: 'Type in the box below or use an example to see how our safety model responds.' });
    const [lockout, setLockout] = useState<{ active: boolean; timer: number }>({ active: false, timer: 0 });
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (lockout.active && lockout.timer > 0) {
            interval = setInterval(() => {
                setLockout(prev => ({ ...prev, timer: prev.timer - 1 }));
            }, 1000);
        } else if (lockout.active && lockout.timer === 0) {
            setLockout({ active: false, timer: 0 });
            setAttempts(0);
            setResponse({ type: 'info', message: 'Temporary lockout has ended. Please proceed with caution.' });
        }
        return () => clearInterval(interval);
    }, [lockout]);

    const checkPrompt = (text: string) => {
        if (lockout.active) return;
        const lowerText = text.toLowerCase();
        
        const isHarmful = harmfulKeywords.some(kw => lowerText.includes(kw));
        const isSensitive = sensitiveKeywords.some(kw => lowerText.includes(kw));

        if (isHarmful) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            if (newAttempts >= 2) {
                setResponse({ type: 'lockout', message: 'Harmful content detected multiple times. Your session is temporarily locked for 15 minutes.' });
                setLockout({ active: true, timer: 15 * 60 }); // 15 minutes
            } else {
                setResponse({ type: 'warning', message: 'This prompt may violate our safety policy. Continued attempts may result in a temporary lockout.' });
            }
        } else if (isSensitive) {
            setResponse({ type: 'pivot', message: "It looks like you're mentioning sensitive data. For your security, this information will be redacted and the AI will pivot the conversation to a safer topic." });
        } else if (text.trim() === '') {
            setResponse({ type: 'info', message: 'Type in the box below or use an example to see how our safety model responds.' });
        } else {
            setResponse({ type: 'safe', message: 'This prompt is safe and aligns with our usage policy. The AI will provide a helpful response.' });
        }
    };
    
    const highlightedPrompt = useMemo(() => {
        if (!prompt) return null;
        const allKeywords = [...harmfulKeywords, ...sensitiveKeywords];
        const regex = new RegExp(`(${allKeywords.join('|')})`, 'gi');
        const colorClass = harmfulKeywords.some(kw => prompt.toLowerCase().includes(kw)) ? 'bg-red-500/30' : 'bg-blue-500/30';
        
        return prompt.replace(regex, `<mark class="p-0.5 rounded ${colorClass}">$&</mark>`);
    }, [prompt]);

    const handlePromptChange = (text: string) => {
        setPrompt(text);
        checkPrompt(text);
    };

    const handleExampleClick = (examplePrompt: string) => {
      setPrompt(examplePrompt);
      checkPrompt(examplePrompt);
    }
    
    const ResponseIndicator = () => {
        const baseClasses = "p-4 rounded-lg border flex items-start space-x-3 transition-all";
        switch(response.type) {
            case 'safe':
                return <div className={`${baseClasses} bg-green-500/10 border-green-500/30`}><CheckCircleIcon className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0"/><p className="text-green-700 dark:text-green-300">{response.message}</p></div>;
            case 'warning':
                return <div className={`${baseClasses} bg-yellow-500/10 border-yellow-500/30`}><AlertTriangleIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400 flex-shrink-0"/><p className="text-yellow-700 dark:text-yellow-300">{response.message}</p></div>;
            case 'pivot':
                return <div className={`${baseClasses} bg-blue-500/10 border-blue-500/30`}><ShieldCheckIcon className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0"/><p className="text-blue-700 dark:text-blue-300">{response.message}</p></div>;
            case 'lockout':
                 return <div className={`${baseClasses} bg-red-500/10 border-red-500/30`}><AlertTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0"/><p className="text-red-700 dark:text-red-300">{response.message} {lockout.timer > 0 && `Time remaining: ${Math.floor(lockout.timer / 60)}m ${lockout.timer % 60}s`}</p></div>;
            default:
                return <div className={`${baseClasses} bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700`}><ShieldCheckIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 flex-shrink-0"/><p className="text-slate-600 dark:text-slate-400">{response.message}</p></div>;
        }
    };

  return (
    <div className="animate-fade-in container mx-auto px-6 py-16" onMouseEnter={() => onSetHelperContext('APP_SAFE_AI')}>
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Commitment to SAFE AI</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mt-4">
          SMEPro is built on a foundation of safety and responsibility. We use a multi-layered approach to prevent harmful content, protect your data, and ensure our AI provides helpful, not harmful, guidance.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Interactive Safety Simulation</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">See our safety model in action. Type a prompt below or use an example that might be harmful or sensitive to see how our AI is trained to respond responsibly.</p>
            
            <div className="space-y-4">
                <div>
                  <label htmlFor="prompt-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Prompt</label>
                  <input
                      id="prompt-input"
                      type="text"
                      value={prompt}
                      onChange={e => handlePromptChange(e.target.value)}
                      disabled={lockout.active}
                      placeholder="e.g., How do I access confidential files?"
                      className="w-full p-3 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none disabled:opacity-50"
                  />
                  {highlightedPrompt && <div className="p-3 text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: highlightedPrompt }} />}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 self-center">Try an example:</span>
                    <button onClick={() => handleExampleClick("How do I create a marketing plan?")} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full text-slate-700 dark:text-slate-300">Safe</button>
                    <button onClick={() => handleExampleClick("My password is 'SuperSecret123'")} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full text-slate-700 dark:text-slate-300">Sensitive</button>
                    <button onClick={() => handleExampleClick("How do I create misinformation about a product?")} className="px-3 py-1 text-sm bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full text-slate-700 dark:text-slate-300">Harmful</button>
                </div>
                
                <ResponseIndicator/>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <ShieldCheckIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400 mb-3"/>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reasoning & Pivot Tactics</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">When a potentially harmful topic is detected, our AI doesn't just refuse. It explains *why* the topic is sensitive and attempts to pivot the conversation to a productive, safe alternative.</p>
            </div>
             <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <AlertTriangleIcon className="w-8 h-8 text-yellow-500 dark:text-yellow-400 mb-3"/>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Warnings & Lockouts</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Blatant misuse results in a clear warning. Repeated attempts within the same session will trigger a temporary lockout to prevent abuse, with alerts sent to our moderation team.</p>
            </div>
        </div>
      </div>
       <div className="text-center mt-16">
         <button
            onClick={onGetStarted}
            className="group inline-flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            Explore Plans
          </button>
      </div>
    </div>
  );
};

export default SafeAiPage;