const mongoose = require('mongoose');
const Listing = require('../models/listings');
const initialData = require('./data');

main().then(() => {
    console.log("Successful DB connection");
}).catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/nestaway");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initialData.data = initialData.data.map((obj) => ({ ...obj, owner: "6abe535dcd5f3e7705d987da" }));
    await Listing.insertMany(initialData.data);
    console.log("Data initialized !");
}

initDB();