const { Schema, model } = require('mongoose');

const PlayoffSchema = new Schema({
    type: String,
    data: Array,
});

const Playoff = model('playoffs', PlayoffSchema);

module.exports = Playoff;