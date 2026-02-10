import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, X, Upload, Check, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const MemoryChatbot = ({ isOpen, onClose, onComplete, patientName }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [step, setStep] = useState('started');
    const [isTyping, setIsTyping] = useState(false);

    // Data Collection State
    const [memoryData, setMemoryData] = useState({
        title: '',
        type: 'image',
        description: '',
        dateOccurred: '',
        location: '',
        peopleInvolved: ''
    });

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize Chat
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { id: 1, type: 'bot', text: "Hi! I'm Gemini, your AI Memory Assistant. Let's preserve a special moment for " + (patientName || 'this patient') + "." },
                { id: 2, type: 'bot', text: 'To start, please upload a photo or video of this memory, or just describe it to me.', isFileUpload: true }
            ]);
        }
    }, [isOpen, patientName]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const callGemini = async (prompt) => {
        try {
            // Use the Flask backend proxy instead of direct call
            const res = await axios.post('http://localhost:5001/api/ai/chat', { prompt });
            return res.data.response;
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "I'm having trouble connecting to my brain right now. Please check if the backend server is running.";
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userInput = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userInput }]);
        setIsTyping(true);

        let nextQuestion = "That's interesting! Tell me more about it.";
        let nextStep = step;
        let fieldToUpdate = "";

        // Intelligent flow transitions
        if (step === 'started' || step === 'file') {
            fieldToUpdate = 'description';
            const prompt = `
                The user described their memory as: "${userInput}".
                Respond with a warm, empathetic 1-sentence acknowledgement.
                Then ask: "Where did this take place? (e.g., at home, in the park)"
            `;
            const response = await callGemini(prompt);
            nextQuestion = response || "That sounds like a precious memory. Where did this happen?";
            nextStep = 'location';

        } else if (step === 'location') {
            fieldToUpdate = 'location';
            const prompt = `
                Context: Memory at ${userInput}.
                Respond warmly in 1 short sentence.
                Then ask: "Who was there with you? (Family, friends, or just you?)"
            `;
            const response = await callGemini(prompt);
            nextQuestion = response || `A lovely place! Who shared this moment with you?`;
            nextStep = 'people';

        } else if (step === 'people') {
            fieldToUpdate = 'peopleInvolved';
            const prompt = `
                Context: Memory at ${memoryData.location} with ${userInput}.
                Respond warmly in 1 short sentence.
                Then ask: "Do you remember roughly when this happened? (Year or Date)"
            `;
            const response = await callGemini(prompt);
            nextQuestion = response || "It's wonderful to have people we love in our memories. When did this take place?";
            nextStep = 'date';

        } else if (step === 'date') {
            fieldToUpdate = 'dateOccurred';
            const prompt = `
                Context: Memory details gathered so far:
                - Description: ${memoryData.description}
                - Location: ${memoryData.location}
                - People: ${memoryData.peopleInvolved}
                - Date: ${userInput}
                
                Task: Generate a creative, short title for this memory (max 5 words).
                Just output the title recommendation, nothing else.
            `;
            const titleSuggestion = await callGemini(prompt);
            const cleanTitle = (titleSuggestion || "A Special Moment").trim().replace(/^"|"$/g, '');

            setMemoryData(prev => ({
                ...prev,
                dateOccurred: userInput,
                title: cleanTitle
            }));

            nextQuestion = `I've suggested a title: "${cleanTitle}". Is this okay? Or type a new one.`;
            nextStep = 'title';

        } else if (step === 'title') {
            const finalTitle = (userInput.toLowerCase().includes('yes') || userInput.toLowerCase().includes('ok'))
                ? memoryData.title
                : userInput;

            setMemoryData(prev => ({ ...prev, title: finalTitle }));

            const prompt = `
                Write a beautiful, 1-sentence closing remark for this memory: "${finalTitle}".
                End with: "Ready to save?"
            `;
            const response = await callGemini(prompt);
            nextQuestion = response || `What a beautiful title. Ready to save this to your memory bank?`;
            nextStep = 'confirm';

        } else if (step === 'confirm') {
            nextQuestion = "Great! Saving memory now...";
            handleFinalize();
            return;
        }

        if (fieldToUpdate) {
            setMemoryData(prev => ({ ...prev, [fieldToUpdate]: userInput }));
        }

        setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            text: nextQuestion,
            isFinal: nextStep === 'confirm'
        }]);
        setStep(nextStep);
        setIsTyping(false);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            const type = selectedFile.type.startsWith('video') ? 'video' : selectedFile.type.startsWith('audio') ? 'audio' : 'image';
            setMemoryData(prev => ({ ...prev, type }));

            setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: `Uploaded: ${selectedFile.name}` }]);

            setIsTyping(true);
            setTimeout(() => {
                setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: "That looks important! Can you describe what is happening in this file?" }]);
                setStep('file'); // Move to description
                setIsTyping(false);
            }, 1000);
        }
    };

    const handleFinalize = () => {
        onComplete(memoryData, file);
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="glass-card"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    height: 'min(650px, 90vh)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #38bdf8',
                    boxShadow: '0 0 30px rgba(56, 189, 248, 0.2)',
                    position: 'relative'
                }}
            >
                {/* Header */}
                <div style={{ padding: '20px', background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.1), rgba(129, 140, 248, 0.1))', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--neural-gradient)', padding: '8px', borderRadius: '10px' }}>
                            <Sparkles size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', background: 'linear-gradient(90deg, #fff, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gemini Assistant</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Powered by Google AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ width: '100%', marginBottom: '10px', borderRadius: '15px', overflow: 'hidden', border: '1px solid var(--text-secondary)' }}
                        >
                            <img src={preview} alt="Memory Preview" style={{ width: '100%', opacity: 0.8 }} />
                        </motion.div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} style={{ display: 'flex', justifyContent: msg.type === 'bot' ? 'flex-start' : 'flex-end', alignItems: 'flex-start', gap: '10px' }}>
                            {msg.type === 'bot' && (
                                <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '6px', borderRadius: '50%', flexShrink: 0 }}>
                                    <Sparkles size={14} color="#38bdf8" />
                                </div>
                            )}
                            <div style={{
                                maxWidth: '85%',
                                padding: '12px 16px',
                                borderRadius: msg.type === 'bot' ? '0 16px 16px 16px' : '16px 0 16px 16px',
                                background: msg.type === 'bot' ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #38bdf8, #818cf8)',
                                color: 'white',
                                fontSize: '0.95rem',
                                lineHeight: '1.4',
                                border: msg.type === 'bot' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                            }}>
                                {msg.text}

                                {msg.isFileUpload && !file && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div className="file-upload-wrapper">
                                            <label className="file-upload-label" style={{ padding: '12px', fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)' }}>
                                                <Upload size={16} />
                                                <span>Choose File</span>
                                                <input type="file" className="file-upload-input" onChange={handleFileSelect} />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {msg.isFinal && (
                                    <button
                                        onClick={handleFinalize}
                                        style={{ marginTop: '15px', width: '100%', background: '#38bdf8', color: 'black', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                                    >
                                        <Check size={18} />
                                        <span>Save to Memory Bank</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '10px', opacity: 0.6 }}>
                            <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'bounce 1s infinite 0s' }}></div>
                            <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'bounce 1s infinite 0.2s' }}></div>
                            <div style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%', animation: 'bounce 1s infinite 0.4s' }}></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Type your response..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '12px 16px', borderRadius: '12px', color: 'white', outline: 'none' }}
                        autoFocus
                    />
                    <button
                        onClick={handleSend}
                        disabled={isTyping}
                        style={{ background: '#38bdf8', border: 'none', color: 'black', width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default MemoryChatbot;
