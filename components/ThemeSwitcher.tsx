import React from 'react';
// FIX: Correctly import the Theme type.
import { Theme } from '../types';
// FIX: Correctly import the SunIcon and MoonIcon components.
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
  theme: Theme;
  onToggle: () => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeSwitcher;