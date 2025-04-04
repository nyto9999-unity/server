const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const secretKey = process.env.JWT_SECRET;
const authMiddleware = require('../middleware/auth_middleware');
 
 
const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {

    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = await User.create({
      username,
      password: hashedPassword,
    });
    res.json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
      const user = await User.findOne({ where: { username } });

      if (user && (await bcrypt.compare(password, user.password))) {
          const accessToken = jwt.sign({ username }, secretKey, { expiresIn: '5m' });
          const refreshToken = jwt.sign({ username }, secretKey, { expiresIn: '7d' });

          res.cookie('refreshToken', refreshToken, {
              httpOnly: true, // 防止用戶端 JavaScript 存取 cookie
              secure: true, // 僅在 HTTPS 連線上傳送 cookie
              sameSite: 'strict', // 防止跨站請求偽造
              maxAge: 7 * 24 * 60 * 60 * 1000, // 設定 cookie 過期時間 (7 天)
          });

          res.json({ accessToken }); // 只返回 access token
      } else {
          res.status(401).json({ message: 'Login failed' });
      }
  } catch (err) {
      console.error('Error during login:', err);
      res.status(500).json({ message: 'Login failed' });
  }
});
router.post('/logout', authMiddleware, (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (token) {
      global.blacklist.add(token);
      res.json({ message: 'Logged out successfully' });
  } else {
      res.status(400).json({ message: 'Token is missing' });
  }
});

module.exports = router;