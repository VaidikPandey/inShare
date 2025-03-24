require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
  mongoose.connect(process.env.MONGO_CONNECTION_URL, {
  }).then(() => {
    console.log('Database Connected.');
  }).catch((err) => {
    console.error('Database connection failed:', err.message);
  });
}

module.exports = connectDB;

