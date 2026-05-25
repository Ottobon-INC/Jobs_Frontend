# Mock Interview Voice Pipeline Core Files

This document compiles the core frontend and backend files powering the synchronized, low-latency, and interactive voice mock interview module. All sensitive credentials, specific endpoints, and private configurations have been safely abstracted or verified to prevent any information leakage.

---

## Table of Contents
1. [Frontend: useMicrophone.js](#1-frontend-usemicrophonejs)
2. [Frontend: useAudioStreamer.js](#2-frontend-useaudiostreamerjs)
3. [Frontend: useWebSocket.js](#3-frontend-usewebsocketjs)
4. [Backend: mock_interview/router.py (WebSocket Router)](#4-backend-mock_interviewrouterpy-websocket-router)
5. [Backend: mock_interview/orchestrator.py (Orchestrator)](#5-backend-mock_intervieworchestratorpy-orchestrator)
6. [Backend: mock_interview/services/stt.py (STT Service)](#6-backend-mock_interviewservicessttpy-stt-service)

---

## 1. Frontend: `useMicrophone.js`
**Path:** `Jobs_frontend/src/hooks/useMicrophone.js`
*Manages browser microphone access, implements local voice activity detection (VAD), and feeds raw WebM audio data chunks while keeping local visualizer state synchronized.*

```javascript
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

  // Sync prop to ref for closure safety
  useEffect(() => {
    isDisabledRef.current = isDisabled || isMuted;
    const isCurrentlyMuted = isDisabled || isMuted;
    
    // Explicit hardware-level mute/unmute
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !isCurrentlyMuted && !(forcedMuteRef && forcedMuteRef.current);
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
  }, [isDisabled, isMuted]);


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
          // Iterate from 0 to capture ALL final results in the current recognition session
          for (let i = 0; i < event.results.length; i++) {
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
          if (
            micActiveRef.current && 
            recognitionRef.current &&
            !isDisabledRef.current
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

        analyser.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((S, v) => S + v, 0);
        const average = sum / dataArray.length;

        if (average > 12) {
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
```

---

## 2. Frontend: `useAudioStreamer.js`
**Path:** `Jobs_frontend/src/hooks/useAudioStreamer.js`
*Implements sentence-streaming audio playback with auto WAV header detection & stripping, jitter buffering (80ms), and precise audio-text schedule synchronization.*

```javascript
/**
 * useAudioStreamer.js
 * Sentence-streaming audio hook for the Mock Interview AI voice pipeline.
 *
 * v2 (Deterministic Sync Refactor):
 *  - WAV header detection & stripping on the first chunk per SENTENCE
 *    (backend sends 44-byte RIFF header before the first PCM chunk of each sentence)
 *  - Per-sentence jitter buffer: buffers 80ms of audio before starting playback
 *  - Readiness gate: playback starts only when BOTH schedule + minimum PCM buffer
 *    are ready. This ensures audio and text start in lockstep.
 *  - sentenceId tagging on all operations for precise audio-text correlation
 *  - AnalyserNode exposed for SiriVisualizer real-time waveform sync
 *  - stopAudio(): immediate interruption for round transitions (closes AudioContext)
 *  - stopSentenceAudio(): cancels only the active sentence without closing AudioContext
 *  - resetForNextSentence(): resets per-sentence state without closing AudioContext
 *  - isSpeaking state for UI feedback
 *  - onPlaybackStart({ sentenceId, wallClockMs }): fires the moment the first PCM
 *    buffer of a sentence is scheduled. Used to anchor word timestamps.
 */

import { useRef, useCallback, useState } from 'react';

// Reduced from 150ms → 80ms: sentences are shorter so we need to start faster
const JITTER_BUFFER_MS = 80;
const SAMPLE_RATE = 24000;     // Must match backend TTS output (OpenAI PCM = 24kHz)
const BITS_PER_SAMPLE = 16;    // OpenAI PCM is signed 16-bit
const CHANNELS = 1;            // Mono

// Bytes of audio that equal JITTER_BUFFER_MS of playback
const BYTES_PER_MS = (SAMPLE_RATE * CHANNELS * (BITS_PER_SAMPLE / 8)) / 1000;
const BUFFER_THRESHOLD_BYTES = JITTER_BUFFER_MS * BYTES_PER_MS;

/** Check whether an ArrayBuffer starts with the RIFF magic bytes "RIFF" */
function _hasWavHeader(buffer) {
    if (buffer.byteLength < 4) return false;
    const view = new Uint8Array(buffer, 0, 4);
    // RIFF = 0x52 0x49 0x46 0x46
    return view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46;
}

/** Strip the 44-byte WAV header from an ArrayBuffer, returning just the PCM data. */
function _stripWavHeader(buffer) {
    return buffer.slice(44);
}

/** Convert a raw PCM Int16 ArrayBuffer into a Web Audio AudioBuffer */
function _pcmToAudioBuffer(ctx, pcmBuffer) {
    const int16 = new Int16Array(pcmBuffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
    }
    const audioBuffer = ctx.createBuffer(CHANNELS, float32.length, SAMPLE_RATE);
    audioBuffer.getChannelData(0).set(float32);
    return audioBuffer;
}

/**
 * @param {function} onSpeakingChange   - (isSpeaking: bool) => void
 * @param {function} onPlaybackStart    - ({ sentenceId, audioCtxTime, wallClockMs }) => void
 *   Fired ONCE per sentence, at the exact moment the first PCM buffer is
 *   scheduled to start. The caller uses this to anchor per-sentence word timestamps.
 */
export function useAudioStreamer(onSpeakingChange, onPlaybackStart) {
    const audioCtxRef       = useRef(null);
    const analyserRef       = useRef(null);
    const gainRef           = useRef(null);
    const nextStartTimeRef  = useRef(0);
    const activeSourcesRef  = useRef(0);
    const pendingBytesRef   = useRef(0);   // accumulated buffer size before flush (per sentence)
    const pendingChunksRef  = useRef([]);  // queued raw PCM ArrayBuffers (per sentence)
    const isFirstChunkRef   = useRef(true); // tracks WAV header stripping per SENTENCE
    const bufferFlushedRef  = useRef(false); // tracks if we've started playing this sentence

    // Current sentence ID being processed
    const currentSentenceIdRef = useRef(null);

    // Whether schedule has been received for the current sentence
    const scheduleReadyRef = useRef(false);

    // Whether we've already fired onPlaybackStart for the current sentence
    const playbackStartFiredRef = useRef(false);

    // Track active BufferSourceNode references for interruption
    const activeSourceNodesRef = useRef([]);

    const [isSpeaking, setIsSpeaking] = useState(false);

    // ── Init AudioContext + analyser graph ────────────────────────────────────
    const _ensureContext = useCallback(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;

            // Analyser node — consumers (SiriVisualizer) can read from this
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.8;
            analyserRef.current = analyser;

            // Gain node — gives us a central volume control point
            const gain = ctx.createGain();
            gain.gain.value = 1.0;
            gainRef.current = gain;

            // Graph: source → analyser → gain → destination
            analyser.connect(gain);
            gain.connect(ctx.destination);

            nextStartTimeRef.current = 0;
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // ── Schedule a single PCM buffer for playback ─────────────────────────────
    const _scheduleBuffer = useCallback((pcmBuffer, isFirst = false) => {
        const ctx = audioCtxRef.current;
        if (!ctx || pcmBuffer.byteLength === 0) return;

        try {
            const audioBuffer = _pcmToAudioBuffer(ctx, pcmBuffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(analyserRef.current);  // route through analyser

            const now = ctx.currentTime;
            if (nextStartTimeRef.current < now) {
                nextStartTimeRef.current = now;
            }

            // ── Fire the playback-start notification ONCE per sentence ──────
            if (isFirst && !playbackStartFiredRef.current) {
                playbackStartFiredRef.current = true;
                const scheduleOffsetMs = Math.max(0, (nextStartTimeRef.current - now) * 1000);
                const wallClockMs = Date.now() + scheduleOffsetMs;

                if (typeof onPlaybackStart === 'function') {
                    onPlaybackStart({
                        sentenceId: currentSentenceIdRef.current,
                        audioCtxTime: nextStartTimeRef.current,
                        wallClockMs,
                    });
                }
            }

            activeSourcesRef.current++;
            activeSourceNodesRef.current.push(source);

            if (activeSourcesRef.current === 1) {
                setIsSpeaking(true);
                if (onSpeakingChange) onSpeakingChange(true);
            }

            source.onended = () => {
                activeSourcesRef.current = Math.max(0, activeSourcesRef.current - 1);
                // Remove from active list
                const idx = activeSourceNodesRef.current.indexOf(source);
                if (idx !== -1) activeSourceNodesRef.current.splice(idx, 1);

                if (activeSourcesRef.current === 0) {
                    setIsSpeaking(false);
                    if (onSpeakingChange) onSpeakingChange(false);
                }
            };

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
        } catch (err) {
            console.error('[useAudioStreamer] Playback scheduling error:', err);
        }
    }, [onSpeakingChange, onPlaybackStart]);

    // ── Flush queued chunks to the scheduler ─────────────────────────────────
    const _flushBuffer = useCallback(() => {
        const chunks = pendingChunksRef.current.splice(0);
        pendingBytesRef.current = 0;

        chunks.forEach((chunk, idx) => {
            // Mark the first chunk of this flush as "isFirst" so the
            // onPlaybackStart callback is fired for it.
            _scheduleBuffer(chunk, idx === 0);
        });
        bufferFlushedRef.current = true;
    }, [_scheduleBuffer]);

    // ── Check readiness and flush if both conditions met ─────────────────────
    const _checkAndFlush = useCallback(() => {
        if (bufferFlushedRef.current) return; // already flushing/flushed

        const hasEnoughPcm = pendingBytesRef.current >= BUFFER_THRESHOLD_BYTES;
        const hasSchedule = scheduleReadyRef.current;

        // Start playback when BOTH schedule AND minimum PCM buffer are ready
        if (hasEnoughPcm && hasSchedule) {
            _flushBuffer();
        }
    }, [_flushBuffer]);

    // ── Public: mark schedule as ready for current sentence ──────────────────
    const markScheduleReady = useCallback((sentenceId) => {
        // Only apply if it matches the current sentence
        if (sentenceId !== undefined && sentenceId !== currentSentenceIdRef.current) {
            return;
        }
        scheduleReadyRef.current = true;
        // Attempt flush now that schedule is ready
        _checkAndFlush();
    }, [_checkAndFlush]);

    // ── Public: feed a raw ArrayBuffer chunk from the WebSocket ───────────────
    const feedChunk = useCallback((arrayBuffer, sentenceId) => {
        _ensureContext();

        // Update current sentence ID if provided
        if (sentenceId !== undefined) {
            currentSentenceIdRef.current = sentenceId;
        }

        let pcm = arrayBuffer;

        // Strip WAV header from the very first chunk of each sentence
        if (isFirstChunkRef.current) {
            if (_hasWavHeader(arrayBuffer)) {
                pcm = _stripWavHeader(arrayBuffer);
            }
            isFirstChunkRef.current = false;
        }

        if (pcm.byteLength === 0) return;

        pendingChunksRef.current.push(pcm);
        pendingBytesRef.current += pcm.byteLength;

        // Try readiness-gated flush
        if (!bufferFlushedRef.current) {
            _checkAndFlush();
        } else {
            // Buffer already started — schedule immediately.
            _scheduleBuffer(pcm, false);
            pendingChunksRef.current.pop(); // already scheduled, remove from queue
        }
    }, [_ensureContext, _checkAndFlush, _scheduleBuffer]);

    // ── Public: call when sentence_complete or response_done is received ──────
    // Flushes any leftover buffered chunks that didn't meet the threshold
    const flushRemaining = useCallback(() => {
        if (!bufferFlushedRef.current && pendingChunksRef.current.length > 0) {
            // Force flush even without schedule — underrun case
            _flushBuffer();
        }
        // DO NOT reset per-sentence state here — resetForNextSentence does that.
    }, [_flushBuffer]);

    // ── Public: reset per-sentence state WITHOUT closing AudioContext ─────────
    // Called by MockInterviewPage on each sentence_text event, before feeding
    // audio chunks for the new sentence. Keeps AudioContext open for seamless
    // back-to-back sentence playback (critical for perceived continuity).
    const resetForNextSentence = useCallback(() => {
        isFirstChunkRef.current = true;
        bufferFlushedRef.current = false;
        playbackStartFiredRef.current = false;
        scheduleReadyRef.current = false;
        pendingBytesRef.current = 0;
        pendingChunksRef.current = [];
        currentSentenceIdRef.current = null;
    }, []);

    // ── Public: stop only the active sentence's audio (for interruption) ─────
    // Does NOT close AudioContext — allows immediate restart for next sentence
    const stopSentenceAudio = useCallback(() => {
        // Stop all currently scheduled buffer sources
        activeSourceNodesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { /* ignore — may already be stopped */ }
        });
        activeSourceNodesRef.current = [];

        // Reset per-sentence state
        activeSourcesRef.current = 0;
        pendingBytesRef.current = 0;
        pendingChunksRef.current = [];
        isFirstChunkRef.current = true;
        bufferFlushedRef.current = false;
        playbackStartFiredRef.current = false;
        scheduleReadyRef.current = false;
        currentSentenceIdRef.current = null;

        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
    }, [onSpeakingChange]);

    // ── Public: immediate stop (round transitions, session end) ───────────────
    const stopAudio = useCallback(() => {
        // Stop all active sources first
        activeSourceNodesRef.current.forEach(source => {
            try { source.stop(); } catch (e) { /* ignore */ }
        });
        activeSourceNodesRef.current = [];

        // Close and null out the AudioContext — all scheduled sources are cancelled
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
            analyserRef.current = null;
            gainRef.current = null;
        }
        // Reset all state
        nextStartTimeRef.current = 0;
        activeSourcesRef.current = 0;
        pendingBytesRef.current = 0;
        pendingChunksRef.current = [];
        isFirstChunkRef.current = true;
        bufferFlushedRef.current = false;
        playbackStartFiredRef.current = false;
        scheduleReadyRef.current = false;
        currentSentenceIdRef.current = null;
        setIsSpeaking(false);
        if (onSpeakingChange) onSpeakingChange(false);
    }, [onSpeakingChange]);

    // ── Public: init (call on user gesture before interview starts) ───────────
    const initStreamer = useCallback(() => {
        _ensureContext();
    }, [_ensureContext]);

    return {
        initStreamer,
        feedChunk,
        flushRemaining,
        resetForNextSentence,
        markScheduleReady,     // NEW — signal that schedule is ready for current sentence
        stopSentenceAudio,     // NEW — cancel active sentence without closing AudioContext
        stopAudio,
        isSpeaking,
        /** Pass this ref's .current to SiriVisualizer for real audio waveform sync */
        analyserNode: analyserRef,
        /** Exposed so callers can compute elapsed audio time when needed */
        audioCtxRef,
    };
}
```

---

## 3. Frontend: `useWebSocket.js`
**Path:** `Jobs_frontend/src/hooks/useWebSocket.js`
*Provides state-safe duplex WebSocket wrapping with intentional-close filtering to prevent session restart loops.*

```javascript
import { useRef, useCallback } from 'react';

export function useWebSocket(url, onOpen, onMessage, onError, onClose) {
  const wsRef = useRef(null);
  // Guards against onClose firing during intentional disconnect() calls.
  // Without this, disconnect() → ws.onclose → handleStop() poisons state
  // during session resets, making restarts impossible without a page refresh.
  const intentionalCloseRef = useRef(false);
  
  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    // Clear the intentional-close flag on every new connection
    intentionalCloseRef.current = false;

    try {
      wsRef.current = new WebSocket(url);
      
      // Enforce raw binary parsing for streaming chunks from backend
      wsRef.current.binaryType = 'arraybuffer'; 

      wsRef.current.onopen = () => { if (onOpen) onOpen(); };
      wsRef.current.onmessage = (event) => { if (onMessage) onMessage(event.data); };
      wsRef.current.onclose = () => {
        // Only fire the callback for unexpected disconnections.
        // Intentional disconnect() calls set the flag to suppress this.
        if (!intentionalCloseRef.current) {
          if (onClose) onClose();
        }
      };
      
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
      intentionalCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  return { connect, sendAudioChunk, disconnect };
}
```

---

## 4. Backend: `mock_interview/router.py` (WebSocket Router)
**Path:** `Jobs_backend/app/mock_interview/router.py`
*Exposes high-performance FastAPI HTTP endpoints and WebSocket controllers. Includes strict secure file upload constraints, message-based auth token extraction, and a dynamic task interrupt mechanism.*

```python
"""
mock_interview/router.py
FastAPI router exposing all mock interview HTTP + WebSocket endpoints.
Mounted at /mock prefix on the main jobs.backend app.
"""

import asyncio
import json
import logging
import struct
import uuid

from fastapi import APIRouter, UploadFile, File, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from enum import Enum

from app.dependencies import get_db
from app.services.auth_service import get_current_user, _verify_token_locally

from app.mock_interview.orchestrator import (
    orchestrate,
    orchestrate_text_input,
    orchestrate_greeting,
    clean_llm_response,
)
from app.mock_interview.services.session import (
    get_full_transcript_text,
    manage_session,
    append_to_session,
    active_sessions,
    set_resume_text,
    get_resume_text,
    set_job_context,
    get_job_context,
    set_interview_mode,
    get_interview_mode,
    set_rounds_config,
    get_rounds_config,
    set_interview_duration,
    set_interview_input_mode,
    get_interview_input_mode,
    set_interrupted,
    get_user_has_spoken,
)
from app.mock_interview.services.context import get_context
from app.mock_interview.services.llm import generate_response
from app.mock_interview.services.stt import speech_to_text
from app.utils.security import sanitize_for_llm  # SECURITY FIX: import sanitiser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mock", tags=["Mock Interview"])

# ── File Upload Security Constants ────────────────────────────────────────────
ALLOWED_MIME_TYPES: frozenset[str] = frozenset({"application/pdf", "text/plain"})
ALLOWED_EXTENSIONS: frozenset[str] = frozenset({".pdf", ".txt"})
MAX_FILE_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB


# ── Persona Details Registry ──────────────────────────────────────────────────
PERSONA_DETAILS: Dict[str, Dict[str, Any]] = {
    "Marcus Reid": {
        "name": "Marcus Reid",
        "title": "Senior Engineering Manager",
        "style": "Direct, methodical, deeply technical",
        "years_at_company": 9,
        "glassdoor_rating": 4.4,
    },
    "Sarah Kim": {
        "name": "Sarah Kim",
        "title": "Engineering Lead",
        "style": "Warm, collaborative, rigorous",
        "years_at_company": 5,
        "glassdoor_rating": 4.7,
    },
    "Jordan Lee": {
        "name": "Jordan Lee",
        "title": "Principal Engineer",
        "style": "Challenging, high standards",
        "years_at_company": 12,
        "glassdoor_rating": 3.9,
    },
    "Priya Sharma": {
        "name": "Priya Sharma",
        "title": "Co-Founder & CTO",
        "style": "Fast, energetic, scenario-driven",
        "years_at_company": 4,
        "glassdoor_rating": 4.5,
    },
}

PERSONA_NAME_MAP: Dict[str, str] = {
    "Neutral": "Marcus Reid",
    "Friendly": "Sarah Kim",
    "Tough": "Jordan Lee",
    "Speed Round": "Priya Sharma",
}


def _resolve_persona_name(persona_key: str) -> str:
    """Resolve a persona key (legacy style or direct name) to a named persona."""
    if persona_key in PERSONA_DETAILS:
        return persona_key
    return PERSONA_NAME_MAP.get(persona_key, "Marcus Reid")


# ── WAV header utility ─────────────────────────────────────────────────────────
def _generate_wav_header(
    sample_rate: int = 24000,
    channels: int = 1,
    bits_per_sample: int = 16,
    data_size: int = 0,
) -> bytes:
    """
    Build a minimal RIFF/WAV header for raw PCM data.
    Returns exactly 44 bytes.
    """
    byte_rate = sample_rate * channels * bits_per_sample // 8
    block_align = channels * bits_per_sample // 8
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",           # ChunkID
        chunk_size,        # ChunkSize
        b"WAVE",           # Format
        b"fmt ",           # Subchunk1ID
        16,                # Subchunk1Size (PCM)
        1,                 # AudioFormat (PCM = 1)
        channels,          # NumChannels
        sample_rate,       # SampleRate
        byte_rate,         # ByteRate
        block_align,       # BlockAlign
        bits_per_sample,   # BitsPerSample
        b"data",           # Subchunk2ID
        data_size,         # Subchunk2Size (0 = streaming)
    )
    return header


async def _ping_loop(websocket: WebSocket) -> None:
    """Send a JSON ping every 20 s to prevent proxy timeouts."""
    try:
        while True:
            await asyncio.sleep(20)
            await websocket.send_text(json.dumps({"type": "ping"}))
    except Exception:
        pass


# ── Pydantic request models ────────────────────────────────────────────────────
class InterviewModeEnum(str, Enum):
    technical = "technical"
    hr = "hr"
    hybrid = "hybrid"

class InterviewInputModeEnum(str, Enum):
    voice = "voice"
    text = "text"
    hybrid = "hybrid"


class JobContextRequest(BaseModel):
    company_name: str = Field(default="", max_length=200)
    job_description: str = Field(default="", max_length=5000)
    session_id: str = Field(default="default_session", min_length=1, max_length=128)


class ModeRequest(BaseModel):
    mode: str = Field(..., min_length=1, max_length=50)
    session_id: str = Field(default="default_session", min_length=1, max_length=128)
    duration_minutes: int = Field(default=15, ge=1, le=180)
    interviewer_persona: str = Field(default="Neutral", min_length=1, max_length=100)
    whiteboard_mode: bool = False
    interview_input_mode: str = Field(default="voice", min_length=1, max_length=20)


class InterviewRoundItem(BaseModel):
    round_name: str = Field(..., min_length=1, max_length=100)
    focus_description: str = Field(..., min_length=1, max_length=500)
    question_limit: int = Field(default=3, ge=1, le=20)


class InterviewStructureRequest(BaseModel):
    session_id: str = Field(default="default_session", min_length=1, max_length=128)
    rounds: List[InterviewRoundItem] = Field(..., min_length=1, max_length=10)


# ── HTTP Endpoints ─────────────────────────────────────────────────────────────
@router.post("/upload_resume")
async def upload_resume(
    file: UploadFile = File(...),
    session_id: str = "default_session",
):
    """
    Upload a resume PDF or TXT file for the mock interview session.
    """
    content_type = file.content_type or ""
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{content_type}'. Only PDF and plain text files are accepted.",
        )

    original_filename = file.filename or ""
    ext = ""
    if "." in original_filename:
        ext = "." + original_filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Invalid file extension. Only .pdf and .txt files are accepted.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    safe_filename = f"{uuid.uuid4()}{ext}"
    logger.info("Resume upload: original='%s' → safe='%s' session='%s'", original_filename, safe_filename, session_id)

    try:
        text = extract_text_from_file(contents, safe_filename)
        if not text:
            raise HTTPException(status_code=422, detail="Failed to extract text from the uploaded file.")

        text = sanitize_for_llm(text, "resume_text")
        await set_resume_text(session_id, text)
        return {"message": "Resume uploaded successfully.", "preview": text[:200] + "..."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Resume upload processing error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error processing resume.")


@router.post("/update_job_context")
async def update_job_context(request: JobContextRequest):
    try:
        safe_company = sanitize_for_llm(request.company_name, "company_name")
        safe_desc = sanitize_for_llm(request.job_description, "job_description")
        await set_job_context(request.session_id, safe_company, safe_desc)
        return {"message": "Job context updated successfully."}
    except Exception as exc:
        logger.error("Job context update error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.post("/set_mode")
async def set_mode(request: ModeRequest):
    try:
        await set_interview_mode(request.session_id, request.mode)
        rounds = await get_rounds_config(request.session_id)
        num_rounds = len(rounds) if rounds else 1
        await set_interview_duration(
            request.session_id,
            request.duration_minutes,
            num_rounds
        )

        if request.session_id in active_sessions:
            resolved_name = _resolve_persona_name(request.interviewer_persona)
            active_sessions[request.session_id]["interviewer_persona"] = request.interviewer_persona
            active_sessions[request.session_id]["interviewer_persona_name"] = resolved_name
            active_sessions[request.session_id]["whiteboard_mode"] = request.whiteboard_mode

        await set_interview_input_mode(
            request.session_id,
            request.interview_input_mode
        )

        return {"message": f"Mode set to {request.mode}."}
    except Exception as exc:
        logger.error("Set mode error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.post("/set_interview_structure")
async def set_interview_structure(request: InterviewStructureRequest):
    try:
        rounds_list = [r.model_dump() for r in request.rounds]
        await set_rounds_config(request.session_id, rounds_list)
        logger.info(f"[{request.session_id}] Interview structure set: {[r['round_name'] for r in rounds_list]}")
        return {
            "message": f"Interview structure set with {len(rounds_list)} round(s).",
            "rounds": [r["round_name"] for r in rounds_list],
        }
    except Exception as exc:
        logger.error("Set interview structure error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.post("/analyze_resume")
async def analyze_resume(
    session_id: str = "default_session",
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    try:
        resume_text = await get_resume_text(session_id)
        if not resume_text and current_user:
            resume_text = current_user.get("resume_text", "")
            if resume_text:
                await set_resume_text(session_id, resume_text)

        if not resume_text:
            raise HTTPException(status_code=404, detail="No resume found in session or profile.")

        safe_resume = sanitize_for_llm(resume_text, "resume_text")
        analysis_prompt = (
            "Analyze the following resume text and provide a very concise summary (max 3-4 sentences). "
            "Highlight the candidate's top 3 technical skills and their most significant project or experience.\n\n"
            f"Resume Text:\n{safe_resume}"
        )

        full_response = ""
        async for chunk in generate_response(analysis_prompt, session_id=session_id):
            full_response += chunk
        return {"analysis": full_response}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Analyze resume error: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error.")


@router.get("/evaluate")
async def get_evaluation(session_id: str = "default_session"):
    transcript = await get_full_transcript_text(session_id)
    if not transcript:
        return {"error": "No interview transcript found."}
    return {"status": "pending_review", "message": "Submit the interview for admin review."}


# ── WebSocket Endpoint ─────────────────────────────────────────────────────────
@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: str = "default_session",
):
    await websocket.accept()

    user_resume = ""
    token: str | None = None

    try:
        first_msg = await asyncio.wait_for(websocket.receive(), timeout=5.0)
        if first_msg.get("text"):
            try:
                parsed = json.loads(first_msg["text"])
                if parsed.get("type") == "auth":
                    token = parsed.get("token", "")
            except Exception:
                pass
    except asyncio.TimeoutError:
        pass

    if token:
        try:
            user_id = _verify_token_locally(token)
            db = get_db()
            user = await db.get_user(user_id)
            if user:
                user_resume = user.get("resume_text", "")
            await websocket.send_text(json.dumps({"type": "auth_ok"}))
        except Exception as e:
            logger.warning("WebSocket auth failed: %s", e)
            await websocket.send_text(json.dumps({
                "type": "auth_error",
                "message": "Authentication failed. Proceeding as guest session.",
            }))

    resume_text = await get_resume_text(session_id)
    if not resume_text and user_resume:
        resume_text = user_resume
        await set_resume_text(session_id, resume_text)

    if not resume_text:
        await websocket.send_text(json.dumps({
            "type": "response",
            "text": "System: No resume found. Please upload your resume before starting.",
        }))
        await websocket.close()
        return

    ping_task = asyncio.create_task(_ping_loop(websocket))

    try:
        if session_id not in active_sessions:
            await manage_session(session_id)

        job_context = await get_job_context(session_id)
        company_name = job_context.get("company_name", "")
        interview_mode = await get_interview_mode(session_id)
        rounds_config = await get_rounds_config(session_id)
        
        if not rounds_config:
            rounds_config = [
                {
                    "round_name": "General Interview",
                    "focus_description": "Standard technical and behavioral questions.",
                    "question_limit": 999
                }
            ]

        session_data = active_sessions.get(session_id, {})
        persona_name = session_data.get("interviewer_persona_name", "Marcus Reid")
        persona_info = PERSONA_DETAILS.get(persona_name, PERSONA_DETAILS["Marcus Reid"]).copy()
        persona_info["company"] = company_name
        persona_info["type"] = "persona_info"

        await websocket.send_text(json.dumps(persona_info))

        # Build dynamic greeting
        greeting_prefix = f"Begin the interview by introducing yourself as {persona_name}. State your role as a "
        if interview_mode == "technical":
            greeting_prefix += "Technical Interviewer "
        else:
            greeting_prefix += "HR Recruiter "
        greeting_prefix += "and welcoming the candidate. "

        if company_name:
            greeting_prefix += f"Mention you are interviewing them for a position at {company_name}. "

        if rounds_config:
            round_names = " → ".join(r["round_name"] for r in rounds_config)
            greeting_prefix += (
                f"Mention this will be a structured interview with {len(rounds_config)} rounds: {round_names}. "
                f"Tell the candidate you are starting with the '{rounds_config[0]['round_name']}' round. "
            )
        
        greeting_prefix += "Mention you have their resume and are ready to dive in."

        context = await get_context("Greeting")
        if rounds_config:
            first_round = rounds_config[0]
            context = (
                f"[CURRENT_ROUND]: {first_round['round_name']}\n"
                f"[ROUND_FOCUS]: {first_round.get('focus_description', '')}\n"
                f"{context or ''}"
            )

        interview_input_mode = await get_interview_input_mode(session_id)
        is_text_mode = (interview_input_mode == 'text')

        full_greeting = await orchestrate_greeting(
            websocket=websocket,
            session_id=session_id,
            greeting_prompt=greeting_prefix,
            context=context,
            rounds_config=rounds_config,
            is_text_mode=is_text_mode,
        )
        import re
        full_greeting = re.sub(r'([.!?,;:])([A-Za-z])', r'\1 \2', full_greeting)
        full_greeting = re.sub(r' {2,}', ' ', full_greeting)
        full_greeting = full_greeting.strip()

        active_task: asyncio.Task | None = None

        async def _cancel_active_task() -> None:
            """Cancel the current orchestration task and emit assistant_interrupted."""
            nonlocal active_task
            if active_task and not active_task.done():
                await set_interrupted(session_id, True)
                active_task.cancel()
                try:
                    await active_task
                except (asyncio.CancelledError, Exception):
                    pass
                sess = active_sessions.get(session_id, {})
                try:
                    await websocket.send_text(json.dumps({
                        "type": "assistant_interrupted",
                        "turn_id": sess.get("current_turn_id", ""),
                        "utterance_id": sess.get("current_utterance_id", ""),
                        "last_sentence_id": sess.get("current_sentence_id", 0) - 1,
                    }))
                except Exception:
                    pass
            active_task = None

        while True:
            message = await websocket.receive()

            # Handle binary audio (voice mode)
            if message.get("bytes"):
                audio_data = message["bytes"]
                if active_task and not active_task.done():
                    await _cancel_active_task()
                active_task = asyncio.create_task(
                    orchestrate(websocket, audio_data, session_id)
                )

            # Handle text JSON (text mode, hybrid mode, and control messages)
            elif message.get("text"):
                try:
                    parsed = json.loads(message["text"])
                    msg_type = parsed.get("type", "")

                    if msg_type == "interrupt":
                        await _cancel_active_task()

                    elif msg_type in ("user_message", "text_input"):
                        user_text = parsed.get("text", "").strip()
                        if user_text:
                            if active_task and not active_task.done():
                                await _cancel_active_task()
                            active_task = asyncio.create_task(
                                orchestrate_text_input(websocket, user_text, session_id)
                            )

                except Exception as e:
                    logger.warning("Text message parse error: %s", e)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: %s", session_id)
    except Exception as exc:
        logger.error("WebSocket error [%s]: %s", session_id, exc, exc_info=True)
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "code": "PIPELINE_ERROR",
                "message": "The interviewer encountered an issue. Please try again.",
            }))
        except Exception:
            pass
    finally:
        if active_task and not active_task.done():
            active_task.cancel()
            try:
                await active_task
            except (asyncio.CancelledError, Exception):
                pass
        ping_task.cancel()
        try:
            await ping_task
        except asyncio.CancelledError:
            pass
```

---

## 5. Backend: `mock_interview/orchestrator.py` (Orchestrator)
**Path:** `Jobs_backend/app/mock_interview/orchestrator.py`
*Controls the high-performance pipeline loop (STT → context assembly → LLM generation → sentence tokenization & TTS generation → binary streaming). Coordinates round transitions, bridge transition prompting, time-adaptive behavior, and live debriefing.*

```python
"""
mock_interview/orchestrator.py
Pipeline controller that connects all services in order:
  audio bytes → STT → context → LLM → TTS → WebSocket
"""

import json
import logging
import re
import struct
import time
import asyncio
from fastapi import WebSocket

from app.mock_interview.services.stt import speech_to_text
from app.mock_interview.services.context import get_behavioral_questions
from app.mock_interview.services.llm import (
    generate_response,
    generate_round_summary,
    generate_instant_debrief,
)
from app.mock_interview.services.tts import text_to_speech_stream
from app.mock_interview.services.session import (
    manage_session,
    append_to_session,
    get_session_history,
    get_resume_text,
    get_job_context,
    get_interview_mode,
    set_interview_mode,
    increment_question_count,
    get_question_count,
    get_rounds_config,
    get_current_round_index,
    get_questions_in_current_round,
    increment_round_question_count,
    advance_round,
    get_user_has_spoken,
    set_user_has_spoken,
    get_round_start_time,
    get_time_budget_minutes,
    get_round_summary,
    set_round_summary,
    get_interviewer_persona,
    get_whiteboard_mode,
    get_round_time_remaining,
    get_interview_input_mode,
    active_sessions,
    new_turn,
    next_sentence_id,
    next_event_seq,
    set_interrupted,
    get_interrupted,
    check_and_store_transcript,
)

logger = logging.getLogger(__name__)

_COMMA_PAUSE_MS: int = 100
_SENTENCE_PAUSE_MS: int = 275
_SENTENCE_ENDERS = frozenset(".!?")

_SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+')


def clean_llm_response(text: str) -> str:
    """Fix common LLM streaming concatenation artifacts."""
    import re
    text = re.sub(r'([.!?])([A-Z])', r'\1 \2', text)
    text = re.sub(r',([A-Za-z])', r', \1', text)
    text = re.sub(r'^l([A-Z])', r'\1', text)
    text = re.sub(r' {2,}', ' ', text)
    return text.strip()


async def _send(websocket: WebSocket, session_id: str, payload: dict) -> None:
    """
    Emit a JSON WebSocket event with automatic protocol-ID injection (v8).
    """
    seq = await next_event_seq(session_id)
    sess = active_sessions.get(session_id, {})
    payload["turn_id"] = sess.get("current_turn_id", "")
    payload["utterance_id"] = sess.get("current_utterance_id", "")
    payload["event_seq"] = seq
    payload["server_ts_ms"] = int(time.time() * 1000)
    await websocket.send_text(json.dumps(payload))


def _strip_classification_tag(text: str) -> tuple[str, str]:
    """
    Parse and strip [MAIN_QUESTION] or [FOLLOW_UP] tag from the beginning
    of an LLM response. Returns (message_type, display_text).
    """
    stripped = text.strip()
    if stripped.startswith("[MAIN_QUESTION]"):
        return "main_question", stripped[len("[MAIN_QUESTION]"):].strip()
    elif stripped.startswith("[FOLLOW_UP]"):
        return "follow_up", stripped[len("[FOLLOW_UP]"):].strip()
    return "follow_up", stripped


def _count_syllables(word: str) -> int:
    word = word.lower().strip("'\"")
    if not word:
        return 1
    vowels = "aeiouy"
    count = 0
    prev_was_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_was_vowel:
            count += 1
        prev_was_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(count, 1)


def generate_word_schedule(text: str, total_duration_ms: int) -> list[dict]:
    raw_tokens = text.split()
    if not raw_tokens:
        return []

    clean_words: list[str] = []
    pause_after: list[int] = []

    for token in raw_tokens:
        last_char = token[-1] if token else ""
        if last_char in _SENTENCE_ENDERS:
            pause_after.append(_SENTENCE_PAUSE_MS)
        elif last_char == ",":
            pause_after.append(_COMMA_PAUSE_MS)
        else:
            pause_after.append(0)
        clean = token.strip(".,!?;:\"'()[]{}") or token
        clean_words.append(clean)

    syllables: list[int] = [_count_syllables(w) for w in clean_words]
    total_syllables = sum(syllables)

    total_pause_ms = sum(pause_after)
    speech_budget_ms = max(total_duration_ms - total_pause_ms, 0)

    if total_syllables == 0:
        total_syllables = 1

    raw_speech: list[float] = [(s / total_syllables) * speech_budget_ms for s in syllables]
    floored: list[int] = [int(d) for d in raw_speech]
    remainders: list[float] = [r - f for r, f in zip(raw_speech, floored)]

    allocated = sum(floored) + total_pause_ms
    leftover_ms = total_duration_ms - allocated
    if leftover_ms > 0:
        order = sorted(range(len(remainders)), key=lambda i: remainders[i], reverse=True)
        for idx in order[:leftover_ms]:
            floored[idx] += 1

    schedule: list[dict] = []
    cursor_ms = 0
    for i, token in enumerate(raw_tokens):
        duration = floored[i]
        schedule.append({
            "word": token,
            "start_ms": cursor_ms,
            "end_ms": cursor_ms + duration
        })
        cursor_ms += duration + pause_after[i]

    return schedule


async def stream_sentence_tts(
    websocket: WebSocket,
    sentence: str,
    session_id: str,
    sentence_id: int = 0,
) -> int:
    """
    Convert one sentence to speech and stream audio chunks immediately.
    """
    try:
        sentence = clean_llm_response(sentence)
        all_pcm = bytearray()
        async for chunk in text_to_speech_stream(sentence):
            all_pcm.extend(chunk)

        if not all_pcm:
            return 0

        duration_ms = round((len(all_pcm) / (24000 * 2)) * 1000)
        schedule = generate_word_schedule(sentence, duration_ms)

        await _send(websocket, session_id, {
            "type": "sentence_schedule",
            "sentence_id": sentence_id,
            "words": schedule,
            "duration_ms": duration_ms,
        })

        CHUNK_SIZE = 4096
        offset = 0
        first = True

        while offset < len(all_pcm):
            chunk_bytes = bytes(all_pcm[offset: offset + CHUNK_SIZE])
            if first:
                wav_hdr = struct.pack(
                    "<4sI4s4sIHHIIHH4sI",
                    b"RIFF", 36, b"WAVE", b"fmt ", 16, 1, 1,
                    24000, 48000, 2, 16, b"data", 0,
                )
                await websocket.send_bytes(wav_hdr + chunk_bytes)
                first = False
            else:
                await websocket.send_bytes(chunk_bytes)
            offset += CHUNK_SIZE

        await _send(websocket, session_id, {
            "type": "sentence_complete",
            "sentence_id": sentence_id,
        })

        return duration_ms

    except Exception as tts_exc:
        logger.error(
            "TTS error for session %s sentence '%s...': %s",
            session_id, sentence[:30], tts_exc,
        )
        return 0


async def _stream_sentences_from_llm(
    websocket: WebSocket,
    input_text: str,
    history: list,
    context: str,
    session_id: str,
    is_voice: bool,
    override_message_type: str | None = None,
) -> tuple[str, str]:
    """
    Core sentence-streaming pipeline: GPT-4o streaming → sentence buffering → TTS.
    """
    full_response = ""
    sentence_buffer = ""
    first_sentence_sent = False
    tag_stripped = False
    detected_message_type = override_message_type or "follow_up"

    async for chunk in generate_response(input_text, history, context):
        if full_response and not full_response.endswith(' ') and not chunk.startswith(' '):
            if chunk and chunk[0] not in ('.', ',', '!', '?', ';', ':', "'", '"', '`'):
                full_response += ' '
                sentence_buffer += ' '
        full_response += chunk
        sentence_buffer += chunk

        sentences = _SENTENCE_SPLIT.split(sentence_buffer)

        if len(sentences) > 1:
            complete_sentences = sentences[:-1]
            sentence_buffer = sentences[-1]

            for sentence in complete_sentences:
                sentence = clean_llm_response(sentence.strip())
                if not sentence:
                    continue

                if not tag_stripped:
                    llm_type, sentence = _strip_classification_tag(sentence)
                    if not override_message_type:
                        detected_message_type = llm_type
                    tag_stripped = True
                    if not sentence:
                        continue

                sid = await next_sentence_id(session_id)

                await _send(websocket, session_id, {
                    "type": "sentence_text",
                    "sentence_id": sid,
                    "text": sentence,
                    "is_first": not first_sentence_sent,
                    "message_type": detected_message_type,
                })

                if is_voice and not await get_interrupted(session_id):
                    await stream_sentence_tts(
                        websocket, sentence, session_id, sentence_id=sid
                    )

                first_sentence_sent = True

    if sentence_buffer.strip():
        sentence = clean_llm_response(sentence_buffer.strip())
        if sentence:
            if not tag_stripped:
                llm_type, sentence = _strip_classification_tag(sentence)
                if not override_message_type:
                    detected_message_type = llm_type
                tag_stripped = True
            if sentence:
                sid = await next_sentence_id(session_id)
                await _send(websocket, session_id, {
                    "type": "sentence_text",
                    "sentence_id": sid,
                    "text": sentence,
                    "is_first": not first_sentence_sent,
                    "message_type": detected_message_type,
                })
                if is_voice and not await get_interrupted(session_id):
                    await stream_sentence_tts(
                        websocket, sentence, session_id, sentence_id=sid
                    )

    _, display_text = _strip_classification_tag(clean_llm_response(full_response))
    return display_text, detected_message_type


async def _build_context(session_id: str) -> tuple[str, dict, str, int, int, str, str]:
    """
    Build the full LLM context string for a given session.
    """
    current_mode = await get_interview_mode(session_id)
    q_count = await get_question_count(session_id)
    rounds_config = await get_rounds_config(session_id)
    use_rounds = bool(rounds_config)

    if use_rounds:
        round_idx = await get_current_round_index(session_id)
        if round_idx >= len(rounds_config):
            round_idx = len(rounds_config) - 1
        active_round = rounds_config[round_idx]
        current_round_name = active_round.get("round_name", "General Interview")
        current_round_focus = active_round.get("focus_description", "")
        q_in_round = await get_questions_in_current_round(session_id)
    else:
        current_round_name = "General Interview"
        current_round_focus = ""
        q_in_round = q_count
        round_idx = 0

    job_context = await get_job_context(session_id)
    company_name = job_context.get("company_name", "")
    job_desc = job_context.get("job_description", "")

    context_parts = [f"[CURRENT_ROUND]: {current_round_name}"]
    if current_round_focus:
        context_parts.append(f"[ROUND_FOCUS]: {current_round_focus}")

    round_summary_text = await get_round_summary(session_id)
    if round_summary_text:
        context_parts.append(f"[ROUND_RECAP]: {round_summary_text}")

    if use_rounds:
        round_start = await get_round_start_time(session_id)
        time_budget = await get_time_budget_minutes(session_id)
        elapsed_seconds = time.time() - round_start
        remaining_seconds = int((time_budget * 60) - elapsed_seconds)

        context_parts.append(f"[REMAINING_TIME_SECONDS]: {remaining_seconds}")
        if remaining_seconds <= 60:
            context_parts.append("[WRAP_UP_NOW]: true")

        elapsed_minutes = elapsed_seconds / 60.0
        if elapsed_minutes < time_budget / 2:
            context_parts.append("[TIME_ADAPTIVE]: DRILL_DOWN")
        else:
            context_parts.append("[TIME_ADAPTIVE]: WRAP_UP")

    time_remaining = await get_round_time_remaining(session_id)
    context_parts.append(f"[TIME_REMAINING_SECONDS]: {int(time_remaining)}")

    input_mode = await get_interview_input_mode(session_id)
    context_parts.append(f"[INTERVIEW_INPUT_MODE]: {input_mode}")

    if not use_rounds:
        if q_count >= 7:
            context_parts.append("[SYSTEM_NOTE]: Final question. Conclude after this.")
        elif q_count >= 5:
            context_parts.append(f"[SYSTEM_NOTE]: asked {q_count}/7 questions.")

    if current_mode == "hr":
        bq = await get_behavioral_questions()
        if bq:
            context_parts.append(f"BEHAVIORAL_QUESTIONS:\n{bq}")

    resume_text = await get_resume_text(session_id)
    if resume_text:
        context_parts.append(f"CANDIDATE_RESUME_DATA:\n{resume_text[:300]}")
    if company_name:
        context_parts.append(f"[TARGET_COMPANY]: {company_name}")
    if job_desc:
        context_parts.append(f"[JOB_DESCRIPTION]: {job_desc[:200]}")
    if current_mode:
        context_parts.append(f"[INTERVIEW_MODE_SELECTED]: {current_mode}")

    persona = await get_interviewer_persona(session_id)
    whiteboard = await get_whiteboard_mode(session_id)
    if persona:
        context_parts.append(f"[INTERVIEWER_PERSONA]: {persona}")
    if whiteboard:
        context_parts.append("[WHITEBOARD_MODE]: true")

    context = "\n".join(context_parts)
    return context, job_context, current_round_name, round_idx, q_in_round, current_mode, company_name


async def _handle_round_state(
    websocket: WebSocket,
    session_id: str,
    rounds_config: list,
    round_idx: int,
    was_already_spoken: bool,
    is_auto_turn: bool,
    history: list,
    company_name: str,
    is_voice: bool,
) -> tuple[bool, bool, str, bool]:
    """
    Check round limits, advance rounds, generate bridge TTS, handle final debrief.
    """
    use_rounds = bool(rounds_config)
    if not use_rounds:
        if not is_auto_turn:
            await increment_question_count(session_id)
        return False, False, "", False

    if not is_auto_turn and was_already_spoken:
        await increment_round_question_count(session_id)

    q_in_round_updated = await get_questions_in_current_round(session_id)
    active_round = rounds_config[round_idx]
    limit = active_round.get("question_limit", 999)
    total_rounds = len(rounds_config)

    round_start = await get_round_start_time(session_id)
    time_budget = await get_time_budget_minutes(session_id)
    elapsed_seconds = time.time() - round_start
    remaining_seconds = int((time_budget * 60) - elapsed_seconds)

    time_limit_reached = remaining_seconds <= 0
    question_limit_reached = q_in_round_updated >= limit

    should_advance = (
        (question_limit_reached or time_limit_reached)
        and round_idx < total_rounds - 1
    )

    is_final_round_done = (
        (question_limit_reached or time_limit_reached)
        and round_idx == total_rounds - 1
    )

    if should_advance:
        new_idx = round_idx + 1
        next_round = rounds_config[new_idx]

        await websocket.send_text(json.dumps({
            "type": "round_time_up",
            "round_name": active_round.get("round_name", "General"),
            "next_round": next_round["round_name"],
            "seconds_remaining": 0,
        }))
        await asyncio.sleep(2.0)

        history_for_summary = await get_session_history(session_id)
        summary_text = await generate_round_summary(
            active_round.get("round_name", "General"),
            history_for_summary,
        )
        await set_round_summary(session_id, summary_text)
        logger.info(f"[{session_id}] Round summary stored: {summary_text[:80]}...")

        await advance_round(session_id)
        logger.info(f"[{session_id}] Round advance: {next_round['round_name']}")

        await websocket.send_text(json.dumps({
            "type": "round_change",
            "round_name": next_round["round_name"],
            "focus": next_round.get("focus_description", ""),
            "round_index": new_idx,
            "total_rounds": total_rounds,
            "rounds": [{"round_name": r["round_name"]} for r in rounds_config],
        }))

        prev_round_name = active_round.get("round_name", "Previous Round")
        next_round_name = next_round["round_name"]
        next_focus = next_round.get("focus_description", "")

        bridge_prompt = (
            f"[SYSTEM_INSTRUCTION]: Generate a 1-sentence professional summary of "
            f"the candidate's performance in the '{prev_round_name}' round and a "
            f"welcoming transition to the NEW round: '{next_round_name}'. "
            f"Keep it to 1-2 sentences MAX. Do NOT ask a question yet."
        )

        bridge_context_parts = [
            f"[CURRENT_ROUND]: {next_round_name}",
            f"[ROUND_FOCUS]: {next_focus}",
        ]
        if summary_text:
            bridge_context_parts.append(f"[ROUND_RECAP]: {summary_text}")
        bridge_context = "\n".join(bridge_context_parts)

        await _send(websocket, session_id, {"type": "response_start"})

        bridge_text, _ = await _stream_sentences_from_llm(
            websocket=websocket,
            input_text=bridge_prompt,
            history=history[-4:] if history else [],
            context=bridge_context,
            session_id=session_id,
            is_voice=is_voice,
            override_message_type="bridge",
        )

        if not bridge_text.strip():
            bridge_text = (
                f"Great effort on {prev_round_name}. "
                f"Let's now move on to {next_round_name}."
            )
            if is_voice:
                await stream_sentence_tts(websocket, bridge_text, session_id)

        logger.info(f"[{session_id}] Bridge: {bridge_text}")

        await _send(websocket, session_id, {
            "type": "response_text",
            "text": bridge_text,
            "message_type": "bridge",
            "round_index": new_idx,
            "round_name": next_round_name,
            "time_remaining_seconds": 0,
            "question_number": 0,
        })
        await _send(websocket, session_id, {
            "type": "response_done",
            "text": bridge_text,
        })
        await append_to_session(session_id, "assistant", bridge_text)

        await websocket.send_text(json.dumps({
            "type": "interviewer_pause",
            "duration_ms": 2000,
            "reason": "Reviewing notes before next round",
        }))
        await asyncio.sleep(2.0)

        next_input_text = (
            f"[SYSTEM_NOTIFICATION]: Round transition completed. "
            f"You are now in round '{next_round_name}'. "
            f"Introduce this round and ask the FIRST question. "
            f"Focus: {next_focus}"
        )
        return True, True, next_input_text, True

    elif is_final_round_done:
        full_history = await get_session_history(session_id)
        rounds = await get_rounds_config(session_id)

        debrief_data = await generate_instant_debrief(
            session_id=session_id,
            conversation_history=full_history,
            rounds_config=rounds,
            company_name=company_name,
        )

        await websocket.send_text(json.dumps({
            "type": "interview_complete",
            "message": "All rounds completed. Well done.",
            "debrief": debrief_data,
        }))

    return False, False, "", False


async def orchestrate(websocket: WebSocket, audio_data: bytes, session_id: str) -> None:
    """
    ChatGPT-style voice pipeline: STT -> Streaming LLM -> Sentence parsing -> TTS chunks
    """
    try:
        await manage_session(session_id)

        interview_input_mode = await get_interview_input_mode(session_id)
        is_voice = (interview_input_mode != "text")

        turn_id = await new_turn(session_id)

        text = await speech_to_text(audio_data)

        if not text or not text.strip():
            return

        if not await check_and_store_transcript(session_id, text):
            logger.info("[%s] Duplicate transcript suppressed (turn=%s)", session_id, turn_id)
            return

        await _send(websocket, session_id, {"type": "transcript", "text": text})
        await append_to_session(session_id, "user", text)

        was_already_spoken = await get_user_has_spoken(session_id)
        if not was_already_spoken:
            await set_user_has_spoken(session_id, True)

        if "/analyze" in text.lower():
            analysis_msg = "Understood. Synthesizing your Job Match Analysis report..."
            await _send(websocket, session_id, {"type": "response_start"})
            if is_voice:
                await stream_sentence_tts(websocket, analysis_msg, session_id)
            await _send(websocket, session_id, {"type": "response_done", "text": analysis_msg})
            await append_to_session(session_id, "assistant", analysis_msg)
            await _send(websocket, session_id, {"type": "session_end_trigger"})
            return

        current_input_text = text
        is_auto_turn = False

        while True:
            (
                context, job_context, current_round_name,
                round_idx, q_in_round, current_mode, company_name,
            ) = await _build_context(session_id)

            rounds_config = await get_rounds_config(session_id)
            history = await get_session_history(session_id)
            history = history[-6:]

            await _send(websocket, session_id, {"type": "response_start"})

            interview_mode_check = await get_interview_input_mode(session_id)
            is_text_only = (interview_mode_check == "text")

            if is_text_only:
                full_response = ""
                async for chunk in generate_response(current_input_text, history, context):
                    if full_response and not full_response.endswith(' ') and not chunk.startswith(' '):
                        if chunk and chunk[0] not in ('.', ',', '!', '?', ';', ':', "'", '"', '`'):
                            full_response += ' '
                    full_response += chunk
                
                import re
                full_response = re.sub(r'([.!?,;:])([A-Za-z])', r'\1 \2', full_response)
                full_response = re.sub(r' {2,}', ' ', full_response)
                full_response = full_response.strip()

                if not full_response.strip():
                    full_response = "I see. Please continue."

                full_response = clean_llm_response(full_response)
                message_type, display_text = _strip_classification_tag(full_response)
                if is_auto_turn:
                    message_type = "round_opener"
                time_remaining_now = await get_round_time_remaining(session_id)

                await _send(websocket, session_id, {
                    "type": "response_text",
                    "text": display_text,
                    "message_type": message_type,
                    "round_index": round_idx,
                    "round_name": current_round_name,
                    "time_remaining_seconds": int(time_remaining_now),
                    "question_number": q_in_round + 1 if message_type == "main_question" else q_in_round,
                })
                await _send(websocket, session_id, {
                    "type": "response_done",
                    "text": display_text,
                })
                await append_to_session(session_id, "assistant", display_text)

            else:
                display_text, message_type = await _stream_sentences_from_llm(
                    websocket=websocket,
                    input_text=current_input_text,
                    history=history,
                    context=context,
                    session_id=session_id,
                    is_voice=True,
                    override_message_type="round_opener" if is_auto_turn else None,
                )

                if not display_text.strip():
                    display_text = "I see. Please continue."
                    await stream_sentence_tts(websocket, display_text, session_id)

                time_remaining_now = await get_round_time_remaining(session_id)

                await _send(websocket, session_id, {
                    "type": "response_text",
                    "text": display_text,
                    "message_type": message_type,
                    "round_index": round_idx,
                    "round_name": current_round_name,
                    "time_remaining_seconds": int(time_remaining_now),
                    "question_number": q_in_round + 1 if message_type == "main_question" else q_in_round,
                })
                await _send(websocket, session_id, {
                    "type": "response_done",
                    "text": display_text,
                })
                await append_to_session(session_id, "assistant", display_text)

            time_remaining = await get_round_time_remaining(session_id)
            if 55 <= time_remaining <= 70:
                await _send(websocket, session_id, {
                    "type": "round_time_warning",
                    "seconds_remaining": int(time_remaining),
                    "round_name": current_round_name,
                })

            should_loop, next_auto_turn, next_input_text, did_advance = await _handle_round_state(
                websocket=websocket,
                session_id=session_id,
                rounds_config=rounds_config,
                round_idx=round_idx,
                was_already_spoken=was_already_spoken,
                is_auto_turn=is_auto_turn,
                history=history,
                company_name=company_name,
                is_voice=not is_text_only,
            )

            if should_loop:
                current_input_text = next_input_text
                is_auto_turn = next_auto_turn
                continue

            break

    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logger.error("Pipeline Error [%s]: %s", session_id, exc, exc_info=True)
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "code": "PIPELINE_ERROR",
                "message": "The interviewer encountered an issue. Please try again.",
            }))
        except Exception:
            pass


async def orchestrate_text_input(websocket: WebSocket, text: str, session_id: str) -> None:
    """
    Same pipeline as orchestrate() but skips STT.
    """
    try:
        await manage_session(session_id)

        if not text or not text.strip():
            return

        turn_id = await new_turn(session_id)

        if not await check_and_store_transcript(session_id, text):
            logger.info("[%s] Duplicate text input suppressed (turn=%s)", session_id, turn_id)
            return

        await _send(websocket, session_id, {"type": "transcript", "text": text})
        await append_to_session(session_id, "user", text)

        was_already_spoken = await get_user_has_spoken(session_id)
        if not was_already_spoken:
            await set_user_has_spoken(session_id, True)

        if "/analyze" in text.lower():
            analysis_msg = "Understood. Synthesizing your Job Match Analysis report..."
            await _send(websocket, session_id, {"type": "response_start"})
            await _send(websocket, session_id, {"type": "response_done", "text": analysis_msg})
            await append_to_session(session_id, "assistant", analysis_msg)
            await _send(websocket, session_id, {"type": "session_end_trigger"})
            return

        current_input_text = text
        is_auto_turn = False

        while True:
            (
                context, job_context, current_round_name,
                round_idx, q_in_round, current_mode, company_name,
            ) = await _build_context(session_id)

            rounds_config = await get_rounds_config(session_id)
            history = await get_session_history(session_id)
            history = history[-6:]

            await _send(websocket, session_id, {"type": "response_start"})

            interview_mode_check = await get_interview_input_mode(session_id)
            is_text_only = (interview_mode_check == "text")

            if is_text_only:
                full_response = ""
                async for chunk in generate_response(current_input_text, history, context):
                    if full_response and not full_response.endswith(' ') and not chunk.startswith(' '):
                        last_char = full_response[-1] if full_response else ''
                        first_char = chunk[0] if chunk else ''
                        if last_char.isalpha() and first_char.isalpha():
                            full_response += ' '
                    full_response += chunk

                import re
                full_response = re.sub(r'([.!?,;:])([A-Za-z])', r'\1 \2', full_response)
                full_response = re.sub(r' {2,}', ' ', full_response)
                full_response = full_response.strip()

                if not full_response.strip():
                    full_response = "I see. Please continue."

                full_response = clean_llm_response(full_response)
                message_type, display_text = _strip_classification_tag(full_response)
                if is_auto_turn:
                    message_type = "round_opener"
                time_remaining_now = await get_round_time_remaining(session_id)

                await _send(websocket, session_id, {
                    "type": "response_text",
                    "text": display_text,
                    "message_type": message_type,
                    "round_index": round_idx,
                    "round_name": current_round_name,
                    "time_remaining_seconds": int(time_remaining_now),
                    "question_number": q_in_round + 1 if message_type == "main_question" else q_in_round,
                })
                await _send(websocket, session_id, {
                    "type": "response_done",
                    "text": display_text,
                })
                await append_to_session(session_id, "assistant", display_text)

            else:
                display_text, message_type = await _stream_sentences_from_llm(
                    websocket=websocket,
                    input_text=current_input_text,
                    history=history,
                    context=context,
                    session_id=session_id,
                    is_voice=True,
                    override_message_type="round_opener" if is_auto_turn else None,
                )

                if not display_text.strip():
                    display_text = "I see. Please continue."
                    await stream_sentence_tts(websocket, display_text, session_id)

                time_remaining_now = await get_round_time_remaining(session_id)

                await _send(websocket, session_id, {
                    "type": "response_text",
                    "text": display_text,
                    "message_type": message_type,
                    "round_index": round_idx,
                    "round_name": current_round_name,
                    "time_remaining_seconds": int(time_remaining_now),
                    "question_number": q_in_round + 1 if message_type == "main_question" else q_in_round,
                })
                await _send(websocket, session_id, {
                    "type": "response_done",
                    "text": display_text,
                })
                await append_to_session(session_id, "assistant", display_text)

            time_remaining = await get_round_time_remaining(session_id)
            if 55 <= time_remaining <= 70:
                await _send(websocket, session_id, {
                    "type": "round_time_warning",
                    "seconds_remaining": int(time_remaining),
                    "round_name": current_round_name,
                })

            should_loop, next_auto_turn, next_input_text, did_advance = await _handle_round_state(
                websocket=websocket,
                session_id=session_id,
                rounds_config=rounds_config,
                round_idx=round_idx,
                was_already_spoken=was_already_spoken,
                is_auto_turn=is_auto_turn,
                history=history,
                company_name=company_name,
                is_voice=not is_text_only,
            )

            if should_loop:
                current_input_text = next_input_text
                is_auto_turn = next_auto_turn
                continue

            break

    except asyncio.CancelledError:
        raise
    except Exception as exc:
        logger.error("Text Pipeline Error [%s]: %s", session_id, exc, exc_info=True)
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "code": "PIPELINE_ERROR",
                "message": "The interviewer encountered an issue. Please try again.",
            }))
        except Exception:
            pass


async def orchestrate_greeting(
    websocket: WebSocket,
    session_id: str,
    greeting_prompt: str,
    context: str,
    rounds_config: list,
    is_text_mode: bool,
) -> str:
    """
    Sentence-streaming greeting generator.
    """
    from app.mock_interview.services.llm import generate_response

    await new_turn(session_id)

    full_greeting = ""
    sentence_buffer = ""
    first_sentence_sent = False
    tag_stripped_greeting = False

    await _send(websocket, session_id, {"type": "response_start"})

    async for chunk in generate_response(greeting_prompt, context=context, session_id=session_id):
        if full_greeting and not full_greeting.endswith(' ') and not chunk.startswith(' '):
            if chunk and chunk[0] not in ('.', ',', '!', '?', ';', ':', "'", '"', '`'):
                full_greeting += ' '
                sentence_buffer += ' '
        full_greeting += chunk
        sentence_buffer += chunk

        sentences = _SENTENCE_SPLIT.split(sentence_buffer)

        if len(sentences) > 1:
            complete_sentences = sentences[:-1]
            sentence_buffer = sentences[-1]

            for sentence in complete_sentences:
                sentence = clean_llm_response(sentence.strip())
                if not sentence:
                    continue

                if not tag_stripped_greeting:
                    _, sentence = _strip_classification_tag(sentence)
                    tag_stripped_greeting = True
                    if not sentence:
                        continue

                sid = await next_sentence_id(session_id)

                await _send(websocket, session_id, {
                    "type": "sentence_text",
                    "sentence_id": sid,
                    "text": sentence,
                    "is_first": not first_sentence_sent,
                    "message_type": "greeting",
                })

                if not is_text_mode:
                    await stream_sentence_tts(websocket, sentence, session_id, sentence_id=sid)

                first_sentence_sent = True

    if sentence_buffer.strip():
        sentence = clean_llm_response(sentence_buffer.strip())
        if sentence:
            if not tag_stripped_greeting:
                _, sentence = _strip_classification_tag(sentence)
                tag_stripped_greeting = True
            if sentence:
                sid = await next_sentence_id(session_id)
                await _send(websocket, session_id, {
                    "type": "sentence_text",
                    "sentence_id": sid,
                    "text": sentence,
                    "is_first": not first_sentence_sent,
                    "message_type": "greeting",
                })
                if not is_text_mode:
                    await stream_sentence_tts(websocket, sentence, session_id, sentence_id=sid)

    full_greeting = clean_llm_response(full_greeting)
    _, full_greeting_clean = _strip_classification_tag(full_greeting)

    await append_to_session(session_id, "assistant", full_greeting_clean)

    if is_text_mode:
        await _send(websocket, session_id, {
            "type": "greeting_text",
            "text": full_greeting_clean,
            "message_type": "greeting",
        })
    else:
        await _send(websocket, session_id, {
            "type": "response_text",
            "text": full_greeting_clean,
            "message_type": "greeting",
            "round_index": 0,
            "round_name": rounds_config[0]["round_name"] if rounds_config else "General Interview",
            "time_remaining_seconds": 0,
            "question_number": 0,
        })

        if rounds_config:
            await _send(websocket, session_id, {
                "type": "round_info",
                "round_name": rounds_config[0]["round_name"],
                "round_index": 0,
                "total_rounds": len(rounds_config),
                "rounds": [{"round_name": r["round_name"]} for r in rounds_config],
            })

    await _send(websocket, session_id, {
        "type": "response_done",
        "text": full_greeting_clean,
    })

    return full_greeting_clean
```

---

## 6. Backend: `mock_interview/services/stt.py` (STT Service)
**Path:** `Jobs_backend/app/mock_interview/services/stt.py`
*Handles async transcription of raw WebM browser audio blocks using OpenAI Whisper, filtering out Whisper hallucinations or generic transient sounds.*

```python
"""
mock_interview/services/stt.py
Speech-to-Text service using OpenAI Whisper.
OpenAI API key is read from the shared app Settings — never hardcoded.
"""

import io
import logging
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

# Whisper hallucination filter
_HALLUCINATIONS = [
    "thank you.",
    "thank you",
    "thanks for watching",
    "subscribe",
    "please subscribe",
    "subtitle",
    "subtitles",
    "captioned by",
    "you",
    "um",
    "uh",
    "hmm",
    "okay.",
    "okay",
    "yes.",
    "no.",
]

_HALLUCINATIONS_EXACT: frozenset = frozenset(h.lower() for h in _HALLUCINATIONS)


async def speech_to_text(audio_bytes: bytes) -> str:
    """
    Transcribe raw WebM binary audio (from browser MediaRecorder) to text
    using OpenAI Whisper.
    """
    if not audio_bytes or len(audio_bytes) < 8192:
        logger.debug(f"Audio blob too small ({len(audio_bytes) if audio_bytes else 0} bytes), skipping")
        return ""

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    file_tuple = ("audio.webm", audio_bytes, "audio/webm")

    response = await client.audio.transcriptions.create(
        model="whisper-1",
        file=file_tuple,
        temperature=0.0,
        language="en",
        prompt=(
            "Technical job interview. Candidate answering questions about "
            "software engineering, algorithms, data structures, system design, "
            "coding, and computer science concepts."
        ),
    )

    text = response.text.strip()

    if text.strip().lower() in _HALLUCINATIONS_EXACT or len(text) < 3:
        logger.debug("Whisper hallucination or near-empty transcript: '%s'", text[:60])
        return ""

    if len(text.split()) < 3:
        logger.debug(f"Transcript too short ('{text}'), likely hallucination")
        return ""

    return text
```
