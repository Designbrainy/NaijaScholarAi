
import React, { useState, useEffect, useCallback } from 'react';
import { PastQuestion, Subject, SupportedLanguage, UserProgress } from '../types';
import { SAMPLE_PAST_QUESTIONS, AVAILABLE_SUBJECTS, getTranslatedString } from '../constants';
import QuestionDisplay from './QuestionDisplay';
import { generateMockTestQuestions } from '../services/aiService';

interface ExamPrepSectionProps {
  currentLanguage: SupportedLanguage;
  updateUserProgress: (subject: Subject, isCorrect: boolean) => void;
}

const ExamPrepSection: React.FC<ExamPrepSectionProps> = ({ currentLanguage, updateUserProgress }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject>(AVAILABLE_SUBJECTS[0]);
  const [questions, setQuestions] = useState<PastQuestion[]>([]);
  const [isLoadingMockTest, setIsLoadingMockTest] = useState(false);
  const [mockTestError, setMockTestError] = useState<string | null>(null);
  const [isMockTestMode, setIsMockTestMode] = useState(false); // To distinguish between sample and AI generated
  const [userAnswers, setUserAnswers] = useState<Record<string, {isCorrect: boolean, selectedOptionId: string}>>({});


  const loadQuestions = useCallback(() => {
    setIsMockTestMode(false);
    setQuestions(SAMPLE_PAST_QUESTIONS.filter(q => q.subject === selectedSubject));
    setUserAnswers({});
  }, [selectedSubject]);

  useEffect(() => {
    loadQuestions();
  }, [selectedSubject, loadQuestions]);

  const handleAnswer = (questionId: string, isCorrect: boolean, selectedOptionId: string) => {
    setUserAnswers(prev => ({...prev, [questionId]: {isCorrect, selectedOptionId}}));
    updateUserProgress(selectedSubject, isCorrect);
  };
  
  const handleGenerateMockTest = async () => {
    setIsLoadingMockTest(true);
    setMockTestError(null);
    setIsMockTestMode(true);
    setUserAnswers({});
    try {
      const mockQuestions = await generateMockTestQuestions(selectedSubject, 5); // Generate 5 questions
      setQuestions(mockQuestions);
    } catch (error) {
      console.error("Failed to generate mock test:", error);
      setMockTestError(getTranslatedString('errorOccurred', currentLanguage));
      setQuestions([]); // Clear questions on error
    } finally {
      setIsLoadingMockTest(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="mb-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
        <label htmlFor="subject-select" className="block text-sm font-medium text-darktext dark:text-gray-300 mb-1">
          {getTranslatedString('selectSubject', currentLanguage)}
        </label>
        <select
          id="subject-select"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value as Subject)}
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm bg-white dark:bg-slate-700 text-darktext dark:text-gray-200"
        >
          {AVAILABLE_SUBJECTS.map(subject => (
            <option key={subject} value={subject} className="bg-white dark:bg-slate-700 text-darktext dark:text-gray-200">{subject}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerateMockTest}
        disabled={isLoadingMockTest}
        className="w-full mb-6 bg-secondary text-accent px-4 py-3 rounded-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-secondary font-semibold text-sm flex items-center justify-center disabled:opacity-60"
      >
        {isLoadingMockTest ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {getTranslatedString('aiIsThinking', currentLanguage)}
          </>
        ) : (
          getTranslatedString('generateMockTest', currentLanguage)
        )}
      </button>

      {mockTestError && <p className="text-red-500 dark:text-red-400 text-center mb-4">{mockTestError}</p>}
      
      {!isLoadingMockTest && questions.length === 0 && !mockTestError && (
         <p className="text-center text-mediumtext dark:text-gray-400 mt-8">
            {isMockTestMode ? getTranslatedString('noData', currentLanguage) : `No sample questions for ${selectedSubject}. Try generating a mock test!`}
        </p>
      )}

      {questions.map(q => (
        <QuestionDisplay
          key={q.id}
          question={q}
          onAnswered={handleAnswer}
          currentLanguage={currentLanguage}
          showCorrectAnswer={isMockTestMode && !!userAnswers[q.id]} // For mock tests, show answer after submission
          showExplanationButton={true}
        />
      ))}
       {!isMockTestMode && questions.length > 0 && (
         <button 
            onClick={loadQuestions} // effectively a reset for sample questions view
            className="mt-4 w-full bg-gray-200 dark:bg-slate-700 text-darktext dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 text-sm"
        >
            View Sample Questions for {selectedSubject} Again
        </button>
       )}
    </div>
  );
};

export default ExamPrepSection;