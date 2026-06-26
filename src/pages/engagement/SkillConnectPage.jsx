import React, { useState, useEffect } from 'react';
import { Typography, Button, Row, Col, message, Tag } from 'antd';
import { ArrowLeftOutlined, ToolOutlined, IdcardOutlined, TrophyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;

const CARD_PAIRS = [
    { id: 1, type: 'skill', text: 'Python & ML', matchId: 1 },
    { id: 2, type: 'role', text: 'Data Scientist', matchId: 1 },
    { id: 3, type: 'skill', text: 'Docker & K8s', matchId: 2 },
    { id: 4, type: 'role', text: 'DevOps Engineer', matchId: 2 },
    { id: 5, type: 'skill', text: 'Node.js & APIs', matchId: 3 },
    { id: 6, type: 'role', text: 'Backend Dev', matchId: 3 },
    { id: 7, type: 'skill', text: 'React & TypeScript', matchId: 4 },
    { id: 8, type: 'role', text: 'Frontend Dev', matchId: 4 },
    { id: 9, type: 'skill', text: 'Figma & UX', matchId: 5 },
    { id: 10, type: 'role', text: 'Product Designer', matchId: 5 },
    { id: 11, type: 'skill', text: 'SQL & ETL', matchId: 6 },
    { id: 12, type: 'role', text: 'Data Engineer', matchId: 6 },
];

const SkillConnectPage = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState([]);
    const [selected, setSelected] = useState([]);
    const [matched, setMatched] = useState([]);
    const [attempts, setAttempts] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = async () => {
        setLoading(true);
        try {
            const res = await api.get('/engagement/games/skill-connect/pairs');
            const pairsData = res.data.pairs;
            
            let idCounter = 1;
            const newCards = [];
            pairsData.forEach((pair, index) => {
                newCards.push({ id: idCounter++, type: 'skill', text: pair.skill, matchId: index + 1 });
                newCards.push({ id: idCounter++, type: 'role', text: pair.role, matchId: index + 1 });
            });
            
            const shuffled = newCards.sort(() => Math.random() - 0.5);
            setCards(shuffled);
        } catch (err) {
            message.error("Failed to load dynamic skills.");
            const shuffled = [...CARD_PAIRS].sort(() => Math.random() - 0.5);
            setCards(shuffled);
        } finally {
            setLoading(false);
            setSelected([]);
            setMatched([]);
            setAttempts(0);
            setGameOver(false);
        }
    };

    const handleCardClick = (card) => {
        if (selected.length === 2 || matched.includes(card.id) || selected.some(c => c.id === card.id)) return;
        
        const newSelected = [...selected, card];
        setSelected(newSelected);

        if (newSelected.length === 2) {
            setAttempts(a => a + 1);
            if (newSelected[0].matchId === newSelected[1].matchId && newSelected[0].type !== newSelected[1].type) {
                setMatched(prev => [...prev, newSelected[0].id, newSelected[1].id]);
                setSelected([]);
                if (matched.length + 2 === cards.length) {
                    setGameOver(true);
                }
            } else {
                setTimeout(() => setSelected([]), 1000);
            }
        }
    };

    const handleClaimCoins = async () => {
        setLoading(true);
        try {
            await api.post('/engagement/games/finish', {
                game_type: 'skill-connect',
                score: 15
            });
            message.success('Claimed 15 coins!');
        } catch (err) {
            message.error('Failed to claim coins');
        }
        navigate('/engagement/hub');
    };

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/engagement/hub')} type="text" />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Title level={2} style={{ margin: 0, color: '#1C1A17' }}>Skill Connect</Title>
                    <Tag style={{ background: '#FCEEE9', color: '#C56843', borderRadius: '16px', border: 'none', padding: '4px 12px', fontSize: '14px', fontWeight: 'bold' }}>Memory match</Tag>
                </div>
                <Button loading={loading} style={{ background: '#1C1A17', color: '#fff', border: 'none', borderRadius: '8px', padding: '4px 16px' }} onClick={initializeGame}>Restart</Button>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ background: '#1C1A17', color: '#ccc', padding: '8px 24px', borderRadius: '24px', fontSize: '16px' }}>Matches: <b style={{ color: '#fff' }}>{matched.length / 2}/6</b></div>
                <div style={{ background: '#1C1A17', color: '#ccc', padding: '8px 24px', borderRadius: '24px', fontSize: '16px' }}>Attempts: <b style={{ color: '#fff' }}>{attempts}</b></div>
                <div style={{ background: '#1C1A17', color: '#ccc', padding: '8px 24px', borderRadius: '24px', fontSize: '16px' }}>Coins: <b style={{ color: '#fff' }}>{matched.length === cards.length ? 15 : 0} 🏆</b></div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #eaeaea', color: '#1C1A17', padding: '16px', textAlign: 'center', borderRadius: '12px', marginBottom: '32px', fontSize: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                Match each <Text style={{ color: '#C56843', fontWeight: 'bold' }}>skill</Text> to its <Text style={{ color: '#C56843', fontWeight: 'bold' }}>job role</Text> — click two cards to pair them
            </div>

            <Row gutter={[16, 16]}>
                {cards.map(card => {
                    const isSelected = selected.some(c => c.id === card.id);
                    const isMatched = matched.includes(card.id);
                    return (
                        <Col span={6} key={card.id}>
                            <motion.div 
                                whileHover={!isMatched && !isSelected ? { scale: 1.05 } : {}}
                                onClick={() => handleCardClick(card)}
                                style={{
                                    height: '100px',
                                    background: isMatched ? '#C56843' : '#1C1A17',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (isMatched || isSelected) ? 'default' : 'pointer',
                                    border: isSelected ? '2px solid #C56843' : '2px solid transparent',
                                    padding: '16px',
                                    color: '#fff',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    transition: 'background 0.3s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 'bold' }}>
                                    {card.type === 'skill' ? <ToolOutlined style={{ color: '#888' }} /> : <IdcardOutlined style={{ color: '#888', opacity: 0.7 }} />} 
                                    <span style={{ color: card.type === 'skill' ? '#ccc' : '#fff' }}>{card.text}</span>
                                </div>
                            </motion.div>
                        </Col>
                    )
                })}
            </Row>

            {gameOver && (
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Title level={3} style={{ color: '#1C1A17', margin: 0 }}><TrophyOutlined style={{ color: '#faad14' }} /> All Matched!</Title>
                    <Button 
                        type="primary" 
                        size="large" 
                        onClick={handleClaimCoins} 
                        loading={loading}
                        style={{ background: '#C56843', borderColor: '#C56843', marginTop: '16px', padding: '0 40px', height: '48px', fontSize: '16px', borderRadius: '24px', fontWeight: 'bold' }}
                    >
                        Claim 15 Coins
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SkillConnectPage;
