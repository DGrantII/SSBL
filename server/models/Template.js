const { Schema, model } = require('mongoose');

const TemplateSchema = new Schema({
    week: Number,
    games: [[Number]],
});

const Template = model('template', TemplateSchema);

module.exports = Template;