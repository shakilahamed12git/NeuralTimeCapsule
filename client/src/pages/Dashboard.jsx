import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, ArrowRight, Brain, Calendar, Trash2, Stethoscope } from 'lucide-react';

const Dashboard = () => {
    const [patients, setPatients] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', diagnosis: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const res = await axios.get('/api/patients');
            setPatients(res.data);
        } catch (err) {
            console.error('Error fetching patients:', err);
            // Optional: alert('Failed to connect to server. Ensure MongoDB is running and server is started.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/patients', newPatient);
            setShowAddModal(false);
            setNewPatient({ name: '', age: '', diagnosis: '' });
            fetchPatients();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert('Error adding patient: ' + msg);
        }
    };

    const handleDeletePatient = async (id) => {
        if (!window.confirm('Are you sure you want to delete this patient and all their data?')) return;
        try {
            await axios.delete(`/api/patients/${id}`);
            fetchPatients();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert('Error deleting patient: ' + msg);
        }
    };

    return (
        <div className="container" style={{ padding: 'clamp(20px, 5vw, 40px) 16px' }}>
            <header style={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '40px',
                gap: '20px'
            }}>
                <div style={{ minWidth: '200px' }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '8px' }}>Caregiver Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your patients and their memory capsules</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn btn-primary" style={{ width: 'auto' }}>
                    <Plus size={20} />
                    <span>New Patient</span>
                </button>
            </header>

            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card neural-shimmer" style={{ height: '200px', opacity: 0.5 }}></div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                    {patients.map((patient) => (
                        <motion.div
                            key={patient._id}
                            whileHover={{ y: -5 }}
                            className="glass-card"
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '16px',
                                        background: 'var(--neural-gradient)',
                                        display: 'flex',
                                        flexShrink: 0,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {patient.name[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '1.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{patient.name}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{patient.diagnosis || 'No diagnosis recorded'}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDeletePatient(patient._id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'background 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: 'var(--glass)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} />
                                        <span>{patient.age} Years Old</span>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                                    gap: '10px'
                                }}>
                                    <Link to={`/patient-dashboard/${patient._id}`} className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '8px' }}>
                                        Profile
                                    </Link>
                                    <Link to={`/memory-bank/${patient._id}`} className="btn btn-secondary" style={{ justifyContent: 'center', fontSize: '0.75rem', padding: '8px' }}>
                                        <Brain size={14} />
                                        <span>Reconstruct</span>
                                    </Link>
                                    <Link
                                        to={`/medical?mongoId=${patient._id}&name=${encodeURIComponent(patient.name)}&stage=${patient.diagnosis}`}
                                        className="btn btn-secondary"
                                        style={{
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            padding: '8px',
                                            background: 'rgba(56, 189, 248, 0.1)',
                                            borderColor: 'rgba(56, 189, 248, 0.3)',
                                            color: '#38bdf8'
                                        }}
                                    >
                                        <Stethoscope size={14} />
                                        <span>AI Hub</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {patients.length === 0 && (
                        <div className="glass-card" style={{ padding: 'clamp(40px, 10vw, 80px)', gridColumn: '1 / -1', textAlign: 'center' }}>
                            <Users size={48} color="var(--text-secondary)" style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <p style={{ color: 'var(--text-secondary)' }}>No patients found. Get started by adding your first patient.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Add Patient Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.95 }}
                            className="glass-card"
                            style={{ padding: '40px', width: '100%', maxWidth: '500px', position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Add New Patient</h2>
                                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                    <Plus size={32} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                            </div>

                            <form onSubmit={handleAddPatient}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter patient name..."
                                        value={newPatient.name}
                                        onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="e.g. 75"
                                        value={newPatient.age}
                                        onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Diagnosis</label>
                                    <select
                                        value={newPatient.diagnosis}
                                        onChange={(e) => setNewPatient({ ...newPatient, diagnosis: e.target.value })}
                                        className="input-field"
                                        required
                                    >
                                        <option value="" disabled>Choose Stage</option>
                                        <option value="Early">Early</option>
                                        <option value="Middle">Middle</option>
                                        <option value="Severe">Severe</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                                    <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', height: '56px' }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', height: '56px' }}>
                                        <Plus size={20} />
                                        <span>Create Patient</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;
