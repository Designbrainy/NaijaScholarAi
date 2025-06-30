
import React from 'react';
import { SupportedLanguage } from '../types';
import { getTranslatedString } from '../constants';

interface LiveCallSectionProps {
  currentLanguage: SupportedLanguage;
}

const LiveCallSection: React.FC<LiveCallSectionProps> = ({ currentLanguage }) => {
  const MicrophoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-primary dark:text-green-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5h0l-3.375-3.375M12 18.75v-7.5M12 11.25L9.375 8.625M12 11.25L14.625 8.625m0 0A4.5 4.5 0 109.375 4.5 4.5 4.5 0 0014.625 8.625zM4.5 12V6.75A2.25 2.25 0 016.75 4.5h10.5A2.25 2.25 0 0119.5 6.75V12a2.25 2.25 0 01-2.25 2.25h-4.5m-6 0h-2.25c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125H6.75" />
    </svg>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto text-center bg-white dark:bg-slate-800 shadow-lg rounded-lg mt-8">
      <div className="flex justify-center mb-6">
        <MicrophoneIcon />
      </div>
      <h2 className="text-2xl font-semibold text-darktext dark:text-gray-100 mb-3">
        {getTranslatedString('liveCallComingSoon', currentLanguage)}
      </h2>
      <p className="text-mediumtext dark:text-gray-300 text-md">
        {getTranslatedString('liveCallDescription', currentLanguage)}
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-6">
        (Microphone permission may be requested by your browser for this planned feature.)
      </p>
    </div>
  );
};

export default LiveCallSection;