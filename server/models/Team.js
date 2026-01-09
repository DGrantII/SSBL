const { Schema, model } = require('mongoose');

const TeamSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    wins: {
        type: Number,
        required: true,
    },
    losses: {
        type: Number,
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
    logo: {
        data: Buffer,
        contentType: String
    },
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    players: {
        type: Array,
        required: true,
    },
    debut: {
        type: Number
    },
    playoffApps: {
        type: Number
    },
    finalsApps: {
        type: Number
    },
    championships: {
        type: Number
    }
});

const Team = model('teams', TeamSchema);

module.exports = Team;