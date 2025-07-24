import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const FAQS = [
  {
    question: 'What is CashBridge?',
    answer: 'CashBridge is your all-in-one platform for financial inclusion, cross-currency transfers, savings, insurance, and digital wallet management.'
  },
  {
    question: 'How do I send money internationally?',
    answer: 'After logging in, go to the Send Money section, enter the recipient details, amount, and select the destination country. CashBridge handles the currency conversion and secure transfer.'
  },
  {
    question: 'How do I set up a savings goal?',
    answer: 'Navigate to the Savings page, click Create Goal, and fill in your goal details. You can deposit money and track your progress anytime.'
  },
  {
    question: 'How do I view my transaction history?',
    answer: 'Go to the Wallet or Transactions page to see a full list of your transactions. Click any transaction for detailed information.'
  },
  {
    question: 'How do I switch between light and dark themes?',
    answer: 'Use the theme switcher at the top right of the landing page or dashboard to toggle between light and dark modes.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach us at support@cashbridge.com for any questions or help.'
  }
];

export default function FAQ() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">FAQ</h1>
          <p className="text-muted-foreground text-sm">Frequently Asked Questions</p>
        </div>
      </div>
      <Accordion type="multiple" className="space-y-4 mt-6">
        {FAQS.map((faq, idx) => (
          <AccordionItem key={idx} value={faq.question}>
            <AccordionTrigger className="text-lg font-semibold text-foreground bg-muted/40 rounded-lg px-4 py-2">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground px-4 pb-4">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
