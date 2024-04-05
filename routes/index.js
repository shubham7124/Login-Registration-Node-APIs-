var express = require('express');
var router = express.Router();
const User = require("./DataBase");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")


//Registration API
router.post('/register', async (req, res) => {
  try {
    const { name, dateOfBirth, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, dateOfBirth, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//login API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user._id }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// profile API
router.get('/profile', authenticateToken, (req, res) => {
  res.json(req.user);
});

//get use by id
router.get('/users/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//get by id
router.get('/api/users/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (user) {
      // User found
      res.json({ isPresent: true });
    } else {
      // User not found
      res.json({ isPresent: false });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, 'secret_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
}
module.exports = router;
