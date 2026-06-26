import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Tag, message } from 'antd';
import { ArrowLeftOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const { Title, Text } = Typography;

const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
];

const JargonBusterPage = () => {
    const navigate = useNavigate();
    const [targetWord, setTargetWord] = useState('');
    const [hint, setHint] = useState('');
    const [guesses, setGuesses] = useState([]);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);

    useEffect(() => {
        fetchNewWord();
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver || loading) return;
            if (e.key === 'Enter') {
                handleEnter();
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (/^[A-Za-z]$/.test(e.key)) {
                handleKey(e.key.toUpperCase());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameOver, guesses, loading, targetWord]);

    const fetchNewWord = async () => {
        setLoading(true);
        try {
            const res = await api.get('/engagement/games/jargon/word');
            setTargetWord(res.data.word.toUpperCase());
            setHint(res.data.hint);
            setGuesses([]);
            setCurrentGuess('');
            setGameOver(false);
        } catch (err) {
            message.error("Failed to fetch new word.");
            // Fallback
            setTargetWord("PROXY");
            setHint("An intermediary server that forwards requests between clients and servers.");
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (key) => {
        if (currentGuess.length < 5) {
            setCurrentGuess(prev => prev + key);
        }
    };

    const handleBackspace = () => {
        setCurrentGuess(prev => prev.slice(0, -1));
    };

    const handleEnter = async () => {
        if (currentGuess.length !== 5) {
            message.warning("Word must be 5 letters");
            return;
        }
        
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess('');

        if (currentGuess === targetWord || newGuesses.length >= 6) {
            setGameOver(true);
            const calculatedScore = currentGuess === targetWord ? Math.max(2, 20 - (newGuesses.length * 2)) : 0;
            setScore(calculatedScore);
        }
    };

    const handleClaimCoins = async () => {
        setLoading(true);
        if (score > 0) {
            try {
                await api.post('/engagement/games/finish', {
                    game_type: 'jargon',
                    score: score
                });
                message.success(`Claimed ${score} coins!`);
            } catch (err) {
                message.error('Failed to claim coins');
            }
        }
        navigate('/engagement/hub');
    };

    const getLetterStatus = (letter, index, word) => {
        if (targetWord[index] === letter) return 'correct';
        if (targetWord.includes(letter)) return 'present';
        return 'absent';
    };

    const getKeyboardStatus = (key) => {
        let status = 'default';
        for (const guess of guesses) {
            for (let i = 0; i < 5; i++) {
                if (guess[i] === key) {
                    const s = getLetterStatus(guess[i], i, guess);
                    if (s === 'correct') return 'correct';
                    if (s === 'present' && status !== 'correct') status = 'present';
                    if (s === 'absent' && status === 'default') status = 'absent';
                }
            }
        }
        return status;
    };

    const getColor = (status) => {
        if (status === 'correct') return '#538d4e'; // green
        if (status === 'present') return '#C56843'; // platform accent (orange/brown)
        if (status === 'absent') return '#787c7e'; // greyed out
        return '#d3d6da'; // default light grey
    };

    return (
        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} type="text" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Title level={3} style={{ margin: 0, color: '#1C1A17' }}>Jargon Buster</Title>
                    <Tag style={{ background: '#FCEEE9', color: '#C56843', borderRadius: '16px', border: 'none', padding: '4px 12px', fontWeight: 'bold' }}>Tech Wordle</Tag>
                </div>
                <Button onClick={fetchNewWord} style={{ borderRadius: '8px', color: '#1C1A17', borderColor: '#eaeaea' }}>New word</Button>
            </div>

            <Card style={{ background: '#1C1A17', borderColor: '#1C1A17', color: '#fff', marginBottom: '32px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} bodyStyle={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <BulbOutlined style={{ color: '#faad14' }} />
                    <Text style={{ color: '#ddd' }}>Hint: {loading ? 'Loading...' : hint}</Text>
                </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginBottom: '48px' }}>
                {[...Array(6)].map((_, i) => {
                    const guess = i === guesses.length ? currentGuess : guesses[i] || '';
                    return (
                        <div key={i} style={{ display: 'flex', gap: '8px' }}>
                            {[...Array(5)].map((_, j) => {
                                const letter = guess[j] || '';
                                let bg = '#fff'; // empty
                                let border = '2px solid #d3d6da';
                                let color = '#1C1A17';
                                if (i < guesses.length) {
                                    bg = getColor(getLetterStatus(letter, j, guess));
                                    border = 'none';
                                    color = '#fff';
                                } else if (letter) {
                                    bg = '#fff'; // typing
                                    border = '2px solid #878a8c';
                                }
                                return (
                                    <div key={j} style={{ width: '56px', height: '56px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: color, borderRadius: '8px', border: border }}>
                                        {letter}
                                    </div>
                                )
                            })}
                        </div>
                    )
                })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {keyboardRows.map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: '6px' }}>
                        {row.map((key) => (
                            <div 
                                key={key} 
                                onClick={() => {
                                    if (key === 'ENTER') handleEnter();
                                    else if (key === '⌫') handleBackspace();
                                    else handleKey(key);
                                }}
                                style={{ 
                                    padding: key.length > 1 ? '16px 12px' : '16px', 
                                    background: key.length > 1 ? '#d3d6da' : getColor(getKeyboardStatus(key)), 
                                    color: key.length > 1 || getKeyboardStatus(key) === 'default' ? '#1C1A17' : '#fff',
                                    borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', minWidth: key.length > 1 ? '64px' : '40px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: 'none',
                                }}
                            >
                                {key}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', background: '#538d4e', borderRadius: '4px' }}></div><Text type="secondary">Correct</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', background: '#C56843', borderRadius: '4px' }}></div><Text type="secondary">Wrong spot</Text></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '16px', height: '16px', background: '#787c7e', borderRadius: '4px' }}></div><Text type="secondary">Not in word</Text></div>
            </div>

            {gameOver && (
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Title level={4} style={{ color: '#1C1A17', margin: 0 }}>Answer: {targetWord}</Title>
                    <Button 
                        type="primary" 
                        size="large" 
                        onClick={handleClaimCoins} 
                        loading={loading}
                        style={{ background: '#C56843', borderColor: '#C56843', marginTop: '16px', padding: '0 40px', height: '48px', fontSize: '16px', borderRadius: '24px', fontWeight: 'bold' }}
                    >
                        Claim {score} Coins
                    </Button>
                </div>
            )}
        </div>
    );
};

export default JargonBusterPage;
