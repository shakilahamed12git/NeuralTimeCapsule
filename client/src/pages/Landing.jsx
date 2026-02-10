import { motion } from 'framer-motion';
import { Camera, Music, FileText, Heart, Shield, Sparkles, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="container">
            <header style={{
                textAlign: 'center',
                padding: 'clamp(60px, 10vh, 100px) 0 60px',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '100px',
                        color: 'var(--primary)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginBottom: '24px'
                    }}>
                        <Sparkles size={16} />
                        <span>AI-Powered Memory Reconstruction</span>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                        marginBottom: '24px',
                        lineHeight: '1.1'
                    }}>
                        Preserving Memories, <span style={{ background: 'var(--neural-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>One Neural Capsule</span> at a Time.
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.1rem, 3vw, 1.25rem)',
                        color: 'var(--text-secondary)',
                        marginBottom: '40px'
                    }}>
                        A compassionate bridge between technology and Alzheimer's care, helping patients reconnect with their past through AI-curated sensory experiences.
                    </p>
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Link to="/recall-game" className="btn btn-primary" style={{ padding: '16px 32px', minWidth: '200px' }}>
                            <Brain size={20} />
                            Start Daily Game
                        </Link>
                        <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '16px 32px', minWidth: '200px' }}>Explore Dashboard</Link>
                    </div>
                </motion.div>
            </header>

            <section className="responsive-grid" style={{ padding: '40px 0' }}>
                <FeatureCard
                    icon={<Camera size={24} />}
                    title="Visual Anchors"
                    description="Sync personal photos to reconstruct visual timelines of important life events."
                />
                <FeatureCard
                    icon={<Music size={24} />}
                    title="Auditory Echoes"
                    description="Preserve voice recordings and favorite melodies that trigger deep emotional recall."
                />
                <FeatureCard
                    icon={<FileText size={24} />}
                    title="AI Narratives"
                    description="Our neural engine weaves fragmented memories into cohesive, emotional stories."
                />
            </section>

            <section className="glass-card" style={{
                padding: 'clamp(30px, 8vw, 60px)',
                textAlign: 'center',
                marginTop: '60px',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--primary)'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Brain size={48} color="var(--primary)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '16px' }}>Neural Exercise Mode</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto 32px', color: 'var(--text-secondary)' }}>
                        Interactive cognitive training through personalized memories and daily recall challenges.
                    </p>
                    <Link to="/recall-game" className="btn btn-primary" style={{ padding: '16px 40px', width: 'auto' }}>
                        Play Daily Recall Game
                    </Link>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-10%',
                    width: '120%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
                    zIndex: 0
                }}></div>
            </section>

            <section className="glass-card" style={{
                padding: 'clamp(30px, 8vw, 60px)',
                textAlign: 'center',
                marginTop: '60px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <Heart size={48} color="var(--secondary)" style={{ marginBottom: '20px' }} />
                    <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '16px' }}>Built for Care, Science Based</h2>
                    <p style={{ maxWidth: '600px', margin: '0 auto 32px', color: 'var(--text-secondary)' }}>
                        Designed specifically for individuals with cognitive impairment, featuring simplified interfaces and sensory-rich interactions.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(20px, 5vw, 40px)', flexWrap: 'wrap' }}>
                        <Metric icon={<Shield size={20} />} label="Secure & Private" />
                        <Metric icon={<Heart size={20} />} label="Family Centric" />
                        <Metric icon={<Sparkles size={20} />} label="AI Assisted" />
                    </div>
                </div>
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-10%',
                    width: '120%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    zIndex: 0
                }}></div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <motion.div
        whileHover={{ y: -10 }}
        className="glass-card"
        style={{ padding: 'clamp(24px, 5vw, 40px)', textAlign: 'left' }}
    >
        <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            color: 'var(--primary)'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '12px' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{description}</p>
    </motion.div>
);

const Metric = ({ icon, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
        {icon}
        <span>{label}</span>
    </div>
);

export default Landing;
