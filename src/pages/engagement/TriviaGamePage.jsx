import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Row, Col, Statistic, message, Spin, Progress } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, ThunderboltFilled, ClockCircleOutlined, FireFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text } = Typography;

const TriviaGamePage = () => {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [completed, setCompleted] = useState(false);
    const [streak, setStreak] = useState(0);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/engagement/games/trivia/questions');
            setQuestions(res.data.questions || []);
            setIsPlaying(true);
            setCurrentIndex(0);
            setScore(0);
            setStreak(0);
            setTimeLeft(15);
        } catch (err) {
            message.error("Failed to load questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        if (isPlaying && !completed && timeLeft > 0) {
            timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (isPlaying && !completed && timeLeft === 0) {
            handleAnswer(false, null); // timeout
        }
        return () => clearTimeout(timer);
    }, [isPlaying, completed, timeLeft]);

    const handleAnswer = (isCorrect, selectedOption) => {
        if (isCorrect) {
            const timeBonus = Math.floor(timeLeft / 3); // up to 5 bonus
            const newStreak = streak + 1;
            const streakBonus = newStreak > 3 ? 2 : 0;
            const earned = 5 + timeBonus + streakBonus;
            
            setScore(prev => prev + Math.min(earned, 10)); // Cap per question
            setStreak(newStreak);
            message.success(`+${Math.min(earned, 10)} coins!`);
        } else {
            setStreak(0);
            if (selectedOption !== null) {
                message.error("Incorrect!");
            } else {
                message.warning("Time's up!");
            }
        }

        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(15);
            } else {
                setCompleted(true);
            }
        }, 800);
    };

    const handleClaimCoins = async () => {
        setLoading(true);
        try {
            await api.post('/engagement/games/finish', {
                game_type: 'trivia',
                score: score
            });
            message.success(`Claimed ${score} coins!`);
        } catch (err) {
            message.error('Failed to claim coins');
        }
        navigate('/engagement/hub');
    };

    if (!isPlaying) {
        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '40px' }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} type="text" size="large" />
                </div>
                
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ marginTop: '40px' }}>
                    <ThunderboltFilled style={{ fontSize: '48px', color: '#ff6b35', marginBottom: '16px' }} />
                    <Title level={1} style={{ margin: 0, color: '#1C1A17', fontWeight: 800 }}>Rapid Fire Trivia</Title>
                    <Text type="secondary" style={{ fontSize: '18px', display: 'block', marginTop: '16px', color: '#888' }}>
                        10 tech questions · 15 sec each · earn up to 5 coins per answer
                    </Text>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '32px', marginBottom: '48px', flexWrap: 'wrap' }}>
                        <div style={{ background: '#222', color: '#ddd', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ClockCircleOutlined /> 15s per Q
                        </div>
                        <div style={{ background: '#222', color: '#ddd', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FireFilled style={{ color: '#ff6b35' }} /> Streak bonus
                        </div>
                        <div style={{ background: '#222', color: '#ddd', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <TrophyOutlined style={{ color: '#faad14' }} /> Max 75 coins
                        </div>
                    </div>

                    <Button 
                        type="primary" 
                        size="large" 
                        onClick={fetchQuestions}
                        loading={loading}
                        style={{ 
                            background: '#2ca879', 
                            borderColor: '#2ca879', 
                            height: '64px', 
                            padding: '0 64px', 
                            fontSize: '20px', 
                            borderRadius: '12px', 
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px rgba(44, 168, 121, 0.4)'
                        }}
                    >
                        Start Game <ThunderboltFilled style={{ color: '#ffeb3b' }} />
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (completed) {
        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ padding: '48px 24px', background: '#fff', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', marginTop: '40px' }}>
                    <Title level={2} style={{ color: '#1C1A17' }}><TrophyOutlined style={{ color: '#faad14' }} /> Game Over!</Title>
                    <Statistic 
                        title={<span style={{ fontSize: '18px' }}>Total Coins Earned</span>} 
                        value={score} 
                        prefix={<ThunderboltFilled style={{ color: '#ff6b35' }}/>} 
                        valueStyle={{ color: '#1C1A17', fontWeight: 'bold', fontSize: '48px', marginTop: '16px' }} 
                    />
                    <Button 
                        type="primary" 
                        size="large" 
                        style={{ background: '#C56843', borderColor: '#C56843', marginTop: '40px', padding: '0 48px', height: '56px', fontSize: '18px', borderRadius: '28px', fontWeight: 'bold' }} 
                        onClick={handleClaimCoins} 
                        loading={loading}
                    >
                        Claim {score} Coins
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#888' }}>Question {currentIndex + 1} of {questions.length}</Text>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold', color: streak >= 3 ? '#ff6b35' : '#1C1A17' }}>
                        <FireFilled /> Streak: {streak}
                    </Text>
                    <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#faad14' }}>
                        <TrophyOutlined /> Score: {score}
                    </Text>
                </div>
            </div>

            <Progress percent={(timeLeft / 15) * 100} showInfo={false} strokeColor={timeLeft < 5 ? '#ff4d4f' : '#2ca879'} style={{ marginBottom: '32px' }} />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card style={{ borderRadius: '16px', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: 'none' }}>
                        <Title level={3} style={{ marginBottom: '32px', color: '#1C1A17', lineHeight: '1.4' }}>
                            {currentQuestion?.question_text}
                        </Title>
                        
                        <Row gutter={[16, 16]}>
                            {['A', 'B', 'C', 'D'].map(key => {
                                const optionText = currentQuestion?.options?.[key];
                                if (!optionText) return null;
                                return (
                                    <Col span={24} md={12} key={key}>
                                        <Button 
                                            block 
                                            size="large" 
                                            style={{ 
                                                height: 'auto', 
                                                minHeight: '64px', 
                                                whiteSpace: 'normal', 
                                                textAlign: 'left', 
                                                padding: '16px 24px',
                                                fontSize: '16px',
                                                borderRadius: '12px',
                                                border: '2px solid #eaeaea',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            onClick={() => handleAnswer(key === currentQuestion.correct_option, key)}
                                        >
                                            <span style={{ 
                                                background: '#f0f0f0', 
                                                color: '#888', 
                                                width: '28px', 
                                                height: '28px', 
                                                display: 'inline-flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                borderRadius: '6px', 
                                                marginRight: '16px',
                                                fontWeight: 'bold'
                                            }}>
                                                {key}
                                            </span>
                                            {optionText}
                                        </Button>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default TriviaGamePage;
