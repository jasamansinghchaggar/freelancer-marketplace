import React, { useState, useEffect, useRef } from 'react';
import { RiImageLine } from '@remixicon/react';
import { chatAPI } from '@/services/api';
import { loadKeyPair, deriveSharedKey, encrypt, decrypt } from '@/utils/crypto';
import socket from '@/socket';
import { RiPencilLine, RiDeleteBinLine, RiMore2Fill, RiCheckLine, RiCheckDoubleLine, RiCloseLine } from '@remixicon/react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';

type Chat = {
    _id: string;
    participants: {
        _id: string;
        name: string;
        online?: boolean;
        lastSeen?: string;
        publicKey?: string;
    }[];
};
type Message = {
    _id: string;
    senderId: string;
    content?: string;
    nonce?: string;
    cipher?: string;
    imageUrl?: string;
    createdAt: string;
    isRead: boolean;
    // local status for ticks: 'sending', 'delivered', 'read'
    status?: 'sending' | 'delivered' | 'read';
};

interface ChatWindowProps {
    chat: Chat;
    userId: string;
    onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, userId, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editingContent, setEditingContent] = useState<string>('');
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const chatId = chat._id;
        // load existing messages and decrypt if needed
        async function loadMsgs() {
            const res = await chatAPI.getMessages(chatId);
            const kp = loadKeyPair();
            const other = chat.participants.find(p => p._id !== userId);
            const shared = kp && other?.publicKey
                ? deriveSharedKey(kp.secretKey, other.publicKey)
                : null;
            const msgs = res.data.map((m: Message) => {
                let content = m.content || '';
                if (shared && m.nonce && m.cipher) {
                    const dec = decrypt(shared, m.nonce, m.cipher);
                    if (dec) content = dec;
                }
                return { ...m, content, status: m.isRead ? 'read' : 'delivered' };
            });
            setMessages(msgs);
        }
        loadMsgs();
        socket.emit('joinChat', chatId);
        const receiveHandler = (msg: Message) => {
            setMessages((prev) => {
                const filtered = prev.filter((m) => !m._id.startsWith('temp-'));
            // decrypt incoming message if encrypted
            const kp = loadKeyPair();
            const other = chat.participants.find(p => p._id !== userId);
            let content = msg.content || '';
            if (kp && other?.publicKey && msg.nonce && msg.cipher) {
                const shared = deriveSharedKey(kp.secretKey, other.publicKey);
                const dec = decrypt(shared, msg.nonce, msg.cipher);
                if (dec) content = dec;
            }
            return [
                ...filtered,
                { ...msg, content, status: msg.isRead ? 'read' : 'delivered' }
            ];
            });
        };
        socket.on('receiveMessage', receiveHandler);
        return () => {
            socket.off('receiveMessage', receiveHandler);
        };
    }, [chat._id]);

    const sendMessage = () => {
        const chatId = chat._id;
        const text = newMessage.trim();
        if (!text) return;
        const tempId = `temp-${Date.now()}`;
        const tempMsg: Message = {
            _id: tempId,
            senderId: userId,
            content: text,
            imageUrl: undefined,
            createdAt: new Date().toISOString(),
            isRead: false,
            status: 'sending'
        };
        setMessages((prev) => [...prev, tempMsg]);
        // prepare payload: encrypt if possible
        const kp = loadKeyPair();
        const other = chat.participants.find(p => p._id !== userId);
        let payload: any = { chatId, senderId: userId };
        if (kp && other?.publicKey) {
            const shared = deriveSharedKey(kp.secretKey, other.publicKey);
            const box = encrypt(shared, text);
            payload = { ...payload, nonce: box.nonce, cipher: box.data };
        } else {
            payload = { ...payload, content: text };
        }
        socket.emit('sendMessage', payload);
        setNewMessage('');
    };
    // Handle image file selection and upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // upload image via API, socket will handle display
        chatAPI.uploadImage(chat._id, file).catch(err => console.error('Image upload failed', err));
        // reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
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
    // Confirmation dialog state for deleting a message
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [msgToDelete, setMsgToDelete] = useState<string | null>(null);
    const openDeleteDialog = (messageId: string) => {
        setMsgToDelete(messageId);
        setDeleteDialogOpen(true);
    };
    const confirmDeleteMessage = async () => {
        if (!msgToDelete) return;
        try {
            await chatAPI.deleteMessage(chat._id, msgToDelete);
            setMessages((prev) => prev.filter((m) => m._id !== msgToDelete));
        } catch (err) {
            console.error('Delete message failed', err);
        }
        setDeleteDialogOpen(false);
        setMsgToDelete(null);
    };
    // Typing indicator state and handler
    const [otherTyping, setOtherTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        const typingHandler = (data: { chatId: string; userId: string }) => {
            if (data.chatId === chat._id && data.userId !== userId) {
                setOtherTyping(true);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 2000);
            }
        };
        socket.on('typing', typingHandler);
        return () => {
            socket.off('typing', typingHandler);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [chat._id, userId]);
    // Listen for read receipt acknowledgments
    useEffect(() => {
        const handleMessageRead = (data: { messageId: string }) => {
            setMessages(prev => prev.map(m =>
                m._id === data.messageId ? { ...m, status: 'read', isRead: true } : m
            ));
        };
        socket.on('messageRead', handleMessageRead);
        return () => { socket.off('messageRead', handleMessageRead); };
    }, []);

    // Emit read receipt for incoming messages
    useEffect(() => {
        messages.forEach(msg => {
            if (msg.senderId !== userId && msg.status !== 'read') {
                socket.emit('readMessage', { chatId: chat._id, messageId: msg._id });
            }
        });
    }, [messages, chat._id, userId]);

    return (
        <div className="w-full h-full flex flex-col relative">
            {/* Delete confirmation dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Message</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>Are you sure you want to delete this message?</DialogDescription>
                    <DialogFooter className="space-x-2">
                        <Button variant={"outline"} onClick={() => { setDeleteDialogOpen(false); setMsgToDelete(null); }} className="px-4 py-2 rounded">Cancel</Button>
                        <Button variant={"destructive"} onClick={confirmDeleteMessage} className="px-4 py-2 rounded">Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                <Button variant="ghost" onClick={onClose} className="p-2">
                    <RiCloseLine size={20} />
                </Button>
            </div>
            <div
                ref={containerRef}
                className="relative flex flex-col h-full overflow-y-auto p-4 pt-16 scrollbar-hide"
            >
                {messages.map((msg, index) => {
                    const msgDate = new Date(msg.createdAt).toDateString();
                    const prevDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                    return (
                        <React.Fragment key={msg._id}>
                            {/* Date separator */}
                            {prevDate !== msgDate && (
                                <div className="text-center text-xs text-gray-500 my-2">
                                    {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                            )}
                            {/* Message bubble */}
                            <div className={`mb-2 relative group ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                                {editingMessageId === msg._id ? (
                                    <div>
                                        <input
                                            className="w-full border rounded p-2 mb-1 outline-none"
                                            value={editingContent}
                                            onChange={(e) => setEditingContent(e.target.value)}
                                        />
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="outline" onClick={cancelEdit} className="px-4 py-2 rounded">Cancel</Button>
                                            <Button onClick={saveEdit} className="px-4 py-2 rounded">Save</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`flex items-center ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                                        {msg.senderId === userId && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <RiMore2Fill size={16} />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-24" align="start">
                                                    <DropdownMenuItem onClick={() => startEditing(msg)}>
                                                        Edit
                                                        <DropdownMenuShortcut>
                                                            <RiPencilLine />
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem variant="destructive" onClick={() => openDeleteDialog(msg._id)}>
                                                        Delete
                                                        <DropdownMenuShortcut>
                                                            <RiDeleteBinLine />
                                                        </DropdownMenuShortcut>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                        <div className="inline-flex items-end ml-2">
                                            {msg.imageUrl ? (
                                                <img src={msg.imageUrl} alt="Chat Image" className="inline-block max-w-full md:max-w-xs rounded" />
                                            ) : (
                                                <div className="inline-block p-2 rounded bg-accent">{msg.content}</div>
                                            )}
                                            <div className="inline-flex items-center text-xs text-accent-foreground/50 ml-2 space-x-1">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h12' })}
                                                {msg.senderId === userId && msg.status && (
                                                    msg.status === 'sending' ? (
                                                        <RiCheckLine size={12} className="ml-1 text-gray-400" />
                                                    ) : (
                                                        <RiCheckDoubleLine size={12} className={`${msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'} ml-1`} />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
                {otherTyping && (
                    <span className="absolute bottom-0 left-0 p-2 text-xs text-accent-foreground/50 mr-2">Typing...</span>
                )}
            </div>
            <div className="p-4 border-t flex items-center space-x-2">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    id="chat-image-upload"
                />
                <label htmlFor="chat-image-upload" className="cursor-pointer text-accent-foreground">
                    <RiImageLine size={24} />
                </label>
                <input
                    className="flex-1 border rounded p-2 outline-none"
                    value={newMessage}
                    onChange={(e) => {
                        setNewMessage(e.target.value);
                        socket.emit('typing', { chatId: chat._id, senderId: userId });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
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
