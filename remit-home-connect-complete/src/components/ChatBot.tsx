import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    question: 'chatbotQuestions.q1',
    buttonLabel: 'chatbotAnswers.b1',
    path: '/dashboard/send',
  },
  {
    question: 'chatbotQuestions.q2',
    buttonLabel: 'chatbotAnswers.b2',
    path: '/dashboard/transactions',
  },
  {
    question: 'chatbotQuestions.q3',
    buttonLabel: 'chatbotAnswers.b3',
    path: '/dashboard/settings',
  },
  {
    question: 'chatbotQuestions.q4',
    buttonLabel: 'chatbotAnswers.b4',
    path: '/dashboard/savings',
  },
  {
    question: 'chatbotQuestions.q5',
    buttonLabel: 'chatbotAnswers.b5',
    path: 'mailto:support@cashbridge.com',
    isMail: true,
  },
  {
    question: 'chatbotQuestions.q6',
    buttonLabel: 'chatbotAnswers.b6',
    isFAQ: true,
  },
];

const ChatBot = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  // Show FAQ button if FAQ question is selected
  const showFAQButton =
    selectedQuestion !== null &&
    QUESTIONS[selectedQuestion].question.toLowerCase().includes('faq');

  return (
    <>
      <style>
        {`
          @keyframes chatbot-pulse {
            0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
            70% { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
            100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
          }
          @keyframes askme-fade {
            0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
            30% { opacity: 1; transform: translateY(-32px) scale(1.1); }
            70% { opacity: 1; transform: translateY(-32px) scale(1.1); }
            100% { opacity: 0; transform: translateY(-44px) scale(0.9); }
          }
          .askme-animate {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            bottom: 100%;
            margin-bottom: 10px;
            background: rgba(30,41,59,0.85); /* dark blue for contrast in light mode */
            color: #fff;
            backdrop-filter: blur(6px) saturate(1.2);
            -webkit-backdrop-filter: blur(6px) saturate(1.2);
            padding: 4px 16px;
            border-radius: 9999px;
            font-size: 0.95rem;
            font-weight: 700;
            font-family: 'Quicksand', 'Segoe UI', 'Inter', 'Arial', sans-serif;
            letter-spacing: 0.03em;
            pointer-events: none;
            border: 1px solid rgba(0,0,0,0.10);
            box-shadow: 0 2px 8px 0 rgba(59,130,246,0.10), 0 1.5px 6px 0 rgba(6,182,212,0.08);
            animation: askme-fade 1.5s infinite, askme-float 2.5s ease-in-out infinite;
            z-index: 100;
            text-shadow: 0 2px 8px rgba(59,130,246,0.10), 0 1px 2px rgba(0,0,0,0.10);
            overflow: hidden;
            transition: background 0.3s, box-shadow 0.3s, color 0.3s;
          }
          html.dark .askme-animate {
            background: rgba(255,255,255,0.92); /* light background for dark mode */
            color: #1e293b; /* dark text for dark mode */
            border: 1px solid rgba(0,0,0,0.08);
            box-shadow: 0 2px 8px 0 rgba(255,255,255,0.10), 0 1.5px 6px 0 rgba(6,182,212,0.08);
            text-shadow: 0 2px 8px rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.10);
          }
          .askme-animate .shimmer {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(120deg, transparent 0%, #3b82f6 40%, #06b6d4 60%, transparent 100%);
            opacity: 0.25;
            filter: blur(2px);
            animation: shimmer-move 1.5s infinite;
            pointer-events: none;
          }
          @keyframes shimmer-move {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes askme-float {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-8px); }
          }
        `}
      </style>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-xl bg-transparent border-none hover:scale-105 transition-all chatbot-pulse-btn group"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', padding: 0, width: '80px', height: '80px', animation: 'chatbot-pulse 1.5s infinite' }}
        aria-label="Open AI ChatBot"
      >
        <span className="askme-animate" style={{position:'absolute'}}>
          <span style={{position:'relative',zIndex:2}}>Ask me</span>
          <span className="shimmer"></span>
        </span>
        <img src="/favicon.ico" alt="ChatBot logo" className="w-16 h-16 rounded-full bg-white" />
      </button>
      {/* Chat Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-auto mb-8 md:mb-0 md:mt-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col overflow-hidden animate-fadeInUp">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-600 to-blue-400 text-white">
              <div className="flex items-center gap-2">
                <img src="/favicon.ico" alt="ChatBot logo" className="w-8 h-8 rounded-full bg-white" />
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
                    {t('chatbot.howCanWeHelp')}
                  </div>
                  <ul className="space-y-3">
                    {QUESTIONS.map((q, idx) => (
                      <li key={idx}>
                        <button
                          className="w-full text-left px-4 py-3 rounded-xl bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-medium shadow hover:bg-blue-200 dark:hover:bg-blue-700 transition"
                          onClick={() => setSelectedQuestion(idx)}
                        >
                          {t(q.question)}
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
                      {t('chatbot.back')}
                    </button>
                    <button
                      className="text-blue-600 dark:text-blue-300 underline text-sm"
                      onClick={() => setSelectedQuestion(null)}
                    >
                      {t('chatbot.reset')}
                    </button>
                  </div>
                  <div className="text-blue-900 dark:text-blue-100 text-lg font-semibold mb-6 text-center">
                    {t(QUESTIONS[selectedQuestion].question)}
                  </div>
                  {/* FAQ: show only one button that navigates to FAQ page */}
                  {QUESTIONS[selectedQuestion].isFAQ ? (
                    <button
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition text-center w-full"
                      onClick={() => {
                        setOpen(false);
                        navigate('/dashboard/faq');
                      }}
                    >
                      {t('chatbot.viewFAQ')}
                    </button>
                  ) : QUESTIONS[selectedQuestion].isMail ? (
                    <a
                      href={QUESTIONS[selectedQuestion].path}
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition text-center w-full"
                      onClick={() => setOpen(false)}
                    >
                      {t(QUESTIONS[selectedQuestion].buttonLabel)}
                    </a>
                  ) : (
                    <Link
                      to={QUESTIONS[selectedQuestion].path}
                      className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow hover:bg-blue-700 transition text-center w-full"
                      onClick={() => setOpen(false)}
                    >
                      {t(QUESTIONS[selectedQuestion].buttonLabel)}
                    </Link>
                  )}
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
