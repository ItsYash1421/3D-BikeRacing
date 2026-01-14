import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
    playerName: {
        type: String,
        required: true,
        trim: true
    },
    mode: {
        type: String,
        required: true,
        enum: ['endless', 'timed']
    },
    distance: {
        type: Number,
        required: true
    },
    maxSpeed: {
        type: Number,
        required: true
    },
    time: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

ScoreSchema.index({ mode: 1, distance: -1 });
ScoreSchema.index({ playerName: 1, createdAt: -1 });

export default mongoose.model('Score', ScoreSchema);
