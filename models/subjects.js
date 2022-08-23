const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    plan: {
        type: String,
        requried: true,
    },
    
    chapters: [{
        name: {
            type: String,
            required: true
        },
        assignments: [{
            type: Schema.Types.ObjectId,
        }],
        resources: [{
            type: Schema.Types.ObjectId,
        }],
        topics: [{
            name: {
                type: String,
                required: true
            },
            week: {
                type: String,
            }
        }]
    }],

})

const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject;