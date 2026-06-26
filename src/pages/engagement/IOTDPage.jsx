import React, { useState, useEffect } from 'react';
import { Typography, Card, Button, Input, Spin, message, Row, Col, Statistic, Tag } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const IOTDPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [result, setResult] = useState(null);
    const [alreadyPlayedToday, setAlreadyPlayedToday] = useState(false);

    useEffect(() => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const statusStr = localStorage.getItem('dailyChallengesStatus');
        const statusObj = statusStr ? JSON.parse(statusStr) : {};
        if (statusObj['iotd'] === todayStr) {
            setAlreadyPlayedToday(true);
        }

        const fetchQuestion = async () => {
            try {
                const res = await api.get('/engagement/iotd');
                setQuestion(res.data);
            } catch (err) {
                message.error('Failed to load Interview Question of the Day');
            } finally {
                setLoading(false);
            }
        };
        fetchQuestion();
    }, []);

    const handleSubmit = async () => {
        if (answer.trim().length < 20) {
            message.warning("Please provide a more detailed answer (at least 20 characters).");
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post('/engagement/iotd/submit', { 
                question_id: question.id,
                answer_text: answer
            });
            setResult(res.data);
            
            const todayStr = new Date().toLocaleDateString('en-CA');
            const stored = localStorage.getItem('dailyChallengesStatus');
            const statusObj = stored ? JSON.parse(stored) : {};
            statusObj['iotd'] = todayStr;
            localStorage.setItem('dailyChallengesStatus', JSON.stringify(statusObj));

            message.success(`Great job! You earned ${res.data.coins_awarded} coins.`);
        } catch (err) {
            message.error('Failed to submit answer');
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
                    <Card style={{ borderRadius: '16px', background: '#f9f0ff' }}>
                        <Title level={2} style={{ color: '#722ed1', textAlign: 'center' }}><ThunderboltOutlined /> AI Evaluation</Title>
                        <Row justify="center" gutter={32} style={{ margin: '32px 0' }}>
                            <Col>
                                <Statistic title="AI Score" value={`${result.ai_score}/10`} valueStyle={{ color: result.ai_score >= 7 ? '#52c41a' : '#faad14', fontWeight: 'bold' }} />
                            </Col>
                            <Col>
                                <Statistic title="Coins Earned" value={result.coins_awarded} prefix={<TrophyOutlined style={{ color: '#faad14' }}/>} valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
                            </Col>
                        </Row>
                        
                        <Card size="small" title="Your Answer" style={{ marginBottom: '16px' }}>
                            <Text>{result.answer_text}</Text>
                        </Card>

                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Card size="small" title="Strengths" style={{ borderColor: '#b7eb8f', height: '100%' }}>
                                    <ul>
                                        {result.ai_feedback.strengths.map((s, i) => <li key={i}><Text type="success">{s}</Text></li>)}
                                    </ul>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Areas for Improvement" style={{ borderColor: '#ffa39e', height: '100%' }}>
                                    <ul>
                                        {result.ai_feedback.improvements.map((s, i) => <li key={i}><Text type="danger">{s}</Text></li>)}
                                    </ul>
                                </Card>
                            </Col>
                        </Row>
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
                    <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>
                    <Title level={3}>You're All Caught Up!</Title>
                    <Text style={{ fontSize: '16px', color: '#595959' }}>
                        You have already completed the Question of the Day.
                        Come back tomorrow for a new challenge!
                    </Text>
                </Card>
            </div>
        );
    }

    if (!question) return <div>No question available today.</div>;

    const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    const isAnswerLongEnough = wordCount >= 30;

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} type="text" style={{ marginBottom: '24px' }} />
            
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ fontSize: '32px' }}>🎤</div>
                    <div>
                        <Title level={2} style={{ margin: 0, color: '#1C1A17' }}>Question of the Day</Title>
                        <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>AI-evaluated · Up to 25 coins · Resets daily</Text>
                    </div>
                </div>
                <Tag style={{ background: '#f9f0ff', color: '#722ed1', border: 'none', borderRadius: '16px', padding: '4px 12px', fontSize: '14px', fontWeight: '500' }}>
                    {question.category || "Behavioral"}
                </Tag>
            </div>

            <Card style={{ borderRadius: '16px', padding: '0', background: '#262626', border: 'none', marginBottom: '16px' }} bodyStyle={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>💼 Interview Question</Text>
                    <Tag style={{ background: '#f5e8d3', color: '#8c5a2b', border: 'none', borderRadius: '16px', padding: '4px 12px', fontSize: '12px', fontWeight: 'bold' }}>
                        Software Engineer
                    </Tag>
                </div>
                <Title level={4} style={{ color: '#fff', margin: 0, lineHeight: '1.5' }}>
                    {question.question}
                </Title>
            </Card>

            <div style={{ background: '#f9f0ff', borderRadius: '8px', padding: '16px', marginBottom: '32px', color: '#531dab', fontSize: '14px' }}>
                <span style={{ fontWeight: 'bold' }}>💡 Framework tip:</span> {question.framework_tip || "Use the STAR method: Situation, Task, Action, Result."}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text style={{ color: '#8c8c8c' }}>Your answer</Text>
                <Text style={{ color: '#8c8c8c' }}>{wordCount} words</Text>
            </div>

            <Input.TextArea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... (50–200 words recommended)"
                style={{ 
                    fontSize: '16px', 
                    padding: '16px', 
                    borderRadius: '12px', 
                    background: '#262626', 
                    color: '#fff',
                    border: 'none',
                    resize: 'none'
                }}
                autoSize={{ minRows: 8, maxRows: 12 }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <Text style={{ color: '#bfbfbf', fontSize: '14px' }}>Write at least 30 words for a meaningful evaluation</Text>
                <Button 
                    type={isAnswerLongEnough ? "primary" : "default"} 
                    size="large" 
                    onClick={handleSubmit} 
                    disabled={!isAnswerLongEnough}
                    loading={submitting}
                    style={{ 
                        borderRadius: '8px', 
                        height: '48px', 
                        padding: '0 24px',
                        fontWeight: 'bold',
                        ...(isAnswerLongEnough ? { background: '#fff', color: '#262626', borderColor: '#d9d9d9' } : {})
                    }}
                >
                    Submit for Evaluation
                </Button>
            </div>
        </div>
    );
};

export default IOTDPage;
