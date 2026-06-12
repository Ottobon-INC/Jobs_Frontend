import { useRef, useCallback, useEffect } from 'react';

export function useMicrophone(onAudioData, onError, isDisabled = false, forcedMuteRef, isMuted = false, onPartialTranscript, onUserSpeechStart) {
  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const recognitionRunningRef = useRef(false);
  const micActiveRef = useRef(false);
  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const micAnalyserRef = useRef(null);   // ← exported so visualizer can read frequency data
  const silenceTimerRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const animationFrameRef = useRef(null);
  const isDisabledRef = useRef(isDisabled);
  const noiseFloorRef = useRef(2.0);

  // Sync prop to ref for closure safety
  useEffect(() => {
    isDisabledRef.current = isDisabled || isMuted;
    const isCurrentlyMuted = isDisabled || isMuted || (forcedMuteRef && forcedMuteRef.current);
    
    // Explicit hardware-level mute/unmute
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isCurrentlyMuted;
      });
    }

    // Immediate stop if disabled
    if (isCurrentlyMuted && isSpeakingRef.current && mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        isSpeakingRef.current = false;
      }
    }

    // Sync speech recognition running state
    if (recognitionRef.current) {
      if (isCurrentlyMuted) {
        if (recognitionRunningRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRunningRef.current = false;
          } catch (e) {
            console.error("Error stopping SpeechRecognition:", e);
          }
        }
        if (onPartialTranscript) onPartialTranscript(''); // Clear stale text
      } else {
        if (!recognitionRunningRef.current && micActiveRef.current) {
          try {
            recognitionRef.current.start();
            recognitionRunningRef.current = true;
          } catch (e) {
            // Ignore - might already be starting/running
          }
        }
      }
    }
  }, [isDisabled, isMuted, forcedMuteRef, onPartialTranscript]);

  // Forced mute watcher to detect flip changes rapidly
  useEffect(() => {
    if (!forcedMuteRef) return;
    let lastMuteState = forcedMuteRef.current;
    
    const intervalId = setInterval(() => {
      const currentMuteState = forcedMuteRef.current;
      if (currentMuteState !== lastMuteState) {
        lastMuteState = currentMuteState;
        
        const isCurrentlyMuted = isDisabledRef.current || currentMuteState;
        
        if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach(track => {
            track.enabled = !isCurrentlyMuted;
          });
        }
        
        if (isCurrentlyMuted) {
          if (isSpeakingRef.current && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            isSpeakingRef.current = false;
          }
          if (recognitionRef.current && recognitionRunningRef.current) {
            try {
              recognitionRef.current.stop();
              recognitionRunningRef.current = false;
            } catch (e) {}
          }
          if (onPartialTranscript) onPartialTranscript('');
        } else {
          if (recognitionRef.current && !recognitionRunningRef.current && micActiveRef.current) {
            try {
              recognitionRef.current.start();
              recognitionRunningRef.current = true;
            } catch (e) {}
          }
        }
      }
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [forcedMuteRef, onPartialTranscript]);

  const startMic = useCallback(async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          suppressLocalAudioPlayback: true,
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
          let finalText = '';
          // Iterate from event.resultIndex to avoid stale accumulation
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript;
            } else {
              interimText += event.results[i][0].transcript;
            }
          }
          const textVal = (finalText + ' ' + interimText).trim() || '';
          console.log("[TRANSCRIPT]", {
            source: 'SpeechRecognition',
            text: textVal,
            timestamp: performance.now()
          });
          if (onPartialTranscript) {
            // Keep final text visible until backend WebSocket transcript replaces it
            onPartialTranscript(textVal);
          }
          // Note: do NOT send finalText here — Whisper handles final STT.
          // Web Speech API final results are ignored for accuracy reasons.
        };

        recognitionRef.current.onstart = () => {
          recognitionRunningRef.current = true;
        };

        recognitionRef.current.onend = () => {
          recognitionRunningRef.current = false;
          const isCurrentlyMuted = isDisabledRef.current || (forcedMuteRef && forcedMuteRef.current);
          if (
            micActiveRef.current && 
            recognitionRef.current &&
            !isCurrentlyMuted
          ) {
            try { 
              recognitionRef.current.start(); 
              recognitionRunningRef.current = true;
            } catch (e) {
              // Ignore — recognition may already be starting
            }
          }
        };
        try { 
          recognitionRef.current.start(); 
          recognitionRunningRef.current = true;
        } catch (e) {}
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

        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += Math.abs(dataArray[i] - 128);
        }
        const volume = sum / dataArray.length;

        // Update adaptive noise floor
        let currentNoiseFloor = noiseFloorRef.current;
        if (volume < currentNoiseFloor) {
          currentNoiseFloor = currentNoiseFloor * 0.95 + volume * 0.05;
        } else {
          currentNoiseFloor = currentNoiseFloor * 0.995 + volume * 0.005;
        }
        noiseFloorRef.current = currentNoiseFloor;

        // Speech threshold is dynamically set above the noise floor
        const speechThreshold = Math.max(3.0, currentNoiseFloor + 3.5);
        const isSpeechDetected = volume > speechThreshold;

        if (isSpeechDetected) {
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
            // Fire the speech-start callback for interruption detection
            if (typeof onUserSpeechStart === 'function') {
              onUserSpeechStart();
            }
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
  }, [onAudioData, onError, onPartialTranscript, onUserSpeechStart]);

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
    
    // Clear partial transcript on stop
    if (onPartialTranscript) onPartialTranscript('');
    
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
