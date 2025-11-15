import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserProfile, VaultItem, SmeHelperContext } from '../types';
import { backend } from '../services/backend';
import { geminiService } from '../services/geminiService';
import { generateId } from '../constants';
import { VaultIcon, CloseIcon, PlusIcon, SearchIcon, AnalyzeIcon, LoadingIcon, DeleteIcon, SMEBuilderIcon, CollaborationIcon } from './icons';
import HighlightToolbar from './HighlightToolbar';
import AnalysisResultModal from './modals/AnalysisResultModal';

interface VaultProps {
  userProfile: UserProfile;
  onClose: () => void;
  onManageCategories: () => void;
  onSaveText: (text: string) => void;
  onOpenWorkbench: (analysisContent: string) => void;
  onSetHelperContext: (context: SmeHelperContext) => void;
}

const analysisPrompts = [
    "Synthesize these items into a cohesive strategy.",
    "Identify key themes, potential synergies, and actionable strategies.",
    "Create a concise, executive-level summary and a bulleted list of recommendations.",
    "Find contradictions or gaps in the provided information.",
    "Outline a project plan based on these items.",
    "Concept Review: Synthesize items into a cohesive, actionable concept and strategic direction."
];

const responseTypes = [
    "Expert Analysis",
    "Solution to a Problem",
    "Step by Step Plan",
    "Cited Response",
    "Vault View Summary"
];

const Vault: React.FC<VaultProps> = ({ userProfile, onClose, onManageCategories, onSaveText, onOpenWorkbench, onSetHelperContext }) => {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [analysisHtmlContent, setAnalysisHtmlContent] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState(analysisPrompts[0]);
  const [responseFormat, setResponseFormat] = useState(responseTypes[0]);
  const [showBuilderPrompt, setShowBuilderPrompt] = useState(false);
  const [analysisSelection, setAnalysisSelection] = useState<{ top: number; left: number; text: string } | null>(null);
  const [showAnalysisResultModal, setShowAnalysisResultModal] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{ sourceText: string; analysisType: 'red' | 'blue' | 'green'; analysisResult: string } | null>(null);
  
  const analysisContentRef = useRef<HTMLDivElement>(null);
  const vaultContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const loadVault = async () => {
      const [vaultItems, vaultCategories] = await Promise.all([
        backend.fetchVaultItems(),
        backend.fetchCategories()
      ]);
      setItems(vaultItems);
      setCategories(vaultCategories);
    };
    loadVault();
  }, []);
  
  // Close popover on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (analysisContentRef.current && !analysisContentRef.current.contains(event.target as Node)) {
              if (window.getSelection()?.isCollapsed) {
                setAnalysisSelection(null);
              }
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const inCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const inSearch = searchTerm === '' || 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.content.toLowerCase().includes(searchTerm.toLowerCase());
      return inCategory && inSearch;
    });
  }, [items, selectedCategory, searchTerm]);

  const handleSelectItem = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
    setShowBuilderPrompt(false);
  };
  
  const handleAnalyze = async () => {
      if(selectedItems.size < 2) {
          alert("Please select at least 2 items to analyze.");
          return;
      }
      setIsAnalyzing(true);
      setAnalysisResult('');
      setAnalysisHtmlContent('');
      setShowBuilderPrompt(false);
      setAnalysisSelection(null);
      
      const itemsToAnalyze = items.filter(item => selectedItems.has(item.id));
      const isConceptReview = promptTemplate.startsWith("Concept Review:");
      const finalResponseFormat = isConceptReview ? "Project Brief" : responseFormat;

      const result = await geminiService.analyzeVaultItems(itemsToAnalyze, promptTemplate, finalResponseFormat);
      
      setAnalysisResult(result);
      setAnalysisHtmlContent(window.marked.parse(result));
      setIsAnalyzing(false);
      setShowBuilderPrompt(true);
  };
  
  const handleMouseUpInAnalyzer = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && selection.toString().trim().length > 5) {
          const range = selection.getRangeAt(0);
          if (analysisContentRef.current?.contains(range.commonAncestorContainer)) {
              const rect = range.getBoundingClientRect();
              setAnalysisSelection({
                  top: rect.top,
                  left: rect.left + rect.width / 2,
                  text: selection.toString(),
              });
              return;
          }
      }
      if (analysisSelection) {
        setTimeout(() => setAnalysisSelection(null), 100);
      }
  };
  
  const handleTriggerAnalysis = async (type: 'red' | 'blue' | 'green') => {
    if (!analysisSelection) return;

    const { text } = analysisSelection;
    setAnalysisSelection(null);
    setIsAnalyzing(true);

    const result = await geminiService.analyzeHighlightedText(text, analysisResult, type);
    
    setCurrentAnalysis({
        sourceText: text,
        analysisType: type,
        analysisResult: result,
    });
    setShowAnalysisResultModal(true);
    setIsAnalyzing(false);
  };

  const handleGoToWorkbench = () => {
    if (analysisResult) {
      onOpenWorkbench(analysisResult);
    }
  };

  const Select: React.FC<{label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]}> = ({label, value, onChange, options}) => (
    <div>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
        <select
          value={value}
          onChange={onChange}
          className="w-full p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        >
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
  );

  const isConceptReview = promptTemplate.startsWith("Concept Review:");


  return (
    <div ref={vaultContentRef} className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 animate-fade-in" onMouseEnter={() => onSetHelperContext('VAULT')}>
      <header className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <VaultIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">SMEPro Vault</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        {/* Items List */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-700" onMouseEnter={() => onSetHelperContext('VAULT_ITEMS')}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
            <div className="relative">
              <SearchIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search vault..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-slate-900 dark:text-white" />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button onClick={() => setSelectedCategory('All')} className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${selectedCategory === 'All' ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>All</button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${selectedCategory === cat ? 'bg-cyan-500 text-white' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'}`}>{cat}</button>
              ))}
               <button onClick={onManageCategories} className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"><PlusIcon className="w-4 h-4"/></button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-2">
            {filteredItems.map(item => (
              <div key={item.id} onClick={() => handleSelectItem(item.id)} className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors border ${selectedItems.has(item.id) ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate pr-2">{item.title}</h4>
                  {item.builderReady && <span title="Builder-Ready Output"><SMEBuilderIcon className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0"/></span>}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">{item.content}</p>
                <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Analysis Workbench */}
        <div className="w-full md:w-1/2 flex flex-col" onMouseEnter={() => onSetHelperContext('VAULT_ANALYZER')}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 space-y-4">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analysis Workbench</h3>
             <Select label="Analysis Mode" value={promptTemplate} onChange={e => setPromptTemplate(e.target.value)} options={analysisPrompts} />
             {!isConceptReview ? (
                <Select label="Response Type" value={responseFormat} onChange={e => setResponseFormat(e.target.value)} options={responseTypes} />
             ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                    Concept Review mode generates a foundational project brief.
                </p>
             )}
          </div>
          <div className="flex-grow overflow-y-auto p-4 relative" onMouseUp={handleMouseUpInAnalyzer}>
            {isAnalyzing && <div className="flex justify-center items-center h-full"><LoadingIcon className="w-8 h-8"/></div>}
            {analysisHtmlContent && <div ref={analysisContentRef} className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{__html: analysisHtmlContent}}></div>}
            {!isAnalyzing && !analysisResult && <div className="text-center text-slate-400 dark:text-slate-500 py-10">Select 2 or more items and click Analyze.</div>}
            {analysisSelection && (
                <HighlightToolbar 
                    top={analysisSelection.top} 
                    left={analysisSelection.left} 
                    onAnalyze={handleTriggerAnalysis}
                />
            )}
          </div>
          {showBuilderPrompt && !isAnalyzing && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <button onClick={handleGoToWorkbench} className="w-full flex justify-center items-center space-x-2 py-3 px-4 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded-lg transition-colors">
                    <SMEBuilderIcon className="w-5 h-5"/>
                    <span>Continue in SMEBuilder</span>
                </button>
            </div>
          )}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <button onClick={handleAnalyze} disabled={selectedItems.size < 2 || isAnalyzing} className="w-full flex justify-center items-center space-x-2 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
              <AnalyzeIcon className="w-5 h-5"/>
              <span>Analyze ({selectedItems.size}) Items</span>
            </button>
          </div>
        </div>
      </div>

      {showAnalysisResultModal && currentAnalysis && (
        <AnalysisResultModal
          {...currentAnalysis}
          onClose={() => setShowAnalysisResultModal(false)}
        />
      )}
    </div>
  );
};

export default Vault;