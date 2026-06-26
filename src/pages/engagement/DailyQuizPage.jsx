import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Radio, Space, Spin, message, Row, Col, Statistic, Progress } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const DailyQuizPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
    const [alreadyPlayedToday, setAlreadyPlayedToday] = useState(false);

    useEffect(() => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const statusStr = localStorage.getItem('dailyChallengesStatus');
        const statusObj = statusStr ? JSON.parse(statusStr) : {};
        if (statusObj['daily-quiz'] === todayStr) {
            setAlreadyPlayedToday(true);
        }

        const fetchQuiz = async () => {
            try {
                const res = await api.get('/engagement/daily-quiz');
                setQuestions(res.data.questions);
            } catch (err) {
                message.error('Failed to load daily quiz');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, []);

    const handleAnswer = (val) => {
        setAnswers({ ...answers, [questions[currentQuestionIndex].id]: val });
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        // Calculate correct count
        let correctCount = 0;
        questions.forEach(q => {
            if (q.correct_option === answers[q.id]) {
                correctCount++;
            }
        });
        
        try {
            const res = await api.post('/engagement/daily-quiz/submit', { answers, correct_count: correctCount });
            setResult(res.data);
            
            const todayStr = new Date().toLocaleDateString('en-CA');
            const stored = localStorage.getItem('dailyChallengesStatus');
            const statusObj = stored ? JSON.parse(stored) : {};
            statusObj['daily-quiz'] = todayStr;
            localStorage.setItem('dailyChallengesStatus', JSON.stringify(statusObj));

            message.success(`Quiz Completed! You earned ${res.data.coins_earned} coins.`);
        } catch (err) {
            message.error('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClaimCoins = async () => {
        setSubmitting(true);
        try {
            await api.post('/engagement/games/finish', {
                game_type: 'daily-quiz',
                score: result.coins_earned
            });
            message.success(`Claimed ${result.coins_earned} coins!`);
            navigate('/engagement/hub');
        } catch (err) {
            message.error('Failed to claim coins');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

    if (result) {
        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} style={{ marginBottom: '24px' }}>
                    Back to Arcade
                </Button>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Card style={{ borderRadius: '16px', textAlign: 'center', background: '#fffbe6' }}>
                        <Title level={2} style={{ color: '#faad14' }}><TrophyOutlined /> Quiz Results</Title>
                        <Row justify="center" gutter={32} style={{ margin: '32px 0' }}>
                            <Col>
                                <Statistic title="Score" value={`${result.score}/${result.total_questions}`} valueStyle={{ fontWeight: 'bold' }} />
                            </Col>
                            <Col>
                                <Statistic title="Coins Earned" value={result.coins_earned} prefix={<TrophyOutlined style={{ color: '#faad14' }}/>} valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
                            </Col>
                        </Row>
                        
                        <div style={{ marginBottom: '32px' }}>
                            <Button 
                                type="primary" 
                                size="large" 
                                onClick={handleClaimCoins}
                                loading={submitting}
                                style={{ 
                                    background: '#faad14', 
                                    borderColor: '#faad14',
                                    height: '48px', 
                                    padding: '0 48px', 
                                    borderRadius: '24px',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                            >
                                Claim {result.coins_earned} Coins
                            </Button>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <Title level={4}>Review</Title>
                            {questions.map((q, idx) => {
                                const isCorrect = q.correct_option === answers[q.id];
                                return (
                                    <Card key={q.id} size="small" style={{ marginBottom: '16px', borderLeft: `4px solid ${isCorrect ? '#52c41a' : '#ff4d4f'}` }}>
                                        <Text strong>{idx + 1}. {q.question_text}</Text>
                                        <div style={{ marginTop: '8px' }}>
                                            <Text type="secondary">Your Answer: {q.options[answers[q.id]] || 'None'}</Text> {isCorrect ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                                        </div>
                                        {!isCorrect && (
                                            <div style={{ marginTop: '4px', color: '#52c41a' }}>
                                                <Text type="success">Correct Answer: {q.options[q.correct_option]}</Text>
                                            </div>
                                        )}
                                        <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Explanation: {q.explanation}</Text>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (alreadyPlayedToday) {
        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} style={{ marginBottom: '24px', alignSelf: 'flex-start' }}>
                    Back to Arcade
                </Button>
                <Card style={{ borderRadius: '16px', padding: '48px', background: '#f6ffed', borderColor: '#b7eb8f' }}>
                    <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
                    <Title level={3}>You're All Caught Up!</Title>
                    <Text style={{ fontSize: '16px', color: '#595959' }}>
                        You have already completed the Daily Career Quiz for today.
                        Check back tomorrow for a new set of questions!
                    </Text>
                </Card>
            </div>
        );
    }

    if (questions.length === 0) return <div>No quiz available today.</div>;

    const currentQ = questions[currentQuestionIndex];

    if (!gameStarted) {
        return (
            <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '48px' }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} type="text" />
                </div>
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
                    <Title level={2} style={{ margin: 0, color: '#1C1A17' }}>Daily Career Quiz</Title>
                    <Text style={{ color: '#8c8c8c', fontSize: '16px', display: 'block', margin: '12px 0 32px' }}>
                        5 personalized MCQs based on your skill gaps · Up to 50 coins
                    </Text>
                    
                    <Space size="middle" wrap style={{ marginBottom: '48px', justifyContent: 'center' }}>
                        <div style={{ background: '#262626', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}>
                            📚 Skill-gap focused
                        </div>
                        <div style={{ background: '#262626', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}>
                            💡 Explanations included
                        </div>
                        <div style={{ background: '#262626', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '14px' }}>
                            🏆 10 coins per correct
                        </div>
                    </Space>

                    <div>
                        <Button 
                            type="primary" 
                            size="large" 
                            onClick={() => setGameStarted(true)}
                            style={{ 
                                background: '#F5A623', 
                                borderColor: '#F5A623',
                                height: '48px', 
                                padding: '0 40px', 
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: '#fff'
                            }}
                        >
                            Start Today's Quiz
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} style={{ marginBottom: '24px' }}>
                Quit Quiz
            </Button>
            <Card style={{ borderRadius: '16px', padding: '16px' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
                    <Title level={4} style={{ margin: 0 }}>Daily Career Quiz</Title>
                    <Text type="secondary">Question {currentQuestionIndex + 1} of {questions.length}</Text>
                </Row>
                <Progress percent={((currentQuestionIndex + 1) / questions.length) * 100} showInfo={false} strokeColor="#faad14" style={{ marginBottom: '32px' }} />

                <Title level={3} style={{ marginBottom: '32px' }}>{currentQ.question_text}</Title>

                <Radio.Group 
                    onChange={(e) => handleAnswer(e.target.value)} 
                    value={answers[currentQ.id]}
                    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    {Object.entries(currentQ.options).map(([key, value]) => (
                        <Radio.Button key={key} value={key} style={{ padding: '12px 24px', height: 'auto', borderRadius: '8px', fontSize: '16px', textAlign: 'left', whiteSpace: 'normal', display: 'block', width: '100%' }}>
                            {value}
                        </Radio.Button>
                    ))}
                </Radio.Group>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '48px' }}>
                    <Button 
                        type="primary" 
                        size="large" 
                        onClick={handleNext} 
                        disabled={!answers[currentQ.id]}
                        loading={submitting}
                        style={{ padding: '0 48px', height: '48px', borderRadius: '24px' }}
                    >
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default DailyQuizPage;
