import { useRef, useCallback, useState } from 'react';

export function usePlayback(onSpeakingChange) {
  const audioContextRef = useRef(null);
  const nextStartTimeRef = useRef(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeSourcesRef = useRef(0);

  const initPlayback = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playPCMChunk = useCallback((arrayBuffer) => {
    initPlayback();
    
    try {
      const int16Array = new Int16Array(arrayBuffer);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);

      const currentTime = audioContextRef.current.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }

      // Track speaking state
      activeSourcesRef.current++;
      if (activeSourcesRef.current === 1 && onSpeakingChange) {
        onSpeakingChange(true); // Immediate notification
      }
      setIsSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current--;
        if (activeSourcesRef.current <= 0) {
          activeSourcesRef.current = 0;
          if (onSpeakingChange) onSpeakingChange(false); // Signal done in real-time
          setIsSpeaking(false);
        }
      };

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (err) {
      console.error("Playback error:", err);
    }
  }, [initPlayback, onSpeakingChange]);

  const stopPlayback = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;
    activeSourcesRef.current = 0;
    if (onSpeakingChange) onSpeakingChange(false);
    setIsSpeaking(false);
  }, [onSpeakingChange]);

  return { initPlayback, playPCMChunk, stopPlayback, isSpeaking };
}
