const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'private'],
    default: 'text'
  },
  fileData: {
    fileName: String,
    fileType: String,
    fileSize: Number,
    fileUrl: String
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'angry', 'sad']
    }
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);