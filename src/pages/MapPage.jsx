import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, QrCode, Map as MapIcon, User, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── POI data matching the map/index.html POIs ───
const MAP_NODES = [
    { id: 'entrance', label: 'Intrare' },
    { id: 'exit', label: 'Iesire' },
    { id: 'checkin', label: 'Check-in' },
    { id: 'security', label: 'Security' },
    { id: 'waiting1', label: 'Camera asteptare 1' },
    { id: 'waiting2', label: 'Camera asteptare 2' },
    { id: 'gate1', label: 'Gate 1' },
    { id: 'gate2', label: 'Gate 2' },
    { id: 'gate3', label: 'Gate 3' },
    { id: 'gate4', label: 'Gate 4' },
    { id: 'gate5', label: 'Gate 5' },
    { id: 'gate6', label: 'Gate 6' },
    { id: 'wc_disabled', label: 'Disabled restroom' },
    { id: 'wc_men', label: 'Men restroom' },
    { id: 'wc_women', label: 'Women restroom' },
    { id: 'cafe', label: 'Cafenea' },
    { id: 'restaurant', label: 'Restaurant' },
    { id: 'kids', label: "Kids' area" },
    { id: 'shop', label: 'Magazin haine' },
    { id: 'medical', label: 'Farmacie' },
    { id: 'elevator', label: 'Lift' },
    { id: 'wc_disabled2', label: 'Disabled restroom 2' },
    { id: 'wc_men2', label: 'Men restroom 2' },
    { id: 'wc_women2', label: 'Women restroom 2' },
    { id: 'parking1', label: 'Parcare 1' },
    { id: 'parking2', label: 'Parcare 2' },
];

const MapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const scanned = queryParams.get('scanned');
    const originParam = queryParams.get('origin');
    const iframeRef = useRef(null);

    const [selectedOriginId, setSelectedOriginId] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const [showNotification, setShowNotification] = useState('');

    // Step-by-step navigation state
    const [routeSteps, setRouteSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (scanned === 'true' && originParam) {
            const node = MAP_NODES.find(n => n.id === originParam);
            if (node) {
                setSelectedOriginId(originParam);
                setShowNotification(`📍 Localizat: ${node.label}`);
                setTimeout(() => setShowNotification(''), 4000);
            }
        }
    }, [scanned, originParam]);

    // Listen for ROUTE_READY from iframe
    useEffect(() => {
        const handler = (event) => {
            if (event.data?.type === 'ROUTE_READY') {
                setRouteSteps(event.data.steps || []);
                setCurrentStep(0);
                // Show first step on the map
                if (event.data.steps?.length > 0) {
                    const first = event.data.steps[0];
                    setTimeout(() => {
                        iframeRef.current?.contentWindow?.postMessage({
                            type: 'SET_STEP', lat: first.lat, lng: first.lng, label: first.label
                        }, '*');
                    }, 800);
                }
            }
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    const handleStartNavigation = () => {
        if (selectedOriginId && selectedDestId) {
            const origin = MAP_NODES.find(n => n.id === selectedOriginId);
            const dest = MAP_NODES.find(n => n.id === selectedDestId);
            if (iframeRef.current && origin && dest) {
                setIsNavigating(true);
                iframeRef.current.contentWindow.postMessage({
                    type: 'NAVIGATE',
                    origin: { id: origin.id, label: origin.label },
                    dest: { id: dest.id, label: dest.label }
                }, '*');
            }
        }
    };

    const handleCancelNavigation = () => {
        setIsNavigating(false);
        setRouteSteps([]);
        setCurrentStep(0);
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({ type: 'CLEAR_ROUTE' }, '*');
        }
    };

    const handleNextStep = () => {
        if (currentStep < routeSteps.length - 1) {
            const nextIdx = currentStep + 1;
            setCurrentStep(nextIdx);
            const step = routeSteps[nextIdx];
            iframeRef.current?.contentWindow?.postMessage({
                type: 'SET_STEP', lat: step.lat, lng: step.lng, label: step.label
            }, '*');
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            const prevIdx = currentStep - 1;
            setCurrentStep(prevIdx);
            const step = routeSteps[prevIdx];
            iframeRef.current?.contentWindow?.postMessage({
                type: 'SET_STEP', lat: step.lat, lng: step.lng, label: step.label
            }, '*');
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', flex: 1,
            backgroundColor: '#0a0a0c', position: 'relative', overflow: 'hidden', minHeight: '100vh'
        }} className="animate-fade-in">

            {/* Notification */}
            {showNotification && (
                <div style={{
                    position: 'absolute', top: '10rem', left: '1.5rem', right: '1.5rem',
                    backgroundColor: 'var(--success)', color: 'white', padding: '1rem', borderRadius: '16px',
                    textAlign: 'center', fontWeight: 600, zIndex: 1000,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease-out'
                }}>
                    {showNotification}
                </div>
            )}

            {/* Navigation Controls Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '1rem', paddingTop: '2.5rem', zIndex: 1000,
                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                transform: isNavigating ? 'translateY(-150%)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isNavigating ? 'none' : 'auto'
            }}>
                <div style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px',
                    padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={18} color="var(--primary)" />
                        <select
                            value={selectedOriginId} onChange={(e) => setSelectedOriginId(e.target.value)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: selectedOriginId ? 'white' : 'var(--text-muted)',
                                fontSize: '0.95rem', outline: 'none', appearance: 'none'
                            }}
                        >
                            <option value="" disabled style={{ color: 'black' }}>Locația ta</option>
                            {MAP_NODES.map(n => (
                                <option key={`org-${n.id}`} value={n.id} style={{ color: 'black' }}>{n.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <MapIcon size={18} color={selectedDestId ? 'var(--accent)' : 'var(--text-muted)'} />
                        <select
                            value={selectedDestId} onChange={(e) => setSelectedDestId(e.target.value)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: selectedDestId ? 'white' : 'var(--text-muted)',
                                fontSize: '0.95rem', outline: 'none', appearance: 'none'
                            }}
                        >
                            <option value="" disabled style={{ color: 'black' }}>Alege Destinația</option>
                            {MAP_NODES.map(n => (
                                <option key={`dest-${n.id}`} value={n.id} disabled={n.id === selectedOriginId} style={{ color: 'black' }}>{n.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => navigate('/scanner')}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.85rem', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px', color: 'white', fontWeight: 600, backdropFilter: 'blur(10px)', fontSize: '0.9rem'
                        }}
                    >
                        <QrCode size={18} /> Scan QR
                    </button>

                    <button
                        onClick={handleStartNavigation} disabled={!selectedOriginId || !selectedDestId}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.85rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '14px',
                            color: 'white', fontWeight: 700, opacity: (selectedOriginId && selectedDestId) ? 1 : 0.5, fontSize: '0.9rem'
                        }}
                    >
                        <Navigation size={18} /> Navigare
                    </button>
                </div>
            </div>

            {/* ─── ACTIVE NAVIGATION PANEL (top + bottom) ─── */}
            {isNavigating && (
                <>
                    {/* Top bar: route info + stop */}
                    <div style={{
                        position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 1000,
                        animation: 'fadeIn 0.5s ease'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(20, 20, 20, 0.92)', backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '1rem',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                        }}>
                            <div style={{
                                backgroundColor: 'var(--primary)', borderRadius: '50%', width: '44px', height: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <Navigation color="white" size={22} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{
                                    fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', color: 'white',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                                }}>
                                    {MAP_NODES.find(n => n.id === selectedOriginId)?.label} → {MAP_NODES.find(n => n.id === selectedDestId)?.label}
                                </h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                    Pas {currentStep + 1} / {routeSteps.length}
                                    {routeSteps[currentStep] && ` — ${routeSteps[currentStep].label}`}
                                </p>
                            </div>
                            <button
                                onClick={handleCancelNavigation}
                                style={{
                                    padding: '0.5rem 1rem', backgroundColor: 'transparent',
                                    border: '1px solid var(--error)', borderRadius: '12px',
                                    color: 'var(--error)', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0
                                }}
                            >
                                Stop
                            </button>
                        </div>
                    </div>

                    {/* Bottom step controls */}
                    {routeSteps.length > 0 && (
                        <div style={{
                            position: 'absolute', bottom: '7.5rem', left: '1rem', right: '1rem', zIndex: 1000,
                            animation: 'fadeIn 0.5s ease 0.2s both'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(20, 20, 20, 0.92)', backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '0.75rem',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                            }}>
                                {/* Current step display */}
                                <div style={{
                                    textAlign: 'center', marginBottom: '0.6rem', padding: '0.5rem',
                                    background: 'rgba(15, 98, 254, 0.15)', borderRadius: '12px',
                                    border: '1px solid rgba(15, 98, 254, 0.3)'
                                }}>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Locația curentă
                                    </p>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                                        📍 {routeSteps[currentStep]?.label || '—'}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div style={{
                                    height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px',
                                    marginBottom: '0.6rem', overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%', background: 'linear-gradient(90deg, #4ecdc4, #0f62fe)',
                                        borderRadius: '2px', transition: 'width 0.3s ease',
                                        width: `${((currentStep + 1) / routeSteps.length) * 100}%`
                                    }} />
                                </div>

                                {/* Prev / Next buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={handlePrevStep}
                                        disabled={currentStep === 0}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                            padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)',
                                            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
                                            color: currentStep === 0 ? 'rgba(255,255,255,0.3)' : 'white',
                                            fontWeight: 600, fontSize: '0.85rem',
                                            opacity: currentStep === 0 ? 0.5 : 1
                                        }}
                                    >
                                        <ChevronLeft size={18} /> Înapoi
                                    </button>

                                    <button
                                        onClick={handleNextStep}
                                        disabled={currentStep >= routeSteps.length - 1}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                            padding: '0.75rem',
                                            backgroundColor: currentStep >= routeSteps.length - 1 ? 'rgba(78, 205, 196, 0.2)' : '#4ecdc4',
                                            border: 'none', borderRadius: '12px',
                                            color: currentStep >= routeSteps.length - 1 ? 'rgba(78, 205, 196, 0.5)' : '#000',
                                            fontWeight: 700, fontSize: '0.85rem'
                                        }}
                                    >
                                        {currentStep >= routeSteps.length - 1 ? '✅ Ai ajuns!' : 'Următorul'} <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ─── EMBEDDED MAP (map/index.html) ─── */}
            <iframe
                ref={iframeRef}
                src="/map/index.html"
                style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    width: '100%', height: '100%', border: 'none', zIndex: 1
                }}
                title="Airport Map"
                allow="geolocation"
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default MapPage;
