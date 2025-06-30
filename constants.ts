
import { TutorPersonality, Subject, PastQuestion, SupportedLanguage, AllTranslations, PastQuestionOption } from './types';

export const APP_NAME = "NaijaScholar AI";
export const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

export const DEFAULT_LANGUAGE = SupportedLanguage.ENGLISH;

export const AVAILABLE_LANGUAGES: { code: SupportedLanguage; name: string }[] = [
  { code: SupportedLanguage.ENGLISH, name: 'English' },
  { code: SupportedLanguage.PIDGIN, name: 'Pidgin' },
  { code: SupportedLanguage.HAUSA, name: 'Hausa' },
  { code: SupportedLanguage.IGBO, name: 'Igbo' },
  { code: SupportedLanguage.YORUBA, name: 'Yoruba' },
];

export const TUTOR_PERSONALITIES_CONFIG: Record<TutorPersonality, { displayName: string; systemPrompt: string }> = {
  [TutorPersonality.FRIENDLY]: {
    displayName: 'Friendly Pal',
    systemPrompt: "You are a friendly, encouraging, and patient AI tutor for Nigerian secondary school students. Use simple language, be supportive, and try to make learning fun. Relate concepts to everyday Nigerian life where possible. Keep responses concise and helpful. If the user uploads an image of a problem, analyze it and provide a solution or explanation. If the image is not a problem, describe it or respond appropriately.",
  },
  [TutorPersonality.STRICT]: {
    displayName: 'Strict Teacher',
    systemPrompt: "You are a strict, no-nonsense AI tutor for Nigerian secondary school students focused on discipline and accuracy. Be firm, direct, and push the student to achieve their best. Emphasize correct understanding and diligent study. Keep responses formal and to the point. If the user uploads an image of an academic problem, analyze it meticulously and provide a precise solution or explanation. If the image is not a problem, state that it's off-topic for academic study.",
  },
  [TutorPersonality.MOTIVATIONAL]: {
    displayName: 'Motivational Coach',
    systemPrompt: "You are an inspiring and motivational AI tutor for Nigerian secondary school students. Encourage them to believe in themselves, set high goals, and overcome challenges. Share success stories (hypothetical, related to studies) and provide uplifting advice. Focus on building confidence. Keep responses positive and empowering. If the user uploads an image of a problem, help them break it down and guide them to the solution, boosting their confidence in tackling it.",
  },
};

export const AVAILABLE_SUBJECTS: Subject[] = [
  Subject.MATHEMATICS,
  Subject.ENGLISH_LANGUAGE,
  Subject.PHYSICS,
  Subject.CHEMISTRY,
  Subject.BIOLOGY,
  Subject.ECONOMICS,
  Subject.GOVERNMENT,
];

export const SAMPLE_PAST_QUESTIONS: PastQuestion[] = [
  {
    id: 'math1',
    subject: Subject.MATHEMATICS,
    questionText: 'If x - 3 = 7, what is the value of x?',
    options: [
      { id: 'a', text: '4' },
      { id: 'b', text: '10' },
      { id: 'c', text: '-4' },
      { id: 'd', text: '-10' },
    ],
    correctOptionId: 'b',
    year: 2022,
  },
  {
    id: 'eng1',
    subject: Subject.ENGLISH_LANGUAGE,
    questionText: 'Choose the word that is nearest in meaning to "ubiquitous".',
    options: [
      { id: 'a', text: 'Rare' },
      { id: 'b', text: 'Scarce' },
      { id: 'c', text: 'Everywhere' },
      { id: 'd', text: 'Hidden' },
    ],
    correctOptionId: 'c',
    year: 2021,
  },
  {
    id: 'phy1',
    subject: Subject.PHYSICS,
    questionText: 'Which of the following is a vector quantity?',
    options: [
      { id: 'a', text: 'Speed' },
      { id: 'b', text: 'Distance' },
      { id: 'c', text: 'Mass' },
      { id: 'd', text: 'Velocity' },
    ],
    correctOptionId: 'd',
    year: 2023,
  },
  {
    id: 'chem1',
    subject: Subject.CHEMISTRY,
    questionText: 'What is the chemical symbol for Gold?',
    options: [
      { id: 'a', text: 'Go' },
      { id: 'b', text: 'Gd' },
      { id: 'c', text: 'Au' },
      { id: 'd', text: 'Ag' },
    ],
    correctOptionId: 'c',
  },
  {
    id: 'bio1',
    subject: Subject.BIOLOGY,
    questionText: 'The process by which green plants manufacture their food is called?',
    options: [
      { id: 'a', text: 'Respiration' },
      { id: 'b', text: 'Photosynthesis' },
      { id: 'c', text: 'Transpiration' },
      { id: 'd', text: 'Osmosis' },
    ],
    correctOptionId: 'b',
  },
];

export const TRANSLATIONS: AllTranslations = {
  [SupportedLanguage.ENGLISH]: {
    appName: APP_NAME,
    navTutor: 'AI Tutor',
    navExamPrep: 'Exam Prep',
    navProgress: 'Progress',
    selectPersonality: 'Select Tutor Personality:',
    typeMessage: 'Type your question here...',
    sendMessage: 'Send',
    aiIsThinking: 'AI is thinking...',
    errorOccurred: 'An error occurred. Please try again.',
    selectSubject: 'Select Subject:',
    pastQuestions: 'Past Questions',
    generateMockTest: 'Generate Mock Test (AI)',
    submitAnswer: 'Submit Answer',
    correct: 'Correct!',
    incorrect: 'Incorrect. Try again or check explanation.',
    getExplanation: 'Get AI Explanation',
    explanationFor: 'Explanation for:',
    yourProgress: 'Your Progress',
    overallScore: 'Overall Score',
    questionsAttempted: 'Questions Attempted',
    weakestSubjects: 'Areas to Focus On',
    noData: 'No data yet. Start practicing!',
    comingSoon: 'Feature Coming Soon!',
    mockTestGenerated: 'Mock Test Generated (Conceptual)',
    answerAllQuestions: 'Please answer all questions first.',
    selectAnOption: 'Please select an option.',
    question: 'Question',
    options: 'Options',
    answer: 'Answer',
    explanation: 'Explanation',
    uploadImage: 'Upload Image',
    clearImage: 'Clear Image',
    imageUploadError: 'Failed to read image.',
    toggleDarkMode: 'Toggle Dark Mode',
    toggleLightMode: 'Toggle Light Mode',
  },
  [SupportedLanguage.PIDGIN]: {
    appName: APP_NAME,
    navTutor: 'AI Chairman',
    navExamPrep: 'Exam Practice',
    navProgress: 'Your Level',
    selectPersonality: 'Choose Your Chairman Style:',
    typeMessage: 'Ask your question here, sharp sharp...',
    sendMessage: 'Send Am',
    aiIsThinking: 'AI dey reason...',
    errorOccurred: 'Wahala dey! Try again.',
    selectSubject: 'Choose Subject:',
    pastQuestions: 'Old Questions',
    generateMockTest: 'Do AI Mock Exam',
    submitAnswer: 'Send Answer',
    correct: 'Correct! You sabi!',
    incorrect: 'No be so. Try again or check why.',
    getExplanation: 'Make AI Explain',
    explanationFor: 'Why e be so for:',
    yourProgress: 'Your Level So Far',
    overallScore: 'Total Score',
    questionsAttempted: 'Questions Wey You Do',
    weakestSubjects: 'Where You Need To Gree Harder',
    noData: 'Nothing yet. Start dey practice!',
    comingSoon: 'Dis one dey come soon!',
    mockTestGenerated: 'Mock Exam Don Ready (Idea)',
    answerAllQuestions: 'Answer all questions first, abeg.',
    selectAnOption: 'Choose one option, biko.',
    question: 'Question',
    options: 'Choices',
    answer: 'Answer',
    explanation: 'Explanation',
    uploadImage: 'Upload Foto',
    clearImage: 'Comot Foto',
    imageUploadError: 'No fit read dis foto.',
    toggleDarkMode: 'Change to Dark Style',
    toggleLightMode: 'Change to Light Style',
  },
  // Add Hausa, Igbo, Yoruba translations similarly.
};

// Function to get translated string
export const getTranslatedString = (key: string, lang: SupportedLanguage): string => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS[SupportedLanguage.ENGLISH]?.[key] || key;
};