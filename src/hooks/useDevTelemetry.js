/**
 * useDevTelemetry.js
 * Structured client telemetry for drift diagnostics in the Mock Interview
 * voice pipeline. Active only in development mode (import.meta.env.DEV).
 *
 * Captures timestamped events with drift calculations and stores them
 * in a circular buffer accessible via window.__MOCK_TELEMETRY__ for
 * post-session debugging.
 *
 * Usage:
 *   const telemetry = useDevTelemetry();
 *   telemetry.log('sentence_text_received', { sentenceId: 3, turnId: 'abc' });
 *   telemetry.logDrift({ sentenceId: 3, audioStartMs: 1234, scheduleStartMs: 1230 });
 */

import { useRef, useCallback } from 'react';

const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV;
const MAX_BUFFER_SIZE = 50;

/**
 * @returns {object} Telemetry API — all methods are no-ops in production
 */
export function useDevTelemetry() {
    const bufferRef = useRef([]);

    // ── Push an entry to the circular buffer ─────────────────────────────────
    const _push = useCallback((entry) => {
        if (!IS_DEV) return;
        const buf = bufferRef.current;
        buf.push(entry);
        if (buf.length > MAX_BUFFER_SIZE) {
            buf.shift();
        }
        // Expose for console access
        if (typeof window !== 'undefined') {
            window.__MOCK_TELEMETRY__ = buf;
        }
    }, []);

    // ── Log a generic telemetry event ────────────────────────────────────────
    const log = useCallback((event, data = {}) => {
        if (!IS_DEV) return;

        const entry = {
            event,
            wallClockMs: Date.now(),
            perfMs: performance.now(),
            ...data,
        };

        _push(entry);

        console.groupCollapsed(
            `%c[TELEMETRY] %c${event}`,
            'color: #6366f1; font-weight: bold',
            'color: #a1a1aa; font-weight: normal'
        );
        console.log(entry);
        console.groupEnd();
    }, [_push]);

    // ── Log a drift measurement ──────────────────────────────────────────────
    const logDrift = useCallback(({
        sentenceId,
        turnId,
        audioStartMs,
        scheduleStartMs,
        eventReceiveMs,
    } = {}) => {
        if (!IS_DEV) return;

        const driftMs = (audioStartMs && scheduleStartMs)
            ? Math.round(audioStartMs - scheduleStartMs)
            : null;

        const entry = {
            event: 'drift_measurement',
            sentenceId,
            turnId,
            audioStartMs,
            scheduleStartMs,
            eventReceiveMs,
            driftMs,
            wallClockMs: Date.now(),
            perfMs: performance.now(),
        };

        _push(entry);

        const isDriftHigh = driftMs !== null && Math.abs(driftMs) > 120;
        const color = isDriftHigh ? '#ef4444' : '#22c55e';
        const label = isDriftHigh ? '⚠ HIGH DRIFT' : '✓ DRIFT OK';

        console.groupCollapsed(
            `%c[TELEMETRY] %c${label} %c${driftMs !== null ? driftMs + 'ms' : 'N/A'} %csentence=${sentenceId}`,
            'color: #6366f1; font-weight: bold',
            `color: ${color}; font-weight: bold`,
            `color: ${color}`,
            'color: #a1a1aa'
        );
        console.log(entry);
        console.groupEnd();
    }, [_push]);

    // ── Clear the buffer ─────────────────────────────────────────────────────
    const clear = useCallback(() => {
        bufferRef.current = [];
        if (typeof window !== 'undefined') {
            window.__MOCK_TELEMETRY__ = [];
        }
    }, []);

    return { log, logDrift, clear };
}
