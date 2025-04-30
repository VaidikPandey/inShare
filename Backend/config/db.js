require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
  mongoose.connect('mongodb://localhost:27017/inShare',{
  }).then(() => {
    console.log('Database Connected.');
  }).catch((err) => {
    console.error('Database connection failed:', err.message);
  });
}

module.exports = connectDB;

