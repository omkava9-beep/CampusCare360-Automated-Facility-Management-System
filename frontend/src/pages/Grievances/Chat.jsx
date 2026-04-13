import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Send, User as UserIcon } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import './Chat.css';

const Chat = ({ grievanceId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const { socket } = useSocket();
    const chatEndRef = useRef(null);

    const getApiUrl = () => import.meta.env.VITE_API_URL?.replace(/\/$/, '');

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Fetch existing messages
        fetch(`${getApiUrl()}/api/v1/user/chat/${grievanceId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('contractorToken')}` }
        })
        .then(res => res.json())
        .then(data => setMessages(data.data || []));

        if (socket) {
            socket.emit('joinTicket', grievanceId);
            socket.on('newMessage', (msg) => {
                setMessages(prev => [...prev, msg]);
            });

            return () => socket.off('newMessage');
        }
    }, [grievanceId, socket]);

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(`${getApiUrl()}/api/v1/user/chat/send`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('contractorToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ grievanceId, text: newMessage })
            });
            const data = await response.json();
            if (response.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="chat-container glass-panel">
            <div className="chat-header">
                <h3>Direct Communication</h3>
                <p>Chat with Admin regarding this ticket</p>
            </div>
            
            <div className="chat-messages">
                {messages.map((msg, i) => (
                    <div key={i} className={`message-wrap ${msg.sender._id === currentUser._id ? 'own' : 'other'}`}>
                        <div className="message-content">
                            <span className="sender-name">{msg.sender.fName} {msg.sender.lastName}</span>
                            <p className="message-text">{msg.text}</p>
                            <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            <form className="chat-input" onSubmit={handleSend}>
                <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default Chat;
