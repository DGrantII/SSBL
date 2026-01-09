const { Schema, model } = require('mongoose');

const PlayerSchema = new Schema({
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
    champions: {
        type: Number,
        required: false,
    },
    champAppearances: {
        type: Number,
        required: false,
    },
    allStars: {
        type: Number,
        required: false,
    },
    mvps: {
        type: Number,
        required: false,
    },
});

const Player = model('players', PlayerSchema);

module.exports = Player;