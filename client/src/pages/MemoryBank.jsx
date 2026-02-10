import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Mic, FileText, Plus, ArrowLeft, Send, Video, File, Search, Trash2, MessageCircle, Sparkles, Film, X, Volume2, VolumeX } from 'lucide-react';
import MemoryChatbot from '../components/MemoryChatbot';

const MemoryBank = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [memories, setMemories] = useState([]);
    const [showUpload, setShowUpload] = useState(false);
    const [newMemory, setNewMemory] = useState({ title: '', description: '', type: 'image', dateOccurred: '', location: '', peopleInvolved: '' });
    const [file, setFile] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showChatbot, setShowChatbot] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const pRes = await axios.get(`/api/patients/${id}`);
            setPatient(pRes.data);
            const mRes = await axios.get(`/api/memories/patient/${id}`);
            setMemories(mRes.data);
        } catch (err) {
            console.error('Error fetching data');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('patient', id);
        formData.append('title', newMemory.title);
        formData.append('description', newMemory.description);
        formData.append('type', newMemory.type);
        formData.append('dateOccurred', newMemory.dateOccurred);
        formData.append('location', newMemory.location);
        formData.append('peopleInvolved', JSON.stringify(newMemory.peopleInvolved.split(',').map(s => s.trim()).filter(s => s)));
        if (file) formData.append('file', file);

        try {
            await axios.post('/api/memories', formData);
            setShowUpload(false);
            setNewMemory({ title: '', description: '', type: 'image', dateOccurred: '', location: '', peopleInvolved: '' });
            setFile(null);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert('Error uploading memory: ' + msg);
        }
    };

    const handleChatbotComplete = async (data, selectedFile) => {
        const formData = new FormData();
        formData.append('patient', id);
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('type', data.type);
        formData.append('dateOccurred', data.dateOccurred);
        formData.append('location', data.location);
        formData.append('peopleInvolved', JSON.stringify(data.peopleInvolved.split(',').map(s => s.trim()).filter(s => s)));
        if (selectedFile) formData.append('file', selectedFile);

        try {
            await axios.post('/api/memories', formData);
            setShowChatbot(false);
            fetchData();
        } catch (err) {
            alert('Error from AI Assistant: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleGenerateCapsule = async () => {
        if (memories.length === 0) return alert('Add some memories first!');
        setIsGenerating(true);
        try {
            const res = await axios.post('/api/capsules/generate', {
                patientId: id,
                memoryIds: memories.map(m => m._id),
                title: `Life Journey: ${patient.name}`
            });
            // Redirect to the new capsule view
            navigate(`/capsule/${res.data._id}`);
        } catch (err) {
            alert('Error generating capsule');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteMemory = async (memoryId) => {
        if (!window.confirm('Delete this memory fragment?')) return;
        try {
            await axios.delete(`/api/memories/${memoryId}`);
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            alert('Error deleting memory: ' + msg);
        }
    };

    const [showTimeLapse, setShowTimeLapse] = useState(false);
    const [timeLapseIndex, setTimeLapseIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);

    const speak = (text) => {
        if (isMuted || !text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    };

    const handleGenerateTimeLapse = () => {
        const imageMemories = memories.filter(m => m.type === 'image' && m.fileUrl);
        if (imageMemories.length === 0) return alert('No images found to generate time-lapse.');

        setShowTimeLapse(true);
        setTimeLapseIndex(0);
        // Clean up previous speech if any
        window.speechSynthesis.cancel();
    };

    useEffect(() => {
        let interval;
        if (showTimeLapse) {
            const imageMemories = memories.filter(m => m.type === 'image' && m.fileUrl);
            if (imageMemories.length > 0) {
                interval = setInterval(() => {
                    setTimeLapseIndex(prev => (prev + 1) % imageMemories.length);
                }, 5000); // 5 seconds for reading
            }
        }
        return () => clearInterval(interval);
    }, [showTimeLapse, memories]);

    useEffect(() => {
        if (showTimeLapse) {
            const imageMemories = memories.filter(m => m.type === 'image' && m.fileUrl);
            if (imageMemories[timeLapseIndex]) {
                const mem = imageMemories[timeLapseIndex];
                const text = `${mem.title}. ${mem.description || ''}. ${mem.dateOccurred ? 'On ' + new Date(mem.dateOccurred).toLocaleDateString() : ''}`;
                speak(text);
            }
        } else {
            window.speechSynthesis.cancel();
        }
    }, [timeLapseIndex, showTimeLapse, isMuted, memories]);


    const imageMemories = memories.filter(m => m.type === 'image' && m.fileUrl);

    if (!patient) return <div className="container">Loading...</div>;

    return (
        <div className="container" style={{ padding: '40px 24px' }}>
            <div style={{ marginBottom: '40px' }}>
                <Link to="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <ArrowLeft size={16} />
                    <span>Back to Dashboard</span>
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '8px' }}>Memory Bank</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Collecting fragments for <span style={{ color: 'white', fontWeight: 'bold' }}>{patient.name}</span></p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button onClick={handleGenerateTimeLapse} className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
                            <Film size={20} />
                            <span className="hide-on-mobile">Time-lapse</span>
                        </button>
                        <button onClick={() => setShowChatbot(true)} className="btn btn-secondary" style={{ flex: '1 1 auto', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(139, 92, 246, 0.1))', borderColor: 'var(--primary)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)', animation: 'shimmer 2s infinite' }}></div>
                            <Sparkles size={20} color="#38bdf8" />
                            <span className="hide-on-mobile" style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>Chat</span>
                            <span className="show-on-mobile" style={{ background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>AI Help</span>
                        </button>
                        <button onClick={() => setShowUpload(true)} className="btn btn-secondary" style={{ flex: '1 1 auto' }}>
                            <Plus size={20} />
                            <span className="hide-on-mobile">Add Memory</span>
                            <span className="show-on-mobile">Add</span>
                        </button>
                        <button onClick={handleGenerateCapsule} className="btn btn-primary" style={{ flex: '1 1 auto' }} disabled={isGenerating}>
                            <Send size={20} />
                            <span>{isGenerating ? 'Building...' : 'Capsule'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="glass-card" style={{ padding: 'min(5vw, 20px)', marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input
                        type="text"
                        placeholder="Search memories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['all', 'image', 'video', 'audio', 'text', 'file'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`btn ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '8px 16px', fontSize: '0.75rem', textTransform: 'capitalize', minWidth: '70px' }}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {memories
                    .filter(m => (filterType === 'all' || m.type === filterType) && (m.title.toLowerCase().includes(searchTerm.toLowerCase()) || m.description?.toLowerCase().includes(searchTerm.toLowerCase())))
                    .map((memory) => (
                        <motion.div
                            key={memory._id}
                            whileHover={{ scale: 1.02 }}
                            className="glass-card"
                            style={{ overflow: 'hidden', height: 'fit-content' }}
                        >
                            {memory.fileUrl && memory.type === 'image' && (
                                <img src={`${memory.fileUrl}`} alt={memory.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            )}
                            {memory.fileUrl && memory.type === 'video' && (
                                <video src={`${memory.fileUrl}`} style={{ width: '100%', height: '200px', objectFit: 'cover' }} muted />
                            )}
                            {memory.fileUrl && memory.type === 'file' && (
                                <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <File size={48} opacity={0.3} />
                                </div>
                            )}
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                    <TypeIcon type={memory.type} />
                                    <h4 style={{ fontSize: '1.1rem', flex: 1 }}>{memory.title}</h4>
                                    <button
                                        onClick={() => handleDeleteMemory(memory._id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', opacity: 0.6 }}
                                        onMouseEnter={(e) => e.target.style.opacity = 1}
                                        onMouseLeave={(e) => e.target.style.opacity = 0.6}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>{memory.description}</p>

                                {memory.type === 'audio' && memory.fileUrl && (
                                    <div style={{ marginBottom: '12px' }}>
                                        <audio controls style={{ width: '100%', height: '32px' }}>
                                            <source src={`${memory.fileUrl}`} type="audio/mpeg" />
                                        </audio>
                                    </div>
                                )}

                                {memory.location && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '4px' }}>
                                        📍 {memory.location}
                                    </div>
                                )}

                                {memory.peopleInvolved && memory.peopleInvolved.length > 0 && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                        👥 {memory.peopleInvolved.join(', ')}
                                    </div>
                                )}

                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                                    <span>{memory.dateOccurred ? new Date(memory.dateOccurred).toLocaleDateString() : 'No date'}</span>
                                    <span style={{ textTransform: 'capitalize' }}>{memory.type}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                {memories.length === 0 && (
                    <div className="glass-card" style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', opacity: 0.6 }}>
                        <ImageIcon size={48} style={{ marginBottom: '16px' }} />
                        <p>Your memory bank is empty. Start by uploading photos or voice notes.</p>
                    </div>
                )}
            </div>

            {/* Time-lapse Modal */}
            {showTimeLapse && (
                <div style={{ position: 'fixed', inset: 0, background: 'black', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 2010 }}>
                        <button
                            onClick={() => {
                                if (!isMuted) window.speechSynthesis.cancel();
                                setIsMuted(!isMuted);
                            }}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                        </button>
                        <button
                            onClick={() => {
                                setShowTimeLapse(false);
                                window.speechSynthesis.cancel();
                            }}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {imageMemories[timeLapseIndex] && (
                            <motion.div
                                key={timeLapseIndex}
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <img
                                    src={imageMemories[timeLapseIndex].fileUrl}
                                    alt="Time-lapse"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                                <div style={{ position: 'absolute', bottom: '40px', left: '0', right: '0', textAlign: 'center', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '40px 20px' }}>
                                    <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>{imageMemories[timeLapseIndex].title}</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>
                                        {imageMemories[timeLapseIndex].dateOccurred ? new Date(imageMemories[timeLapseIndex].dateOccurred).toLocaleDateString() : 'Unknown Date'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Upload Modal */}
            {showUpload && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="glass-card"
                        style={{ padding: '40px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Add New Memory</h2>
                            <button onClick={() => setShowUpload(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                <Plus size={32} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                    required
                                    placeholder="Enter a descriptive title..."
                                    value={newMemory.title}
                                    onChange={e => setNewMemory({ ...newMemory, title: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    placeholder="Tell the story behind this memory..."
                                    value={newMemory.description}
                                    onChange={e => setNewMemory({ ...newMemory, description: e.target.value })}
                                    className="input-field"
                                    rows="3"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Type</label>
                                    <select value={newMemory.type} onChange={e => setNewMemory({ ...newMemory, type: e.target.value })} className="input-field">
                                        <option value="image">Photo</option>
                                        <option value="video">Video</option>
                                        <option value="audio">Audio</option>
                                        <option value="text">Note</option>
                                        <option value="file">File</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Date (Optional)</label>
                                    <input type="date" value={newMemory.dateOccurred} onChange={e => setNewMemory({ ...newMemory, dateOccurred: e.target.value })} className="input-field" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Location</label>
                                    <input value={newMemory.location} onChange={e => setNewMemory({ ...newMemory, location: e.target.value })} className="input-field" placeholder="e.g. Central Park" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">People (comma separated)</label>
                                    <input value={newMemory.peopleInvolved} onChange={e => setNewMemory({ ...newMemory, peopleInvolved: e.target.value })} className="input-field" placeholder="e.g. Mom, Dad" />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '32px' }}>
                                <label className="form-label">File attachment</label>
                                <div className="file-upload-wrapper">
                                    <div className="file-upload-label">
                                        <Upload size={24} />
                                        <span>{file ? 'File selected' : 'Click to select or drag file'}</span>
                                        <input
                                            type="file"
                                            className="file-upload-input"
                                            onChange={e => setFile(e.target.files[0])}
                                            accept={newMemory.type === 'image' ? 'image/*' : newMemory.type === 'video' ? 'video/*' : newMemory.type === 'audio' ? 'audio/*' : '*'}
                                        />
                                    </div>
                                    {file && <div className="file-name-display">Selected: {file.name}</div>}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={() => setShowUpload(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', height: '56px' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', height: '56px' }}>
                                    <Upload size={20} />
                                    <span>Upload Memory</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* AI Chatbot Assistant */}
            <MemoryChatbot
                isOpen={showChatbot}
                onClose={() => setShowChatbot(false)}
                patientName={patient ? patient.name : 'Patient'}
                onComplete={handleChatbotComplete}
            />
        </div>
    );
};

const TypeIcon = ({ type }) => {
    switch (type) {
        case 'image': return <ImageIcon size={20} color="#8b5cf6" />;
        case 'video': return <Video size={20} color="#f59e0b" />;
        case 'audio': return <Mic size={20} color="#ec4899" />;
        case 'text': return <FileText size={20} color="#10b981" />;
        case 'file': return <File size={20} color="#6b7280" />;
        default: return <ImageIcon size={20} />;
    }
};

export default MemoryBank;
