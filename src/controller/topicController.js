const userModel = require('../model/userModel')
const topicModel = require('../model/topicModel')
const mongoose = require("mongoose")
const moment = require("moment")



//-----------------------------------------------basic validations---------------------------------------------------//

//check for the requestbody cannot be empty --
const isValidRequestBody = function (value) {
  return Object.keys(value).length > 0
}

//validaton check for the type of Value --
const isValid = (value) => {
  if (typeof value == 'undefined' || value == null) return false;
  if (typeof value == 'string' && value.trim().length == 0) return false;
  return true
}

//check wheather objectId is valid or not--
const isValidObjectId = (value) => {
  return mongoose.isValidObjectId(value)
}

//-------------------------------------------------------POST /topic---------------------------------------------------------//

const createTopic = async (req, res) => {

  try {
    const data = req.body
    //check for the requestbody cannot be empty --
    if (!isValidRequestBody(data)) {
      return res.status(400).send({ status: false, message: "plz enter some data" })
    }

    const { title, userId, releasedAt } = data

    // userId validation
    //validaton check for the type of Value --
    if (!isValid(userId)) {
      return res.status(400).send({ status: false, message: " userId is required" })

    }
    //check wheather objectId is valid or not--
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "plz enter valid userId" })
    }

    const Idcheck = await userModel.findOne({ userId: userId })
    if (!Idcheck) {
      return res.status(404).send({ status: false, message: "user not defined " })
    }

    let tokenUserId = req["userId"]
    if (tokenUserId != userId) {
      return res.status(401).send({ status: false, message: "you are unauthorized to access this data " })
    }

    //   title validation
    //validaton check for the type of Value --
    if (!isValid(title)) {
      return res.status(400).send({ status: false, message: " title is required" })

    }
    const titleCheck = await topicModel.findOne({ title: title }).collation({ locale: 'en', strength: 2 })
    if (titleCheck) {
      return res.status(400).send({ status: false, message: " this title already exist " })
    }
   

    // date validation
    //validaton check for the type of Value --
    if (!isValid(releasedAt)) {
      return res.status(400).send({ status: false, message: " released date is required" })
    }

    //date validation by using moment--
    if (!moment(releasedAt, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).send({ status: false, message: " plz enter valid date" })

    }

    //data creation--
    const saveTopic = await topicModel.create(data)
    return res.status(201).send({ status: true, message: 'Success', data: saveTopic })

  }
  catch (err) {
    console.log(err.message)
    return res.status(500).send({ status: "error", msg: err.message })
  }

}


//--------------------------------------------------GET/topic-------------------------------------------------------//

const getTopic = async (req, res) => {
  try {
    let data = req.query

    //add filter--
    let filter = { isDeleted: false }

//check for the requestbody cannot be empty --
    if (isValidRequestBody(data)) {
      const { userId} = data
      if (!(userId )) {
        return res.status(400).send({ status: false, message: "plz enter valid filter" })

      }

//check wheather objectId is valid or not--
      if (isValidObjectId(userId)) {
        filter["userId"] = userId
      }

    }

    //select response keys for res.body
    let topic = await topicModel.find(filter).collation({ locale: 'en', strength: 2 })
      .select({ _id: 1, title: 1, userId: 1,  releasedAt: 1, reviews: 1 })
      .sort({ 'title': 1 })


    //validation when no topic exist--
    if (!topic.length)
      return res.status(404).send({ status: false, message: "No topics Available." })

//data creation
    return res.status(200).send({ status: true, count: topic.length, message: 'topic list', data: topic  });
  }

  catch (error) {
    res.status(500).send({ status: 'error', Error: error.message })
  }
}




//---------------------------------------------------------Put Api-------------------------------------------------------//


const updateTopic = async function (req, res) {
  try {
    let topicId = req.params.topicId 
    let data = req.body
    let { title } = data
    let tokenUserId = req["userId"]

//check wheather objectId is valid or not--
    if (!isValidObjectId(topicId )) {
      return res.status(400).send({ status: false, message: "plz enter valid topicId " })
    }
    let topic = await topicModel.findOne({ _id: topicId , isDeleted: false })
    if (!topic) {
      return res.status(404).send({ status: false, message: "No topic Found" })
    }

    let userId = topic.userId
    if (tokenUserId != userId) {
      return res.status(401).send({ status: false, message: "you are unauthorized to access this data " })
    }

    let x = (!(title ))
 //check for the requestbody cannot be empty --
    if (!isValidRequestBody(data) || x) {
      return res.status(400).send({ status: false, message: "plz enter valid data for updation" })

    }

    if (title) {

      const titleCheck = await topicModel.findOne({ title: title.trim() }).collation({ locale: 'en', strength: 2 })  //collation uses to make title case insestive 
      if (titleCheck) {
        return res.status(400).send({ status: false, message: " this title already exist " })
      }
    }
  

    if (releasedAt)
      if (!moment(releasedAt, "YYYY-MM-DD", true).isValid()) {
        return res.status(400).send({ status: false, message: " plz enter valid date" })
      }

    let alltopic = await topicModel.findByIdAndUpdate(
      { _id: topicId  },
      { $set: { title: title, excerpt: excerpt, releasedAt: releasedAt, ISBN: ISBN } },
      { new: true })

    return res.status(200).send({ status: true, message: 'Success', data: alltopic })
  }
  catch (err) {
    return res.status(500).send({ status: false, msg: err.message })
  }
}


//-----------------------------------------------DELETE /topics/:topicId -------------------------------------------------//

const deleteTopic = async (req, res) => {

  try {
    let id = req.params.topicId 

    const tokenUserId = req["userId"]

//check wheather objectId is valid or not--
    if (!isValidObjectId(id)) {

      return res.status(400).send({ status: false, message: "please enter valid id" })
    }

    const findTopic = await topicModel.findOne({ _id: id, isDeleted: false })


    if (!findTopic) {
      return res.status(404).send({ status: false, message: 'No topic found' })
    }

    let userId = findTopic.userId

    if (tokenUserId != userId) {
      return res.status(401).send({ status: false, message: "you are unauthorized to access this data " })
    }

    await topicModel.findOneAndUpdate({ _id: id },
      { $set: { isDeleted: true, deletedAt: Date.now() } },
      { new: true })
    return res.status(200).send({ status: true, message: "deleted sucessfully" })
  }
  catch (err) {
    console.log(err.message)
    return res.status(500).send({ status: "error", msg: err.message })
  }
}


module.exports = { createTopic, getTopic, updateTopic, deleteTopic }
