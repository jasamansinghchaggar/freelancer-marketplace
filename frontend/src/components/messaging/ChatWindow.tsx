import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '@/services/api';
import socket from '@/socket';

type Chat = {
    _id: string;
    participants: {
        _id: string;
        name: string;
        online?: boolean;
        lastSeen?: string;
    }[];
};
type Message = {
    _id: string;
    senderId: string;
    content?: string;
    imageUrl?: string;
    createdAt: string;
};

interface ChatWindowProps {
    chat: Chat;
    userId: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, userId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const chatId = chat._id;
        chatAPI.getMessages(chatId).then((res) => setMessages(res.data));
        socket.emit('joinChat', chatId);
        socket.on('receiveMessage', (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });
        return () => {
            socket.off('receiveMessage');
        };
    }, [chat._id]);

    const sendMessage = () => {
        const chatId = chat._id;
        if (!newMessage.trim()) return;
        socket.emit('sendMessage', { chatId, senderId: userId, content: newMessage });
        setNewMessage('');
    };
    const other = chat.participants.find((u) => u._id !== userId);
    const otherName = other?.name || 'Unknown';
    const [status, setStatus] = useState<{ online: boolean; lastSeen?: string }>({
        online: other?.online ?? false,
        lastSeen: other?.lastSeen,
    });
    useEffect(() => {
        const handler = (data: { userId: string; online: boolean; lastSeen?: string }) => {
            if (data.userId === other?._id) {
                setStatus({ online: data.online, lastSeen: data.lastSeen });
            }
        };
        socket.on('userStatus', handler);
        return () => {
            socket.off('userStatus', handler);
        };
    }, [other?._id]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className="absolute w-full top-0 border-b px-4 py-2 flex items-center justify-between z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {otherName.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="font-semibold">{otherName}</span>
                        {status.online ? (
                            <span className="text-xs text-green-500">Online</span>
                        ) : (
                            <span className="text-xs text-gray-500">
                                Last seen {status.lastSeen ? new Date(status.lastSeen).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', hourCycle: 'h12' }) : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div
                ref={containerRef}
                className="flex flex-col h-full overflow-y-auto p-4 pt-16 scrollbar-hide"
            >
                {messages.map((msg) => (
                    <div key={msg._id} className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                        <div className="inline-block p-2 rounded bg-accent">{msg.content}</div>
                        <div className="text-xs text-accent-foreground/50">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit', minute: '2-digit', hourCycle: 'h12'
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t flex">
                <input
                    className="flex-1 border rounded p-2 mr-2"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="px-4 py-2 bg-accent">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
