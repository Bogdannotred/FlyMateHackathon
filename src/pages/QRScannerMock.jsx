import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';

const QRScannerMock = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Simulate reading a QR code successfully after 2 seconds
        const timer = setTimeout(() => {
            // Navigate to map, potentially passing some state or params to simulate the "scan anything" requirement
            navigate('/map?scanned=true');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: '#000',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
        }} className="animate-fade-in">

            {/* Header controls */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px', height: '40px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', cursor: 'pointer',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <X size={24} />
                </button>
                <div style={{
                    background: 'rgba(0,0,0,0.5)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Camera size={16} /> scanning...
                </div>
            </div>

            {/* Simulated Camera View / Alignment Frame */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    position: 'relative',
                    width: '280px',
                    height: '280px',
                    border: '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '24px',
                    boxShadow: '0 0 0 100vmax rgba(0,0,0,0.7)', /* Darkens everything outside this box */
                    overflow: 'hidden'
                }}>
                    {/* Corner indicators */}
                    <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '40px', height: '40px', borderTop: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderTopLeftRadius: '24px' }} />
                    <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '40px', height: '40px', borderTop: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderTopRightRadius: '24px' }} />
                    <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '40px', height: '40px', borderBottom: '4px solid var(--primary)', borderLeft: '4px solid var(--primary)', borderBottomLeftRadius: '24px' }} />
                    <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '40px', height: '40px', borderBottom: '4px solid var(--primary)', borderRight: '4px solid var(--primary)', borderBottomRightRadius: '24px' }} />

                    {/* Scanning Line Animation */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: 'var(--primary)',
                        boxShadow: '0 0 10px 2px var(--primary)',
                        animation: 'scanline 2s linear infinite'
                    }} />

                    {/* Subtle pulsating center hint */}
                    <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80px', height: '80px',
                        border: '2px dashed rgba(255,255,255,0.3)',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s ease-in-out infinite'

                    }} />
                </div>
            </div>

            {/* Instructional text */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: 0, right: 0,
                textAlign: 'center',
                padding: '0 2rem'
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Point camera at the QR code</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>It will scan automatically</p>
            </div>

        </div>
    );
};

export default QRScannerMock;
