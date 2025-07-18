const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController.js")
const auth = require("../middleware/auth")

// Public routes
router.post("/register", authController.register)
router.post("/login", authController.login)

// Protected routes
router.get("/verify", auth, authController.verifyToken)
router.post("/logout", auth, authController.logout)

module.exports = router
