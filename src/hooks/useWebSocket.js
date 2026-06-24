import { useRef, useCallback, useEffect } from 'react';

export function useWebSocket(url, onOpen, onMessage, onError, onClose) {
  const wsRef = useRef(null);
  // Guards against onClose firing during intentional disconnect() calls.
  // Without this, disconnect() → ws.onclose → handleStop() poisons state
  // during session resets, making restarts impossible without a page refresh.
  const intentionalCloseRef = useRef(false);
  
  // Refs to prevent stale closures on callbacks without triggering reconnection loops
  const callbacksRef = useRef({ onOpen, onMessage, onError, onClose });
  useEffect(() => {
    callbacksRef.current = { onOpen, onMessage, onError, onClose };
  }, [onOpen, onMessage, onError, onClose]);
  
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Clear the intentional-close flag on every new connection
    intentionalCloseRef.current = false;

    try {
      console.log("[useWebSocket] Connecting to:", url);
      wsRef.current = new WebSocket(url);
      
      // Enforce raw binary parsing for streaming chunks from backend
      wsRef.current.binaryType = 'arraybuffer'; 

      wsRef.current.onopen = () => { if (callbacksRef.current.onOpen) callbacksRef.current.onOpen(); };
      wsRef.current.onmessage = (event) => { if (callbacksRef.current.onMessage) callbacksRef.current.onMessage(event.data); };
      wsRef.current.onclose = () => {
        // Only fire the callback for unexpected disconnections.
        // Intentional disconnect() calls set the flag to suppress this.
        if (!intentionalCloseRef.current) {
          if (callbacksRef.current.onClose) callbacksRef.current.onClose();
        }
      };
      
      wsRef.current.onerror = (err) => {
        console.error("WebSocket Communication error:", err);
        if (callbacksRef.current.onError) callbacksRef.current.onError("WebSocket connection failed entirely. Start the backend app via uvicorn main:app.");
      };

    } catch (err) {
      if (callbacksRef.current.onError) callbacksRef.current.onError("Failed to setup WebSocket connection context: " + err.message);
    }
  }, [url]);

  const sendAudioChunk = useCallback((blob) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(blob);
    }
  }, []);

  const sendMessage = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      intentionalCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { connect, sendAudioChunk, sendMessage, disconnect };
}
