const { Schema, model } = require('mongoose');

const RankedTeamSchema = new Schema({
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
        contentType: String,
    },
    change: {
        type: Number
    },
    changeIcon: {
        type: String
    }
});

const RankedTeam = model('rankedTeams', RankedTeamSchema);

module.exports = RankedTeam;