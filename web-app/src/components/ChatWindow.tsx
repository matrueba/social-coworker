'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';
import Icon from './Icon';
import { ChatMessage, sendChatMessage } from '../data/mocks';

const suggestions = [
    '¿Qué ayudas sociales hay disponibles?',
    '¿Cómo elaborar un informe de caso?',
    '¿Recursos ante riesgo de desahucio?',
    '¿Protocolo de protección de menores?',
    '¿Programas de inserción laboral?',
];

const ChatWindow = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (text?: string) => {
        const messageText = text ?? input.trim();
        if (!messageText || isLoading) return;

        const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const response = await sendChatMessage(messageText);
            setMessages((prev) => [...prev, response]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Auto-resize textarea
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    return (
        <div className={styles.chatContainer}>
            {messages.length === 0 ? (
                <div className={styles.welcomeState}>
                    <span className={styles.welcomeIcon}><Icon name="sparkles" size={30} /></span>
                    <h2 className={styles.welcomeTitle}>Chat con tu Base de Conocimiento</h2>
                    <p className={styles.welcomeSubtitle}>
                        Pregunta sobre protocolos, normativas, recursos disponibles o cualquier
                        información almacenada en tu base de conocimiento RAG.
                    </p>
                    <div className={styles.suggestions}>
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                className={styles.suggestionChip}
                                onClick={() => handleSend(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className={styles.messagesArea}>
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${styles.messageBubble} ${msg.role === 'user' ? styles.messageUser : ''
                                }`}
                        >
                            <div
                                className={`${styles.avatar} ${msg.role === 'user'
                                        ? styles.avatarUser
                                        : styles.avatarAssistant
                                    }`}
                            >
                                <Icon name={msg.role === 'user' ? 'user' : 'bot'} size={18} />
                            </div>
                            <div
                                className={`${styles.messageContent} ${msg.role === 'user'
                                        ? styles.messageContentUser
                                        : styles.messageContentAssistant
                                    }`}
                            >
                                {msg.content}
                                {msg.sources && msg.sources.length > 0 && (
                                    <div className={styles.sources}>
                                        {msg.sources.map((src, i) => (
                                            <span key={i} className={styles.sourceBadge}>
                                                <Icon name="file" /> {src}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className={styles.typingIndicator}>
                            <div className={`${styles.avatar} ${styles.avatarAssistant}`}>
                                <Icon name="bot" size={18} />
                            </div>
                            <div className={styles.typingDots}>
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                                <span className={styles.dot} />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            <div className={styles.inputArea}>
                <textarea
                    ref={textareaRef}
                    className={styles.chatInput}
                    placeholder="Escribe tu pregunta sobre la base de conocimiento..."
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isLoading}
                />
                <button
                    className={styles.sendButton}
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    title="Enviar mensaje"
                >
                    <Icon name="send" size={18} />
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;
