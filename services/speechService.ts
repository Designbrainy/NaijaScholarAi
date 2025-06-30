
import { SupportedLanguage } from '../types';

interface SpeechService {
  speak: (text: string, lang: SupportedLanguage) => Promise<void>;
  cancel: () => void;
  isSpeaking: () => boolean;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;
let speakingGlobally = false; // Tracks if any utterance is active

const getBCP47LangCode = (appLang: SupportedLanguage): string => {
  switch (appLang) {
    case SupportedLanguage.ENGLISH: return 'en-US';
    case SupportedLanguage.PIDGIN: return 'en-NG'; // Best effort for Pidgin
    case SupportedLanguage.HAUSA: return 'ha-NG';
    case SupportedLanguage.IGBO: return 'ig-NG';
    case SupportedLanguage.YORUBA: return 'yo-NG';
    default: return 'en-US';
  }
};

const speechService: SpeechService = {
  speak: (text, lang) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported by this browser.'));
        return;
      }

      // Cancel any ongoing speech before starting a new one
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      // Ensure speakingGlobally is false before starting new utterance
      speakingGlobally = false; 


      currentUtterance = new SpeechSynthesisUtterance(text);
      currentUtterance.lang = getBCP47LangCode(lang);

      currentUtterance.onstart = () => {
        speakingGlobally = true;
      };

      currentUtterance.onend = () => {
        speakingGlobally = false;
        currentUtterance = null;
        resolve();
      };

      currentUtterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        speakingGlobally = false;
        currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      // A small delay can sometimes help if cancel() was just called
      setTimeout(() => {
        window.speechSynthesis.speak(currentUtterance!);
      }, 50);

    });
  },

  cancel: () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speakingGlobally = false;
      currentUtterance = null;
    }
  },

  isSpeaking: () => {
    // Check both our flag and the API's direct status
    return speakingGlobally || (window.speechSynthesis && window.speechSynthesis.speaking);
  },
};

export default speechService;
