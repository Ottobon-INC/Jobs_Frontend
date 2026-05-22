import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE_URL } from '../utils/constants';

/**
 * Specialized WebSocket hook for the Chat/Coach Terminal.
 * Handles the JSON-based chat protocol defined in routers/chat.py
 */
export function useChatWebSocket(sessionId) {
    const [messages, setMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [sessionStatus, setSessionStatus] = useState('active_ai');
    
    const socketRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    const connect = useCallback(() => {
        if (!sessionId || socketRef.current) return;

        const url = `${WS_BASE_URL}/ws/chat/${sessionId}`;
        console.log(`Connecting to chat node: ${url}`);
        
        try {
            const ws = new WebSocket(url);
            socketRef.current = ws;

            ws.onopen = () => {
                // Ensure we only update state if this is still the active socket
                if (socketRef.current !== ws) return;
                
                console.info("Chat stream established.");
                setIsConnected(true);
                if (reconnectTimerRef.current) {
                    clearTimeout(reconnectTimerRef.current);
                    reconnectTimerRef.current = null;
                }
            };

            ws.onmessage = (event) => {
                if (event.data === "__pong__") return;
                
                try {
                    const data = JSON.parse(event.data);
                    
                    switch (data.type) {
                        case 'history_replay':
                            // Initialize messages with past logs from DB
                            setMessages(data.messages || []);
                            setSessionStatus(data.session_status || 'active_ai');
                            break;
                            
                        case 'ai_reply':
                            // Add AI message to terminal
                            const aiMessage = {
                                role: 'assistant',
                                content: data.content,
                                timestamp: new Date().toISOString()
                            };
                            setMessages(prev => [...prev, aiMessage]);
                            setIsTyping(false);
                            break;

                        case 'queued':
                            // Handle redirect to human admin mode
                            setMessages(prev => [...prev, {
                                role: 'system',
                                content: data.content || "An expert will join the session shortly."
                            }]);
                            setSessionStatus('active_human');
                            setIsTyping(false);
                            break;

                        default:
                            console.warn("Unrecognized signal type:", data.type);
                    }
                } catch (err) {
                    console.error("Signal parsing violation:", err, event.data);
                }
            };

            ws.onclose = (event) => {
                // Only clear the ref if it currently points to this closing socket
                if (socketRef.current === ws) {
                    socketRef.current = null;
                    setIsConnected(false);
                }
                
                console.warn(`Chat stream offline (Code: ${event.code}).`);
                
                // Don't reconnect if it was a clean close or a session error
                if (event.code !== 1000 && event.code !== 4004 && event.code !== 4003) {
                    if (!reconnectTimerRef.current) {
                        console.info("Initiating reconnection sequence...");
                        reconnectTimerRef.current = setTimeout(connect, 3000);
                    }
                }
            };

            ws.onerror = (err) => {
                console.error("Chat communication failure:", err);
                ws.close();
            };

        } catch (err) {
            console.error("Failed to initialize chat context:", err);
        }
    }, [sessionId]);

    const disconnect = useCallback(() => {
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (socketRef.current) {
            const ws = socketRef.current;
            socketRef.current = null; // Clear ref first to prevent race
            
            // Only close if it's not already closing or closed
            if (ws.readyState !== WebSocket.CLOSED && ws.readyState !== WebSocket.CLOSING) {
                ws.close();
            }
        }
        setIsConnected(false);
    }, []);

    useEffect(() => {
        connect();
        return () => disconnect();
    }, [connect, disconnect]);

    const sendMessage = useCallback((content) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            console.error("Message rejected: Stream offline.");
            return;
        }

        // Add user message to state immediately for responsiveness
        const userMsg = {
            role: 'user',
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        
        // Show typing indicator
        setIsTyping(true);
        
        // Push to server
        socketRef.current.send(content);
    }, []);

    return {
        messages,
        sendMessage,
        isConnected,
        isTyping,
        sessionStatus
    };
}
