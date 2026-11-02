const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows / ISP DNS resolvers failing on MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore in restricted environments
}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  let mongoUri = process.env.MONGODB_URI;

  // Filter out invalid placeholder strings
  if (!mongoUri || mongoUri.includes('<') || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
    mongoUri = 'mongodb://127.0.0.1:27017/talentmatch';
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    isConnected = conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (!process.env.VERCEL && !process.env.RENDER) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
