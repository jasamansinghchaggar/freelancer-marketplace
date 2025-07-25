import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebar = true }) => {
  if (!showSidebar) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <div className="flex-grow px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background text-foreground">

        <Navbar />

        <div className="w-screen h-screen overflow-hidden flex">
          <AppSidebar />
          <SidebarInset className="flex flex-col">
            <div className="md:hidden p-3 sm:p-4 border-border">
              <SidebarTrigger className="bg-background border border-border shadow-sm" />
            </div>

            <main className="h-full w-full flex flex-col justify-between overflow-y-scroll scrollbar-hide">
              <div className="p-3 sm:p-4 md:p-6">
                {children}
              </div>
              <Footer />
            </main>

          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
