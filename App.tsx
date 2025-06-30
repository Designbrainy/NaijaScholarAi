
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NavBar from './components/NavBar';
import TutorSection from './components/TutorSection';
import ExamPrepSection from './components/ExamPrepSection';
import ProgressSection from './components/ProgressSection';
import { AppView, SupportedLanguage, UserProgress, Subject, Theme } from './types';
import { DEFAULT_LANGUAGE, AVAILABLE_SUBJECTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('tutor');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('naijaScholarTheme');
    if (savedTheme) {
      return savedTheme as Theme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.DARK : Theme.LIGHT;
  });

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const savedProgress = localStorage.getItem('naijaScholarProgress');
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
    const initialProgress: UserProgress = {
      subjectPerformance: {} as Record<Subject, { score: number; questionsAttempted: number }>,
      overallScore: 0,
      weakTopics: [],
    };
    AVAILABLE_SUBJECTS.forEach(subject => {
      initialProgress.subjectPerformance[subject] = { score: 0, questionsAttempted: 0 };
    });
    return initialProgress;
  });

  useEffect(() => {
    localStorage.setItem('naijaScholarProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  useEffect(() => {
    if (currentTheme === Theme.DARK) {
      document.documentElement.classList.add('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0F172A'); // Dark theme color for browser UI
    } else {
      document.documentElement.classList.remove('dark');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#00A859'); // Light theme color
    }
    localStorage.setItem('naijaScholarTheme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
  };

  const updateUserProgress = useCallback((subject: Subject, isCorrect: boolean) => {
    setUserProgress(prev => {
      const newProgress = { ...prev };
      const subjectPerf = newProgress.subjectPerformance[subject] || { score: 0, questionsAttempted: 0 };
      
      const newAttempted = subjectPerf.questionsAttempted + 1;
      const newCorrectAnswers = (subjectPerf.score / 100 * subjectPerf.questionsAttempted) + (isCorrect ? 1 : 0);
      const newScore = newAttempted > 0 ? Math.round((newCorrectAnswers / newAttempted) * 100) : 0;

      newProgress.subjectPerformance[subject] = {
        score: newScore,
        questionsAttempted: newAttempted,
      };
      
      let totalScoreSum = 0;
      let subjectsWithAttempts = 0;
      AVAILABLE_SUBJECTS.forEach(sub => {
        if (newProgress.subjectPerformance[sub] && newProgress.subjectPerformance[sub].questionsAttempted > 0) {
          totalScoreSum += newProgress.subjectPerformance[sub].score;
          subjectsWithAttempts++;
        }
      });
      newProgress.overallScore = subjectsWithAttempts > 0 ? Math.round(totalScoreSum / subjectsWithAttempts) : 0;

      return newProgress;
    });
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'tutor':
        return <TutorSection currentLanguage={currentLanguage} />;
      case 'exam_prep':
        return <ExamPrepSection currentLanguage={currentLanguage} updateUserProgress={updateUserProgress} />;
      case 'progress':
        return <ProgressSection progress={userProgress} currentLanguage={currentLanguage} />;
      default:
        return <TutorSection currentLanguage={currentLanguage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentLanguage={currentLanguage} 
        onLanguageChange={handleLanguageChange}
        currentTheme={currentTheme}
        toggleTheme={toggleTheme}
      />
      <NavBar currentView={currentView} onNavigate={setCurrentView} currentLanguage={currentLanguage} />
      <main className="flex-grow bg-lightbg dark:bg-dark-primary">
        {renderView()}
      </main>
      <footer className="bg-darktext dark:bg-slate-900 text-center text-xs text-gray-400 dark:text-gray-500 p-3">
        © {new Date().getFullYear()} NaijaScholar AI. Empowering Nigerian Students.
      </footer>
    </div>
  );
};

export default App;