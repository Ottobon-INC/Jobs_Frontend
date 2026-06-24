import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { setMockJobContext, setMockMode, uploadMockResume, createMockInterviewReview, startMockInterview, setMockInterviewStructure, uploadProfileResumeToSession, updateIntermediateTranscript } from '../../api/mockInterviewApi';
import { getCompanyRounds } from '../../shared/companyRounds';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useMicrophone } from '../../hooks/useMicrophone';
import { useAudioStreamer } from '../../hooks/useAudioStreamer';
import { useUtteranceStateMachine, SentenceStatus } from '../../hooks/useUtteranceStateMachine';
import { useDevTelemetry } from '../../hooks/useDevTelemetry';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toJpeg } from 'html-to-image';
import { generateUUID } from '../../utils/uuid';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';
import { CreditBalance } from '../../components/rewards/CreditBalance';
import { CreditCheckPanel, CreditCheckModal } from '../../components/rewards/CreditCheckModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import HowItWorksWidget from '../../components/ui/HowItWorksWidget';
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
    Sparkles,
    ArrowUpRight,
    Layers,
    Shield,
    Send,
} from 'lucide-react';

// ── Config ────────────────────────────────────────────────────
// URLs come from .env — never hardcoded in source
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
        // remove bracket tags if present
        .replace(/\[\s*(MAIN[_\s]QUESTION|FOLLOW[_\s]UP)\s*\]/gi, "")
        // remove plain leaked tokens if present
        .replace(/\b(main_question|follow_up)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}


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
        <div className="flex items-center gap-0 overflow-x-auto max-w-full no-scrollbar py-2 snap-x">
            {rounds.map((round, idx) => {
                const isDone = idx < currentRoundIndex;
                const isActive = idx === currentRoundIndex;
                const isPending = idx > currentRoundIndex;
                return (
                    <div key={idx} className="flex items-center shrink-0 snap-center">
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

// ── PERSONA PROFILES ──────────────────────────────────────────
const PERSONA_PROFILES = {
  'Marcus Reid': { name: 'Marcus Reid', title: 'Senior Engineering Manager' },
  'Priya Sharma': { name: 'Priya Sharma', title: 'Startup Founder' },
  'Jordan Lee': { name: 'Jordan Lee', title: 'Skeptical Interviewer' },
  'Sarah Kim': { name: 'Sarah Kim', title: 'Supportive Mentor' },
  'Neutral': { name: 'Interviewer', title: 'Interviewer' },
};

// ── Text Mode Components ────────────────────────────────────────

const QuestionCard = ({ message, personaInfo, interviewerPersona }) => {
  const name = personaInfo?.name || 
    PERSONA_PROFILES[interviewerPersona]?.name || 
    'Interviewer';
  
  return (
    <div className="flex flex-col gap-1.5 max-w-[88%]">
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Question {message.question_number}
        </span>
      </div>
      <div
        style={{ borderLeft: '3px solid #18181b' }}
        className="bg-white rounded-xl rounded-tl-sm border border-zinc-100 px-5 py-4 shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
      >
        <p className="text-[13.5px] text-zinc-900 leading-relaxed font-medium">
          {message.text ? sanitizeInterviewerText(message.text) : ''}
        </p>
      </div>
      <span className="text-[9px] text-zinc-300 px-1 font-medium">
        {name} · {message.timestamp}
      </span>
    </div>
  );
};

const FollowUpBubble = ({ message, personaInfo, interviewerPersona }) => {
  const name = personaInfo?.name || 
    PERSONA_PROFILES[interviewerPersona]?.name || 
    'Interviewer';
  
  return (
    <div className="flex flex-col gap-1 max-w-[72%]">
      <div className="bg-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 border border-zinc-100">
        <p className="text-[13px] text-zinc-700 leading-relaxed">
          {message.text ? sanitizeInterviewerText(message.text) : ''}
        </p>
      </div>
      <span className="text-[9px] text-zinc-300 px-1 font-medium">
        {name} · {message.timestamp}
      </span>
    </div>
  );
};

const GreetingBubble = ({ message, personaInfo, interviewerPersona }) => {
  const name = personaInfo?.name || 
    PERSONA_PROFILES[interviewerPersona]?.name || 
    'Interviewer';
  
  return (
    <div className="flex flex-col gap-1 max-w-[88%]">
      <div className="bg-zinc-900 rounded-2xl rounded-tl-sm px-5 py-4">
        <p className="text-[13px] text-zinc-100 leading-relaxed">
          {message.text ? sanitizeInterviewerText(message.text) : ''}
        </p>
      </div>
      <span className="text-[9px] text-zinc-300 px-1 font-medium">
        {name} · {message.timestamp}
      </span>
    </div>
  );
};

const UserBubble = ({ message }) => {
  const statusIcon = {
    sending: '·',
    sent: '✓',
    read: '✓✓',
  }[message.status] || '✓';
  
  const statusColor = message.status === 'read' 
    ? 'text-zinc-400' 
    : 'text-zinc-500';
  
  return (
    <div className="flex flex-col items-end gap-1 max-w-[78%] ml-auto">
      <div className="bg-zinc-900 rounded-2xl rounded-tr-sm px-4 py-3">
        <p className="text-[13px] text-zinc-100 leading-relaxed">
          {message.text}
        </p>
      </div>
      <span className={`text-[9px] px-1 font-medium ${statusColor}`}>
        You · {message.timestamp} · {statusIcon}
      </span>
    </div>
  );
};

const TypingIndicator = ({ personaInfo, interviewerPersona }) => {
  const name = personaInfo?.name || 
    PERSONA_PROFILES[interviewerPersona]?.name || 
    'Interviewer';
  
  return (
    <div className="flex flex-col gap-1 max-w-[72%]">
      <div className="bg-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3.5 border border-zinc-100 flex items-center gap-1.5 w-fit">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-zinc-400"
            style={{
              animation: 'typingBounce 1.2s infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="text-[9px] text-zinc-300 px-1 font-medium">
        {name} is typing...
      </span>
    </div>
  );
};

const TextInterviewScreen = ({
  chatMessages,
  aiIsTyping,
  textInput,
  setTextInput,
  handleSendText,
  isActive,
  isSpeaking,
  chatScrollRef,
  personaInfo,
  interviewerPersona,
  currentRound,
  roundsConfig,
  localRoundTimer,
  status,
  interviewInputMode,
}) => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  const persona = personaInfo || 
    PERSONA_PROFILES[interviewerPersona] || 
    PERSONA_PROFILES['Neutral'];
  
  return (
    <div className="flex flex-col h-[calc(100dvh-180px)] min-h-[500px] bg-white rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-900/5 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {persona?.name?.[0] || 'M'}
          </div>
          <div>
            <p className="text-white font-bold text-sm">
              {persona?.name || 'Marcus Reid'}
            </p>
            <p className="text-zinc-400 text-[10px] font-medium">
              {persona?.title || 'Senior Engineering Manager'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {currentRound && (
            <div className="px-3 py-1.5 bg-zinc-800 rounded-full border border-zinc-700">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-300">
                {currentRound.round_name} · {(currentRound.round_index ?? 0) + 1}
                /{currentRound.total_rounds || roundsConfig?.length || 1}
              </span>
            </div>
          )}
          
          {localRoundTimer !== null && isActive && (
            <div className={`px-3 py-1.5 rounded-full border font-bold text-[9px] uppercase tracking-widest
              ${localRoundTimer <= 30 
                ? 'bg-red-500 border-red-600 text-white animate-pulse' 
                : localRoundTimer <= 60 
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}>
              {Math.floor(localRoundTimer / 60)}:
              {String(localRoundTimer % 60).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
      
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 bg-[#F8F7F4]"
      >
        {chatMessages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] font-medium text-zinc-300 uppercase tracking-widest">
              Connecting to interviewer...
            </p>
          </div>
        )}
        
        {chatMessages.map((msg) => {
          if (msg.role === 'user') {
            return <UserBubble key={msg.id} message={msg} />;
          }
          if (msg.message_type === 'greeting') {
            return (
              <GreetingBubble 
                key={msg.id} 
                message={msg}
                personaInfo={personaInfo}
                interviewerPersona={interviewerPersona}
              />
            );
          }
          if (msg.message_type === 'main_question') {
            return (
              <QuestionCard
                key={msg.id}
                message={msg}
                personaInfo={personaInfo}
                interviewerPersona={interviewerPersona}
              />
            );
          }
          return (
            <FollowUpBubble
              key={msg.id}
              message={msg}
              personaInfo={personaInfo}
              interviewerPersona={interviewerPersona}
            />
          );
        })}
        
        {aiIsTyping && (
          <TypingIndicator 
            personaInfo={personaInfo}
            interviewerPersona={interviewerPersona}
          />
        )}
      </div>
      
      <div className="px-5 py-4 border-t border-zinc-100 bg-white shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isActive || aiIsTyping || (interviewInputMode !== 'text' && isSpeaking)) return;
                handleSendText();
              }
            }}
            placeholder={
              isActive 
                ? "Type your answer... (Enter to send · Shift+Enter for new line)"
                : "Waiting for interviewer..."
            }
            rows={2}
            disabled={!isActive || aiIsTyping || (interviewInputMode !== 'text' && isSpeaking)}
            className="flex-1 px-4 py-3 rounded-xl border border-zinc-100 bg-zinc-50 text-sm text-zinc-900 resize-none focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900/10 placeholder:text-zinc-300 disabled:opacity-40 transition-all leading-relaxed"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSendText}
            disabled={!textInput.trim() || !isActive || aiIsTyping || (interviewInputMode !== 'text' && isSpeaking)}
            className="w-11 h-11 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 active:scale-95 disabled:opacity-30 transition-all shrink-0 mb-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        
        {textInput.length > 50 && (
          <p className="text-[9px] text-zinc-300 mt-2 font-medium text-right pr-14">
            {textInput.length} chars
          </p>
        )}
      </div>
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
        const dpr = window.devicePixelRatio || 1;
        canvas.width = 320 * dpr;
        canvas.height = 64 * dpr;
        ctx.scale(dpr, dpr);
        let animId;

        const draw = () => {
            const analyser = analyserRef?.current;
            const W = 320;
            const H = 64;
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
    const howItWorksSteps = [
        {
            title: "Choose Your Interviewer",
            description: "Select an AI interviewer personality (Marcus, Jordan, Priya, or Sarah) and choose the rounds you want to practice.",
            icon: User
        },
        {
            title: "Check Your Microphone",
            description: "Test your microphone and verify your audio setup to make sure the voice conversation works perfectly.",
            icon: Mic
        },
        {
            title: "Start Practicing",
            description: "Talk or type your answers in real-time. Follow your progress, monitor any mistakes, and review a detailed scorecard afterwards.",
            icon: Radio
        }
    ];

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const jobTitle = location.state?.jobTitle || '';
    // Promoted to state so the entry-screen company selector can override it
    const [companyName, setCompanyName] = useState(location.state?.companyName || '');
    const [companySearch, setCompanySearch] = useState(location.state?.companyName || '');
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

    // Session step: 'selection' | 'entry' | 'briefing' | 'interview'
    const [step, setStep] = useState('selection');
    const [isAutoStarting, setIsAutoStarting] = useState(!!id);
    const [setupStep, setSetupStep] = useState(1);

    // Credit System Gating State
    const { 
        freeCreditsRemaining,
        purchasedCreditsRemaining, 
        useCredit, 
        isFirstTimeUser,
        syncCreditsWithBackend
    } = useInterviewCreditsContext();

    const aiCreditsRemaining = freeCreditsRemaining + purchasedCreditsRemaining;

    const [showCreditPanel, setShowCreditPanel] = useState(false);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [modalType, setModalType] = useState('onboarding'); // 'onboarding' | 'paywall'

    // Interview input mode
    const [interviewInputMode, setInterviewInputMode] = useState('voice');
    // 'voice' | 'text' | 'hybrid'

    // Text mode input
    const [textInput, setTextInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [aiIsTyping, setAiIsTyping] = useState(false);
    const [questionCounter, setQuestionCounter] = useState(0);
    const chatScrollRef = useRef(null);

    // Persona info from backend
    const [personaInfo, setPersonaInfo] = useState(null);

    // Round time remaining (from backend time_remaining_seconds)
    const [roundTimeRemaining, setRoundTimeRemaining] = useState(null);
    const [localRoundTimer, setLocalRoundTimer] = useState(null);

    // Time warning
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [timeWarningRoundName, setTimeWarningRoundName] = useState('');
    const [timeWarningSeconds, setTimeWarningSeconds] = useState(60);

    // Instant debrief
    const [debriefData, setDebriefData] = useState(null);
    const [showDebrief, setShowDebrief] = useState(false);

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
    const [visibleWords, setVisibleWords] = useState('');  // legacy — kept for text-mode compat
    const [currentSentenceText, setCurrentSentenceText] = useState(''); // live sentence word-by-word
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

    // Fresh session suffix — regenerated on every handleStart to avoid stale backend state
    const [sessionSuffix, setSessionSuffix] = useState(() => Date.now().toString());

    // Briefing room checklist state (must be top-level — not inside conditional)
    const [checkedItems, setCheckedItems] = useState({});

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
    const typingTimeoutRef = useRef(null);
    const forcedMuteRef = useRef(false);
    const stopSessionRef = useRef(null);
    const endingRef = useRef(false);
    const interviewRecordIdRef = useRef(null);
    // ── Sentence-streaming refs (consolidated — state machine owns most state) ──
    const sentenceRafRef             = useRef(null); // rAF id for per-sentence word reveal

    // ── State machine & telemetry hooks ────────────────────────────────────
    const stateMachine = useUtteranceStateMachine();
    const telemetry = useDevTelemetry();

    // ── Unified user transcript turn ref ───────────────────────────────────
    // Single source of truth for the user's speech in the current turn,
    // eliminating race conditions between SpeechRecognition and Whisper.
    const userTurnRef = useRef({
        turnId: null,           // from response_start.turn_id
        partialText: '',        // live SpeechRecognition interim
        backupText: '',         // SpeechRecognition final (pre-Whisper)
        whisperText: null,      // authoritative Whisper transcript
        committed: false,       // true once added to transcripts[]
        commitSource: null,     // 'backup' | 'whisper'
    });
    const _resetUserTurn = () => {
        userTurnRef.current = {
            turnId: null,
            partialText: '',
            backupText: '',
            whisperText: null,
            committed: false,
            commitSource: null,
        };
    };

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

    // Local round timer countdown
    useEffect(() => {
        if (roundTimeRemaining === null) return;
        setLocalRoundTimer(roundTimeRemaining);
        const interval = setInterval(() => {
            setLocalRoundTimer(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [roundTimeRemaining]);

    const updateStatus = (text, cls) => {
        setStatus(text);
        setStatusClass(cls);
    };

    // Strip backend structural tags like [MAIN_QUESTION], [FOLLOW_UP], [GREETING], etc.
    // before any content reaches the UI or conversation log.
    const _sanitizeText = (text) => {
        if (typeof text !== 'string') return '';
        return text
            .replace(/\[[A-Z_]{2,}\]/g, '')  // remove [TAG] tokens
            .replace(/\s{2,}/g, ' ')           // collapse double-spaces left behind
            .trim();
    };

    const appendConversationEntry = useCallback((role, content) => {
        const sanitized = _sanitizeText(content);
        if (!sanitized) return;

        console.log("[MESSAGE UPDATE]", {
            action: 'appendConversationEntry',
            message: { role, content: sanitized },
            timestamp: performance.now()
        });

        const newEntry = {
            role,
            content: sanitized,
            created_at: new Date().toISOString(),
        };

        setConversationLog((prev) => {
            const updated = [...prev, newEntry];
            
            const recordId = interviewRecordIdRef.current;
            if (recordId) {
                const intermediateUserTranscript = updated
                    .filter(item => item.role === 'user')
                    .map(item => item.content);
                const intermediateAiTranscript = updated
                    .filter(item => item.role === 'assistant' || item.role === 'system')
                    .map(item => item.content);

                updateIntermediateTranscript(recordId, {
                    transcript: updated,
                    userTranscript: intermediateUserTranscript,
                    aiTranscript: intermediateAiTranscript,
                }).catch(err => {
                    console.error('Failed to save intermediate transcript:', err);
                });
            }

            return updated;
        });
    }, []);

    // ── Per-sentence playback-start callback ─────────────────────────────────
    // Fired by useAudioStreamer the instant the first PCM buffer of a sentence
    // is scheduled to play. Uses the state machine's schedule as source of truth.
    const handlePlaybackStart = useCallback(({ sentenceId, wallClockMs }) => {
        // Mark sentence as PLAYING in the state machine
        stateMachine.markPlaying(sentenceId, wallClockMs);

        telemetry.log('playback_start', { sentenceId, wallClockMs });

        // Get the schedule from the state machine (falls back to simulated)
        const schedule = stateMachine.getSchedule(sentenceId);
        if (!schedule || schedule.length === 0) return;

        // Add a small 50ms offset so first word doesn't flash immediately
        const anchorMs = wallClockMs + 50;
        cancelAnimationFrame(sentenceRafRef.current);

        const revealSentenceWords = () => {
            const sentence = stateMachine.getSentence(sentenceId);
            // Stop if sentence was interrupted or completed
            if (sentence && (sentence.status === SentenceStatus.INTERRUPTED)) {
                return;
            }

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
                // When time is up, the visual playback of this sentence is complete.
                // Clear it so the UI seamlessly relies on `currentResponse` (which is updated by sentence_complete).
                setCurrentSentenceText('');
            }
        };

        sentenceRafRef.current = requestAnimationFrame(revealSentenceWords);

        // Log drift measurement
        const sentence = stateMachine.getSentence(sentenceId);
        telemetry.logDrift({
            sentenceId,
            audioStartMs: wallClockMs,
            scheduleStartMs: sentence?.scheduleReady ? wallClockMs : null,
            eventReceiveMs: Date.now(),
        });
    }, [stateMachine, telemetry]);

    const { initStreamer, feedChunk, flushRemaining, resetForNextSentence, markScheduleReady, stopSentenceAudio, stopAudio, isSpeaking, analyserNode } = useAudioStreamer(
        // onSpeakingChange
        (speaking) => {
            if (speaking) {
                forcedMuteRef.current = true;
            } else {
                // Delay unmute — audio may still be playing/echoing
                setTimeout(() => {
                    forcedMuteRef.current = false;
                }, 1000); // 1 second buffer after AI stops speaking
            }
        },
        // onPlaybackStart — fires the moment first audio buffer of a sentence is scheduled
        handlePlaybackStart
    );

    // Debug: log whenever AI speaking or mic mute state changes
    // NOTE: placed AFTER useAudioStreamer so isSpeaking is in scope (avoids TDZ crash)
    useEffect(() => {
        console.log("[VOICE STATE]", {
            aiSpeaking: isSpeaking,
            micMuted: isMuted,
            timestamp: performance.now()
        });
    }, [isSpeaking, isMuted]);

    const handleMessage = useCallback(
        (data) => {
            // ── Binary audio bytes — pipe directly to audio streamer ───────────
            if (data instanceof ArrayBuffer) {
                if (interviewInputMode === 'text') return; // text mode never plays audio
                console.log("[WS EVENT]", "binary_audio", { byteLength: data.byteLength, timestamp: performance.now() });
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
                    console.log("[WS EVENT]", parsed.type || parsed.event, parsed);

                    switch (parsed.type) {

                        // ── User's speech — Whisper authoritative final transcript ─────
                        // Uses unified userTurnRef to eliminate race conditions.
                        case 'transcript': {
                            const ut = userTurnRef.current;
                            let whisperText = parsed.text || '';
                            
                            // If Whisper is empty but we have a backup, keep the backup text
                            if (!whisperText && ut.backupText) {
                                whisperText = ut.backupText;
                            }

                            if (!whisperText) {
                                // Ignore empty transcript and just clear partial
                                setPartialTranscript('');
                                break;
                            }

                            console.log("[TRANSCRIPT]", {
                                source: 'server_Whisper',
                                text: whisperText,
                                wasCommitted: ut.committed,
                                commitSource: ut.commitSource,
                                timestamp: performance.now()
                            });
                            telemetry.log('transcript_received', { text: whisperText, wasCommitted: ut.committed });

                            setPartialTranscript('');

                            // Accumulate Whisper transcript for the current turn
                            const previousWhisper = ut.whisperText || '';
                            const combinedWhisper = previousWhisper 
                                ? (previousWhisper.trim() + ' ' + whisperText.trim()).trim()
                                : whisperText.trim();
                            ut.whisperText = combinedWhisper;

                            if (ut.committed) {
                                // Overwrite the last committed transcript (whether it was backup or previous whisper chunk)
                                setTranscripts((prev) => {
                                    if (prev.length === 0) return [combinedWhisper];
                                    return [...prev.slice(0, -1), combinedWhisper];
                                });
                                setConversationLog((prev) => {
                                    const lastUserIdx = [...prev].reverse().findIndex(e => e.role === 'user');
                                    if (lastUserIdx === -1) {
                                        return [...prev, { role: 'user', content: combinedWhisper, created_at: new Date().toISOString() }];
                                    }
                                    const realIdx = prev.length - 1 - lastUserIdx;
                                    const updated = [...prev];
                                    updated[realIdx] = { ...updated[realIdx], content: combinedWhisper };
                                    return updated;
                                });
                                ut.commitSource = 'whisper';
                            } else {
                                // First chunk of the turn — commit directly
                                setTranscripts((prev) => [...prev, combinedWhisper]);
                                appendConversationEntry('user', combinedWhisper);
                                setRoundQuestionsAsked((prev) => prev + 1);
                                ut.committed = true;
                                ut.commitSource = 'whisper';
                            }

                            setTimeout(() => setIsThinking(true), 200);
                            break;
                        }

                        // ── AI starting to respond ─────────────────────────────────────
                        case 'response_start': {
                            forcedMuteRef.current = true; // Mute mic IMMEDIATELY when AI starts
                            setIsThinking(false);
                            setIsInitializing(false);
                            setIsRoundTransitioning(false);

                            // Dispatch to state machine — resets sentence registry for new turn
                            stateMachine.dispatchEvent(parsed);
                            telemetry.log('response_start', { turnId: parsed.turn_id });

                            // Commit backup user speech using userTurnRef
                            const ut = userTurnRef.current;
                            if (!ut.committed && ut.backupText) {
                                const backupText = ut.backupText;
                                setTranscripts((prev) => {
                                    if (prev[prev.length - 1] === backupText) return prev;
                                    return [...prev, backupText];
                                });
                                appendConversationEntry('user', backupText);
                                setRoundQuestionsAsked((prev) => prev + 1);
                                ut.committed = true;
                                ut.commitSource = 'backup';
                            }
                            setPartialTranscript('');

                            setCurrentSentenceText('');
                            setCurrentResponse('');
                            cancelAnimationFrame(sentenceRafRef.current);
                            updateStatus('Speaking', 'speaking');
                            break;
                        }

                        // ── A new sentence is about to play ───────────────────────────
                        // Text is revealed via state machine → handlePlaybackStart.
                        case 'sentence_text': {
                            parsed.text = sanitizeInterviewerText(parsed.text);
                            parsed.message_type = normalizeMessageType(parsed.message_type);

                            setIsThinking(false);
                            // Reset audio streamer per-sentence state
                            resetForNextSentence();
                            setCurrentSentenceText('');

                            // Dispatch to state machine — stores text, messageType, sentenceId
                            const result = stateMachine.dispatchEvent(parsed);
                            telemetry.log('sentence_text', {
                                sentenceId: parsed.sentence_id,
                                text: parsed.text?.substring(0, 60),
                                messageType: parsed.message_type,
                                isFirst: parsed.is_first,
                            });

                            break;
                        }

                        // ── Word timing for the current sentence ──────────────────────
                        case 'sentence_schedule': {
                            // Dispatch to state machine — stores word schedule
                            stateMachine.dispatchEvent(parsed);
                            // Notify audio streamer that schedule is ready (readiness gate)
                            markScheduleReady(parsed.sentence_id);
                            telemetry.log('sentence_schedule', {
                                sentenceId: parsed.sentence_id,
                                wordCount: parsed.words?.length,
                                durationMs: parsed.duration_ms,
                            });
                            break;
                        }

                        // ── One sentence finished playing ──────────────────────────────
                        case 'sentence_complete': {
                            flushRemaining();

                            // Dispatch to state machine — marks sentence completed
                            const completionResult = stateMachine.dispatchEvent(parsed);

                            // Safely update currentResponse in the background
                            if (completionResult?.completedText) {
                                setCurrentResponse(completionResult.completedText);
                            }
                            
                            // DO NOT cancel RAF or clear currentSentenceText yet.
                            // The typewriter loop will finish gracefully based on schedule duration.
                            telemetry.log('sentence_complete', { sentenceId: parsed.sentence_id });
                            break;
                        }

                        // ── Full AI response complete ──────────────────────────────────
                        case 'response_done': {
                            flushRemaining();
                            // Do NOT cancel RAF here. Let the last sentence finish its animation natively.
                            setIsThinking(false);

                            // Dispatch to state machine — finalizes turn
                            const turnResult = stateMachine.dispatchEvent(parsed);
                            
                            const rawRespText = turnResult?.fullText || parsed.text || currentResponse || '';
                            const finalRespText = sanitizeInterviewerText(rawRespText);
                            
                            const rawMsgType = turnResult?.messageType || parsed.message_type || 'follow_up';
                            const finalMessageType = normalizeMessageType(rawMsgType);

                            telemetry.log('response_done', {
                                textLength: finalRespText.length,
                                messageType: finalMessageType,
                            });

                            if (finalRespText && !finalRespText.includes('Pipeline Error')) {
                                // Store as {text, messageType} object for label rendering
                                setResponses(prev => [...prev, { text: finalRespText, messageType: finalMessageType }]);
                                appendConversationEntry('assistant', finalRespText);
                            } else if (finalRespText?.includes('Pipeline Error')) {
                                addNotification({ type: 'error', message: 'Interviewer encountered a voice error, please try again.' });
                            }
                            setCurrentResponse('');

                            // Reset userTurnRef for next turn
                            _resetUserTurn();

                            if (isFirstTurn) {
                                setIsFirstTurn(false);
                                if (interviewInputMode !== 'text') startMic();
                            }
                            updateStatus('Listening', 'listening');
                            // We do NOT unmute here. 
                            // Unmute is handled securely by onSpeakingChange callback once audio genuinely stops playing.
                            break;
                        }

                        // ── Backend confirmed assistant was interrupted ────────────────
                        case 'assistant_interrupted': {
                            stopSentenceAudio();
                            cancelAnimationFrame(sentenceRafRef.current);

                            const { partialText } = stateMachine.interruptActive();
                            if (partialText) {
                                setCurrentResponse(partialText);
                            }
                            setCurrentSentenceText('');
                            setIsThinking(false);
                            _resetUserTurn();
                            break;
                        }

                        // ── Round time warning ─────────────────────────────────────────
                        case 'round_time_warning':
                            setShowTimeWarning(true);
                            setTimeWarningRoundName(parsed.round_name || '');
                            setTimeWarningSeconds(parsed.seconds_remaining);
                            setRoundTimeRemaining(parsed.seconds_remaining);
                            setTimeout(() => setShowTimeWarning(false), 8000);
                            break;

                        // ── Round transition ───────────────────────────────────────────
                        case 'round_change':
                            stopMic();
                            setIsRoundTransitioning(true);
                            updateStatus('Preparing Round...', 'transition');
                            stopAudio();
                            cancelAnimationFrame(sentenceRafRef.current);
                            setCurrentSentenceText('');
                            stateMachine.reset();
                            _resetUserTurn();
                            setPanelsDimmed(true);
                            setRoundHistory((prev) => [...prev, currentRound].filter(Boolean));
                            setCurrentRound({
                                round_name: parsed.round_name,
                                focus: parsed.focus,
                                round_index: parsed.round_index,
                                total_rounds: parsed.total_rounds,
                            });
                            setRoundQuestionsAsked(0);
                            setRoundStartTime(Date.now());
                            if (parsed.rounds && parsed.rounds.length > 0) setRoundsConfig(parsed.rounds);

                            if (prepTimerRef.current) clearInterval(prepTimerRef.current);
                            setPrepRoundName(parsed.round_name || 'Next Round');
                            setPrepRoundIndex(parsed.round_index);
                            setPrepTotalRounds(parsed.total_rounds);
                            setPrepCountdownValue(3);
                            setShowPrepCountdown(true);
                            {
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
                                        setShowRoundTransition(true);
                                        setTimeout(() => setShowRoundTransition(false), 2500);
                                    }
                                }, 1000);
                            }
                            break;

                        // ── Round info ────────────────────────────────────────────────
                        case 'round_info':
                            setCurrentRound({
                                round_name: parsed.round_name,
                                round_index: parsed.round_index,
                                total_rounds: parsed.total_rounds,
                            });
                            if (parsed.rounds) setRoundsConfig(parsed.rounds);
                            break;

                        // ── Persona info ──────────────────────────────────────────────
                        case 'persona_info':
                            setPersonaInfo(parsed);
                            break;

                        // ── Text mode messages ────────────────────────────────────────
                        case 'response_text':
                        case 'greeting_text': {
                            clearTimeout(typingTimeoutRef.current);
                            setAiIsTyping(false);
                            const msgType = parsed.message_type || (parsed.type === 'greeting_text' ? 'greeting' : 'follow_up');
                            let qNum = questionCounter;
                            if (msgType === 'main_question') {
                                qNum = questionCounter + 1;
                                setQuestionCounter(qNum);
                            }
                            const newMsg = {
                                id: Date.now().toString(),
                                role: 'assistant',
                                text: sanitizeInterviewerText(parsed.text),
                                message_type: normalizeMessageType(msgType),
                                question_number: qNum,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                            console.log("[MESSAGE UPDATE]", {
                                action: 'receiveText_Assistant',
                                message: newMsg,
                                timestamp: performance.now()
                            });
                            setChatMessages(prev => [...prev, newMsg]);
                            setTimeout(() => {
                                if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                            }, 100);
                            if (interviewInputMode === 'text' && isFirstTurn) setIsFirstTurn(false);
                            if (interviewInputMode === 'text') updateStatus('Listening', 'listening');
                            if (parsed.round_index !== undefined) {
                                setCurrentRound(prev => ({ ...prev, round_index: parsed.round_index, round_name: parsed.round_name || prev?.round_name }));
                            }
                            if (parsed.time_remaining_seconds !== undefined) setLocalRoundTimer(parsed.time_remaining_seconds);
                            break;
                        }

                        // ── Legacy fallbacks ──────────────────────────────────────────
                        case 'round_time_up':
                            addNotification({
                                type: 'warning',
                                title: 'Round Time Up',
                                message: `${parsed.round_name} is complete. Transitioning to ${parsed.next_round}...`,
                            });
                            setIsMuted(true);
                            setTimeout(() => setIsMuted(false), 3000);
                            break;

                        case 'response':
                            if (parsed.text?.includes('Pipeline Error')) {
                                addNotification({ type: 'error', message: 'Interviewer encountered a voice error, please try again.' });
                            } else {
                                setResponses((prev) => [...prev, parsed.text]);
                                appendConversationEntry('assistant', parsed.text);
                            }
                            break;

                        case 'response_chunk':
                            setCurrentResponse((prev) => {
                                // Intelligently add spaces between chunks if backend strips them
                                const addSpace = prev.length > 0 && 
                                                 !prev.endsWith(' ') && 
                                                 !parsed.text.startsWith(' ') && 
                                                 !/^[.,?!:;'"\]]/.test(parsed.text);
                                return prev + (addSpace ? ' ' : '') + parsed.text;
                            });
                            break;

                        case 'interview_complete':
                            stopMic();
                            updateStatus('Disconnected', 'disconnected');
                            if (parsed.debrief) setDebriefData(parsed.debrief);
                            if (stopSessionRef.current) stopSessionRef.current();
                            break;

                        case 'session_end_trigger':
                            stopMic();
                            updateStatus('Disconnected', 'disconnected');
                            if (stopSessionRef.current) stopSessionRef.current();
                            break;

                        case 'ping':
                            break; // ignore keep-alive

                        default:
                            break;
                    }
                } catch {
                    setResponses((prev) => [...prev, data]);
                    appendConversationEntry('assistant', data);
                }
            }
        },
        [appendConversationEntry, feedChunk, flushRemaining, stopAudio, currentRound,
         interviewInputMode, isFirstTurn, questionCounter, resetForNextSentence]
    );

    const { connect, sendAudioChunk, sendMessage, disconnect } = useWebSocket(
        wsUrl,
        () => {
            // Send auth token immediately to avoid 5-second timeout in the backend
            if (token) {
                sendMessage({ type: 'auth', token });
            }
        },
        handleMessage,
        (err) => {
            setErrorMsg(err);
            handleStop();
        },
        () => handleStop()
    );

    // Auto-launch flow when job ID is present and auth/profile context is loaded
    useEffect(() => {
        if (id && profile && !isActive && !isStarting && isAutoStarting) {
            const autoTrigger = async () => {
                try {
                    setIsStarting(true);
                    setIsInitializing(true);
                    updateStatus('Connecting', 'connecting');

                    // 1. Register session with FastAPI backend
                    const startedSession = await startMockInterview(id);
                    interviewRecordIdRef.current = startedSession.id;

                    const currentSessionId = currentSessionIdRef.current;

                    // 2. Set job context
                    await setMockJobContext(companyName || '', jobTitle || '', currentSessionId);

                    // 3. Set mock mode: technical, voice, 15m duration
                    await setMockMode('technical', currentSessionId, { 
                        interviewerPersona: 'Neutral', 
                        whiteboardMode: false, 
                        durationMinutes: 15, 
                        interviewInputMode: 'voice' 
                    });

                    // 4. Push profile resume if available
                    if (profile?.resume_text) {
                        await uploadProfileResumeToSession(profile.resume_text, currentSessionId);
                    }

                    // 5. General Round configuration (single round, 3 questions)
                    const generalRound = {
                        round_name: 'General Round',
                        focus_description: 'General round covering key requirements and candidate experience.',
                        question_limit: 3
                    };
                    await setMockInterviewStructure([generalRound], currentSessionId);

                    // Sync React states
                    setInterviewType('technical');
                    setInterviewInputMode('voice');
                    setDuration(15);
                    setRoundsConfig([generalRound]);
                    setInterviewerPersona('Neutral');
                    setWhiteboardMode(false);

                    // 6. Connect and launch!
                    setTimeLeft(15 * 60);
                    setIsTimerActive(true);
                    setIsActive(true);
                    initStreamer();
                    connect();
                    
                    setStep('interview');
                    setIsAutoStarting(false);
                } catch (err) {
                    console.error('Failed to auto-start interview:', err);
                    setErrorMsg('Failed to initialize session automatically. Please try manually.');
                    setStep('selection');
                    setIsAutoStarting(false);
                } finally {
                    setIsStarting(false);
                    setIsInitializing(false);
                }
            };
            autoTrigger();
        }
    }, [id, profile, isAutoStarting, aiCreditsRemaining, jobTitle, companyName, useCredit, syncCreditsWithBackend, initStreamer, connect]);

    const handleSendText = useCallback(() => {
        if (!textInput.trim() || !isActive) return;

        const newMsg = {
            id: Date.now().toString(),
            role: 'user',
            text: textInput.trim(),
            status: 'sending',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        console.log("[MESSAGE UPDATE]", {
            action: 'sendText_User',
            message: newMsg,
            timestamp: performance.now()
        });

        setChatMessages(prev => [...prev, newMsg]);
        setTranscripts(prev => [...prev, newMsg.text]);
        appendConversationEntry('user', newMsg.text);
        setTextInput('');
        setAiIsTyping(true);
        
        typingTimeoutRef.current = setTimeout(() => {
            setAiIsTyping(false);
            addNotification({
                type: 'error',
                message: 'Interviewer did not respond. Check connection.',
            });
        }, 30000);
        
        sendMessage({
            type: 'text_input',
            text: newMsg.text
        });

        setTimeout(() => {
            if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
            }
        }, 100);
        
        setTimeout(() => {
            setChatMessages(prev => prev.map(m => m.id === newMsg.id ? { ...m, status: 'sent' } : m));
        }, 400);

    }, [textInput, isActive, sendMessage, appendConversationEntry]);

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
            toast.error(`Microphone Error: ${err}`);
            stopMic();
            if (disconnect) disconnect();
            stopPlayback();
            setIsActive(false);
            setIsTimerActive(false);
            setIsStarting(false);
            setStep('ai_setup');
        },
        isSystemMuted,
        forcedMuteRef,
        isMuted,
        // onPartialTranscript — store backup text in unified userTurnRef
        (text) => {
            console.log("[TRANSCRIPT]", {
                source: 'partialTranscriptCallback',
                text: text,
                timestamp: performance.now()
            });
            setPartialTranscript(text);
            if (text) {
                userTurnRef.current.backupText = text;
            }
        },
        // onUserSpeechStart — interruption detection
        () => {
            if (isSpeaking) {
                telemetry.log('user_interrupt', {
                    activeSentenceId: stateMachine.getActiveSentenceId(),
                });

                // Stop AI audio immediately
                stopSentenceAudio();
                cancelAnimationFrame(sentenceRafRef.current);

                // Send interrupt signal to backend
                sendMessage({ type: 'interrupt' });

                // Mark sentence as interrupted in state machine
                const { partialText } = stateMachine.interruptActive();

                // Keep whatever text was revealed so far
                if (partialText) {
                    setCurrentResponse(partialText);
                }
                setCurrentSentenceText('');

                // Allow mic through immediately
                forcedMuteRef.current = false;
            }
        }
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
                aiTranscript: responses.map(r => typeof r === 'string' ? r : r.text),
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

    const handleStartClick = () => {
        const onboardingSeen = localStorage.getItem('ottobon_onboarding_seen');
        if (isFirstTimeUser && !onboardingSeen) {
            setModalType('onboarding');
            setShowCreditModal(true);
            return;
        }

        if (aiCreditsRemaining === 0) {
            setModalType('paywall');
            setShowCreditModal(true);
            return;
        }

        setShowCreditPanel(true);
    };

    const handleCreditConfirmStart = async () => {
        setShowCreditPanel(false);
        setShowCreditModal(false);

        if (aiCreditsRemaining > 0) {
            if (isFirstTimeUser) {
                localStorage.setItem('ottobon_onboarding_seen', 'true');
            }
            await handleProceedToBriefing();
        } else {
            setModalType('paywall');
            setShowCreditModal(true);
        }
    };

    // ── resetSession: full state wipe for clean restarts ──────────────────
    const resetSession = useCallback(() => {
        // Stop all active media
        stopMic();
        stopAudio();
        disconnect();

        // Cancel any in-flight timers / rAFs
        cancelAnimationFrame(sentenceRafRef.current);
        sentenceRafRef.current = null;
        if (prepTimerRef.current) {
            clearInterval(prepTimerRef.current);
            prepTimerRef.current = null;
        }
        clearTimeout(typingTimeoutRef.current);

        // Reset state machine and user turn ref
        stateMachine.reset();
        _resetUserTurn();
        telemetry.clear();

        // Reset refs
        forcedMuteRef.current = false;
        endingRef.current = false;
        stopSessionRef.current = null;
        interviewRecordIdRef.current = null;

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
        setCurrentSentenceText('');
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
        setTextInput('');
        setChatMessages([]);
        setAiIsTyping(false);
        setQuestionCounter(0);
        setPartialTranscript('');
        setRoundTimeRemaining(null);
        setLocalRoundTimer(null);
        setShowTimeWarning(false);
        setDebriefData(null);
        setShowDebrief(false);
        setPersonaInfo(null);
        setCheckedItems({});
        setSetupStep(1);
    }, [stopMic, stopAudio, disconnect, setSetupStep]);

    const handleProceedToBriefing = async () => {
        if (!hasResume && interviewType !== 'hr') return;
        setCheckedItems({});  // fresh checklist each time

        // Full state wipe (media, timers, refs, all React state)
        resetSession();

        // ── Defensive hard-reset before every start ──────────────────────────
        endingRef.current = false;
        try {
            // Register session with the FastAPI backend
            const startedSession = await startMockInterview(id || null);
            interviewRecordIdRef.current = startedSession.id;

            // Deduct credit only after backend session is successfully registered (skipped for job applications)
            if (!id) {
                useCredit(jobTitle || 'General Practice');

                // Sync credits with backend here!
                if (syncCreditsWithBackend) {
                    await syncCreditsWithBackend();
                }
            }
        } catch (err) {
            console.error('Failed to start interview on backend:', err);
            const detail = err.response?.data?.detail || 'Failed to initialize session with server.';
            setErrorMsg(detail);
            setIsStarting(false);
            return;
        }

        // Keep the stable session ID so the uploaded resume is retained
        currentSessionIdRef.current = sessionId;

        setIsStarting(true);
        setErrorMsg('');

        // Go to briefing — WS connect happens there
        setStep('entry');
        setSetupStep(4);
        setIsStarting(false);
    };

    const handleConfirmStart = async () => {
        try {
            setIsStarting(true);
            setIsInitializing(true);
            updateStatus('Connecting', 'connecting');

            // If the interview session hasn't been registered with the FastAPI backend yet (e.g. first-time onboarding bypass), register it now
            if (!interviewRecordIdRef.current) {
                try {
                    const startedSession = await startMockInterview(id || null);
                    interviewRecordIdRef.current = startedSession.id;

                    // Deduct credit only after backend session is successfully registered (skipped for job applications)
                    if (!id) {
                        useCredit(jobTitle || 'General Practice');

                        // Sync credits with backend here!
                        if (syncCreditsWithBackend) {
                            await syncCreditsWithBackend();
                        }
                    }
                } catch (err) {
                    console.error('Failed to start interview on backend during confirm start:', err);
                    const detail = err.response?.data?.detail || 'Failed to initialize session with server.';
                    setErrorMsg(detail);
                    setIsStarting(false);
                    setIsInitializing(false);
                    return;
                }
            }

            const currentSessionId = currentSessionIdRef.current;

            // Wait for ALL setup to complete
            if (companyName || jobTitle) {
                await setMockJobContext(companyName || '', jobTitle || '', currentSessionId);
            }
            await setMockMode(interviewType, currentSessionId, { 
                interviewerPersona, 
                whiteboardMode, 
                durationMinutes: duration, 
                interviewInputMode 
            });

            // 3. Push profile resume to backend session if no file uploaded
            if (!sessionResumeName && profile?.resume_text) {
                await uploadProfileResumeToSession(profile.resume_text, currentSessionId);
            }

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
            
            if (interviewInputMode !== 'text') {
                initStreamer();
            }
            
            // Only NOW connect WebSocket
            connect();
            setStep('interview');
        } catch (err) {
            console.error('Failed to start interview:', err);
            setErrorMsg('Failed to initialize session. Please try again.');
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
        stopAudio();

        // Cancel any in-flight timers / rAFs
        cancelAnimationFrame(sentenceRafRef.current);
        sentenceRafRef.current = null;
        if (prepTimerRef.current) {
            clearInterval(prepTimerRef.current);
            prepTimerRef.current = null;
        }
        // Reset state machine and user turn ref
        stateMachine.reset();
        _resetUserTurn();
        telemetry.clear();

        updateStatus('Disconnected', 'disconnected');
        if (isTimeout) {
            setResponses((prev) => [
                ...prev,
                { text: 'Thank you for the interview. The allocated time has ended.', messageType: 'system' },
            ]);
        }
        
        // Instead of auto-persisting, we show options
        setShowCompletionOptions(true);
    }, [disconnect, stopMic, stopAudio, stateMachine, telemetry]);

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

        // Sync credits with backend here!
        if (syncCreditsWithBackend) {
            await syncCreditsWithBackend();
        }

        // Regenerate suffix for any subsequent interview to get a brand new session ID
        const newSuffix = Date.now().toString();
        setSessionSuffix(newSuffix);
        currentSessionIdRef.current = id ? `${id}_${newSuffix}` : `default_${newSuffix}`;
        setSessionResumeName(null);

        // Auto-redirect seeker back to job details page to show completed status
        if (id) {
            navigate(`/jobs/${id}`);
        }
    };

    const handleFinalCancel = () => {
        if (window.confirm('Are you sure you want to discard this practice session? Your progress will not be saved for review.')) {
            // 1. Kill all active connections/media
            disconnect();
            stopMic();
            stopAudio();

            // 2. Cancel any in-flight timers / rAFs
            cancelAnimationFrame(sentenceRafRef.current);
            sentenceRafRef.current = null;
            if (prepTimerRef.current) {
                clearInterval(prepTimerRef.current);
                prepTimerRef.current = null;
            }
            clearTimeout(typingTimeoutRef.current);

            // Sync credits with backend here to ensure cancellation/discard updates state
            if (syncCreditsWithBackend) {
                syncCreditsWithBackend();
            }

            // 3. Reset state machine, user turn, and refs
            stateMachine.reset();
            _resetUserTurn();
            telemetry.clear();
            endingRef.current = false;
            forcedMuteRef.current = false;
            stopSessionRef.current = null;
            interviewRecordIdRef.current = null;

            // 4. Reset ALL interview state
            setStep('selection');
            setSetupStep(1);
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
            setCurrentSentenceText('');
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
            setTextInput('');
            setChatMessages([]);
            setAiIsTyping(false);
            setQuestionCounter(0);
            setPartialTranscript('');
            setRoundTimeRemaining(null);
            setLocalRoundTimer(null);
            setShowTimeWarning(false);
            setDebriefData(null);
            setShowDebrief(false);
            setPersonaInfo(null);
            setCheckedItems({});

            // Regenerate suffix for any subsequent interview to get a brand new session ID
            const newSuffix = Date.now().toString();
            setSessionSuffix(newSuffix);
            currentSessionIdRef.current = id ? `${id}_${newSuffix}` : `default_${newSuffix}`;
            setSessionResumeName(null);
        }
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
    // ── AUTO START LOADING SCREEN ────────────────────────────────
    if (isAutoStarting) {
        return (
            <div className="min-h-screen bg-[#F4F1EA] text-[#1C1A17] font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
                {/* Visual decorations for premium feel */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#D45B34]/5 via-transparent to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-zinc-400/5 via-transparent to-transparent rounded-full blur-3xl" />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-3xl border border-zinc-100 shadow-2xl p-8 flex flex-col items-center text-center relative z-10"
                >
                    {/* Pulsing bot avatar */}
                    <div className="relative mb-6">
                        <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-900/10"
                        >
                            <Bot size={36} className="text-white animate-pulse" />
                        </motion.div>
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D45B34] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D45B34]"></span>
                        </span>
                    </div>

                    <h2 className="text-xl font-bold uppercase tracking-wider text-zinc-900 mb-2">Preparing Simulator</h2>
                    <p className="text-xs text-zinc-500 font-medium max-w-xs leading-relaxed mb-6">
                        Setting up a General Technical Mock Interview for {jobTitle || 'selected role'}...
                    </p>

                    <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden relative">
                        <motion.div 
                            initial={{ left: "-100%" }}
                            animate={{ left: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="absolute bg-[#D45B34] h-full w-1/2 rounded-full"
                        />
                    </div>

                    {errorMsg && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                            <AlertTriangle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider text-left">{errorMsg}</p>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // ── SELECTION SCREEN ──────────────────────────────────────
    if (step === 'selection') {
        return (
            <div className="min-h-screen bg-[#F4F1EA] text-[#1C1A17] p-6 lg:p-10 font-sans flex items-center justify-center">
                <div className="max-w-5xl mx-auto w-full">
                    {/* Header */}
                    <header className="mb-8 text-center">
                        <motion.h1 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-5xl font-black tracking-tight mb-4 uppercase"
                        >
                            Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C1A17] to-[#D45B34]">Interviews</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="text-lg text-[#1C1A17]/70 max-w-2xl mx-auto font-bold uppercase tracking-widest text-[10px]"
                        >
                            Choose your preferred interview preparation method.
                        </motion.p>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Left Card: AI Mock Interview */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="group relative rounded-[2rem] overflow-hidden bg-[#222222] text-white p-10 flex flex-col h-[450px] shadow-2xl shadow-[#222222]/20 hover:scale-[1.02] transition-transform duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                                    <Bot size={32} className="text-white" />
                                </div>
                            </div>
                            
                            <div className="mt-auto relative z-10">
                                <h2 className="text-white text-3xl font-black uppercase tracking-tight mb-4">AI Mock<br />Interview</h2>
                                <p className="text-white/70 text-sm font-medium leading-relaxed mb-8 max-w-xs">
                                    Practice with our advanced AI interviewer tailored to your job description. Get instant feedback and analysis.
                                </p>
                                <button 
                                    onClick={() => setStep('entry')}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#D45B34] rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-[#F4F1EA] transition-colors"
                                >
                                    Launch Simulator <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Right Card: Human Mock Interview */}
                        <motion.div 
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="group relative rounded-[2rem] overflow-hidden bg-black text-white p-10 flex flex-col h-[450px] shadow-2xl shadow-black/20 hover:scale-[1.02] transition-transform duration-500"
                        >
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-blue-600/30 via-transparent to-transparent rounded-full blur-3xl" />
                            
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                                    <User size={32} className="text-black" />
                                </div>
                            </div>
                            
                            <div className="mt-auto relative z-10">
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Human Mock<br />Interview</h2>
                                <p className="text-white/70 text-sm font-medium leading-relaxed mb-8 max-w-xs">
                                    Schedule a real interview session with industry professionals. Premium personalized feedback and mentorship.
                                </p>
                                <Link 
                                    to="/human-mock-interview"
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                                >
                                    Schedule Interview <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        );
    }

    // ── AI ENTRY / SETUP WIZARD SCREEN ───────────────────────────
    if (step === 'entry') {
        const PERSONA_PROFILES = {
            'Neutral':     { name: 'Marcus Reid',   title: 'Senior Engineering Manager', style: 'Direct, technical, no small talk',        years: 9,  rating: 4.4 },
            'Friendly':    { name: 'Sarah Kim',     title: 'Engineering Lead',            style: 'Warm, collaborative, rigorous',           years: 5,  rating: 4.7 },
            'Tough':       { name: 'Jordan Lee',    title: 'Principal Engineer',          style: 'Challenging, high standards',             years: 12, rating: 3.9 },
            'Speed Round': { name: 'Priya Sharma',  title: 'Co-Founder & CTO',            style: 'Fast, energetic, scenario-driven',        years: 4,  rating: 4.5 },
        };

        const COMPANY_TIPS = {
            google: [
                'Google values scalability above everything else',
                'State time and space complexity for every solution',
                'Use STAR method for behavioral questions',
            ],
            amazon: [
                'Structure every answer using STAR format',
                'Reference Amazon Leadership Principles by name',
                'Quantify impact: use numbers, percentages, scale',
            ],
            microsoft: [
                'Demonstrate Growth Mindset: how do you learn from failure?',
                'Show clean, readable code — Microsoft values maintainability',
                'Collaborate verbally — think out loud',
            ],
            meta: [
                'Move fast — concise, direct answers',
                'Always discuss the impact and scale of your work',
                'Optimal complexity expected — justify every trade-off',
            ],
        };
        const defaultTips = [
            'Show adaptability — how do you handle ambiguity?',
            'Demonstrate ownership — what did YOU specifically do?',
            'Practical skills matter more than theory here',
        ];

        const persona = PERSONA_PROFILES[interviewerPersona] || PERSONA_PROFILES['Neutral'];
        const companyKey = companyName?.toLowerCase().trim() || '';
        const tips = COMPANY_TIPS[companyKey] || defaultTips;

        const timeWeights = [0.47, 0.33, 0.20];
        const roundTimes = roundsConfig.map((_, i) => {
            const weight = timeWeights[i] || (1 / roundsConfig.length);
            return Math.round(duration * weight);
        });

        const isVoiceMode = interviewInputMode === 'voice' || interviewInputMode === 'hybrid';
        const checklistItems = [
            ...(isVoiceMode ? [
                { key: 'headphones', label: 'I am wearing headphones' },
                { key: 'quiet', label: 'I am in a quiet environment' },
            ] : []),
            { key: 'structure', label: 'I have read the round structure above' },
            { key: 'time', label: `I have ${duration} minutes uninterrupted` },
        ];

        const allChecked = checklistItems.every(item => checkedItems[item.key]);

        return (
            <div className="min-h-screen bg-[#F4F1EA] text-[#1C1A17] py-10 px-6 font-sans flex items-center justify-center">
                <div className="w-full max-w-4xl bg-white border border-[#1C1A17]/10 rounded-[2.5rem] shadow-2xl p-8 lg:p-12 relative overflow-hidden">
                    
                    {/* Header: Steps progress indicator */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1C1A17]/40">
                                    Step {setupStep} of 4
                                </span>
                                <CreditBalance mode="ai_interview_only" />
                            </div>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((s) => (
                                    <div 
                                        key={s} 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                            setupStep === s ? 'w-8 bg-[#D45B34]' : 'w-2 bg-[#D45B34]/10'
                                        }`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Title dynamic to step */}
                        <h1 className="text-3xl font-black uppercase tracking-tight text-[#1C1A17]">
                            {setupStep === 1 && "Role & Resume Setup"}
                            {setupStep === 2 && "Choose Format & Duration"}
                            {setupStep === 3 && "Interviewer Profile"}
                            {setupStep === 4 && "Pre-Flight Checklist"}
                        </h1>
                        <p className="text-[#1C1A17]/60 text-xs font-semibold uppercase tracking-wider mt-1">
                            {setupStep === 1 && "Specify your target position and load your resume logic."}
                            {setupStep === 2 && "Configure the interview format, type, and practice duration."}
                            {setupStep === 3 && "Meet your custom AI evaluator and fine-tune system rules."}
                            {setupStep === 4 && "Review configuration and complete audio checks before launch."}
                        </p>
                    </div>

                    {/* Step Content panels */}
                    <div className="min-h-[300px] mb-8">
                        {setupStep === 1 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Job Title */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C1A17]/50 mb-2">Target Job Title</label>
                                    <input 
                                        type="text" 
                                        value={jobTitle} 
                                        readOnly
                                        disabled
                                        className="w-full px-5 py-4 rounded-2xl border border-[#1C1A17]/10 bg-zinc-50 text-sm font-semibold text-[#1C1A17]/60 cursor-not-allowed"
                                    />
                                </div>

                                {/* Company Selector */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C1A17]/50 mb-2">Target Company</label>
                                    <div className="relative">
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
                                            className="w-full px-5 py-4 pr-12 rounded-2xl border border-[#1C1A17]/10 bg-[#FAFAFA] text-xs font-bold uppercase tracking-wider text-[#1C1A17] placeholder:text-[#1C1A17]/30 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-[#D45B34] focus:ring-1 focus:ring-[#D45B34]/5 transition-all"
                                        />
                                        <ChevronRight
                                            size={16}
                                            className={`absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 transition-transform duration-200 ${showCompanyDropdown ? 'rotate-90' : ''}`}
                                        />
                                        {showCompanyDropdown && (
                                            <div className="absolute z-30 w-full mt-2 bg-white border border-[#1C1A17]/10 rounded-2xl shadow-2xl overflow-hidden max-h-[180px] overflow-y-auto">
                                                {KNOWN_COMPANIES.filter(c =>
                                                    c.toLowerCase().includes(companySearch.toLowerCase())
                                                ).length === 0 ? (
                                                    <p className="px-5 py-4 text-xs font-medium text-zinc-400 italic">No matching companies</p>
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
                                                            className={`w-full text-left px-5 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-150 flex items-center justify-between ${
                                                                companyName === c
                                                                    ? 'bg-[#D45B34] text-white'
                                                                    : 'text-[#1C1A17]/70 hover:bg-zinc-50 hover:text-[#1C1A17]'
                                                            }`}
                                                        >
                                                            {c}
                                                            {companyName === c && <CheckCircle size={14} />}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Choose Interview Type */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C1A17]/50 mb-3">Choose Interview Type</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'technical', label: 'Technical Assessment', desc: 'Focus on coding, design, and CS algorithms.' },
                                            { id: 'hr', label: 'Behavioral Assessment', desc: 'Focus on soft skills, culture fit, and experience.' },
                                        ].map(({ id: typeId, label, desc }) => (
                                            <button
                                                key={typeId}
                                                type="button"
                                                onClick={() => {
                                                    setInterviewType(typeId);
                                                    if (typeId !== 'technical') setRoundsConfig([]);
                                                    else if (companyName) setRoundsConfig(getCompanyRounds(companyName));
                                                }}
                                                className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-1 relative ${
                                                    interviewType === typeId
                                                        ? 'bg-[#D45B34] text-white border-[#D45B34] shadow-xl'
                                                        : 'bg-[#FAFAFA] text-[#1C1A17]/50 border-zinc-100 hover:bg-zinc-50'
                                                }`}
                                            >
                                                <span className="font-bold text-[11px] uppercase tracking-widest block">{label}</span>
                                                <span className={`text-[8.5px] font-medium leading-relaxed block ${interviewType === typeId ? 'text-zinc-300' : 'text-zinc-400'}`}>{desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Resume Upload Container */}
                                <div className={`p-6 rounded-2xl border-2 border-dashed text-center flex flex-col items-center justify-center transition-all ${
                                    hasResume 
                                        ? 'border-zinc-200 bg-zinc-50/50' 
                                        : (interviewType === 'hr' ? 'border-zinc-200 bg-zinc-50/10' : 'border-red-200 bg-red-50/30')
                                }`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                                        hasResume ? 'bg-[#D45B34] text-white' : (interviewType === 'hr' ? 'bg-zinc-400 text-white' : 'bg-red-500 text-white')
                                    }`}>
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="font-bold text-xs uppercase tracking-widest text-[#1C1A17] mb-1">
                                        {sessionResumeName
                                            ? 'Custom Session Resume Loaded'
                                            : profile?.resume_text
                                                ? 'Using Profile Resume Data'
                                                : (interviewType === 'hr' ? 'Add Resume (Optional)' : 'Resume Required')}
                                    </h3>
                                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide mb-4 max-w-md">
                                        {sessionResumeName
                                            ? `File: ${sessionResumeName}`
                                            : profile?.resume_text
                                                ? 'Your account profile resume will tailors this simulation.'
                                                : (interviewType === 'hr' 
                                                    ? 'Upload a resume to personalize behavioral scenarios, or skip to continue.'
                                                    : 'Please upload a PDF/TXT resume to customize interview logic.')}
                                    </p>
                                    <label className="cursor-pointer group">
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleResumeUpload}
                                            accept=".pdf,.txt"
                                            disabled={uploadingResume}
                                        />
                                        <div className="flex items-center gap-2 px-6 py-3 border border-[#1C1A17]/10 bg-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-[#D45B34] text-[#1C1A17] transition-all">
                                            {uploadingResume ? <Activity size={12} className="animate-pulse" /> : <Upload size={12} />}
                                            {hasResume ? 'Change Resume File' : 'Upload Resume'}
                                        </div>
                                    </label>
                                </div>
                            </motion.div>
                        )}

                        {setupStep === 2 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Format cards */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C1A17]/50 mb-3">01 / Choose Format</label>
                                    <div className="grid grid-cols-3 gap-4">
                                        {[
                                            { id: 'voice', label: 'Voice Mode', Icon: Mic, desc: 'Real-time conversational voice' },
                                            { id: 'text', label: 'Text Mode', Icon: FileText, desc: 'Chat-based typing layout' },
                                            { id: 'hybrid', label: 'Hybrid Mode', Icon: Activity, desc: 'Voice playbacks + typing options' },
                                        ].map(({ id: modeId, label, Icon, desc }) => (
                                            <button
                                                key={modeId}
                                                onClick={() => setInterviewInputMode(modeId)}
                                                className={`p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col gap-2 relative ${
                                                    interviewInputMode === modeId
                                                        ? 'bg-[#D45B34] text-white border-[#D45B34] shadow-xl shadow-[#D45B34]/10'
                                                        : 'bg-[#FAFAFA] text-[#1C1A17]/50 border-zinc-100 hover:bg-zinc-50'
                                                }`}
                                            >
                                                <Icon size={20} className={interviewInputMode === modeId ? 'text-white' : 'text-[#1C1A17]/50'} />
                                                <span className="font-bold text-[11px] uppercase tracking-widest block mt-2">{label}</span>
                                                <span className={`text-[8.5px] font-medium leading-relaxed block ${interviewInputMode === modeId ? 'text-zinc-300' : 'text-zinc-400'}`}>{desc}</span>
                                                {interviewInputMode === modeId && (
                                                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white animate-pulse" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration Selector */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C1A17]/50 mb-3">02 / Select Duration</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[15, 30].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => setDuration(d)}
                                                className={`py-4 rounded-xl border transition-all duration-300 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${
                                                    duration === d
                                                        ? 'bg-[#D45B34] text-white border-[#D45B34]'
                                                        : 'bg-[#FAFAFA] text-[#1C1A17]/40 border-zinc-100 hover:bg-zinc-50'
                                                }`}
                                            >
                                                <Clock size={14} /> {d} Minutes Practice
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {setupStep === 3 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Interviewer Persona Selector */}
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#1C1A17]/50 mb-3">01 / Select Interviewer Persona</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {Object.entries(PERSONA_PROFILES).map(([key, val]) => (
                                            <button
                                                key={key}
                                                onClick={() => setInterviewerPersona(key)}
                                                className={`p-4 rounded-2xl border text-left transition-all duration-300 flex items-start gap-4 ${
                                                    interviewerPersona === key
                                                        ? 'bg-[#D45B34] text-white border-[#D45B34] shadow-xl'
                                                        : 'bg-[#FAFAFA] text-[#1C1A17]/60 border-zinc-100 hover:bg-zinc-50'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                                                    interviewerPersona === key ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-zinc-100 text-[#1C1A17]'
                                                }`}>
                                                    {val.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-[11px] uppercase tracking-widest block leading-tight">{val.name}</span>
                                                    <span className={`text-[8.5px] font-semibold block uppercase tracking-wider ${interviewerPersona === key ? 'text-zinc-300' : 'text-zinc-400'}`}>{val.title}</span>
                                                    <span className={`text-[8.5px] font-medium leading-relaxed block mt-1 line-clamp-1 ${interviewerPersona === key ? 'text-zinc-400' : 'text-zinc-450'}`}>{val.style}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Whiteboard & Proctor settings */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Whiteboard mode */}
                                    <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-zinc-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[10px] uppercase tracking-widest text-[#1C1A17]">Whiteboard Mode</p>
                                            <p className="text-[8.5px] font-medium text-zinc-400 uppercase tracking-wide mt-0.5 leading-relaxed">
                                                Verbally solve algorithm/design logic
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setWhiteboardMode(prev => !prev)}
                                            className={`w-9 h-5 rounded-full border transition-all duration-500 flex items-center shrink-0 ${
                                                whiteboardMode ? 'bg-[#D45B34] border-[#D45B34]' : 'bg-zinc-200 border-zinc-200'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 bg-white rounded-full mx-0.5 transition-transform duration-300 ${whiteboardMode ? 'translate-x-[14px]' : ''}`} />
                                        </button>
                                    </div>

                                    {/* Proctoring */}
                                    <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-zinc-100 flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-[10px] uppercase tracking-widest text-[#1C1A17]">Enable Proctoring</p>
                                            <p className="text-[8.5px] font-medium text-zinc-400 uppercase tracking-wide mt-0.5 leading-relaxed">
                                                Monitor browser focus issues
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setProctorMode(prev => !prev)}
                                            className={`w-9 h-5 rounded-full border transition-all duration-500 flex items-center shrink-0 ${
                                                proctorMode ? 'bg-[#D45B34] border-[#D45B34]' : 'bg-zinc-200 border-zinc-200'
                                            }`}
                                        >
                                            <div className={`w-3.5 h-3.5 bg-white rounded-full mx-0.5 transition-transform duration-300 ${proctorMode ? 'translate-x-[14px]' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Rounds preview */}
                                {roundsConfig.length > 0 && (
                                    <div className="p-4 bg-[#FAFAFA] rounded-2xl border border-zinc-100">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-3">Target Round Structure</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {roundsConfig.map((r, i) => (
                                                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-100 rounded-xl text-[9px] font-bold uppercase tracking-wider text-[#1C1A17]">
                                                    <span className="w-4.5 h-4.5 rounded-full bg-[#D45B34] text-white flex items-center justify-center text-[8px]">{i + 1}</span>
                                                    {r.round_name} ({r.question_limit}Q)
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {setupStep === 4 && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Briefing details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Left: Interviewer summary & details */}
                                    <div className="bg-[#FAFAFA] border border-zinc-100 rounded-2xl p-5 shadow-sm">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Assigned Interviewer</p>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#D45B34] text-white flex items-center justify-center font-bold text-sm shrink-0">
                                                {persona.name[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[#1C1A17] font-bold text-sm leading-none">{persona.name}</p>
                                                <p className="text-[#1C1A17]/70 text-[10px] mt-1 font-semibold">{persona.title}</p>
                                                <p className="text-[#1C1A17]/60 text-[9px] mt-2 font-medium">Style: <span className="font-bold text-[#1C1A17]">{persona.style}</span></p>
                                                <p className="text-zinc-400 text-[9px] mt-1 font-medium">{persona.years} years experience · Glassdoor ★ {persona.rating}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Round timeline list */}
                                    {roundsConfig && roundsConfig.length > 0 ? (
                                        <div className="bg-[#FAFAFA] border border-zinc-100 rounded-2xl p-5 shadow-sm overflow-y-auto max-h-[140px]">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Timeline Phases</p>
                                            <div className="space-y-2">
                                                {roundsConfig.map((r, idx) => (
                                                    <div key={idx} className="flex items-center gap-2.5">
                                                        <span className="w-4 h-4 rounded-full bg-white border border-[#D45B34]/20 text-[#1C1A17] flex items-center justify-center text-[8px] font-black shrink-0">{idx + 1}</span>
                                                        <span className="text-[9px] font-bold text-[#1C1A17]/80 uppercase tracking-widest truncate">{r.round_name}</span>
                                                        <span className="text-zinc-300 text-[9.5px] font-medium ml-auto">{roundTimes[idx]}m</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-[#FAFAFA] border border-zinc-100 rounded-2xl p-5 flex items-center justify-center text-center">
                                            <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest">Single-round assessment</p>
                                        </div>
                                    )}
                                </div>

                                {/* Tips */}
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-3">Company Target Advice</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {tips.slice(0, 3).map((tip, i) => (
                                            <div key={i} className="p-4 bg-zinc-50 border border-zinc-100/50 rounded-xl flex items-start gap-2.5">
                                                <Zap size={12} className="text-[#1C1A17]/40 shrink-0 mt-0.5" />
                                                <p className="text-[#1C1A17]/75 text-[10px] font-semibold leading-relaxed">{tip}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Checklist boxes */}
                                <div className="space-y-2.5">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400">Pre-Flight Toggles</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {checklistItems.map((item) => (
                                            <button
                                                key={item.key}
                                                onClick={() => setCheckedItems(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                                className="flex items-center gap-3 p-3.5 rounded-xl bg-[#FAFAFA] border border-zinc-100 hover:border-zinc-300 text-left transition-all shadow-sm shrink-0"
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                                    checkedItems[item.key] ? 'bg-[#D45B34] border-[#D45B34]' : 'border-zinc-300 bg-white'
                                                }`}>
                                                    {checkedItems[item.key] && <CheckCircle size={10} className="text-white" />}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider truncate transition-colors ${
                                                    checkedItems[item.key] ? 'text-[#1C1A17]' : 'text-[#1C1A17]/60'
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Navigation bar at bottom of wizard */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
                        {setupStep > 1 ? (
                            <button
                                onClick={() => setSetupStep((s) => s - 1)}
                                className="px-6 py-3.5 border border-[#1C1A17]/10 text-[#1C1A17]/60 font-bold text-[10px] uppercase tracking-widest hover:border-[#D45B34] hover:text-[#1C1A17] rounded-xl transition-all"
                            >
                                Back
                            </button>
                        ) : (
                            <button
                                onClick={() => setStep('selection')}
                                className="px-6 py-3.5 border border-[#1C1A17]/10 text-[#1C1A17]/60 font-bold text-[10px] uppercase tracking-widest hover:border-[#D45B34] hover:text-[#1C1A17] rounded-xl transition-all"
                            >
                                Back to Selection
                            </button>
                        )}

                        {setupStep < 3 && (
                            <button
                                onClick={() => {
                                    if (setupStep === 1 && !hasResume && interviewType !== 'hr') {
                                        setErrorMsg('Please upload a resume before starting your technical interview.');
                                        setTimeout(() => setErrorMsg(''), 5000);
                                        return;
                                    }
                                    setSetupStep((s) => s + 1);
                                }}
                                className="px-8 py-3.5 bg-[#D45B34] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#D45B34]/95 rounded-xl transition-all flex items-center gap-1.5"
                            >
                                Next
                            </button>
                        )}

                        {setupStep === 3 && (
                            <button
                                onClick={handleStartClick}
                                disabled={isStarting || (interviewType !== 'hr' && !hasResume) || uploadingResume || showCreditPanel}
                                className="px-8 py-3.5 bg-[#D45B34] text-white font-bold text-[10px] uppercase tracking-widest hover:bg-[#D45B34]/95 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-[#D45B34]/20 disabled:opacity-30"
                            >
                                {isStarting ? 'Loading...' : 'Pre-Flight Briefing'}
                            </button>
                        )}

                        {setupStep === 4 && (
                            <button
                                onClick={handleConfirmStart}
                                disabled={!allChecked}
                                className="px-8 py-3.5 bg-[#D45B34] text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-[#D45B34]/95 rounded-xl transition-all flex items-center gap-1.5 shadow-xl shadow-[#D45B34]/20 disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                Launch Simulator →
                            </button>
                        )}
                    </div>

                    {/* Inline Error messages inside layout */}
                    {errorMsg && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-100 rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-lg">
                            <AlertTriangle size={14} className="text-red-500" />
                            <span className="text-red-600 font-bold text-[9px] uppercase tracking-widest">{errorMsg}</span>
                        </div>
                    )}

                    {/* Credit panel */}
                    <AnimatePresence>
                        {showCreditPanel && (
                            <CreditCheckPanel
                                onConfirm={handleCreditConfirmStart}
                                onCancel={() => setShowCreditPanel(false)}
                                isStarting={isStarting}
                                mode="ai_interview_only"
                            />
                        )}
                    </AnimatePresence>
                </div>

                <CreditCheckModal
                    isOpen={showCreditModal}
                    onClose={() => setShowCreditModal(false)}
                    viewState={modalType}
                    onConfirm={handleCreditConfirmStart}
                    isStarting={isStarting}
                    mode="ai_interview_only"
                />
            </div>
        );
    }

    // ── INTERVIEW SCREEN ──────────────────────────────────────
    if (interviewInputMode === 'text') {
        return (
            <div className="min-h-screen py-8 px-6 bg-[#FBFBFB] flex flex-col items-center justify-center">
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
                    <div className="flex justify-between items-center px-2">
                         <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                            Practice Interview
                        </h1>
                        <button
                            onClick={() => {
                                handleStop();
                                setStep('entry');
                            }}
                            className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-900 transition-colors flex items-center gap-2"
                        >
                            Exit Interview
                        </button>
                    </div>
                    <TextInterviewScreen 
                        chatMessages={chatMessages}
                        aiIsTyping={aiIsTyping}
                        textInput={textInput}
                        setTextInput={setTextInput}
                        handleSendText={handleSendText}
                        isActive={isActive}
                        isSpeaking={isSpeaking}
                        chatScrollRef={chatScrollRef}
                        personaInfo={personaInfo}
                        interviewerPersona={interviewerPersona}
                        currentRound={currentRound}
                        roundsConfig={roundsConfig}
                        localRoundTimer={localRoundTimer}
                        status={status}
                        interviewInputMode={interviewInputMode}
                    />
                </div>
            </div>
        );
    }

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
                            <CreditBalance mode="ai_interview_only" />
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
                            {localRoundTimer !== null && isActive && (
                                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full border font-bold text-[11px] uppercase tracking-widest transition-all ${localRoundTimer <= 30
                                    ? 'bg-red-50 border-red-100 text-red-500 animate-pulse'
                                    : localRoundTimer <= 60
                                    ? 'bg-amber-50 border-amber-100 text-amber-600'
                                    : 'bg-zinc-50 border-zinc-100 text-zinc-500'
                                }`}>
                                    <Clock size={14} />
                                    Round: {Math.floor(localRoundTimer / 60)}:{String(localRoundTimer % 60).padStart(2, '0')}
                                </div>
                            )}
                            {/* Status */}
                            <span className={`px-6 py-3 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${statusPill}`}>
                                {isSpeaking ? 'SPEAKING' : (isActive ? 'LISTENING' : status.toUpperCase())}
                            </span>

                            {/* Mute */}
                            {interviewInputMode !== 'text' && (
                                <button
                                    onClick={() => setIsMuted((prev) => !prev)}
                                    disabled={!isActive || isSpeaking}
                                    className={`premium-tag flex items-center gap-2.5 px-6 py-3.5 rounded-full border font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-30 ${ (isMuted || isSpeaking) ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-900 border-zinc-100 hover:border-zinc-900'
                                        }`}
                                >
                                    {(isMuted || isSpeaking) ? <MicOff size={16} /> : <Mic size={16} />}
                                    {isSpeaking ? 'AI Speaking' : (isMuted ? 'Unmute' : 'Mute')}
                                </button>
                            )}

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
                                    setStep('selection');
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
                                debriefData ? (
                                    /* ── Instant Debrief ── */
                                    <div className="space-y-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300 mb-1">Mission Report</p>
                                                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">
                                                    {companyName || 'Interview'} Complete
                                                </h2>
                                            </div>
                                            <div className={`px-6 py-3 rounded-full border font-bold text-[11px] uppercase tracking-widest ${
                                                debriefData.overall_verdict === 'STRONG HIRE' ? 'bg-green-50 text-green-700 border-green-200' :
                                                debriefData.overall_verdict === 'HIRE' ? 'bg-green-50 text-green-600 border-green-200' :
                                                debriefData.overall_verdict === 'NO HIRE' ? 'bg-red-50 text-red-600 border-red-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                {debriefData.overall_verdict || 'BORDERLINE'}
                                            </div>
                                        </div>

                                        {/* Score grid */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Technical', value: debriefData.technical_accuracy },
                                                { label: 'Communication', value: debriefData.communication_clarity },
                                                { label: 'Completeness', value: debriefData.response_completeness },
                                                { label: 'Confidence', value: debriefData.confidence_score },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 mb-1">{label}</p>
                                                    <p className="text-2xl font-bold text-zinc-900">{value}%</p>
                                                    <div className="mt-2 h-1 bg-zinc-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${value}%` }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className="h-full bg-zinc-900 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Filler words */}
                                        {debriefData.filler_words_detected > 0 && (
                                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                                                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                                                <p className="text-[11px] font-bold text-amber-700">
                                                    {debriefData.filler_words_detected} filler words detected. Practice slowing down before answering.
                                                </p>
                                            </div>
                                        )}

                                        {/* Round breakdown */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-300">Round Breakdown</p>
                                            {(debriefData.rounds || []).map((round, i) => (
                                                <div key={i} className="bg-white border border-zinc-100 rounded-2xl p-5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="font-bold text-sm uppercase tracking-wide text-zinc-900">{round.round_name}</p>
                                                        <span className="text-xl font-bold text-zinc-900">{round.score}/100</span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 mb-1">✓ {round.strongest_moment}</p>
                                                    <p className="text-[11px] text-zinc-400">△ {round.weakest_moment}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Top 3 improvements */}
                                        <div className="bg-zinc-900 rounded-2xl p-6">
                                            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-400 mb-4">Top 3 Things to Improve</p>
                                            {(debriefData.top_3_improvements || []).map((item, i) => (
                                                <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                                                    <span className="w-5 h-5 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    <p className="text-sm text-zinc-300">{item}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Verdict explanation */}
                                        {debriefData.verdict_explanation && (
                                            <p className="text-sm text-zinc-500 leading-relaxed italic px-1">
                                                {debriefData.verdict_explanation}
                                            </p>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleFinalSubmit}
                                                disabled={isSavingInterview}
                                                className="flex-1 py-4 bg-zinc-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl disabled:opacity-50"
                                            >
                                                {isSavingInterview ? 'Submitting...' : 'Submit for Expert Review →'}
                                            </button>
                                            <button
                                                onClick={() => setShowDiscardModal(true)}
                                                className="px-8 py-4 bg-white text-zinc-400 border border-zinc-100 rounded-full font-bold text-[11px] uppercase tracking-widest hover:border-zinc-900 hover:text-zinc-900 transition-all"
                                            >
                                                Discard
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Standard completion (no debrief) ── */
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
                                )
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
                                        style={{ fontStyle: 'normal' }}
                                    >
                                        {t}
                                    </motion.p>
                                ))}
                                {partialTranscript && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-base font-medium text-zinc-400 leading-relaxed px-2 min-h-[20px]"
                                        style={{ fontStyle: 'normal' }}
                                    >
                                        {partialTranscript}
                                    </motion.p>
                                )}
                            </div>
                            {/* Text mode input */}
                            {(interviewInputMode === 'text' || interviewInputMode === 'hybrid') && (
                                <div className="flex gap-3 mt-4">
                                    <textarea
                                        value={textInput}
                                        onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (!textInput.trim() || !isActive || (interviewInputMode !== 'text' && isSpeaking)) return;
                                                const text = textInput.trim();
                                                setTextInput('');
                                                setTranscripts(prev => [...prev, text]);
                                                appendConversationEntry('user', text);
                                                sendAudioChunk(JSON.stringify({ type: 'user_message', text }));
                                                updateStatus('Processing', 'processing');
                                            }
                                        }}
                                        placeholder="Type your answer..."
                                        rows={2}
                                        disabled={!isActive || (interviewInputMode !== 'text' && isSpeaking)}
                                        className="flex-1 px-4 py-3 rounded-xl border border-zinc-100 bg-zinc-50 text-sm resize-none focus:outline-none focus:border-zinc-900 transition-all"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!textInput.trim() || !isActive || (interviewInputMode !== 'text' && isSpeaking)) return;
                                            const text = textInput.trim();
                                            setTextInput('');
                                            setTranscripts(prev => [...prev, text]);
                                            appendConversationEntry('user', text);
                                            sendAudioChunk(JSON.stringify({ type: 'user_message', text }));
                                            updateStatus('Processing', 'processing');
                                        }}
                                        disabled={!textInput.trim() || !isActive || (interviewInputMode !== 'text' && isSpeaking)}
                                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-zinc-800"
                                    >
                                        <Send size={16} />
                                    </button>
                                </div>
                            )}
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
                                        {isThinking && !currentSentenceText && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex items-center gap-2 mb-4"
                                            >
                                                <div className="flex gap-1">
                                                    {[0,1,2].map(i => (
                                                        <motion.div
                                                            key={i}
                                                            className="w-1.5 h-1.5 bg-zinc-300 rounded-full"
                                                            animate={{ y: [-2, 2, -2] }}
                                                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-medium text-zinc-300 uppercase tracking-widest">
                                                    Thinking...
                                                </span>
                                            </motion.div>
                                        )}
                                        <div
                                            ref={responseRef}
                                            className="h-64 overflow-y-auto flex flex-col gap-4 pr-4 custom-scrollbar"
                                        >
                                            {/* Completed responses history — message-type-driven rendering */}
                                            {responses.map((r, i) => {
                                                // Support both legacy string format and new {text, messageType} objects
                                                const rawText = typeof r === 'string' ? r : r.text;
                                                const text = sanitizeInterviewerText(rawText);
                                                
                                                const rawMsgType = typeof r === 'string' ? 'follow_up' : (r.messageType || 'follow_up');
                                                const messageType = normalizeMessageType(rawMsgType);

                                                // Style variations based on message type
                                                const isMainQuestion = messageType === 'main_question';
                                                const isGreeting = messageType === 'greeting';
                                                const isBridge = messageType === 'bridge';

                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`text-sm font-medium leading-relaxed pl-3 ${
                                                            isMainQuestion
                                                                ? 'border-l-2 border-zinc-900 text-zinc-700'
                                                                : isGreeting
                                                                ? 'border-l-2 border-zinc-300 text-zinc-600 bg-zinc-50 rounded-r-lg p-3'
                                                                : isBridge
                                                                ? 'border-l-2 border-zinc-200 text-zinc-400 italic'
                                                                : 'border-l-2 border-zinc-100 text-zinc-500'
                                                        }`}
                                                    >
                                                        {isMainQuestion && (
                                                            <span className="inline-block text-[9px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded mr-2 mb-1">
                                                                Question
                                                            </span>
                                                        )}
                                                        {text}
                                                    </motion.div>
                                                );
                                            })}

                                            {/* Empty state */}
                                            {responses.length === 0 && !currentSentenceText && !isThinking && (
                                                <p className="text-xs font-medium text-zinc-300">
                                                    Awaiting response...
                                                </p>
                                            )}

                                            {/* Current sentence — live word-by-word sync */}
                                            {(currentSentenceText || currentResponse) && (
                                                <motion.p
                                                    key="current"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="text-base font-medium text-zinc-900 leading-relaxed"
                                                >
                                                    {sanitizeInterviewerText(currentResponse ? (currentResponse + (currentSentenceText ? ' ' + currentSentenceText : '')) : currentSentenceText)}
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

            {/* Time Warning Banner */}
            <AnimatePresence>
                {showTimeWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full border font-bold text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 ${timeWarningSeconds <= 30
                            ? 'bg-red-500 text-white border-red-600'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                        <Clock size={14} />
                        {timeWarningSeconds <= 30
                            ? `Wrapping up ${timeWarningRoundName}...`
                            : `1 minute remaining in ${timeWarningRoundName}`
                        }
                    </motion.div>
                )}
            </AnimatePresence>

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

            <CreditCheckModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
                viewState={modalType}
                onConfirm={handleCreditConfirmStart}
                isStarting={isStarting}
                mode="ai_interview_only"
            />

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
