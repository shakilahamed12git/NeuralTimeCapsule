import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Brain, Play, ArrowLeft, Calendar, Heart, Image as ImageIcon, Trash2 } from 'lucide-react';

const clampSizeStatic = (min, max) => {
    const width = window.innerWidth;
    if (width < 640) return min;
    if (width > 1024) return max;
    return min + (max - min) * ((width - 640) / (1024 - 640));
};

const PatientDashboard = () => {
    const { id } = useParams();
    const [patient, setPatient] = useState(null);
    const [capsules, setCapsules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const pRes = await axios.get(`/api/patients/${id}`);
            setPatient(pRes.data);
            const cRes = await axios.get(`/api/capsules/patient/${id}`);
            setCapsules(cRes.data);
        } catch (err) {
            console.error('Error fetching data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCapsule = async (e, capsuleId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Erase this neural archive?')) return;
        try {
            await axios.delete(`/api/capsules/${capsuleId}`);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert('Error deleting capsule: ' + msg);
        }
    };

    if (isLoading) return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>Exploring Memories...</div>;
    if (!patient) return <div className="container">Patient not found</div>;

    return (
        <div className="container patient-view" style={{ padding: 'clamp(30px, 8vw, 60px) clamp(16px, 4vw, 24px)' }}>
            <header style={{ textAlign: 'center', marginBottom: 'clamp(40px, 10vw, 60px)' }}>
                <div style={{
                    width: 'clamp(80px, 15vw, 120px)',
                    height: 'clamp(80px, 15vw, 120px)',
                    borderRadius: '50%',
                    background: 'var(--neural-gradient)',
                    margin: '0 auto 24px',
                    padding: '5px'
                }}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--background)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 'bold'
                    }}>
                        {patient.name[0]}
                    </div>
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3.5rem)', marginBottom: '16px' }}>Hello, {patient.name}</h1>
                <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: 'var(--text-secondary)' }}>Welcome to your memory garden.</p>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Brain color="var(--primary)" size={32} />
                    Your Memory Capsules
                </h2>

                <div style={{ display: 'grid', gap: '30px' }}>
                    {capsules.map((capsule) => (
                        <motion.div
                            key={capsule._id}
                            whileHover={{ scale: 1.01 }}
                            className="glass-card"
                            style={{ padding: 'clamp(20px, 5vw, 32px)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                        >
                            <Link to={`/capsule/${capsule._id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{
                                    width: 'clamp(120px, 30vw, 180px)',
                                    height: 'clamp(120px, 30vw, 180px)',
                                    borderRadius: '24px',
                                    background: 'var(--neural-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0,
                                    margin: '0 auto'
                                }}>
                                    <Play size={clampSizeStatic(40, 64)} fill="currentColor" />
                                </div>
                                <div style={{ flex: 1, minWidth: 'min(100%, 300px)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '8px', fontWeight: 'bold' }}>
                                        <Heart size={20} fill="currentColor" />
                                        <span style={{ fontSize: '0.9rem' }}>Neural Reconstruction</span>
                                    </div>
                                    <h3 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '12px' }}>{capsule.title}</h3>
                                    <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {capsule.narrative}
                                    </p>
                                    <div style={{ marginTop: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <div style={{ background: 'var(--glass)', padding: '8px 16px', borderRadius: '100px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--glass-border)' }}>
                                            <ImageIcon size={18} />
                                            <span>{capsule.memories.length} Memories</span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteCapsule(e, capsule._id)}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                            <div style={{
                                position: 'absolute',
                                right: '-50px',
                                top: '-50px',
                                width: '150px',
                                height: '150px',
                                background: 'var(--primary)',
                                filter: 'blur(100px)',
                                opacity: 0.1
                            }} />
                        </motion.div>
                    ))}

                    {capsules.length === 0 && (
                        <div className="glass-card" style={{ padding: 'clamp(40px, 10vw, 100px)', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}>No capsules ready yet. Ask your caregiver to help create one!</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: 'clamp(40px, 8vw, 80px)', textAlign: 'center' }}>
                <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '16px 32px', width: 'auto', display: 'inline-flex' }}>
                    <ArrowLeft size={24} />
                    <span>Exit Patient View</span>
                </Link>
            </div>
        </div>
    );
};

export default PatientDashboard;
