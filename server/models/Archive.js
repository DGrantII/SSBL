const { Schema, model } = require('mongoose');

const ArchiveSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        data: Buffer,
        contentType: String
    },
    location: {
        type: String,
        required: true
    },
    debut: {
        type: Number,
        required: true
    },
    lastSeason: {
        type: Number,
        required: true
    },
    playoffApps: {
        type: Number,
        required: true
    },
    finalsApps: {
        type: Number,
        required: true
    },
    championships: {
        type: Number,
        required: true
    }
});

const Archive = model('archives', ArchiveSchema);

module.exports = Archive;