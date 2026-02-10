const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number },
    diagnosis: { type: String },
    caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    profileImage: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
