const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classpulse';

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected:', MONGO_URI);
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠  Auth features will be unavailable. Start MongoDB to enable login.');
  }
}

module.exports = { connectMongo };
