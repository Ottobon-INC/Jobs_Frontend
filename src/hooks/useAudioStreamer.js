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
        if (sentenceId !== undefined) {
            if (currentSentenceIdRef.current === null) {
                currentSentenceIdRef.current = sentenceId;
            } else if (currentSentenceIdRef.current !== sentenceId) {
                console.warn(`[useAudioStreamer] Ignoring mismatched schedule for sentence ${sentenceId}. Expected ${currentSentenceIdRef.current}`);
                return;
            }
        }
        scheduleReadyRef.current = true;
        // Attempt flush now that schedule is ready
        _checkAndFlush();
    }, [_checkAndFlush]);

    // ── Public: feed a raw ArrayBuffer chunk from the WebSocket ───────────────
    const feedChunk = useCallback((arrayBuffer, sentenceId) => {
        _ensureContext();

        // Update current sentence ID if provided and match strictly
        if (sentenceId !== undefined) {
            if (currentSentenceIdRef.current === null) {
                currentSentenceIdRef.current = sentenceId;
            } else if (currentSentenceIdRef.current !== sentenceId) {
                console.warn(`[useAudioStreamer] Ignoring mismatched chunk for sentence ${sentenceId}. Expected ${currentSentenceIdRef.current}`);
                return;
            }
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

    // ── Public: call when sentence_complete or response_done is received ──────
    // Flushes any leftover buffered chunks that didn't meet the threshold
    // Called when sentence_complete or response_done is received
    const flushRemaining = useCallback(() => {
        if (!bufferFlushedRef.current && pendingChunksRef.current.length > 0) {
            // Force flush even without schedule — underrun case
            _flushBuffer();
        }
        // Safely reset state after sentence completes
        resetForNextSentence();
    }, [_flushBuffer, resetForNextSentence]);

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
