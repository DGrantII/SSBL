const { Schema, model } = require('mongoose');

const ChampionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    seed: {
        type: Number,
        required: true
    },
    players: {
        type: Array,
        required: true
    },
    logo: {
        data: Buffer,
        contentType: String
    }
});

const MVPsSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    players: {
        type: Array,
        required: true
    },
    logo: {
        data: Buffer,
        contentType: String
    }
});

const SeasonsSchema = new Schema({
    season: {
        type: Number,
        required: true
    },
    teamResults: {
        data: Buffer,
        contentType: String
    },
    playerResults: {
        data: Buffer,
        contentType: String
    },
    scheduleResults: {
        data: Buffer,
        contentType: String
    },
    bracketResults: {
        data: Buffer,
        contentType: String
    },
    champions: ChampionSchema,
    mvps: MVPsSchema
});

const Seasons = model('seasons', SeasonsSchema);

module.exports = Seasons;