import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Navigation, QrCode, Map as MapIcon, ArrowUp, ArrowLeft, ArrowRight, Plus, User, Minus, Coffee, ShieldCheck, DoorOpen, ShoppingBag, BriefcaseMedical, Luggage } from 'lucide-react';
import { ORADEA_NODES, ORADEA_EDGES, WALL_PATHS, findShortestPath, getNodesAsArray } from '../data/OradeaMapGraph';

const MapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const scanned = queryParams.get('scanned');
    const originParam = queryParams.get('origin');
    const scannedFlight = queryParams.get('flight'); // Get flight from URL if scanned ticket

    // Setup
    const [selectedOriginId, setSelectedOriginId] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');
    const [pathNodes, setPathNodes] = useState([]);
    // Flight Notification State
    const [activeAlerts, setActiveAlerts] = useState([]);

    // Navigation State
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [showNotification, setShowNotification] = useState('');

    // Camera State (Zoom & Rotation)
    const [cameraTransform, setCameraTransform] = useState({ x: 50, y: 50, rotate: 0, scale: 1 });
    const [userZoomOffset, setUserZoomOffset] = useState(0); // For manual zoom +/-
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Drag to pan

    // Drag Tracking
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false);
    const lastPointerRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (scanned === 'true' && originParam && ORADEA_NODES[originParam]) {
            setTimeout(() => {
                setSelectedOriginId(originParam);
                setShowNotification(`📍 Pinned at: ${ORADEA_NODES[originParam].label}`);
                setTimeout(() => setShowNotification(''), 4000);
            }, 0);
        }
    }, [scanned, originParam]);

    const handleStartNavigation = () => {
        if (selectedOriginId && selectedDestId) {
            const path = findShortestPath(selectedOriginId, selectedDestId);
            setPathNodes(path);
            setCurrentStepIndex(0);
            setIsNavigating(true);
            setUserZoomOffset(0); // reset manual zoom
            setPanOffset({ x: 0, y: 0 });
        }
    };

    const handleCancelNavigation = () => {
        setIsNavigating(false);
        setPathNodes([]);
        setCurrentStepIndex(0);
        // Reset camera to overview
        setCameraTransform({ x: 50, y: 50, rotate: 0, scale: 1 });
        setUserZoomOffset(0);
        setPanOffset({ x: 0, y: 0 });
    };

    const calculateAngle = (p1, p2) => {
        const dy = p2.y - p1.y;
        const dx = p2.x - p1.x;
        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return -(theta + 90);
    };

    useEffect(() => {
        if (!isNavigating || pathNodes.length === 0) {
            setTimeout(() => {
                setCameraTransform(prev => ({ ...prev, x: 50, y: 40, rotate: 0, scale: 1 + userZoomOffset }));
            }, 0);
            return;
        }

        const currentNode = pathNodes[currentStepIndex];
        const nextNode = pathNodes[currentStepIndex + 1];

        if (nextNode) {
            const targetRotation = calculateAngle(currentNode, nextNode);
            setCameraTransform({
                x: currentNode.x,
                y: currentNode.y,
                rotate: targetRotation,
                scale: 3.5 // Base zoom
            });
        } else {
            setCameraTransform(prev => ({ ...prev, x: currentNode.x, y: currentNode.y }));
        }
        setPanOffset({ x: 0, y: 0 }); // Snap back to step center
    }, [currentStepIndex, isNavigating, pathNodes]);

    // Calculate required turn direction
    const getRequiredTurn = () => {
        if (currentStepIndex === 0) return 'forward'; // First move is always forward relative to camera

        const prevNode = pathNodes[currentStepIndex - 1];
        const currNode = pathNodes[currentStepIndex];
        const nextNode = pathNodes[currentStepIndex + 1];

        if (!nextNode) return 'arrived';

        let a1 = Math.atan2(currNode.y - prevNode.y, currNode.x - prevNode.x);
        let a2 = Math.atan2(nextNode.y - currNode.y, nextNode.x - currNode.x);
        let diff = (a2 - a1) * 180 / Math.PI;

        while (diff <= -180) diff += 360;
        while (diff > 180) diff -= 360;

        if (diff > -45 && diff < 45) return 'forward';
        if (diff >= 45 && diff <= 135) return 'right';
        if (diff <= -45 && diff >= -135) return 'left';
        return 'backward';
    };

    const handleArrowClick = (clickedDirection) => {
        const requiredDirection = getRequiredTurn();

        if (requiredDirection === 'arrived') return;

        if (clickedDirection === requiredDirection) {
            // Correct Turn! Advance
            setCurrentStepIndex(prev => prev + 1);
            setShowNotification('');
        } else {
            // Wrong turn
            setShowNotification(`Wrong way! You need to go ${requiredDirection.toUpperCase()} here.`);
            setTimeout(() => setShowNotification(''), 3000);
        }
    };

    const handleZoomIn = () => setUserZoomOffset(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setUserZoomOffset(prev => Math.max(prev - 0.5, -2));

    const finalScale = isNavigating ? cameraTransform.scale + userZoomOffset : cameraTransform.scale + userZoomOffset;

    const handlePointerDown = (e) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };

        const zoomLevel = Math.max(0.5, finalScale);
        const angleRad = (isNavigating ? -cameraTransform.rotate : 0) * (Math.PI / 180);

        // Match drag to screen pixels vs viewBox units
        const sensitivity = (100 / window.innerWidth) / zoomLevel;

        const localDx = dx * Math.cos(angleRad) + dy * Math.sin(angleRad);
        const localDy = -dx * Math.sin(angleRad) + dy * Math.cos(angleRad);

        setPanOffset(prev => ({
            x: prev.x - localDx * sensitivity,
            y: prev.y - localDy * sensitivity
        }));
    };

    const handleWheel = (e) => {
        const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
        setUserZoomOffset(prev => Math.max(-2, Math.min(prev + zoomDelta, 4)));
    };

    const nodes = getNodesAsArray();

    // Mock Flight Notifications Pool (30 items)
    const MOCK_NOTIFICATIONS = [
        { type: 'general', msg: 'Welcome to Oradea Airport. Ensure you keep your luggage unattended.' },
        { type: 'general', msg: 'Security wait time is currently 5 minutes.' },
        { type: 'general', msg: 'Duty Free special: 20% off all fragrances today.' },
        { type: 'flight', flight: 'FR123', msg: 'Flight FR123 to London is now boarding at Gate 2.' },
        { type: 'flight', flight: 'RO456', msg: 'Flight RO456 to Bucharest is delayed by 20 mins.' },
        { type: 'flight', flight: 'FR789', msg: 'Gate Change! Flight FR789 will now depart from Gate 4.' },
        { type: 'flight', flight: 'LH111', msg: 'Last call for flight LH111 to Munich. Proceed to Gate 1 immediately.' },
        { type: 'general', msg: 'Please have your boarding passes ready before Security.' },
        { type: 'flight', flight: 'FR123', msg: 'Flight FR123 London boarding closing in 5 minutes.' },
        { type: 'flight', flight: 'W6321', msg: 'Flight W6321 to Milan is now boarding at Gate 3.' },
        { type: 'general', msg: 'Lost and Found is located near the Main Entrance.' },
        { type: 'flight', flight: 'RO456', msg: 'Flight RO456 is now ready for check-in at Desks 1-3.' },
        { type: 'flight', flight: 'FR789', msg: 'Flight FR789 luggage drop is open.' },
        { type: 'flight', flight: 'LH111', msg: 'Flight LH111 Munich is delayed.' },
        { type: 'general', msg: 'Starbucks is offering a free cookie with any large coffee.' },
        { type: 'general', msg: 'Airport Wi-Fi is free for 60 minutes. Connect to "OradeaFreeWiFi".' },
        { type: 'flight', flight: 'FR123', msg: 'Gate update: FR123 will depart from Gate 1.' },
        { type: 'flight', flight: 'W6321', msg: 'Flight W6321 check-in closing in 15 minutes.' },
        { type: 'general', msg: 'Smoking is only permitted in designated areas outside Terminal 1.' },
        { type: 'flight', flight: 'RO456', msg: 'Flight RO456 boarding will commence shortly.' },
        { type: 'flight', flight: 'FR789', msg: 'Flight FR789 is boarding.' },
        { type: 'flight', flight: 'LH111', msg: 'Flight LH111 gate changed to Gate 2.' },
        { type: 'general', msg: 'Restrooms are located near Duty Free and the Main Gates.' },
        { type: 'flight', flight: 'FR123', msg: 'Flight FR123 now accepting Priority Boarding.' },
        { type: 'flight', flight: 'W6321', msg: 'Flight W6321 boarding complete.' },
        { type: 'general', msg: 'Please report any suspicious packages to airport security.' },
        { type: 'flight', flight: 'RO456', msg: 'Final boarding call for RO456.' },
        { type: 'flight', flight: 'FR789', msg: 'Flight FR789 delayed due to weather.' },
        { type: 'flight', flight: 'LH111', msg: 'Flight LH111 now boarding all groups.' },
        { type: 'general', msg: 'Taxis are available outside the Main Terminal.' }
    ];

    // Notification Effect - pops one up every 25 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            // Filter valid notifications based on whether we have a scanned ticket
            const validNotifs = MOCK_NOTIFICATIONS.filter(n => {
                if (!scannedFlight) return true; // Without a ticket, show everything
                return n.type === 'general' || n.flight === scannedFlight; // If ticket, show only general or this flight
            });

            if (validNotifs.length > 0) {
                const randomIndex = Math.floor(Math.random() * validNotifs.length);
                const newAlert = { ...validNotifs[randomIndex], id: Date.now() };

                // Add to active alerts, keep max 3 on screen
                setActiveAlerts(prev => {
                    const next = [...prev, newAlert];
                    if (next.length > 3) return next.slice(1);
                    return next;
                });

                // Auto dismiss after 10s
                setTimeout(() => {
                    setActiveAlerts(prev => prev.filter(a => a.id !== newAlert.id));
                }, 10000);
            }
        }, 25000); // 25 seconds

        return () => clearInterval(interval);
    }, [scannedFlight]);

    const dismissAlert = (id) => {
        setActiveAlerts(prev => prev.filter(a => a.id !== id));
    };

    const getStepInstruction = () => {
        if (currentStepIndex === pathNodes.length - 1) return "Arrived at destination!";
        const turn = getRequiredTurn();
        if (turn === 'forward') return "Go straight ahead";
        if (turn === 'left') return "Turn Left at the intersection";
        if (turn === 'right') return "Turn Right at the intersection";
        return `Head towards ${pathNodes[currentStepIndex + 1].label}`;
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', flex: 1,
            backgroundColor: 'var(--bg-dark)', position: 'relative', overflow: 'hidden', minHeight: '100vh'
        }} className="animate-fade-in">

            {/* Notification Pop-up */}
            {showNotification && (
                <div style={{
                    position: 'absolute', top: '10rem', left: '1.5rem', right: '1.5rem',
                    backgroundColor: showNotification.includes('Wrong') ? 'var(--error)' : 'var(--success)',
                    color: 'white', padding: '1rem', borderRadius: '16px',
                    textAlign: 'center', fontWeight: 600, zIndex: 60,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    {showNotification}
                </div>
            )}

            {/* Navigation Setup Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                padding: '1.5rem', paddingTop: '3rem', zIndex: 40,
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                transform: isNavigating ? 'translateY(-150%)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isNavigating ? 'none' : 'auto'
            }}>
                <div style={{
                    backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(30px) saturate(200%)',
                    WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                    border: '1px solid var(--glass-border)', borderRadius: '24px',
                    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                    boxShadow: 'var(--shadow-md), inset 0 1px 1px rgba(255, 255, 255, 0.15)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
                        <User size={20} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))' }} />
                        <select
                            value={selectedOriginId} onChange={(e) => setSelectedOriginId(e.target.value)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none', color: selectedOriginId ? 'white' : 'var(--text-muted)',
                                fontSize: '1.05rem', fontWeight: 500, outline: 'none', appearance: 'none', cursor: 'pointer',
                                paddingRight: '1rem',
                                backgroundImage: `radial-gradient(100% 100% at 100% 50%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                                backgroundSize: '10px 10px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center'
                            }}
                        >
                            <option value="" disabled style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>Your Location</option>
                            {nodes.map(n => <option key={`org-${n.id}`} value={n.id} style={{ backgroundColor: 'var(--bg-card)', color: 'white', padding: '10px' }}>{n.label}</option>)}
                        </select>
                    </div>

                    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)', margin: '0 0.5rem' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem' }}>
                        <MapIcon size={20} color={selectedDestId ? 'var(--accent)' : 'var(--text-muted)'} style={{ filter: selectedDestId ? 'drop-shadow(0 0 4px rgba(45, 212, 191, 0.5))' : 'none' }} />
                        <select
                            value={selectedDestId} onChange={(e) => setSelectedDestId(e.target.value)}
                            style={{
                                flex: 1, background: 'transparent', border: 'none', color: selectedDestId ? 'white' : 'var(--text-muted)',
                                fontSize: '1.05rem', fontWeight: 500, outline: 'none', appearance: 'none', cursor: 'pointer',
                                paddingRight: '1rem',
                                backgroundImage: `radial-gradient(100% 100% at 100% 50%, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                                backgroundSize: '10px 10px', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center'
                            }}
                        >
                            <option value="" disabled style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)' }}>Choose Destination</option>
                            {nodes.map(n => (
                                <option key={`dest-${n.id}`} value={n.id} disabled={n.id === selectedOriginId} style={{ backgroundColor: 'var(--bg-card)', color: n.id === selectedOriginId ? 'rgba(255,255,255,0.2)' : 'white', padding: '10px' }}>{n.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate('/scanner')}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '1rem', backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                            borderRadius: '16px', color: 'white', fontWeight: 600, backdropFilter: 'blur(20px)',
                            boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease', cursor: 'pointer'
                        }}
                    >
                        <QrCode size={20} /> Scan Anchor
                    </button>

                    <button
                        onClick={handleStartNavigation} disabled={!selectedOriginId || !selectedDestId}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                            border: 'none', borderRadius: '16px', color: 'white', fontWeight: 700, 
                            opacity: (selectedOriginId && selectedDestId) ? 1 : 0.5,
                            boxShadow: (selectedOriginId && selectedDestId) ? '0 4px 15px rgba(99, 102, 241, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)' : 'none',
                            transition: 'all 0.3s ease', cursor: (selectedOriginId && selectedDestId) ? 'pointer' : 'not-allowed'
                        }}
                    >
                        <Navigation size={20} /> Route
                    </button>
                </div>
            </div>

            {/* Instruction Banner overlay */}
            {isNavigating && (
                <div style={{
                    position: 'absolute', top: '3rem', left: '1.5rem', right: '1.5rem', zIndex: 40, animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{
                        backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)',
                        border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            backgroundColor: currentStepIndex === pathNodes.length - 1 ? 'var(--success)' : 'var(--accent)',
                            borderRadius: '50%', width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {currentStepIndex === pathNodes.length - 1 ? <MapIcon color="white" /> : <Navigation color="white" />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '4px' }}>
                                {getStepInstruction()}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                Progress: {currentStepIndex} / {pathNodes.length - 1} steps
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Flight Notifications Area (Top Middle Over Map) */}
            <div style={{
                position: 'absolute',
                top: '70px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 40,
                display: 'flex',
                flexDirection: 'column-reverse', // new stack on bottom if needed, or normal stack
                gap: '0.5rem',
                width: '90%',
                maxWidth: '400px',
                pointerEvents: 'none' // lets clicks pass through to map if needed
            }}>
                {activeAlerts.map(alert => (
                    <div key={alert.id} className="glass-panel" style={{
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        backgroundColor: alert.type === 'flight' ? 'rgba(99, 102, 241, 0.9)' : 'var(--glass-bg)',
                        border: alert.type === 'flight' ? '1px solid var(--primary-hover)' : '1px solid var(--border)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        animation: 'slideDown 0.4s ease-out, fadeOut 0.4s ease-in 9.6s forwards',
                        pointerEvents: 'auto'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: alert.type === 'flight' ? '#e6f0ff' : 'var(--accent)', textTransform: 'uppercase' }}>
                                {alert.type === 'general' ? 'ℹ️ Airport Info' : `✈️ Flight ${alert.flight}`}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'white', lineHeight: '1.4' }}>
                                {alert.msg}
                            </span>
                        </div>
                        <button
                            onClick={() => dismissAlert(alert.id)}
                            style={{ background: 'none', border: 'none', color: 'white', opacity: 0.7, cursor: 'pointer', padding: '0.25rem' }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Zoom Controls Overlay */}
            <div style={{
                position: 'absolute', right: '1.5rem', top: isNavigating ? '12rem' : '15rem',
                display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 40,
                transition: 'top 0.4s ease'
            }}>
                <button onClick={handleZoomIn} style={{
                    width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'blur(30px) saturate(200%)', border: '1px solid var(--glass-border)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-md), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease', cursor: 'pointer'
                }}>
                    <Plus size={24} />
                </button>
                <button onClick={handleZoomOut} style={{
                    width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'blur(30px) saturate(200%)', border: '1px solid var(--glass-border)', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-md), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease', cursor: 'pointer'
                }}>
                    <Minus size={24} />
                </button>
            </div>

            {/* Step Controls UI */}
            {isNavigating && currentStepIndex < pathNodes.length - 1 && (
                <div style={{
                    position: 'absolute', bottom: '7rem', left: '1.5rem', right: '1.5rem',
                    zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                    animation: 'fadeIn 0.5s ease'
                }}>
                    <button
                        onClick={() => {
                            setCurrentStepIndex(prev => prev + 1);
                            setShowNotification('');
                        }}
                        style={{
                            width: '100%', padding: '1.25rem', backgroundColor: 'var(--primary)',
                            border: 'none', borderRadius: '16px', color: 'white', fontWeight: 700, fontSize: '1.1rem',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}
                    >
                        Next Step
                    </button>

                    <button
                        onClick={handleCancelNavigation}
                        style={{
                            width: '100%', padding: '1rem', backgroundColor: 'transparent',
                            border: '1px solid var(--error)', borderRadius: '16px', color: 'var(--error)', fontWeight: 600,
                        }}
                    >
                        End Route
                    </button>
                </div>
            )}

            {isNavigating && currentStepIndex === pathNodes.length - 1 && (
                <div style={{
                    position: 'absolute', bottom: '7rem', left: '1.5rem', right: '1.5rem',
                    zIndex: 40, display: 'flex', justifyContent: 'center', animation: 'fadeIn 0.5s ease'
                }}>
                    <button
                        onClick={handleCancelNavigation}
                        style={{
                            width: '100%', padding: '1.25rem', backgroundColor: 'var(--success)',
                            border: 'none', borderRadius: '16px', color: 'white', fontWeight: 700, fontSize: '1.1rem'
                        }}
                    >
                        Finish Navigation
                    </button>
                </div>
            )}


            {/* SVG MAP ENGINE */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px',
                cursor: isDragging ? 'grabbing' : 'grab',
                touchAction: 'none' // Crucial for mobile dragging
            }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
            >
                <div style={{
                    width: '100%', height: '100%', transformOrigin: 'center center',
                    transform: `
                        scale(${Math.max(0.5, finalScale)}) 
                        rotate(${isNavigating ? cameraTransform.rotate : 0}deg)
                        translate(calc(50% - ${cameraTransform.x + panOffset.x}%), calc(50% - ${cameraTransform.y + panOffset.y}%))
                    `,
                    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    willChange: 'transform'
                }}>
                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ overflow: 'visible' }} onClick={(e) => {
                        const pt = e.currentTarget.createSVGPoint();
                        pt.x = e.clientX;
                        pt.y = e.clientY;
                        const svgP = pt.matrixTransform(e.currentTarget.getScreenCTM().inverse());
                        console.log(`Waypoint: x=${svgP.x.toFixed(2)}, y=${svgP.y.toFixed(2)}`);
                    }}>
                        <defs>
                            {/* Animated Arrowhead for Path */}
                            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5"
                                markerWidth="3" markerHeight="3" orient="auto-start-reverse">
                                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
                            </marker>

                            {/* Floor texture / glow */}
                            <filter id="zoneGlow">
                                <feGaussianBlur stdDeviation="0.8" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>

                            {/* 3D Drop Shadow for Objects (Desks, Vending Machines) */}
                            <filter id="shadow3d" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="0.8" stdDeviation="0.5" floodColor="#000" floodOpacity="0.8" />
                                <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
                            </filter>

                            {/* Blueprint/Tile Grid Pattern for floor realism */}
                            <pattern id="gridPattern" width="2" height="2" patternUnits="userSpaceOnUse">
                                <path d="M 2 0 L 0 0 0 2" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.1" />
                            </pattern>
                        </defs>

                        {/* Base grid floor across the whole view */}
                        <rect x="0" y="0" width="100" height="100" fill="url(#gridPattern)" />

                        {/* Main Building Outline - Real Releveu Paths */}
                        <path
                            d={WALL_PATHS}
                            fill="rgba(30, 41, 59, 0.5)"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="0.5"
                            strokeLinejoin="round"
                        />

                        {/* Static Path Walkways (Subtle connections) */}
                        {ORADEA_EDGES.map((edge, idx) => {
                            const source = ORADEA_NODES[edge.source];
                            const target = ORADEA_NODES[edge.target];
                            return (
                                <line
                                    key={`edge-${idx}`}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    stroke="rgba(255,255,255,0.06)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            );
                        })}

                        {/* Path Lines */}
                        {isNavigating && pathNodes.length > 1 && (
                            <g>
                                <polyline points={pathNodes.map(n => `${n.x},${n.y}`).join(' ')} fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
                                <polyline points={pathNodes.map(n => `${n.x},${n.y}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="0.6" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 2" style={{ animation: 'dash 15s linear infinite' }} />
                            </g>
                        )}

                        {/* Nodes */}
                        {getNodesAsArray().map(node => {
                            const inverseRotate = isNavigating ? -cameraTransform.rotate : 0;
                            const isOrigin = node.id === selectedOriginId;
                            const isDest = node.id === selectedDestId;
                            const isCurrentStep = isNavigating && pathNodes[currentStepIndex]?.id === node.id;

                            // Adjust size inversely to scale so dots don't get massive when zoomed in
                            const dotRadius = 1.5 / Math.max(1, finalScale * 0.5);

                            let fillColor = 'rgba(255,255,255,0.3)';
                            if (isCurrentStep) fillColor = 'var(--primary)';
                            if (isDest) fillColor = 'var(--error)';

                            return (
                                <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                                    {(isCurrentStep || isDest || isOrigin) && <circle r={dotRadius * 3} fill={fillColor} opacity="0.3" style={{ animation: 'pulse 2s infinite' }} />}

                                    {/* Context-Aware Aero 2 Icons replacing generic pins */}
                                    <g transform={`translate(${-dotRadius * 1.5}, ${-dotRadius * 3}) scale(${dotRadius * 0.15})`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={fillColor} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 10px 5px rgba(0,0,0,0.5))' }}>
                                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                                        </svg>
                                        <g transform="translate(6, 4) scale(0.5)">
                                            {node.id.startsWith('gate') && <DoorOpen color="white" strokeWidth="2.5" />}
                                            {node.id === 'security' && <ShieldCheck color="white" strokeWidth="2.5" />}
                                            {node.id === 'dutyfree' && <ShoppingBag color="white" strokeWidth="2.5" />}
                                            {node.id === 'cafe' && <Coffee color="white" strokeWidth="2.5" />}
                                            {node.id === 'checkin' && <Luggage color="white" strokeWidth="2.5" />}
                                            {node.id === 'entrance' && <DoorOpen color="white" strokeWidth="2.5" />}
                                            {node.id === 'wc' && <User color="white" strokeWidth="2.5" />}
                                        </g>
                                    </g>

                                    <g transform={`rotate(${inverseRotate})`}>
                                        <text x="0" y={-(dotRadius * 4)} fontSize={dotRadius * 1.5} fill={(isCurrentStep || isDest) ? 'white' : 'rgba(255,255,255,0.7)'} textAnchor="middle" fontWeight={(isCurrentStep || isDest) ? '700' : '500'} style={{ userSelect: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}>
                                            {node.label}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* Current User Marker */}
                        {isNavigating && pathNodes[currentStepIndex] && (
                            <g transform={`translate(${pathNodes[currentStepIndex].x}, ${pathNodes[currentStepIndex].y})`}>
                                <circle r={1.5 / Math.max(1, finalScale * 0.5)} fill="white" stroke="var(--primary)" strokeWidth="0.5" />
                                <polygon points="-1,0 1,0 0,-4" fill="var(--primary)" opacity="0.4" transform={`scale(${1 / Math.max(1, finalScale * 0.5)})`} />
                            </g>
                        )}
                    </svg>
                </div>
            </div>

            <style>{`
                @keyframes dash { to { stroke-dashoffset: -100; } }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
            `}</style>
        </div>
    );
};

export default MapPage;
