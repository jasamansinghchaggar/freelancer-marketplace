import React, { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut
} from '../ui/dropdown-menu';
import { useUnread } from '../../context/UnreadContext';
import { loadKeyPair, deriveSharedKey, decrypt } from '@/utils/crypto';
import { RiArrowLeftDownLine, RiArrowRightUpLine, RiDeleteBinLine, RiMore2Fill } from '@remixicon/react';
import { Link } from 'react-router-dom';

type Chat = {
    _id: string;
    participants: {
        _id: string;
        name: string;
        online?: boolean;
        lastSeen?: string;
        publicKey?: string;
    }[];
    updatedAt: string;
    lastMessage?: {
        content?: string;
        nonce?: string;
        cipher?: string;
        senderId?: string;
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
    const { unreadChats, clearUnread } = useUnread();
    // Decrypted preview of last messages
    const [decryptedLast, setDecryptedLast] = useState<Record<string, string>>({});
    const kp = loadKeyPair();
    const publicKey = kp?.publicKey;
    const secretKey = kp?.secretKey;
    useEffect(() => {
        const map: Record<string, string> = {};
        chats.forEach(chat => {
            const other = chat.participants.find(u => u._id !== currentUserId);
            let text = chat.lastMessage?.content || '';
            if (kp && other?.publicKey && chat.lastMessage?.nonce && chat.lastMessage?.cipher) {
                const shared = deriveSharedKey(kp.secretKey, other.publicKey);
                const dec = decrypt(shared, chat.lastMessage.nonce, chat.lastMessage.cipher);
                if (dec) text = dec;
            }
            map[chat._id] = text;
        });
        setDecryptedLast(map);
    }, [chats, currentUserId, publicKey, secretKey]);

    const filtered = chats.filter(chat => {
        const other = chat.participants.find(u => u._id !== currentUserId);
        const name = other?.name.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return name.includes(term);
    });
    return (
        <div className="w-full md:w-1/3 border-r overflow-y-auto h-full">
            <div className='flex items-center justify-between'>
                <h2 className="p-4 font-semibold">Chats</h2>
                <Link className='p-4 font-semibold underline underline-offset-2' to={"/"}>Back</Link>
            </div>
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
                            onClick={() => { clearUnread(chat._id); onSelectChat(chat); }}
                            className={`relative group p-4 hover:bg-accent cursor-pointer ${isSelected ? 'bg-accent' : ''} flex flex-row-reverse w-full items-center gap-2`}>
                            {unreadChats.has(chat._id) && (
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full z-20" />
                            )}
                            <div className="flex flex-col w-full">
                                <p className="text-md font-bold text-accent-foreground">{name}</p>
                                <div className='flex items-center justify-between'>
                                    <p className="text-sm text-accent-foreground/70 truncate flex items-center gap-1">
                                        {chat.lastMessage?.senderId === currentUserId ? (
                                            <span><RiArrowRightUpLine className='text-green-500' size={16}/></span>
                                        ) : (
                                            <span><RiArrowLeftDownLine className='text-destructive' size={16}/></span>
                                        )}
                                        {decryptedLast[chat._id] ?? chat.lastMessage?.content ?? ''}
                                    </p>
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
