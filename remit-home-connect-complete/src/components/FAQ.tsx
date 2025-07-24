import React from 'react';

const FAQ = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions (FAQ)</h1>
      <ul className="space-y-4">
        <li><strong>What is RemitConnect?</strong> RemitConnect is a platform for sending money, managing savings, and accessing financial services for migrants and their families.</li>
        <li><strong>How do I send money?</strong> Go to the Send Money page, enter recipient details, amount, and choose a payment method (including savings funds if available).</li>
        <li><strong>What payment methods are supported?</strong> You can pay using your wallet balance, linked bank accounts, credit/debit cards, or your savings funds.</li>
        <li><strong>How can I use my savings funds as a payment method?</strong> On the payment page, select from your available savings funds to pay directly for transfers or services.</li>
        <li><strong>How do I add or manage savings goals?</strong> Visit the Savings page to create, edit, or deposit into your savings goals.</li>
        <li><strong>Who can I contact for support?</strong> Email us at support@remitconnect.com or use the in-app chat for assistance.</li>
      </ul>
    </div>
  );
};

export default FAQ;
