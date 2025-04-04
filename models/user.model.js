const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // 引入 sequelize 實例

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;