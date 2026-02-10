
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity, FileText, Plus, Search, Thermometer,
    TrendingUp, Shield, AlertCircle, Heart, ArrowRight, Brain, Globe, Database
} from 'lucide-react';

const AI_ANALYSIS_URL = '/neural-analysis';
const MEDICAL_DB_URL = '/flask-api';

const MedicalDashboard = () => {
    const [activeTab, setActiveTab] = useState('patients'); // patients, recommendations, analysis, research
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    // ... rest of state stays same ...
    const [treatments, setTreatments] = useState([]);
    const [medicines, setMedicines] = useState([]);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);

    // Form States
    const [showAddPatient, setShowAddPatient] = useState(false);
    const [showAddTreatment, setShowAddTreatment] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Male', disease_stage: 'Early' });
    const [newTreatment, setNewTreatment] = useState({ medicine_id: '', improvement_percent: 50, doctor_notes: '' });
    const [selectedStage, setSelectedStage] = useState('Early');
    const [researchData, setResearchData] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const mongoId = queryParams.get('mongoId');
        const name = queryParams.get('name');
        const stage = queryParams.get('stage');

        const initializeFlow = async () => {
            await fetchPatients();
            await fetchMedicines();

            if (mongoId && name) {
                setActiveTab('analysis');
                handleProgressionAnalysis(mongoId, name, stage);
            }
        };

        initializeFlow();
    }, []);

    const handleProgressionAnalysis = async (mongoId, name, stage) => {
        setAnalyzing(true);
        console.log(`Starting analysis for ${name} (${mongoId}) - Stage: ${stage}`);
        try {
            // 1. Fetch memories
            console.log("Fetching fragments...");
            const memoryRes = await axios.get(`/api/memories/patient/${mongoId}`);
            console.log("Memories received:", memoryRes.data.length);

            // 2. Fetch capsules
            console.log("Fetching journey capsules...");
            const capsuleRes = await axios.get(`/api/capsules/patient/${mongoId}`);
            console.log("Capsules received:", capsuleRes.data.length);

            const historical_reports = capsuleRes.data.map(c => c.narrative);
            const current_observations = memoryRes.data.map(m => m.description);

            // 3. AI Analysis
            console.log("Calling AI Model (Flask:5001)...");
            const analysisRes = await axios.post(`${AI_ANALYSIS_URL}`, {
                patient_name: name,
                stage: stage,
                historical_reports,
                current_observations
            });
            console.log("AI Analysis Complete");

            setAnalysisData(analysisRes.data);

            // 4. Auto-sync check
            // We use name as a fallback key for demo
            try {
                const freshPatientsRes = await axios.get(`${MEDICAL_DB_URL}/patients`);
                const existing = freshPatientsRes.data.find(p => p.name === name);
                if (!existing) {
                    console.log("New patient to Medical hub, syncing...");
                    const syncRes = await axios.post(`${MEDICAL_DB_URL}/patients`, {
                        name,
                        age: 70,
                        gender: 'Male',
                        disease_stage: stage || 'Middle'
                    });
                    setSelectedPatient(syncRes.data);
                } else {
                    setSelectedPatient(existing);
                }
                fetchPatients();
            } catch (err) {
                console.warn("Medical DB sync failed, but analysis is shown:", err);
            }

        } catch (err) {
            console.error("ANALYSIS FLOW FAILED:", err);
            const errorMsg = err.response?.data?.message || err.message;
            const isNetworkError = !err.response;
            alert(`Neural Research failed: ${errorMsg}. ${isNetworkError ? "Check if AI Server (5001) is running and accessible." : ""}`);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        if (selectedPatient) {
            fetchTreatments(selectedPatient.id);
        }
    }, [selectedPatient]);

    useEffect(() => {
        if (activeTab === 'recommendations') {
            fetchRecommendations(selectedStage);
        } else if (activeTab === 'research') {
            fetchResearchData();
        }
    }, [activeTab, selectedStage]);

    const fetchPatients = async () => {
        try {
            const res = await axios.get(`${MEDICAL_DB_URL}/patients`);
            setPatients(res.data);
        } catch (err) { console.error("Error fetching patients", err); }
    };

    const fetchResearchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${MEDICAL_DB_URL}/research/alzheimers`);
            setResearchData(res.data);
        } catch (err) { console.error("Error fetching research", err); }
        finally { setLoading(false); }
    };

    const fetchMedicines = async () => {
        try {
            const res = await axios.get(`${MEDICAL_DB_URL}/medicines`);
            setMedicines(res.data);
        } catch (err) { console.error("Error fetching medicines", err); }
    };

    const fetchTreatments = async (patientId) => {
        try {
            const res = await axios.get(`${MEDICAL_DB_URL}/treatments/patient/${patientId}`);
            setTreatments(res.data);
        } catch (err) { console.error("Error fetching treatments", err); }
    };

    const fetchRecommendations = async (stage) => {
        setLoading(true);
        try {
            const res = await axios.get(`${MEDICAL_DB_URL}/recommendations/${stage}`);
            setRecommendations(res.data);
        } catch (err) { console.error("Error fetching recommendations", err); }
        finally { setLoading(false); }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        try {
            const patientPayload = { ...newPatient, age: parseInt(newPatient.age) };
            await axios.post(`${MEDICAL_DB_URL}/patients`, patientPayload);
            setShowAddPatient(false);
            setNewPatient({ name: '', age: '', gender: 'Male', disease_stage: 'Early' });
            fetchPatients();
        } catch (err) {
            console.error("Add patient error:", err);
            alert('Failed to add patient: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleAddTreatment = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${MEDICAL_DB_URL}/treatments`, {
                ...newTreatment,
                patient_id: selectedPatient.id
            });
            setShowAddTreatment(false);
            setNewTreatment({ medicine_id: '', improvement_percent: 50, doctor_notes: '' });
            fetchTreatments(selectedPatient.id);
        } catch (err) { alert('Failed to add treatment'); }
    };

    return (
        <div className="container" style={{ padding: 'clamp(20px, 5vw, 40px) 16px', maxWidth: '1400px' }}>
            <header style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Activity size={40} color="var(--primary)" />
                    Medical Intelligence Hub
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>AI-Driven Treatment Analysis & Recommendations</p>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
                gridAutoFlow: 'row',
                gap: '30px',
                alignItems: 'start'
            }}>
                {/* Sidebar - Make it horizontal on small screens if needed, but here we let it wrap */}
                <div className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
                    <div
                        onClick={() => setActiveTab('patients')}
                        style={{
                            padding: '15px',
                            borderRadius: '12px',
                            marginBottom: '10px',
                            cursor: 'pointer',
                            background: activeTab === 'patients' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'patients' ? 'white' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Search size={20} />
                        <span style={{ fontWeight: 600 }}>Patient Records</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('recommendations')}
                        style={{
                            padding: '15px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: activeTab === 'recommendations' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'recommendations' ? 'white' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Brain size={20} />
                        <span style={{ fontWeight: 600 }}>AI Recommendations</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('research')}
                        style={{
                            padding: '15px',
                            borderRadius: '12px',
                            marginTop: '10px',
                            cursor: 'pointer',
                            background: activeTab === 'research' ? 'var(--primary)' : 'transparent',
                            color: activeTab === 'research' ? 'white' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.3s'
                        }}
                    >
                        <Globe size={20} />
                        <span style={{ fontWeight: 600 }}>Global Insights</span>
                    </div>
                    <div
                        onClick={() => setActiveTab('analysis')}
                        style={{
                            padding: '15px',
                            borderRadius: '12px',
                            marginTop: '10px',
                            cursor: 'pointer',
                            background: activeTab === 'analysis' ? 'var(--neural-gradient)' : 'transparent',
                            color: activeTab === 'analysis' ? 'white' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.3s',
                            boxShadow: activeTab === 'analysis' ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none'
                        }}
                    >
                        <Activity size={20} />
                        <span style={{ fontWeight: 600 }}>Neural Progression</span>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ minHeight: '600px' }}>
                    {activeTab === 'analysis' ? (
                        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 40px)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <Brain size={32} color="var(--primary)" />
                                        Cognitive Trend Analysis
                                    </h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>Comparing {analysisData ? 'Historical Data' : 'Neural Fragments'} with Recent Observations</p>
                                </div>
                                {analysisData && (
                                    <div style={{
                                        padding: '10px 20px',
                                        borderRadius: '30px',
                                        background: analysisData.cognitive_status === 'Declining' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                        border: `1px solid ${analysisData.cognitive_status === 'Declining' ? '#ef4444' : '#10b981'}`,
                                        color: analysisData.cognitive_status === 'Declining' ? '#ef4444' : '#10b981',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center', gap: '8px'
                                    }}>
                                        <TrendingUp size={16} />
                                        Status: {analysisData.cognitive_status}
                                    </div>
                                )}
                            </div>

                            {analyzing ? (
                                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                    <div className="neural-shimmer" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 24px' }}></div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>AI Medical Reasoning...</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Cross-referencing memory fragments and time-capsule narratives</p>
                                </div>
                            ) : analysisData ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'grid', gap: '30px' }}>
                                    <div style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', borderLeft: '5px solid var(--primary)' }}>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>Core Analysis Summary</h4>
                                        <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#e2e8f0' }}>{analysisData.progression_summary}</p>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
                                        <div className="glass-card" style={{ padding: '24px', background: 'rgba(0,0,0,0.2)' }}>
                                            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)' }}>
                                                <AlertCircle size={20} /> Key Cognitive Findings
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {analysisData.key_findings.map((f, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '10px', color: '#cbd5e1' }}>
                                                        <span style={{ color: 'var(--accent)' }}>•</span> {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="glass-card" style={{ padding: '24px', background: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                                            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#4ade80' }}>
                                                <Heart size={20} /> Caregiver Recommendations
                                            </h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {analysisData.caregiver_recommendations.map((r, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '10px', color: '#cbd5e1' }}>
                                                        <span style={{ color: '#4ade80' }}>✓</span> {r}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '24px',
                                        background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1), transparent)',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px'
                                    }}>
                                        <div style={{ background: 'var(--primary)', padding: '12px', borderRadius: '12px' }}>
                                            <FileText size={24} color="white" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Recommended Medical Focus for Next Visit</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>{analysisData.medical_focus}</div>
                                        </div>
                                    </div>

                                    {analysisData.matched_records && (
                                        <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--accent)' }}>
                                            <h4 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent)' }}>
                                                <Database size={20} /> Matched Historical Records
                                            </h4>
                                            <div style={{ marginBottom: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                This patient matches a record in our primary medical database.
                                            </div>
                                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <div><strong>Name:</strong> {analysisData.matched_records.patient_details.name}</div>
                                                    <div><strong>Stage:</strong> {analysisData.matched_records.patient_details.disease_stage}</div>
                                                    <div><strong>Age:</strong> {analysisData.matched_records.patient_details.age}</div>
                                                    <div><strong>Gender:</strong> {analysisData.matched_records.patient_details.gender}</div>
                                                </div>
                                            </div>

                                            {analysisData.matched_records.treatments && analysisData.matched_records.treatments.length > 0 ? (
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead>
                                                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                                                            <th style={{ textAlign: 'left', padding: '10px' }}>Medicine</th>
                                                            <th style={{ textAlign: 'left', padding: '10px' }}>Improvement</th>
                                                            <th style={{ textAlign: 'left', padding: '10px' }}>Notes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {analysisData.matched_records.treatments.map((t, idx) => (
                                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <td style={{ padding: '10px' }}>{t.medicine_name}</td>
                                                                <td style={{ padding: '10px', color: t.improvement_percent > 50 ? '#4ade80' : '#f87171' }}>{t.improvement_percent}%</td>
                                                                <td style={{ padding: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.doctor_notes}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div style={{ fontStyle: 'italic', opacity: 0.6 }}>No past treatments recorded for this patient profile.</div>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '100px 0', opacity: 0.5 }}>
                                    <Activity size={48} style={{ marginBottom: '20px' }} />
                                    <p>Select a patient from the Dashboard to analyze their progression.</p>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'patients' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', transition: 'all 0.5s' }}>
                            {/* Patient List */}
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>Patients</h3>
                                    <button onClick={() => setShowAddPatient(true)} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                                        <Plus size={16} /> Add
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {patients.map(p => (
                                        <motion.div
                                            key={p.id}
                                            whileHover={{ x: 5 }}
                                            onClick={() => setSelectedPatient(p)}
                                            style={{
                                                padding: '15px',
                                                borderRadius: '12px',
                                                background: selectedPatient?.id === p.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                                border: selectedPatient?.id === p.id ? '1px solid var(--primary)' : '1px solid transparent',
                                                cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.disease_stage} • {p.age} yrs</div>
                                            </div>
                                            <ArrowRight size={16} color="var(--text-secondary)" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Patient Details & Treatments */}
                            {selectedPatient && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-card"
                                    style={{ padding: '24px' }}
                                >
                                    <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px', marginBottom: '15px' }}>
                                        <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{selectedPatient.name}</h2>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <span style={{ background: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                                {selectedPatient.disease_stage} Stage
                                            </span>
                                            <span style={{ background: 'var(--glass)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                                                {selectedPatient.gender}
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h4>Treatment History</h4>
                                        <button onClick={() => setShowAddTreatment(true)} className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                                            Record Outcome
                                        </button>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {treatments.length === 0 ? (
                                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>No treatments recorded yet.</p>
                                        ) : (
                                            treatments.map(t => (
                                                <div key={t.id} style={{ marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                                        <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{t.medicine_name}</span>
                                                        <span style={{
                                                            color: t.improvement_percent > 50 ? '#4ade80' : '#f87171',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {t.improvement_percent}% Impr
                                                        </span>
                                                    </div>
                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.doctor_notes}</p>
                                                    <div style={{ fontSize: '0.75rem', marginTop: '5px', opacity: 0.6 }}>{new Date(t.start_date).toLocaleDateString()}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : activeTab === 'research' ? (
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                <Globe size={32} color="#38bdf8" />
                                <div>
                                    <h2 style={{ fontSize: '2rem' }}>Global Alzheimer's Data</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>Live insights powered by Gemini AI Analysis</p>
                                </div>
                            </div>

                            {loading || !researchData ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Fetching latest research data...</div>
                                    <div style={{ color: 'var(--text-secondary)' }}>Connecting to global medical knowledge base</div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    {/* Stats Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                                            <div style={{ color: '#38bdf8', fontSize: '0.9rem', marginBottom: '5px' }}>Global Prevalence</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{researchData.global_prevalence}</div>
                                        </div>
                                        <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                                            <div style={{ color: '#f43f5e', fontSize: '0.9rem', marginBottom: '5px' }}>Projected Growth</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{researchData.projected_growth}</div>
                                        </div>
                                    </div>

                                    {/* Key Statistics */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '24px', borderRadius: '16px' }}>
                                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <TrendingUp size={20} /> Key Statistics
                                        </h3>
                                        <ul style={{ display: 'grid', gap: '12px' }}>
                                            {researchData.key_statistics?.map((stat, i) => (
                                                <li key={i} style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)' }}>
                                                    <span style={{ color: 'var(--primary)' }}>•</span> {stat}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Breakthroughs */}
                                    <div>
                                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Shield size={20} /> Recent Breakthroughs
                                        </h3>
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {researchData.recent_breakthroughs?.map((item, i) => (
                                                <motion.div
                                                    key={i}
                                                    whileHover={{ x: 5 }}
                                                    style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.1)' }}
                                                >
                                                    <h4 style={{ color: '#34d399', marginBottom: '5px', fontSize: '1.1rem' }}>{item.title}</h4>
                                                    <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{item.summary}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: 'clamp(20px, 5vw, 30px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                                <div>
                                    <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', marginBottom: '10px' }}>Recommendation Engine</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>Select disease stage to view optimal treatment paths.</p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {['Early', 'Middle', 'Severe'].map(stage => (
                                        <button
                                            key={stage}
                                            onClick={() => setSelectedStage(stage)}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '30px',
                                                border: 'none',
                                                background: selectedStage === stage ? 'var(--primary)' : 'var(--glass)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s'
                                            }}
                                        >
                                            {stage}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {loading ? (
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="glass-card neural-shimmer" style={{ height: '120px', opacity: 0.3 }}></div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    {recommendations?.recommendations?.map((rec, index) => (
                                        <motion.div
                                            key={rec.medicine_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '24px',
                                                borderRadius: '16px',
                                                border: index === 0 ? '1px solid var(--accent)' : '1px solid transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '24px'
                                            }}
                                        >
                                            <div style={{
                                                width: '60px', height: '60px', borderRadius: '50%',
                                                background: index === 0 ? 'var(--accent)' : 'var(--glass)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '1.5rem', fontWeight: 'bold'
                                            }}>
                                                #{index + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                    <h3 style={{ fontSize: '1.3rem' }}>{rec.medicine_name}</h3>
                                                    {index === 0 && <span style={{ background: 'var(--accent)', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', color: 'black', fontWeight: 'bold' }}>TOP CHOICE</span>}
                                                </div>
                                                <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>{rec.description}</p>
                                                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem' }}>
                                                    <span style={{ color: '#4ade80' }}>★ {rec.average_improvement}% Avg. Improvement</span>
                                                    <span style={{ opacity: 0.6 }}>Based on {rec.treatment_count} records</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'center', padding: '0 20px' }}>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>Confidence</div>
                                                <div style={{
                                                    color: rec.confidence_level === 'High' ? '#4ade80' : rec.confidence_level === 'Moderate' ? '#facc15' : '#f87171',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {rec.confidence_level}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {recommendations?.recommendations?.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            No data available for this stage yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '10px', display: 'flex', gap: '10px' }}>
                                <AlertCircle size={20} color="#eab308" />
                                <p style={{ fontSize: '0.9rem', color: '#eab308' }}>
                                    {recommendations?.disclaimer || "Disclaimer: This is an AI prototype. Always consult a specialist."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(showAddPatient || showAddTreatment) && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card"
                            style={{ padding: '30px', width: '400px' }}
                        >
                            <h2 style={{ marginBottom: '20px' }}>{showAddPatient ? 'Add Patient' : 'Record Outcome'}</h2>
                            <form onSubmit={showAddPatient ? handleAddPatient : handleAddTreatment}>
                                {showAddPatient ? (
                                    <>
                                        <input className="input-field" placeholder="Name" value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} required style={{ marginBottom: '15px', width: '100%' }} />
                                        <input className="input-field" type="number" placeholder="Age" value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} required style={{ marginBottom: '15px', width: '100%' }} />
                                        <select className="input-field" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })} style={{ marginBottom: '15px', width: '100%' }}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                        <select className="input-field" value={newPatient.disease_stage} onChange={e => setNewPatient({ ...newPatient, disease_stage: e.target.value })} style={{ marginBottom: '15px', width: '100%' }}>
                                            <option value="Early">Early Stage</option>
                                            <option value="Middle">Middle Stage</option>
                                            <option value="Severe">Severe Stage</option>
                                        </select>
                                    </>
                                ) : (
                                    <>
                                        <select className="input-field" value={newTreatment.medicine_id} onChange={e => setNewTreatment({ ...newTreatment, medicine_id: e.target.value })} style={{ marginBottom: '15px', width: '100%' }} required>
                                            <option value="">Select Medicine</option>
                                            {medicines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Improvement: {newTreatment.improvement_percent}%</label>
                                            <input type="range" min="0" max="100" value={newTreatment.improvement_percent} onChange={e => setNewTreatment({ ...newTreatment, improvement_percent: Number(e.target.value) })} style={{ width: '100%' }} />
                                        </div>
                                        <textarea className="input-field" placeholder="Doctor Notes" value={newTreatment.doctor_notes} onChange={e => setNewTreatment({ ...newTreatment, doctor_notes: e.target.value })} style={{ marginBottom: '15px', width: '100%', minHeight: '80px' }} />
                                    </>
                                )}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => { setShowAddPatient(false); setShowAddTreatment(false); }} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MedicalDashboard;
