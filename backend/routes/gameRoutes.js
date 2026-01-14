import express from 'express';
import Score from '../models/Score.js';

const router = express.Router();

router.post('/score', async (req, res) => {
    try {
        const { playerName, mode, distance, maxSpeed, time } = req.body;

        const score = new Score({
            playerName,
            mode,
            distance,
            maxSpeed,
            time
        });

        await score.save();

        res.json({
            success: true,
            message: 'Score submitted successfully',
            score
        });
    } catch (error) {
        console.error('Submit score error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting score',
            error: error.message
        });
    }
});

router.get('/leaderboard', async (req, res) => {
    try {
        const { mode = 'endless', limit = 10 } = req.query;

        const scores = await Score.find({ mode })
            .sort({ distance: -1 })
            .limit(parseInt(limit))
            .select('playerName distance maxSpeed time createdAt');

        res.json({
            success: true,
            scores
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
});

router.get('/stats/:playerName', async (req, res) => {
    try {
        const { playerName } = req.params;

        const stats = await Score.aggregate([
            { $match: { playerName } },
            {
                $group: {
                    _id: '$mode',
                    totalGames: { $sum: 1 },
                    bestDistance: { $max: '$distance' },
                    avgDistance: { $avg: '$distance' },
                    bestSpeed: { $max: '$maxSpeed' }
                }
            }
        ]);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

export default router;
