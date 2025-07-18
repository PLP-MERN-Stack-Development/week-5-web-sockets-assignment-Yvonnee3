const express = require("express")
const router = express.Router()
const messageController = require("../controllers/messageController")
const auth = require("../middleware/auth")

// All routes are protected
router.use(auth)

// Get messages for a room
router.get("/:roomId", messageController.getMessages)

// Get private messages between users
router.get("/private/:userId", messageController.getPrivateMessages)

// Search messages
router.get("/search", messageController.searchMessages)

// Delete message
router.delete("/:messageId", messageController.deleteMessage)

// Edit message
router.put("/:messageId", messageController.editMessage)

module.exports = router
