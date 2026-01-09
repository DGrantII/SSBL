const { Schema, model } = require('mongoose');

const OffseasonSchema = new Schema({
    type: String,
    data: Array,
});

const Offseason = model('offseason', OffseasonSchema);

module.exports = Offseason;