import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Navigation, QrCode, ArrowRight, User } from 'lucide-react';

const MapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const scanned = queryParams.get('scanned');

    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        // Show a notification if the user just scanned a QR to arrive here
        if (scanned === 'true') {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [scanned]);

    const handleScanTicket = () => {
        // Simulator mock: Scanning ticket auto-fills your destination (e.g., your gate)
        setOrigin('Current Location (Security A)');
        setDestination('Gate B12 (Flight LX1324)');
        setIsNavigating(true);
    };

    const handleStartNavigation = () => {
        if (origin && destination) {
            setIsNavigating(true);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: 'var(--bg-dark)',
            position: 'relative',
            overflow: 'hidden' // Prevent scrolling behind map
        }} className="animate-fade-in">

            {/* Search Bar / Input Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '1.5rem',
                paddingTop: '3rem', // Add space for notch/status bar on mobile
                zIndex: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
            }}>
                <div className="glass-panel" style={{
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} color="var(--primary)" />
                        <input
                            type="text"
                            placeholder="Current Location"
                            value={origin}
                            onChange={(e) => setOrigin(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '0 0.5rem' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Navigation size={20} color="var(--accent)" />
                        <input
                            type="text"
                            placeholder="Where do you want to go?"
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={handleScanTicket}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            fontWeight: 500
                        }}
                    >
                        <QrCode size={18} />
                        Scan Ticket QR
                    </button>
                    <button
                        onClick={handleStartNavigation}
                        disabled={!origin || !destination}
                        style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: (origin && destination) ? 'var(--primary)' : 'rgba(15, 98, 254, 0.4)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 600,
                            opacity: (origin && destination) ? 1 : 0.6,
                            cursor: (origin && destination) ? 'pointer' : 'not-allowed'
                        }}
                    >
                        Go
                    </button>
                </div>
            </div>

            {/* Pop-up Notification for "Location Detected" */}
            {showNotification && (
                <div style={{
                    position: 'absolute',
                    top: '120px', left: '2rem', right: '2rem',
                    backgroundColor: 'var(--success)',
                    color: 'white',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    fontWeight: 500,
                    zIndex: 30,
                    boxShadow: 'var(--shadow-md)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    📍 Terminal Location Linked
                </div>
            )}

            {/* SVG Map Container (Mock) */}
            <div style={{
                flex: 1,
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundColor: '#0a0a0a',
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {/* Mock Interactive Map Elements */}
                <div style={{
                    position: 'absolute',
                    width: '80%',
                    height: '60%',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Map size={48} color="rgba(255, 255, 255, 0.2)" />
                </div>

                {/* Navigation Path Mock (Visible only when navigating) */}
                {isNavigating && (
                    <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path
                            d="M20,80 Q50,70 60,40 T80,20"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            className="animate-fade-in"
                        />
                        <circle cx="20" cy="80" r="3" fill="var(--primary)" />
                        <circle cx="80" cy="20" r="3" fill="var(--accent)" />
                    </svg>
                )}

                {isNavigating && (
                    <div style={{
                        position: 'absolute',
                        top: '30%', right: '15%',
                        backgroundColor: 'var(--accent)',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        animation: 'pulse 2s infinite'
                    }}>
                        Gate B12
                    </div>
                )}

            </div>

            {/* Bottom Information Bar (Visible when navigating) */}
            {isNavigating && (
                <div className="glass-panel animate-fade-in" style={{
                    position: 'absolute',
                    bottom: '1.5rem', left: '1rem', right: '1rem',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    zIndex: 20
                }}>
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>12 min walk</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>450m to Gate B12</p>
                    </div>
                    <button
                        onClick={() => setIsNavigating(false)}
                        style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 500
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}

        </div>
    );
};

export default MapPage;
