import { useNavigate } from 'react-router-dom';
import { QrCode, Plane, MapPin } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            padding: '2rem',
            gap: '3rem',
            backgroundColor: 'var(--bg-dark)',
            color: 'var(--text-main)'
        }} className="animate-fade-in">

            <div style={{ textAlign: 'center' }}>
                <Plane size={64} color="var(--primary)" style={{ marginBottom: '1rem', animation: 'fadeIn 0.8s ease' }} />
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>FlyMate</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '300px', margin: '0 auto' }}>
                    Your digital companion for a seamless airport experience.
                </p>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '100%',
                maxWidth: '320px'
            }}>
                {/* Main CTA */}
                <button
                    onClick={() => navigate('/scanner')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: 'var(--shadow-md)',
                        position: 'relative',
                        zIndex: 10,
                        overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <QrCode size={28} />
                    Scan Flight Ticket
                    {/* Pulse effect wrapper */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '16px',
                        animation: 'pulse 2s infinite',
                        pointerEvents: 'none'
                    }} />
                </button>

                {/* Secondary Navigation (Mock) */}
                <button
                    onClick={() => navigate('/map')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                        padding: '1rem',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        zIndex: 10
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.color = 'var(--text-main)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <MapPin size={20} />
                    Continue to Map
                </button>
            </div>

            {/* Decorative background element animated (High Density) */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-15%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.85) 0%, rgba(79, 70, 229, 0.4) 40%, rgba(15, 23, 42, 0) 80%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                zIndex: -1,
                pointerEvents: 'none',
                animation: 'floatBlob1 8s ease-in-out infinite alternate'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-15%',
                width: '450px',
                height: '450px',
                background: 'radial-gradient(circle, rgba(45, 212, 191, 0.85) 0%, rgba(20, 184, 166, 0.4) 40%, rgba(15, 23, 42, 0) 80%)',
                borderRadius: '50%',
                filter: 'blur(50px)',
                zIndex: -1,
                pointerEvents: 'none',
                animation: 'floatBlob2 10s ease-in-out infinite alternate-reverse'
            }} />

            {/* Floating animations for the home page background */}
            <style>{`
                @keyframes floatBlob1 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(25%, 30%) scale(1.3); }
                    66% { transform: translate(-15%, 40%) scale(0.8); }
                    100% { transform: translate(-30%, -10%) scale(1.4); }
                }
                @keyframes floatBlob2 {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-25%, -35%) scale(1.4); }
                    66% { transform: translate(15%, -45%) scale(0.7); }
                    100% { transform: translate(30%, 15%) scale(1.3); }
                }
            `}</style>

        </div>
    );
};

export default Home;
