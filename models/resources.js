const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },

})
const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;