import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, ChevronLeft, ChevronRight, Music, Heart, Video, MessageCircle, Sparkles, Volume2, VolumeX, ClipboardList, Activity } from 'lucide-react';

const CapsuleViewer = () => {
    const { id } = useParams();
    const [capsule, setCapsule] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const clampSize = (min, max) => {
        if (windowWidth < 640) return min;
        if (windowWidth > 1024) return max;
        return min + (max - min) * ((windowWidth - 640) / (1024 - 640));
    };
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [showReport, setShowReport] = useState(true);
    const speechRef = useRef(null);

    useEffect(() => {
        fetchCapsule();
    }, [id]);

    useEffect(() => {
        if (showReport && capsule?.narrative && isVoiceEnabled) {
            speak(`Analysis Complete. ${capsule.narrative}`);
        }
    }, [showReport, capsule, isVoiceEnabled]);

    useEffect(() => {
        let interval;
        if (isPlaying && capsule?.memories?.length > 0 && !showReport) {
            interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % capsule.memories.length);
            }, 8000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, capsule, showReport]);

    useEffect(() => {
        if (capsule?.memories?.[currentIndex] && !showReport) {
            const memory = capsule.memories[currentIndex];
            const name = capsule.title.split(':').pop().trim();
            const question = getAIQuestion(memory);
            const fullText = `Hey ${name}, do you remember this moment? ${question}`;
            setCurrentQuestion(fullText);

            if (isVoiceEnabled) {
                speak(fullText);
            }
        }
    }, [currentIndex, capsule, isVoiceEnabled, showReport]);

    const speak = (text) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
    };

    const fetchCapsule = async () => {
        try {
            const res = await axios.get(`/api/capsules/${id}`);
            setCapsule(res.data);
        } catch (err) {
            console.error('Error fetching capsule');
        }
    };

    if (!capsule) return <div className="container">Loading Experience...</div>;

    if (showReport) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0a0c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Outfit', sans-serif" }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ maxWidth: '800px', width: '100%', padding: 'clamp(20px, 5vw, 48px)', position: 'relative', overflow: 'hidden', border: '1px solid var(--primary)' }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'var(--neural-gradient)' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'var(--neural-gradient)', padding: '12px', borderRadius: '15px' }}>
                            <ClipboardList size={32} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: 'bold', margin: 0 }}>Neural Reconstruction Report</h1>
                            <p style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>AI-Generated Insights</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '24px', marginBottom: '40px' }}>
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Analysis Subject</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{capsule.title.split(':').pop().trim()}</div>
                        </div>
                        <div style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Neural Fragments</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{capsule.memories.length} Successive Links</div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '40px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '16px' }}>
                            <Activity size={20} /> AI Synthesis Summary
                        </h3>
                        <p style={{ fontSize: '1.4rem', lineHeight: '1.6', color: '#e2e8f0', background: 'rgba(99, 102, 241, 0.1)', padding: '32px', borderRadius: '24px', borderLeft: '4px solid var(--primary)' }}>
                            {capsule.narrative}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => {
                                setShowReport(false);
                                setIsPlaying(true);
                            }}
                            className="btn btn-primary"
                            style={{ flex: 1, minWidth: '200px', height: '70px', fontSize: '1.2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)' }}
                        >
                            <Play size={24} fill="currentColor" />
                            <span>Begin Life Journey</span>
                        </button>
                        <Link
                            to={`/patient-dashboard/${capsule.patient}`}
                            className="btn btn-secondary"
                            style={{ padding: '0 32px', minWidth: '100px', height: '70px', borderRadius: '20px', flex: '0 0 auto' }}
                        >
                            Exit
                        </Link>
                    </div>
                </motion.div>

                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '10%', right: '5%', opacity: 0.1 }}>
                    <Sparkles size={120} color="var(--primary)" />
                </div>
                <div style={{ position: 'absolute', bottom: '10%', left: '5%', opacity: 0.1 }}>
                    <Heart size={100} color="var(--secondary)" />
                </div>
            </div>
        );
    }

    const currentMemory = capsule.memories[currentIndex];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'black',
            color: 'white',
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Outfit', sans-serif"
        }}>
            {/* Background Ambience */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                opacity: 0.3,
                overflow: 'hidden'
            }}>
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    style={{
                        width: '150%',
                        height: '150%',
                        background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                        position: 'absolute',
                        top: '-25%',
                        left: '-25%'
                    }}
                />
            </div>

            <header style={{ padding: 'clamp(16px, 4vw, 32px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, flexWrap: 'wrap', gap: '20px' }}>
                <Link to={`/patient-dashboard/${capsule.patient}`} style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'clamp(1rem, 3vw, 1.25rem)' }}>
                    <ArrowLeft size={32} />
                    <span className="hide-on-mobile">Exit Capsule</span>
                </Link>
                <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
                    <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', margin: 0 }}>{capsule.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Memory {currentIndex + 1} of {capsule.memories.length}</p>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        style={{ background: 'var(--glass)', border: 'none', color: 'white', padding: '12px', borderRadius: '50%', cursor: 'pointer' }}
                    >
                        {isVoiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                </div>
            </header>

            <main style={{ flex: 1, display: 'flex', position: 'relative', zIndex: 10, padding: '0 clamp(16px, 4vw, 64px) 64px', overflowY: 'auto' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px', justifyContent: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
                        gap: 'clamp(20px, 5vw, 64px)',
                        alignItems: 'center'
                    }}>
                        {/* Visual Part */}
                        <div style={{ position: 'relative' }}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentMemory._id}
                                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -50, scale: 1.1 }}
                                    transition={{ duration: 1 }}
                                    style={{ width: '100%', aspectRatio: '4/3', borderRadius: '40px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    {currentMemory.fileUrl ? (
                                        currentMemory.type === 'video' ? (
                                            <video src={`${currentMemory.fileUrl}`} autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <img src={`${currentMemory.fileUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'var(--glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Heart size={80} color="var(--secondary)" opacity={0.2} />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Narrative Part */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <motion.div
                                key={`story-${currentIndex}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary)', marginBottom: '16px', fontSize: 'clamp(1rem, 3vw, 1.25rem)', fontWeight: 'bold' }}>
                                    <Music size={24} />
                                    <span>Neural Reconstruction</span>
                                </div>
                                <h3 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', marginBottom: '12px' }}>{currentMemory.title}</h3>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                    {currentMemory.dateOccurred && (
                                        <div style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>🗓️ {new Date(currentMemory.dateOccurred).toLocaleDateString()}</div>
                                    )}
                                    {currentMemory.location && (
                                        <div style={{ color: 'var(--primary)', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>📍 {currentMemory.location}</div>
                                    )}
                                </div>

                                <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', lineHeight: '1.6', color: '#e2e8f0', marginBottom: '24px' }}>
                                    {currentMemory.description}
                                </p>

                                {currentMemory.peopleInvolved && currentMemory.peopleInvolved.length > 0 && (
                                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'inline-block' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>With: </span>
                                        <span style={{ fontWeight: 'bold' }}>{currentMemory.peopleInvolved.join(', ')}</span>
                                    </div>
                                )}
                            </motion.div>

                            <div
                                className="glass-card"
                                style={{
                                    padding: '32px',
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid var(--primary)',
                                    position: 'relative',
                                    borderRadius: '24px'
                                }}
                            >
                                <div style={{ position: 'absolute', top: '-15px', right: '20px', background: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <Sparkles size={14} /> AI VOICE ASSISTANT
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '12px' }}>
                                            {currentQuestion.split('?')[0]}?
                                        </p>
                                        <p style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', color: '#cbd5e1', fontStyle: 'italic' }}>
                                            {currentQuestion.split('?')[1]}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => speak(currentQuestion)}
                                        style={{ background: 'var(--primary)', border: 'none', color: 'white', padding: '10px', borderRadius: '12px', cursor: 'pointer', marginLeft: '20px' }}
                                        title="Replay Voice"
                                    >
                                        <Volume2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer style={{ padding: 'clamp(16px, 4vw, 32px) clamp(16px, 4vw, 64px)', background: 'linear-gradient(to top, black, transparent)', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(20px, 10vw, 64px)' }}>
                    <button
                        onClick={() => setCurrentIndex(prev => (prev - 1 + capsule.memories.length) % capsule.memories.length)}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        <ChevronLeft size={clampSize(40, 64)} />
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{
                            width: 'clamp(60px, 15vw, 100px)',
                            height: 'clamp(60px, 15vw, 100px)',
                            borderRadius: '50%',
                            background: 'var(--neural-gradient)',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        {isPlaying ? <Pause size={clampSize(24, 48)} fill="currentColor" /> : <Play size={clampSize(24, 48)} fill="currentColor" style={{ marginLeft: '8px' }} />}
                    </button>

                    <button
                        onClick={() => setCurrentIndex(prev => (prev + 1) % capsule.memories.length)}
                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                    >
                        <ChevronRight size={clampSize(40, 64)} />
                    </button>
                </div>
            </footer>
        </div>
    );
};

const getAIQuestion = (memory) => {
    const questions = [
        `Does looking at this ${memory.type} from ${memory.location || 'the past'} bring back any memories or feelings?`,
        `I see ${memory.peopleInvolved?.length > 0 ? memory.peopleInvolved.join(' and ') : 'some familiar faces'} here. Can you tell me more about them?`,
        `This moment was titled ${memory.title}. Do you remember what you were doing when this happened?`,
        `What do you think was the most beautiful part of this day?`,
        `Does this photo remind you of any other stories you'd like to share?`,
        "Take a deep breath and look closely. What do you smell or hear in this memory?",
        "If you could go back to this exact moment for five minutes, what would you say to the people there?"
    ];
    return questions[Math.floor(Math.random() * questions.length)];
};

export default CapsuleViewer;
