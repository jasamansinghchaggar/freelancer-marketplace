import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '@/services/api';
import socket from '@/socket';
import { RiPencilLine, RiDeleteBinLine, RiMore2Fill } from '@remixicon/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu';

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
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const chatId = chat._id;
        chatAPI.getMessages(chatId).then((res) => setMessages(res.data));
        socket.emit('joinChat', chatId);
        const receiveHandler = (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        };
        socket.on('receiveMessage', receiveHandler);
        return () => {
            socket.off('receiveMessage', receiveHandler);
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

    const startEditing = (msg: Message) => {
        setEditingMessageId(msg._id);
        setEditingContent(msg.content || '');
    };
    const cancelEdit = () => {
        setEditingMessageId(null);
        setEditingContent('');
    };
    const saveEdit = async () => {
        if (!editingMessageId) return;
        try {
            const res = await chatAPI.updateMessage(chat._id, editingMessageId, editingContent);
            setMessages((prev) => prev.map((m) => m._id === editingMessageId ? res.data : m));
            setEditingMessageId(null);
            setEditingContent('');
        } catch (err) {
            console.error('Edit message failed', err);
        }
    };
    // Delete a single message
    const handleDeleteMessage = async (messageId: string) => {
        if (confirm('Delete this message?')) {
            try {
                await chatAPI.deleteMessage(chat._id, messageId);
                setMessages((prev) => prev.filter((m) => m._id !== messageId));
            } catch (err) {
                console.error('Delete message failed', err);
            }
        }
    };

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
                    <div key={msg._id} className={`mb-2 relative group ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                        {editingMessageId === msg._id ? (
                            <div>
                                <input
                                    className="w-full border rounded p-2 mb-1 outline-none"
                                    value={editingContent}
                                    onChange={(e) => setEditingContent(e.target.value)}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={saveEdit} className="text-sm text-green-500">Save</button>
                                    <button onClick={cancelEdit} className="text-sm text-red-500">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={`flex items-center ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                                    {msg.senderId === userId && (
                                        <>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <RiMore2Fill size={16} />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-24" align='start'>
                                                    <DropdownMenuItem onClick={() => startEditing(msg)}>
                                                        Edit
                                                        <DropdownMenuShortcut>
                                                            <RiPencilLine />
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant='destructive' onClick={() => handleDeleteMessage(msg._id)}>
                                                        Delete
                                                        <DropdownMenuShortcut>
                                                            <RiDeleteBinLine />
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            {/* <button
                                            onClick={() => startEditing(msg)}
                                            className="text-xs text-accent hover:text-accent-foreground/20 mr-2"
                                          >
                                            <RiPencilLine />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteMessage(msg._id)}
                                            className="text-xs text-red-500 hover:text-red-700 mr-2"
                                          >
                                            <RiDeleteBinLine />
                                          </button> */}
                                        </>
                                    )}
                                    <div className='flex items-end'>
                                        <div className="inline-block p-2 rounded bg-accent">{msg.content}</div>
                                        <div className="text-xs text-accent-foreground/50 inline-block ml-2">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' })}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="p-4 border-t flex">
                <input
                    className="flex-1 border rounded p-2 mr-2 outline-none"
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
