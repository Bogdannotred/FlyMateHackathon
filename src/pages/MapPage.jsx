import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Map, Navigation, QrCode, User, MapPin } from 'lucide-react';
import { ORADEA_NODES, ORADEA_EDGES, findShortestPath, getNodesAsArray } from '../data/OradeaMapGraph';

const MapPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const scanned = queryParams.get('scanned');
    const originParam = queryParams.get('origin');
    const scannedFlight = queryParams.get('flight'); // Get flight from URL if scanned ticket

    const [originNode, setOriginNode] = useState(null);
    const [destinationNode, setDestinationNode] = useState(null);

    // For standard select inputs
    const [selectedOriginId, setSelectedOriginId] = useState('');
    const [selectedDestId, setSelectedDestId] = useState('');

    const [pathNodes, setPathNodes] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    
    // Flight Notification State
    const [activeAlerts, setActiveAlerts] = useState([]);

    // Initialize from URL params if arrived via Scanner
    useEffect(() => {
        if (scanned === 'true' && originParam && ORADEA_NODES[originParam]) {
            setSelectedOriginId(originParam);
            setOriginNode(ORADEA_NODES[originParam]);
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [scanned, originParam]);

    // Update nodes when selects change
    useEffect(() => {
        setOriginNode(selectedOriginId ? ORADEA_NODES[selectedOriginId] : null);
        if (selectedOriginId === selectedDestId && selectedOriginId !== '') {
            setSelectedDestId('');
            setDestinationNode(null);
        }
    }, [selectedOriginId, selectedDestId]);

    useEffect(() => {
        setDestinationNode(selectedDestId ? ORADEA_NODES[selectedDestId] : null);
    }, [selectedDestId]);

    // Calculate route when Go is clicked
    const handleStartNavigation = () => {
        if (selectedOriginId && selectedDestId) {
            const path = findShortestPath(selectedOriginId, selectedDestId);
            setPathNodes(path);
        }
    };

    const handleCancelNavigation = () => {
        setPathNodes([]);
    };

    const isNavigating = pathNodes.length > 0;
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

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            backgroundColor: 'var(--bg-dark)',
            position: 'relative',
            overflow: 'hidden'
        }} className="animate-fade-in">

            {/* Search Bar / Input Overlay */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                padding: '1.5rem',
                paddingTop: '3rem',
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
                    {/* Origin Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <User size={20} color="var(--primary)" />
                        <select
                            value={selectedOriginId}
                            onChange={(e) => setSelectedOriginId(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: selectedOriginId ? 'var(--text-main)' : 'var(--text-muted)',
                                fontSize: '1rem',
                                outline: 'none',
                                appearance: 'none' // Remove default arrow for cleaner look, or style it
                            }}
                        >
                            <option value="" disabled style={{ color: 'black' }}>Select Current Location</option>
                            {nodes.map(n => (
                                <option key={`org-${n.id}`} value={n.id} style={{ color: 'black' }}>{n.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '0 0.5rem' }} />

                    {/* Destination Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Navigation size={20} color={selectedDestId ? 'var(--accent)' : 'var(--text-muted)'} />
                        <select
                            value={selectedDestId}
                            onChange={(e) => setSelectedDestId(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: selectedDestId ? 'var(--text-main)' : 'var(--text-muted)',
                                fontSize: '1rem',
                                outline: 'none',
                                appearance: 'none'
                            }}
                        >
                            <option value="" disabled style={{ color: 'black' }}>Select Destination</option>
                            {nodes.map(n => (
                                <option
                                    key={`dest-${n.id}`}
                                    value={n.id}
                                    disabled={n.id === selectedOriginId}
                                    style={{ color: 'black' }}
                                >
                                    {n.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => navigate('/scanner')}
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
                        Scan Anchor QR
                    </button>

                    {!isNavigating ? (
                        <button
                            onClick={handleStartNavigation}
                            disabled={!selectedOriginId || !selectedDestId}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: (selectedOriginId && selectedDestId) ? 'var(--primary)' : 'rgba(15, 98, 254, 0.4)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                opacity: (selectedOriginId && selectedDestId) ? 1 : 0.6,
                                cursor: (selectedOriginId && selectedDestId) ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Route
                        </button>
                    ) : (
                        <button
                            onClick={handleCancelNavigation}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'var(--error)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Pop-up Notification for "Location Detected" */}
            {showNotification && originNode && (
                <div style={{
                    position: 'absolute',
                    top: '180px', left: '2rem', right: '2rem',
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
                    📍 Pinned at: {originNode.label}
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
                        backgroundColor: alert.type === 'flight' ? 'rgba(15, 98, 254, 0.9)' : 'rgba(30,30,30,0.9)',
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

            {/* Custom SVG Map Container */}
            <div style={{
                flex: 1,
                width: '100%',
                height: '100%',
                position: 'relative',
                backgroundColor: '#050505', // Slightly darker for contrast
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '8rem' // push map down slightly away from UI
            }}>
                {/* We use a viewBox of 0 0 100 100 so our node coordinates (0-100) map perfectly. */}
                <svg
                    width="90%"
                    height="90%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="xMidYMid meet"
                    style={{
                        overflow: 'visible' // allow nodes on edge to render fully
                    }}
                >
                    <defs>
                        {/* Arrowhead marker for directed paths */}
                        <marker id="arrowhead" markerWidth="4" markerHeight="4"
                            refX="2" refY="2" orient="auto">
                            <polygon points="0 0, 4 2, 0 4" fill="var(--accent)" />
                        </marker>

                        {/* Outer glow for active nodes */}
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 1. Draw Terminal Outline (Abstract shape) */}
                    <path
                        d="M 10,80 L 10,95 L 90,95 L 90,60 L 70,60 L 70,10 L 10,10 Z"
                        fill="rgba(255, 255, 255, 0.03)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="0.5"
                        strokeLinejoin="round"
                    />

                    {/* 2. Draw all connection edges statically (faint) */}
                    {ORADEA_EDGES.map((edge, idx) => {
                        const source = ORADEA_NODES[edge.source];
                        const target = ORADEA_NODES[edge.target];
                        return (
                            <line
                                key={`static-edge-${idx}`}
                                x1={source.x} y1={source.y}
                                x2={target.x} y2={target.y}
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="1"
                            />
                        );
                    })}

                    {/* 3. Draw highlighted routing path (if navigating) */}
                    {isNavigating && pathNodes.length > 1 && (
                        <g>
                            {/* We iterate through the calculated path and draw line segments */}
                            {pathNodes.slice(0, -1).map((node, idx) => {
                                const nextNode = pathNodes[idx + 1];
                                // calculate middle point for arrow placement, or just use markers
                                return (
                                    <line
                                        key={`active-edge-${idx}`}
                                        x1={node.x} y1={node.y}
                                        x2={nextNode.x} y2={nextNode.y}
                                        stroke="var(--accent)"
                                        strokeWidth="1.5"
                                        strokeDasharray="2 1"
                                        style={{ animation: 'dash 20s linear infinite' }}
                                        markerEnd="url(#arrowhead)"
                                    />
                                );
                            })}
                        </g>
                    )}

                    {/* 4. Draw Nodes */}
                    {nodes.map(node => {
                        const isOrigin = node.id === selectedOriginId;
                        const isDest = node.id === selectedDestId;
                        const isPathNode = isNavigating && pathNodes.some(p => p.id === node.id);

                        let fillColor = 'rgba(255,255,255,0.2)';
                        let strokeColor = 'rgba(255,255,255,0.4)';
                        let radius = 1.5;

                        if (isOrigin) {
                            fillColor = 'var(--primary)';
                            strokeColor = 'var(--primary-hover)';
                            radius = 2.5;
                        } else if (isDest) {
                            fillColor = 'var(--error)'; // Red for destination
                            strokeColor = 'var(--accent)';
                            radius = 2.5;
                        } else if (isPathNode) {
                            fillColor = 'var(--accent)';
                            strokeColor = 'var(--accent)';
                        }

                        return (
                            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>

                                {/* Pulsing ring for origin/dest */}
                                {(isOrigin || isDest) && (
                                    <circle
                                        r={radius * 2}
                                        fill="none"
                                        stroke={fillColor}
                                        strokeWidth="0.5"
                                        className="pulsing-node"
                                        style={{ animation: 'pulse 2s infinite' }}
                                    />
                                )}

                                {/* Node Label (Text) */}
                                <text
                                    x="0"
                                    y="-4"
                                    fontSize="3"
                                    fill={(isOrigin || isDest) ? 'white' : 'rgba(255,255,255,0.5)'}
                                    textAnchor="middle"
                                    fontWeight={(isOrigin || isDest) ? 'bold' : 'normal'}
                                    style={{ userSelect: 'none' }}
                                >
                                    {node.label}
                                </text>

                                {/* The Node Dot */}
                                <circle
                                    r={radius}
                                    fill={fillColor}
                                    stroke={strokeColor}
                                    strokeWidth="0.5"
                                    filter={(isOrigin || isDest) ? "url(#glow)" : ""}
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Add localized SVG animations using standard style tag injection */}
            <style>{`
          @keyframes dash {
              to {
                  stroke-dashoffset: -100;
              }
          }
          @keyframes slideDown {
              from { opacity: 0; transform: translateY(-20px); }
              to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeOut {
              from { opacity: 1; }
              to { opacity: 0; }
          }
      `}</style>

        </div>
    );
};

export default MapPage;
