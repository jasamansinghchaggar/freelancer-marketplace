import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { chatAPI } from '@/services/api';
import socket from '@/socket';
import { toast } from 'sonner';
import { loadKeyPair, deriveSharedKey, decrypt } from '@/utils/crypto';
import ChatList from '@/components/messaging/ChatList';
import ChatWindow from '@/components/messaging/ChatWindow';
import { useUnread } from '@/context/UnreadContext';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { useIsMobile } from '@/hooks/use-mobile';


const Messages: React.FC = () => {
  const { user, loading } = useAuth();
  const { addUnread } = useUnread();
  const location = useLocation();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handler = (data: { userId: string; online: boolean; lastSeen?: string }) => {
      setChats((prevChats) =>
        prevChats.map((chat) => ({
          ...chat,
          participants: chat.participants.map((p: any) =>
            p._id === data.userId ? { ...p, online: data.online, lastSeen: data.lastSeen } : p
          ),
        }))
      );
      if (selectedChat) {
        const updated = {
          ...selectedChat,
          participants: selectedChat.participants.map((p: any) =>
            p._id === data.userId ? { ...p, online: data.online, lastSeen: data.lastSeen } : p
          ),
        };
        setSelectedChat(updated);
      }
    };
    socket.on('userStatus', handler);
    return () => {
      socket.off('userStatus', handler);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!loading) {
      chatAPI.getChats().then((res) => setChats(res.data));
    }
  }, [loading]);

  useEffect(() => {
    const handler = (msg: any) => {
      const chatId = msg.chatId || msg.chat;
      // update lastMessage preview for the chat
      setChats(prevChats => prevChats.map(chat => chat._id === chatId
        ? { ...chat, lastMessage: { nonce: msg.nonce, cipher: msg.cipher, content: msg.content, senderId: msg.senderId, createdAt: msg.createdAt } }
        : chat
      ));
      if (selectedChat?._id !== chatId) {
        const chat = chats.find((c) => c._id === chatId);
        const other = chat?.participants.find((p: any) => p._id !== user!.id);
        const name = other?.name || 'Someone';
        let description = msg.content || '';
        const kp = loadKeyPair();
        if (kp && other?.publicKey && msg.nonce && msg.cipher) {
          const shared = deriveSharedKey(kp.secretKey, other.publicKey);
          const dec = decrypt(shared, msg.nonce, msg.cipher);
          if (dec) description = dec;
        }
        // mark chat as unread and notify
        addUnread(chatId);
        toast.success(`New message from ${name}`, { description });
      }
    };
    socket.on('receiveMessage', handler);
    return () => {
      socket.off('receiveMessage', handler);
    };
  }, [selectedChat, chats, user, addUnread]);

  useEffect(() => {
    const state = (location.state as any) || {};
    if (state.initialChat) {
      const init = state.initialChat;
      setChats((prev) => (prev.some((c) => c._id === init._id) ? prev : [...prev, init]));
      setSelectedChat(init);
      return;
    }
    const params = new URLSearchParams(location.search);
    const chatId = params.get('chatId');
    if (chatId && chats.length) {
      const existing = chats.find((c) => c._id === chatId);
      if (existing) {
        setSelectedChat(existing);
      }
    }
  }, [location.search, location.state, chats]);

  if (loading) {
    return (
      <div className="flex h-[85vh] w-full animate-pulse">
        {/* Chat list skeleton */}
        <div className="w-1/4 bg-gray-200 dark:bg-gray-700 p-4 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-gray-300 dark:bg-gray-600 rounded" />
          ))}
        </div>
        {/* Chat window skeleton */}
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 space-y-4">
          <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3" />
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
          <div className="h-full bg-gray-300 dark:bg-gray-600 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-screen'>
      <Navbar />
      {/* Mobile/tablet view: show only chat list or chat window */}
      {isMobile ? (
        selectedChat ? (
            <ChatWindow
              chat={selectedChat}
              userId={user!.id}
              onClose={() => setSelectedChat(null)}
            />
        ) : (
          <div className="h-full w-screen">
            <ChatList
              chats={chats}
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              onDeleteChat={async (chatId) => {
                if (confirm('Delete this chat?')) {
                  try {
                    await chatAPI.deleteChat(chatId);
                    setChats((prev) => prev.filter((c) => c._id !== chatId));
                    if (selectedChat?._id === chatId) setSelectedChat(null);
                    toast.success('Chat deleted');
                  } catch (err) {
                    console.error('Delete chat failed', err);
                    toast.error('Failed to delete chat');
                  }
                }
              }}
              currentUserId={user!.id}
            />
          </div>
        )
      ) : (
        // Desktop view: show both chat list and chat window
        <div className="flex h-full rounded overflow-hidden">
          <ChatList
            chats={chats}
            selectedChat={selectedChat}
            onSelectChat={setSelectedChat}
            onDeleteChat={async (chatId) => {
              if (confirm('Delete this chat?')) {
                try {
                  await chatAPI.deleteChat(chatId);
                  setChats((prev) => prev.filter((c) => c._id !== chatId));
                  if (selectedChat?._id === chatId) setSelectedChat(null);
                  toast.success('Chat deleted');
                } catch (err) {
                  console.error('Delete chat failed', err);
                  toast.error('Failed to delete chat');
                }
              }
            }}
            currentUserId={user!.id}
          />
          <div className='flex w-full h-full'>
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                userId={user!.id}
                onClose={() => setSelectedChat(null)}
              />
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-accent-foreground/50">Select a chat to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;