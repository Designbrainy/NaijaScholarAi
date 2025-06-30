
import React from 'react';
import { UserProgress, Subject, SupportedLanguage } from '../types';
import { getTranslatedString, AVAILABLE_SUBJECTS } from '../constants';

interface ProgressSectionProps {
  progress: UserProgress;
  currentLanguage: SupportedLanguage;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ progress, currentLanguage }) => {
  const totalAttempted = Object.values(progress.subjectPerformance).reduce((sum, subj) => sum + subj.questionsAttempted, 0);
  const totalCorrect = Object.values(progress.subjectPerformance).reduce((sum, subj) => sum + (subj.score * subj.questionsAttempted / 100), 0);
  const overallScore = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  // Find weakest subjects (score < 50%)
  const weakSubjects = AVAILABLE_SUBJECTS.filter(subject => {
    const perf = progress.subjectPerformance[subject];
    return perf && perf.questionsAttempted > 0 && perf.score < 50;
  });


  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-darktext dark:text-gray-100 mb-6 text-center">
        {getTranslatedString('yourProgress', currentLanguage)}
      </h2>

      {totalAttempted === 0 ? (
        <p className="text-center text-mediumtext dark:text-gray-400 text-lg p-8 bg-white dark:bg-slate-800 rounded-lg shadow">
          {getTranslatedString('noData', currentLanguage)}
        </p>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-primary dark:text-green-400 mb-2">
              {getTranslatedString('overallScore', currentLanguage)}
            </h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary dark:text-green-200 bg-green-200 dark:bg-green-700/50">
                    {overallScore}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-green-200 dark:bg-green-700/30">
                <div style={{ width: `${overallScore}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary dark:bg-green-500"></div>
              </div>
            </div>
            <p className="text-sm text-mediumtext dark:text-gray-400">
              {getTranslatedString('questionsAttempted', currentLanguage)}: {totalAttempted}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-darktext dark:text-gray-200 mb-4">Performance by Subject</h3>
            {AVAILABLE_SUBJECTS.map(subject => {
              const subjPerf = progress.subjectPerformance[subject];
              if (!subjPerf || subjPerf.questionsAttempted === 0) return null; // Don't show subjects with no attempts

              return (
                <div key={subject} className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-darktext dark:text-gray-300">{subject}</span>
                    <span className="text-sm font-medium text-primary dark:text-green-400">{subjPerf.score}%</span>
                  </div>
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200 dark:bg-green-700/30">
                    <div style={{ width: `${subjPerf.score}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary dark:bg-green-500"></div>
                  </div>
                   <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subjPerf.questionsAttempted} questions attempted</p>
                </div>
              );
            })}
          </div>

          {weakSubjects.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border-l-4 border-red-500 dark:border-red-600">
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
                {getTranslatedString('weakestSubjects', currentLanguage)}
              </h3>
              <ul className="list-disc list-inside text-mediumtext dark:text-gray-300 text-sm space-y-1">
                {weakSubjects.map(subject => (
                  <li key={subject}>{subject} ({progress.subjectPerformance[subject].score}%)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressSection;