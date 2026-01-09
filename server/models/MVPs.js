const { Schema, model } = require('mongoose');

const MVPsSchema = new Schema({
    season: {
        type: Number,
        required: true
    },
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

const MVPs = model("MVPs", MVPsSchema);

module.exports = MVPs;