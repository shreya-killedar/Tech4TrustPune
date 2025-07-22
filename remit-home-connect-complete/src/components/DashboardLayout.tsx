import TopNav from './TopNav';
import BottomNav from './BottomNav';
import { Outlet } from 'react-router-dom';
import ChatBot from './ChatBot';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav />
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6 flex-1">
        <Outlet />
      </main>
      <BottomNav />
      <ChatBot />
    </div>
  );
};

export default DashboardLayout; 