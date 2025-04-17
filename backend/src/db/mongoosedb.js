const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://admin:root123@sahil.a6tk6.mongodb.net/certificate");
        console.log("Connected to DB");
    } catch (error) {
        console.log("Not connected to DB", error);
    }
}

module.exports = connectDB;
