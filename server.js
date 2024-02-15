const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

async function dbConnect() {
  try {
    const connectionResult = await mongoose.connect(DB);
    console.log(
      'MongoDB connection successful:',
      connectionResult.connection.host,
      ' - ',
      connectionResult.connection.port,
    );
  } catch (err) {
    console.log(err.name, err.message);
    console.log('UNHANDLER REJECTION! 💥 Shutting down...');
    server.close(() => {
      process.exit(1);
    });
  }
}

process.on('uncaughtException', (error) => {
  console.log(error.name, error.message);
  console.log('UNCAUGTH EXCEPTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

dbConnect().catch((err) => console.log(err));
