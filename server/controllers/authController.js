const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const bcrypt = require('bcryptjs'); // <--- ADDED THIS IMPORT

// --- ADDED THESE VALIDATION FUNCTIONS (assuming they are not imported from elsewhere) ---
// If these are meant to be in a separate validation utility file,
// you would need to import them from there.
const validateEmail = (email) => {
  // Simple regex for email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  // Password must be at least 6 characters long
  return password.length >= 6;
};
// --- END ADDED VALIDATION FUNCTIONS ---


const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email or username already exists'
        });
      }

      // Hash password before saving <--- ADDED HASHING
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = new User({
        username,
        email,
        password: hashedPassword // <--- USE HASHED PASSWORD
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password <--- UPDATED TO USE BCRYPT.COMPARE
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Update user status
      user.status = 'online';
      user.lastSeen = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Verify token
  verifyToken: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Logout user
  logout: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        status: 'offline',
        lastSeen: new Date()
      });

      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = authController;
