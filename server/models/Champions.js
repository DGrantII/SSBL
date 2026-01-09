const { Schema, model } = require('mongoose');

const ChampionsSchema = new Schema({
    season: {
        type: Number,
        required: true
    },
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

const Champions = model("champions", ChampionsSchema);

module.exports = Champions;