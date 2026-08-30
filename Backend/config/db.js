const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db';
    const conn = await mongoose.connect(mongoURI);

    console.log(`\x1b[32m%s\x1b[0m`, `[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `[Database Error] MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
