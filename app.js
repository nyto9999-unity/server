require('dotenv').config();
const express = require('express');
const sequelize = require('./config/sequelize');
const authRoutes = require('./routes/auth');
const listRoutes = require('express-list-routes');
const app = express();
const port = process.env.PORT;
const authMiddleware = require('./middleware/auth_middleware');
app.use(express.json());

// 建立全域黑名單
global.blacklist = new Set();

app.use('/auth', authRoutes);

router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Protected resource' });
});

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
        console.log(listRoutes(app));
    });
});