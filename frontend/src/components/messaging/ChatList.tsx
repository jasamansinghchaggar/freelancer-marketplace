import React, { useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut
} from '../ui/dropdown-menu';
import { RiDeleteBinLine, RiMore2Fill } from '@remixicon/react';

type Chat = {
    _id: string;
    participants: {
        _id: string;
        name: string;
        online?: boolean;
        lastSeen?: string;
    }[];
    updatedAt: string;
    lastMessage?: {
        content: string;
        createdAt: string;
    };
};

interface ChatListProps {
    chats: Chat[];
    selectedChat: Chat | null;
    onSelectChat: (chat: Chat) => void;
    onDeleteChat: (chatId: string) => void;
    currentUserId: string;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChat, onSelectChat, currentUserId, onDeleteChat }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = chats.filter(chat => {
        const other = chat.participants.find(u => u._id !== currentUserId);
        const name = other?.name.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return name.includes(term);
    });
    return (
        <div className="w-1/3 border-r overflow-y-auto">
            <h2 className="p-4 font-semibold">Chats</h2>
            <div className="px-4 mb-2">
                <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full border rounded p-2"
                />
            </div>
            {filtered.length === 0 ? (
                <p className="p-4 text-sm text-accent-foreground/70">No chats found</p>
            ) : (
                filtered.map((chat) => {
                    const other = chat.participants.find((u) => u._id !== currentUserId);
                    const name = other?.name || 'Unknown';
                    const isSelected = selectedChat?._id === chat._id;
                    return (
                        <div
                            key={chat._id}
                            onClick={() => onSelectChat(chat)}
                            className={`relative group p-4 hover:bg-accent cursor-pointer ${isSelected ? 'bg-accent' : ''} flex flex-row-reverse w-full items-center gap-2`}>
                            <div className="flex flex-col w-full">
                                <p className="text-md font-bold text-accent-foreground">{name}</p>
                                <div className='flex items-center justify-between'>
                                    <p className="text-sm text-accent-foreground/70 truncate">{chat.lastMessage?.content || ''}</p>
                                    <p className="text-sm text-accent-foreground/70">{chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' }) : ''}</p>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <RiMore2Fill size={16} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-24" align='start'>
                                    <DropdownMenuItem variant='destructive' className='text-red-600' onClick={(e) => { e.stopPropagation(); onDeleteChat(chat._id); }}>
                                        Delete
                                        <DropdownMenuShortcut>
                                            <RiDeleteBinLine />
                                        </DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ChatList;
