const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId

const reviewModel = new mongoose.Schema({

 
    topicId: {
        type: ObjectId,
        required: true,
        ref: "Book"
    },
    reviewedBy: {
        type: String,
        required: true,
        default: "Guest",
        trim:true

    },
    reviewedAt: {
        type: Date,
        required: true
    },
    ranking: {
        type: Number,
        min: 1,
        max: 100,
        required: true
    },
    review: {
        type: String,
        trim:true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model("review", reviewModel)