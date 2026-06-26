import React, { useState, useEffect, useRef } from 'react';
import { Typography, Card, Button, Input, Statistic, Row, Col, message, Segmented, Progress } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

const TypingTestPage = () => {
    const navigate = useNavigate();
    const [difficulty, setDifficulty] = useState('Medium');
    const [textToType, setTextToType] = useState("");
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFocused, setIsFocused] = useState(false);
    
    const inputRef = useRef(null);

    const fetchSnippet = async (level = difficulty) => {
        setLoading(true);
        try {
            const res = await api.get(`/engagement/games/typing/snippet?difficulty=${level.toLowerCase()}`);
            setTextToType(res.data.text);
            resetGame();
        } catch (err) {
            message.error("Failed to load typing snippet.");
            // Fallback
            setTextToType("Writing clean code is essential for any developer. It makes your work easier to read and maintain. Always remember to comment your complex logic.");
            resetGame();
        } finally {
            setLoading(false);
        }
    };

    const resetGame = () => {
        setInput('');
        setStartTime(null);
        setTimeElapsed(0);
        setWpm(0);
        setAccuracy(100);
        setCompleted(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    useEffect(() => {
        fetchSnippet();
    }, []);

    // Timer effect
    useEffect(() => {
        let interval;
        if (startTime && !completed) {
            interval = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                setTimeElapsed(Math.floor(elapsed));
                
                // Calculate real-time stats
                if (elapsed > 0 && input.length > 0) {
                    const wordsTyped = input.length / 5;
                    const mins = elapsed / 60;
                    const currentWpm = Math.max(0, Math.round(wordsTyped / mins));
                    setWpm(currentWpm);
                    
                    let correctChars = 0;
                    for (let i = 0; i < input.length; i++) {
                        if (input[i] === textToType[i]) correctChars++;
                    }
                    setAccuracy(Math.round((correctChars / input.length) * 100));
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [startTime, completed, input, textToType]);

    // Input completion effect
    useEffect(() => {
        if (!startTime && input.length > 0) {
            setStartTime(Date.now());
        }

        if (input.length === textToType.length && textToType.length > 0 && !completed) {
            handleComplete();
        }
    }, [input, textToType]);

    const handleComplete = () => {
        setCompleted(true);
        // Final calculations
        const elapsed = (Date.now() - startTime) / 1000;
        const mins = elapsed / 60;
        const words = textToType.length / 5;
        const finalWpm = Math.round(words / mins);
        
        let correctChars = 0;
        for (let i = 0; i < input.length; i++) {
            if (input[i] === textToType[i]) correctChars++;
        }
        const finalAccuracy = Math.round((correctChars / input.length) * 100);
        
        // You only earn coins if accuracy is somewhat decent
        const validWpm = finalAccuracy > 80 ? finalWpm : Math.floor(finalWpm / 2);
        
        setWpm(validWpm);
        setAccuracy(finalAccuracy);
    };

    const handleClaimCoins = async () => {
        setLoading(true);
        try {
            await api.post('/engagement/games/finish', {
                game_type: 'typing',
                score: wpm,
                wpm: wpm
            });
            message.success(`Claimed ${wpm} coins!`);
        } catch (err) {
            message.error("Failed to claim coins.");
        }
        navigate('/engagement/hub');
    };

    const handleDifficultyChange = (val) => {
        setDifficulty(val);
        fetchSnippet(val);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} type="text" size="large" style={{ marginBottom: '24px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <Title level={2} style={{ margin: 0, color: '#1C1A17', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '32px' }}>⌨️</span> Typing Test Arena
                </Title>
                <div style={{ background: '#FCEEE9', color: '#C56843', padding: '8px 24px', borderRadius: '24px', fontWeight: 'bold', fontSize: '16px' }}>
                    1 coin / word
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Text style={{ color: '#888', fontSize: '16px' }}>Snippet:</Text>
                    <Segmented 
                        options={['Easy', 'Medium', 'Hard']} 
                        value={difficulty} 
                        onChange={handleDifficultyChange}
                        disabled={startTime !== null && !completed}
                        style={{ padding: '4px' }}
                    />
                </div>
                <Button 
                    type="primary" 
                    icon={<SyncOutlined spin={loading} />} 
                    onClick={() => fetchSnippet(difficulty)}
                    disabled={startTime !== null && !completed}
                    style={{ background: '#1C1A17', color: '#fff', borderColor: '#1C1A17', borderRadius: '24px', padding: '0 24px', height: '40px' }}
                >
                    New snippet
                </Button>
            </div>

            <Row gutter={16} style={{ marginBottom: '32px' }}>
                <Col span={6}>
                    <div style={{ background: '#1C1A17', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#fff' }}>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>{startTime ? wpm : '—'}</Title>
                        <Text style={{ color: '#8c8c8c' }}>WPM</Text>
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ background: '#1C1A17', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#fff' }}>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>{startTime ? `${accuracy}%` : '—'}</Title>
                        <Text style={{ color: '#8c8c8c' }}>Accuracy</Text>
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ background: '#1C1A17', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#fff' }}>
                        <Title level={2} style={{ color: '#fff', margin: 0 }}>{timeElapsed}s</Title>
                        <Text style={{ color: '#8c8c8c' }}>Time</Text>
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ background: '#1C1A17', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#fff' }}>
                        <Title level={2} style={{ color: '#fff', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {completed ? wpm : 0} <TrophyOutlined style={{ color: '#faad14' }} />
                        </Title>
                        <Text style={{ color: '#8c8c8c' }}>Coins</Text>
                    </div>
                </Col>
            </Row>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <Text style={{ color: '#bfbfbf', minWidth: '16px' }}>0</Text>
                <Progress 
                    percent={Math.min((wpm / 120) * 100, 100)} 
                    showInfo={false} 
                    strokeColor="#1C1A17" 
                    trailColor="#f0f0f0"
                    style={{ flex: 1 }}
                />
                <Text style={{ color: '#bfbfbf', minWidth: '64px' }}>120 WPM</Text>
            </div>

            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div 
                    onClick={() => inputRef.current?.focus()}
                    style={{ 
                        background: '#1C1A17', 
                        borderRadius: '16px', 
                        padding: '32px', 
                        minHeight: '200px', 
                        fontSize: '24px', 
                        lineHeight: '1.6',
                        textAlign: 'left',
                        cursor: 'text',
                        position: 'relative',
                        color: '#555', // Base color for untyped
                        fontFamily: 'monospace'
                    }}
                >
                    {!startTime && !isFocused && input.length === 0 && !loading && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#8c8c8c', fontSize: '20px', pointerEvents: 'none', width: '100%', textAlign: 'center' }}>
                            Click here to start typing...
                        </div>
                    )}
                    
                    {loading ? (
                        <div style={{ textAlign: 'center', color: '#8c8c8c' }}>Loading snippet...</div>
                    ) : (
                        textToType.split('').map((char, index) => {
                            let color = '#555'; // default un-typed
                            let backgroundColor = 'transparent';
                            
                            if (index < input.length) {
                                color = char === input[index] ? '#fff' : '#ff4d4f';
                                if (char !== input[index] && char === ' ') {
                                    backgroundColor = '#ff4d4f';
                                }
                            } else if (index === input.length && isFocused && !completed) {
                                // cursor effect
                                backgroundColor = 'rgba(255,255,255,0.2)';
                            }
                            
                            return (
                                <span key={index} style={{ color, backgroundColor, borderRadius: '2px', transition: 'all 0.1s' }}>
                                    {char}
                                </span>
                            );
                        })
                    )}
                </div>

                {/* Hidden input for actual capture */}
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                        if (!completed) {
                            // Don't allow pasting or typing more than length
                            const val = e.target.value;
                            if (val.length <= textToType.length) {
                                setInput(val);
                            }
                        }
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{ 
                        position: 'absolute', 
                        opacity: 0, 
                        top: 0, 
                        left: 0, 
                        height: '1px', 
                        width: '1px', 
                        padding: 0, 
                        border: 'none' 
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
            </div>

            <div style={{ textAlign: 'center' }}>
                <Text style={{ color: '#bfbfbf' }}>Click the text above to start typing</Text>
            </div>

            <AnimatePresence>
                {completed && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        style={{ marginTop: '40px', textAlign: 'center', padding: '32px', background: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                    >
                        <Title level={3} style={{ color: '#1C1A17', margin: 0 }}><TrophyOutlined style={{ color: '#faad14' }} /> Typing Complete!</Title>
                        <Text style={{ display: 'block', margin: '8px 0 24px 0', fontSize: '16px', color: '#555' }}>
                            You typed at {wpm} WPM with {accuracy}% accuracy.
                        </Text>
                        <Button 
                            type="primary" 
                            size="large" 
                            style={{ background: '#C56843', borderColor: '#C56843', padding: '0 48px', height: '56px', fontSize: '18px', borderRadius: '28px', fontWeight: 'bold' }} 
                            onClick={handleClaimCoins} 
                            loading={loading}
                        >
                            Claim {wpm} Coins
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default TypingTestPage;
