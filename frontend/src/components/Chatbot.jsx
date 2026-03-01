import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Mic, MicOff } from 'lucide-react';

export default function Chatbot() {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, role: 'assistant', content: 'Namaste! How can I help you with your store today?', language: 'en' }
    ]);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    useEffect(() => {
        // Scroll to bottom on new message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (recognition) {
            // Set language based on current i18n selection
            const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
            recognition.lang = langMap[i18n.language] || 'en-IN';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    }, [i18n.language, recognition]);

    const toggleListen = () => {
        if (isListening) {
            recognition?.stop();
            setIsListening(false);
        } else {
            if (recognition) {
                try {
                    recognition.start();
                    setIsListening(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                alert("Your browser does not support Speech Recognition.");
            }
        }
    };

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: input,
            language: i18n.language
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Mock API Call to backend
            // await axios.post('/api/v1/chat/message', { message: userMsg.content, language: userMsg.language });

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mock localized responses
            const mockResponses = {
                en: "I've checked your inventory. Your Top Seller is currently Basmati Rice 5kg.",
                hi: "मैंने आपकी इन्वेंटरी की जाँच की है। आपका शीर्ष विक्रेता वर्तमान में बासमती चावल 5 किलो है।",
                mr: "मी तुमची इन्व्हेंटरी तपासली आहे. तुमचे सर्वाधिक विकले जाणारे उत्पादन सध्या बासमती तांदूळ 5 किलो आहे."
            };

            const aiMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: mockResponses[i18n.language] || mockResponses['en'],
                language: i18n.language
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg = {
                id: Date.now() + 1,
                role: 'assistant',
                content: t('chatError'),
                language: i18n.language
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 hover:scale-105 transition-all z-50 ${isOpen ? 'hidden' : 'flex'}`}
                aria-label="Open Chat"
            >
                <MessageCircle className="w-7 h-7" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{t('chatTitle')}</h3>
                                <p className="text-blue-100 text-xs tracking-wide uppercase">{i18n.language.toUpperCase()} • RAG Engine Active</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-blue-100 hover:text-white hover:bg-white/20 p-1 rounded-md transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-sm'
                                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form
                            onSubmit={handleSend}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-2 py-2"
                        >
                            <button
                                type="button"
                                onClick={toggleListen}
                                className={`p-2 rounded-full transition-colors ${isListening
                                        ? 'bg-red-100 text-red-600 animate-pulse'
                                        : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                                title="Voice Input"
                            >
                                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isListening ? t('chatListening') : t('chatPlaceholder')}
                                className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 text-sm placeholder-gray-400"
                                disabled={isListening}
                            />

                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className={`p-2 rounded-full transition-colors ${input.trim()
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Send className="w-5 h-5 ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
