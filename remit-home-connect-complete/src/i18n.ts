import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      onboarding: {
        login: 'Login',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        name: 'Name',
        country: 'Country',
        welcome: 'Welcome back, {{name}}',
        logout: 'Logout',
      },
      dashboard: {
        totalBalance: 'Total Balance',
        sendMoney: 'Send Money',
        addMoney: 'Add Money',
        withdraw: 'Withdraw',
        savings: 'Savings',
        insurance: 'Insurance',
        wallet: 'Wallet',
        transactionHistory: 'Transaction History',
        savingsGoals: 'Savings Goals',
        viewAll: 'View All',
      },
      wallet: {
        myWallet: 'My Wallet',
        balance: 'Balance',
        add: 'Add',
        withdraw: 'Withdraw',
        enterAmount: 'Enter amount',
      },
      transactions: {
        type: 'Type',
        amount: 'Amount',
        toFrom: 'To/From',
      },
      settings: {
        darkMode: 'Dark Mode',
        language: 'Language',
        profile: 'Profile',
        theme: 'Theme',
      },
      faq: {
        title: 'Frequently Asked Questions',
        q1: 'How can I transfer money?',
        a1: 'You can use the Send Money option from your dashboard.',
        q2: 'How to add money?',
        a2: 'Use the Add Money feature from your Wallet section.',
        q3: 'What currencies are supported?',
        a3: 'We display currencies based on your profile country.',
        q4: 'How to change language or theme?',
        a4: 'Visit your Profile or Settings page to update preferences.',
      },
      chatbot: {
        title: 'AI ChatBot',
        placeholder: 'Type here...',
        send: 'Send',
        greeting: 'Hi! How can I help you today?',
      },
    },
  },
  hi: {
    translation: {
      onboarding: {
        login: 'लॉगिन',
        register: 'रजिस्टर',
        email: 'ईमेल',
        password: 'पासवर्ड',
        name: 'नाम',
        country: 'देश',
        welcome: 'वापसी पर स्वागत है, {{name}}',
        logout: 'लॉगआउट',
      },
      dashboard: {
        totalBalance: 'कुल शेष',
        sendMoney: 'पैसे भेजें',
        addMoney: 'पैसे जोड़ें',
        withdraw: 'निकासी',
        savings: 'बचत',
        insurance: 'बीमा',
        wallet: 'वॉलेट',
        transactionHistory: 'लेन-देन इतिहास',
        savingsGoals: 'बचत लक्ष्य',
        viewAll: 'सभी देखें',
      },
      wallet: {
        myWallet: 'मेरा वॉलेट',
        balance: 'शेष',
        add: 'जोड़ें',
        withdraw: 'निकासी',
        enterAmount: 'राशि दर्ज करें',
      },
      transactions: {
        type: 'प्रकार',
        amount: 'राशि',
        toFrom: 'किसको/किससे',
      },
      settings: {
        darkMode: 'डार्क मोड',
        language: 'भाषा',
        profile: 'प्रोफ़ाइल',
        theme: 'थीम',
      },
      faq: {
        title: 'अक्सर पूछे जाने वाले प्रश्न',
        q1: 'मैं पैसे कैसे भेज सकता हूँ?',
        a1: 'आप अपने डैशबोर्ड से पैसे भेजें विकल्प का उपयोग कर सकते हैं।',
        q2: 'पैसे कैसे जोड़ें?',
        a2: 'अपने वॉलेट सेक्शन से पैसे जोड़ें फीचर का उपयोग करें।',
        q3: 'कौन सी मुद्राएँ समर्थित हैं?',
        a3: 'हम आपके प्रोफ़ाइल देश के अनुसार मुद्राएँ दिखाते हैं।',
        q4: 'भाषा या थीम कैसे बदलें?',
        a4: 'अपनी प्रोफ़ाइल या सेटिंग्स पेज पर जाकर वरीयताएँ अपडेट करें।',
      },
      chatbot: {
        title: 'एआई चैटबोट',
        placeholder: 'यहाँ टाइप करें...',
        send: 'भेजें',
        greeting: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n; 