const express = require('express');
const router = express.Router();
const Capsule = require('../models/Capsule');
const Memory = require('../models/Memory');
const auth = require('../middleware/auth');

// Get all capsules for a patient
router.get('/patient/:patientId', auth, async (req, res) => {
    try {
        const capsules = await Capsule.find({ patient: req.params.patientId }).populate('memories').sort({ createdAt: -1 });
        res.json(capsules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching capsules' });
    }
});
// Get single capsule
router.get('/:id', auth, async (req, res) => {
    try {
        const capsule = await Capsule.findById(req.params.id).populate('memories');
        if (!capsule) return res.status(404).json({ message: 'Capsule not found' });
        res.json(capsule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching capsule' });
    }
});
// Generate a new capsule (Simulated AI)
router.post('/generate', auth, async (req, res) => {
    try {
        const { patientId, memoryIds, title } = req.body;

        // Fetch memories to generate narrative
        const memories = await Memory.find({ _id: { $in: memoryIds } });

        // Enhanced Simulated AI Narrative Logic
        let narrative = `This Neural Capsule, "${title}", has been reconstructed through our AI engine. `;

        if (memories.length > 0) {
            const locations = [...new Set(memories.map(m => m.location).filter(l => l))];
            const people = [...new Set(memories.flatMap(m => m.peopleInvolved).filter(p => p))];

            narrative += `It brings together fragments from ${memories.length} distinct moments. `;

            if (locations.length > 0) {
                narrative += `We've identified significant spatial anchors in ${locations.join(', ')}. `;
            }

            if (people.length > 0) {
                narrative += `The neural reconstruction highlights deep social bonds with ${people.join(' and ')}. `;
            }

            const mainDescriptions = memories.slice(0, 3).map(m => m.description).filter(d => d).join('. ');
            if (mainDescriptions) {
                narrative += `At its core, this capsule preserves memories of: ${mainDescriptions}. `;
            }
        }

        narrative += `This synthesized narrative serves as a sensory bridge to help maintain cognitive connections.`;

        const capsule = new Capsule({
            patient: patientId,
            title,
            memories: memoryIds,
            narrative: narrative,
            theme: 'neural'
        });

        await capsule.save();
        const populatedCapsule = await Capsule.findById(capsule._id).populate('memories');
        res.status(201).json(populatedCapsule);
    } catch (error) {
        res.status(500).json({ message: 'Error generating capsule', error: error.message });
    }
});

// Delete a capsule
router.delete('/:id', auth, async (req, res) => {
    try {
        await Capsule.findByIdAndDelete(req.params.id);
        res.json({ message: 'Capsule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting capsule' });
    }
});

module.exports = router;
