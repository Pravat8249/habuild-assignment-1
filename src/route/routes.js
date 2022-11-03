const express= require("express")
const router= express.Router()
const userController = require("../controller/userController")
const topic = require("../controller/topicController")
const review = require("../controller/reviewsController")
const middleWare = require("../middleWare/auth")


//----------------------------------------------------UserApi----------------------------------------------------------//
router.post('/register', userController.createUser)

router.post("/login", userController.loginUser)

//---------------------------------------------------TopicApi------------------------------------------------------------//

router.post("/topic",middleWare.validateToken, topic.createTopic)

router.get("/topics",middleWare.validateToken, topic.getTopic)


router.put("/topics/:topicId",middleWare.validateToken, topic.updateTopic)

router.delete("/topics/:topicId",middleWare.validateToken, topic.deleteTopic)

//---------------------------------------------------ReviewApi------------------------------------------------------------//

router.post("/topics/:topicId/review", review.createReview)

router.put("/topics/:topicId/review/:reviewId",review.updateReview)

router.delete("/topics/:topicId/review/:reviewId",review.deleteReview)








module.exports = router;