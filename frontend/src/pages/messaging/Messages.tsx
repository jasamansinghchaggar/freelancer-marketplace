import React from 'react';
import Layout from '@/components/Layout';

const Messages: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold">Messages</h1>
        <div className="bg-card rounded-lg p-6 sm:p-8 border text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-medium text-foreground mb-2">Coming Soon</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              The messaging feature is currently under development. You'll be able to communicate with freelancers and clients directly through this interface.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Messages;
