/**
 * useUtteranceStateMachine.js
 * Strict client-side state machine for the Mock Interview voice pipeline.
 *
 * Manages the lifecycle of each AI sentence during a voice turn:
 *   IDLE → SCHEDULED → BUFFERING → PLAYING → COMPLETED
 *                                           ↘ INTERRUPTED
 *
 * Keyed by turn_id (from backend v8 protocol) and sentence_id.
 * All WebSocket JSON events are routed through dispatchEvent() which
 * enforces ordering, deduplicates, and transitions state deterministically.
 *
 * The state machine is the single source of truth for:
 *   - Current sentence text and word schedule
 *   - Audio playback anchor times
 *   - Accumulated completed turn text
 *   - Message type (main_question, follow_up, bridge, etc.)
 *   - Interruption status
 */

import { useRef, useCallback } from 'react';

// ── Sentence status enum ─────────────────────────────────────────────────────
export const SentenceStatus = Object.freeze({
    IDLE:        'IDLE',
    SCHEDULED:   'SCHEDULED',   // sentence_text received, awaiting schedule/audio
    BUFFERING:   'BUFFERING',   // PCM bytes arriving, not yet playing
    PLAYING:     'PLAYING',     // audio started, word reveal in progress
    COMPLETED:   'COMPLETED',   // sentence_complete received
    INTERRUPTED: 'INTERRUPTED', // user spoke during playback
});

// ── Simulated word schedule fallback ─────────────────────────────────────────
function _createSimulatedSchedule(text) {
    if (!text) return [];
    const words = text.split(/\s+/).filter(Boolean);
    const msPerWord = 220;
    return words.map((word, index) => ({
        word,
        start_ms: index * msPerWord,
        end_ms: (index + 1) * msPerWord,
    }));
}

// ── Create a fresh sentence state object ─────────────────────────────────────
function _createSentenceState(sentenceId, text, messageType, isFirst) {
    return {
        sentenceId,
        status: SentenceStatus.SCHEDULED,
        text: text || '',
        messageType: messageType || 'follow_up',
        isFirst: !!isFirst,
        schedule: null,           // word timings from sentence_schedule
        scheduleDurationMs: 0,    // total duration from schedule
        scheduleReady: false,     // true once sentence_schedule arrives
        audioStartWallMs: null,   // wall-clock anchor for word reveal
        pcmBytesBuffered: 0,      // running count of PCM bytes received
        revealedWordCount: 0,     // how many words have been revealed
    };
}

/**
 * @returns {object} State machine API
 */
export function useUtteranceStateMachine() {
    // Current turn tracking
    const currentTurnIdRef = useRef(null);
    const lastProcessedSeqRef = useRef(-1);

    // Sentence registry: Map<sentenceId, SentenceState>
    const sentenceRegistryRef = useRef(new Map());

    // Ordered list of sentence IDs for this turn (maintains insertion order)
    const sentenceOrderRef = useRef([]);

    // The sentence_id currently active (being played/buffered)
    const activeSentenceIdRef = useRef(null);

    // Accumulated completed text for the full turn
    const completedTextRef = useRef('');

    // Message type from the first sentence_text of the turn
    const turnMessageTypeRef = useRef('follow_up');

    // Interruption flag for this turn
    const interruptedRef = useRef(false);

    // ── Dispatch a parsed WebSocket JSON event ───────────────────────────────
    const dispatchEvent = useCallback((parsed) => {
        if (!parsed || !parsed.type) return null;

        const eventType = parsed.type;
        const sentenceId = parsed.sentence_id;
        const turnId = parsed.turn_id;
        const eventSeq = parsed.event_seq;

        // ── response_start: begin a new turn ─────────────────────────────
        if (eventType === 'response_start') {
            currentTurnIdRef.current = turnId || null;
            lastProcessedSeqRef.current = -1;
            sentenceRegistryRef.current = new Map();
            sentenceOrderRef.current = [];
            activeSentenceIdRef.current = null;
            completedTextRef.current = '';
            turnMessageTypeRef.current = 'follow_up';
            interruptedRef.current = false;
            return { action: 'turn_started', turnId };
        }

        // ── Stale turn guard ─────────────────────────────────────────────
        if (currentTurnIdRef.current && turnId && turnId !== currentTurnIdRef.current) {
            return null; // ignore events from a previous turn
        }

        // ── Event sequence dedup (skip if already processed) ─────────────
        if (typeof eventSeq === 'number' && eventSeq <= lastProcessedSeqRef.current) {
            return null;
        }
        if (typeof eventSeq === 'number') {
            lastProcessedSeqRef.current = eventSeq;
        }

        const registry = sentenceRegistryRef.current;

        switch (eventType) {

            // ── sentence_text: a new sentence is about to play ───────────
            case 'sentence_text': {
                const text = parsed.text || '';
                const messageType = parsed.message_type || 'follow_up';
                const isFirst = !!parsed.is_first;

                // Capture message type from the first sentence of the turn
                if (isFirst || sentenceOrderRef.current.length === 0) {
                    turnMessageTypeRef.current = messageType;
                }

                const state = _createSentenceState(sentenceId, text, messageType, isFirst);

                // Check if schedule arrived early (before sentence_text)
                if (registry.has(sentenceId)) {
                    const existing = registry.get(sentenceId);
                    if (existing.schedule) {
                        state.schedule = existing.schedule;
                        state.scheduleDurationMs = existing.scheduleDurationMs;
                        state.scheduleReady = true;
                    }
                }

                registry.set(sentenceId, state);
                sentenceOrderRef.current.push(sentenceId);
                activeSentenceIdRef.current = sentenceId;

                return {
                    action: 'sentence_scheduled',
                    sentenceId,
                    text,
                    messageType,
                    isFirst,
                };
            }

            // ── sentence_schedule: word timings for a sentence ───────────
            case 'sentence_schedule': {
                const words = parsed.words || [];
                const durationMs = parsed.duration_ms || 0;

                if (registry.has(sentenceId)) {
                    const state = registry.get(sentenceId);
                    state.schedule = words;
                    state.scheduleDurationMs = durationMs;
                    state.scheduleReady = true;
                } else {
                    // Schedule arrived before sentence_text — store for later
                    registry.set(sentenceId, {
                        ..._createSentenceState(sentenceId, '', 'follow_up', false),
                        schedule: words,
                        scheduleDurationMs: durationMs,
                        scheduleReady: true,
                    });
                }

                return {
                    action: 'schedule_received',
                    sentenceId,
                    words,
                    durationMs,
                    isReady: registry.get(sentenceId)?.status === SentenceStatus.SCHEDULED,
                };
            }

            // ── sentence_complete: audio transfer done for a sentence ────
            case 'sentence_complete': {
                if (registry.has(sentenceId)) {
                    const state = registry.get(sentenceId);
                    if (state.status !== SentenceStatus.INTERRUPTED) {
                        state.status = SentenceStatus.COMPLETED;
                    }
                    // Append completed text to the turn buffer
                    if (state.text) {
                        completedTextRef.current = completedTextRef.current
                            ? completedTextRef.current + ' ' + state.text
                            : state.text;
                    }
                }

                return {
                    action: 'sentence_completed',
                    sentenceId,
                    completedText: completedTextRef.current,
                };
            }

            // ── response_done: full AI turn complete ─────────────────────
            case 'response_done': {
                // Mark any remaining non-completed sentences as completed
                for (const [, state] of registry) {
                    if (state.status !== SentenceStatus.COMPLETED &&
                        state.status !== SentenceStatus.INTERRUPTED) {
                        state.status = SentenceStatus.COMPLETED;
                        if (state.text && !completedTextRef.current.includes(state.text)) {
                            completedTextRef.current = completedTextRef.current
                                ? completedTextRef.current + ' ' + state.text
                                : state.text;
                        }
                    }
                }

                return {
                    action: 'turn_completed',
                    fullText: completedTextRef.current || parsed.text || '',
                    messageType: turnMessageTypeRef.current,
                };
            }

            default:
                return null;
        }
    }, []);

    // ── Mark a sentence as BUFFERING (first PCM byte arrived) ────────────────
    const markBuffering = useCallback((sentenceId) => {
        const state = sentenceRegistryRef.current.get(sentenceId);
        if (state && state.status === SentenceStatus.SCHEDULED) {
            state.status = SentenceStatus.BUFFERING;
        }
    }, []);

    // ── Record PCM bytes buffered for a sentence ─────────────────────────────
    const addPcmBytes = useCallback((sentenceId, byteCount) => {
        const state = sentenceRegistryRef.current.get(sentenceId);
        if (state) {
            if (state.status === SentenceStatus.SCHEDULED) {
                state.status = SentenceStatus.BUFFERING;
            }
            state.pcmBytesBuffered += byteCount;
        }
    }, []);

    // ── Mark a sentence as PLAYING (audio started) ───────────────────────────
    const markPlaying = useCallback((sentenceId, wallClockMs) => {
        const state = sentenceRegistryRef.current.get(sentenceId);
        if (state && (state.status === SentenceStatus.SCHEDULED ||
                      state.status === SentenceStatus.BUFFERING)) {
            state.status = SentenceStatus.PLAYING;
            state.audioStartWallMs = wallClockMs;
        }
    }, []);

    // ── Mark a sentence as INTERRUPTED ───────────────────────────────────────
    const markInterrupted = useCallback((sentenceId) => {
        const state = sentenceRegistryRef.current.get(sentenceId);
        if (state) {
            state.status = SentenceStatus.INTERRUPTED;
        }
        interruptedRef.current = true;
    }, []);

    // ── Interrupt the currently active sentence ──────────────────────────────
    const interruptActive = useCallback(() => {
        const activeId = activeSentenceIdRef.current;
        if (activeId != null) {
            const state = sentenceRegistryRef.current.get(activeId);
            if (state && state.status !== SentenceStatus.COMPLETED) {
                state.status = SentenceStatus.INTERRUPTED;
            }
        }
        interruptedRef.current = true;

        return {
            interruptedSentenceId: activeId,
            partialText: completedTextRef.current,
        };
    }, []);

    // ── Get the currently active sentence state ──────────────────────────────
    const getCurrentSentence = useCallback(() => {
        const activeId = activeSentenceIdRef.current;
        if (activeId == null) return null;
        return sentenceRegistryRef.current.get(activeId) || null;
    }, []);

    // ── Get a specific sentence by ID ────────────────────────────────────────
    const getSentence = useCallback((sentenceId) => {
        return sentenceRegistryRef.current.get(sentenceId) || null;
    }, []);

    // ── Get accumulated completed text for the turn ──────────────────────────
    const getCompletedText = useCallback(() => {
        return completedTextRef.current;
    }, []);

    // ── Get the message type for the current turn ────────────────────────────
    const getTurnMessageType = useCallback(() => {
        return turnMessageTypeRef.current;
    }, []);

    // ── Check if current turn has been interrupted ───────────────────────────
    const isInterrupted = useCallback(() => {
        return interruptedRef.current;
    }, []);

    // ── Get the active sentence ID ───────────────────────────────────────────
    const getActiveSentenceId = useCallback(() => {
        return activeSentenceIdRef.current;
    }, []);

    // ── Check if schedule is ready for a sentence ────────────────────────────
    const isScheduleReady = useCallback((sentenceId) => {
        const state = sentenceRegistryRef.current.get(sentenceId);
        return state ? state.scheduleReady : false;
    }, []);

    // ── Get word schedule (with simulated fallback) ──────────────────────────
    const getSchedule = useCallback((sentenceId) => {
        const state = sentenceRegistryRef.current.get(sentenceId);
        if (!state) return [];
        if (state.schedule && state.schedule.length > 0) {
            return state.schedule;
        }
        // Fallback to simulated schedule
        return _createSimulatedSchedule(state.text);
    }, []);

    // ── Full reset (new session or cleanup) ──────────────────────────────────
    const reset = useCallback(() => {
        currentTurnIdRef.current = null;
        lastProcessedSeqRef.current = -1;
        sentenceRegistryRef.current = new Map();
        sentenceOrderRef.current = [];
        activeSentenceIdRef.current = null;
        completedTextRef.current = '';
        turnMessageTypeRef.current = 'follow_up';
        interruptedRef.current = false;
    }, []);

    return {
        dispatchEvent,
        markBuffering,
        addPcmBytes,
        markPlaying,
        markInterrupted,
        interruptActive,
        getCurrentSentence,
        getSentence,
        getCompletedText,
        getTurnMessageType,
        isInterrupted,
        getActiveSentenceId,
        isScheduleReady,
        getSchedule,
        reset,
    };
}
