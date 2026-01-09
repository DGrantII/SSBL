const { Schema, model } = require('mongoose');

const ImageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    }
});

const Images = model('images', ImageSchema);

module.exports = Images;