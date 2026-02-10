const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neural-time-capsule')
    .then(async () => {
        console.log('Connected to DB');
        const patients = await Patient.find({});
        console.log('Patients count:', patients.length);
        patients.forEach(p => {
            console.log(`Patient: ${p.name}, Caregiver: ${p.caregiver}`);
        });
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
