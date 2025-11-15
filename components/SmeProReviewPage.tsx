import React, { useState, useMemo } from 'react';
import { AiPlatform } from '../types';
import { geminiService } from '../services/geminiService';
import { LoadingIcon, ScaleIcon } from './icons';

interface SmeProReviewPageProps {
  onGetStarted: () => void;
}

const aiPlatforms: AiPlatform[] = [
  { name: 'OpenAI GPT-4', category: 'General Purpose', claimToFame: 'State-of-the-art large language model for a wide variety of text generation and understanding tasks.' },
  { name: 'GitHub Copilot', category: 'Code Assistant', claimToFame: 'AI pair programmer that offers autocomplete-style suggestions as you code.' },
  { name: 'Midjourney', category: 'Image Generation', claimToFame: 'Generates high-quality, artistic images from natural language descriptions.' },
  { name: 'Claude 3', category: 'General Purpose', claimToFame: 'A family of models with a focus on safety, accuracy, and large context windows.' },
  { name: 'Perplexity AI', category: 'Search & Answer', claimToFame: 'An "answer engine" that provides direct answers to questions with citations.' },
  { name: 'Character.AI', category: 'Conversational AI', claimToFame: 'Create and chat with personalized AI characters.' },
  { name: 'RunwayML', category: 'Video Generation', claimToFame: 'An applied AI research company building the next generation of creative tools (text-to-video).' },
  { name: 'Jasper', category: 'Marketing Copy', claimToFame: 'AI-powered content platform for writing marketing copy, blog posts, and more.' },
  { name: 'Poe by Quora', category: 'Multi-Bot Chat', claimToFame: 'A single platform to access and chat with a variety of different AI models.' },
  { name: 'Llama 3', category: 'Open Source', claimToFame: 'A family of open-source large language models from Meta.' },
  { name: 'Google Gemini', category: 'General Purpose', claimToFame: 'Google\'s powerful multimodal AI model, deeply integrated with its ecosystem.' },
  { name: 'Hugging Face', category: 'Open Source', claimToFame: 'A platform and community providing open-source models, datasets, and tools.' },
  { name: 'Synthesia', category: 'Video Generation', claimToFame: 'AI video generation platform for creating professional videos with AI avatars.' },
  { name: 'Copy.ai', category: 'Marketing Copy', claimToFame: 'AI-powered copywriter for generating marketing content.' },
  { name: 'Grok', category: 'Conversational AI', claimToFame: 'An AI from xAI with a rebellious streak and real-time knowledge of the world via the X platform.' },
  { name: 'Stable Diffusion', category: 'Image Generation', claimToFame: 'A popular open-source text-to-image model.' },
  { name: 'Writesonic', category: 'Marketing Copy', claimToFame: 'An AI writing assistant for creating SEO-friendly content.' },
  { name: 'Notion AI', category: 'Productivity', claimToFame: 'AI features integrated directly into the Notion workspace for summarizing, writing, and brainstorming.' },
  { name: 'Tabnine', category: 'Code Assistant', claimToFame: 'AI assistant for software developers, providing code completion in IDEs.' },
  { name: 'DeepL', category: 'Translation', claimToFame: 'High-quality AI-powered language translation service.' },
  { name: 'Fireflies.ai', category: 'Productivity', claimToFame: 'AI meeting assistant that transcribes, summarizes, and analyzes voice conversations.' },
  { name: 'Canva', category: 'Design', claimToFame: 'Integrated AI features (Magic Studio) for generating and editing designs, images, and text.' },
  { name: 'DALL-E 3', category: 'Image Generation', claimToFame: 'OpenAI\'s image generation model, known for its integration with ChatGPT.' },
  { name: 'Adept', category: 'AI Agent', claimToFame: 'Building general intelligence by enabling humans and computers to work together creatively.' },
  { name: 'Inflection Pi', category: 'Conversational AI', claimToFame: 'A personal AI designed to be a kind and supportive companion.' },
  { name: 'Glean', category: 'Enterprise Search', claimToFame: 'AI-powered work assistant that searches across all your company\'s apps.' },
  { name: 'Replit AI', category: 'Code Assistant', claimToFame: 'AI-powered coding features within the Replit online IDE.' },
  { name: 'Bard (now Gemini)', category: 'General Purpose', claimToFame: 'Google\'s conversational AI, now powered by the Gemini family of models.' },
  { name: 'Otter.ai', category: 'Productivity', claimToFame: 'AI-powered transcription service for meetings and interviews.' },
  { name: 'SMEPro', category: 'Collaborative Intelligence', claimToFame: 'A collaborative AI operating system with a multi-expert workflow to turn conversations into tangible outcomes.' }
];

const categories = [...new Set(aiPlatforms.map(p => p.category))].sort();

const SmeProReviewPage: React.FC<SmeProReviewPageProps> = ({ onGetStarted }) => {
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
    const [analysisResult, setAnalysisResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const filteredPlatforms = useMemo(() => {
        if (selectedCategories.size === 0) {
            return aiPlatforms;
        }
        return aiPlatforms.filter(p => selectedCategories.has(p.category));
    }, [selectedCategories]);

    const handleCategoryToggle = (category: string) => {
        const newSelection = new Set(selectedCategories);
        if (newSelection.has(category)) {
            newSelection.delete(category);
        } else {
            newSelection.add(category);
        }
        setSelectedCategories(newSelection);
        setSelectedPlatforms(new Set()); // Reset platform selection on filter change
    };
    
    const handlePlatformToggle = (platformName: string) => {
        if (platformName === 'SMEPro') return; // Cannot unselect SMEPro
        const newSelection = new Set(selectedPlatforms);
        if (newSelection.has(platformName)) {
            newSelection.delete(platformName);
        } else {
            newSelection.add(platformName);
        }
        setSelectedPlatforms(newSelection);
    };

    const handleCompare = async () => {
        if (selectedPlatforms.size === 0) {
            alert('Please select at least one platform to compare with SMEPro.');
            return;
        }
        setIsLoading(true);
        setAnalysisResult('');
        
        const platformsToCompare = aiPlatforms.filter(p => selectedPlatforms.has(p.name));
        const result = await geminiService.generateCompetitiveAnalysis(platformsToCompare);
        
        setAnalysisResult(window.marked.parse(result));
        setIsLoading(false);
    };

    return (
        <div className="animate-fade-in container mx-auto px-6 py-16 text-slate-900 dark:text-white">
            <div className="text-center mb-12 max-w-4xl mx-auto">
                <ScaleIcon className="w-16 h-16 text-cyan-500 dark:text-cyan-400 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold">SMEPro vs. The AI Market</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-4">
                    Use our interactive analysis tool to compare SMEPro's unique collaborative intelligence approach against the top AI platforms worldwide. Filter by category, select competitors, and get an unbiased, AI-generated review.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Filters and Selection */}
                <div className="lg:col-span-1 space-y-6">
                    <div>
                        <h3 className="text-xl font-bold mb-3">1. Filter by AI Category</h3>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryToggle(cat)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${selectedCategories.has(cat) ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-xl font-bold mb-3">2. Select Platforms to Compare</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {filteredPlatforms.map(p => (
                                <label key={p.name} className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${selectedPlatforms.has(p.name) || p.name === 'SMEPro' ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPlatforms.has(p.name) || p.name === 'SMEPro'}
                                        onChange={() => handlePlatformToggle(p.name)}
                                        disabled={p.name === 'SMEPro'}
                                        className="h-4 w-4 rounded border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="ml-3 font-semibold">{p.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                         <button
                            onClick={handleCompare}
                            disabled={isLoading || selectedPlatforms.size === 0}
                            className="w-full flex items-center justify-center space-x-2 py-3 font-bold rounded-lg transition-colors bg-cyan-500 hover:bg-cyan-600 text-white disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                           <ScaleIcon className="w-5 h-5"/>
                           <span>Compare ({selectedPlatforms.size}) Selected</span>
                        </button>
                    </div>
                </div>

                {/* Analysis Result */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 p-8 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[500px]">
                    <h2 className="text-2xl font-bold mb-4">Comparative Analysis</h2>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                            <LoadingIcon className="w-8 h-8 mb-4" />
                            <p>Generating unbiased analysis...</p>
                        </div>
                    )}
                    {!isLoading && !analysisResult && (
                        <div className="flex items-center justify-center h-full text-center text-slate-500">
                           <p>Your AI-generated competitive analysis will appear here.</p>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="prose dark:prose-invert max-w-none prose-table:w-full prose-th:text-left prose-td:py-2 prose-td:align-top" dangerouslySetInnerHTML={{ __html: analysisResult }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmeProReviewPage;