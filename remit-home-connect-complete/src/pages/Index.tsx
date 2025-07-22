import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import SendMoney from '@/components/SendMoney';
import Wallet from '@/components/Wallet';
import Savings from '@/components/Savings';
import Insurance from '@/components/Insurance';
import Settings from '@/components/Settings';
import Transactions from '@/components/Transactions';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'send':
        return <SendMoney onNavigate={setCurrentPage} />;
      case 'wallet':
        return <Wallet onNavigate={setCurrentPage} />;
      case 'savings':
        return <Savings onNavigate={setCurrentPage} />;
      case 'insurance':
        return <Insurance onNavigate={setCurrentPage} />;
      case 'settings':
        return <Settings onNavigate={setCurrentPage} />;
      case 'transactions':
        return <Transactions onNavigate={setCurrentPage} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {renderPage()}
      </main>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default Index;
