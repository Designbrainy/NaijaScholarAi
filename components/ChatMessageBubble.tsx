
import React, { useState, useEffect } from 'react';
import { ChatMessage, SupportedLanguage } from '../types';
import speechService from '../services/speechService'; // Import speech service

// Icons (can be shared or defined per component if styles differ)
const SpeakIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563A.562.562 0 019 14.437V9.564z" /></svg>;

interface ChatMessageBubbleProps {
  message: ChatMessage;
  currentLanguage: SupportedLanguage; // Added prop
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, currentLanguage }) => {
  const isUser = message.sender === 'user';
  const bubbleClasses = isUser
    ? 'bg-primary text-white self-end rounded-l-xl rounded-tr-xl'
    : 'bg-white dark:bg-slate-700 text-darktext dark:text-gray-200 self-start rounded-r-xl rounded-tl-xl border border-gray-200 dark:border-slate-600';
  
  const formattedTime = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [isSpeakingMessage, setIsSpeakingMessage] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Effect to stop speech if the message text changes (e.g. streaming update) or component unmounts
  useEffect(() => {
    return () => {
      if (isSpeakingMessage) {
        speechService.cancel();
        setIsSpeakingMessage(false);
      }
    };
  }, [isSpeakingMessage, message.text]);
  
  // Effect to monitor external speech cancellations for this specific message
  useEffect(() => {
    const interval = setInterval(() => {
        if (isSpeakingMessage && !speechService.isSpeaking()) {
            setIsSpeakingMessage(false);
        }
    }, 500);
    return () => clearInterval(interval);
  }, [isSpeakingMessage]);


  const handleSpeakMessage = async () => {
    if (!message.text || message.sender === 'user') return;

    if (isSpeakingMessage) {
      speechService.cancel();
      setIsSpeakingMessage(false);
    } else {
      setIsSpeakingMessage(true);
      setSpeechError(null);
      try {
        await speechService.speak(message.text, currentLanguage);
      } catch (err: any) {
        setSpeechError(err.message || 'Could not play audio.');
        console.error("Speech error in chat bubble:", err);
      } finally {
        setIsSpeakingMessage(false);
      }
    }
  };

  return (
    <div className={`max-w-[80%] w-fit p-3 my-1 shadow-sm ${bubbleClasses}`}>
      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      <div className="flex justify-between items-center mt-1">
        <p className={`text-xs ${isUser ? 'text-gray-300 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {formattedTime}
        </p>
        {!isUser && message.id !== 'pending-ai-message' && message.text !== '' && ( // Don't show for pending/empty AI messages
          <button
            onClick={handleSpeakMessage}
            className={`p-1 rounded-full ${isUser ? 'text-gray-300 dark:text-gray-400 hover:text-white dark:hover:text-gray-200' : 'text-gray-500 dark:text-gray-400 hover:text-accent dark:hover:text-secondary'} focus:outline-none focus:ring-1 focus:ring-accent dark:focus:ring-secondary`}
            aria-label={isSpeakingMessage ? "Stop speaking message" : "Speak message"}
            title={isSpeakingMessage ? "Stop speaking" : "Speak message"}
          >
            {isSpeakingMessage ? <StopIcon /> : <SpeakIcon />}
          </button>
        )}
      </div>
      {speechError && !isUser && <p className="text-xs text-red-400 dark:text-red-500 mt-1">{speechError}</p>}
    </div>
  );
};

export default ChatMessageBubble;