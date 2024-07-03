const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Users = require('./../../models/userModel');
const Reviews = require('./../../models/reviewsModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

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
    console.error('Error connecting to MongoDB:', err.message);
  }
}

dbConnect().catch((err) => console.log(err));

//READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

//IMPORT DATA
const importData = async () => {
  try {
    await Tour.create(tours);
    await Reviews.create(reviews);
    await Users.create(users, { validateBeforeSave: false });
    console.log('Data succsesffuly loaded');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//DELETE DATA
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await Reviews.deleteMany();
    await Users.deleteMany();
    console.log('Data succsesffuly deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

console.log(process.argv);
