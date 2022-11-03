const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

const topicModel = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
  

    userId: {
        type: ObjectId,
        required: true,
        ref: 'user',
        trim: true
    },
 
    reviews: {
        type: Number,
        default: 0,
        required: true

    },
    deletedAt: {
        type: Date
        
    },
    isDeleted: {
        type: Boolean,
        default: false
    },

    releasedAt: {
        type: Date,
        required: true
    },


}, { timestamps: true })

module.exports = mongoose.model("topic", topicModel)