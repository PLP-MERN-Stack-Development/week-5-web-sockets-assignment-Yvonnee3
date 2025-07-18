const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const connectDB = require("./config/db")

// Load environment variables
dotenv.config()

// Connect to database
connectDB()

// Initialize Express app
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// API Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/messages", require("./routes/messages"))
app.use("/api/rooms", require("./routes/rooms"))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// Socket.io connection handler
const socketController = require("./controllers/socketController")
socketController(io)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use((req, res) => {
  console.log("404 - Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
    method: req.method,
  })
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 Socket.io server ready`)
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

module.exports = { app, server, io }
