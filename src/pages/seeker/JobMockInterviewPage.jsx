import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobDetails } from '../../api/jobsApi';
import {
    setMockJobContext,
    setMockMode,
    startMockInterview,
    uploadProfileResumeToSession,
    setJobMockMode,
    createMockInterviewReview,
    updateIntermediateTranscript
} from '../../api/mockInterviewApi';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useMicrophone } from '../../hooks/useMicrophone';
import { useAudioStreamer } from '../../hooks/useAudioStreamer';
import { useUtteranceStateMachine, SentenceStatus } from '../../hooks/useUtteranceStateMachine';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, MicOff, Clock, User, Bot, AlertTriangle, Send, Loader2, CheckCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// ── Config ────────────────────────────────────────────────────
const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const MOCK_WS_BASE = import.meta.env.VITE_MOCK_WS_URL || `${wsProto}//${window.location.hostname}:8001/mock/ws`;

// ── Helpers ───────────────────────────────────────────────────
const HIDDEN_TYPES = new Set(["main_question", "follow_up"]);

function normalizeMessageType(type) {
    const t = String(type || "").trim().toLowerCase();
    return HIDDEN_TYPES.has(t) ? null : t;
}

function sanitizeInterviewerText(text) {
    return String(text || "")
        .replace(/\[\s*(MAIN[_\s]QUESTION|FOLLOW[_\s]UP)\s*\]/gi, "")
        .replace(/\b(main_question|follow_up)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

const isSatisfactionCheck = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return lower.includes("satisfied") && (lower.includes("add more") || lower.includes("would you like to"));
};

// ── LocalStyles component for scoping Mock Page styling ────────────────
const LocalStyles = () => (
    <style dangerouslySetInnerHTML={{ __html: `
        .mock-bg-screen {
            background-color: var(--bg-primary) !important;
            color: var(--text-main) !important;
        }
        .mock-bg-card {
            background-color: var(--bg-surface-solid) !important;
            border-color: var(--border-main) !important;
        }
        .mock-bg-chat-container {
            background-color: rgba(255, 255, 255, 0.45) !important;
            border-color: var(--border-main) !important;
        }
        .mock-bubble-user {
            background-color: var(--accent) !important;
            color: #ffffff !important;
        }
        .mock-bubble-assistant {
            background-color: var(--bg-surface-solid) !important;
            color: var(--text-main) !important;
            border: 1px solid var(--border-subtle) !important;
        }
        .mock-text-primary {
            color: var(--text-main) !important;
        }
        .mock-text-muted {
            color: var(--text-subtle) !important;
        }
        .mock-text-timestamp {
            color: rgba(28, 26, 23, 0.45) !important;
        }
        .mock-hover-bg:hover {
            background-color: rgba(28, 26, 23, 0.05) !important;
        }
        .mock-border-main {
            border-color: var(--border-main) !important;
        }
    ` }} />
);

// ── SiriVisualizer component ─────────────────────────────────────────
const SiriVisualizer = ({ isActive, analyserNode }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();
    const phaseRef = useRef(0);
    const waves = [
        { amplitude: 12, frequency: 0.06, color: 'rgba(212,91,52,0.8)', speed: 0.08 },
        { amplitude: 10, frequency: 0.04, color: 'rgba(244,140,94,0.8)', speed: -0.06 },
        { amplitude: 8, frequency: 0.08, color: 'rgba(28, 26, 23, 0.3)', speed: 0.1 },
    ];

    const animate = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'screen';
        phaseRef.current += 0.03;

        let liveAmp = 0;
        if (analyserNode && analyserNode.current) {
            const bufferLength = analyserNode.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserNode.current.getByteTimeDomainData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += Math.abs(dataArray[i] - 128);
            }
            liveAmp = sum / bufferLength;
        }

        waves.forEach((wave, i) => {
            ctx.beginPath();
            ctx.strokeStyle = wave.color;
            ctx.lineWidth = 2.5;
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
            className={`relative w-24 h-24 rounded-full overflow-hidden border border-zinc-200 bg-zinc-50 flex items-center justify-center transition-all duration-500 ${
                isActive ? 'scale-110 shadow-2xl shadow-orange-500/10 border-orange-500/30' : ''
            }`}
        >
            <canvas ref={canvasRef} width={96} height={96} style={{ filter: 'blur(1.5px)', transform: 'scale(1.1)' }} />
        </div>
    );
};

// ── Main Page Component ──────────────────────────────────────────────
const JobMockInterviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { session, profile, loading } = useAuth();
    const token = session?.access_token;

    const profileRef = useRef(profile);
    useEffect(() => {
        profileRef.current = profile;
    }, [profile]);

    // Phase management: 'initializing' | 'active' | 'completed'
    const [step, setStep] = useState('initializing');
    const [job, setJob] = useState(null);
    const [mockConfig, setMockConfig] = useState({ input_mode: 'text', question_count: 4 });
    const [errorMsg, setErrorMsg] = useState('');

    // Active state
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [chatMessages, setChatMessages] = useState([]);
    const [currentResponse, setCurrentResponse] = useState('');
    const [currentSentenceText, setCurrentSentenceText] = useState('');
    const [textInput, setTextInput] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [partialTranscript, setPartialTranscript] = useState('');

    // Status display
    const [status, setStatus] = useState('Initializing');
    const [statusClass, setStatusClass] = useState('initializing');

    // Conversation logging & telemetry
    const [conversationLog, setConversationLog] = useState([]);
    const conversationLogRef = useRef([]);
    const mockConfigRef = useRef(mockConfig);

    useEffect(() => {
        mockConfigRef.current = mockConfig;
    }, [mockConfig]);

    const [questionCounter, setQuestionCounter] = useState(0);
    const [isFirstTurn, setIsFirstTurn] = useState(true);

    const sessionSuffix = useRef(Date.now().toString());
    const currentSessionIdRef = useRef('');
    const interviewRecordIdRef = useRef(null);
    const sentenceRafRef = useRef(null);
    const forcedMuteRef = useRef(false);
    const hasInitializedRef = useRef(false);

    const chatScrollRef = useRef(null);
    const responseScrollRef = useRef(null);

    const stateMachine = useUtteranceStateMachine();

    // Session ID
    const sessionId = `${id}_job_${sessionSuffix.current}`;
    if (!currentSessionIdRef.current) currentSessionIdRef.current = sessionId;

    const wsUrl = `${MOCK_WS_BASE}?session_id=${currentSessionIdRef.current}${token ? `&token=${token}` : ''}`;

    // Auto-scroll logic
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages, isThinking, partialTranscript]);

    useEffect(() => {
        if (responseScrollRef.current) {
            responseScrollRef.current.scrollTop = responseScrollRef.current.scrollHeight;
        }
    }, [currentResponse, currentSentenceText]);

    // Timer logic
    useEffect(() => {
        if (step !== 'active') return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleFinalSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [step]);

    // Format MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Strip bracket tags before rendering or adding to DB
    const sanitizeText = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/\[[A-Z_]{2,}\]/g, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    // Save turn to conversational log
    const appendConversationEntry = useCallback((role, content) => {
        const sanitized = sanitizeText(content);
        if (!sanitized) return;

        const newEntry = {
            role,
            content: sanitized,
            created_at: new Date().toISOString(),
        };

        setConversationLog((prev) => {
            const updated = [...prev, newEntry];
            conversationLogRef.current = updated;
            const recordId = interviewRecordIdRef.current;
            if (recordId) {
                const intermediateUser = updated
                    .filter(item => item.role === 'user')
                    .map(item => item.content);
                const intermediateAi = updated
                    .filter(item => item.role === 'assistant' || item.role === 'system')
                    .map(item => item.content);

                updateIntermediateTranscript(recordId, {
                    transcript: updated,
                    userTranscript: intermediateUser,
                    aiTranscript: intermediateAi,
                }).catch(err => console.error('Failed to update intermediate transcript:', err));
            }
            return updated;
        });
    }, []);

    // Playback start word-by-word reveal
    const handlePlaybackStart = useCallback(({ sentenceId, wallClockMs }) => {
        stateMachine.markPlaying(sentenceId, wallClockMs);
        const schedule = stateMachine.getSchedule(sentenceId);
        if (!schedule || schedule.length === 0) return;

        const anchorMs = wallClockMs + 50;
        cancelAnimationFrame(sentenceRafRef.current);

        const revealSentenceWords = () => {
            const sentence = stateMachine.getSentence(sentenceId);
            if (sentence && sentence.status === SentenceStatus.INTERRUPTED) return;

            const elapsed = Date.now() - anchorMs;
            const visible = schedule
                .filter(w => w.start_ms <= elapsed)
                .map(w => w.word)
                .join(' ');

            setCurrentSentenceText(visible);

            const allWordsRevealed = visible.split(' ').filter(Boolean).length >= schedule.length;
            const durationMs = sentence?.scheduleDurationMs || 0;
            const isTimeUp = durationMs > 0 && elapsed >= durationMs;

            if (!allWordsRevealed && !isTimeUp) {
                sentenceRafRef.current = requestAnimationFrame(revealSentenceWords);
            } else {
                setCurrentSentenceText('');
            }
        };

        sentenceRafRef.current = requestAnimationFrame(revealSentenceWords);
    }, [stateMachine]);

    // Audio stream hooks
    const { initStreamer, feedChunk, flushRemaining, resetForNextSentence, stopSentenceAudio, stopAudio, isSpeaking, analyserNode } = useAudioStreamer(
        (speaking) => {
            if (speaking) {
                forcedMuteRef.current = true;
            } else {
                setTimeout(() => {
                    forcedMuteRef.current = false;
                }, 1000);
            }
        },
        handlePlaybackStart
    );

    // WebSocket event dispatcher
    const handleMessage = useCallback((data) => {
        if (data instanceof ArrayBuffer) {
            if (mockConfig.input_mode === 'text') return;
            forcedMuteRef.current = true;
            const activeSid = stateMachine.getActiveSentenceId();
            feedChunk(data, activeSid);
            if (activeSid != null) {
                stateMachine.addPcmBytes(activeSid, data.byteLength);
            }
            return;
        }

        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                switch (parsed.type) {
                    case 'auth_ok':
                        setStatus('Ready');
                        setStatusClass('ready');
                        break;

                    case 'response_start':
                        stateMachine.dispatchEvent(parsed);
                        break;

                    case 'transcript': {
                        let whisperText = parsed.text || '';
                        if (!whisperText) {
                            setPartialTranscript('');
                            break;
                        }
                        setPartialTranscript('');
                        setIsThinking(true);
                        
                        // Deduplicate user messages in text/hybrid modes to prevent duplicate bubbles
                        const lastMsg = chatMessages[chatMessages.length - 1];
                        if (lastMsg && lastMsg.role === 'user' && sanitizeText(lastMsg.text) === sanitizeText(whisperText)) {
                            break;
                        }

                        const newMsg = {
                            id: Date.now().toString(),
                            role: 'user',
                            text: whisperText,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setChatMessages(prev => [...prev, newMsg]);
                        appendConversationEntry('user', whisperText);
                        break;
                    }

                    case 'assistant_interrupted':
                        stopSentenceAudio();
                        cancelAnimationFrame(sentenceRafRef.current);
                        const { partialText } = stateMachine.interruptActive();
                        if (partialText) {
                            setCurrentResponse(partialText);
                        }
                        setCurrentSentenceText('');
                        setIsThinking(false);
                        break;

                    case 'sentence_text': {
                        const action = stateMachine.dispatchEvent(parsed);
                        if (action && action.isFirst) {
                            setCurrentResponse('');
                        }
                        setIsThinking(false);
                        break;
                    }

                    case 'sentence_schedule':
                        stateMachine.dispatchEvent(parsed);
                        break;

                    case 'sentence_complete': {
                        const action = stateMachine.dispatchEvent(parsed);
                        if (action && action.completedText) {
                            const cleanText = sanitizeInterviewerText(action.completedText);
                            setCurrentResponse(cleanText);
                        }
                        break;
                    }

                    case 'response_done': {
                        const action = stateMachine.dispatchEvent(parsed);
                        if (action && action.fullText) {
                            const cleanText = sanitizeInterviewerText(action.fullText);
                            setCurrentResponse(cleanText);
                            
                            const msgType = action.messageType || 'follow_up';
                            let qNum = questionCounter;
                            if (msgType === 'main_question') {
                                qNum = questionCounter + 1;
                                setQuestionCounter(qNum);
                            }

                            const newMsg = {
                                id: Date.now().toString(),
                                role: 'assistant',
                                text: cleanText,
                                message_type: normalizeMessageType(msgType),
                                question_number: qNum,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };

                            setChatMessages(prev => [...prev, newMsg]);
                            appendConversationEntry('assistant', cleanText);

                            if (mockConfig.input_mode === 'text' && isFirstTurn) setIsFirstTurn(false);
                            setStatus('Listening');
                            setStatusClass('listening');
                        }
                        setIsThinking(false);
                        break;
                    }

                    case 'interview_complete':
                    case 'session_end_trigger':
                        handleFinalSubmit();
                        break;

                    case 'ping':
                    default:
                        break;
                }
            } catch (err) {
                console.error('Error parsing WS message:', err);
            }
        }
    }, [mockConfig.input_mode, isFirstTurn, questionCounter, stateMachine, feedChunk, appendConversationEntry, stopSentenceAudio]);

    // WebSocket connection
    const { connect, sendMessage, disconnect } = useWebSocket(
        wsUrl,
        () => {
            if (token) {
                sendMessage({ type: 'auth', token });
            }
        },
        handleMessage,
        (err) => {
            setErrorMsg(err);
            handleFinalSubmit();
        },
        () => handleFinalSubmit()
    );

    // Microphone hook
    const isSystemMuted = isMuted || isSpeaking || step !== 'active';
    const { startMic, stopMic } = useMicrophone(
        (blob) => {
            sendMessage(blob);
            setStatus('Processing');
            setStatusClass('processing');
            setTimeout(() => {
                setStatus(curr => (curr === 'Processing' ? 'Listening' : curr));
                setStatusClass(curr => (curr === 'processing' ? 'listening' : curr));
            }, 500);
        },
        (err) => {
            toast.error(`Microphone Error: ${err}`);
            stopMic();
            handleFinalSubmit();
        },
        isSystemMuted,
        forcedMuteRef,
        isMuted,
        (text) => {
            setPartialTranscript(text);
        },
        () => {
            if (isSpeaking) {
                stopSentenceAudio();
                cancelAnimationFrame(sentenceRafRef.current);
                sendMessage({ type: 'interrupt' });
                const { partialText } = stateMachine.interruptActive();
                if (partialText) {
                    setCurrentResponse(partialText);
                }
                setCurrentSentenceText('');
                forcedMuteRef.current = false;
            }
        }
    );

    // Debug logger
    useEffect(() => {
        console.log("[JobMockInterviewPage Debug] State change:", {
            step,
            loading,
            hasProfile: !!profile,
            hasToken: !!session?.access_token,
            hasInitialized: hasInitializedRef.current
        });
    }, [step, loading, profile, session]);

    // Auto-launch initialization
    useEffect(() => {
        console.log("[JobMockInterviewPage Debug] useEffect triggered:", { loading, hasInitialized: hasInitializedRef.current });
        if (loading) return;
        if (hasInitializedRef.current) return;
        hasInitializedRef.current = true;

        let active = true;

        const initSession = async () => {
            console.log("[initSession] Starting initialization sequence...");
            try {
                // 1. Fetch job details
                console.log("[initSession] 1. Fetching job details for ID:", id);
                const jobDetails = await getJobDetails(id);
                if (!active) return;
                console.log("[initSession] Job details fetched successfully:", jobDetails.title);
                setJob(jobDetails);

                const config = jobDetails.metadata?.mock_interview_config || {
                    input_mode: 'text',
                    question_count: 4
                };
                setMockConfig(config);

                // 2. Start mock interview DB record
                console.log("[initSession] 2. Starting mock interview DB record...");
                const dbSession = await startMockInterview(id);
                if (!active) return;
                console.log("[initSession] DB record created successfully, record ID:", dbSession.id);
                interviewRecordIdRef.current = dbSession.id;

                const currSessionId = currentSessionIdRef.current;

                // 3. Set context variables
                console.log("[initSession] 3. Setting mock job context...");
                await setMockJobContext(jobDetails.company_name || 'Acme Corp', jobDetails.description_raw || '', currSessionId);
                
                // 4. Set Mock Mode (technical format, voice/text mode, 5 min duration)
                console.log("[initSession] 4. Setting mock mode...");
                await setMockMode('technical', currSessionId, {
                    interviewerPersona: 'Neutral',
                    whiteboardMode: false,
                    durationMinutes: 5,
                    interviewInputMode: config.input_mode
                });

                // 5. Upload profile resume if available
                const currentProfile = profileRef.current;
                if (currentProfile?.resume_text) {
                    console.log("[initSession] 5. Uploading profile resume text to session...");
                    await uploadProfileResumeToSession(currentProfile.resume_text, currSessionId);
                } else {
                    console.log("[initSession] 5. Profile resume_text empty or not found, skipping upload.");
                }

                // 6. Inject structured 5-min mock settings
                console.log("[initSession] 6. Injecting structured job mock settings...");
                await setJobMockMode(currSessionId, config.question_count);

                // 7. Initialize audio stream and connect WS
                console.log("[initSession] 7. Connecting WebSocket...");
                if (config.input_mode !== 'text') {
                    initStreamer();
                }
                connect();

                if (!active) return;
                console.log("[initSession] Setup complete! Transitioning page state to active.");
                setStep('active');
                setStatus('Listening');
                setStatusClass('listening');
                if (config.input_mode !== 'text') {
                    startMic();
                }
            } catch (err) {
                console.error('[initSession] Error during initialization sequence:', err);
                if (active) {
                    setErrorMsg('Failed to initialize mock interview. Please try again.');
                }
            }
        };

        initSession();

        return () => {
            active = false;
            hasInitializedRef.current = false;
            stopMic();
            stopAudio();
            disconnect();
            cancelAnimationFrame(sentenceRafRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, loading]);

    // Handle user sending text response
    const handleSendText = () => {
        if (!textInput.trim() || step !== 'active') return;

        const text = textInput.trim();
        setTextInput('');
        setIsThinking(true);

        const newMsg = {
            id: Date.now().toString(),
            role: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, newMsg]);
        appendConversationEntry('user', text);

        sendMessage({
            type: 'text_input',
            text: text
        });

        if (isFirstTurn) setIsFirstTurn(false);
    };

    // Handle Turn Satisfaction responses
    const handleSatisfactionChoice = (choice) => {
        let choiceText = "";
        if (choice === 'satisfied') {
            choiceText = "I'm satisfied with my answer. Please move to the next question.";
        } else {
            choiceText = "I would like to add more detail to my response.";
        }

        const newMsg = {
            id: Date.now().toString(),
            role: 'user',
            text: choiceText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => [...prev, newMsg]);
        appendConversationEntry('user', choiceText);

        sendMessage({
            type: 'text_input',
            text: choiceText
        });

        if (choice === 'add_more') {
            // Re-activate input mechanisms
            if (mockConfig.input_mode === 'text' || mockConfig.input_mode === 'hybrid') {
                // Focus element handled implicitly via state render
            }
            if (mockConfig.input_mode !== 'text') {
                startMic();
            }
        }
    };

    // Finalize session submission
    const handleFinalSubmit = useCallback(async () => {
        stopMic();
        stopAudio();
        disconnect();
        cancelAnimationFrame(sentenceRafRef.current);

        const recordId = interviewRecordIdRef.current;
        if (!recordId) {
            setStep('completed');
            return;
        }

        // If the interview has not started yet (no messages exchanged),
        // do not submit an empty transcript to the backend.
        const currentLog = conversationLogRef.current;
        if (!currentLog || currentLog.length === 0) {
            console.warn('[JobMockInterviewPage] Empty transcript. Skipping submission.');
            // If initialization failed, don't transition to completed phase to preserve error screen
            if (step === 'initializing') {
                setErrorMsg('Failed to establish connection with the AI screening agent. Please check if the backend is running and try again.');
                return;
            }
            setStep('completed');
            return;
        }

        setStatus('Submitting');
        setStatusClass('submitting');

        try {
            const intermediateUser = currentLog
                .filter(item => item.role === 'user')
                .map(item => item.content);
            const intermediateAi = currentLog
                .filter(item => item.role === 'assistant' || item.role === 'system')
                .map(item => item.content);

            await createMockInterviewReview({
                id: recordId,
                interviewType: 'technical',
                durationMinutes: 5,
                transcript: currentLog,
                userTranscript: intermediateUser,
                aiTranscript: intermediateAi,
                roundNumber: 1,
                roundLabel: 'Structured Screening',
                roundType: 'technical',
                roundsConfig: [{
                    round_name: 'Structured Screening',
                    focus_description: 'Structured 5-minute automated screening round.',
                    question_limit: mockConfigRef.current?.question_count || 4
                }],
                roundsCompleted: 1
            });
        } catch (err) {
            console.error('Error submitting interview review:', err);
        } finally {
            setStep('completed');
        }
    }, [stopMic, stopAudio, disconnect, step]);

    // Satisfaction buttons visibility conditions
    const latestMsg = chatMessages[chatMessages.length - 1];
    const showSatisfactionButtons = latestMsg && latestMsg.role === 'assistant' && isSatisfactionCheck(latestMsg.text) && !isSpeaking && !isThinking && step === 'active';

    // ── Phase 1: Initializing render ──
    if (step === 'initializing') {
        return (
            <>
                <LocalStyles />
                <div className="min-h-screen mock-bg-screen flex flex-col items-center justify-center p-6">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center relative">
                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                <div className="absolute inset-0 rounded-3xl bg-orange-500/5 animate-pulse" />
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h2 className="text-xl font-bold uppercase tracking-widest mock-text-primary">Simulating Workspace</h2>
                            <p className="text-sm font-medium mock-text-muted max-w-xs mx-auto">
                                Connecting with the AI screening agent. Preparing interview parameters...
                            </p>
                        </div>

                        {errorMsg ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-650 text-xs font-bold uppercase tracking-wider leading-relaxed">
                                    {errorMsg}
                                </div>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => navigate(`/jobs/${id}`)}
                                        className="px-5 py-2.5 bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-5 py-2.5 bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-orange-500 transition-all"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] mock-text-muted">Secure Link Established</span>
                                <div className="w-24 h-1 bg-zinc-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-2/3 animate-infinite-loading" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    }

    // ── Phase 3: Completed Render ──
    if (step === 'completed') {
        return (
            <>
                <LocalStyles />
                <div className="min-h-screen mock-bg-screen flex flex-col items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg w-full bg-white border border-zinc-200/50 rounded-3xl p-8 md:p-12 text-center space-y-8 shadow-xl"
                    >
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                                <CheckCircle size={32} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tight mock-text-primary">Screening Complete</h1>
                            <p className="mock-text-muted text-sm leading-relaxed max-w-sm mx-auto">
                                Your responses have been securely packaged and transmitted to the hiring team at <span className="font-bold mock-text-primary">{job?.company_name || 'the employer'}</span>.
                            </p>
                        </div>

                        <div className="border-t border-zinc-200/60 pt-8 space-y-6">
                            <div className="grid grid-cols-1 gap-4 text-left text-xs font-semibold uppercase tracking-wider mock-text-muted">
                                <div className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-md bg-zinc-100 flex items-center justify-center text-[10px] mock-text-primary font-bold shrink-0 border border-zinc-200/40">1</span>
                                    <span>AI produces instant synthesis report (complete)</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-md bg-zinc-100 flex items-center justify-center text-[10px] mock-text-primary font-bold shrink-0 border border-zinc-200/40">2</span>
                                    <span>Employer reviews the assessment scorecard</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="w-5 h-5 rounded-md bg-zinc-100 flex items-center justify-center text-[10px] mock-text-primary font-bold shrink-0 border border-zinc-200/40">3</span>
                                    <span>Hiring timeline is updated on your dashboard</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => navigate(`/jobs/${id}`)}
                                className="w-full bg-zinc-900 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-850 transition-all shadow-xl shadow-zinc-200/30"
                            >
                                Back to Job Details
                            </button>
                        </div>
                    </motion.div>
                </div>
            </>
        );
    }

    // ── Phase 2: Active Render ──
    return (
        <>
            <LocalStyles />
            <div className="min-h-screen mock-bg-screen flex flex-col">
                {/* Header */}
                <header className="border-b border-zinc-200/50 bg-white/85 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleFinalSubmit}
                            className="p-2.5 rounded-xl border border-zinc-200/60 bg-white hover:bg-zinc-50 transition-all text-zinc-650 hover:text-zinc-950"
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold mock-text-primary tracking-tight leading-tight">{job?.title || 'Role Screening'}</h2>
                            <span className="text-[10px] font-bold mock-text-muted uppercase tracking-widest">{job?.company_name || 'Employer'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/70 border border-zinc-200/50 rounded-xl">
                            <Clock size={14} className={timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                            <span className={`text-xs font-bold font-mono tracking-wider ${timeLeft <= 60 ? 'text-red-500 font-bold' : 'mock-text-primary'}`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        <button
                            onClick={handleFinalSubmit}
                            className="bg-red-50 border border-red-200 text-red-600 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-100 hover:text-red-700 transition-all"
                        >
                            End Screening
                        </button>
                    </div>
                </header>

                {/* Conversation Area */}
                <main className="flex-1 max-w-[1200px] w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-hidden">
                    
                    {/* Chat Panel */}
                    <div className="md:col-span-2 flex flex-col mock-bg-chat-container border rounded-3xl overflow-hidden relative backdrop-blur-sm h-[calc(100vh-170px)]">
                        
                        {/* Chat Messages */}
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                            <AnimatePresence initial={false}>
                                {chatMessages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}
                                    >
                                        {msg.role !== 'user' && (
                                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-500">
                                                <Bot size={16} />
                                            </div>
                                        )}

                                        <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'mock-bubble-user rounded-tr-none shadow-sm'
                                                : 'mock-bubble-assistant rounded-tl-none shadow-sm'
                                        }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                            <span className={`block text-[9px] mt-2 font-bold text-right ${
                                                msg.role === 'user' ? 'text-white/80' : 'mock-text-timestamp'
                                            }`}>
                                                {msg.timestamp}
                                            </span>
                                        </div>

                                        {msg.role === 'user' && (
                                            <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-500">
                                                <User size={16} />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Interactive state display */}
                            {isThinking && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-500">
                                        <Bot size={16} />
                                    </div>
                                    <div className="mock-bubble-assistant rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}

                            {partialTranscript && (
                                <div className="flex gap-4 justify-end">
                                    <div className="max-w-[80%] rounded-2xl p-4 bg-white/70 mock-text-muted rounded-tr-none border border-zinc-200/50 text-xs italic shadow-sm">
                                        <span className="block text-[8px] font-bold uppercase tracking-wider text-orange-500 not-italic mb-1">Live Transcript</span>
                                        "{partialTranscript}"
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-500">
                                        <User size={16} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Bottom Controls */}
                        <div className="p-6 border-t mock-border-main bg-white/70 space-y-4">
                            
                            {/* Turn Satisfaction Choice overlay */}
                            {showSatisfactionButtons && (
                                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center py-2">
                                    <button
                                        onClick={() => handleSatisfactionChoice('satisfied')}
                                        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/5"
                                    >
                                        ✓ I'm satisfied
                                    </button>
                                    <button
                                        onClick={() => handleSatisfactionChoice('add_more')}
                                        className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-zinc-200"
                                    >
                                        + Add more to answer
                                    </button>
                                </div>
                            )}

                            {/* Input Methods */}
                            {!showSatisfactionButtons && (
                                <>
                                    {mockConfig.input_mode === 'text' || (mockConfig.input_mode === 'hybrid' && !isSpeaking) ? (
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                                                disabled={isThinking}
                                                placeholder="Type your response here..."
                                                className="flex-1 bg-white border border-zinc-200 rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:border-orange-500/60 transition-all text-zinc-900 placeholder-zinc-400"
                                            />
                                            <button
                                                onClick={handleSendText}
                                                disabled={isThinking || !textInput.trim()}
                                                className="p-4 bg-orange-600 text-white rounded-xl hover:bg-orange-500 transition-all disabled:opacity-40"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        /* Voice Mode controls */
                                        <div className="flex flex-col items-center gap-3 py-2">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => setIsMuted(!isMuted)}
                                                    className={`p-4 rounded-full border transition-all ${
                                                        isMuted 
                                                            ? 'bg-red-55/20 border-red-500/20 text-red-500' 
                                                            : 'bg-zinc-100 border-zinc-200 text-zinc-750 hover:bg-zinc-200'
                                                    }`}
                                                >
                                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                                </button>

                                                <div className="text-[10px] font-bold uppercase tracking-widest mock-text-muted">
                                                    {isMuted ? 'Microphone Muted' : isSpeaking ? 'AI is speaking...' : 'Listening... Speak now'}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Visualizer panel */}
                    <div className="flex flex-col gap-6">
                        {/* Simulator Card */}
                        <div className="bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col items-center text-center justify-center backdrop-blur-sm flex-1 shadow-sm">
                            <div className="space-y-6 flex flex-col items-center">
                                <SiriVisualizer isActive={isSpeaking || (!isMuted && mockConfig.input_mode !== 'text' && !showSatisfactionButtons)} analyserNode={analyserNode} />
                                
                                <div className="space-y-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                                        statusClass === 'listening' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
                                        statusClass === 'processing' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600' :
                                        'bg-zinc-100 border-zinc-200 text-zinc-500'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            statusClass === 'listening' ? 'bg-orange-500 animate-ping' :
                                            statusClass === 'processing' ? 'bg-indigo-500 animate-pulse' :
                                            'bg-zinc-500'
                                        }`} />
                                        {status}
                                    </span>
                                    
                                    <h3 className="font-bold text-sm mock-text-primary">
                                        {mockConfig.input_mode === 'text' ? 'TEXT INTERVIEW' : 'VOICE STREAM'}
                                    </h3>
                                </div>
                            </div>

                            {/* Word reveal caption block */}
                            {currentSentenceText && (
                                <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200/50 rounded-2xl text-xs font-semibold tracking-wide mock-text-muted max-w-xs leading-relaxed animate-pulse">
                                    "{currentSentenceText}"
                                </div>
                            )}
                        </div>

                        {/* Guidelines Card */}
                        <div className="bg-white border border-zinc-200/50 rounded-3xl p-6 backdrop-blur-sm shadow-sm">
                            <h3 className="text-xs font-bold uppercase tracking-widest mock-text-muted mb-4 flex items-center gap-2">
                                <HelpCircle size={14} className="text-orange-500" /> Instructions
                            </h3>
                            <ul className="space-y-3 text-[10px] font-medium tracking-wide uppercase mock-text-muted">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500">•</span>
                                    <span>This session will last at most 5 minutes.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500">•</span>
                                    <span>Answer based on requirements in the job description.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500">•</span>
                                    <span>No credits will be deducted for this screening.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-500">•</span>
                                    <span>Confirm satisfaction after each question to move on.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default JobMockInterviewPage;
