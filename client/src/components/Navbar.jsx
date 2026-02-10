import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LogOut, User as UserIcon, Home, Activity, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';


const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isNavigating, setIsNavigating] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setIsNavigating(true);
        const timer = setTimeout(() => setIsNavigating(false), 500);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-card" style={{
            margin: '10px 20px',
            padding: '12px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '10px',
            zIndex: 1000,
            overflow: 'visible'
        }}>
            {/* Top Loading Bar */}
            {isNavigating && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'var(--neural-gradient)',
                    animation: 'shimmer 1s infinite linear',
                    backgroundSize: '200% auto',
                    borderRadius: '24px 24px 0 0'
                }} />
            )}

            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'white', zIndex: 1001 }}>
                <div style={{
                    background: 'var(--neural-gradient)',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Brain size={24} />
                </div>
                <span className="hide-on-mobile" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Neural Time Capsules</span>
            </Link>

            {/* Tech Phantoms Branding - Hidden on small screens */}
            <div className="hide-on-mobile" style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                pointerEvents: 'none'
            }}>
                <span style={{
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    color: 'var(--text-secondary)',
                    opacity: 0.8
                }}>Crafted by</span>
                <span style={{
                    fontSize: '1rem',
                    fontWeight: '900',
                    letterSpacing: '2px',
                    background: 'linear-gradient(90deg, #fff, var(--primary), #fff)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Outfit", sans-serif',
                    textTransform: 'uppercase',
                    animation: 'shimmer 3s linear infinite'
                }}>
                    TECH PHANTOMS
                </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Home size={18} />
                    <span>Home</span>
                </Link>
                <Link to="/dashboard" style={{ color: location.pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>Dashboard</Link>
                <Link to="/medical" style={{ color: location.pathname === '/medical' ? 'var(--primary)' : 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={18} />
                    <span>Medical AI</span>
                </Link>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--glass)', padding: '5px 15px', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
                            <UserIcon size={18} color="var(--primary)" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{user.name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="btn-logout"
                            style={{
                                background: 'transparent',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: 'var(--danger)',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Link to="/login" className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '12px', textDecoration: 'none' }}>Login</Link>
                        <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '12px', textDecoration: 'none' }}>Register</Link>
                    </div>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="show-on-mobile"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    zIndex: 1001
                }}
            >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="glass-card" style={{
                    position: 'absolute',
                    top: '70px',
                    left: 0,
                    right: 0,
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    animation: 'fadeIn 0.3s ease-out forwards',
                    zIndex: 1000
                }}>
                    <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Home size={20} /> Home
                    </Link>
                    <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Brain size={20} /> Dashboard
                    </Link>
                    <Link to="/medical" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={20} /> Medical AI
                    </Link>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}>
                                <UserIcon size={20} />
                                <span>{user.name}</span>
                            </div>
                            <button onClick={handleLogout} className="btn-primary" style={{ width: '100%' }}>
                                <LogOut size={20} /> Logout
                            </button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <Link to="/login" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Login</Link>
                            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
                        </div>
                    )}

                    <div style={{
                        marginTop: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        opacity: 0.6
                    }}>
                        <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Crafted by</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>TECH PHANTOMS</span>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;


