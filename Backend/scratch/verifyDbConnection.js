const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db').then(async () => {
  console.log('Active Connected Database Name:', mongoose.connection.name);
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections in Database:', collections.map(c => c.name));
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
