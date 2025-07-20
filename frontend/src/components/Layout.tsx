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
          <div className="flex-grow">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />

        <div className="flex flex-grow">
          <AppSidebar />
          <SidebarInset className="flex flex-col flex-grow">
            <div className="md:hidden p-4 border-border">
              <SidebarTrigger className="bg-background border border-border shadow-sm" />
            </div>

            <main className="flex-grow overflow-auto">
              <div className="p-4 md:p-6 min-h-[80vh] max-h-max">
                {children}
              </div>
            </main>

            <Footer />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
