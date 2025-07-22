import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X, Send as SendIcon } from 'lucide-react';

const OPENAI_KEY_URL = 'https://platform.openai.com/api-keys';

const ChatBot = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: t('chatbot.greeting') }
  ]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!apiKey);

  const handleApiKeySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
      setShowApiKeyInput(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = (e.target as any).elements.message.value;
    if (!text) return;
    setMessages([...messages, { from: 'user', text }]);
    setLoading(true);
    (e.target as any).reset();
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant for a cross-border finance app.' },
            ...messages.filter(m => m.from !== 'bot').map(m => ({ role: 'user', content: m.text })),
            { role: 'user', content: text }
          ],
          max_tokens: 100,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const aiText = response.data.choices[0].message.content.trim();
      setMessages(msgs => [...msgs, { from: 'bot', text: aiText }]);
    } catch (err) {
      setMessages(msgs => [...msgs, { from: 'bot', text: 'Sorry, I could not connect to OpenAI. Please check your API key or try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white font-semibold text-lg backdrop-blur-md border border-white/20 hover:scale-105 transition-all"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
        aria-label="Open AI ChatBot"
      >
        <HelpCircle className="w-6 h-6 mr-1" />
        {t('chatbot.title')}
      </button>
      {/* Chat Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto mb-8 md:mb-0 md:mt-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden animate-fadeInUp">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <span className="font-bold text-lg">{t('chatbot.title')}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20 transition" aria-label="Close chatbot">
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* API Key Input */}
            {showApiKeyInput && (
              <div className="p-5 bg-blue-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
                <div className="mb-2 text-blue-900 dark:text-blue-200 text-sm">
                  <b>API Key Required:</b> To use the AI ChatBot, you need a free <a href={OPENAI_KEY_URL} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 dark:text-blue-300">OpenAI API key</a>.<br/>
                  <span className="text-xs text-zinc-500">(Your key is stored only in your browser.)</span>
                </div>
                <form onSubmit={handleApiKeySave} className="flex gap-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="Paste your OpenAI API Key here"
                    className="flex-1 border px-3 py-2 rounded text-black"
                    required
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Save</button>
                </form>
              </div>
            )}
            {/* Chat Area */}
            <div className="flex-1 flex flex-col p-5 bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900" style={{ minHeight: 320, maxHeight: 400, overflowY: 'auto' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`mb-3 flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] shadow text-base ${msg.from === 'bot' ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' : 'bg-blue-600 text-white'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && <div className="text-gray-400 text-center">...</div>}
            </div>
            {/* Input */}
            {!showApiKeyInput && (
              <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                <input
                  name="message"
                  className="flex-1 border px-3 py-2 rounded-2xl text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={t('chatbot.placeholder')}
                  disabled={loading}
                  autoComplete="off"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-2xl font-semibold flex items-center gap-1" disabled={loading}>
                  <SendIcon className="w-5 h-5" />
                  {t('chatbot.send')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
