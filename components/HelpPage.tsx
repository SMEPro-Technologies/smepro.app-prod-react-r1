import React, { useState, useMemo } from 'react';
import { 
    CloseIcon, 
    ChevronDownIcon, 
    SmeProLogo, 
    WandIcon, 
    InteractionModeIcon,
    VaultIcon,
    WorkshopModeIcon,
    AddSmeIcon,
    SafetyIcon,
    SMEBuilderIcon,
    QuestionMarkCircleIcon,
    SearchIcon
} from './icons';

interface HelpPageProps {
  onClose: () => void;
}

const helpTopics = [
    {
        icon: <SmeProLogo className="w-6 h-6" />,
        title: "Selecting Your SME",
        content: "SMEPro's power comes from specialization. On the selection screen, you choose an expert tailored to your needs. For 'Solo' plans, this involves picking a creative or professional field. For 'Business' plans, you select a specific industry and operating segment. This ensures your conversation is with a highly-focused AI."
    },
    {
        icon: <WandIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "The Chat Interface",
        content: "The chat is your main workspace. You can control the AI's response style using the 'Wand' icon to get anything from a 'Quick Insight' to a detailed 'Solution'. The panel on the right shows your active and suggested experts."
    },
    {
        icon: <AddSmeIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "Multi-SME Collaboration",
        content: "If a conversation moves outside your current expert's scope, they will acknowledge it and suggest new experts in the right-hand panel. Simply click the '+' button to add a new SME to the session for a multi-faceted conversation."
    },
    {
        icon: <InteractionModeIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "Interactive Action Mode",
        content: "Toggle this mode using the 'magic wand' icon in the header. When active, AI responses become interactive. You can click on **bolded text** for deeper insights, select text to highlight it with different colors, or switch lists to a step-by-step view."
    },
     {
        icon: <SMEBuilderIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "Contextual Tools",
        content: "For certain messages (e.g., technical or creative topics), a special icon will appear. Clicking it reveals a toolchain to generate specific assets like a README file, technical requirements, or social media posts. These are automatically saved to your Vault as 'Builder-Ready'."
    },
    {
        icon: <WorkshopModeIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "Workshop Mode",
        content: "Launch a structured session via the icon in the chat header. Define your objective, agenda, and backstory. An AI Facilitator will provide real-time guidance and suggest relevant SMEs to invite as attendees, ensuring a highly focused and productive collaboration."
    },
    {
        icon: <VaultIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "The SMEVault & Analyzer",
        content: "Save any message to your Vault. Inside the Vault, you can select multiple items and run an AI-powered analysis. In the analysis results, you can highlight text to collect 'Subject Matter', get deeper insights on specific terms, or save snippets back to the Vault. Analyzed content can be sent to the SMEBuilder to create tangible outcomes."
    },
    {
        icon: <SafetyIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
        title: "SAFE AI",
        content: "Our commitment to safety is paramount. The SAFE AI page provides an interactive simulation showing how our models pivot away from harmful topics, issue warnings, and prevent misuse, ensuring a secure environment for your work."
    }
];


const AccordionItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; }> = ({ icon, title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-4 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                <div className="flex items-center space-x-3">
                    {icon}
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{title}</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};


const HelpPage: React.FC<HelpPageProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTopics = useMemo(() => {
    if (!searchTerm.trim()) {
      return helpTopics;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return helpTopics.filter(topic =>
      topic.title.toLowerCase().includes(lowercasedTerm) ||
      topic.content.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 animate-fade-in">
      <header className="flex-shrink-0 p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <QuestionMarkCircleIcon className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">How to Use SMEPro</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
          <CloseIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex-grow overflow-y-auto">
        <div className="p-4">
            <div className="relative mb-6">
              <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg pl-11 pr-4 py-3 focus:ring-cyan-500 focus:border-cyan-500 outline-none border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700">
            {filteredTopics.length > 0 ? (
                filteredTopics.map(topic => (
                    <AccordionItem key={topic.title} icon={topic.icon} title={topic.title}>
                        <p>{topic.content}</p>
                    </AccordionItem>
                ))
            ) : (
                <div className="text-center text-slate-500 py-10">
                    <p>No topics found for "{searchTerm}".</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;