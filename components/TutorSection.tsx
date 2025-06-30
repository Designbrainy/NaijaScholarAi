import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, TutorPersonality, SupportedLanguage, ImageFileState } from '../types';
import { TUTOR_PERSONALITIES_CONFIG, getTranslatedString } from '../constants';
import { getTutorResponseStream } from '../services/aiService';
import ChatMessageBubble from './ChatMessageBubble';
import speechService from '../services/speechService';

// Icons
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81"></path></svg>;
const ClearIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


interface TutorSectionProps {
  currentLanguage: SupportedLanguage;
}

const TutorSection: React.FC<TutorSectionProps> = ({ currentLanguage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState<TutorPersonality>(TutorPersonality.FRIENDLY);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<ImageFileState | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    return () => {
      speechService.cancel();
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(selectedImage.previewUrl); // Clean up object URL
      }
    };
  }, [selectedPersonality, selectedImage]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // Limit file size, e.g. 4MB
        setImageError('Image size should not exceed 4MB.');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      setImageError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Full = reader.result as string;
        // Gemini API expects pure base64, without the data URL prefix
        const base64Data = base64Full.split(',')[1]; 
        setSelectedImage({
          file: file,
          previewUrl: URL.createObjectURL(file), // For local preview
          base64Data: base64Data,
          mimeType: file.type,
        });
      };
      reader.onerror = () => {
        setImageError(getTranslatedString('imageUploadError', currentLanguage));
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input value so onChange fires again for the same file if re-selected
     if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearSelectedImage = () => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    setSelectedImage(null);
    setImageError(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the actual file input
    }
  };


  const handleSendMessage = useCallback(async () => {
    if ((input.trim() === '' && !selectedImage) || isLoading) return;

    speechService.cancel();

    const userMessageText = input.trim();
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const imageToSend = selectedImage; // Capture current selected image
    clearSelectedImage(); // Clear image from selection UI immediately

    setIsLoading(true);
    setError(null);

    const aiPlaceholderId = `ai-${Date.now()}-pending`;
    setMessages(prev => [...prev, { id: aiPlaceholderId, sender: 'ai', text: getTranslatedString('aiIsThinking', currentLanguage), timestamp: new Date() }]);
    
    try {
      const systemPrompt = TUTOR_PERSONALITIES_CONFIG[selectedPersonality].systemPrompt;
      const historyForAPI = messages.filter(msg => msg.id !== aiPlaceholderId && msg.id !== userMessage.id);

      const stream = await getTutorResponseStream(
        userMessageText, 
        systemPrompt, 
        historyForAPI,
        imageToSend ? { base64Data: imageToSend.base64Data, mimeType: imageToSend.mimeType } : undefined
      );
      
      let aiResponseText = '';
      let firstChunkReceived = false;

      for await (const chunk of stream) {
        if (chunk.error) {
          throw new Error(chunk.error);
        }
        
        const chunkText = chunk.text; 
        if (chunkText === undefined) continue; 

        aiResponseText += chunkText;

        if (!firstChunkReceived) {
            // Replace the "thinking..." message with the first chunk
            setMessages(prev => prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, text: chunkText, timestamp: new Date() } : msg ));
            firstChunkReceived = true;
        } else {
            // Append to the existing AI message
            setMessages(prev => prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, text: aiResponseText, timestamp: new Date() } : msg ));
        }
      }
      // Final update to ensure the complete message is set
      setMessages(prev => prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, text: aiResponseText, timestamp: new Date() } : msg ));

    } catch (err: any) {
      console.error(err);
      const errorMsg = err.message || getTranslatedString('errorOccurred', currentLanguage);
      setError(errorMsg);
      // Replace the "thinking..." message with the error
      setMessages(prev => prev.map(msg => msg.id === aiPlaceholderId ? { ...msg, text: `Error: ${errorMsg}`, timestamp: new Date() } : msg ));
    } finally {
      setIsLoading(false);
      if (imageToSend?.previewUrl) { // Clean up object URL if it was an image message
        URL.revokeObjectURL(imageToSend.previewUrl);
      }
    }
  }, [input, isLoading, selectedPersonality, currentLanguage, messages, selectedImage]);


  return (
    <div className="flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] max-w-2xl mx-auto bg-white dark:bg-slate-800 shadow-lg rounded-b-lg">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <label htmlFor="personality" className="block text-sm font-medium text-darktext dark:text-gray-300 mb-1">
          {getTranslatedString('selectPersonality', currentLanguage)}
        </label>
        <select
          id="personality"
          value={selectedPersonality}
          onChange={(e) => setSelectedPersonality(e.target.value as TutorPersonality)}
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm bg-white dark:bg-slate-700 text-darktext dark:text-gray-200"
          disabled={isLoading}
        >
          {Object.values(TutorPersonality).map(p => (
            <option key={p} value={p} className="bg-white dark:bg-slate-700 text-darktext dark:text-gray-200">{TUTOR_PERSONALITIES_CONFIG[p].displayName}</option>
          ))}
        </select>
      </div>

      <div className="flex-grow p-4 space-y-2 overflow-y-auto">
        {messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} currentLanguage={currentLanguage} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && <p className="p-4 text-center text-red-500 dark:text-red-400 text-sm">{error}</p>}
      
      {imageError && <p className="px-4 pb-2 text-center text-red-500 dark:text-red-400 text-xs">{imageError}</p>}
      
      {selectedImage && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 relative">
          <img src={selectedImage.previewUrl} alt="Selected preview" className="max-h-24 max-w-xs rounded-md border border-gray-300 dark:border-slate-600" />
          <button 
            onClick={clearSelectedImage}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75"
            aria-label={getTranslatedString('clearImage', currentLanguage)}
            title={getTranslatedString('clearImage', currentLanguage)}
          >
            <ClearIcon />
          </button>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
        <div className="flex space-x-2 items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            id="imageUploadInput"
            disabled={isLoading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-darktext dark:text-gray-300"
            aria-label={getTranslatedString('uploadImage', currentLanguage)}
            title={getTranslatedString('uploadImage', currentLanguage)}
          >
            <UploadIcon />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={getTranslatedString('typeMessage', currentLanguage)}
            className="flex-grow p-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-primary focus:border-primary text-sm bg-white dark:bg-slate-700 text-darktext dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            disabled={isLoading}
            aria-label={getTranslatedString('typeMessage', currentLanguage)}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || (input.trim() === '' && !selectedImage)}
            className="bg-primary text-white px-4 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 flex items-center justify-center text-sm"
            aria-label={getTranslatedString('sendMessage', currentLanguage)}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
            <span className="ml-2 hidden sm:inline">{getTranslatedString('sendMessage', currentLanguage)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorSection;