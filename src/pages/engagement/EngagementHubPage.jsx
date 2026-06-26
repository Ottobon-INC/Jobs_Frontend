import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Typography, Card, Row, Col, Statistic, Button, Tag, Divider, Avatar, List, Spin } from 'antd';
import { FireOutlined, TrophyOutlined, ThunderboltOutlined, RocketOutlined, CodeOutlined, PlayCircleOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getRewardsState, getLeaderboard } from '../../api/rewardsApi';

const { Title, Text } = Typography;

const EngagementHubPage = () => {
    const navigate = useNavigate();
    const [coinBalance, setCoinBalance] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHubData = async () => {
            try {
                const [rewardsRes, leaderboardRes] = await Promise.all([
                    getRewardsState(),
                    getLeaderboard(5)
                ]);
                setCoinBalance(rewardsRes.coin_balance || 0);
                setCurrentStreak(rewardsRes.current_streak || 0);
                if (leaderboardRes && leaderboardRes.leaderboard) {
                    setLeaderboard(leaderboardRes.leaderboard);
                }
            } catch (err) {
                console.error("Failed to load engagement data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHubData();
    }, []);

    const games = [
        {
            id: 'typing',
            title: 'Typing Test Arena',
            description: 'Race against time to type technical definitions.',
            icon: <CodeOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
            color: '#e6f7ff',
            coinsPerPlay: '1 coin / word',
            path: '/engagement/games/typing'
        },
        {
            id: 'trivia',
            title: 'Rapid Fire Trivia',
            description: 'Answer 10 fast-paced tech questions.',
            icon: <ThunderboltOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
            color: '#fffbe6',
            coinsPerPlay: '5 coins / answer',
            path: '/engagement/games/trivia'
        },
        {
            id: 'jargon',
            title: 'Jargon Buster',
            description: 'Wordle-style tech term guessing game.',
            icon: <BookOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
            color: '#f6ffed',
            coinsPerPlay: 'Up to 20 coins',
            path: '/engagement/games/jargon'
        },
        {
            id: 'skill',
            title: 'Skill Connect',
            description: 'Match skills to job roles in this memory game.',
            icon: <RocketOutlined style={{ fontSize: '24px', color: '#722ed1' }} />,
            color: '#f9f0ff',
            coinsPerPlay: '15 base + bonus',
            path: '/engagement/games/skill-connect'
        }
    ];



  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  const todayStr = new Date().toLocaleDateString('en-CA');
  const statusStr = localStorage.getItem('dailyChallengesStatus');
  const challengesStatus = statusStr ? JSON.parse(statusStr) : {};
  
  const isQuizCompleted = challengesStatus['daily-quiz'] === todayStr;
  const isIotdCompleted = challengesStatus['iotd'] === todayStr;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: '32px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>Career Arcade Hub</Title>
          <Text type="secondary">Play games, earn coins, and sharpen your skills daily.</Text>
        </Col>
        <Col>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Card size="small" style={{ borderRadius: '12px', background: '#fff1f0', borderColor: '#ffa39e' }}>
              <Statistic title="Daily Streak" value={currentStreak} prefix={<FireOutlined style={{ color: '#ff4d4f' }} />} suffix="Days" valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }} />
            </Card>
            <Card size="small" style={{ borderRadius: '12px', background: '#fffbe6', borderColor: '#ffe58f' }}>
              <Statistic title="Coin Balance" value={coinBalance} prefix={<TrophyOutlined style={{ color: '#faad14' }} />} valueStyle={{ color: '#faad14', fontWeight: 'bold' }} />
            </Card>
          </div>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Title level={4}>Daily Challenges</Title>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <motion.div variants={itemVariants}>
                  <Card hoverable style={{ borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Tag color="magenta">New</Tag>
                        <Title level={5} style={{ marginTop: '8px' }}>Daily Career Quiz</Title>
                        <Text type="secondary">5 personalized MCQs based on your skill gaps.</Text>
                        <div style={{ marginTop: '16px' }}>
                          {isQuizCompleted ? (
                              <Tag color="green">Completed</Tag>
                          ) : (
                              <Tag icon={<TrophyOutlined />} color="gold">Up to 50 Coins</Tag>
                          )}
                        </div>
                      </div>
                      <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<PlayCircleOutlined />} 
                        size="large" 
                        style={{ background: isQuizCompleted ? '#d9d9d9' : '#D45B34', borderColor: isQuizCompleted ? '#d9d9d9' : '#D45B34' }} 
                        onClick={() => navigate('/engagement/daily-quiz')} 
                        disabled={isQuizCompleted}
                      />
                    </div>
                  </Card>
                </motion.div>
              </Col>
              <Col span={12}>
                <motion.div variants={itemVariants}>
                  <Card hoverable style={{ borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <Tag color="purple">Interview</Tag>
                        <Title level={5} style={{ marginTop: '8px' }}>Question of the Day</Title>
                        <Text type="secondary">Answer an AI-evaluated interview question.</Text>
                        <div style={{ marginTop: '16px' }}>
                          {isIotdCompleted ? (
                              <Tag color="green">Completed</Tag>
                          ) : (
                              <Tag icon={<TrophyOutlined />} color="gold">Up to 25 Coins</Tag>
                          )}
                        </div>
                      </div>
                      <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<PlayCircleOutlined />} 
                        size="large" 
                        style={{ background: isIotdCompleted ? '#d9d9d9' : '#D45B34', borderColor: isIotdCompleted ? '#d9d9d9' : '#D45B34' }} 
                        onClick={() => navigate('/engagement/iotd')} 
                        disabled={isIotdCompleted}
                      />
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            <Divider orientation="left"><Title level={4} style={{ margin: 0 }}>Minigames Arena</Title></Divider>
            
            <Row gutter={[16, 16]}>
              {games.map((game) => (
                <Col span={12} key={game.id}>
                  <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card style={{ borderRadius: '12px', background: game.color, height: '100%', cursor: 'pointer' }} bordered={false} onClick={() => navigate(game.path)}>
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {game.icon}
                        </div>
                        <div>
                          <Title level={5} style={{ margin: 0 }}>{game.title}</Title>
                          <Text type="secondary" style={{ display: 'block', margin: '4px 0 8px', fontSize: '13px' }}>{game.description}</Text>
                          <Tag icon={<TrophyOutlined />} color="gold" style={{ border: 0, background: 'rgba(250, 173, 20, 0.1)' }}>{game.coinsPerPlay}</Tag>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Col>

        <Col xs={24} md={8}>
          <Card title={<><TrophyOutlined style={{ color: '#faad14' }} /> Weekly Leaderboard</>} style={{ borderRadius: '12px', height: '100%' }}>
            <List
              itemLayout="horizontal"
              dataSource={leaderboard}
              renderItem={(item, index) => (
                <List.Item style={{ background: item.isCurrentUser ? '#f0f5ff' : 'transparent', padding: item.isCurrentUser ? '12px' : '12px 0', borderRadius: '8px' }}>
                  <List.Item.Meta
                    avatar={
                      <div style={{ position: 'relative' }}>
                        <Avatar src={item.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${item.full_name || 'User'}`} />
                        {index < 3 && (
                          <div style={{ position: 'absolute', top: -8, right: -8, fontSize: '18px' }}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                        )}
                      </div>
                    }
                    title={<Text strong={item.isCurrentUser}>{item.full_name || 'Anonymous'}</Text>}
                    description={`${(item.total_coins_earned || 0).toLocaleString()} Coins`}
                  />
                  <Text strong style={{ color: '#faad14' }}>#{index + 1}</Text>
                </List.Item>
              )}
            />
            <Button type="dashed" block style={{ marginTop: '16px' }}>View Full Leaderboard</Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EngagementHubPage;
