import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, QrCode, Map as MapIcon, User, ChevronLeft, ChevronRight, Accessibility, X } from 'lucide-react';

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
    const destParam = queryParams.get('dest');
    const iframeRef = useRef(null);

    const [selectedOriginId, setSelectedOriginId] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const [showNotification, setShowNotification] = useState('');

    // Custom dropdown states
    const [isOriginOpen, setIsOriginOpen] = useState(false);
    const [isDestOpen, setIsDestOpen] = useState(false);
    const originRef = useRef(null);
    const destRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (originRef.current && !originRef.current.contains(event.target)) {
                setIsOriginOpen(false);
            }
            if (destRef.current && !destRef.current.contains(event.target)) {
                setIsDestOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Step-by-step navigation state
    const [routeSteps, setRouteSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    // Departure countdown (3 hours = 10800 seconds)
    const [departureTime, setDepartureTime] = useState(10800);
    useEffect(() => {
        const timer = setInterval(() => {
            setDepartureTime(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    const formatDeparture = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    // Disabled assistance state
    const [showAssistPanel, setShowAssistPanel] = useState(false);
    const [assistActive, setAssistActive] = useState(false);
    const [assistTimeLeft, setAssistTimeLeft] = useState(120); // 2 minutes in seconds
    const [assistDest, setAssistDest] = useState(''); // where the assistant should come
    const [assistArrived, setAssistArrived] = useState(false);
    const assistTimerRef = useRef(null);

    const handleRequestAssistance = () => {
        setShowAssistPanel(false);
        setAssistActive(true);
        setAssistTimeLeft(120);

        // The assistant comes from a staff location (e.g. security) to the user's CURRENT location
        // If navigating, use the current step; otherwise use the selected origin
        const userLoc = (isNavigating && routeSteps.length > 0 && routeSteps[currentStep])
            ? routeSteps[currentStep].id
            : (selectedOriginId || 'entrance');
        setAssistDest(userLoc); // Keep it in state to show in the UI

        // Tell the iframe to show the animated assistant dot
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({
                type: 'ASSISTANT_ANIMATE',
                origin: 'security', // Assistant origin
                dest: userLoc, // Assistant destination (user's location)
                durationMs: 120000 // 2 minutes
            }, '*');
        }
        // Start countdown
        if (assistTimerRef.current) clearInterval(assistTimerRef.current);
        assistTimerRef.current = setInterval(() => {
            setAssistTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(assistTimerRef.current);
                    setAssistActive(false);
                    setAssistArrived(true);
                    setTimeout(() => setAssistArrived(false), 6000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleCancelAssistance = () => {
        setAssistActive(false);
        setAssistArrived(false);
        setAssistTimeLeft(120);
        if (assistTimerRef.current) clearInterval(assistTimerRef.current);
        if (iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({ type: 'ASSISTANT_CLEAR' }, '*');
        }
    };

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        if (scanned === 'true' && originParam) {
            const node = MAP_NODES.find(n => n.id === originParam);
            if (node) {
                setSelectedOriginId(originParam);
                setShowNotification(`📍 Localizat: ${node.label}`);
                setTimeout(() => setShowNotification(''), 4000);
            }
            if (destParam) {
                const destNode = MAP_NODES.find(n => n.id === destParam);
                if (destNode) {
                    setSelectedDestId(destParam);

                    // Auto-start navigation after a short delay so the map has time to adjust
                    setTimeout(() => {
                        handleStartNavigation(originParam, destParam);
                    }, 500);
                }
            }
        }
    }, [scanned, originParam, destParam]);

    // Listen for ROUTE_READY from iframe
    useEffect(() => {
        const handler = (event) => {
            if (event.data?.type === 'ROUTE_READY') {
                const newSteps = event.data.steps || [];
                setRouteSteps(newSteps);
                setCurrentStep(0);

                // Show first step on the map
                if (newSteps.length > 0) {
                    const first = newSteps[0];
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

    // Simulate dynamic gate change (Gate 5 -> Gate 6)
    // APPROACH: Both gates share the same corridor. We swap the last step in-place
    // and tell the iframe to update only the endpoint. currentStep stays untouched.
    const gateChangeTriggered = useRef(false);
    useEffect(() => {
        let timer;
        if (isNavigating && selectedDestId === 'gate5' && !gateChangeTriggered.current) {
            timer = setTimeout(() => {
                gateChangeTriggered.current = true;

                // Show notification
                setShowNotification('⚠️ ATENȚIE: Zborul tău a fost mutat la Gate 6! Ruta a fost recalculată automat.');
                setTimeout(() => setShowNotification(''), 7000);

                // Update destination in React state
                setSelectedDestId('gate6');

                // Swap last step in routeSteps from gate5 -> gate6
                setRouteSteps(prev => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        const gate6Data = { id: 'gate6', label: 'Gate 6', lat: 47.028445, lng: 21.899117 };
                        updated[updated.length - 1] = gate6Data;
                    }
                    return updated;
                });
                // DO NOT touch currentStep — user stays where they are

                // Tell iframe to swap just the destination marker and redraw the line
                setTimeout(() => {
                    if (iframeRef.current) {
                        iframeRef.current.contentWindow.postMessage({
                            type: 'SWAP_DEST',
                            newDest: { id: 'gate6', label: 'Gate 6', lat: 47.028445, lng: 21.899117 }
                        }, '*');
                    }
                }, 100);
            }, 8000);
        }
        return () => clearTimeout(timer);
    }, [isNavigating, selectedDestId]);

    const handleStartNavigation = (optOriginId, optDestId) => {
        // Prevent assigning the React SyntheticEvent to oId if called from onClick
        const oId = typeof optOriginId === 'string' ? optOriginId : selectedOriginId;
        const dId = typeof optDestId === 'string' ? optDestId : selectedDestId;

        if (oId && dId) {
            const origin = MAP_NODES.find(n => n.id === oId);
            const dest = MAP_NODES.find(n => n.id === dId);
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

            {/* Departure Countdown - Modern Floating Card (only after QR scan) */}
            {scanned === 'true' && !isNavigating && !assistActive && (
                <div style={{
                    position: 'absolute', bottom: '7.5rem', left: '1rem', zIndex: 1002,
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(15, 15, 20, 0.92)', backdropFilter: 'blur(24px)',
                        border: `1.5px solid ${departureTime < 1800 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(78, 205, 196, 0.3)'}`,
                        borderRadius: '18px', padding: '0.65rem 1rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        boxShadow: departureTime < 1800
                            ? '0 4px 24px rgba(239,68,68,0.35), inset 0 0 20px rgba(239,68,68,0.05)'
                            : '0 4px 24px rgba(0,0,0,0.5), inset 0 0 20px rgba(78,205,196,0.03)'
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: departureTime < 1800
                                ? 'linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.1))'
                                : 'linear-gradient(135deg, rgba(78,205,196,0.3), rgba(15,98,254,0.15))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>✈️</span>
                        </div>
                        <div>
                            <p style={{
                                color: 'rgba(255,255,255,0.45)', fontSize: '0.6rem',
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px'
                            }}>
                                Time to Departure
                            </p>
                            <p style={{
                                color: departureTime < 1800 ? '#ef4444' : '#4ecdc4',
                                fontWeight: 800, fontSize: '1.2rem', fontFamily: "'Courier New', monospace",
                                lineHeight: 1, letterSpacing: '0.05em'
                            }}>
                                {formatDeparture(departureTime)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {showNotification && (
                <div style={{
                    position: 'absolute', top: '7rem', left: '1.5rem', right: '1.5rem',
                    backgroundColor: 'var(--success)', color: 'white', padding: '1rem', borderRadius: '16px',
                    textAlign: 'center', fontWeight: 600, zIndex: 9999,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease-out'
                }}>
                    {showNotification}
                </div>
            )}

            {/* Navigation Controls Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '1rem', paddingTop: '2.5rem', zIndex: 1005,
                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                transform: isNavigating ? 'translateY(-150%)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isNavigating ? 'none' : 'auto'
            }}>
                <div style={{
                    backgroundColor: 'rgba(20, 20, 20, 0.85)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px',
                    padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 1002, position: 'relative'
                }}>
                    <div ref={originRef} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                        <User size={18} color="var(--primary)" />
                        <div
                            onClick={() => setIsOriginOpen(!isOriginOpen)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: selectedOriginId ? 'white' : 'var(--text-muted)',
                                fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                        >
                            <span style={{ textAlign: 'center', flex: 1 }}>
                                {selectedOriginId ? MAP_NODES.find(n => n.id === selectedOriginId)?.label : 'Locația ta'}
                            </span>
                            <span style={{ fontSize: '0.7rem' }}>▼</span>
                        </div>

                        {isOriginOpen && (
                            <div className="custom-scrollbar" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.8rem',
                                backgroundColor: '#1a1a1a', borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 1001,
                                maxHeight: '220px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {MAP_NODES.map(n => (
                                    <div
                                        key={`org-${n.id}`}
                                        className="dropdown-item"
                                        onClick={() => { setSelectedOriginId(n.id); setIsOriginOpen(false); }}
                                    >
                                        {n.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />

                    <div ref={destRef} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                        <MapIcon size={18} color={selectedDestId ? 'var(--accent)' : 'var(--text-muted)'} />
                        <div
                            onClick={() => setIsDestOpen(!isDestOpen)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none',
                                color: selectedDestId ? 'white' : 'var(--text-muted)',
                                fontSize: '0.95rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                        >
                            <span style={{ textAlign: 'center', flex: 1 }}>
                                {selectedDestId ? MAP_NODES.find(n => n.id === selectedDestId)?.label : 'Alege Destinația'}
                            </span>
                            <span style={{ fontSize: '0.7rem' }}>▼</span>
                        </div>

                        {isDestOpen && (
                            <div className="custom-scrollbar" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.8rem',
                                backgroundColor: '#1a1a1a', borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)', zIndex: 1001,
                                maxHeight: '220px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                {MAP_NODES.map(n => {
                                    const isDisabled = n.id === selectedOriginId;
                                    return (
                                        <div
                                            key={`dest-${n.id}`}
                                            className={`dropdown-item ${isDisabled ? 'disabled' : ''}`}
                                            onClick={() => {
                                                if (!isDisabled) {
                                                    setSelectedDestId(n.id);
                                                    setIsDestOpen(false);
                                                }
                                            }}
                                        >
                                            {n.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 1 }}>
                    <button
                        onClick={() => navigate('/scanner')}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.85rem', backgroundColor: '#ffffff', border: 'none',
                            borderRadius: '14px', color: '#0a0a0c', fontWeight: 800, fontSize: '0.95rem',
                            boxShadow: '0 8px 24px rgba(255, 255, 255, 0.25)', transition: 'all 0.2s',
                        }}
                    >
                        <QrCode size={19} color="#0a0a0c" /> Scanează Bilet
                    </button>

                    {selectedOriginId && selectedDestId && (
                        <button
                            onClick={handleStartNavigation}
                            style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '0.85rem', backgroundColor: 'var(--primary)', border: 'none', borderRadius: '14px',
                                color: 'white', fontWeight: 700, fontSize: '0.9rem',
                                animation: 'fadeIn 0.3s ease-out'
                            }}
                        >
                            <Navigation size={18} /> Navigare
                        </button>
                    )}
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                                        Pas {currentStep + 1} / {routeSteps.length}
                                        {routeSteps[currentStep] && ` — ${routeSteps[currentStep].label}`}
                                    </p>
                                    {routeSteps.length > 1 && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            background: 'rgba(78, 205, 196, 0.15)', padding: '2px 8px',
                                            borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)'
                                        }}>
                                            <span style={{ fontSize: '0.7rem' }}>⏱️</span>
                                            <span style={{ color: '#4ecdc4', fontWeight: 600, fontSize: '0.75rem' }}>
                                                ETA {Math.max(1, Math.round(15 * (1 - (currentStep / Math.max(1, routeSteps.length - 1)))))} min
                                            </span>
                                        </div>
                                    )}
                                </div>
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
                                    background: currentStep === routeSteps.length - 1 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(15, 98, 254, 0.15)',
                                    borderRadius: '12px',
                                    border: currentStep === routeSteps.length - 1 ? '1px solid rgba(76, 175, 80, 0.4)' : '1px solid rgba(15, 98, 254, 0.3)'
                                }}>
                                    <p style={{
                                        color: currentStep === routeSteps.length - 1 ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                                        fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700
                                    }}>
                                        {currentStep === routeSteps.length - 1 ? '🎯 Ai ajuns la destinație' : 'Locația curentă'}
                                    </p>
                                    <p style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginTop: '2px' }}>
                                        {currentStep === routeSteps.length - 1 ? '✅ ' : '📍 '}{routeSteps[currentStep]?.label || '—'}
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

            {/* ─── ASSISTANT ARRIVED BUBBLE ─── */}
            {assistArrived && (
                <div style={{
                    position: 'absolute', top: '2rem', left: '1.5rem', right: '1.5rem', zIndex: 1100,
                    animation: 'fadeIn 0.4s ease'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(78, 205, 196, 0.5)', borderRadius: '20px',
                        padding: '1.25rem', textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(78, 205, 196, 0.3)'
                    }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                        <h3 style={{ color: '#4ecdc4', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                            Assistant Arrived!
                        </h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                            Your assistant has arrived at {MAP_NODES.find(n => n.id === assistDest)?.label || 'the destination'}.
                        </p>
                        <button
                            onClick={() => setAssistArrived(false)}
                            style={{
                                marginTop: '0.75rem', padding: '0.6rem 1.5rem',
                                backgroundColor: '#4ecdc4', border: 'none', borderRadius: '12px',
                                color: '#000', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* ─── DISABLED HELP BUTTON (bottom right) ─── */}
            {!assistActive && (
                <button
                    onClick={() => setShowAssistPanel(!showAssistPanel)}
                    style={{
                        position: 'absolute', bottom: isNavigating ? '14.5rem' : '7.5rem', right: '1rem', zIndex: 1000,
                        width: '52px', height: '52px', borderRadius: '50%',
                        backgroundColor: '#0f62fe', border: '3px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(15,98,254,0.5)', cursor: 'pointer',
                        animation: 'fadeIn 0.3s ease',
                        transition: 'bottom 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <Accessibility size={26} color="white" />
                </button>
            )}

            {/* ─── ASK FOR ASSISTANCE PANEL ─── */}
            {showAssistPanel && (
                <div style={{
                    position: 'absolute', bottom: isNavigating ? '18rem' : '11rem', right: '1rem', zIndex: 1001,
                    animation: 'fadeIn 0.3s ease'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(15, 98, 254, 0.4)', borderRadius: '20px',
                        padding: '1.25rem', width: '240px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Accessibility size={20} color="#0f62fe" />
                                <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Disabled Help</span>
                            </div>
                            <button onClick={() => setShowAssistPanel(false)} style={{
                                background: 'none', border: 'none', cursor: 'pointer', padding: '2px'
                            }}>
                                <X size={18} color="rgba(255,255,255,0.5)" />
                            </button>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                            Un asistent va veni imediat la locația ta curentă (<strong style={{ color: 'white' }}>
                                {isNavigating && routeSteps.length > 0 && routeSteps[currentStep]
                                    ? routeSteps[currentStep].label
                                    : (selectedOriginId ? MAP_NODES.find(n => n.id === selectedOriginId)?.label : 'Intrare')
                                }</strong>) pentru a te ajuta.
                        </p>
                        <button
                            onClick={handleRequestAssistance}
                            style={{
                                width: '100%', padding: '0.85rem', backgroundColor: '#0f62fe',
                                border: 'none', borderRadius: '14px', color: 'white',
                                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(15,98,254,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                            }}
                        >
                            <Accessibility size={20} /> Cere Asistență
                        </button>
                    </div>
                </div>
            )}

            {/* ─── ASSISTANT ETA TOP BAR ─── */}
            {assistActive && (
                <div style={{
                    position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 1001,
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{
                        backgroundColor: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(15, 98, 254, 0.4)', borderRadius: '20px',
                        padding: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                backgroundColor: '#0f62fe', borderRadius: '50%', width: '44px', height: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                animation: 'pulse 1.5s infinite'
                            }}>
                                <Accessibility color="white" size={24} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'white', marginBottom: '2px' }}>
                                    🚶 Assistant on the way
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                                    Security → {MAP_NODES.find(n => n.id === assistDest)?.label || 'Your location'}
                                </p>
                            </div>
                            <div style={{ textAlign: 'center', flexShrink: 0 }}>
                                <p style={{ color: '#4ecdc4', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1 }}>
                                    {formatTime(assistTimeLeft)}
                                </p>
                                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', marginTop: '2px' }}>ETA</p>
                            </div>
                            <button
                                onClick={handleCancelAssistance}
                                style={{
                                    padding: '0.4rem 0.8rem', backgroundColor: 'transparent',
                                    border: '1px solid var(--error)', borderRadius: '12px',
                                    color: 'var(--error)', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0, cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        {/* Progress bar */}
                        <div style={{
                            height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px',
                            marginTop: '0.75rem', overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%', background: 'linear-gradient(90deg, #0f62fe, #4ecdc4)',
                                borderRadius: '2px', transition: 'width 1s linear',
                                width: `${((120 - assistTimeLeft) / 120) * 100}%`
                            }} />
                        </div>
                    </div>
                </div>
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
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .dropdown-item {
                    padding: 10px 15px;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    text-align: center;
                }
                .dropdown-item:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                .dropdown-item.disabled {
                    color: rgba(255, 255, 255, 0.3);
                    cursor: not-allowed;
                }
                .dropdown-item.disabled:hover {
                    background-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.1);
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
};

export default MapPage;
