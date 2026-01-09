const { Schema, model } = require('mongoose');

const ScheduleSchema = new Schema({
    week: Number,
    games: [[String]],
});

const Schedule = model('schedule', ScheduleSchema);

module.exports = Schedule;