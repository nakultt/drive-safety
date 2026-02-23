import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header title={title} />
      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:ml-64 lg:px-8">
        <div className="mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
