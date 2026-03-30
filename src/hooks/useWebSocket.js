import { useRef, useCallback } from 'react';

export function useWebSocket(url, onOpen, onMessage, onError, onClose) {
  const wsRef = useRef(null);
  
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      wsRef.current = new WebSocket(url);
      
      // Enforce raw binary parsing for streaming chunks from backend
      wsRef.current.binaryType = 'arraybuffer'; 

      wsRef.current.onopen = () => { if (onOpen) onOpen(); };
      wsRef.current.onmessage = (event) => { if (onMessage) onMessage(event.data); };
      wsRef.current.onclose = () => { if (onClose) onClose(); };
      
      wsRef.current.onerror = (err) => {
        console.error("WebSocket Communication error:", err);
        if (onError) onError("WebSocket connection failed entirely. Start the backend app via uvicorn main:app.");
      };

    } catch (err) {
      if (onError) onError("Failed to setup WebSocket connection context: " + err.message);
    }
  }, [url, onOpen, onMessage, onError, onClose]);

  const sendAudioChunk = useCallback((blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(blob);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { connect, sendAudioChunk, disconnect };
}
