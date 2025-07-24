import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const QUESTIONS = [
  {
    question: 'How do I send money?',
    buttonLabel: 'Go to Send Money',
    path: '/dashboard/send',
  },
  {
    question: 'How can I view my transactions?',
    buttonLabel: 'View Transactions',
    path: '/dashboard/transactions',
  },
  {
    question: 'How do I update my profile?',
    buttonLabel: 'Update Profile',
    path: '/dashboard/settings',
  },
  {
    question: 'How do I check my savings?',
    buttonLabel: 'Check Savings',
    path: '/dashboard/savings',
  },
  {
    question: 'How do I contact support?',
    buttonLabel: 'Contact Support',
    path: '/dashboard/settings', // No support route, using settings as placeholder
  },
  {
    question: 'How do I view FAQs?',
    buttonLabel: 'View FAQs',
    path: '/dashboard', // No FAQ route, using dashboard as placeholder
  },
];

const ChatBot = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

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
              <button onClick={() => { setOpen(false); setSelectedQuestion(null); }} className="p-1 rounded hover:bg-white/20 transition" aria-label="Close chatbot">
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Chat Area - Questions or Redirect Button */}
            <div className="flex-1 flex flex-col p-5 bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 items-center justify-center" style={{ minHeight: 320, maxHeight: 400 }}>
              {selectedQuestion === null ? (
                <div className="w-full">
                  <div className="text-center text-blue-900 dark:text-blue-100 text-lg font-semibold mb-4">
                    How can we help you?
                  </div>
                  <ul className="space-y-3">
                    {QUESTIONS.map((q, idx) => (
                      <li key={idx}>
                        <button
                          className="w-full text-left px-4 py-3 rounded-xl bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-medium shadow hover:bg-blue-200 dark:hover:bg-blue-700 transition"
                          onClick={() => setSelectedQuestion(idx)}
                        >
                          {q.question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="flex gap-2 mb-4 self-start">
                    <button
                      className="text-blue-600 dark:text-blue-300 underline text-sm"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      Back
                    </button>
                    <button
                      className="text-blue-600 dark:text-blue-300 underline text-sm"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      Reset
                    </button>
                  </div>
                  <div className="text-blue-900 dark:text-blue-100 text-lg font-semibold mb-6 text-center">
                    {QUESTIONS[selectedQuestion].question}
                  </div>
                  <Link
                    to={QUESTIONS[selectedQuestion].path}
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition text-center w-full"
                    onClick={() => setOpen(false)}
                  >
                    {QUESTIONS[selectedQuestion].buttonLabel}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
