const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['image', 'audio', 'text', 'video', 'file'], required: true },
    fileUrl: { type: String },
    dateOccurred: { type: Date },
    location: { type: String },
    peopleInvolved: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Memory', memorySchema);
