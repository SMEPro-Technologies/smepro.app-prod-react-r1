

import React, { useState, useEffect, useCallback } from 'react';
// FIX: Imported ChatMessage and consolidated imports from './types' to resolve type errors.
import { SmeConfig, UserProfile, ChatSession, Subscription, SmeHelperContext, Theme, ChatMessage, SubscriptionPlan, CurrentView } from './types';
import { collaborationService } from './services/collaborationService';
import { backend } from './services/backend';
import { getEffectivePlan, getSubscriptionParts } from './services/backend';
import { generateId } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import FeaturesPage from './components/FeaturesPage';
import HowItWorksPage from './components/HowItWorksPage';
import PlansPage from './components/PlansPage';
import SmeSelector from './components/SmeSelector';
import ChatWindow from './components/ChatWindow';
import Vault from './components/Vault';
import Dashboard from './components/Dashboard';
import EditProfileModal from './components/modals/EditProfileModal';
import ChangeSmeModal from './components/modals/ChangeSmeModal';
import ManageCategoriesModal from './components/modals/ManageCategoriesModal';
import OnboardingTour from './components/OnboardingTour';
import SaveToVaultModal from './components/modals/SaveToVaultModal';
import SessionExplorer from './components/SessionExplorer';
import AdminLoginPage from './components/admin/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import SafeAiPage from './components/SafeAiPage';
import HelpPage from './components/HelpPage';
import { QuestionMarkCircleIcon, LightbulbIcon, SmeHelperIcon } from './components/icons';
import SmeProReviewPage from './components/SmeProReviewPage';
import SmeHelperDialog from './components/SmeHelperDialog';
import SMEWorkbench from './components/SMEWorkbench';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import AcceptableUsePage from './components/AcceptableUsePage';
import SignupModal from './components/modals/SignupModal';


const LAST_SESSION_ID_KEY = 'smeProLastSessionId';
const ONBOARDING_COMPLETE_KEY = 'smeProOnboardingComplete';

const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  
  const [currentPage, setCurrentPage] = useState<CurrentView>('home');
  
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangeSmeModalOpen, setIsChangeSmeModalOpen] = useState(false);
  const [isManageCategoriesModalOpen, setIsManageCategoriesModalOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isHelpPageOpen, setIsHelpPageOpen] = useState(false);
  
  const [vaultReloadKey, setVaultReloadKey] = useState(Date.now());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [itemToSave, setItemToSave] = useState<{ message: ChatMessage; isBuilderOutput?: boolean; } | null>(null);
  
  const [showAdminView, setShowAdminView] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);

  // SME Helper State
  const [isSmeHelperModeActive, setIsSmeHelperModeActive] = useState(false);
  const [isSmeHelperOpen, setIsSmeHelperOpen] = useState(false);
  const [smeHelperContext, setSmeHelperContext] = useState<SmeHelperContext | null>(null);

  // SME Workbench State
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState(false);
  const [workbenchContext, setWorkbenchContext] = useState<string>('');

  // Signup Modal State
  const [signupModalInfo, setSignupModalInfo] = useState<{
    plan: SubscriptionPlan;
    billingCycle: 'monthly' | 'annual';
    price: number;
    priceId: string;
  } | null>(null);

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as Theme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const handleSetSmeHelperContext = useCallback((context: SmeHelperContext) => {
    setSmeHelperContext(context);
  }, []);

  const effectivePlan = userProfile ? getEffectivePlan(userProfile.subscription) : undefined;


  useEffect(() => {
    backend.fetchUserProfile().then(profile => {
      if (profile) {
        setUserProfile(profile);
      }
      const onboardingComplete = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
      if (!onboardingComplete && !profile) {
        //setShowOnboarding(true); // Temporarily disable for easier debugging
      }
    });

    const handleHashChange = () => {
        if (window.location.hash === '#admin') {
            setShowAdminView(true);
        } else {
            setShowAdminView(false);
        }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on initial load
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadSession = useCallback(async (profile: UserProfile, sessionId?: string) => {
    const lastSessionId = sessionId || localStorage.getItem(LAST_SESSION_ID_KEY);
    if (lastSessionId) {
      const session = await collaborationService.getSession(lastSessionId, undefined, undefined, profile);
      if (session) {
        setCurrentSession(session);
      } else {
        localStorage.removeItem(LAST_SESSION_ID_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (userProfile && currentPage === 'app' && !currentSession && !justSignedUp) {
      loadSession(userProfile);
    }
    if (justSignedUp) {
      setJustSignedUp(false);
    }
  }, [userProfile, currentPage, loadSession, currentSession, justSignedUp]);

  const handleStartChat = async (smeConfig: SmeConfig) => {
    if (userProfile && effectivePlan) {
      const newSessionId = generateId();
      const newSession = await collaborationService.getSession(newSessionId, smeConfig, effectivePlan, userProfile);
      setCurrentSession(newSession);
      localStorage.setItem(LAST_SESSION_ID_KEY, newSessionId);
    }
  };

  const handleSwitchSmeConfirm = async (smeConfig: SmeConfig) => {
    if (userProfile) {
        handleStartChat(smeConfig); // This creates a new session
        setIsChangeSmeModalOpen(false);
    }
  };

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    const savedProfile = await backend.saveUserProfile(updatedProfile);
    setUserProfile(savedProfile);
    setIsEditProfileModalOpen(false);
    alert('Profile updated successfully!');
  };
  
  const handleSaveToVault = (message: ChatMessage, isBuilderOutput: boolean = false) => {
      setItemToSave({ message, isBuilderOutput });
  };
  
  const handleItemSaved = () => {
      setItemToSave(null);
      setVaultReloadKey(Date.now()); // Trigger vault refresh
      alert("Item saved to Vault!");
  };

  const handleSelectSession = (sessionId: string) => {
    if (userProfile) {
      loadSession(userProfile, sessionId);
      localStorage.setItem(LAST_SESSION_ID_KEY, sessionId);
      setIsExplorerOpen(false);
    }
  };
  
  const handleSaveTextToVault = (text: string) => {
    const message: ChatMessage = {
      role: 'user', // or model, depending on context. User seems safe.
      content: text,
      timestamp: new Date().toISOString()
    };
    setItemToSave({ message });
  };

  const handleOpenWorkbench = (analysisContent: string) => {
    setWorkbenchContext(analysisContent);
    setIsWorkbenchOpen(true);
    setIsVaultOpen(false);
  };

  const handlePlanChoice = (plan: SubscriptionPlan, billingCycle: 'monthly' | 'annual', price: number, priceId: string) => {
    setSignupModalInfo({ plan, billingCycle, price, priceId });
  };

  const handleSignupConfirm = async (
    signupData: { name: string; email: string; company: string },
    subscriptionInfoForMock: Omit<Subscription, 'id' | 'status' | 'trialStart' | 'trialEnd'>
  ) => {
    // 1. Payment is now handled inside the modal. This function is called AFTER successful payment.
    // 2. Create user profile in mock backend.
    const newUserProfile: Omit<UserProfile, 'quotas'> = {
        name: signupData.name,
        email: signupData.email,
        company: signupData.company,
        subscription: subscriptionInfoForMock as any,
    };
    const savedProfile = await backend.saveUserProfile(newUserProfile);
    setUserProfile(savedProfile);
    
    // 3. Close modal and navigate to app
    setSignupModalInfo(null);
    setJustSignedUp(true);
    setCurrentPage('app');
  };


  const handleNavigation = (page: CurrentView) => {
    setCurrentPage(page);
    if(isVaultOpen) setIsVaultOpen(false);
    if(isDashboardOpen) setIsDashboardOpen(false);
    if(isEditProfileModalOpen) setIsEditProfileModalOpen(false);

  };

  const handleGetStarted = () => {
    if (userProfile) {
      setCurrentPage('app');
    } else {
      setCurrentPage('plans');
    }
  };

  const renderContent = () => {
    if (currentPage === 'app') {
      if (!userProfile || !effectivePlan) {
        // Fallback for logged-out user trying to access app
        return <HomePage onGetStarted={handleGetStarted} onSetHelperContext={() => handleSetSmeHelperContext('APP_HOME')} />;
      }
      return (
        <main className="h-full flex flex-col" onMouseEnter={() => handleSetSmeHelperContext('CHAT_WINDOW')}>
          {currentSession ? (
            <ChatWindow 
              session={currentSession} 
              userProfile={userProfile}
              onSwitchSme={() => setIsChangeSmeModalOpen(true)}
              onShowVault={() => setIsVaultOpen(true)}
              onShowDashboard={() => setIsDashboardOpen(true)}
              onProfileEdit={() => setIsEditProfileModalOpen(true)}
              onSaveToVault={handleSaveToVault}
              onShowExplorer={() => setIsExplorerOpen(true)}
              onSetHelperContext={handleSetSmeHelperContext}
            />
          ) : (
            <SmeSelector onStartChat={handleStartChat} plan={effectivePlan} onSetHelperContext={() => handleSetSmeHelperContext('SME_SELECTOR')} />
          )}
          
          {isVaultOpen && <div className="absolute inset-0 z-30"><Vault userProfile={userProfile} onClose={() => setIsVaultOpen(false)} onManageCategories={() => setIsManageCategoriesModalOpen(true)} onSaveText={handleSaveTextToVault} onOpenWorkbench={handleOpenWorkbench} key={vaultReloadKey} onSetHelperContext={handleSetSmeHelperContext}/></div>}
          {isDashboardOpen && <div className="absolute inset-0 z-30"><Dashboard userProfile={userProfile} onClose={() => setIsDashboardOpen(false)} onNavigate={handleNavigation} onSetHelperContext={handleSetSmeHelperContext}/></div>}

          {isEditProfileModalOpen && userProfile && <EditProfileModal currentUserProfile={userProfile} onSave={handleProfileSave} onClose={() => setIsEditProfileModalOpen(false)} onSyncComplete={() => alert('Connectors synced!')} onNavigate={handleNavigation} />}
          {isChangeSmeModalOpen && userProfile && effectivePlan && <ChangeSmeModal effectivePlan={effectivePlan} onClose={() => setIsChangeSmeModalOpen(false)} onConfirm={handleSwitchSmeConfirm} />}
          {isManageCategoriesModalOpen && <ManageCategoriesModal onClose={() => setIsManageCategoriesModalOpen(false)} />}
          {isExplorerOpen && currentSession && <SessionExplorer currentSessionId={currentSession.sessionId} onSelectSession={handleSelectSession} onClose={() => setIsExplorerOpen(false)} />}
          {itemToSave && <SaveToVaultModal message={itemToSave.message} isBuilderOutput={itemToSave.isBuilderOutput} onClose={() => setItemToSave(null)} onSave={handleItemSaved} />}
          {isWorkbenchOpen && <SMEWorkbench initialContext={workbenchContext} onClose={() => setIsWorkbenchOpen(false)} onSetHelperContext={handleSetSmeHelperContext} />}
        </main>
      );
    }
    
    switch(currentPage) {
      case 'home': return <HomePage onGetStarted={handleGetStarted} onSetHelperContext={() => handleSetSmeHelperContext('APP_HOME')} />;
      case 'features': return <FeaturesPage onGetStarted={handleGetStarted} onSetHelperContext={() => handleSetSmeHelperContext('APP_FEATURES')} />;
      case 'how-it-works': return <HowItWorksPage onGetStarted={handleGetStarted} onSetHelperContext={() => handleSetSmeHelperContext('APP_HOW_IT_WORKS')} />;
      case 'plans': return <PlansPage onSetHelperContext={() => handleSetSmeHelperContext('APP_PLANS')} onChoosePlan={handlePlanChoice} />;
      case 'safe-ai': return <SafeAiPage onGetStarted={handleGetStarted} onSetHelperContext={() => handleSetSmeHelperContext('APP_SAFE_AI')} />;
      case 'smepro-review': return <SmeProReviewPage onGetStarted={handleGetStarted} />;
      case 'contact': return <ContactPage onSetHelperContext={handleSetSmeHelperContext} />;
      case 'privacy-policy': return <PrivacyPolicyPage onSetHelperContext={handleSetSmeHelperContext} />;
      case 'terms-of-service': return <TermsOfServicePage onSetHelperContext={handleSetSmeHelperContext} />;
      case 'acceptable-use': return <AcceptableUsePage onSetHelperContext={handleSetSmeHelperContext} />;
      default: return <HomePage onGetStarted={handleGetStarted} onSetHelperContext={() => handleSetSmeHelperContext('APP_HOME')} />;
    }
  };

  if (showAdminView) {
    if (!isAdminLoggedIn) {
        return <AdminLoginPage onLogin={setIsAdminLoggedIn} />;
    }
    return <AdminDashboard onLogout={() => { setIsAdminLoggedIn(false); window.location.hash = ''; }} />;
  }

  const showHeader = !!userProfile || currentPage !== 'home';
  const isFooterVisible = ['home', 'safe-ai', 'features', 'how-it-works', 'smepro-review', 'plans', 'contact', 'privacy-policy', 'terms-of-service', 'acceptable-use'].includes(currentPage);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-300 flex flex-col">
      {showHeader && (
        <Header 
          isLoggedIn={!!userProfile}
          onNavigate={handleNavigation}
          currentPage={currentPage}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />
      )}
      <div className="flex-grow">
        {renderContent()}
      </div>

      {isFooterVisible && <Footer onNavigate={handleNavigation} />}

      {showOnboarding && <OnboardingTour onFinish={() => { setShowOnboarding(false); localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true'); }} />}
      
      {signupModalInfo && (
        <SignupModal
          planInfo={signupModalInfo}
          onConfirm={handleSignupConfirm}
          onClose={() => setSignupModalInfo(null)}
        />
      )}

      {/* SME Helper UI */}
      <div className="fixed bottom-6 left-6 z-40 flex items-center space-x-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-2 rounded-full border border-slate-200 dark:border-slate-700">
        <label htmlFor="sme-helper-toggle" className="flex items-center cursor-pointer">
          <span className="text-sm font-semibold text-slate-800 dark:text-white mr-2">SMEHelper</span>
          <div className="relative">
            <input id="sme-helper-toggle" type="checkbox" className="sr-only" checked={isSmeHelperModeActive} onChange={() => setIsSmeHelperModeActive(prev => !prev)} />
            <div className="block bg-slate-300 dark:bg-slate-600 w-10 h-5 rounded-full"></div>
            <div className={`dot absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isSmeHelperModeActive ? 'translate-x-5 bg-cyan-400' : 'dark:bg-slate-400'}`}></div>
          </div>
        </label>
      </div>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-2">
         {isSmeHelperModeActive && (
          <button 
              onClick={() => setIsSmeHelperOpen(true)}
              className="p-3 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-transform hover:scale-110 animate-fade-in"
              title="Get Help"
          >
              <SmeHelperIcon className="w-8 h-8"/>
          </button>
        )}
        <button 
            onClick={() => setIsHelpPageOpen(true)}
            className="p-3 bg-cyan-500 text-white rounded-full shadow-lg hover:bg-cyan-600 transition-transform hover:scale-110"
            title="Help & Documentation"
        >
            <QuestionMarkCircleIcon className="w-8 h-8"/>
        </button>
      </div>
      
      {isSmeHelperOpen && (
        <SmeHelperDialog context={smeHelperContext} onClose={() => setIsSmeHelperOpen(false)} />
      )}

      {isHelpPageOpen && <div className="absolute inset-0 z-50"><HelpPage onClose={() => setIsHelpPageOpen(false)} /></div>}
    </div>
  );
};

export default App;
