const topicModel = require('../model/topicModel')
const mongoose = require("mongoose")
const reviewsModel = require('../model/reviewsModel')



//-----------------------------------------------basic validations---------------------------------------------------//

const isValidRequestBody = function (value) {
    return Object.keys(value).length > 0
}

const isValid = (value) => {
    if (typeof value == 'undefined' || value == null) return false;
    if (typeof value == 'string' && value.trim().length == 0) return false;
    // if(typeof value !== "string") return false;
    return true
}


const isValidObjectId = (value) => {
    return mongoose.isValidObjectId(value)
}
const isValidReview = (value) => {

    if (typeof value == 'string' && value.trim().length == 0) return false;

    return true
}





//------------------------------------------Post /topic/:topicId/review----------------------------------------------------------------//

const createReview = async function (req, res) {

    try {

        let data = req.body
        let topicId = req.params.topicId

        if (!isValidObjectId(topicId)) {
            return res.status(400).send({ status: false, message: "plz enter valid topicId" })
        }
        let check = await topicModel.findOne({ _id: topicId, isDeleted: false }).lean()
        if (!check) {
            return res.status(404).send({ status: false, message: "topic document does'nt exist" })
        }

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "No details provided by user" })
        }




        const { review, reviewedBy, ranking } = data


        // review validation
        if (!isValid(review)) {
            return res.status(400).send({ status: false, message: " review  is required" })
        }



        if (!isValid(ranking)) {
            return res.status(400).send({ status: false, message: "ranking  is required" })
        }

        if (typeof ranking !== "number" || (ranking < 1 || ranking > 100)) {
            return res.status(400).send({ status: false, message: "please enter valid ranking in between 1 to 100" })
        }

        if (!isValidReview(reviewedBy)) {
            return res.status(400).send({ status: false, message: "reviewer's name  is required" })
        }



        data["reviewedAt"] = Date.now()
        data["topicId"] = topicId


        let reviewsData = await reviewsModel.create(data)


        let topic = await topicModel.findByIdAndUpdate(topicId,
            { $inc: { reviews: 1 } },
            { new: true }).lean()


        await reviewsModel.find({ topicId: topicId, isDeleted: false })
        topic["reviewData"] = reviewsData

        return res.status(201).send({ status: true, message: 'Success', data: topic})
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: "error", msg: err.message })
    }
}

// -----------------------------------------PUT /topic/:topicId/review/:reviewId----------------------------------------------------------------

const updateReview = async (req, res) => {

    try {


        const data = req.body
        const { topicId, reviewId } = req.params

        const { review, ranking, reviewedBy } = data

        if (!isValidObjectId(topicId)) {
            return res.status(400).send({ status: false, message: "plz enter valid topic" })
        }

        const checktopicId = await topicModel.findOne({ topicId, isDeleted: false }).lean()
        if (!checktopicId) {
            return res.status(404).send({ status: false, message: "No topic found" })
        }

        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "plz enter valid reviewId" })
        }

        const checkReviewId = await reviewsModel.findOne({ _id: reviewId, isDeleted: false, topicId: topicId })

        if (!checkReviewId) {
            return res.status(404).send({ status: false, message: "No such review found" })
        }

        let x = (!(ranking || reviewedBy || review))

        if (!isValidRequestBody(data) || x) {
            return res.status(400).send({ status: false, message: "plz enter valid data for updation" })
        }
        if (ranking) {
            if (typeof ranking !== "number" || (ranking < 1 || ranking > 100)) {
                return res.status(400).send({ status: false, message: "plz enter valid ranking" })
            }
        }

        if (review) {
            if (!isValid(review)) {
                return res.status(400).send({ status: false, message: "plz enter valid review" })
            }
        }

        const reviewData = await reviewsModel.findByIdAndUpdate({ _id: reviewId },
            { $set: { ranking: ranking, reviewedBy: reviewedBy, review: review } },
            { new: true })

        await reviewsModel.find({ topicId: topicId })

        checktopicId["reviewData"] = reviewData

        return res.status(200).send({ status: true, message: "reviews updated successfully", data: checktopicId })



    }
    catch (err) {
        return res.status(500).send({ status: "error", msg: err })
    }
}




// ---------------------------------------DELETE /topic/:topicId/review/:reviewId----------------------------------------------------------//


const deleteReview = async (req, res) => {

    try {

        const reviewId = req.params.reviewId
        const topicId = req.params.topicId

        if (!isValidObjectId(topicId)) {
            return res.status(400).send({ status: false, message: "plzz enter valid topic id" })
        }
        if (!isValidObjectId(reviewId)) {
            return res.status(400).send({ status: false, message: "plzz enter valid review id" })
        }
        const review = await reviewsModel.findOne({ _id: reviewId, topicId: topicId })
        if (!review) {
            return res.status(404).send({ status: false, message: "No review exists " })
        }
        if (review.isDeleted == true) {
            return res.status(404).send({ status: false, message: "review already deleted" })
        }

        const topic = await topicModel.findById(topicId)
        if (!topic) {

            return res.status(404).send({ status: false, message: "No topic Exists" })
        }
        if (topic.isDeleted == true) {
            return res.status(400).send({ status: false, message: "topic already deleted" })
        }
        await reviewsModel.findOneAndUpdate({ _id: reviewId }, { $set: { isDeleted: true }, deletedAt: Date.now() }, { new: true })

        await topicModel.findByIdAndUpdate({ _id: topicId }, { $inc: { reviews: -1 } }, { new: true })

        return res.status(200).send({ status: true, message: "successfully deleted" })
    }

    catch (err) {
        console.log(err.message)
        return res.status(500).send({ status: "error", msg: err.message })
    }

}


module.exports = { createReview, updateReview, deleteReview }












