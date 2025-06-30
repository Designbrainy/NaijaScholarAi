
import React, { useState, useEffect } from 'react';
import { PastQuestion, PastQuestionOption, SupportedLanguage } from '../types';
import { getTranslatedString } from '../constants';
import { getExplanationForQuestion } from '../services/aiService';
import speechService from '../services/speechService'; // Import speech service

// Icons
const SpeakIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563A.562.562 0 019 14.437V9.564z" /></svg>;


interface QuestionDisplayProps {
  question: PastQuestion;
  onAnswered: (questionId: string, isCorrect: boolean, selectedOptionId: string) => void;
  showExplanationButton?: boolean;
  currentLanguage: SupportedLanguage;
  showCorrectAnswer?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
    question, 
    onAnswered, 
    showExplanationButton = true,     
    currentLanguage,
    showCorrectAnswer = false 
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(question.explanation || null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState<string | null>(null);

  const [isSpeakingExplanation, setIsSpeakingExplanation] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when question changes
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setAiExplanation(question.explanation || null);
    setIsLoadingExplanation(false);
    setExplanationError(null);
    if (isSpeakingExplanation) { // Stop speech if question changes
        speechService.cancel();
        setIsSpeakingExplanation(false);
    }
    setSpeechError(null);
  }, [question]);

  // Effect to monitor external speech cancellations
  useEffect(() => {
    const interval = setInterval(() => {
        if (isSpeakingExplanation && !speechService.isSpeaking()) {
            setIsSpeakingExplanation(false);
        }
    }, 500); // Check every 500ms
    return () => clearInterval(interval);
  }, [isSpeakingExplanation]);


  const handleSubmit = () => {
    if (!selectedOptionId) {
      alert(getTranslatedString('selectAnOption', currentLanguage));
      return;
    }
    const correct = selectedOptionId === question.correctOptionId;
    setIsCorrect(correct);
    setIsSubmitted(true);
    onAnswered(question.id, correct, selectedOptionId);
  };

  const handleRequestExplanation = async () => {
    if (aiExplanation && !isSubmitted) { 
        return;
    }
    setIsLoadingExplanation(true);
    setExplanationError(null);
    setSpeechError(null);
    if (isSpeakingExplanation) {
        speechService.cancel();
        setIsSpeakingExplanation(false);
    }
    try {
      const explanationText = await getExplanationForQuestion(question, selectedOptionId || undefined);
      setAiExplanation(explanationText);
    } catch (error) {
      console.error("Failed to fetch explanation:", error);
      setExplanationError(getTranslatedString('errorOccurred', currentLanguage));
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const handleSpeakExplanation = async () => {
    if (!aiExplanation) return;

    if (isSpeakingExplanation) {
      speechService.cancel();
      setIsSpeakingExplanation(false);
    } else {
      setIsSpeakingExplanation(true);
      setSpeechError(null);
      try {
        await speechService.speak(aiExplanation, currentLanguage);
      } catch (err: any) {
        setSpeechError(err.message || 'Could not play audio.');
        console.error("Speech error:", err);
      } finally {
        setIsSpeakingExplanation(false); 
      }
    }
  };


  const getOptionClasses = (optionId: string) => {
    let classes = 'p-3 border rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm text-darktext dark:text-gray-200';
    if (isSubmitted || showCorrectAnswer) {
      if (optionId === question.correctOptionId) {
        classes += ' bg-green-100 dark:bg-green-700/30 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300';
      } else if (optionId === selectedOptionId && optionId !== question.correctOptionId) {
        classes += ' bg-red-100 dark:bg-red-700/30 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300';
      } else {
        classes += ' border-gray-300 dark:border-slate-600';
      }
    } else if (optionId === selectedOptionId) {
      classes += ' bg-blue-100 dark:bg-blue-700/30 border-blue-500 dark:border-blue-600 dark:text-blue-200';
    } else {
      classes += ' border-gray-300 dark:border-slate-600';
    }
    return classes;
  };


  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 shadow-md rounded-lg mb-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {getTranslatedString('subject', currentLanguage)}: {question.subject} {question.year && `(${question.year})`}
      </p>
      <p className="text-md sm:text-lg font-semibold text-darktext dark:text-gray-100 mb-4">{question.questionText}</p>
      <div className="space-y-3 mb-4">
        {question.options.map(option => (
          <div
            key={option.id}
            className={getOptionClasses(option.id)}
            onClick={() => !(isSubmitted || showCorrectAnswer) && setSelectedOptionId(option.id)}
            aria-selected={option.id === selectedOptionId}
            role="radio"
            aria-checked={option.id === selectedOptionId}
            tabIndex={isSubmitted || showCorrectAnswer ? -1 : 0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && !(isSubmitted || showCorrectAnswer) && setSelectedOptionId(option.id)}
          >
            <span className="font-medium mr-2">{option.id.toUpperCase()}.</span> {option.text}
          </div>
        ))}
      </div>

      {!showCorrectAnswer && (
        <button
            onClick={handleSubmit}
            disabled={isSubmitted || !selectedOptionId}
            className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm"
        >
            {getTranslatedString('submitAnswer', currentLanguage)}
        </button>
      )}

      {(isSubmitted || showCorrectAnswer) && isCorrect !== null && (
        <div className={`mt-3 p-2 rounded-md text-sm ${isCorrect || (showCorrectAnswer && question.correctOptionId === selectedOptionId) 
            ? 'bg-green-100 dark:bg-green-700/30 text-green-700 dark:text-green-300' 
            : 'bg-red-100 dark:bg-red-700/30 text-red-700 dark:text-red-300'}`}>
          {isCorrect || (showCorrectAnswer && question.correctOptionId === selectedOptionId) ? getTranslatedString('correct', currentLanguage) : getTranslatedString('incorrect', currentLanguage)}
        </div>
      )}

      {showExplanationButton && (isSubmitted || showCorrectAnswer || question.explanation) && (
        <div className="mt-4">
          {!aiExplanation && !isLoadingExplanation && (
            <button
              onClick={handleRequestExplanation}
              className="w-full bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            >
              {getTranslatedString('getExplanation', currentLanguage)}
            </button>
          )}
          {isLoadingExplanation && <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">{getTranslatedString('aiIsThinking', currentLanguage)}</p>}
          {explanationError && <p className="text-sm text-red-500 dark:text-red-400">{explanationError}</p>}
        </div>
      )}
       {aiExplanation && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-md border border-gray-200 dark:border-slate-600">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-semibold text-darktext dark:text-gray-200">
                {getTranslatedString('explanationFor', currentLanguage)}
            </h4>
            <button
              onClick={handleSpeakExplanation}
              className="p-1.5 text-accent dark:text-secondary hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-secondary"
              aria-label={isSpeakingExplanation ? "Stop speaking explanation" : "Speak explanation"}
              title={isSpeakingExplanation ? "Stop speaking" : "Speak explanation"}
            >
              {isSpeakingExplanation ? <StopIcon /> : <SpeakIcon />}
            </button>
          </div>
          <p className="text-sm text-mediumtext dark:text-gray-300 whitespace-pre-wrap">{aiExplanation}</p>
          {speechError && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{speechError}</p>}
        </div>
      )}
    </div>
  );
};

export default QuestionDisplay;