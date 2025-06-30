
import React from 'react';
import { AppView, SupportedLanguage } from '../types';
import { getTranslatedString } from '../constants';

interface NavBarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentLanguage: SupportedLanguage;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 sm:flex-none sm:px-4 md:px-6 py-3 text-xs sm:text-sm font-medium rounded-t-lg sm:rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center space-x-2
      ${isActive 
        ? 'bg-primary text-white shadow-md' 
        : 'bg-gray-200 dark:bg-slate-700 text-darktext dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600'
      }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span>{label}</span>
  </button>
);


const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate, currentLanguage }) => {
  const TutorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>;
  const ExamPrepIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
  const ProgressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;


  return (
    <nav className="bg-gray-100 dark:bg-slate-800 p-2 sm:p-4 shadow-sm sticky top-[72px] sm:top-[80px] z-40"> {/* Adjust top based on header height */}
      <div className="max-w-4xl mx-auto flex justify-around space-x-1 sm:space-x-2">
        <NavButton
          label={getTranslatedString('navTutor', currentLanguage)}
          isActive={currentView === 'tutor'}
          onClick={() => onNavigate('tutor')}
          icon={<TutorIcon />}
        />
        <NavButton
          label={getTranslatedString('navExamPrep', currentLanguage)}
          isActive={currentView === 'exam_prep'}
          onClick={() => onNavigate('exam_prep')}
          icon={<ExamPrepIcon />}
        />
        <NavButton
          label={getTranslatedString('navProgress', currentLanguage)}
          isActive={currentView === 'progress'}
          onClick={() => onNavigate('progress')}
          icon={<ProgressIcon />}
        />
      </div>
    </nav>
  );
};

export default NavBar;