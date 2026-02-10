const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

// Get all patients for current caregiver
router.get('/', auth, async (req, res) => {
    try {
        const patients = await Patient.find({ caregiver: req.userData.userId });
        res.json(patients);
    } catch (error) {
        console.error('SERVER ERROR FETCHING PATIENTS:', error);
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
});

// Create a new patient
router.post('/', auth, async (req, res) => {
    try {
        console.log('CREATE PATIENT REQUEST BODY:', req.body);
        console.log('USER DATA:', req.userData);
        const { name, age, diagnosis, profileImage } = req.body;
        const patient = new Patient({
            name,
            age,
            diagnosis,
            profileImage,
            caregiver: req.userData.userId
        });
        await patient.save();
        console.log('PATIENT CREATED SUCCESSFULLY:', patient._id);
        res.status(201).json(patient);
    } catch (error) {
        console.error('ERROR CREATING PATIENT:', error);
        res.status(500).json({ message: 'Error creating patient', error: error.message });
    }
});

// Get single patient
router.get('/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patient' });
    }
});

// Delete patient
router.delete('/:id', auth, async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // For demo purposes, we will skip the strict caregiver check if the caregiver ID is missing 
        // or if it matches the current guest ID.
        if (patient.caregiver && patient.caregiver.toString() !== req.userData.userId) {
            console.log(`Mismatch: Patient owned by ${patient.caregiver}, current user is ${req.userData.userId}`);
            // In a real app we'd block this, but for the demo we'll allow it if it's the guest account
            if (req.userData.userId !== '507f1f77bcf86cd799439011') {
                return res.status(403).json({ message: 'Not authorized to delete this patient' });
            }
        }

        await Patient.findByIdAndDelete(req.params.id);
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting patient', error: error.message });
    }
});

module.exports = router;
