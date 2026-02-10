const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    title: { type: String, required: true },
    narrative: { type: String }, // AI generated emotional story
    memories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Memory' }],
    theme: { type: String, default: 'classic' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Capsule', capsuleSchema);
