const { Schema, model } = require('mongoose');

const RankedPlayerSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    kos: {
        type: Number,
        required: true,
    },
    damage: {
        type: Number,
        required: true,
    },
    change: {
        type: Number
    },
    changeIcon: {
        type: String
    }
});

const RankedPlayer = model('rankedPlayers', RankedPlayerSchema);

module.exports = RankedPlayer;