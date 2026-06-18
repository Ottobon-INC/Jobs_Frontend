import { useState, useEffect, useCallback } from 'react';
import { getMyProfileScore, recomputeMyProfileScore, getMyRoadmap, getLeaderboard } from '../api/profileScoreApi';

export const useProfileScore = () => {
    const [score, setScore] = useState(null);
    const [roadmap, setRoadmap] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recomputing, setRecomputing] = useState(false);
    const [error, setError] = useState(null);

    const fetchScoreData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Run requests in parallel
            const [scoreData, roadmapData, leaderboardData] = await Promise.all([
                getMyProfileScore().catch(err => {
                    console.error("Error fetching score, returning default:", err);
                    return {
                        resume_score: 0,
                        interview_score: 0,
                        skill_score: 0,
                        activity_score: 0,
                        application_score: 0,
                        community_score: 0,
                        total_score: 0,
                        score_tier: "Starter",
                        last_computed: new Date().toISOString()
                    };
                }),
                getMyRoadmap().catch(err => {
                    console.error("Error fetching roadmap:", err);
                    return [];
                }),
                getLeaderboard(10).catch(err => {
                    console.error("Error fetching leaderboard:", err);
                    return [];
                })
            ]);

            setScore(scoreData);
            setRoadmap(roadmapData);
            setLeaderboard(leaderboardData);
        } catch (err) {
            console.error("Failed to load profile score context:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const recomputeScore = useCallback(async () => {
        try {
            setRecomputing(true);
            setError(null);
            const newScore = await recomputeMyProfileScore();
            setScore(newScore);
            
            // Re-fetch roadmap which depends on new scores
            const newRoadmap = await getMyRoadmap();
            setRoadmap(newRoadmap);

            // Re-fetch leaderboard since current user score changed
            const newLeaderboard = await getLeaderboard(10);
            setLeaderboard(newLeaderboard);
            
            return newScore;
        } catch (err) {
            console.error("Failed to recompute profile score:", err);
            setError(err);
            throw err;
        } finally {
            setRecomputing(false);
        }
    }, []);

    useEffect(() => {
        fetchScoreData();
    }, [fetchScoreData]);

    return {
        score,
        roadmap,
        leaderboard,
        loading,
        recomputing,
        error,
        recomputeScore,
        refetch: fetchScoreData
    };
};
