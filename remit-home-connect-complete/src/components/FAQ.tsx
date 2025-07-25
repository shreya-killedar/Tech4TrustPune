import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = [
    { q: t('faqList.q1'), a: t('faqList.a1') },
    { q: t('faqList.q2'), a: t('faqList.a2') },
    { q: t('faqList.q3'), a: t('faqList.a3') },
    { q: t('faqList.q4'), a: t('faqList.a4') },
    { q: t('faqList.q5'), a: t('faqList.a5') },
    { q: t('faqList.q6'), a: t('faqList.a6') },
  ];
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-2">
        <HelpCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('faq.heading')}</h1>
          <p className="text-muted-foreground text-sm">{t('faq.title')}</p>
        </div>
      </div>
      <Accordion type="multiple" className="space-y-4 mt-6">
        {faqs.map((faq, idx) => (
          <AccordionItem key={idx} value={faq.q}>
            <AccordionTrigger className="text-lg font-semibold text-foreground bg-muted/40 rounded-lg px-4 py-2">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground px-4 pb-4">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
