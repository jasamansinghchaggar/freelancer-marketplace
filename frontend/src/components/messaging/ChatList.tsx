import React from 'react';

type Chat = {
  _id: string;
  participants: {
    _id: string;
    name: string;
    online?: boolean;
    lastSeen?: string;
  }[];
  updatedAt: string;
};

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat, currentUserId }) => (
  <div className="w-1/3 border-r overflow-y-auto">
    <h2 className="p-4 font-semibold">Chats</h2>
    {chats.map((chat) => {
      // display the other participant’s name
      const other = chat.participants.find((u) => u._id !== currentUserId);
      const name = other?.name || 'Unknown';
      const isSelected = selectedChat?._id === chat._id;
      return (
        <div
          key={chat._id}
          onClick={() => onSelectChat(chat)}
          className={`p-4 hover:bg-accent cursor-pointer ${isSelected ? 'bg-accent-foreground/40' : ''}`}>
          <p className="text-sm text-accent-foreground">{name}</p>
          {other?.online ? (
            <p className="text-xs text-green-500">Online</p>
          ) : (
            <p className="text-xs text-gray-500">
              Last seen {other?.lastSeen ? new Date(other.lastSeen).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', hourCycle: 'h12' }) : ''}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

export default ChatList;
