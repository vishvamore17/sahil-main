const mongoose = require("mongoose");

const engineerSchema = new mongoose.Schema({
    name: { type: String, required: true }
});

// Use singular form for model name
const ServiceEngineer = mongoose.model('ServiceEngineer', engineerSchema);  // Notice the singular form here

module.exports = ServiceEngineer;
