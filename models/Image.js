const { default: mongoose } = require('mongoose');
const mongo = require('mongoose')

const ImageSchema = new mongo.Schema({
    image_id: String,
    img: {
        data: Buffer,
    }

})
module.exports = mongoose.model('Image', ImageSchema)