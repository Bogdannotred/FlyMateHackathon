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
                    Scan QR Code
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

            {/* Decorative background element */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(15, 98, 254, 0.15) 0%, rgba(10, 10, 10, 0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                right: '-10%',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(255, 51, 102, 0.1) 0%, rgba(10, 10, 10, 0) 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: -1,
                pointerEvents: 'none'
            }} />

        </div>
    );
};

export default Home;
