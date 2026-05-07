import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { setMockJobContext, setMockMode, uploadMockResume, createMockInterviewReview, setMockInterviewStructure } from '../../api/mockInterviewApi';
import { getCompanyRounds } from '../../shared/companyRounds';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useMicrophone } from '../../hooks/useMicrophone';
import { useAudioStreamer } from '../../hooks/useAudioStreamer';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toJpeg } from 'html-to-image';
import { generateUUID } from '../../utils/uuid';
import ConfirmModal from '../../components/ui/ConfirmModal';
import {
    ArrowLeft,
    Mic,
    MicOff,
    StopCircle,
    Clock,
    Zap,
    Activity,
    User,
    Bot,
    AlertTriangle,
    BarChart2,
    ChevronRight,
    Radio,
    FileText,
    Upload,
    Download,
    CheckCircle,
    Layers,
} from 'lucide-react';

// ── Config ────────────────────────────────────────────────────
// URLs come from .env — never hardcoded in source
const MOCK_WS_BASE = import.meta.env.VITE_MOCK_WS_URL || `ws://${window.location.hostname}:8200/mock/ws`;


// ── Sub-components ────────────────────────────────────────────

// ── SiriVisualizer — upgraded to use real AnalyserNode when available ─────────
const SiriVisualizer = ({ isActive, analyserNode }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const phaseRef = useRef(0);
    const waves = [
        { amplitude: 12, frequency: 0.06, color: 'rgba(24,24,27,0.8)', speed: 0.08 },
        { amplitude: 10, frequency: 0.04, color: 'rgba(113,113,122,0.8)', speed: -0.06 },
        { amplitude: 8, frequency: 0.08, color: 'rgba(161,161,170,0.8)', speed: 0.1 },
    ];

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'screen';
        phaseRef.current += 0.03;

        // If a real analyser is available, derive amplitude from actual audio data
        let liveAmp = 0;
        if (analyserNode && analyserNode.current) {
            const bufferLength = analyserNode.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserNode.current.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += Math.abs(dataArray[i] - 128);
            }
            liveAmp = sum / bufferLength; // 0-128 range
        }

        waves.forEach((wave, i) => {
            ctx.beginPath();
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 2.5;
            // Use live audio amplitude when available, otherwise fall back to isActive flag
            const targetAmp = analyserNode?.current
                ? (isActive ? Math.max(3, liveAmp * 0.8) : 3)
                : (isActive ? wave.amplitude : 3);
            wave.currentAmp = wave.currentAmp
                ? wave.currentAmp + (targetAmp - wave.currentAmp) * 0.15
                : targetAmp;
            for (let x = 0; x < width; x++) {
                const y =
                    height / 2 +
                    Math.sin(x * wave.frequency + phaseRef.current * wave.speed + i) *
                    wave.currentAmp;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [isActive]);

    return (
        <div
            className={`relative w-20 h-20 rounded-full overflow-hidden border border-zinc-100 bg-[#FAFAFA] transition-all duration-500 ${isActive ? 'scale-110 shadow-xl shadow-zinc-900/5' : ''
                }`}
        >
            <canvas ref={canvasRef} width={80} height={80} style={{ filter: 'blur(3px)', transform: 'scale(1.2)' }} />
        </div>
    );
};

// ── RoundProgressIndicator ─────────────────────────────────────────────────────
const RoundProgressIndicator = ({ rounds, currentRoundIndex }) => {
    if (!rounds || rounds.length <= 1) return null;
    return (
        <div className="flex items-center gap-0">
            {rounds.map((round, idx) => {
                const isDone = idx < currentRoundIndex;
                const isActive = idx === currentRoundIndex;
                const isPending = idx > currentRoundIndex;
                return (
                    <div key={idx} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <motion.div
                                layout
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-[10px] font-bold transition-all duration-500
                                    ${isDone ? 'bg-zinc-900 border-zinc-900 text-white' :
                                    isActive ? 'bg-white border-zinc-900 text-zinc-900 shadow-lg shadow-zinc-900/10' :
                                    'bg-zinc-50 border-zinc-200 text-zinc-300'}`}
                            >
                                {isDone ? <CheckCircle size={14} /> : idx + 1}
                            </motion.div>
                            <span className={`text-[8px] font-bold uppercase tracking-widest max-w-[64px] text-center leading-tight transition-colors duration-300
                                ${isActive ? 'text-zinc-900' : isDone ? 'text-zinc-400' : 'text-zinc-200'}`}>
                                {round.round_name}
                            </span>
                        </div>
                        {idx < rounds.length - 1 && (
                            <div className={`w-8 h-[2px] mb-5 transition-colors duration-500 ${isDone ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── RoundTransitionOverlay ────────────────────────────────────────────────────
const RoundTransitionOverlay = ({ show, roundName, focus }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/90 backdrop-blur-2xl"
            >
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center text-center max-w-md px-8"
                >
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-zinc-900/20">
                        <Layers size={28} className="text-white" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-300 mb-3">Round Transition</p>
                    <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">{roundName}</h2>
                    <p className="text-sm font-medium text-zinc-500 leading-relaxed">{focus}</p>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ── PrepCountdownOverlay — "3... 2... 1..." before new round starts ──────────
const PrepCountdownOverlay = ({ show, roundName, roundIndex, totalRounds, countdownValue }) => (
    <AnimatePresence>
        {show && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[70] flex flex-col items-center justify-center"
                style={{ background: 'radial-gradient(ellipse at center, rgba(24,24,27,0.97) 0%, rgba(9,9,11,0.99) 100%)' }}
            >
                {/* Pulsing ring behind countdown number */}
                <motion.div
                    key={countdownValue}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.08 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="absolute w-64 h-64 rounded-full border-2 border-white"
                />

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-500 mb-2"
                >
                    Preparing Round {(roundIndex ?? 0) + 1} of {totalRounds}
                </motion.p>

                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-3xl font-bold text-white tracking-tight mb-10"
                >
                    {roundName}
                </motion.h2>

                {/* Big countdown number */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={countdownValue}
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.8, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-center justify-center w-32 h-32 rounded-full border-2 border-zinc-700 mb-10"
                    >
                        <span className="text-7xl font-black text-white tabular-nums">
                            {countdownValue}
                        </span>
                    </motion.div>
                </AnimatePresence>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-[11px] font-medium text-zinc-600 uppercase tracking-widest"
                >
                    Get ready…
                </motion.p>
            </motion.div>
        )}
    </AnimatePresence>
);

// ── SubRoundProgressBar — thin bar showing round progression ─────────────────
const SubRoundProgressBar = ({ questionsAsked, questionLimit, roundStartTime, totalRoundTime }) => {
    // Prefer question-based progress; fall back to time-based
    let progress = 0;
    if (questionLimit && questionLimit > 0) {
        progress = Math.min(1, (questionsAsked || 0) / questionLimit);
    } else if (totalRoundTime && totalRoundTime > 0 && roundStartTime) {
        const elapsed = (Date.now() - roundStartTime) / 1000;
        progress = Math.min(1, elapsed / totalRoundTime);
    }

    return (
        <div className="w-full h-[3px] bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-zinc-900 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────
// ── WaveformVisualizer — 32-bar smoothed enterprise waveform ─────────────────
const WaveformVisualizer = ({ analyserRef, isActive, isMuted }) => {
    const canvasRef = useRef(null);
    const prevHeightsRef = useRef(new Float32Array(32).fill(3));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const draw = () => {
            const analyser = analyserRef?.current;
            const W = canvas.width;
            const H = canvas.height;
            const bW = (W / 32) - 4;
            ctx.clearRect(0, 0, W, H);

            if (analyser && isActive && !isMuted) {
                const freq = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(freq);
                const step = Math.floor(freq.length / 32);
                for (let i = 0; i < 32; i++) {
                    const raw = (freq[i * step] / 255) * H;
                    const smooth = prevHeightsRef.current[i] * 0.7 + raw * 0.3;
                    prevHeightsRef.current[i] = smooth;
                    const h = Math.max(3, smooth);
                    const x = i * (W / 32) + 2;
                    const y = (H - h) / 2;
                    ctx.fillStyle = raw > 5 ? '#3f3f46' : '#e4e4e7';
                    ctx.beginPath();
                    ctx.roundRect(x, y, bW, h, 2);
                    ctx.fill();
                }
            } else {
                for (let i = 0; i < 32; i++) {
                    ctx.fillStyle = '#e4e4e7';
                    ctx.beginPath();
                    ctx.roundRect(i * (W / 32) + 2, (H - 3) / 2, bW, 3, 2);
                    ctx.fill();
                }
            }
            animId = requestAnimationFrame(draw);
        };

        animId = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animId);
    }, [isActive, isMuted, analyserRef]);

    return (
        <canvas
            ref={canvasRef}
            width={320}
            height={64}
            style={{ width: '100%', height: '64px', display: 'block' }}
        />
    );
};

// ── Main Page ─────────────────────────────────────────────────
const MockInterviewPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const { addNotification } = useNotifications();
    const jobTitle = location.state?.jobTitle || '';
    // Promoted to state so the entry-screen company selector can override it
    const [companyName, setCompanyName] = useState(location.state?.companyName || '');
    const [companySearch, setCompanySearch] = useState(location.state?.companyName || '');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

    // Session step: 'entry' | 'interview'
    const [step, setStep] = useState('entry');

    // Entry state
    const [interviewType, setInterviewType] = useState('technical');
    const [duration, setDuration] = useState(15);
    const [proctorMode, setProctorMode] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [sessionResumeName, setSessionResumeName] = useState(null);
    const [interviewerPersona, setInterviewerPersona] = useState('Neutral');
    const [whiteboardMode, setWhiteboardMode] = useState(false);

    // Interview state
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('Disconnected');
    const [statusClass, setStatusClass] = useState('disconnected');
    const [errorMsg, setErrorMsg] = useState('');
    const [transcripts, setTranscripts] = useState([]);
    const [responses, setResponses] = useState([]);
    const [conversationLog, setConversationLog] = useState([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [visibleWords, setVisibleWords] = useState('');  // timestamp-driven subtitle
    const [partialTranscript, setPartialTranscript] = useState(''); // live STT preview
    const [isThinking, setIsThinking] = useState(false);  // "Interviewer is thinking..."
    const [panelsDimmed, setPanelsDimmed] = useState(false); // round-change dim effect
    const [isMuted, setIsMuted] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [showViolationAlert, setShowViolationAlert] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [isSavingInterview, setIsSavingInterview] = useState(false);
    const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);
    const [reviewTicket, setReviewTicket] = useState(null);
    const [showCompletionOptions, setShowCompletionOptions] = useState(false);
    const [showDiscardModal, setShowDiscardModal] = useState(false);

    // Initializing & round-transition feedback
    const [isInitializing, setIsInitializing] = useState(false);
    const [isRoundTransitioning, setIsRoundTransitioning] = useState(false);

    // Round state (v2)
    const [roundsConfig, setRoundsConfig] = useState(
        location.state?.interviewStructure || []
    );
    const [isFirstTurn, setIsFirstTurn] = useState(true);
    const [currentRound, setCurrentRound] = useState(null);
    const [roundHistory, setRoundHistory] = useState([]);
    const [showRoundTransition, setShowRoundTransition] = useState(false);

    // Prep countdown state
    const [showPrepCountdown, setShowPrepCountdown] = useState(false);
    const [prepCountdownValue, setPrepCountdownValue] = useState(3);
    const [prepRoundName, setPrepRoundName] = useState('');
    const [prepRoundIndex, setPrepRoundIndex] = useState(0);
    const [prepTotalRounds, setPrepTotalRounds] = useState(0);
    const prepTimerRef = useRef(null);

    // Sub-round progress tracking
    const [roundQuestionsAsked, setRoundQuestionsAsked] = useState(0);
    const [roundStartTime, setRoundStartTime] = useState(null);

    // Listen to interviewType changes to show/hide technical rounds
    useEffect(() => {
        if (interviewType !== 'technical') {
            setRoundsConfig([]);
        } else {
            // Restore technical rounds from state or config
            if (location.state?.interviewStructure) {
                setRoundsConfig(location.state.interviewStructure);
            } else if (companyName) {
                setRoundsConfig(getCompanyRounds(companyName));
            }
        }
    }, [interviewType, companyName, location.state?.interviewStructure]);

    // Known company list for entry-screen selector
    const KNOWN_COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Startup', 'Default'];

    // Fresh session suffix — regenerated on every handleStart to avoid stale backend state
    const [sessionSuffix, setSessionSuffix] = useState(() => Date.now().toString());
    const currentSessionIdRef = useRef('');

    // Compute base session ID (used for display / resume upload)
    const sessionId = id ? `${id}_${sessionSuffix}` : `default_${sessionSuffix}`;
    // Keep ref in sync for WebSocket
    if (!currentSessionIdRef.current) currentSessionIdRef.current = sessionId;

    const { session, profile } = useAuth();
    const token = session?.access_token;

    // Resume is available if either profile has it OR session has it
    const hasResume = !!profile?.resume_text || !!sessionResumeName;

    // Compute WebSocket URL — uses ref so it picks up the latest session ID from handleStart
    const wsUrl = `${MOCK_WS_BASE}?session_id=${currentSessionIdRef.current}${token ? `&token=${token}` : ''}`;

    const transcriptRef = useRef(null);
    const responseRef = useRef(null);
    const forcedMuteRef = useRef(false);
    const stopSessionRef = useRef(null);
    const endingRef = useRef(false);
    const interviewRecordIdRef = useRef(generateUUID());
    const scheduleStartRef    = useRef(null); // wall-clock ms when audio ACTUALLY started
    const wordRevealRafRef    = useRef(null); // rAF id for the word-reveal loop
    const pendingScheduleRef  = useRef(null); // stores word_schedule payload until audio starts
    const playbackSafetyRef   = useRef(null); // fallback timer if onPlaybackStart never fires
    const pendingResponseTextRef = useRef(null);
    const playbackStartFiredRef = useRef(false);
    const rafCompletedRef = useRef(false);

    // Auto-scroll transcript/response panels
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcripts]);
    useEffect(() => {
        if (responseRef.current) {
            responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
    }, [responses, currentResponse]);

    const updateStatus = (text, cls) => {
        setStatus(text);
        setStatusClass(cls);
    };

    const appendConversationEntry = useCallback((role, content) => {
        const normalizedContent = typeof content === 'string' ? content.trim() : '';
        if (!normalizedContent) return;

        setConversationLog((prev) => [
            ...prev,
            {
                role,
                content: normalizedContent,
                created_at: new Date().toISOString(),
            },
        ]);
    }, []);

    // ── Audio playback-start callback ────────────────────────────────────────
    // Fired by useAudioStreamer the instant the first PCM buffer is actually
    // scheduled to play. We use this as the authoritative t=0 for word timing.
    const handlePlaybackStart = useCallback(({ wallClockMs }) => {
        // Clear the safety fallback — we got a real start time
        if (playbackSafetyRef.current) {
            clearTimeout(playbackSafetyRef.current);
            playbackSafetyRef.current = null;
        }

        const wordsArr = pendingScheduleRef.current;
        if (!wordsArr) return; // no word_schedule was pending (shouldn't happen)

        // Consume the pending schedule — this also signals the safety timeout
        // (which checks `pendingScheduleRef.current === wordsArr`) to no-op.
        pendingScheduleRef.current = null;

        // Anchor the schedule to the actual playback start
        scheduleStartRef.current = wallClockMs;

        // Cancel any existing loop just in case
        cancelAnimationFrame(wordRevealRafRef.current);

        // ── rAF loop: reveal words as audio plays ─────────────────────────
        const revealWords = () => {
            const elapsed = Math.max(0, Date.now() - scheduleStartRef.current);

            // Show every word whose start_ms has passed
            const visible = wordsArr
                .filter(w => w.start_ms <= elapsed)
                .map(w => w.word)
                .join(' ');

            setVisibleWords(visible);

            // Keep looping until all words are revealed
            const allRevealed = visible.split(' ').filter(Boolean).length >= wordsArr.length;
            if (!allRevealed) {
                wordRevealRafRef.current = requestAnimationFrame(revealWords);
            } else {
                rafCompletedRef.current = true;
                const checkAndTransition = () => {
                    if (pendingResponseTextRef.current) {
                        setResponses(prev => {
                            if (prev[prev.length - 1] === pendingResponseTextRef.current) return prev;
                            return [...prev, pendingResponseTextRef.current];
                        });
                        appendConversationEntry('assistant', pendingResponseTextRef.current);
                        pendingResponseTextRef.current = null;
                        rafCompletedRef.current = false;
                    } else {
                        setTimeout(() => {
                            if (rafCompletedRef.current && pendingResponseTextRef.current) {
                                setResponses(prev => {
                                    if (prev[prev.length - 1] === pendingResponseTextRef.current) return prev;
                                    return [...prev, pendingResponseTextRef.current];
                                });
                                appendConversationEntry('assistant', pendingResponseTextRef.current);
                                pendingResponseTextRef.current = null;
                                rafCompletedRef.current = false;
                            }
                        }, 150);
                    }
                };
                setTimeout(checkAndTransition, 400);
            }
        };

        wordRevealRafRef.current = requestAnimationFrame(revealWords);
    }, []); // stable — no reactive deps needed

    const { initStreamer, feedChunk, flushRemaining, stopAudio, isSpeaking, analyserNode } = useAudioStreamer(
        // onSpeakingChange
        (speaking) => { forcedMuteRef.current = speaking; },
        // onPlaybackStart — fires the moment first audio buffer is scheduled
        handlePlaybackStart
    );

    const handleMessage = useCallback(
        (data) => {
            console.log('[WS EVENT]', data instanceof ArrayBuffer ? 'AUDIO_BYTES' : JSON.parse(data).type);
            if (data instanceof ArrayBuffer) {
                forcedMuteRef.current = true;
                updateStatus('Speaking', 'speaking');
                feedChunk(data);
            } else if (typeof data === 'string') {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'transcript') {
                        setPartialTranscript('');
                        setTranscripts((prev) => [...prev, parsed.text]);
                        appendConversationEntry('user', parsed.text);
                        // Track questions asked in current round (each user turn = 1 answer to a question)
                        setRoundQuestionsAsked((prev) => prev + 1);
                        // Show thinking indicator after natural pause
                        setTimeout(() => setIsThinking(true), 200);
                    } else if (parsed.type === 'response_start') {
                        // Clear initializing overlay on first greeting
                        setIsInitializing(false);
                        // Clear round transition overlay on first question of new round
                        setIsRoundTransitioning(false);
                        updateStatus('Speaking', 'speaking');

                        // ── CRITICAL: Save previous response BEFORE canceling RAF ──
                        // If previous RAF is still running OR response_done already set text,
                        // commit it to responses history NOW before clearing state.
                        if (pendingResponseTextRef.current) {
                            const textToSave = pendingResponseTextRef.current;
                            setResponses(prev => {
                                // Avoid duplicate if RAF already added it
                                if (prev[prev.length - 1] === textToSave) return prev;
                                return [...prev, textToSave];
                            });
                            appendConversationEntry('assistant', textToSave);
                            pendingResponseTextRef.current = null;
                        }
                        
                        // Now safe to cancel RAF and reset state
                        cancelAnimationFrame(wordRevealRafRef.current);
                        wordRevealRafRef.current = null;
                        setVisibleWords('');
                        setCurrentResponse('');
                        rafCompletedRef.current = false;
                        
                        // Cancel safety timeout too
                        if (playbackSafetyRef.current) {
                            clearTimeout(playbackSafetyRef.current);
                            playbackSafetyRef.current = null;
                        }
                        pendingScheduleRef.current = null;
                    } else if (parsed.type === 'word_schedule') {
                        // ── Word-schedule received — defer reveal until audio STARTS ──
                        //
                        // The schedule arrives BEFORE the PCM chunks (by design), so we
                        // must NOT start the reveal loop now — audio hasn't played yet.
                        // Instead:
                        //   1. Store the words array in a ref.
                        //   2. useAudioStreamer will call handlePlaybackStart() the
                        //      moment it schedules the first PCM buffer, giving us the
                        //      exact wall-clock anchor.
                        //   3. handlePlaybackStart() then starts the rAF loop.
                        //
                        // Safety net: if onPlaybackStart never fires within 800 ms
                        // (e.g. very short response where all audio is flushed at once
                        // via flushRemaining before the threshold is hit), we fall back
                        // to the old behaviour and start the loop immediately.

                        setIsThinking(false);
                        setVisibleWords('');

                        // Cancel any leftover loop from a previous turn
                        cancelAnimationFrame(wordRevealRafRef.current);
                        if (playbackSafetyRef.current) clearTimeout(playbackSafetyRef.current);

                        const wordsArr = parsed.words; // [{word, start_ms}]

                        // Stash the schedule so handlePlaybackStart can pick it up
                        pendingScheduleRef.current = wordsArr;

                        // ── Fallback: start loop immediately if audio starts quickly ──
                        // (covers the case where flushRemaining fires before this
                        //  handler runs, i.e. onPlaybackStart already fired)
                        playbackSafetyRef.current = setTimeout(() => {
                            // Guard: if real playback start already fired, skip
                            if (playbackStartFiredRef.current) return;
                            // Guard: if no pending schedule, skip
                            if (pendingScheduleRef.current !== wordsArr) return;

                            console.warn('[word_sync] Safety fallback activating');
                            scheduleStartRef.current = Date.now() + 200;
                            pendingScheduleRef.current = null;

                                cancelAnimationFrame(wordRevealRafRef.current);
                                const revealWords = () => {
                                    const elapsed = Math.max(0, Date.now() - scheduleStartRef.current);
                                    const visible = wordsArr
                                        .filter(w => w.start_ms <= elapsed)
                                        .map(w => w.word)
                                        .join(' ');
                                    setVisibleWords(visible);
                                    const allRevealed =
                                        visible.split(' ').filter(Boolean).length >= wordsArr.length;
                                    if (!allRevealed) {
                                        wordRevealRafRef.current = requestAnimationFrame(revealWords);
                                    } else {
                                        rafCompletedRef.current = true;
                                        const checkAndTransition = () => {
                                            if (pendingResponseTextRef.current) {
                                                setResponses(prev => {
                                                    if (prev[prev.length - 1] === pendingResponseTextRef.current) return prev;
                                                    return [...prev, pendingResponseTextRef.current];
                                                });
                                                appendConversationEntry('assistant', pendingResponseTextRef.current);
                                                pendingResponseTextRef.current = null;
                                                rafCompletedRef.current = false;
                                            } else {
                                                setTimeout(() => {
                                                    if (rafCompletedRef.current && pendingResponseTextRef.current) {
                                                        setResponses(prev => {
                                                            if (prev[prev.length - 1] === pendingResponseTextRef.current) return prev;
                                                            return [...prev, pendingResponseTextRef.current];
                                                        });
                                                        appendConversationEntry('assistant', pendingResponseTextRef.current);
                                                        pendingResponseTextRef.current = null;
                                                        rafCompletedRef.current = false;
                                                    }
                                                }, 150);
                                            }
                                        };
                                        setTimeout(checkAndTransition, 400);
                                    }
                                };
                                wordRevealRafRef.current = requestAnimationFrame(revealWords);
                        }, 4000); // 4000 ms grace period
                    } else if (parsed.type === 'response_chunk') {
                        setCurrentResponse((prev) => prev + parsed.text);
                    } else if (parsed.type === 'response_done') {
                        flushRemaining();
                        // Clean up word-reveal state for this turn
                        if (playbackSafetyRef.current) {
                            clearTimeout(playbackSafetyRef.current);
                            playbackSafetyRef.current = null;
                        }
                        pendingScheduleRef.current = null;
                        setIsThinking(false);
                        
                        const isError = parsed.text?.includes("Pipeline Error");
                        if (isError) {
                            addNotification({ type: 'error', message: "Interviewer encountered a voice error, please try again." });
                            pendingResponseTextRef.current = null;
                            rafCompletedRef.current = false;
                        } else {
                            pendingResponseTextRef.current = parsed.text;

                            // If RAF already finished before response_done arrived
                            // → trigger transition now (RAF won't do it, it already exited)
                            if (rafCompletedRef.current) {
                                setTimeout(() => {
                                    setResponses(prev => {
                                        if (prev[prev.length - 1] === parsed.text) return prev;
                                        return [...prev, parsed.text];
                                    });
                                    appendConversationEntry('assistant', parsed.text);
                                    pendingResponseTextRef.current = null;
                                    rafCompletedRef.current = false;
                                }, 400);
                            }
                        }

                        if (isFirstTurn) {
                            setIsFirstTurn(false);
                            startMic();
                            updateStatus('Listening', 'listening');
                        } else {
                            updateStatus('Listening', 'listening');
                        }
                    } else if (parsed.type === 'audio_complete') {
                        // Only force-complete if RAF has already finished
                        // If RAF is still running, let it complete naturally
                        if (rafCompletedRef.current && pendingResponseTextRef.current) {
                            setResponses(prev => {
                                if (prev[prev.length - 1] === pendingResponseTextRef.current) return prev;
                                return [...prev, pendingResponseTextRef.current];
                            });
                            appendConversationEntry('assistant', pendingResponseTextRef.current);
                            pendingResponseTextRef.current = null;
                            rafCompletedRef.current = false;
                        }
                        // If RAF not done yet: audio_complete is a no-op
                        // RAF's allRevealed block will handle transition
                    } else if (parsed.type === 'response') {
                        if (parsed.text?.includes("Pipeline Error")) {
                            addNotification({ type: 'error', message: "Interviewer encountered a voice error, please try again." });
                        } else {
                            setResponses((prev) => [...prev, parsed.text]);
                            appendConversationEntry('assistant', parsed.text);
                        }
                    } else if (parsed.type === 'round_time_up') {
                        addNotification({
                            type: 'warning',
                            title: 'Round Time Up',
                            message: `${parsed.round_name} is complete. Transitioning to ${parsed.next_round}...`,
                        });
                        // Mute mic briefly during transition
                        setIsMuted(true);
                        setTimeout(() => setIsMuted(false), 3000);
                    } else if (parsed.type === 'round_change') {
                        stopMic();
                        setIsRoundTransitioning(true);
                        updateStatus('Preparing Round...', 'transition');
                        stopAudio();
                        cancelAnimationFrame(wordRevealRafRef.current);
                        if (playbackSafetyRef.current) {
                            clearTimeout(playbackSafetyRef.current);
                            playbackSafetyRef.current = null;
                        }
                        pendingScheduleRef.current = null;
                        pendingResponseTextRef.current = null;
                        rafCompletedRef.current = false;
                        setPanelsDimmed(true);
                        setRoundHistory((prev) => [...prev, currentRound].filter(Boolean));
                        const newRound = {
                            round_name: parsed.round_name,
                            focus: parsed.focus,
                            round_index: parsed.round_index,
                            total_rounds: parsed.total_rounds,
                        };
                        setCurrentRound(newRound);
                        // Reset sub-round question counter for new round
                        setRoundQuestionsAsked(0);
                        setRoundStartTime(Date.now());
                        // Update roundsConfig if backend sends full rounds array
                        if (parsed.rounds && parsed.rounds.length > 0) {
                            setRoundsConfig(parsed.rounds);
                        }

                        // ── Prep countdown sequence (3-2-1) ──────────────────
                        // Clear any previous countdown timer
                        if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                        setPrepRoundName(parsed.round_name || 'Next Round');
                        setPrepRoundIndex(parsed.round_index);
                        setPrepTotalRounds(parsed.total_rounds);
                        setPrepCountdownValue(3);
                        setShowPrepCountdown(true);

                        let count = 3;
                        prepTimerRef.current = setInterval(() => {
                            count -= 1;
                            if (count > 0) {
                                setPrepCountdownValue(count);
                            } else {
                                clearInterval(prepTimerRef.current);
                                prepTimerRef.current = null;
                                setShowPrepCountdown(false);
                                setPanelsDimmed(false);
                                // Now show the brief round transition overlay
                                setShowRoundTransition(true);
                                setTimeout(() => setShowRoundTransition(false), 2500);
                            }
                        }, 1000);
                    } else if (parsed.type === 'round_info') {
                        setCurrentRound({
                            round_name: parsed.round_name,
                            round_index: parsed.round_index,
                            total_rounds: parsed.total_rounds,
                        });
                        if (parsed.rounds) {
                            setRoundsConfig(parsed.rounds);
                        }
                    } else if (parsed.type === 'interview_complete') {
                        stopMic();
                        updateStatus('Disconnected', 'disconnected');
                        if (stopSessionRef.current) stopSessionRef.current();
                    } else if (parsed.type === 'session_end_trigger') {
                        stopMic();
                        updateStatus('Disconnected', 'disconnected');
                        if (stopSessionRef.current) stopSessionRef.current();
                    } else if (parsed.type === 'ping') {
                        // Silently ignore keep-alive pings from backend
                    }
                } catch {
                    setResponses((prev) => [...prev, data]);
                    appendConversationEntry('assistant', data);
                }
            }
        },
        [appendConversationEntry, feedChunk, flushRemaining, stopAudio, currentRound]
    );

    const { connect, sendAudioChunk, disconnect } = useWebSocket(
        wsUrl,
        () => {
            // Microphone starts only after the first AI response/greeting finishes
        },
        handleMessage,
        (err) => {
            setErrorMsg(err);
            handleStop();
        },
        () => handleStop()
    );

    const isSystemMuted = isMuted || isSpeaking;

    const { startMic, stopMic, micAnalyserRef } = useMicrophone(
        (blob) => {
            sendAudioChunk(blob);
            updateStatus('Processing', 'processing');
            setTimeout(() => {
                setStatus((curr) => (curr === 'Processing' ? 'Listening' : curr));
                setStatusClass((curr) => (curr === 'processing' ? 'listening' : curr));
            }, 500);
        },
        (err) => {
            setErrorMsg(err);
            handleStop();
        },
        isSystemMuted,
        forcedMuteRef,
        isMuted,
        setPartialTranscript
    );

    const persistInterviewForReview = useCallback(async () => {
        if (!session?.user?.id || reviewTicket?.id) return;

        setIsSavingInterview(true);
        try {
            const record = await createMockInterviewReview({
                id: interviewRecordIdRef.current,
                userId: session.user.id,
                jobId: id || null,
                interviewType,
                durationMinutes: duration,
                transcript: conversationLog,
                userTranscript: transcripts,
                aiTranscript: responses,
                // ── Round fields ──
                roundNumber: (currentRound?.round_index ?? 0) + 1,
                roundLabel: currentRound?.round_name || 'General Interview',
                roundType: currentRound?.focus || interviewType || 'technical',
                roundsConfig: roundsConfig || [],
                roundsCompleted: roundHistory.length,
            });

            setReviewTicket(record);
        } catch (err) {
            console.error('Failed to queue interview for admin review:', err);
            setErrorMsg('Your interview ended, but we could not queue the review yet. Please try again.');
        } finally {
            setIsSavingInterview(false);
        }
    }, [
        conversationLog, currentRound, duration, id, interviewType,
        responses, reviewTicket?.id, roundHistory, roundsConfig,
        session?.user?.id, transcripts,
    ]);


    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingResume(true);
        setErrorMsg('');
        try {
            const data = await uploadMockResume(file, sessionId);
            if (data.error) throw new Error(data.error);
            setSessionResumeName(file.name);
        } catch (err) {
            setErrorMsg('Resume upload failed: ' + err.message);
        } finally {
            setUploadingResume(false);
        }
    };

    // ── resetSession: full state wipe for clean restarts ──────────────────
    const resetSession = useCallback(() => {
        // Stop all active media
        stopMic();
        stopAudio();
        disconnect();

        // Cancel any in-flight timers / rAFs
        cancelAnimationFrame(wordRevealRafRef.current);
        wordRevealRafRef.current = null;
        if (playbackSafetyRef.current) {
            clearTimeout(playbackSafetyRef.current);
            playbackSafetyRef.current = null;
        }
        if (prepTimerRef.current) {
            clearInterval(prepTimerRef.current);
            prepTimerRef.current = null;
        }

        // Reset refs
        pendingScheduleRef.current = null;
        pendingResponseTextRef.current = null;
        rafCompletedRef.current = false;
        scheduleStartRef.current = null;
        forcedMuteRef.current = false;
        endingRef.current = false;
        stopSessionRef.current = null;
        interviewRecordIdRef.current = generateUUID();

        // Reset all interview state
        setIsActive(false);
        setIsMuted(false);
        setIsThinking(false);
        setIsStarting(false);
        setIsInitializing(false);
        setIsRoundTransitioning(false);
        updateStatus('Disconnected', 'disconnected');
        setErrorMsg('');
        setTranscripts([]);
        setResponses([]);
        setConversationLog([]);
        setCurrentResponse('');
        setVisibleWords('');
        setCurrentRound(null);
        setRoundHistory([]);
        setIsFirstTurn(true);
        setViolationCount(0);
        setShowViolationAlert(false);
        setReviewTicket(null);
        setShowCompletionOptions(false);
        setIsReviewSubmitted(false);
        setShowDiscardModal(false);
        setShowRoundTransition(false);
        setShowPrepCountdown(false);
        setPanelsDimmed(false);
        setRoundQuestionsAsked(0);
        setRoundStartTime(null);
        setTimeLeft(0);
        setIsTimerActive(false);
    }, [stopMic, stopAudio, disconnect]);

    const handleProceedToInstructions = () => {
        if (!hasResume && interviewType !== 'hr') return;
        setStep('instructions');
    };

    const handleConfirmStart = async () => {
        // ── Defensive hard-reset before every start ──────────────────────────
        endingRef.current = false;
        interviewRecordIdRef.current = generateUUID();

        // Generate a FRESH session ID so the backend starts clean
        const newSuffix = Date.now().toString();
        setSessionSuffix(newSuffix);
        const currentSessionId = id ? `${id}_${newSuffix}` : `default_${newSuffix}`;
        currentSessionIdRef.current = currentSessionId;

        // Full state wipe (media, timers, refs, all React state)
        resetSession();

        setIsStarting(true);
        setErrorMsg('');

        try {
            // 1. Push job context to mock backend
            if (companyName || jobTitle) {
                await setMockJobContext(companyName || '', jobTitle || '', currentSessionId);
            }
            await setMockMode(interviewType, currentSessionId, { interviewerPersona, whiteboardMode, durationMinutes: duration });

            // 2. Sanitize and push multi-round structure (technical mode only)
            if (interviewType === 'technical' && roundsConfig && roundsConfig.length > 0) {
                const sanitizedRounds = roundsConfig
                    .filter(r => r && r.round_name)
                    .map(r => ({
                        round_name: String(r.round_name || ''),
                        focus_description: String(r.focus_description || ''),
                        question_limit: Number(r.question_limit) || 3,
                    }));

                if (sanitizedRounds.length > 0) {
                    await setMockInterviewStructure(sanitizedRounds, currentSessionId);
                }
            }

            // 3. ONLY AFTER context is saved, initialize audio and connect
            if (proctorMode) {
                try {
                    if (document.documentElement.requestFullscreen) {
                        await document.documentElement.requestFullscreen();
                    }
                } catch (err) {
                    console.error('Fullscreen request failed:', err);
                }
            }

            setTimeLeft(duration * 60);
            setIsTimerActive(true);
            setIsActive(true);
            setIsInitializing(true);
            updateStatus('Connecting', 'connecting');
            initStreamer();
            connect();
            setStep('interview');
        } catch (err) {
            console.error('Failed to set context/mode/structure:', err);
            setErrorMsg('Failed to initialize session. Please try again.');
            setIsInitializing(false);
        } finally {
            setIsStarting(false);
        }
    };

    const handleStop = useCallback(async (isTimeout = false) => {
        if (endingRef.current) return;
        endingRef.current = true;
        setIsActive(false);
        setIsTimerActive(false);
        setIsMuted(false);
        setIsInitializing(false);
        setIsRoundTransitioning(false);
        setShowPrepCountdown(false);
        setShowRoundTransition(false);
        setPanelsDimmed(false);
        stopMic();
        disconnect();
        stopAudio();  // replaces stopPlayback — also cancels jitter buffer

        // Cancel any in-flight timers / rAFs
        cancelAnimationFrame(wordRevealRafRef.current);
        wordRevealRafRef.current = null;
        if (playbackSafetyRef.current) {
            clearTimeout(playbackSafetyRef.current);
            playbackSafetyRef.current = null;
        }
        if (prepTimerRef.current) {
            clearInterval(prepTimerRef.current);
            prepTimerRef.current = null;
        }
        pendingScheduleRef.current = null;
        pendingResponseTextRef.current = null;
        rafCompletedRef.current = false;

        updateStatus('Disconnected', 'disconnected');
        if (isTimeout) {
            setResponses((prev) => [
                ...prev,
                'Thank you for the interview. The allocated time has ended.',
            ]);
        }
        
        // Instead of auto-persisting, we show options
        setShowCompletionOptions(true);
    }, [disconnect, stopMic, stopAudio]);

    const handleFinalSubmit = async () => {
        await persistInterviewForReview();
        setIsReviewSubmitted(true);
        setShowCompletionOptions(false);

        // Add local notification
        addNotification({
            title: 'Review Submitted',
            message: `Your interview for ${jobTitle || 'selected role'} has been sent to our experts.`,
            type: 'info',
            link: '/interview-reviews'
        });
    };

    const handleFinalCancel = () => {
        // ── Hard Reset: tear down everything and return to entry ──
        // 1. Kill all active connections/media
        disconnect();
        stopMic();
        stopAudio();

        // 2. Cancel any in-flight timers / rAFs
        cancelAnimationFrame(wordRevealRafRef.current);
        wordRevealRafRef.current = null;
        if (playbackSafetyRef.current) {
            clearTimeout(playbackSafetyRef.current);
            playbackSafetyRef.current = null;
        }
        if (prepTimerRef.current) {
            clearInterval(prepTimerRef.current);
            prepTimerRef.current = null;
        }

        // 3. Reset all refs (critical: endingRef must be false so next handleStop can fire)
        endingRef.current = false;
        pendingResponseTextRef.current = null;
        pendingScheduleRef.current = null;
        rafCompletedRef.current = false;
        scheduleStartRef.current = null;
        forcedMuteRef.current = false;
        stopSessionRef.current = null;

        // 4. Reset ALL interview state
        setStep('entry');
        setIsActive(false);
        setIsStarting(false);
        setIsMuted(false);
        setIsThinking(false);
        setIsInitializing(false);
        setIsRoundTransitioning(false);
        updateStatus('Disconnected', 'disconnected');
        setErrorMsg('');
        setTranscripts([]);
        setResponses([]);
        setConversationLog([]);
        setCurrentResponse('');
        setVisibleWords('');
        setCurrentRound(null);
        setRoundHistory([]);
        setIsFirstTurn(true);
        setViolationCount(0);
        setShowViolationAlert(false);
        setReviewTicket(null);
        setIsSavingInterview(false);
        setShowCompletionOptions(false);
        setIsReviewSubmitted(false);
        setShowDiscardModal(false);
        setShowRoundTransition(false);
        setShowPrepCountdown(false);
        setPanelsDimmed(false);
        setRoundQuestionsAsked(0);
        setRoundStartTime(null);
        setTimeLeft(0);
        setIsTimerActive(false);
    };

    // Keep stopSessionRef in sync
    useEffect(() => {
        stopSessionRef.current = handleStop;
    }, [handleStop]);

    // Proctor violation detection
    useEffect(() => {
        if (proctorMode && isActive) {
            const handler = () => {
                if (document.visibilityState === 'hidden') {
                    setViolationCount((prev) => prev + 1);
                    setShowViolationAlert(true);
                }
            };
            document.addEventListener('visibilitychange', handler);
            return () => document.removeEventListener('visibilitychange', handler);
        }
    }, [proctorMode, isActive]);

    // Timer countdown
    useEffect(() => {
        let interval = null;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0 && isTimerActive) {
            clearInterval(interval);
            handleStop(true);
        }
        return () => clearInterval(interval);
    }, [handleStop, isTimerActive, timeLeft]);

    // Dead Silence Timer (Realism)
    useEffect(() => {
        let timer = null;
        let toast1Triggered = false;
        let toast2Triggered = false;

        if (status === 'Listening' && !isSpeaking && isActive) {
            const startTime = Date.now();
            timer = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;

                if (elapsed >= 12 && !toast1Triggered) {
                    addNotification({
                        type: 'info',
                        message: 'Take your time...',
                        title: 'Interviewer Tip'
                    });
                    toast1Triggered = true;
                }

                if (elapsed >= 25 && !toast2Triggered) {
                    addNotification({
                        type: 'warning',
                        message: 'Need a hint?',
                        title: 'Interviewer Tip'
                    });
                    toast2Triggered = true;
                }

                if (elapsed >= 40) {
                    clearInterval(timer);
                    handleStop();
                    addNotification({
                        type: 'error',
                        message: "Time's up. The interviewer ended the session due to silence.",
                        title: 'Session Ended'
                    });
                }
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [status, isSpeaking, isActive, transcripts.length, responses.length, addNotification, handleStop]);

    const formatTime = (s) =>
        `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // ── Status pill color ───────────────────────────────────────
    const statusColors = { 
        disconnected: 'bg-zinc-50 text-zinc-400 border-zinc-100', 
        connecting: 'bg-zinc-50 text-zinc-500 border-zinc-100 animate-pulse', 
        listening: 'bg-zinc-900 text-white border-zinc-900', 
        processing: 'bg-zinc-100 text-zinc-600 border-zinc-200', 
        speaking: 'bg-zinc-900 text-white border-zinc-900',
        transition: 'bg-zinc-100 text-zinc-500 border-zinc-200 animate-pulse',
    };

    const statusPill = isActive 
        ? (isSpeaking ? statusColors.speaking : (isRoundTransitioning ? statusColors.transition : statusColors.listening))
        : (statusColors[statusClass] || statusColors.disconnected);

    // ── ENTRY SCREEN ──────────────────────────────────────────
    if (step === 'entry') {
        return (
            <div className="min-h-screen py-8 px-6 bg-[#FBFBFB] flex items-center justify-center">
                <div className="w-full max-w-6xl mx-auto">
                    {/* Full width header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 border-b border-zinc-100 pb-6 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shadow-md">
                                <Radio size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                    Mock Interview
                                </h1>
                                {(companyName || jobTitle) && (
                                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-2 flex items-center gap-3">
                                        {companyName && `${companyName} • `}{jobTitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <Link
                            to={id ? `/jobs/${id}` : '/jobs'}
                            className="inline-flex items-center gap-3 text-zinc-400 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-zinc-900 transition-colors bg-white px-5 py-3 rounded-full border border-zinc-100 shadow-sm"
                        >
                            <ArrowLeft size={14} /> Back
                        </Link>
                    </motion.div>

                    {/* Grid Layout */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-6 lg:col-span-1">
                            {/* Card 1: SELECT MODE */}
                            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-3">
                                    01 / SELECT MODE
                                </p>
                                <div className="flex flex-col gap-3">
                                    {['technical', 'hr'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setInterviewType(type)}
                                            className={`py-3 rounded-xl border transition-all duration-300 font-bold text-[11px] uppercase tracking-widest ${interviewType === type
                                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/10'
                                                    : 'bg-zinc-50 text-zinc-400 border-zinc-100 premium-tag'
                                                }`}
                                        >
                                            {type === 'technical' ? 'Technical Interview' : 'Behavioral Interview'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Card 2: INTERVIEW DURATION */}
                            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-3">
                                    02 / INTERVIEW DURATION
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {[15, 30].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDuration(d)}
                                            className={`py-2.5 rounded-xl border transition-all duration-500 font-bold text-[11px] uppercase tracking-widest ${duration === d
                                                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/10'
                                                    : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:bg-zinc-100'
                                                }`}
                                        >
                                            {d}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Card 3: SELECT COMPANY */}
                            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm flex-1">
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-3">
                                    03 / SELECT COMPANY
                                </p>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        value={companySearch}
                                        onChange={(e) => {
                                            setCompanySearch(e.target.value);
                                            setShowCompanyDropdown(true);
                                        }}
                                        onFocus={(e) => {
                                            setCompanySearch('');
                                            setShowCompanyDropdown(true);
                                            e.target.select();
                                        }}
                                        onBlur={() => setTimeout(() => setShowCompanyDropdown(false), 200)}
                                        placeholder="Search or select a company…"
                                        className="w-full px-4 py-3 pr-10 rounded-xl border border-zinc-100 bg-zinc-50 text-[11px] font-bold uppercase tracking-wider text-zinc-900 placeholder:text-zinc-300 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/5 transition-all"
                                    />
                                    <ChevronRight
                                        size={14}
                                        className={`absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-transform duration-200 ${showCompanyDropdown ? 'rotate-90' : ''}`}
                                    />
                                    {showCompanyDropdown && (
                                        <div className="absolute z-30 w-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-2xl shadow-zinc-900/10 overflow-hidden max-h-[200px] overflow-y-auto">
                                            {KNOWN_COMPANIES.filter(c =>
                                                c.toLowerCase().includes(companySearch.toLowerCase())
                                            ).length === 0 ? (
                                                <p className="px-4 py-3 text-[10px] font-medium text-zinc-400 italic">No matching companies</p>
                                            ) : (
                                                KNOWN_COMPANIES.filter(c =>
                                                    c.toLowerCase().includes(companySearch.toLowerCase())
                                                ).map((c) => (
                                                    <button
                                                        key={c}
                                                        onMouseDown={() => {
                                                            setCompanyName(c);
                                                            setCompanySearch(c);
                                                            if (interviewType === 'technical') {
                                                                setRoundsConfig(getCompanyRounds(c));
                                                            } else {
                                                                setRoundsConfig([]);
                                                            }
                                                            setShowCompanyDropdown(false);
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 flex items-center justify-between ${
                                                            companyName === c
                                                                ? 'bg-zinc-900 text-white'
                                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                                        }`}
                                                    >
                                                        {c}
                                                        {companyName === c && <CheckCircle size={12} />}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Compact inline rounds preview */}
                                {roundsConfig && roundsConfig.length > 0 && (
                                    <div className="flex flex-col mt-2">
                                        {roundsConfig.map((r, i) => (
                                            <div key={i} className="flex items-center gap-2 py-1 border-b border-zinc-50 last:border-0">
                                                <span className="w-4 h-4 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                                                    {i + 1}
                                                </span>
                                                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide flex-1 truncate">{r.round_name}</span>
                                                <span className="text-[9px] text-zinc-300 font-bold shrink-0">
                                                    {r.question_limit}Q
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* MIDDLE COLUMN */}
                        <div className="flex flex-col gap-6 lg:col-span-1">
                            {/* Card 4: INTERVIEW STRUCTURE */}
                            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm flex-1 flex flex-col max-h-[300px]">
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-3 shrink-0">
                                    04 / INTERVIEW STRUCTURE
                                </p>
                                {roundsConfig.length === 0 ? (
                                    <div className="flex flex-1 items-center justify-center h-32 text-zinc-300 text-[11px] font-medium text-center italic bg-zinc-50/50 rounded-xl border border-zinc-50">
                                        Select a company to preview<br/>interview structure
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
                                        {roundsConfig.map((round, idx) => (
                                            <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl">
                                                <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-zinc-900 uppercase tracking-wide">{round.round_name}</p>
                                                    <p className="text-[9px] text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">{round.focus_description}</p>
                                                </div>
                                                <span className="text-[9px] font-bold text-zinc-300 shrink-0 mt-1">
                                                    {round.question_limit}Q
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Card 5: INTERVIEW SETTINGS */}
                            <div className="bg-white rounded-2xl border border-zinc-100 p-5 shadow-sm">
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-3">
                                    05 / INTERVIEW SETTINGS
                                </p>
                                <div className="space-y-3">
                                    {/* Persona Selector */}
                                    <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-50">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Interviewer Persona</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['Neutral', 'Friendly', 'Tough', 'Speed Round'].map((p) => (
                                                <button
                                                    key={p}
                                                    onClick={() => setInterviewerPersona(p)}
                                                    className={`py-2 px-2 rounded-lg border transition-all duration-300 font-bold text-[8px] uppercase tracking-widest ${interviewerPersona === p
                                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                                                            : 'bg-white text-zinc-400 border-zinc-100 hover:bg-zinc-50'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Whiteboard Mode Toggle */}
                                    <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[10px] uppercase tracking-widest text-zinc-900">Whiteboard Mode</p>
                                            <p className="text-[8px] font-medium text-zinc-400 uppercase tracking-wide mt-0.5">
                                                Verbal walkthrough for technical
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setWhiteboardMode((prev) => !prev)}
                                            className={`w-9 h-5 rounded-full border transition-all duration-500 flex items-center ${whiteboardMode ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-200 border-zinc-200'
                                                }`}
                                        >
                                            <div
                                                className={`w-3.5 h-3.5 bg-white rounded-full mx-0.5 transition-transform duration-500 ${whiteboardMode ? 'translate-x-[14px]' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Proctor Toggle */}
                                    <div className="p-3 bg-zinc-50/50 rounded-xl border border-zinc-50 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[10px] uppercase tracking-widest text-zinc-900">Enable Proctoring</p>
                                            <p className="text-[8px] font-medium text-zinc-400 uppercase tracking-wide mt-0.5">
                                                Monitor focus during session
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setProctorMode((prev) => !prev)}
                                            className={`w-9 h-5 rounded-full border transition-all duration-500 flex items-center ${proctorMode ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-200 border-zinc-200'
                                                }`}
                                        >
                                            <div
                                                className={`w-3.5 h-3.5 bg-white rounded-full mx-0.5 transition-transform duration-500 ${proctorMode ? 'translate-x-[14px]' : ''
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-4 lg:col-span-1 h-full">
                            {/* Card 6: RESUME CONTEXT */}
                            <div className={`flex-1 p-5 rounded-2xl border transition-all duration-500 shadow-sm flex flex-col justify-center items-center text-center ${hasResume ? 'border-zinc-100 bg-white' : 'border-red-100 bg-[#FFF5F5]'
                                }`}>
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-5 self-start w-full text-left">
                                    06 / RESUME CONTEXT
                                </p>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${hasResume ? 'bg-zinc-900 shadow-lg shadow-zinc-900/10' : 'bg-red-500 shadow-lg shadow-red-500/20'
                                    }`}>
                                    <FileText size={24} className="text-white" />
                                </div>
                                <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-900 mb-1.5">
                                    {sessionResumeName
                                        ? 'Custom Session Resume'
                                        : profile?.resume_text
                                            ? 'Using Profile Data'
                                            : 'Resume Missing'}
                                </h3>
                                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-6 px-4">
                                    {sessionResumeName
                                        ? `${sessionResumeName}`
                                        : profile?.resume_text
                                            ? 'Automated mapping enabled for tailored questions'
                                            : 'Upload your resume to enable personalized interview logic'}
                                </p>
                                <label className="cursor-pointer group mt-auto w-full">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleResumeUpload}
                                        accept=".pdf,.docx"
                                        disabled={uploadingResume}
                                    />
                                    <div className={`flex items-center justify-center gap-2.5 w-full py-3 border rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                                        hasResume ? 'bg-zinc-50 border-zinc-200 hover:border-zinc-900 text-zinc-600 hover:text-zinc-900' : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                                    }`}>
                                        {uploadingResume ? <Activity size={14} className="animate-pulse" /> : <Upload size={14} />}
                                        {hasResume ? 'Update Resume' : 'Upload Resume'}
                                    </div>
                                </label>
                            </div>

                            {/* Card 7: Advisory */}
                            <div className="shrink-0 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-relaxed flex items-center gap-2.5">
                                    <Zap size={14} className="text-zinc-900 shrink-0" />
                                    Requires silent environment & high-fidelity audio.
                                </p>
                            </div>

                            {/* START BUTTON */}
                            <button
                                onClick={handleProceedToInstructions}
                                disabled={isStarting || !hasResume || uploadingResume}
                                className="shrink-0 w-full py-5 bg-zinc-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/20 disabled:opacity-30 active:scale-95"
                            >
                                {isStarting ? (
                                    <>
                                        <Activity size={18} className="animate-pulse" /> STARTING...
                                    </>
                                ) : (
                                    <>
                                        {!hasResume ? 'UPLOAD RESUME TO START' : (
                                            <>
                                                START INTERVIEW
                                                <ChevronRight size={18} />
                                            </>
                                        )}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ── INSTRUCTIONS SCREEN ───────────────────────────────────
    if (step === 'instructions') {
        return (
            <div className="min-h-screen py-8 px-6 bg-[#FBFBFB] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-900/5 overflow-hidden"
                >
                    <div className="px-10 py-10">
                        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 shadow-md">
                            <Radio size={28} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-2">Before We Begin</h2>
                        <p className="text-zinc-500 font-medium mb-8">
                            {duration} minutes · {roundsConfig.length || 1} rounds
                        </p>

                        <div className="space-y-6 mb-10">
                            {[
                                "Use earphones or headphones",
                                "Sit in a quiet environment",
                                "Ensure stable internet connection",
                                "Speak clearly at a normal pace",
                                proctorMode ? "Do not switch tabs (proctoring enabled)" : "Stay focused during the session"
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center gap-4 text-zinc-700 font-medium text-sm"
                                >
                                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                        <CheckCircle size={14} className="text-zinc-500" />
                                    </div>
                                    {item}
                                </motion.div>
                            ))}
                        </div>

                        {roundsConfig && roundsConfig.length > 0 && (
                            <div className="mb-10 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-4">Interview Structure</p>
                                <div className="space-y-5">
                                    {roundsConfig.map((round, idx) => (
                                        <div key={idx} className="flex items-start gap-4 relative">
                                            {idx < roundsConfig.length - 1 && (
                                                <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-zinc-200" />
                                            )}
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 relative z-10">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900 tracking-tight">{round.round_name}</p>
                                                <p className="text-xs text-zinc-500 leading-relaxed mt-1">{round.focus_description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-6 border-t border-zinc-100">
                            <button
                                onClick={() => setStep('entry')}
                                className="flex-1 py-4 bg-white text-zinc-500 border border-zinc-200 rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:text-zinc-900 hover:border-zinc-300 transition-all"
                            >
                                ← Change Settings
                            </button>
                            <button
                                onClick={handleConfirmStart}
                                disabled={isStarting}
                                className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95 disabled:opacity-50"
                            >
                                {isStarting ? 'Starting...' : "I'm Ready, Start →"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── INTERVIEW SCREEN ──────────────────────────────────────
    return (
        <>
            <div className="min-h-screen pt-8 pb-12 px-6 md:px-10 bg-[#FBFBFB]">
                <div className="max-w-[1600px] mx-auto space-y-8">
                    {/* Top bar */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-zinc-100">
                        <div className="flex items-center gap-6">
                            <SiriVisualizer isActive={isSpeaking} analyserNode={analyserNode} />
                            {/* Company letter-avatar */}
                            {companyName && (
                                <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                    <span className="text-white font-bold text-base">{companyName[0].toUpperCase()}</span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                                    Practice Interview
                                </h1>
                                {(companyName || jobTitle) && (
                                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-zinc-400 mt-2 truncate max-w-md">
                                        {companyName}{jobTitle && ` • ${jobTitle}`}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Round badge */}
                            {roundsConfig && roundsConfig.length > 1 && (
                                <div className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    Round {(currentRound?.round_index ?? 0) + 1} of {roundsConfig.length}
                                    <span className="text-zinc-400 font-medium normal-case tracking-normal">·</span>
                                    {currentRound?.round_name || 'General'}
                                </div>
                            )}
                            {isTimerActive && (
                                <div className="flex items-center gap-3 px-6 py-3 bg-zinc-50 border border-zinc-100 text-zinc-900 rounded-full font-sans font-bold text-lg tracking-tight shadow-sm">
                                    <Clock size={18} className="text-zinc-300" /> {formatTime(timeLeft)}
                                </div>
                            )}

                            {/* Status */}
                            <span className={`px-6 py-3 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${statusPill}`}>
                                {isSpeaking ? 'SPEAKING' : (isActive ? 'LISTENING' : status.toUpperCase())}
                            </span>

                            {/* Mute */}
                            <button
                                onClick={() => setIsMuted((prev) => !prev)}
                                disabled={!isActive || isSpeaking}
                                className={`premium-tag flex items-center gap-2.5 px-6 py-3.5 rounded-full border font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 ${ (isMuted || isSpeaking) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-900 border-zinc-100 hover:border-zinc-900'
                                    }`}
                            >
                                {(isMuted || isSpeaking) ? <MicOff size={16} /> : <Mic size={16} />}
                                {isSpeaking ? 'AI Speaking' : (isMuted ? 'Unmute' : 'Mute')}
                            </button>

                            {/* Stop */}
                            <button
                                onClick={() => handleStop()}
                                disabled={!isActive}
                                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-red-100 bg-red-50/50 text-red-500 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                            >
                                <StopCircle size={16} /> End
                            </button>

                            {/* Back to entry */}
                            <button
                                onClick={() => {
                                    if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
                                    handleStop();
                                    setStep('entry');
                                }}
                                className="flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-zinc-100 bg-white text-zinc-900 font-bold text-[10px] uppercase tracking-widest hover:border-zinc-900 transition-all"
                            >
                                <ArrowLeft size={16} /> Exit
                            </button>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-red-500" />
                            <p className="text-red-600 font-bold text-xs uppercase tracking-widest">{errorMsg}</p>
                        </div>
                    )}

                    {!isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[40px] border border-zinc-100 p-12 shadow-2xl shadow-zinc-900/5"
                        >
                            {showCompletionOptions ? (
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-2 bg-zinc-900 rounded-full animate-pulse" />
                                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-900">Session Completed</p>
                                        </div>
                                        <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">Ready to Submit?</h2>
                                        <p className="text-base text-zinc-500 leading-relaxed">
                                            You've completed your practice session. Choose whether to submit your transcript for a detailed expert review or discard this session and try again.
                                        </p>
                                        <div className="flex items-center gap-8 mt-8">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Duration</span>
                                                <span className="text-sm font-bold text-zinc-900">{duration} Minutes</span>
                                            </div>
                                            <div className="w-px h-8 bg-zinc-100" />
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Transcript</span>
                                                <span className="text-sm font-bold text-zinc-900">{conversationLog.length} Exchanges</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 min-w-[360px]">
                                        <button
                                            onClick={handleFinalSubmit}
                                            className="flex-1 w-full py-4 bg-zinc-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
                                        >
                                            Submit
                                        </button>
                                        <button
                                            onClick={() => setShowDiscardModal(true)}
                                            className="flex-1 w-full py-4 bg-white text-zinc-400 border border-zinc-100 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:border-zinc-900 hover:text-zinc-900 transition-all active:scale-95"
                                        >
                                            Discard
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="max-w-3xl">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-4">Interview Submitted</p>
                                        <h2 className="text-4xl font-bold text-zinc-900 tracking-tight mb-4">Thank you for completing your mock interview.</h2>
                                        <p className="text-base text-zinc-500 leading-relaxed">
                                            Your analysis will be ready in some time. We have shared your interview transcript and the AI interviewer transcript with our admin review team.
                                        </p>
                                    </div>

                                    <div className="min-w-[260px] bg-[#FAFAFA] border border-zinc-100 rounded-[28px] p-8">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-3">Review Status</p>
                                        <div className="flex items-center gap-3 text-zinc-900 font-bold text-sm">
                                            {isSavingInterview ? <Activity size={18} className="animate-pulse" /> : <CheckCircle size={18} />}
                                            {isSavingInterview ? 'Sending transcript to admin...' : reviewTicket?.status === 'pending_review' ? 'Queued for admin review' : 'Awaiting review'}
                                        </div>
                                        {reviewTicket?.id && (
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 mt-4 break-all">
                                                Ticket {reviewTicket.id}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Round Progress Indicator */}
                    {roundsConfig && roundsConfig.length > 1 && (
                        <div className="bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-1">Interview Rounds</p>
                                <p className="text-[11px] font-bold text-zinc-900">
                                    {currentRound ? `Currently in: ${currentRound.round_name}` : 'Starting...'}
                                </p>
                            </div>
                            <RoundProgressIndicator
                                rounds={roundsConfig}
                                currentRoundIndex={currentRound?.round_index ?? 0}
                            />
                        </div>
                    )}

                    {/* Transcript + Response panels — dim on round transition */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        style={{
                            opacity: panelsDimmed ? 0.3 : 1,
                            transition: 'opacity 400ms ease',
                        }}
                    >
                        {/* Participant Panel */}
                        <div className="bg-white rounded-2xl border border-zinc-100 p-8 shadow-2xl shadow-zinc-900/5">
                            <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 flex items-center gap-4 pb-4 border-b border-zinc-100 text-zinc-400">
                                <User size={18} className="text-zinc-300" />
                                YOU · {profile?.full_name?.split(' ')[0]?.toUpperCase() || 'CANDIDATE'}
                            </h2>
                            {/* Live mic waveform */}
                            <div className="mb-4">
                                <WaveformVisualizer
                                    analyserRef={micAnalyserRef}
                                    isActive={!isSystemMuted && isActive}
                                    isMuted={isSystemMuted}
                                />
                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-200 mt-2 text-center">
                                    {isActive ? (isSpeaking ? 'AI speaking...' : 'Listening...') : 'Mic inactive'}
                                </p>
                            </div>
                            <div
                                ref={transcriptRef}
                                className="h-72 overflow-y-auto flex flex-col gap-6 pr-4 custom-scrollbar"
                            >
                                {transcripts.map((t, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-base font-medium text-zinc-600 leading-relaxed"
                                    >
                                        {t}
                                    </motion.p>
                                ))}
                                {partialTranscript && (
                                    <p className="text-sm italic text-zinc-400 leading-relaxed">
                                        {partialTranscript}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* AI Response */}
                        <div className="bg-white rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-900/5 flex flex-col">
                            {/* ── Sticky Round Header ─────────────────────────── */}
                            {roundsConfig && roundsConfig.length > 1 && currentRound && (
                                <div className="sticky top-0 z-10 bg-zinc-900 rounded-t-2xl px-6 py-3">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white text-center">
                                        CURRENT ROUND: {currentRound.round_name?.toUpperCase() || 'GENERAL'} ({(currentRound.round_index ?? 0) + 1}/{currentRound.total_rounds || roundsConfig.length})
                                    </p>
                                    {/* Sub-Round Progress Bar */}
                                    <div className="mt-2">
                                        <SubRoundProgressBar
                                            questionsAsked={roundQuestionsAsked}
                                            questionLimit={
                                                roundsConfig[currentRound.round_index]?.question_limit || 0
                                            }
                                            roundStartTime={roundStartTime}
                                            totalRoundTime={null}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-4 flex items-center gap-4 pb-4 border-b border-zinc-100 text-zinc-400">
                                    <Bot size={18} className="text-zinc-300" />
                                    AI INTERVIEWER · {companyName?.toUpperCase() || 'INTERVIEWER'}
                                    {isSpeaking && (
                                        <span className="ml-auto inline-block w-2 h-2 rounded-full bg-zinc-900 animate-pulse" />
                                    )}
                                </h2>
                                {/* AI audio waveform */}
                                <div className="mb-4">
                                    <WaveformVisualizer
                                        analyserRef={analyserNode}
                                        isActive={isSpeaking}
                                        isMuted={false}
                                    />
                                </div>

                                {/* Hide chat during prep countdown */}
                                {showPrepCountdown ? (
                                    <div className="h-64 flex flex-col items-center justify-center">
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center"
                                        >
                                            <div className="w-12 h-12 rounded-full border-2 border-zinc-200 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-2xl font-black text-zinc-900 tabular-nums">{prepCountdownValue}</span>
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">
                                                Preparing next round…
                                            </p>
                                        </motion.div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Thinking indicator */}
                                        {isThinking && !visibleWords && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-[10px] font-medium text-zinc-300 uppercase tracking-widest italic text-center mb-4"
                                            >
                                                Interviewer is thinking...
                                            </motion.p>
                                        )}
                                        <div
                                            ref={responseRef}
                                            className="h-64 overflow-y-auto flex flex-col gap-6 pr-4 custom-scrollbar"
                                        >
                                            {/* Previous completed responses — always shown */}
                                            {responses.map((r, i) => (
                                                <motion.p
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-base font-medium text-zinc-900 leading-relaxed"
                                                >
                                                    {r}
                                                </motion.p>
                                            ))}
                                            
                                            {/* Placeholder — only when truly empty */}
                                            {responses.length === 0 && !visibleWords && !isThinking && (
                                                <p className="text-xs font-medium text-zinc-300 italic">
                                                    Awaiting logic synthesis...
                                                </p>
                                            )}
                                            
                                            {/* Live subtitle — shown IN ADDITION to previous responses */}
                                            {visibleWords && (
                                                <motion.p
                                                    key="live"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-base font-bold text-zinc-900 leading-relaxed border-t border-zinc-50 pt-4 mt-2"
                                                >
                                                    {visibleWords}
                                                    <span
                                                        className="inline-block w-[3px] h-[1.1em] bg-zinc-900 ml-0.5 align-middle"
                                                        style={{ animation: 'blink 0.9s step-end infinite' }}
                                                    />
                                                </motion.p>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Initializing Overlay — shown until first response_start */}
            <AnimatePresence>
                {isInitializing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[80] flex flex-col items-center justify-center"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(24,24,27,0.95) 0%, rgba(9,9,11,0.98) 100%)' }}
                    >
                        <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-20 h-20 rounded-full border-2 border-zinc-700 flex items-center justify-center mb-8"
                        >
                            <Bot size={36} className="text-zinc-400" />
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg font-bold text-white tracking-tight mb-3"
                        >
                            Initializing AI Interviewer…
                        </motion.p>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest"
                        >
                            Connecting to Session
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Prep Countdown Overlay (3-2-1) */}
            <PrepCountdownOverlay
                show={showPrepCountdown}
                roundName={prepRoundName}
                roundIndex={prepRoundIndex}
                totalRounds={prepTotalRounds}
                countdownValue={prepCountdownValue}
            />

            {/* Round Transition Overlay (shown AFTER countdown ends) */}
            <RoundTransitionOverlay
                show={showRoundTransition}
                roundName={currentRound?.round_name || ''}
                focus={currentRound?.focus || ''}
            />

            {/* Proctor Violation Overlay */}
            <AnimatePresence>
                {showViolationAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-8 bg-white/80 backdrop-blur-2xl"
                    >
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-zinc-900 text-4xl font-bold tracking-tight mb-6">
                            Focus Interrupted
                        </h2>
                        <p className="text-zinc-500 text-base max-w-md mb-6 font-medium leading-relaxed">
                            Sim session requires absolute cognitive focus. This interruption has been logged in the performance matrix.
                        </p>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="px-6 py-4 bg-zinc-50 rounded-3xl border border-zinc-100">
                                <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Total Violations</p>
                                <p className="text-2xl font-bold text-zinc-900">{violationCount}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowViolationAlert(false)}
                            className="px-12 py-5 bg-zinc-900 text-white rounded-full font-bold uppercase tracking-widest text-[11px] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/20 active:scale-95"
                        >
                            Return to Interface
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Discard Confirmation Modal */}
            <ConfirmModal
                isOpen={showDiscardModal}
                onClose={() => setShowDiscardModal(false)}
                onConfirm={handleFinalCancel}
                title="Discard Practice Session?"
                message="Are you sure you want to discard this practice session? Your progress will not be saved for review."
                confirmText="Yes, Discard"
                cancelText="Cancel"
            />
        </>
    );
};

export default MockInterviewPage;
