const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Memory = require('../models/Memory');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Get all memories for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const memories = await Memory.find({ patient: req.params.patientId }).sort({ createdAt: -1 });
        res.json(memories);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching memories' });
    }
});

// Upload a memory
router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { patient, title, description, type, dateOccurred, location, peopleInvolved } = req.body;

        const memory = new Memory({
            patient,
            title,
            description,
            type,
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
            dateOccurred,
            location,
            peopleInvolved: peopleInvolved ? JSON.parse(peopleInvolved) : []
        });

        await memory.save();
        res.status(201).json(memory);
    } catch (error) {
        res.status(500).json({ message: 'Error saving memory', error: error.message });
    }
});

// Delete a memory
router.delete('/:id', auth, async (req, res) => {
    try {
        await Memory.findByIdAndDelete(req.params.id);
        res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting memory' });
    }
});

module.exports = router;
