const express = require("express")
const router = express.Router()
const roomController = require("../controllers/roomController")
const auth = require("../middleware/auth")

// All routes are protected
router.use(auth)

// Get all rooms for user
router.get("/", roomController.getRooms)

// Create new room
router.post("/", roomController.createRoom)

// Get room details
router.get("/:roomId", roomController.getRoomDetails)

// Join room
router.post("/:roomId/join", roomController.joinRoom)

// Leave room
router.post("/:roomId/leave", roomController.leaveRoom)

module.exports = router
