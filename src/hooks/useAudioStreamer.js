/**
 * useAudioStreamer.js
 * Production-grade audio streaming hook for the Mock Interview AI voice pipeline.
 *
 * Features:
 *  - WAV header detection & stripping on the first chunk per response
 *    (backend sends 44-byte RIFF header before the first PCM chunk)
 *  - Jitter buffer: queues chunks until 150ms of audio is accumulated,
 *    then flushes in scheduled order — smooths out network latency spikes
 *  - AnalyserNode exposed for SiriVisualizer real-time waveform sync
 *  - stopAudio(): immediate interruption for round transitions
 *  - isSpeaking state for UI feedback
 *  - onPlaybackStart(audioCtxStartTime, wallClockStartTime): fires the EXACT
 *    moment the first audio buffer is actually scheduled. Used by the caller
 *    to anchor word_schedule timestamps to real audio playback time.
 */

import { useRef, useCallback, useState } from 'react';

// How many milliseconds of PCM audio to buffer before starting playback.
// Higher = smoother but more latency. 150ms is the configured threshold.
const JITTER_BUFFER_MS = 150;
const SAMPLE_RATE = 24000;     // Must match backend TTS output (OpenAI PCM = 24kHz)
const BITS_PER_SAMPLE = 16;    // OpenAI PCM is signed 16-bit
const CHANNELS = 1;            // Mono

// Bytes of audio that equal JITTER_BUFFER_MS of playback
const BYTES_PER_MS = (SAMPLE_RATE * CHANNELS * (BITS_PER_SAMPLE / 8)) / 1000;
const BUFFER_THRESHOLD_BYTES = JITTER_BUFFER_MS * BYTES_PER_MS; // = 7200 bytes

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
 * @param {function} onPlaybackStart    - ({ audioCtxTime, wallClockMs }) => void
 *   Fired ONCE per response, at the exact moment the first PCM buffer is
 *   scheduled to start. The caller uses this to anchor word timestamps.
 */
export function useAudioStreamer(onSpeakingChange, onPlaybackStart) {
    const audioCtxRef       = useRef(null);
    const analyserRef       = useRef(null);
    const gainRef           = useRef(null);
    const nextStartTimeRef  = useRef(0);
    const activeSourcesRef  = useRef(0);
    const pendingBytesRef   = useRef(0);   // accumulated buffer size before flush
    const pendingChunksRef  = useRef([]);  // queued raw PCM ArrayBuffers
    const isFirstChunkRef   = useRef(true); // tracks WAV header stripping per response
    const bufferFlushedRef  = useRef(false); // tracks if we've started playing this response

    /**
     * Tracks whether we've already fired onPlaybackStart for the current
     * response. Reset in flushRemaining / stopAudio.
     */
    const playbackStartFiredRef = useRef(false);

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

            // ── Fire the playback-start notification ONCE per response ──────
            // We do this for the very first scheduled buffer of a response,
            // before source.start() so the caller gets the anchor time
            // synchronously before any scheduling delay.
            if (isFirst && !playbackStartFiredRef.current) {
                playbackStartFiredRef.current = true;
                if (typeof onPlaybackStart === 'function') {
                    const scheduleOffsetMs = Math.max(0, (nextStartTimeRef.current - now) * 1000);
                    onPlaybackStart({
                        audioCtxTime: nextStartTimeRef.current,
                        wallClockMs: Date.now() + scheduleOffsetMs,
                    });
                }
            }

            activeSourcesRef.current++;
            if (activeSourcesRef.current === 1) {
                setIsSpeaking(true);
                if (onSpeakingChange) onSpeakingChange(true);
            }

            source.onended = () => {
                activeSourcesRef.current = Math.max(0, activeSourcesRef.current - 1);
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

    // ── Public: feed a raw ArrayBuffer chunk from the WebSocket ───────────────
    const feedChunk = useCallback((arrayBuffer) => {
        _ensureContext();

        let pcm = arrayBuffer;

        // Strip WAV header from the very first chunk of each response
        if (isFirstChunkRef.current) {
            if (_hasWavHeader(arrayBuffer)) {
                pcm = _stripWavHeader(arrayBuffer);
            }
            isFirstChunkRef.current = false;
        }

        if (pcm.byteLength === 0) return;

        pendingChunksRef.current.push(pcm);
        pendingBytesRef.current += pcm.byteLength;

        // Start playback once jitter buffer threshold is reached
        if (!bufferFlushedRef.current && pendingBytesRef.current >= BUFFER_THRESHOLD_BYTES) {
            _flushBuffer();
        } else if (bufferFlushedRef.current) {
            // Buffer already started — schedule immediately.
            // isFirst = false here because the first chunk was in the flush.
            _scheduleBuffer(pcm, false);
            pendingChunksRef.current.pop(); // already scheduled, remove from queue
        }
    }, [_ensureContext, _flushBuffer, _scheduleBuffer]);

    // ── Public: call when response_done is received ───────────────────────────
    // Flushes any leftover buffered chunks that didn't meet the threshold
    const flushRemaining = useCallback(() => {
        if (!bufferFlushedRef.current && pendingChunksRef.current.length > 0) {
            _flushBuffer();
        }
        // Reset per-response state for next turn
        isFirstChunkRef.current = true;
        bufferFlushedRef.current = false;
        playbackStartFiredRef.current = false;
    }, [_flushBuffer]);

    // ── Public: immediate stop (round transitions, session end) ───────────────
    const stopAudio = useCallback(() => {
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
        stopAudio,
        isSpeaking,
        /** Pass this ref's .current to SiriVisualizer for real audio waveform sync */
        analyserNode: analyserRef,
        /** Exposed so callers can compute elapsed audio time when needed */
        audioCtxRef,
    };
}
