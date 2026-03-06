import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, RefreshCw, FlipHorizontal, Flashlight } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ORADEA_NODES } from '../data/OradeaMapGraph';

const QRScannerMock = () => {
    const navigate = useNavigate();
    const [hasError, setHasError] = useState(false);

    // Custom state for camera controls since built-in can be buggy on some OS
    const [facingMode, setFacingMode] = useState('environment');
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [scanned, setScanned] = useState(false); // Navigation lock

    const handleScan = (result) => {
        if (scanned) return; // Prevent multiple scans
        if (result && result.length > 0) {
            const decodedText = result[0].rawValue;
            console.log("Scanned:", decodedText);

            let scannedId = decodedText.trim().toLowerCase();

            // Simple heuristics in case user scanned a full URL by accident
            if (scannedId.includes('/')) {
                const parts = scannedId.split('/');
                scannedId = parts[parts.length - 1];
            }

            setScanned(true); // Lock

            if (ORADEA_NODES[scannedId]) {
                navigate(`/map?scanned=true&origin=${scannedId}`);
            } else {
                console.warn(`Node ${scannedId} not found in map graph.`);
                navigate('/map?scanned=true&origin=entrance');
            }
        }
    };

    const handleError = (error) => {
        console.error("Scanner Error:", error);
        if (error.name === 'NotAllowedError' || error.name === 'NotFoundError') {
            setHasError(true);
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    const toggleTorch = () => {
        setIsTorchOn(prev => !prev);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: '#000',
            color: 'white',
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden'
        }} className="animate-fade-in">

            {/* Header controls overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '1.5rem',
                paddingTop: '3rem',
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
                    <Camera size={16} /> Live Scanner
                </div>
            </div>

            {/* Scanner Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    aspectRatio: '1',
                    backgroundColor: '#111',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 0 0 100vmax rgba(0,0,0,0.7)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    {hasError ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--error)', textAlign: 'center', padding: '1rem' }}>
                            <X size={48} style={{ marginBottom: '1rem' }} />
                            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Camera Access Denied</p>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Please ensure you have granted camera permissions in your browser settings (or ensure you are on localhost/HTTPS).</p>
                        </div>
                    ) : (
                        <Scanner
                            key={`${facingMode}-${isTorchOn}`} // Forces remount to apply new constraints dynamically!
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{
                                facingMode: facingMode,
                                advanced: [{ torch: isTorchOn }]
                            }}
                            components={{
                                audio: false,
                                onOff: false, // Disabling built-in buttons
                                torch: false, // Disabling built-in torch button
                                zoom: false,
                                finder: true,
                            }}
                            styles={{
                                container: { width: '100%', height: '100%' },
                                video: { objectFit: 'cover' }
                            }}
                        />
                    )}
                </div>

                {/* Custom Overlay Controls */}
                {!hasError && (
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button
                            onClick={toggleCamera}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px', color: 'white',
                                fontWeight: 500, backdropFilter: 'blur(10px)',
                            }}
                        >
                            <FlipHorizontal size={20} /> Flip
                        </button>
                        <button
                            onClick={toggleTorch}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.75rem 1.25rem',
                                backgroundColor: isTorchOn ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '12px', color: 'white',
                                fontWeight: 500, backdropFilter: 'blur(10px)',
                            }}
                        >
                            <Flashlight size={20} /> Torch
                        </button>
                    </div>
                )}
            </div>

            {/* Instructional text footer */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: 0, right: 0,
                textAlign: 'center',
                padding: '0 2rem',
                zIndex: 10
            }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Scan Wall Location QR</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Point your camera at a FlyMate QR code</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Note: Torch requires HTTPS</p>
            </div>

        </div>
    );
};

export default QRScannerMock;
