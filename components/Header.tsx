import React from 'react';
import { CurrentView, Theme } from '../types';
import { SmeProLogo } from './icons';
import ThemeSwitcher from './ThemeSwitcher';

interface HeaderProps {
    isLoggedIn: boolean;
    onNavigate: (page: CurrentView) => void;
    currentPage: CurrentView;
    theme: Theme;
    onThemeToggle: () => void;
}

const NavLink: React.FC<{ page: CurrentView; currentPage: CurrentView; onClick: (page: CurrentView) => void; children: React.ReactNode }> = ({ page, currentPage, onClick, children }) => (
    <button 
        onClick={() => onClick(page)}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
    >
        {children}
    </button>
);

const Header: React.FC<HeaderProps> = ({ isLoggedIn, onNavigate, currentPage, theme, onThemeToggle }) => {
    
    const handleCTAClick = () => {
        if (isLoggedIn) {
            onNavigate('app');
        } else {
            onNavigate('plans');
        }
    };
    
    return (
        <header className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-6 flex justify-between items-center py-3">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('home')}>
                    <SmeProLogo className="w-9 h-9" />
                    <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-wide">SMEPro</span>
                </div>
                
                {/* Desktop Nav */}
                <div className="hidden md:flex items-center space-x-4">
                    <nav className="flex items-center space-x-1">
                        <NavLink page="home" currentPage={currentPage} onClick={onNavigate}>Home</NavLink>
                        <NavLink page="safe-ai" currentPage={currentPage} onClick={onNavigate}>SAFE AI</NavLink>
                        <NavLink page="features" currentPage={currentPage} onClick={onNavigate}>Features</NavLink>
                        <NavLink page="how-it-works" currentPage={currentPage} onClick={onNavigate}>How It Works</NavLink>
                        <NavLink page="smepro-review" currentPage={currentPage} onClick={onNavigate}>SMEPro Review</NavLink>
                        <NavLink page="plans" currentPage={currentPage} onClick={onNavigate}>Plans</NavLink>
                        <NavLink page="contact" currentPage={currentPage} onClick={onNavigate}>Contact</NavLink>
                    </nav>
                    <ThemeSwitcher theme={theme} onToggle={onThemeToggle} />
                    <button 
                        onClick={handleCTAClick}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105"
                    >
                        {isLoggedIn ? 'Go to App' : 'Get Started'}
                    </button>
                </div>
                
                {/* Mobile: Show only CTA */}
                 <div className="md:hidden flex items-center space-x-2">
                    <ThemeSwitcher theme={theme} onToggle={onThemeToggle} />
                    <button 
                        onClick={handleCTAClick}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-transform duration-300 hover:scale-105"
                    >
                        {isLoggedIn ? 'Go to App' : 'Get Started'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;