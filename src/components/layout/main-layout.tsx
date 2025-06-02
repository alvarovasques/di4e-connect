import React from 'react';
import MainSidebar from './main-sidebar';
import MainHeader from './main-header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <MainSidebar />
      </div>
      
      <div className="flex flex-1 flex-col md:ml-64"> {/* Adjust ml-64 to match sidebar width */}
        <MainHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
