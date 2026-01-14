import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api/game';

class APIClient {
    async submitScore(scoreData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/score`, scoreData);
            return response.data;
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }

    async getLeaderboard(mode = 'endless', limit = 10) {
        try {
            const response = await axios.get(`${API_BASE_URL}/leaderboard`, {
                params: { mode, limit }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    }

    async getPlayerStats(playerName) {
        try {
            const response = await axios.get(`${API_BASE_URL}/stats/${playerName}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching player stats:', error);
            throw error;
        }
    }
}

export default new APIClient();
