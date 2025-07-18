[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19951575&assignment_repo_type=AssignmentRepo)

# Real-Time Chat Application with Socket.io

A comprehensive real-time chat application built with React, Node.js, Express, Socket.io, and MongoDB. This application demonstrates bidirectional communication between clients and server with advanced chat features.

## 🚀 Features

### Core Features
- ✅ Real-time messaging with Socket.io
- ✅ User authentication (JWT-based)
- ✅ Multiple chat rooms/channels
- ✅ Online/offline status indicators
- ✅ Typing indicators
- ✅ Message timestamps

### Advanced Features
- ✅ Private messaging between users
- ✅ Message reactions (like, love, laugh, angry, sad)
- ✅ File and image sharing
- ✅ Read receipts
- ✅ Browser notifications
- ✅ Sound notifications
- ✅ Message search functionality
- ✅ Message pagination
- ✅ Reconnection handling
- ✅ Responsive design

### Technical Features
- ✅ MongoDB integration with Mongoose
- ✅ JWT authentication
- ✅ Socket.io rooms and namespaces
- ✅ Error handling and validation
- ✅ File upload system
- ✅ Push notification system (placeholder)

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Socket.io Client** - Real-time communication
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing


## 🏗️ Project Structure

\`\`\`
socketio-chat/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ChatSidebar.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   ├── MessageList.jsx
│   │   │   ├── TypingIndicator.jsx
│   │   │   └── UserList.jsx
│   │   ├── context/       # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── NotificationContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/         # Page components
│   │   │   ├── Chat.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── api.js         # API configuration
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   │   ├── db.js         # Database connection
│   │   ├── jwt.js        # JWT utilities
│   │   └── socket.js     # Socket.io configuration
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── messageController.js
│   │   ├── roomController.js
│   │   └── socketController.js
│   ├── models/           # Mongoose models
│   │   ├── Message.js
│   │   ├── Room.js
│   │   └── User.js
│   |
│   ├── server.js         # Main server file
│   └── package.json
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Messages
- `GET /api/messages/:roomId` - Get room messages
- `GET /api/messages/private/:userId` - Get private messages
- `GET /api/messages/search` - Search messages
- `DELETE /api/messages/:messageId` - Delete message
- `PUT /api/messages/:messageId` - Edit message

### Rooms
- `GET /api/rooms` - Get user rooms
- `POST /api/rooms` - Create new room
- `POST /api/rooms/:roomId/join` - Join room
- `POST /api/rooms/:roomId/leave` - Leave room
- `GET /api/rooms/:roomId` - Get room details

## 🔌 Socket Events

### Client to Server
- `authenticate` - Authenticate user
- `join_room` - Join a chat room
- `send_message` - Send message to room
- `send_private_message` - Send private message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `add_reaction` - Add reaction to message
- `upload_file` - Upload file
- `mark_as_read` - Mark message as read

### Server to Client
- `authenticated` - Authentication successful
- `online_users` - List of online users
- `user_online` - User came online
- `user_offline` - User went offline
- `new_message` - New message received
- `private_message` - Private message received
- `user_typing` - User started typing
- `user_stop_typing` - User stopped typing
- `message_reaction` - Message reaction added
- `error` - Error occurred

## 🎯 Usage

1. **Registration/Login**
   - Create a new account or login with existing credentials
   - JWT token is stored in localStorage for authentication

2. **Chat Rooms**
   - Join existing rooms (General, Random)
   - Create new rooms using the + button
   - Switch between rooms using the sidebar

3. **Messaging**
   - Send text messages in real-time
   - Upload files and images
   - Add reactions to messages
   - Send private messages to online users

4. **Real-time Features**
   - See who's online
   - View typing indicators
   - Receive browser notifications
   - Auto-reconnection on disconnect




