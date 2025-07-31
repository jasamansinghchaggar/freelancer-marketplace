import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface UnreadContextType {
  unreadChats: Set<string>;
  addUnread: (chatId: string) => void;
  clearUnread: (chatId: string) => void;
  clearAll: () => void;
}

const UnreadContext = createContext<UnreadContextType | undefined>(undefined);

export const useUnread = (): UnreadContextType => {
  const context = useContext(UnreadContext);
  if (!context) {
    throw new Error('useUnread must be used within UnreadProvider');
  }
  return context;
};

interface UnreadProviderProps {
  children: ReactNode;
}

export const UnreadProvider: React.FC<UnreadProviderProps> = ({ children }) => {
  const [unreadChats, setUnreadChats] = useState<Set<string>>(new Set());

  const addUnread = (chatId: string) => {
    setUnreadChats((prev) => new Set(prev).add(chatId));
  };

  const clearUnread = (chatId: string) => {
    setUnreadChats((prev) => {
      const next = new Set(prev);
      next.delete(chatId);
      return next;
    });
  };

  const clearAll = () => {
    setUnreadChats(new Set());
  };

  return (
    <UnreadContext.Provider value={{ unreadChats, addUnread, clearUnread, clearAll }}>
      {children}
    </UnreadContext.Provider>
  );
};
