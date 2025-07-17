import React from 'react';
import Layout from '@/components/Layout';

const Messages: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <p>This is the Messages page. View your conversations here.</p>
      </div>
    </Layout>
  );
};

export default Messages;
