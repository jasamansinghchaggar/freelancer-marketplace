import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { chatAPI } from '@/services/api';
import socket from '@/socket';
import { toast } from 'sonner';
import ChatList from '@/components/messaging/ChatList';
import ChatWindow from '@/components/messaging/ChatWindow';
import { useUnread } from '@/context/UnreadContext';
import { useLocation } from 'react-router-dom';

const Messages: React.FC = () => {
  const { user, loading } = useAuth();
  const { addUnread } = useUnread();
  const location = useLocation();
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);

  // Update chats and selectedChat on user status changes
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

  // Notify when a message arrives for a non-active chat
  useEffect(() => {
    const handler = (msg: any) => {
      const chatId = msg.chatId || msg.chat;
      if (selectedChat?._id !== chatId) {
        // mark chat as unread and notify
        addUnread(chatId);
        const chat = chats.find((c) => c._id === chatId);
        const other = chat?.participants.find((p: any) => p._id !== user!.id);
        const name = other?.name || 'Someone';
        toast.success(`New message from ${name}`, { description: msg.content });
      }
    };
    socket.on('receiveMessage', handler);
    return () => {
      socket.off('receiveMessage', handler);
    };
  }, [selectedChat, chats, user]);

  // Handle initial chat passed from navigation state (GigDetail) or via query param
  useEffect(() => {
    const state = (location.state as any) || {};
    if (state.initialChat) {
      const init = state.initialChat;
      // add to list if not present
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
      <Layout>
        <p>Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-[85vh] border rounded overflow-hidden">
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
    </Layout>
  );
};

export default Messages;
