import { useRef, useCallback, useEffect } from 'react';

export function useMicrophone(onAudioData, onError, isDisabled = false, forcedMuteRef, isMuted = false, onPartialTranscript) {
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const micActiveRef = useRef(false);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micAnalyserRef = useRef(null);   // ← exported so visualizer can read frequency data
  const silenceTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const isDisabledRef = useRef(isDisabled);

  // Sync prop to ref for closure safety
  useEffect(() => {
    isDisabledRef.current = isDisabled || isMuted;
    
    // Explicit hardware-level mute/unmute
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isDisabled && !(forcedMuteRef && forcedMuteRef.current);
      });
    }

    // Immediate stop if disabled
    if ((isDisabled || isMuted || (forcedMuteRef && forcedMuteRef.current)) && isSpeakingRef.current && mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        isSpeakingRef.current = false;
      }
    }
  }, [isDisabled, isMuted]);


  const startMic = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      micActiveRef.current = true;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          let interimText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (!event.results[i].isFinal) {
              interimText += event.results[i][0].transcript;
            }
          }
          if (onPartialTranscript && interimText) {
            onPartialTranscript(interimText);
          }
        };

        recognitionRef.current.onend = () => {
          if (micActiveRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        };
        try { recognitionRef.current.start(); } catch (e) {}
      }
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(streamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      micAnalyserRef.current = analyser;   // ← expose to callers
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      // Reverting to default MediaRecorder to avoid "400 - Decoding Error" across different Browsers/Whisper
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0 && onAudioData && !forcedMuteRef.current) {
          onAudioData(event.data);
        }
      };

      const detectSound = () => {
        if (!streamRef.current) return;
        
        // Check BOTH standard prop-ref and synchronous signaling ref
        const isCurrentlyMuted = isDisabledRef.current || (forcedMuteRef && forcedMuteRef.current);

        if (isCurrentlyMuted) {
          if (isSpeakingRef.current) {
            isSpeakingRef.current = false;
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
          }
          // Extra safety: ensure tracks are disabled if we forgot in useEffect
          streamRef.current.getAudioTracks().forEach(t => t.enabled = false);

          animationFrameRef.current = requestAnimationFrame(detectSound);
          return;
        } else {
          // Unmute tracks if we are not disabled
          streamRef.current.getAudioTracks().forEach(t => t.enabled = true);
        }

        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((S, v) => S + v, 0);
        const average = sum / dataArray.length;

        if (average > 15) { // Bumped to 15 for noise immunity
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
            const isCurrentlyMuted = isDisabledRef.current || (forcedMuteRef && forcedMuteRef.current);
            if (mediaRecorderRef.current.state === 'inactive' && !isCurrentlyMuted) {
              mediaRecorderRef.current.start();
              
              setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                   mediaRecorderRef.current.stop();
                   isSpeakingRef.current = false;
                }
              }, 30000);
            }
          }
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else {
          if (isSpeakingRef.current && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              isSpeakingRef.current = false;
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
            }, 800); 
          }
        }
        animationFrameRef.current = requestAnimationFrame(detectSound);
      };

      detectSound();
      return true;
    } catch (err) {
      console.error("Microphone Access Error:", err);
      if (onError) onError("Microphone access denied.");
      return false;
    }
  }, [onAudioData, onError]);

  const stopMic = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    
    micActiveRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(e => console.error("Error closing audio context:", e));
      audioCtxRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    isSpeakingRef.current = false;
  }, []);

  return { startMic, stopMic, micAnalyserRef };
}
