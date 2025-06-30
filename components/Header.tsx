
import React from 'react';
import { SupportedLanguage, Theme } from '../types';
import { AVAILABLE_LANGUAGES, getTranslatedString } from '../constants';

// Icons for theme toggle
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12z" /></svg>;
const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;

interface HeaderProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  currentTheme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageChange, currentTheme, toggleTheme }) => {
  return (
    <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mr-2 text-secondary">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <h1 className="text-xl sm:text-2xl font-bold">{getTranslatedString('appName', currentLanguage)}</h1>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-secondary"
          aria-label={currentTheme === Theme.LIGHT ? getTranslatedString('toggleDarkMode', currentLanguage) : getTranslatedString('toggleLightMode', currentLanguage)}
          title={currentTheme === Theme.LIGHT ? getTranslatedString('toggleDarkMode', currentLanguage) : getTranslatedString('toggleLightMode', currentLanguage)}
        >
          {currentTheme === Theme.LIGHT ? <MoonIcon /> : <SunIcon />}
        </button>
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
          className="bg-white dark:bg-slate-700 text-primary dark:text-gray-200 p-2 rounded-md text-sm focus:ring-secondary focus:border-secondary border border-transparent dark:border-slate-600"
          aria-label="Select language"
        >
          {AVAILABLE_LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code} className="text-darktext dark:text-gray-200 bg-white dark:bg-slate-700">{lang.name}</option>
          ))}
        </select>
      </div>
    </header>
  );
};

export default Header;